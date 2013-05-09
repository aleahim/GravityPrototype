var GeneralObject = Class.extend({
    init: function(UID, name, type, value) {
        this.UID = UID;
        
        this.name = name;
        this.type = type;
        this.value = value;
    },

    GetUID: function() {
        return this.UID;
    }
});

var GravityElement = Class.extend({
    init: function (category, group, gravity) {
        this.category = category;
        this.group = group;
        this.gravity = gravity;
    },

    GetUID: function() {
        return this.category.GetUID() + this.group.GetUID() + this.gravity.GetUID();
    },
    
    GetSearchUID: function() {
        return this.gravity.GetUID().toLowerCase();
    },
    
    GetDisplayName: function() {
        var str = this.gravity.name.replace(/_/g, ' ');
        str = str.replace(/\w*/g, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1).toUpperCase();
        });        
        return str;
    },
    
    GetType: function() {
        return this.category.name;
    },
    
    GetName: function() {
        return this.gravity.name;
    },
    
    GetValue: function() {
        return this.gravity.value;
    }
});