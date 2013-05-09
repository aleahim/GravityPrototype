var GravityTrapController = ContainersPanel.extend({
    init: function() {
        this._super('#gravity_trap', 'gravity_trap', {});
        
        this.ContainerTrap = Containers.get('gravity_trap');

        this.AddContainer(this.ContainerTrap);

        this.RepositionContainers();

        LandingZones.AddZone('#gravity_trap', [DataElement, HTMLContainer], 0, 'width', 'height', 20);
    },

    GetTrappedElements: function() {
        var containers = this.Containers.arr();
            
        var items = new Dictionary(new Array());
    
        for (var i in containers) {
            var c = containers[i];
        
            items.merge(c.GetElements());
        }
    
        return items.arr();
    },
    
    AddContainer: function(c) {
        c.SetTrapped(true);
        
        this._super(c);
    },
    
    AddTrappedElement: function(DE) {
        if (DE.IsInContainer()) {
            DE.GetCurrentContainer().RemoveElement(DE);
        }
        
        this.ContainerTrap.AddElement(DE);

        if (!this.ContainerTrap.IsTrapped()) {
            this.ContainerTrap.SetTrapped(true);
        }
        
        if (this.ContainerTrap.IsHidden()) {
            this.ContainerTrap.Show();
            this.AddContainer(this.ContainerTrap);
            this.ContainerTrap.SetTrapped(true);
        }

        this.ContainerTrap.Arrange();
    },

    onEnter: function(item) {
        if (item instanceof DataElement) {
            this.AddTrappedElement(item);
        }
        else if (item instanceof Container) {
            item.SetTrapped(true);
        }

        this._super(item);
    },

    onLeave: function(item) {
        if (item instanceof DataElement) {
            this.RemoveTrappedElement(item);
        }
        else if (item instanceof Container) {
            item.SetTrapped(false);
        }

        this._super(item);
    }
});