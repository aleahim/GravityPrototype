var Container = Class.extend({
    init: function(UID, Elements) {
        this.UID = UID;
        this.Elements = Elements;
    },
    Arrange: function(onlyMain) {
        switch (this.ArrangeType) {
            case 'jumble':
//                this.jumble();
//                break;
            case 'split':
                this.split(onlyMain);
                break;
        }

        if (this.IsTrapped()) {
            this.HideExpandButtons();
        }
        this.UpdateElementsCount();
    },
    join: function() {

    },
    split: function() {
        Render.Sleep();

        var item_width = 25;
        var margin = 4;
        var row = 0;
        var col = 0;
        var all_items = this.GetElements().arr();
        this.SortObjects(all_items);

        var point = this.GetGPLandCoords();

        for (var i in all_items)
        {
            var DO = all_items[i];
            var distance_left = 0;
            var distance_top = 0;

            distance_left = col * (item_width + margin);
            distance_top = row * (item_width + margin);

            var left = point.x + distance_left;
            var top = point.y + distance_top;

            Render.Add('#' + DO.GetUID(), 'move', [{
                    'left': left,
                    'top': top
                },
                {
                    'step': function(a, b) {
                        switch (b.prop) {
                            case 'left':
                                DO.x = parseInt(a);
                                break;
                            case 'top':
                                DO.y = parseInt(a);
                                break;
                        }
                    },
                    'duration': Render.GetSpeedMS(DO, this, 10)
                }
            ]);

            row++;
        }

        Render.WakeUp();
    },
    jumble: function() {
//console.log(this.GetUID() + ' is arranged: jumble items: '+this.Elements.count());

        var c = this;
        var items = this.GetElements().arr();
        c.ShowAllElements();
        function getRandomArbitary(min, max) {
            return Math.random() * (max - min) + min;
        }

        $(items).each(function(k, DE) {
            var rnd_x = getRandomArbitary(5, -30 + c.w - DE.w);
            var rnd_y = getRandomArbitary(5, -80 + c.h - DE.h);
            var left = DE.HTMLel.css('left', rnd_x);
            var top = DE.HTMLel.css('top', rnd_y);
            Render.Add('#' + DE.GetUID(), 'move', [{
                    'left': left,
                    'top': top
                },
                {
                    'step': function(a, b) {
                        switch (b.prop) {
                            case 'left':
                                DE.x = parseInt(a);
                                break;
                            case 'top':
                                DE.y = parseInt(a);
                                break;
                        }
                    },
                    'duration': Render.GetSpeedMS(DE, this, 10)
                }
            ]);
        });
    },
    GetUID: function() {
        return this.UID;
    }
});
var HTMLContainer = Container.extend({
    init: function(UID, ContainerType, Attributes, attrListUID) {
        this._super(UID, new Dictionary(new Array()));
        this.ChangeContainerType(ContainerType);
        this.AttrMenu = 'container_' + this.UID + '_menu';
        this.HTMLid = 'container_' + this.UID;
        this.SearchBarUID = "";
        this.HTMLel = $('#' + this.HTMLid);
        this.Hidden = 0;
        this.IsMoved = 0;
        this.SumShown = 0;
        this.LinesAreBold = 0;
        this.BlockedFromGrouping = 0;
        this.FeedID = null;
        this.IsLoaded = false;
        this.ShowOnlyFirstRow = 0;
        this.createdFrom = false;
        this.ResultPointContainers = '';
        this.ConnectedTo = new Array();
        this.IsTrappedState = false;
        this.workspace = 1;
        this.ClickareaVis = 0;
        this.AttrListUID = attrListUID;
        switch (this.ContainerType)
        {
            case App.CONTAINER_TYPE_GENERAL:
                this.ARRANGE_SPLIT_COLUMNS = 3;
                this.ARRANGE_SPLIT_ROWS = 3;
                this.ARRANGE_JUMBLE_COLUMNS = 3;
                this.ARRANGE_JUMBLE_ROWS = 3;
                this.SetArrangeType('split');
                this.ResizePredef(3, 3);
                break;
            case App.CONTAINER_TYPE_INPUT:
                this.ARRANGE_SPLIT_COLUMNS = 9;
                this.ARRANGE_SPLIT_ROWS = 6;
                this.ARRANGE_JUMBLE_COLUMNS = 9;
                this.ARRANGE_JUMBLE_ROWS = 6;
                this.SetArrangeType('jumble');
                this.ResizePredef(9, 6);
                break;
            case App.CONTAINER_TYPE_SYSTEM:
                this.ARRANGE_SPLIT_COLUMNS = 4;
                this.ARRANGE_SPLIT_ROWS = 12;
                this.ARRANGE_JUMBLE_COLUMNS = 4;
                this.ARRANGE_JUMBLE_ROWS = 12;
                this.SetArrangeType('split');
                break;
            default:
                this.ARRANGE_SPLIT_COLUMNS = 3;
                this.ARRANGE_SPLIT_ROWS = 3;
                this.ARRANGE_JUMBLE_COLUMNS = 3;
                this.ARRANGE_JUMBLE_ROWS = 3;
                this.SetArrangeType('split');
                this.ResizePredef(3, 3);
                break;
        }

        this.DefaultColors();
        var GEarray;
        if (Attributes) {
            GEarray = Attributes.arr();
        }
        else {
            GEarray = new Array();
        }

        this.GravityElements = new Dictionary(new Array());
        this.SelectedAttributes = new Dictionary(new Array());
        if (GEarray.length) {
            for (var i in GEarray) {
                var attr = GEarray[i];
                this.AddAttribute(attr);
                GravityElements.add(attr);
            }
        }
        this.clickarea = $('#clickarea_' + this.HTMLid);
        this.contentFrame = $('#' + this.HTMLid).find('.elements');
        this.wholeFrame = $('#' + this.HTMLid).find('.container_frame');
        var obj = this;
        if (obj.clickarea.length) {
            if (obj.ContainerType === 3) {
                $("#" + obj.HTMLid).find(".sum").css({
                    'top': '80px',
                    'right': '341px'
                });
            }
            else {
                $("#" + obj.HTMLid).find(".sum").css({
                    'top': '80px',
                    'right': '185px'
                });
            }
            obj.HideFrame();
            var popupUIDgroup = App.GetNewUID();

            $('#spyglass_' + this.AttrMenu).hover(
                    function(event) {
                        var popup = App.MakePopUp(popupUIDgroup, 'Group', event.pageX, event.pageY, 'left');
                        popup.show();
                        $('#spyglass_' + obj.AttrMenu).attr('src', 'pics/GP/g_on.png');
                    },
                    function() {
                        $('#spyglass_' + obj.AttrMenu).attr('src', 'pics/GP/g.png');
                        $('#' + popupUIDgroup).hide();
                    });
            $('#container_db_' + obj.HTMLid).bind('click', function() {
                obj.Group();
            });
            var popupUIDdb = App.GetNewUID();
            $('#container_db_' + obj.HTMLid).hover(
                    function(event) {
                        var popup = App.MakePopUp(popupUIDdb, 'Dynamic Grouping', event.pageX, event.pageY, 'left');
                        popup.show();
                        $('#container_db_' + obj.HTMLid).attr('src', 'pics/GP/db_on.png');
                    },
                    function() {
                        $('#container_db_' + obj.HTMLid).attr('src', 'pics/GP/db.png');
                        $('#' + popupUIDdb).hide();
                    });
            $('#container_sum_' + obj.HTMLid).bind('click', function() {
                obj.ShowSumReport();
            });
            var popupUIDsum = App.GetNewUID();
            $('#container_sum_' + obj.HTMLid).hover(
                    function(event) {
                        var popup = App.MakePopUp(popupUIDsum, 'Show Sum', event.pageX, event.pageY, 'left');
                        popup.show();
                        $('#container_sum_' + obj.HTMLid).attr('src', 'pics/GP/sum_on.png');
                    },
                    function() {
                        $('#container_sum_' + obj.HTMLid).attr('src', 'pics/GP/sum.png');
                        $('#' + popupUIDsum).hide();
                    });
            $('#container_close_' + obj.HTMLid).bind('click', function() {
                obj.Close();
            });
            var popupUIDclose = App.GetNewUID();
            $('#container_close_' + obj.HTMLid).hover(
                    function(event) {
                        var popup = App.MakePopUp(popupUIDclose, 'Close', event.pageX, event.pageY, 'left');
                        popup.show();
                        $('#container_close_' + obj.HTMLid).attr('src', 'pics/GP/close_on.png');
                    },
                    function() {
                        $('#container_close_' + obj.HTMLid).attr('src', 'pics/GP/close.png');
                        $('#' + popupUIDclose).hide();
                    });
            $('#' + obj.HTMLid + ' input:radio').bind('click', function() {
                Containers.get(obj.GetUID()).RefreshExpression();
                show_and_or(obj.GetUID());
            });
            $('#clickarea_' + obj.HTMLid).bind('mouseover', function(e) {
                if (obj.getCreatedFrom()) {
                    DataElements.get(obj.getCreatedFrom()).HideAttrsList();
                }
                obj.BoldLines();
                obj.ShowFrame(1);
                obj.HTMLel.css({
                    'z-index': 7
                });
            });
            $('#clickarea_' + obj.HTMLid).bind('mouseout', function(e) {
                obj.NormalLines();
                obj.HideFrame();
            });
            $('#' + obj.HTMLid).bind('mouseover', function(e) {
                obj.ShowFrame();
            });
            $('#' + obj.HTMLid).bind('mouseout', function(e) {
                if (obj.MenuShown !== 1) {
                    obj.HideFrame();
                }
            });
            $('#container_frame_' + obj.HTMLid).bind('mouseover', function(e) {
//obj.ShowFrame();
            });
            $('#buttons_' + obj.HTMLid + ',#buttons_' + obj.HTMLid + ' *').bind('mouseover', function() {
                obj.ShowFrame();
            });
            $('#spyglass_' + this.AttrMenu).bind('mouseover', function() {
                obj.ShowMenu();
            });
            $('#spyglass_' + this.AttrMenu).bind('mouseout', function() {
                obj.HideMenu();
                //obj.HideFrame();
            });
            $('#spyglass_' + this.AttrMenu).bind('click', function() {

                Grouping.Move();
            });
            $('#' + this.AttrMenu).bind('mouseover', function() {
                obj.ShowMenu();
            });
            $('#' + this.AttrMenu).bind('mouseout', function() {
                obj.HideMenu();
                obj.HideFrame();
            });
            $('#search_' + obj.HTMLid + '_btn').bind('click', function() {
                var attr = $('#search_' + obj.HTMLid + '_txt').val();
                $('#search_' + obj.HTMLid + '_txt').val('');
                attr = GravityElements.GetAttr(attr);
                GravityElements.add(attr);
                obj.AddAttribute(attr);
                obj.SelectAttribute(attr.GetUID());
                obj.SortAttributes();
            });
            $('#' + attrListUID).find('input').on('keypress', function(e) {
                switch (e.which) {
                    case 32:
                        var attr = $(this).val();
                        $(this).val('');

                        if (attr) {
                            var uid = obj.AddAttrFromText(attr, 1);
                            if (uid) {
                                obj.SelectAttribute(uid);
                            }
                        }
                        else {
                            obj.LoadSuggestedAttrs();

                            var gp = Containers.CreateHTMLContainer(App.GetNewUID(), App.CONTAINER_TYPE_CHILD);
                            gp.Reposition(obj.GetX() + 200, 80);
                            gp.GetFocus();
                            obj.HideFrame();

                            Search.AddGPToQ(gp);
                        }

                        e.preventDefault();
                        break;
                    case 13:
                        var attr = $(this).val();
                        $(this).val('');

                        var uid = obj.AddAttrFromText(attr, 1);
                        if (uid) {
                            obj.SelectAttribute(uid);
                        }

                        if (Search.IsGPInQ(obj)) {
                            if (attr) {
                                obj.LoadSuggestedAttrs();

                                var gp = Containers.CreateHTMLContainer(App.GetNewUID(), App.CONTAINER_TYPE_CHILD);
                                gp.Reposition(obj.GetX() + 200, 80);
                                gp.GetFocus();
                                obj.HideFrame();

                                Search.AddGPToQ(gp);
                            }
                            else {
                                Search.Search();
                            }
                        }
                        else {
                            Grouping.Move();
                        }
                        e.preventDefault();
                        break;
                }
            });
            $('#' + obj.HTMLid + ' input[name*="operator"]').bind('click', function() {
                obj.SetOperator(obj.GetOperator());
            });
            Events.ContainerPointer(obj.clickarea.attr('id'));
            Events.ContainerResize('resize_' + obj.HTMLid);

            if (this.ContainerType === App.CONTAINER_TYPE_MIDDLE) {
                obj.HTMLel.find('.attrs').show();
            }

            if (this.ContainerType === App.CONTAINER_TYPE_GENERAL) {
                obj.HTMLel.css('display', 'block');
                $.getJSON(gateway + '&do=menu_output', function(data) {
                    obj.menu = data;
                    obj.CreateAttrMenu();
                });
            }
            else {
                this.SortAttributes();
            }
        }

//        $(this.HTMLel).find('.elements').bind('mousewheel DOMMouseScroll', function(e) {
//            var scrollTo = null;
//            if (e.type == 'mousewheel') {
//                scrollTo = (e.originalEvent.wheelDelta * -1);
//            } else if (e.type == 'DOMMouseScroll') {
//                scrollTo = 1000 * e.originalEvent.detail;
//            }
//
//            if (scrollTo) {
//                e.preventDefault();
//                $(this).scrollTop(scrollTo + $(this).scrollTop());
//            }
//        });


        if (!this.IsSystem()) {
//LandingZones.AddZone('#'+obj.HTMLid, [DataElement], 0, 'width', 'height', 0, this.LandingZoneElementCheck, this);
        }
    },
    LoadSuggestedAttrs: function() {
        var obj = this;
        var q = '';
        var attrs = obj.GetSelectedAttributes();
        for (var a in attrs) {
            var s = attrs[a];

            q += s.GetDisplayName() + ' ';
        }

        var url = "https://www.googleapis.com/freebase/v1/search?query=" + encodeURIComponent(q) + "&key=AIzaSyDVr9x0pIvtfNoXfcJGnBiUIchrJAcJMjQ";

        $.getJSON(url, function(data) {
            if (data && data.result) {
                var i = 0;
                for (var a in data.result) {
                    var sugg = data.result[a];
                    var attr;
                    if (sugg.notable) {
                        attr = sugg.notable.name;
                    }
                    else {
                        attr = sugg.name;
                    }
                    obj.AddAttrFromText(attr);

                    if (++i == 5) {
                        break;
                    }
                }
            }
        });
    },
    GetFocus: function() {
        this.HTMLel.find('.gp_attr_list').find('input').focus();
    },
    AddAttrFromText: function(attr, main) {
        if (attr.length === 0) {
            return;
        }

        attr = GravityElements.GetAttr(attr);
        GravityElements.add(attr);
        attr.main = main;
        this.AddAttribute(attr);
        this.SortAttributes();

        return attr.GetUID();
    },
    GetSearchBarUID: function() {
        return this.SearchBarUID;
    },
    SetConnectedTo: function(GPs) {
        this.ConnectedTo = GPs;
    },
    GetConnectedTo: function() {
        return this.ConnectedTo;
    },
    setCreatedFrom: function(DOUID) {
        this.createdFrom = DOUID;
    },
    getCreatedFrom: function() {
        return this.createdFrom;
    },
    SortObjects: function(objects) {
        objects.sort(function(a, b) {
            if (a.GetType() == 'folder') {
                if (b.GetType() == 'folder') {
                    if (a.GetTitle() > b.GetTitle()) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }
                else {
                    return -1;
                }
            }

            if (b.GetType() == 'folder') {
                return 1;
            }

            if (b.GetType() > a.GetType()) {
                return 1;
            }
            else if (b.GetType() < a.GetType()) {
                return -1;
            }

            if (a.GetTitle() > b.GetTitle()) {
                return 1;
            }
            else {
                return -1;
            }
        });
    },
    LandingZoneElementCheck: function(DE) {
        if (this.IsHidden()) {
            return false;
        }

        if (this.SearchElement(DE)) {
            return false;
        }
        else {
            return true;
        }
    },
    IsActive: function() {
        if (this.ContainerType == App.CONTAINER_TYPE_MIDDLE) {
            this.HTMLel.find('.el_count').css({
                'background': '#000',
                'color': '#fff'
            });
        }
        if (this.ContainerType == App.CONTAINER_TYPE_INPUT) {

            this.HTMLel.find('.el_count').css({
                'background': '#e4e5e4',
                'color': '#fff'
            });
        }
        else {
            this.HTMLel.find('.el_count').css({
                'background': this.AttributesColor,
                'color': '#fff'
            });
        }
    },
    IsNotActive: function() {
        if (this.ContainerType == App.CONTAINER_TYPE_MIDDLE) {
            this.HTMLel.find('.el_count').css({
                'border': '2px solid #000',
                'background': '#fff',
                'color': '#000'
            });
        }
        if (this.ContainerType == App.CONTAINER_TYPE_INPUT) {

            this.HTMLel.find('.el_count').css({
                'border': '2px solid #e4e5e4',
                'background': '#fff',
                'color': '#e4e5e4'
            });
        }
        else {
            this.HTMLel.find('.el_count').css({
                'border': '2px solid' + this.AttributesColor,
                'background': '#fff',
                'color': this.AttributesColor
            });
        }
    },
    SetIsLoaded: function() {
        this.IsLoaded = true;
    },
    SetIsNotLoaded: function() {
        this.IsLoaded = false;
    },
    GetIsLoaded: function() {
        return this.IsLoaded;
    },
    SetFeedID: function(FeedID) {
        this.FeedID = FeedID;
    },
    GetFeedID: function() {
        return this.FeedID;
    },
    BlockFromGrouping: function() {
        this.BlockedFromGrouping = 1;
        this.SetResultPoint('');
        this.SetConnectedContainers(null);
        var GPs = this.GetConnectedTo();
        for (var a in GPs) {
            var GP = Containers.get(GPs[a]);

            var conn = GP.GetConnectedTo();
            var index = conn.indexOf(this.GetUID());
            if (index != -1) {
                conn.splice(index, 1);
                GP.SetConnectedTo(conn);
                GP.NormalLines();
            }
        }
        this.SetConnectedTo(new Array());
        this.Resize(0, 0);
        this.Arrange();
        this.HideFrame();
    },
    AllowGrouping: function() {
        this.BlockedFromGrouping = 0;
    },
    IsBlockedFromGrouping: function() {
        return this.BlockedFromGrouping == 1;
    },
    SetTrapped: function(state) {
        this.IsTrappedState = state;
        if (state == true) {
            this.BlockFromGrouping();
            this.ShowOnlyFirstRow = 1;
            this.HTMLel.css({
                position: 'fixed'
            });
            this.clickarea.css({
                position: 'fixed'
            });
            this.HTMLel.find('.attrs').css({
                'background-color': 'transparent'
            });
        }
        else {
            this.AllowGrouping();
            this.ShowOnlyFirstRow = 0;
            this.HTMLel.css({
                position: 'absolute'
            });
            this.clickarea.css({
                position: 'absolute'
            });
            this.HTMLel.find('.attrs').css({
                'background-color': 'transparent'
            });
        }
    },
    IsTrapped: function() {
        return this.IsTrappedState;
    },
    IsSystem: function() {
        return this.GetContainerType() == App.CONTAINER_TYPE_SYSTEM;
    },
    ChangeContainerType: function(ContainerType) {
        this.ContainerType = ContainerType;
    },
    GetContainerType: function() {
        return this.ContainerType;
    },
    GetGPLandCoords: function() {
        var point = new Object();
        point.x = this.GetX() + 35;
        point.y = this.GetY() + 35;
        return point;
    },
    GetGPCoords: function() {
        var point = new Object();
        point.x = this.GetX() + 16;
        point.y = this.GetY() + 16;
        return point;
    },
    PlaceElementAtGroupingPoint: function(DE) {
        var point = this.GetGPLandCoords();
        DE.HTMLel.css({
            left: point.x,
            top: point.y
        });
    },
    SetArrangeType: function(type) {
        this.ArrangeType = type;
    },
    DefaultColors: function() {
        switch (this.ContainerType)
        {
            case App.CONTAINER_TYPE_GENERAL:
                this.ChangeColors('#CB540A', 'white', 'gray', '#CB540A');
                break;
            case App.CONTAINER_TYPE_INPUT:
                this.ChangeColors('#e4e5e4', 'white', '#e4e5e4', '#383838');
                break;
            case App.CONTAINER_TYPE_SYSTEM:
                this.ChangeColors('#e4e5e4', 'white', '#e4e5e4', 'black');
                break;
            case App.CONTAINER_TYPE_CHILD:
                var color = Grouping.GetColor();
                this.ChangeColors(color, 'white', color, color);
                break;
            case App.CONTAINER_TYPE_LOAD:
                this.ChangeColors('#e4e5e4', 'white', '#e4e5e4', '#383838');
                break;
            default:
                this.ChangeColors('black', 'white', 'grey', 'black');
                break;
        }
    },
    GetFullWidth: function() {
        return this.HTMLel.width();
    },
    GetFullHeight: function() {
        return this.HTMLel.height();
    },
    GetX: function() {
        return this.x;
    },
    GetY: function() {
        return this.y;
    },
    GetElementsFrameX: function() {
        var pos = this.HTMLel.position();
        var x = pos.left;
        return x + this.HTMLel.find('.buttons').width() + 5;
    },
    GetElementsFrameY: function() {
        var pos = this.HTMLel.position();
        var y = pos.top;
        return y + this.HTMLel.find('.sum').height() + this.HTMLel.find('.attrs').height() + 5;
    },
    GetElementsFrameWidth: function() {
        return this.GetFullWidth() - 30 - 5; // 30 - goleminata na butonite
    },
    GetElementsFrameHeight: function() {
        return this.GetFullHeight() - this.HTMLel.find('.sum').height() - this.HTMLel.find('.attrs').height() - 5;
    },
    GetVisibleHeight: function() {
        return this.GetFullHeight() - this.HTMLel.find('.sum').height();
    },
    ShowMenu: function() {
        var obj = this;
        obj.MenuShown = 1;
        if (obj.MenuTimer) {
            clearTimeout(obj.MenuTimer);
            obj.MenuTimer = 0;
        }

        $('#' + obj.HTMLid + ' .attr_menu_container').show();
        obj.ShowFrame();
    },
    HideMenu: function() {
        var obj = this;
        obj.MenuTimer = setTimeout(function() {
            $('#' + obj.HTMLid + ' .attr_menu_container').hide();
            obj.MenuShown = 0;
        }
        , 100);
    },
    ShowSubMenu: function() {
        var obj = this;
        obj.SubMenuShown = 1;
        if (obj.SubMenuTimer) {
            clearTimeout(obj.SubMenuTimer);
            obj.SubMenuTimer = 0;
        }

        $('#' + obj.HTMLid + ' .sec_attr_menu_container').show();
        obj.ShowFrame();
    },
    HideSubMenu: function() {
        var obj = this;
        obj.SubMenuTimer = setTimeout(function() {
            $('#' + obj.HTMLid + ' .sec_attr_menu_container').hide();
            obj.SubMenuShown = 0;
            obj.ShowFrame();
        }
        , 1000);
    },
    GetElementEvent: function(DE) {
        var obj = this;
        var d = $.Deferred();
        d.done(function(DE) {
            obj.AddElement(DE);
        });
        return d;
    },
    GroupElement: function(DE, speed) {
        var cc = DE.GetCurrentContainer();
        if (cc && cc.GetUID() === this.GetUID()) {
            return;
        }

        var obj = this;
        DE.RepositionInContainer();
        DE.GroupingStarted(obj, speed);
        var point = obj.GetGPLandCoords();
        var d = obj.GetElementEvent(DE);
        Render.Add('#' + DE.GetUID(), 'move', [
            {
                'left': point.x,
                'top': point.y
            },
            {
                'step': function(a, b) {
                    switch (b.prop) {
                        case 'left':
                            DE.x = parseInt(a);
                            break;
                        case 'top':
                            DE.y = parseInt(a);
                            break;
                    }
                },
                'duration': Render.GetSpeedMS(DE, obj, 10),
                'complete': function() {
                    d.resolve(DE);
                }
            }
        ]);
        //Canvas.DrawLine(DE.GetX(), DE.GetY(), point.x, point.y, 'black');
        return d;
    },
    CheckSave: function() {
        if (App.GetEditMode()) {
            this.SaveFlag = confirm('Do you want to permanently add these tags?');
        }
    },
    TagElement: function(DE) {
        var save = 0;
        if (App.GetEditMode()) {
            save = this.SaveFlag;
        }

        var attrs = this.SelectedAttributes.arr();
        $.each(attrs, function(k, attr) {
            DE.AddAttribute(attr, save);
        });
    },
    GetSelectedAttributes: function() {
        return this.SelectedAttributes.arr();
    },
    AddElement: function(DE) {
        DE.JoinedContainer(this);
        this.Elements.add(DE);

//        Render.Add('#' + DE.HTMLid, 'appendTo', {
//            'target': this.HTMLel.find('.elements')
//        });
        //DE.RepositionInContainer(this);
    },
    RemoveElement: function(DE) {
        if (this.Elements.get(DE.GetUID())) {
            this.Elements.remove(DE.GetUID());
            DE.LeftContainer();

            return true;
        }

        return false;
    },
    SearchElement: function(DE) {
        return this.Elements.get(DE.GetUID());
    },
    GetElements: function() {
        return this.Elements;
    },
    UpdateElementsCount: function() {
        var count = this.GetElements().arr().length;

        if (count == 0) {
            this.HTMLel.find('.el_count').css({
                'display': 'none'
            });
        }
        else {
            this.HTMLel.find('.el_count').css({
                'display': 'inherit'
            });
        }

        this.HTMLel.find('.el_count').text(count);
        var w = $('#container_' + this.GetUID()).find('.el_count').width();
        var left = w + 50;

        this.HTMLel.find('.el_count').css({
            'margin-left': '-' + left + 'px'
        });
    },
    AddAttribute: function(attr) {
        if (this.GravityElements.get(attr.GetUID())) {
            return attr;
        }

        return this.GravityElements.add(attr);
    },
    GetAttributes: function() {
        return this.GravityElements.arr();
    },
    IsAttributeSelected: function(attr) {
        var is_selected = this.SelectedAttributes.get(attr.GetUID());
        if (is_selected) {
            is_selected = true;
        }
        else {
            is_selected = false;
        }

        return is_selected;
    },
    SetSearchBarUID: function(divUID) {
        this.SearchBarUID = divUID;
    },
    SetConnectedContainers: function(containers) {
        this.connectedContainers = containers;
    },
    GetConnectedContainers: function() {
        return this.connectedContainers;
    },
    ChangeFrameColor: function(color) {
        this.contentFrame.find("img").css({
            'border': "3px solid" + color
        });
    },
    SetBorderFrameColor: function(color, w) {
        var offset = this.HTMLel.find('.el_count').width();
        offset = offset + 30;
        var left = offset - 8;
        var but_left = offset - 11;
        var menu_left = offset + 22;
        var contUID = this.GetUID();
        $("#container_frame_container_" + contUID).css({
            'border': "2px solid" + color,
            'width': w + "px",
            'padding-left': offset + "px",
            'top': "20px",
            'left': "-" + left + "px"

        });
        $("#container_frame_container_" + contUID).find(".buttons").css({
            'left': but_left + "px",
            'top': "43px"
        });

        $("#container_frame_container_" + contUID).find(".attr_menu_container").css({
            'left': menu_left + "px",
            'top': "42px"
        });
    },
    GetClickareaVisualizaton: function(contUID) {
        $("#container_" + contUID).css({
            visibility: "hidden"
        });
        $("#container_" + contUID).find(".cont_title").css({
            visibility: "visible"
        });
    },
    GetIconVisualizaton: function(contUID) {
        $("#container_" + contUID).css({
            visibility: "visible"
        });
    },
    HideNotConnectedGPs: function() {
        var NotConnectedGPs = new Array();
        var resPoint = this.GetConnectedTo();

        $("#container_" + this.GetUID()).css({
            visibility: "visible"
        });
        for (var n in resPoint) {
            $("#container_" + resPoint[n]).css({
                visibility: "visible"
            });
        }

        var GPs = $.grep(Containers.arr(), function(n, i) {
            return  n.GetContainerType() != App.CONTAINER_TYPE_SYSTEM && n.GetContainerType() != App.CONTAINER_TYPE_INPUT;
        });
        for (var i in GPs) {
            if (GPs[i].GetUID() != this.GetUID()) {
                NotConnectedGPs.push(GPs[i].GetUID());
            }
        }
        for (var i = 0; i < resPoint.length; i++) {
            var arrlen = NotConnectedGPs.length;
            for (var j = 0; j < arrlen; j++) {
                if (resPoint[i] == NotConnectedGPs[j]) {
                    NotConnectedGPs = NotConnectedGPs.slice(0, j).concat(NotConnectedGPs.slice(j + 1, arrlen));
                }
            }
        }

        for (var n in NotConnectedGPs) {
            $("#container_" + NotConnectedGPs[n]).css({
                visibility: "hidden"
            });
            $("#container_" + NotConnectedGPs[n]).find(".cont_title").css({
                visibility: "visible"
            });
        }
    },
    ShowNotConnectedGPs: function() {
        var GPs = $.grep(Containers.arr(), function(n, i) {
            return  n.GetContainerType() != App.CONTAINER_TYPE_SYSTEM;
        });
        for (var i in GPs) {
            var contUID = GPs[i].GetUID();
            if (GPs[i].ClickareaVis) {
                $("#container_" + contUID).css({
                    visibility: "hidden"
                });
                $("#container_" + contUID).find(".cont_title").css({
                    visibility: "visible"
                });
            }
            else {
                $("#container_" + contUID).css({
                    visibility: "visible"
                });
            }


        }
    },
    GetCriterion: function() {
        var GPcrit = new Array();
        var s_attrs = this.GetSelectedAttributes();
        for (var i in s_attrs) {
            var attr = s_attrs[i];
            GPcrit.push(attr.GetName().split('_').join('+'));
        }

        var op;
        switch (this.GetOperator().toLowerCase()) {
            case 'and':
                op = ' and ';
                break;
            case 'or':
                op = ' or ';
                break;
            default:
                op = '';
                break;
        }

        var GP_Criteria = GPcrit.join(op);
        return GP_Criteria;
    },
    BoldLines: function() {
        var w = ($('#' + this.HTMLid).width());
        if (this.GetContainerType() != App.CONTAINER_TYPE_MIDDLE) {
            this.SetBorderFrameColor(this.GetColor(), w);
        }
        else {
            this.SetBorderFrameColor("#000", w);
        }
        this.IsActive();
        return;
        var obj = this;
        var resPoint = this.GetConnectedTo();

        if (resPoint) {
            if (obj.GetContainerType() != App.CONTAINER_TYPE_MIDDLE) {
                obj.ChangeFrameColor(obj.GetColor());
                Search.HightLightCriterion(obj.GetSearchBarUID(), obj.GetColor(), 1);
            }

            $(resPoint).each(function(k, v) {
                var c = Containers.get(v);
                var color;
                if (obj.GetContainerType() == App.CONTAINER_TYPE_MIDDLE) {
                    color = Containers.get(v).GetColor();
                }
                else {
                    color = obj.GetColor();
                }

                Search.HightLightCriterion(c.GetSearchBarUID(), color, 1);
                c.IsActive();
                c.BringToFront();
                c.ChangeFrameColor(color);
                drawLineBetweenContainers(obj.GetUID(), v, color, 4);
                c.clickarea.css({
                    'border': '2px solid ' + color
                });
                if (!c.LinesAreBold) {
                    c.clickarea.css({
                        'top': c.clickarea.position().top - 2,
                        'left': c.clickarea.position().left - 2
                    });
                }

                c.LinesAreBold = 1;
            });
        }
        this.HideNotConnectedGPs();
    },
    NormalLines: function() {
        var resPoint = this.GetConnectedTo();
        this.IsNotActive();
        this.RenewColors();
        if (this.GetContainerType() != App.CONTAINER_TYPE_MIDDLE && this.GetContainerType() != App.CONTAINER_TYPE_SYSTEM) {
            Search.HightLightCriterion(this.GetSearchBarUID(), this.GetColor(), 0);
        }



        if (resPoint) {
            $(resPoint).each(function(k, v) {
                var c = Containers.get(v);
                Search.HightLightCriterion(c.GetSearchBarUID(), c.GetColor(), 0);
                c.SendToBack();
                c.RenewColors();
                c.ShowNotConnectedGPs();

                if (c.LinesAreBold) {
                    c.clickarea.css({
                        'border': '',
                        'top': c.clickarea.position().top + 2,
                        'left': c.clickarea.position().left + 2
                    });
                }

                c.LinesAreBold = 0;

            });
            Grouping.Redraw();

        }
    },
    Group: function() {
        var resPoint = this.GetConnectedContainers();
        var requests;
        if (resPoint) {
            var containers = new Array();
            $(resPoint).each(function(k, v) {
                containers.push(Containers.get(v));
            });
            requests = ServerLoading.GenerateSearchRequest(containers);
        }
        else {
            requests = ServerLoading.GenerateSearchRequest(new Array(this));
        }

        ServerLoading.MakeRequest(1, requests);
    },
    ShowAllElements: function() {
        var items = this.Elements.arr();
        for (var a in items) {
            var item = items[a];
            item.Show();
        }
    },
    SelectAttribute: function(AttrUID) {
        if (this.SelectedAttributes.get(AttrUID)) {
            $('div[data-attrUID=' + AttrUID + ']').removeAttr('class');

            this.SelectedAttributes.remove(AttrUID);
        }
        else {
            $('div[data-attrUID=' + AttrUID + ']').addClass('is_selected');

            this.SelectedAttributes.add(GravityElements.get(AttrUID));
        }

        Search.SynchCriterion();
        this.UpdateAttributesList();
    },
    UpdateAttributesList: function() {
        var obj = this;
        var textbox = $('#container_' + this.GetUID() + ' .attrs');
        textbox.text('');
        var expr = new Array();
        $(this.SelectedAttributes.arr()).each(function(k, attr) {
            $('div[data-attrUID=' + attr.GetUID() + ']').addClass('is_selected');
            expr.push(attr.GetDisplayName());
        });
        return;
        var not = this.GetNot() ? 'NOT ' : '';
        textbox.text(not + expr.join(' ' + this.GetOperator().toUpperCase() + ' '));
        var expression = not + expr.join(' ' + this.GetOperator().toUpperCase() + ' ');
        var length = expression.length;
        if (length > 20) {
            expression = expression.substring(0, 20).concat('...');
        }
        textbox.text(expression);
    },
    CreateAttrMenu: function() {
        var data = this.menu;
        var c = this;
        var menu_id = c.AttrMenu;
        $("<ul>").attr('id', 'menu_' + menu_id).attr('class', 'sf-menu sf-vertical').appendTo("#" + menu_id + ' .attr_menu');
        var id = $(this).attr('id');
        $('#' + id).bind('mouseover', function() {
            $('#' + id).find("li").css("display", "block");
            $('#' + id).find("ul").css("display", "block");
        });
        var attr;
        var attr_fullid;
        var attr_name;
        for (var attr_lvl_1 in data) {
            var level1 = data[attr_lvl_1];
            attr = GravityElements.GetAttr(attr_lvl_1);
            GravityElements.add(attr);
            attr_fullid = 'attr_sub_menu_' + attr.GetUID() + c.GetUID();
            attr_name = attr.GetDisplayName();
            var menu1 = menu_id + attr.GetUID() + c.GetUID();
            c.AddMenuAttr(attr, attr_fullid, attr_name, menu1, 'menu_' + menu_id);
            for (var attr_lvl_2 in level1) {
                var level2 = level1[attr_lvl_2];
                attr = GravityElements.GetAttr(attr_lvl_2);
                GravityElements.add(attr);
                attr_fullid = 'attr_sub_menu_' + attr.GetUID() + c.GetUID();
                attr_name = attr.GetDisplayName();
                var menu2 = menu_id + attr.GetUID() + c.GetUID();
                c.AddMenuAttr(attr, attr_fullid, attr_name, menu2, menu1);
                for (var attr_lvl_3 in level2) {
                    var level3 = level2[attr_lvl_3];
                    attr = GravityElements.GetAttr(attr_lvl_3);
                    GravityElements.add(attr);
                    attr_fullid = 'attr_sub_menu_' + attr.GetUID() + c.GetUID();
                    attr_name = attr.GetDisplayName();
                    var menu3 = menu_id + attr.GetUID() + c.GetUID();
                    c.AddMenuAttr(attr, attr_fullid, attr_name, menu3, menu2);
                    for (var index_4 in level3) {
                        var attr_lvl_4 = level3[index_4];
                        attr = GravityElements.GetAttr(attr_lvl_4);
                        GravityElements.add(attr);
                        attr_fullid = 'attr_sub_menu_' + attr.GetUID() + c.GetUID();
                        attr_name = attr.GetDisplayName();
                        if (attr_name.trim()) {
                            $("<li>")
                                    .attr('id', attr_fullid)
                                    .append($('<a>')
                                    .attr('href', 'javascript:Containers.get("' + c.GetUID() + '").SelectAttribute("' + attr.GetUID() + '")')
                                    .text(attr_name))
                                    .appendTo('#' + menu3);
                        }
                    }
                }
            }
        }
    },
    AddMenuAttr: function(attr, attr_fullid, attr_name, menu_id, appendTo) {
        var c = this;
        if (attr_name.trim()) {
            $("<li>")
                    .attr('id', attr_fullid)
                    .append($('<a>')
                    .attr('href', 'javascript:Containers.get("' + c.GetUID() + '").SelectAttribute("' + attr.GetUID() + '")')
                    .text(attr_name))
                    .append($('<ul>')
                    .attr('id', menu_id))

                    .appendTo('#' + appendTo);
        }
    },
    SortAttributes: function() {
//        var attrs = this.GravityElements.arr().sort(function(a, b) {
//            if (a.gravity.name < b.gravity.name) {
//                return 1;
//            }
//            else if (a.gravity.name > b.gravity.name) {
//                return -1;
//            }
//            return 0;
//        });
//        delete this.GravityElements;
//        this.GravityElements = new Dictionary(attrs);

        var obj = this;
        var attrs = this.GravityElements.arr();

        $('#' + this.AttrListUID).find('div').remove();

        for (var a in attrs) {
            var attr = attrs[a];

            var attrHTMLUID = App.GetNewUID();

            $.tmpl('data_object_attr', {
                'UID': attrHTMLUID,
                'attrUID': attr.GetUID(),
                'attr': attr.GetDisplayName()
            }).appendTo('#' + obj.AttrListUID);

            $('#' + attrHTMLUID).on('click', function() {
                var attrUID = $(this).attr('data-attrUID');

                obj.SelectAttribute(attrUID);
            });
//            var attr = Events.AttrPointer(attrHTMLUID, attr.GetUID());
//
//            attr.bind('pointerclick', function() {
//                var attrUID = $(this).attr('data-attrUID');
//
//                obj.SelectAttribute(attrUID);
//            }).bind('dragend', function(event) {
//                var gp = Containers.CreateHTMLContainer(App.GetNewUID(), App.CONTAINER_TYPE_CHILD);
//                var attrs = obj.GetAttributes();
//                for (var a in attrs) {
//                    var attr = attrs[a];
//                    if (attr.main) {
//                        var uid = gp.AddAttrFromText(attr.GetDisplayName());
//                        if (uid) {
//                            gp.SelectAttribute(uid);
//                        }
//                    }
//                }
//                var uid = gp.AddAttrFromText(event.HTMLel.text());
//                if (uid) {
//                    gp.SelectAttribute(uid);
//                }
//                gp.Reposition(event.EndX, event.EndY + 30);
//                gp.LoadSuggestedAttrs();
//
//                event.HTMLel.removeAttr('left').removeAttr('top');
//            });
        }

        this.UpdateAttributesList();
    },
    ShowSumReport: function() {
        if (this.SumShown) {
            this.HideSum();
        }
        else {
            this.ShowSum();
        }
    },
    GetSum1: function() {
        var sum1 = 0;
        DEs = this.GetElements().arr();
        $(DEs).each(function(k, v) {
            if (v.num1) {
                sum1 += parseFloat(v.num1);
            }
        });
        return sum1;
    },
    GetSum2: function() {
        var sum2 = 0;
        DEs = this.GetElements().arr();
        $(DEs).each(function(k, v) {
            if (v.num2) {
                sum2 += parseFloat(v.num2);
            }
        });
        return sum2;
    },
    HideSum: function() {
        $('#' + this.HTMLid + ' .sum').html('');
        this.SumShown = 0;
    },
    ShowSum: function() {
        Report.ShowSumReport(this);
        this.SumShown = 1;
    },
    BringToFront: function() {
        this.clickarea.css({
            'z-index': 8
        });
        this.HTMLel.find('.elements').css({
            'z-index': 5
        });
    },
    SendToBack: function() {
        this.clickarea.css({
            'z-index': 6
        });
        this.HTMLel.find('.elements').css({
            'z-index': 4
        });
    },
    ShowFrame: function(show) {
        this.BringToFront();
        $('#horizon').css({
            'z-index': 3
        });

        Render.Add('#buttons_' + this.HTMLid, 'show');
        Render.Add('#container_frame_' + this.HTMLid, 'show');
        Render.Add('#resize_' + this.HTMLid, 'show');
        Render.Add(this.HTMLel.find('.elements'), 'show');

        return;
        if (show) {
            this.FrameShown = 1;
        }
        if (!this.FrameShown) {
            return;
        }

        if (GravityTrap.GetContainers().get(this.GetUID())) {
            GravityTrap.RepositionContainers(this.GetUID());
        }
        if (FeedPanel.GetContainersPanel() && FeedPanel.GetContainersPanel().GetContainers().get(this.GetUID())) {
            FeedPanel.RepositionContainers(this.GetUID());
        }

        if (this.ShowOnlyFirstRow) {
            this.ShowMainElements();
        }

        if (this.FrameTimer) {
            clearInterval(this.FrameTimer);
        }

        this.ShowExpandButtons();
    },
    HideFrame: function() {
        var obj = this;

        Render.Add('#buttons_' + obj.HTMLid, 'hide');
        Render.Add('#container_frame_' + obj.HTMLid, 'hide');
        Render.Add('#resize_' + obj.HTMLid, 'hide');

        return;
        obj.FrameTimer = setTimeout(function() {
            obj.FrameShown = 0;
            obj.SendToBack();
            $('#horizon').css({
                'z-index': 10
            });
            $('#buttons_' + obj.HTMLid).hide();
            $('#container_frame_' + obj.HTMLid).hide();
            $('#resize_' + obj.HTMLid).hide();
            if (obj.ShowOnlyFirstRow) {
                obj.ShowFirstRowElements();
                obj.HideExpandButtons();
            }

// da se oprai tva GravityTrap &&
            if ((GravityTrap) && (GravityTrap.GetContainers().get(obj.GetUID()))) {
                GravityTrap.RepositionContainers();
            }

            clearInterval(obj.FrameTimer);
            obj.FrameTimer = 0;
        }
        , 100);
    },
    SetShowFristRowElements: function(val) {
        this.ShowOnlyFirstRow = val;
    },
    ShowFirstRowElements: function() {
        var cols = this.GetElementsColumns();
        var DEs = this.Elements.arr();
        this.SortObjects(DEs);
        var count = 0;
        for (var a in DEs) {
            var DE = DEs[a];
            count++;
            if (count > cols) {
                DE.Hide();
            }
        }
    },
    ShowMainElements: function() {
        var items_count = this.GetElementsColumns() * this.GetElementsRows();
        var DEs = this.Elements.arr();
        this.SortObjects(DEs);
        var count = 0;
        for (var a in DEs) {
            var DE = DEs[a];
            if (count < items_count) {
                DE.Show();
            }

            count++;
        }
    },
    HideExpandButtons: function() {
        $('#container_show_' + this.GetUID() + ', #container_hide_' + this.GetUID()).hide();
    },
    ShowExpandButtons: function() {
        $('#container_show_' + this.GetUID()).show();
    },
    GetNot: function() {
        return $('#operatornot_' + this.GetUID()).is(':checked');
    },
    GetOperator: function() {
        return 'and';
    },
    SetOperator: function(operator) {
        $('#' + this.HTMLid + ' input:radio[value="' + operator + '"]').attr('checked', 'checked');
        this.RefreshExpression();
        this.UpdateAttributesList();
        Search.SynchCriterion();
    },
    SetExpression: function(attrs) {
        $('#attrs_' + this.HTMLid).text(attrs);
    },
    GetExpression: function() {
        var expr = $('#attrs_' + this.HTMLid).text();
        if (!expr) {
            expr = '';
        }

        return expr;
    },
    GetColor: function() {
        return this.BorderColor;
    },
    RefreshExpression: function() {
        var ContainerUID = this.GetUID();
        var points = Grouping.points.arr();
        for (var a in points) {
            var point = points[a];
            if (point.ContainerUID == ContainerUID) {
                point.Operator = $('#container_' + ContainerUID + ' input:radio:checked').attr('value');
            }
        }
    },
    SetWorkspace: function(workspace) {
        this.workspace = workspace;
    },
    GetWorkspace: function() {
        return this.workspace;
    },
    StartMovement: function() {
        Grouping.StartMovement(this.GetWorkspace());
    },
    ChangeColors: function(inner, outer, border, attributes) {
        this.InnerColor = inner;
        this.OuterColor = outer;
        this.BorderColor = border;
        this.AttributesColor = attributes;
        this.RenewColors();
    },
    RenewColors: function() {
        $('#clickarea_' + this.HTMLid).css({
            'background-color': this.InnerColor,
            'color': this.OuterColor
        });
        if (this.ContainerType == App.CONTAINER_TYPE_MIDDLE) {
            this.HTMLel.find('.el_count').css({
                'border': '2px solid #000',
                'background': '#fff',
                'color': '#000'
            });
        }
        if (this.ContainerType == App.CONTAINER_TYPE_INPUT) {
            this.HTMLel.find('.el_count').css({
                'border': '2px solid #e4e5e4',
                'background': '#fff',
                'color': '#e4e5e4'
            });
            this.UpdateElementsCount();
        }
        else {
            this.HTMLel.find('.el_count').css({
                'border': '2px solid' + this.AttributesColor,
                'background': '#fff',
                'color': this.AttributesColor
            });
        }

        $('#attrs_' + this.HTMLid).css({
            'color': this.AttributesColor
        });
        $('#container_show_' + this.GetUID() + ', #container_hide_' + this.GetUID()).css({
            'color': this.BorderColor
        });
        var DE = this.Elements.arr();
        for (var a in DE) {
            var DataEl = DE[a];
            $('#' + DataEl.HTMLid).find('img').css({
                'border': "1px solid " + this.BorderColor
            });
        }
    },
    SetResultPoint: function(UID) {
        this.ResultPointContainers = UID;
    },
    GetResultPointUID: function() {
        return this.ResultPointContainers;
    },
    Resize: function(w, h, fix) {
        var normal = 1;
        if (w < 370) {
            w = 370;
            normal = 2;
        }
        if (h < 186) {
            h = 186;
            if (normal == 2) {
                normal = 4;
            }
            else {
                normal = 3;
            }
        }

        this.HTMLel.width(w);
        this.HTMLel.height(h);
        this.HTMLel.find('.container_frame').width(w);
        this.HTMLel.find('.attrs').width(w - 33);
        this.HTMLel.find('.container_frame').height(h - this.HTMLel.find('.sum').height());
        this.HTMLel.find('.elements').width(w - 30);
        this.HTMLel.find('.elements').height(h - 40);

        this.HTMLel.find('.sum').css({
            'right': w + 13 + 'px'
        });

        this.w = w;
        this.h = h

        return normal;
    },
    GetElementsColumns: function() {
        var item_width = 30;
        var margin = 3;
        var w = Math.floor(this.GetElementsFrameWidth() / (item_width + margin));
        return w;
    },
    GetElementsRows: function() {
        var item_width = 30;
        var margin = 3;
        var h = Math.floor(this.GetElementsFrameHeight() / (item_width + margin));
        return h;
    },
    ResizePredef: function(columns, rows) {
        this.Resize(columns * 42 - 50, rows * 42 - 10);
    },
    Resize9x6: function() {
        this.ResizePredef(9, 6);
        this.Arrange();
    },
    Resize3x3: function() {
        this.ResizePredef(3, 3);
        this.Arrange();
    },
    ShowHide: function() {
        if (this.Hidden) {
            this.Show();
            return 1;
        }
        else {
            this.Hide();
            return 0;
        }
    },
    IsHidden: function() {
        return this.Hidden;
    },
    Close: function() {
        if (this.IsTrapped()) {
            GravityTrap.RemoveTrappedContainer(this);
        }

        this.Hide();
        this.IsMoved = 0;
    },
    Show: function() {
        this.Hidden = 0;
        this.HTMLel.show();
        this.clickarea.show();
    },
    DeselectAttributes: function() {
        var attrs = this.SelectedAttributes.arr();
        for (var a in attrs)
        {
            var attr = attrs[a];
            this.SelectAttribute(attr.GetUID());
        }
    },
    Hide: function() {
        this.Hidden = 1;
        this.DeselectAttributes();
        this.Release();
        $("#container_show_" + this.GetUID()).remove();
        $("#container_hide_" + this.GetUID()).remove();
        this.HTMLel.hide();
        this.clickarea.hide();
        if (Search)
            Search.SynchCriterion();
        Grouping.Redraw();
    },
    Destroy: function() {
        this.NormalLines();
        this.Hide();
        $("#container_show_" + this.GetUID()).remove();
        $("#container_hide_" + this.GetUID()).remove();
        this.HTMLel.remove();
        this.clickarea.remove();
        Containers.remove(this.GetUID());
        Grouping.RemoveContainerFromRPM(this.GetUID());
        Grouping.Redraw();
    },
    DisableButton: function(button) {
        switch (button) {
            case 'close':
                $('#container_close_container_' + this.GetUID()).css({
                    visibility: 'hidden'
                });
                break;
            case 'group':
                $('#spyglass_' + this.AttrMenu).css({
                    visibility: "hidden"
                });
                break;
        }
    },
    // trqbva da priema masiv sys skorosti
    GroupElements: function(DEs, speed) {
        if (!DEs.length) {
            console.log('Cant group empty array of elements in container: ' + this.GetUID());
            return null;
        }

        var GroupingElementsPromisses = new Array();
        for (var a in DEs) {
            var DE = DEs[a];
            var deferred = this.GroupElement(DE, speed);
            GroupingElementsPromisses.push(deferred.promise());
        }

        var chain = new EventChain(GroupingElementsPromisses, 'ContainerArrange', this);
        return chain;
    },
    Release: function() {
        var DEs = this.Elements.arr();
        if (DEs.length) {
            var list = Containers.get('list');
            var listSouth = Containers.get('list_south');
            var passive = new Array();
            var passiveSouth = new Array();
            for (var a in DEs) {
                var DO = DEs[a];
                switch (DO.GetWorkspace()) {
                    case 1:
                        passive.push(DO);
                        break;
                    case 2:
                        passiveSouth.push(DO);
                        break;
                }
            }

            if (passive.length) {
                list.Show();
                list.GroupElements(passive, 5);
            }
            if (passiveSouth.length) {
                listSouth.Show();
                listSouth.GroupElements(passiveSouth, 5);
            }

            delete this.Elements;
            this.Elements = new Dictionary(new Array());
        }

        $("#container_show_" + this.GetUID()).remove();
        $("#container_hide_" + this.GetUID()).remove();
    },
    Reposition: function(x, y) {
        x = parseInt(x);
        y = parseInt(y);

        Render.Add('#' + this.GetContainerID(), 'position', {'left': x, 'top': y});
        Render.Add('#' + this.clickarea.attr('id'), 'position', {'left': x, 'top': y});

        this.x = x;
        this.y = y;
    },
    GetContainerID: function() {
        return this.HTMLid;
    },
    IsInCoordinates: function(x, y) {
        if (x - this.x > 0 && x - this.x < this.w && y - this.y > 0 && y - this.y < this.h) {
            return 1;
        }

        return 0;
    },
    CollidesWith: function(container) {
        var x = container.x;
        var y = container.y;
        if (x - this.x > 0 && x - this.x < this.w && y - this.y > 0 && y - this.y < this.h) {
            return 1;
        }

        return 0;
    },
    DestroyElements: function() {
        var obj = this;
        var items = obj.Elements.arr();
        $(items).each(function(k, DE) {
            obj.RemoveElement(DE);
            Events.objects.set(DE.GetUID(), 0);
            FeedPanel.UpdateFeedsInfo(DE.feed_id, '', -1);
            DE.HTMLel.remove();
            DataElements.remove(DE.GetUID());
        });
        Horizon.CreateHorizonMenu();
        $('#touch_tooltip_box, #mouse_tooltip_box').remove();
    }
});