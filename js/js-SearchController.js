var SearchController = Class.extend({
    init: function() {
        var obj = this;
        var w = $(window).width() - $('#gravity_trap').width() - $('#left_panel').width() - 40;
        var h = $(window).height() - $('.panel_buttons').height() - 80;
        this.grid = new Array();
        this.taken = new Array();
        this.index = -1;
        var
                x_offset = 240,
                y_offset = 80,
                x_size = w - 560,
                y_size = h - 220,
                x_cnt = 2,
                y_cnt = 2;
        //                Canvas.context.fillStyle=Grouping.GetColor();
        //                Canvas.context.fillRect(x_offset,y_offset,w,h);
        for (var y = 0; y < y_cnt; y++) {
            for (var x = 0; x < x_cnt; x++) {
                var grid = {
                    x1: x_offset + x * x_size,
                    y1: y_offset + y * y_size,
                    n: 0
                };
                this.grid.push(grid);
                //                Canvas.context.fillStyle=Grouping.GetColor();
                //                Canvas.context.fillRect(grid.x1,grid.y1,x_size,y_size);
                //                Canvas.context.font="30px Arial";
                //                Canvas.context.fillText(this.grid.length,grid.x1,grid.y1);
            }
        }

        if (this.grid.length == 0) {
            this.grid.push({
                x1: x_offset,
                y1: y_offset,
                n: 0
            });
        }

        $('#criterion').on('focus', function(e) {
            $('#criterion div').each(function(k, v) {
                v = $(v);
                if (v.text().length == 0 && v.attr('id') != 'criterion_current') {
                    v.remove();
                }
            });
            obj.cursorMoveAfter($('#criterion div').last());
            e.preventDefault();
        });
        this.CreateInputBox();
        $('#criterion').append($('<input>').attr("type", "text").attr('id', 'cursor'));
        $('#cursor').on('keyup', function(e) {
            switch (e.which) {
                case 13:
                    Search.Search();
                    e.preventDefault();
                    break;
                case 8:
                    if ($('#criterion_current').text().length == 0) {
                        if ($('#criterion').find('div.user_input').length > 1) {
                            $('#criterion_current').remove();
                            $('#criterion').find('div.user_input').last().attr('id', 'criterion_current');
                        }
                    }

                    $('#criterion_current').text($('#criterion_current').text().substr(0, $('#criterion_current').text().length - 1));
                    e.preventDefault();
                    break;
                default:
                    $('#criterion_current').css('min-width', '20px').text($('#criterion_current').text() + $('#cursor').attr('value'));
                    break;
            }

            $('#cursor').attr('value', '');
        });

        $(window).delegate('*', 'keypress', function(e) {
            if (e.ctrlKey && e.which === 10) {
                e.stopPropagation();
                e.preventDefault();
                obj.Search();
            }
        });

        this.searchQ = new Array();

        var gp = Containers.CreateHTMLContainer(App.GetNewUID(), App.CONTAINER_TYPE_CHILD);
        gp.Reposition(240, 80);

        this.AddGPToQ(gp);
    },
    AddGPToQ: function(gp) {
        this.searchQ.push(gp.GetUID());
    },
    IsGPInQ: function(gp) {
        return this.searchQ.indexOf(gp.GetUID()) !== -1;
    },
    addCursorEvent: function(el) {
        var obj = this;
        $(el).on('click', function() {
            obj.cursorMoveAfter(el);
        });
    },
    cursorMoveAfter: function(el) {
        $('#criterion_current').removeAttr('id');
        $(el).attr('id', 'criterion_current');
        $('#cursor').insertAfter(el);
        $('#cursor').focus();
    },
    SynchCriterion: function() {
        var UIMap = Containers.GetUIMap();
        var SearchMap = UIMap.get("search_bar_vis");
        var divs = SearchMap.getKeys();
        for (var i in divs) {
            var divUID = divs[i];
            var GPUID = SearchMap.get(divUID);
            var GP = Containers.get(GPUID);
            var GP_Criterion = GP.GetCriterion();
            var GP_Color = GP.GetColor();
            $('#' + divUID).text(GP_Criterion).css({
                'color': GP_Color
            });
        }

    },
    HighlightConnectedGP: function(divUID) {
        var GP = Containers.GetUIConnect("search_bar_vis", divUID);

        var cont = Containers.get(GP);
        cont.BoldLines();
    },
    RestoreHighlightConnectedGP: function(divUID) {
        var GP = Containers.GetUIConnect("search_bar_vis", divUID);

        var cont = Containers.get(GP);
        cont.NormalLines();
    },
    HightLightCriterion: function(divUID, GP_color, highlight) {
        var color, bgColor;
        if (highlight) {
            color = 'white';
            bgColor = GP_color;
        } else {
            color = GP_color;
            bgColor = 'transparent';
        }
        $('#' + divUID).css({
            'color': color,
            'background-color': bgColor
        });
    },
    GetSettings: function() {
        var criterion = new Array();
        $('#criterion').find('div.user_input').each(function(i, input) {
            criterion.push($(input).text().trim());
        });
        criterion = criterion.join(' ');
        var params = {
            'criterion': criterion,
            'is_instant': $('#instant').is(':checked')
        };
        return params;
    },
    CreateInputBox: function() {
        var current = $('<div>');
        current.attr('id', 'criterion_current');
        current.addClass('user_input');
        $('#criterion').append(current);
        this.addCursorEvent(current);
        return current;
    },
    ClearSearchBar: function() {
        $('#criterion').find('div.user_input').remove();
    },
    Search: function() {
        Containers.ClearInactive(1);
        
        var search = this.searchQ;
        
        for (var a in search) {
            var gpUID = search[a];

            var gp = Containers.get(gpUID);

            if (!gp) {
                continue;
            }
            this.index++;
            if (this.index === this.grid.length) {
                this.index = 0;
            }

            var grid = this.grid[this.index];
            var x = grid.x1 + 60 * grid.n;
            var y = grid.y1 + 60 * grid.n;
            //grid.n++;

            gp.Reposition(x, y);
        }
        
        this.index = -1;

        ServerLoading.MakeRequest(false);
    },
    CreateGroupingPoints: function(criterion) {
        function getRandomArbitary(min, max) {
            return parseInt(Math.random() * (max - min) + min);
        }

        criterion = criterion.split(' and ').join('@delim@');
        criterion = criterion.split(' + ').join('_');
        criterion = criterion.split('+').join('_');
        var keywords = criterion.split(" ");
        for (var a in keywords) {
            var keyword = keywords[a].trim();
            if (!keyword) {
                continue;
            }

            var grouped = keyword.split('@delim@');
            if (grouped.length != 1) {
                var attrs = new Array();
                var attrs_names = new Array();
                for (var n in grouped) {
                    var grouped_attr = grouped[n];
                    attrs_names.push(grouped_attr);
                    var attr = GravityElements.GetAttr(grouped_attr);
                    attrs.push(attr);
                }
            }

            this.index++;
            if (this.index == this.grid.length) {
                this.index = 0;
            }

            var grid = this.grid[this.index];
            var x = grid.x1 + 60 * grid.n;
            var y = grid.y1 + 60 * grid.n;
            grid.n++;
            if (grouped.length == 1) {
                var attr = GravityElements.GetAttr(keyword);
                var cont = Containers.CreateHTMLContainer('default', App.CONTAINER_TYPE_CHILD, new Dictionary(new Array(attr)));
                cont.SelectAttribute(attr.GetUID());
                cont.Reposition(x, y);
                cont.IsGeneral = 1;
            }
            else {
                var cont = Containers.CreateHTMLContainer('default', App.CONTAINER_TYPE_CHILD, new Dictionary(attrs));
                for (var f in attrs) {
                    var attr = attrs[f];
                    cont.SelectAttribute(attr.GetUID());
                }

                cont.Reposition(x, y);
                cont.IsGeneral = 1;
            }
        }
    }
});