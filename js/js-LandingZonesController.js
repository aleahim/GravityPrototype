var LandingZonesController = Class.extend({
    init: function() {
        this.zones = new goog.structs.Map;
    },

    AddZone: function(id, type, top, right, bottom, left, checkFunction, context) {
        var zone = new Object();

        zone.HTMLel = $(id);
        zone.type = type;
        zone.left = left;
        zone.right = right;
        zone.top = top;
        zone.bottom = bottom;
        zone.checkFunction = checkFunction;
        zone.context = context;

        this.zones.set(id, zone);
    },

    RemoveZone: function(id) {
        this.zones.remove(id);
    },

    CheckZones: function(item, x, y) {
        var active = false;

        var zones = this.zones.getValues();

        for(var i in zones) {
            var zone = zones[i];

            var validType = false;

            for(var a in zone.type) {
                var type = zone.type[a];

                if (item instanceof type) {
                    validType = true;
                    break;
                }
            }

            if (!validType) {
                continue;
            }

            if (zone.checkFunction && zone.context) {
                if (!zone.checkFunction.call(zone.context, item)) {
                    continue;
                }
            }

            var pos = zone.HTMLel.position(),
            right,
            bottom;

            var box_x = pos.left - zone.left;
            var box_y = pos.top - zone.top;

            if (zone.right == 'width') {
                right = zone.HTMLel.width();
            }
            else {
                right = zone.right;
            }
            if (zone.bottom == 'height') {
                bottom = zone.HTMLel.height();
            }
            else {
                bottom = zone.bottom;
            }
            
            var box_x_end = box_x + right;
            var box_y_end = box_y + bottom;

            if (x > box_x && x < box_x_end && y > box_y && y < box_y_end) {
                active = true;
            }
        }

        if (active) {
            item.IsActive();
        }
        else {
            item.IsNotActive();
        }
    }
});