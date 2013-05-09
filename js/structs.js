var omMap = Class.extend({
    init: function() {
	this.map = new goog.structs.Map;
    },
    initMap: function(type) {
	this.map.set(type, new Array());
    },
    getMap: function() {
	return this.map.toObject();
    },
    add: function(key, value) {
	var map = this.map.get(key);

	if (map) {
	    map.push(value);
	}
	else {
	    this.initMap(key);
	    this.add(key, value);
	}
    },
    get: function(key) {
	var map = this.map.get(key);

	if (map) {
	    return map;
	} else {
	    throw "Invalid category!";
	}
    }
});