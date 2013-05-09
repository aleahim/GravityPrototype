var Carousel = VisualObjectOld.extend({
    init: function(HTMLid, template, showCount) {
        this._super(HTMLid);

        this.ChangeTemplate(template, {});

        this.Container = new VisualObjectOld(HTMLid+'_container');

        this.Container.ChangeTemplate('carousel_container', {
            'id' : this.GetTextHTMLid()+'_container'
        });

        var obj = this;

        obj.panel_items = new Array();
        obj.panel_first = 0;
        obj.panel_show = showCount;

        var ADid = this.GetTextHTMLid()+'_AD';
        var AUid = this.GetTextHTMLid()+'_AU';

        this.AppendChildTPL('arrow_up', {
            'id' : AUid
        });

        this.Container.HTMLel.appendTo(HTMLid);
        this.HTMLel.css({
            'height' : obj.panel_show * (50+20) + 50
        });

        this.AppendChildTPL('arrow_down', {
            'id' : ADid
        });

        $('#'+ADid).click(function() {
            obj.panel_first++;
            if (obj.panel_first == obj.panel_items.length) {
                obj.panel_first = 0;
            }
            
            obj.ShowActive();
        });

        $('#'+AUid).click(function() {
            obj.panel_first--;
            if (obj.panel_first == -1) {
                obj.panel_first = obj.panel_items.length-1;
            }

            obj.ShowActive();
        });
    },

    GetContainer: function() {
        return this.Container;
    },
    
    AddElement: function(obj, template, data) {
        this.GetContainer().AppendChildTPL(template, data);

        if (obj) {
            App.MasterObjectsMap.set(obj.GetUID(), obj);
            
            this.panel_items.push(obj.GetUID());
        }
    },

    RemoveElement: function(obj) {
        var all = this.panel_items;

        for (var a in all) {
            var item = all[a];

            if (item == obj.GetUID()) {
                this.panel_items.splice(a, 1);
            }
        }

        if (this.panel_items.length == 0) {
            this.HTMLel.hide();
        }
        else {
            this.ShowActive();
        }
    },

    GetElementUID: function(obj) {
        return this.GetTextHTMLid() + obj.GetUID();
    },

    ShowActive: function() {
        if (!this.panel_items.length) {
            return;
        }
        
        var x = 0;
        var y = 10;

        this.GetContainer().GetHTMLel().find('img, span').css({
            'display' : 'none'
        });
        this.GetContainer().GetHTMLel().find('div').css({
            'left' : -2000
        });
        
        var id = this.panel_first - 1;

        for (var i = 0; i < this.panel_show; i++) {
            if (id == this.panel_items.length - 1) {
                id = 0;
            }
            else {
                id++;
            }

            var obj = App.MasterObjectsMap.get(this.panel_items[id]);

            var y_offset = (50+20)*i;

            var brick = $('#'+this.GetElementUID(obj));

            brick.css({
                "left":x,
                "top":y + y_offset,
                "display":"block"
            });
            brick.find('img').css({
                'left': 0,
                'top' : 0
            });
            brick.find('*').css({
                "display":"block"
            });

            obj.LoadX = x + 70;
            obj.LoadY = y + y_offset + 80 + 15;
        }
    }
});