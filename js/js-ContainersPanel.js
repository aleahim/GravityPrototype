var ContainersPanel = VisualObjectOld.extend({
    init: function(HTMLid, template, data) {
        this._super(HTMLid);

        this.ChangeTemplate(template, data);

        this.Containers = new Dictionary(new Array());
    },

    GetContainers: function() {
        return this.Containers;
    },
    
    AddContainer: function(c) {
        c.BlockFromGrouping();
        
        this.Containers.add(c);

        this.RepositionContainers();
        
        Grouping.Redraw();
    },

    RemoveContainer: function(c) {
        c.AllowGrouping();

        this.Containers.remove(c.GetUID());

        this.RepositionContainers();
    },

    RepositionContainers: function(ContainerUID) {
        var containers = this.Containers.arr();

        var expandNext = 0;

        for (var i in containers) {
            var c = containers[i];

            var x = this.HTMLel.position().left + 4;
            var y = 60 + i * 75;

            if (expandNext) {
                y += 120;
            }

            if (ContainerUID == c.GetUID()) {
                expandNext = 1;
            }

            c.Reposition(x, y);
        }

        if (expandNext) {
            expandNext = 120;
        }

//        this.HTMLel.css({
//            height: this.Containers.count() * 75 + expandNext + 20
//        });
    },

    IsDropped: function(x, y, item) {
        if (this.IsInContainerPanel(x, y)) {
            this.onEnter(item);
            
            return true;
        }
        
        return false;
    },

    onEnter: function(item) {
        if (item instanceof Container) {
            this.AddContainer(item);
        }

        item.IsNotActive();
    },

    onLeave: function(item) {
        if (item instanceof Container) {
            this.RemoveContainer(item);
        }

        this.ChangeColor('outside');
    },

    IsInContainerPanel: function(x, y) {
        var box_x = this.HTMLel.position().left;
        var box_y = this.HTMLel.position().top;
        var box_x_end = box_x + this.HTMLel.width();
        var box_y_end = box_y + this.HTMLel.height();

        if (x > box_x && x < box_x_end && y > box_y && y < box_y_end) {
            return true;
        }

        return false;
    },

    CheckPanel: function(item, x, y) {
        if (this.IsInContainerPanel(x, y)) {
            item.IsActive();
            //this.ChangeColor('inside');
        }
        else {
            item.IsNotActive();
            //this.ChangeColor('outside');
        }
    },

    ChangeColor: function(type) {
        switch(type) {
            case 'inside':
                this.HTMLel.css({
                    backgroundColor: '#CB540A'
                });
                break;
            case 'outside':
                this.HTMLel.css({
                    backgroundColor: '#F2F2F2'
                });
                break;
        }
    }
});