var SessionController = Class.extend({
    init: function() {
        this.report = {};
        this.panelIsOpen = false;
    },
    
    UpdateSessionPanel: function() {
        if (this.panelIsOpen == false) {
            $.getJSON(gateway+'&do=sessions_list', function(data) {
                if (data) {
                    $('#sessions_list').find('tr').each(function(k,v) {
                        if (!$(this).find('th').length) {
                            $(this).remove();
                        }
                    });
                    for (var a in data) {
                        var session = data[a];
                
                        $.tmpl('session_line', {
                            'id' : session.report_id,
                            'title' : session.title,
                            'date' : session.date_created
                        }).appendTo($('#sessions_list'));
                    }
                    
                    $('#sessions_list').show();
                    Session.panelIsOpen = true;
                }
            });
        }
        else {
            $('#sessions_list').hide();
            Session.panelIsOpen = false;
        }
        
        App.unblockUI();
    },
    
    SaveSession: function() {
        var title = window.prompt('Enter session title:','');
        
        if (!title) {
            alert("Title can't be empty.");
            
            return;
        }
        
        this.Save(title, 'session');
    },
    
    Save: function(title, type) {
        App.blockUI();
        
        var horizon_date = Horizon.GetDate();
        
        $.post(gateway+'&do=report_save', {
            'title' : title,
            'horizon_active_date' : horizon_date
        } , function(report_id) {
            Session.SaveWorkspace(report_id, type);
        });             
    },
    
    SaveWorkspace: function(report_id, type) {
        var containers = Containers.arr();

        var saved = new Array();
        
        for (var a in containers) {
            var c = containers[a];
            
            var cnt = c.GetElements().arr().length;
            
            if (cnt == 0) {
                continue;
            }
            
            var name, color, operator, in_gravity_trap, workspace, data_objects_count, sum1, sum2, coords, is_result_point;
            
            name = c.GetExpression();
            if (c.GetUID() == 'list' || c.GetUID() == 'list_south') {
                name = 'NOT GROUPED';
            }
            if (c.IsTrapped()) {
                name = 'TRAPPED';
            }
            
            color = c.GetColor();
            operator = c.GetOperator();
            in_gravity_trap = +c.IsTrapped();
            workspace = c.GetWorkspace();
            data_objects_count = cnt;
            sum1 = c.GetSum1();
            sum2 = c.GetSum2();
            coords = c.GetGroupingPointCoordinates();
            is_result_point = c.GetResultPointUID() ? 1 : 0;
            
            var def = this.SaveGroupingPoint(c, report_id, name, color, operator, in_gravity_trap, workspace, data_objects_count, sum1, sum2, coords.x, coords.y, is_result_point);
            
            saved = saved.concat(def);
        }
        
        $.when.apply(null, saved).then(function() {
            switch(type) {
                case 'session':
                    Session.UpdateSessionPanel();
                    break;
                case 'report':
                    Report.OpenReport(report_id);
                    break;
            }
        });
    },
    
    SaveGroupingPoint: function(c, report_id, name, color, operator, in_gravity_trap, workspace, data_objects_count, sum1, sum2, coords_x, coords_y, is_result_point) {
        var promisses = new Array();
        
        promisses.push($.post(gateway+'&do=report_save_grouping_point', {
            'report_id' : report_id,
            'name' : name,
            'color' : color,
            'operator' : operator,
            'in_gravity_trap' : in_gravity_trap,
            'workspace' : workspace,
            'data_objects_count' : data_objects_count,
            'sum1' : sum1,
            'sum2' : sum2,
            'coords_x' : coords_x,
            'coords_y' : coords_y,
            'is_result_point' : is_result_point
        }, function(report_grouping_point_id) {
            var DEs = c.GetElements().arr();
            
            for (var a in DEs) {
                var DE = DEs[a];

                promisses.push(
                    Session.SaveDataObject(report_id, report_grouping_point_id, FeedElements.get(DE.GetFeedID()).GetDBid(), DE.GetDBid())
                    );
            }
            
            var attrs = c.GetAttributes();
            
            for (var i in attrs) {
                var attr = attrs[i];
                
                promisses.push(
                    Session.SaveGPAttributes(report_id, report_grouping_point_id, attr.GetType(), attr.GetName(), attr.GetValue(), +c.IsAttributeSelected(attr))
                    );
            }
        }));
        
        return promisses;
    },
    
    SaveGPAttributes: function(report_id, report_grouping_point_id, attr_type, attr_name, attr_value, is_selected) {
        return $.post(gateway+'&do=report_save_gp_attrs', {
            'report_id' : report_id,
            'report_grouping_point_id' : report_grouping_point_id,
            'attr_type' : attr_type,
            'attr_name' : attr_name,
            'attr_value' : attr_value,
            'is_selected' : is_selected
        }, function(data) {

            });
    },
    
    SaveDataObject: function(report_id, report_grouping_point_id, feed_id, data_object_id) {
        return $.post(gateway+'&do=report_save_data_object', {
            'report_id' : report_id,
            'data_object_id' : data_object_id,
            'feed_id' : feed_id,
            'report_grouping_point_id' : report_grouping_point_id
        }, function(data){

            });
    },
    
    Load: function(report_id) {
        $.getJSON(gateway + '&do=report_load&report_id=' + report_id, function(report) {
            App.blockUI();
            
            var chain = new Array();

            for (var a in report.grouping_points) {
                GP = report.grouping_points[a];
                
                var attrs = new Dictionary(new Array());
                var attrs_sel = new Dictionary(new Array());
                for (var i in GP.attrs) {
                    var attr = GP.attrs[i];
					console.log(attr);

                    var el = new GravityElement(
                        new GeneralObject(attr.attr_type, attr.attr_type, 'category', attr.attr_type),
                        new GeneralObject(attr.attr_type, attr.attr_type, 'group', attr.attr_type),
                        new GeneralObject(attr.attr_name, attr.attr_name, 'gravity', attr.attr_value)
                        );

                    attrs.add(el);            
                    if (+attr.is_selected) {
                        attrs_sel.add(el);
                    }
                }

                if (GP.name != 'NOT GROUPED' && !+GP.is_result_point) {
                    var cont = Containers.CreateHTMLContainer('default', App.CONTAINER_TYPE_CHILD, attrs);
                    $(attrs_sel.arr()).each(function(k,g) {
                        cont.SelectAttribute(g.GetUID());
                    });
                    cont.Reposition(GP.coords_x, GP.coords_y);
                    cont.SetOperator(GP.operator);
                    cont.SetWorkspace(+GP.workspace);
                    cont.ChangeColors(GP.color, 'white', GP.color, GP.color);
                    cont.IsGeneral = 1;
                }

                var DOs_load = new Array();
                var DOsGroupedByFeed = ServerLoading.GroupDataObjectsByFeeds(GP.data_objects);
                
                for (var k in DOsGroupedByFeed) {
                    var list = DOsGroupedByFeed[k];
                    
                    var feed = FeedElements.get(list.feed_id);
                    
                    var def = ServerLoading.LoadDataObjects(list.items, App.LOAD_BUFFER_SIZE, list.feed_id, feed.GetLoadX(), feed.GetLoadY());
                    DOs_load.push(def);
                    chain.push(def);
                }
            
                if (GP.name == 'NOT GROUPED') {
                    var c;
                    switch(+GP.workspace) {
                        case 1:
                            c = Containers.get('list');
                            break;
                        case 2:
                            c = Containers.get('list_south');
                            break;
                    }

                    $.when.apply(null, DOs_load).then(function() {
                        c.Show();
                        
                        for (var k in arguments) {
                            var data = arguments[k][0];

                            var idreg = /@@(.*?)@@/;
                            var id = idreg.exec(data);
                            id = id[1];
                           
                            var DE = DataElements.get(id);

                            c.AddElement(DE);
                        }
                        
                        c.Arrange();
                    });
                }
            }
            
            $.when.apply(null, chain).then(function() {
                if (report.horizon_active_date) {
                    Horizon.Show();
                    Horizon.LoadActive('', '', report.horizon_active_date);
                    Horizon.Move();
                }
                else {
                    Grouping.Move();
                }
                
                $('#sessions_list').hide();
                Session.panelIsOpen = false;

                App.unblockUI();
            });
        });
    }
});