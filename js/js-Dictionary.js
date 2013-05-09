var Dictionary = Class.extend({
    init: function(elements) {
        this.map = new goog.structs.Map;

        for (var i in elements) {
            this.add(elements[i]);
        }
    },

    del: function del(i) {
        
        delete this.elements[i].value;
        delete this.elements[i];

        this.elements.splice(i, 1);
    },

    get: function(key) {
        return this.map.get(key);
    },
    
    count: function() {
        return this.map.getCount();
    },

    add: function(value) {
        this.map.set(value.GetUID(), value);

        return value;
    },

    remove: function(key) {
        this.map.remove(key);
    },

    merge: function(dictionary) {
        var arr = dictionary.GetAsArray();

        for (var a in arr) {
            var el = arr[a];

            this.add(el);
        }
    },

    GetAsArray: function() {
        return this.map.getValues();
    },
    
    arr: function() {
        return this.map.getValues();
    },

    GetSelector: function() {
        var selector = new Array();
        var items = this.GetAsArray();
        
        $(items).each(function(k, v) {
            selector.push('#'+v.GetUID());
        });
        
        return selector.join(',');
    }
});