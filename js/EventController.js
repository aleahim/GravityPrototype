var EventController = Class.extend({
    init: function() {

    },
    Add: function(parent, event, selector, callback) {
	$(parent).on( event, selector, callback);
    }
});

