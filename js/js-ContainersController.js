var ContainersController = Dictionary.extend({
    init: function() {
        this.ContainersUIDCounter = 0;

        this._super(new Array());

        this.LastArrange = 'jumble';
        this.LastSums = 1;
        this.Visualization = 1;

        this.UIMap = new goog.structs.Map;
        var SearchBarVisMap = new goog.structs.Map;

        this.UIMap.set("search_bar_vis", SearchBarVisMap);
    },
    GetUIMap: function() {
        return this.UIMap;
    },
    SetUIConnect: function(vis, visUID, GPUID) {
        var map = this.UIMap.get(vis);
        if (map) {
            map.set(visUID, GPUID);
        }
        else {
            throw "Invalid visualization category!";
        }
    },
    GetUIConnect: function(vis, visUID) {
        var map = this.UIMap.get(vis);
        if (map) {
            return map.get(visUID);
        } else {
            throw "Invalid visualization category!";
        }
    },
    CreateHTMLContainer: function(UID, ContainerType, GE) {
        this.ContainersUIDCounter++;

        if (ContainerType != App.CONTAINER_TYPE_SYSTEM) {
            UID = UID + '_' + this.ContainersUIDCounter;
        }

        var HTMLid = 'container_' + UID;

        $.tmpl('attr_menu_tpl', {
            "HTMLid": HTMLid,
            "ContainerUID": UID,
            "AttrMenuID": HTMLid + '_menu',
            "Close": 1
        }).appendTo('#page');

        if (ContainerType != App.CONTAINER_TYPE_SYSTEM && ContainerType != App.CONTAINER_TYPE_MIDDLE) {
            var attrListUID = App.GetNewUID();

            $.tmpl('gp_attrs_list', {
                'UID': attrListUID
            }).appendTo('#' + HTMLid);

            var divUID = App.GetNewUID();

            $.tmpl('search_bar_vis', {
                "UID": divUID
            }).appendTo('#criterion');

            $("#" + divUID).on('mouseover', function() {
                Search.HighlightConnectedGP(divUID);
            });
            $("#" + divUID).on('mouseout', function() {
                Search.RestoreHighlightConnectedGP(divUID);
            });

            this.SetUIConnect('search_bar_vis', divUID, UID);
        }

        var container = new HTMLContainer(UID, ContainerType, GE, attrListUID);

        if (divUID) {
            container.SetSearchBarUID(divUID);
        }

        return this.add(container);
    },
    ClearInactive: function(workspace) {
        var containers = $.grep(this.arr(), function(n, i) {
            return !n.IsSystem() && n.GetWorkspace() == workspace;
        });

        for (var a in containers) {
            var c = containers[a];

            if (c.SelectedAttributes.count() == 0 && c.GetElements().count() == 0 && !c.GetResultPointUID()) {
                c.Hide();
            }
        }
    },
    DropIn: function(x, y, DE)
    {
        var arrange = 0;

        var containers = $.grep(this.arr(), function(n, i) {
            return !n.IsSystem() && !n.IsHidden();
        });

        for (var a in containers) {
            var c = containers[a];

            if (c.IsInCoordinates(x, y) && c.LandingZoneElementCheck(DE)) {
                c.CheckSave();
                c.AddElement(DE);
                c.TagElement(DE);

                DE.IsNotActive();

                arrange = 1;
            }
        }

        if (arrange) {
            c.Arrange();
        }
    },
    ShowSums: function() {
        var containers = $.grep(this.arr(), function(n, i) {
            return !n.IsSystem();
        });

        for (var a in containers) {
            var container = containers[a];

            if (this.LastSums) {
                container.ShowSum();
            }
            else {
                container.HideSum();
            }
        }

        if (this.LastSums) {
            this.LastSums = 0;
        }
        else {
            this.LastSums = 1;
        }
    },
    ReleaseAll: function() {
        var containers = $.grep(this.arr(), function(n, i) {
            return !n.IsTrapped() && !n.IsSystem();
        });

        for (var a in containers) {
            var container = containers[a];

            container.Release();
        }
    },
    HideAll: function() {
        var containers = $.grep(this.arr(), function(n, i) {
            return !n.IsTrapped() && !n.IsSystem();
        });

        for (var a in containers) {
            var container = containers[a];

            container.Hide();
        }

        Canvas.Clear();
    },
    ArrangeAll: function() {
        var obj = this;

        var containers = $.grep(this.arr(), function(n, i) {
            return !n.IsTrapped();
        });

        $(containers).each(function(k, c) {
            switch (obj.LastArrange) {
                case 'jumble':
                    c.split();
                    break;
                case 'split':
                    c.jumble();
                    break;
            }
        });

        switch (obj.LastArrange) {
            case 'jumble':
                obj.LastArrange = 'split';
                break;
            case 'split':
                obj.LastArrange = 'jumble';
                break;
        }
    },
    ArrangeGrouped: function() {
        var containers = this.GetAsArray();
        for (var a in containers) {
            var container = containers[a];
            if (container.ContainerType != App.CONTAINER_TYPE_INPUT)
            {
                container.Arrange();
            }
        }
    },
    HideResultPoints: function(workspace) {
        var arr = this.GetAsArray();

        for (var a in arr) {
            var container = arr[a];

            if (container.GetResultPointUID() != '' && container.GetWorkspace() == workspace) {
                container.Hide();
            }
        }
    },
    ShowHide: function(ContainerUID) {
        this.get(ContainerUID).ShowHide();
    },
    FindByResultPoint: function(UID) {
        var containers = this.GetAsArray();

        for (var index in containers) {
            var c = containers[index];

            if (c.GetResultPointUID() == UID) {
                return c;
            }
        }

        return false;
    },
    GetContainerByElement: function(element) {
        var containers = this.arr();

        for (var i in containers) {
            var c = containers[i];

            if (c.SearchElement(element)) {
                return c;
            }
        }

        return null;
    },
    findByItem: function(item)
    {
        var containers = Containers.GetAsArray();

        for (var a in containers)
        {
            var container = containers[a];

            if (container.SearchElement(item)) {
                return container.GetUID();
            }
        }

        return null;
    },
    findByCreator: function(item) {    // trqbwa da se prenapi6e
        for (var a in this.elements) {
            var container = this.elements[a].value;

            if (container.Owner == item.GetUID()) {
                return container;
            }
        }

        return null;
    },
    removeItems: function(item)
    {
        var containers = Containers.GetAsArray();

        for (var a in containers)
        {
            var container = containers[a];

            if (container.RemoveElement(item)) {
                return item.GetUID();
            }
        }

        return null;
    },
    GetVisualization: function() {
        var vis = this.Visualization;
        return vis;
    },
    GetFullVis: function() {
        this.Visualization = 1;
        var containers = $.grep(Containers.arr(), function(n, i) {
            return  n.GetContainerType() !== App.CONTAINER_TYPE_SYSTEM;
        });

        for (var i in containers) {
            var cont = containers[i];
            var contUID = cont.GetUID();
            cont.ChangeVisualizaton(contUID);
        }
    },
    GetIconVis: function() {
        this.Visualization = 2;
        var containers = $.grep(Containers.arr(), function(n, i) {
            return  n.GetContainerType() !== App.CONTAINER_TYPE_SYSTEM;
        });

        for (var i in containers) {
            var cont = containers[i];
            var contUID = cont.GetUID();
            cont.ChangeVisualizaton(contUID);
        }
    }
});