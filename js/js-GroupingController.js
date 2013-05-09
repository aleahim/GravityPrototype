var AttrMap;
var GroupingController = Class.extend({
    init: function() {
        this.LastResultPointsMap = new Array();

        this.points = new Dictionary(new Array());
        this.elements = new Dictionary(new Array());

        this.MovementPath = new Dictionary(new Array());

        this.chains = new Array();
        this.colorIndex = 0;
        this.defaultColors = ["#1B4591", "#006E47", "#6A5882", "#E6690C", "#45A050", "#D00000"];
    },
    AddPoint: function(GravityUID, ContainerUID, Operator) {
        var obj = new Object;

        obj.GravityUID = GravityUID;
        obj.ContainerUID = ContainerUID;
        obj.Operator = Operator;

        obj.GetUID = function() {
            return this.GravityUID + this.ContainerUID;
        }

        this.points.add(obj);
    },
    DelPoint: function(GravityUID, ContainerUID) {
        var obj = new Object;

        obj.GravityUID = GravityUID;
        obj.ContainerUID = ContainerUID;

        obj.GetUID = function() {
            return this.GravityUID + this.ContainerUID;
        }

        this.points.remove(obj.GetUID());

    },
    MatchItems: function(workspace, attributes_list) {
        var elements = DataElements.GetAsArray();

        var vectors = new Dictionary(new Array());

        for (var index_elements in elements) {
            var element = elements[index_elements];

            if (element.GetWorkspace() != workspace) {
                continue;
            }

            if (element.IsInContainer() && element.GetCurrentContainer().IsBlockedFromGrouping()) {
                continue;
            }

            var gravity = element.gravity.map.clone();
            var g_map = element.gravity_sys.map.getValues();
            for (var a in g_map) {
                var attr = g_map[a];

                if (!gravity.get('generalgeneral' + attr.GetName())) {
                    gravity.set('generalgeneral' + attr.GetName(), attr);
                }
            }
            //gravity.addAll(element.gravity_sys.map);
            gravity = new Dictionary(gravity.getValues());

            var attributes = gravity.GetAsArray();

            var ContainerUID;
            for (ContainerUID in attributes_list) {
                var attributes_container = attributes_list[ContainerUID].attributes;

                if (Containers.get(ContainerUID).GetWorkspace() != workspace) {
                    continue;
                }

                var found_items = 0;
                var index_attributes_container;
                for (index_attributes_container in attributes_container) {
                    var attribute_grouping = attributes_container[index_attributes_container];

                    var index_attributes;
                    for (index_attributes in attributes) {
                        var attribute = attributes[index_attributes];
                        var attrUID = attribute.GetSearchUID();

                        if (attrUID == attribute_grouping.GetSearchUID()) {
                            found_items++;
                        }
                    }
                }

                var chosen = false;

                switch (attributes_list[ContainerUID].Operator) {
                    case 'and':
                        if (found_items == attributes_list[ContainerUID].attributes.length) {
                            chosen = true;
                        }
                        break;
                    case 'connected':
                    case 'or':
                        if (found_items > 0) {
                            chosen = true;
                        }
                        break;
                }

                var not = Containers.get(ContainerUID).GetNot();
                if ((chosen == false && not == true) || (chosen == true && not == false)) {
                    attributes_container = attributes_list[ContainerUID].attributes;
                    var index;
                    for (index in attributes_container) {
                        Containers.removeItems(element);

//                        if (!element.gravity.get(attributes_container[index].GetUID())) {
//                            element.gravity.add(attributes_container[index]);
//                        }

                        if (not == false) {
                            //element.AddAttribute(attributes_container[index]);
                        }

                        vectors.add(this.GetMovementVector(element, Containers.get(ContainerUID), attributes_container[index]));
                    }
                }
            }

        }

        return vectors;
    },
    StartMovement: function(workspace) {
        var GPs = $.grep(Containers.arr(), function(n, i) {
            return n.GetWorkspace() == workspace && !n.IsBlockedFromGrouping() && n.GetContainerType() != App.CONTAINER_TYPE_MIDDLE;
        });

        var attributes_list = {};

        for (var index_points in GPs) {
            var GP = GPs[index_points];

            GP.SetConnectedTo(new Array());

            var GPattrs = GP.GetSelectedAttributes();

            for (var GPa in GPattrs) {
                var attr = GPattrs[GPa];
                if (!attributes_list[GP.GetUID()]) {
                    attributes_list[GP.GetUID()] = new Object();
                    attributes_list[GP.GetUID()].attributes = new Array(GravityElements.get(attr.GetUID()));
                }
                else {
                    attributes_list[GP.GetUID()].attributes.push(GravityElements.get(attr.GetUID()));
                }

                attributes_list[GP.GetUID()].Operator = GP.GetOperator();
            }
        }

        var vectors = this.MatchItems(workspace, attributes_list);

        var vectorsArr = vectors.GetAsArray();

        var movement = {};

        for (var k in vectorsArr) {
            var vector = vectorsArr[k];

            if (!movement[vector.DataElementUID]) {
                movement[vector.DataElementUID] = new Object();
                movement[vector.DataElementUID].vectors = new Array();
            }

            movement[vector.DataElementUID].vectors[movement[vector.DataElementUID].vectors.length] = vector;
        }

        for (var i in movement) {
            var DataElementUID = i;

            movement[i].DataElementUID = DataElementUID;
            var speed = 0;

            if (movement[i].vectors.length > 1) {
                movement[i].middle = 1;

                var UID = new Array();
                for (var index_v in movement[i].vectors) {
                    var v = movement[i].vectors[index_v];

                    UID.push(v.ContainerUID);
                }

                UID.sort();
                movement[i].ResultPointContainers = UID;
                movement[i].ContainerUID = UID.join('_');

                var x2 = 0;
                var y2 = 0;

                for (var a in movement[i].vectors) {
                    var cvector = movement[i].vectors[a];
                    var x1 = cvector.vector.a.x;
                    var y1 = cvector.vector.a.y;
                    x2 += cvector.vector.b.x;
                    y2 += cvector.vector.b.y + 30;

                    var gravity = cvector.GravityUID;
                }

                x2 /= movement[i].vectors.length;
                y2 /= movement[i].vectors.length;

                movement[i].speed = 5;
                movement[i].vector = this.GetVector(x1, y1, x2, y2);
                var remove_element = DataElements.get(DataElementUID);
                Containers.removeItems(remove_element);
            }
            else {

                speed = 5; //parseInt($("#"+DataElementUID+" > category[name='"+gravityone.category.name+"'] > group[name='"+gravityone.group.name+"'] > gravity[name='"+gravityone.gravity.name+"']").attr('value'));

                movement[i].speed = speed;
                movement[i].middle = 0;
                movement[i].vector = movement[i].vectors[0].vector;
                movement[i].GravityUID = movement[i].vectors[0].vector.GravityUID;
                movement[i].ContainerUID = movement[i].vectors[0].ContainerUID;
                movement[i].ResultPointContainers = new Array();
            }
        }

        var MovementVectors = {};

        for (var j in movement) {
            var m = movement[j];

            if (!MovementVectors[m.ContainerUID]) {
                MovementVectors[m.ContainerUID] = new Object();
                MovementVectors[m.ContainerUID].Elements = new Array();
            }

            if (m.middle) {
                MovementVectors[m.ContainerUID].middle = 1;

                var info = new Array();
                $(m.ResultPointContainers).each(function(k, c) {
                    c = Containers.get(c);

                    info.push(c.GetExpression());
                });
                info = info.join(', ');
            }

            MovementVectors[m.ContainerUID].x = m.vector.b.x;
            MovementVectors[m.ContainerUID].y = m.vector.b.y;
            MovementVectors[m.ContainerUID].info = info;
            MovementVectors[m.ContainerUID].ResultPointContainers = m.ResultPointContainers;
            MovementVectors[m.ContainerUID].Elements.push(m);
            MovementVectors[m.ContainerUID].ContainerUID = m.ContainerUID;
        }

        Containers.HideResultPoints(workspace);
        Containers.ClearInactive(workspace);

        var Arr = new Array();
        for (var ii in MovementVectors) {
            Arr.push(MovementVectors[ii]);
        }

        this.chains = new Array();

        var grouped = new Array();

        for (var kk in Arr) {
            var mv = Arr[kk];
            var ContainerUID = mv.ContainerUID;
            if (mv.middle) {
                var c = Containers.FindByResultPoint(ContainerUID);

                if (!c) {
                    c = Containers.CreateHTMLContainer(ContainerUID, App.CONTAINER_TYPE_MIDDLE);
                    c.SetResultPoint(ContainerUID);
                    c.SetWorkspace(workspace);
                    c.SetConnectedContainers(mv.ResultPointContainers);
                    c.DisableButton('group');
                    c.Reposition(mv.x, mv.y);
                }

                c.Show();

                if (!c.IsMoved) {
                    c.Reposition(mv.x, mv.y);
                }
                ContainerUID = c.GetUID();

                var attrs_middle = mv.info.split(",");
                for (var i in attrs_middle) {
                    attr = GravityElements.GetAttr(attrs_middle[i]);
                    GravityElements.add(attr);
                    c.AddAttribute(attr);
                    c.SelectAttribute(attr.GetUID());
                    c.SortAttributes();
                }

                var RPM = new Object();
                RPM.ContainerUID = ContainerUID;
                RPM.ResultPointContainers = mv.ResultPointContainers;

                c.SetConnectedTo(mv.ResultPointContainers);

                for (var i in mv.ResultPointContainers) {

                    var Cont = Containers.get(mv.ResultPointContainers[i]);
                    var connected = Cont.GetConnectedTo();

                    Cont.SetConnectedTo(connected.concat([ContainerUID]));
                }
                RPM.color = c.GetColor();
            }

            var GroupingContainer = Containers.get(ContainerUID);

            GroupingContainer.HideFrame();

            var GroupingElements = new Array();

            for (var index_move in mv.Elements) {
                var move = mv.Elements[index_move];
                var DE = DataElements.get(move.DataElementUID);

                DE.HideAttrsList();

                var deferred = GroupingContainer.GroupElement(DE, move.speed);

                GroupingElements.push(deferred.promise());

                grouped.push(DE.GetUID());
            }

            var chain = new EventChain(GroupingElements, 'ContainerArrange', GroupingContainer);
        }

        if (Arr.length) {
            Grouping.Redraw();
        }

        Grouping.Passive(workspace, grouped);

        return grouped;
    },
    Move: function() {
        Render.Sleep();

        this.StartMovement(1);
        this.StartMovement(2);

        Render.WakeUp();
    },
    RemoveContainerFromRPM: function(ContainerUID) {
        this.RemoveContainerFromRPMinWorkspace(ContainerUID, 1);
        this.RemoveContainerFromRPMinWorkspace(ContainerUID, 2);
    },
    RemoveContainerFromRPMinWorkspace: function(ContainerUID, workspace) {
        var ResultPointsMap = this.LastResultPointsMap[workspace];
        for (var a in ResultPointsMap) {
            var RPM = ResultPointsMap[a];

            if (RPM.ContainerUID == ContainerUID) {
                ResultPointsMap.splice(a, 1);

                return;
            }
            for (var i in RPM.ResultPointContainers) {
                var RP = RPM.ResultPointContainers[i];

                if (RP == ContainerUID) {
                    RPM.ResultPointContainers.splice(i, 1);
                }
            }
        }
    },
    Passive: function(workspace, exclude)
    {
        var list;

        switch (workspace) {
            case 1:
                list = Containers.get('list');
                break;
            case 2:
                list = Containers.get('list_south');
                break;
        }

        $.merge(exclude, $.map(list.GetElements().arr(), function(DE) {
            return DE.GetUID();
        }))

        var passive = $.grep(DataElements.arr(), function(n, i) {
            return n.GetWorkspace() == workspace && (n.GetCurrentContainer() && !n.GetCurrentContainer().IsBlockedFromGrouping()) && $.inArray(n.GetUID(), exclude) == -1;
        });

        if (passive.length) {
            list.Show();
            list.GroupElements(passive, 5, list);
        }
    },
    Teleport: function() {
        Grouping.Move();
    },
    RedrawLastRPM: function(workspace) {
        if (this.LastResultPointsMap[workspace] && this.LastResultPointsMap[workspace].length) {
            this.DrawLines(workspace);
        }
    },
    GetColor: function() {
        this.colorIndex++;
        if (this.colorIndex == this.defaultColors.length) {
            this.colorIndex = 0;
        }
        return this.defaultColors[this.colorIndex];
    },
    Redraw: function() {
        Canvas.Clear();
        this.DrawLines(1);
        this.DrawLines(2);
        this.DrawMovementPath();
    },
    AddMovementPath: function(DE, c, vector) {
        var path = new Object();

        path.DE = DE;
        path.c = c;
        path.vector = this.GetVector(vector.a.x, vector.a.y, vector.b.x, vector.b.y);
        path.GetUID = function() {
            return this.c.GetUID();
        }

        //this.MovementPath.add(path);
    },
    RemoveMovementPath: function(DE, c) {
        this.MovementPath.remove(c.GetUID());
    },
    DrawMovementPath: function() {
        var arr = this.MovementPath.arr();

        for (var a in arr) {
            var path = arr[a];

            Canvas.DrawLine(path.vector.a.x, path.vector.a.y, path.vector.b.x, path.vector.b.y, path.c.GetColor(), 0.2);
        }
    },
    DrawLines: function(workspace) {
        var GPs = $.grep(Containers.arr(), function(n, i) {
            return n.GetWorkspace() == workspace && n.GetConnectedTo().length != 0 && n.GetContainerType() != App.CONTAINER_TYPE_MIDDLE;
        });

        for (var a in GPs) {
            var GP = GPs[a];
            var ConnectedTo = GP.GetConnectedTo();
            for (var i in ConnectedTo) {
                var connection = ConnectedTo[i];

                drawLineBetweenContainers(GP.GetUID(), connection, GP.GetColor());
            }
        }
    },
    GetVector: function(x1, y1, x2, y2) {
        var vector = new Object;

        var a = new Object;
        a.x = x1;
        a.y = y1;
        var b = new Object;
        b.x = x2;
        b.y = y2;

        vector.a = a;
        vector.b = b;

        return vector;
    },
    GetMovementVector: function(DO, GP, GravityUID) {
        var obj = new Object;

        obj.vector = this.GetVector(DO.GetX(), DO.GetY(), GP.GetX(), GP.GetY());
        obj.DataElementUID = DO.GetUID();
        obj.ContainerUID = GP.GetUID();
        obj.GravityUID = GravityUID;

        obj.GetUID = function() {
            return this.DataElementUID + this.ContainerUID;
        }

        return obj;
    }
});