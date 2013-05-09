var Controller = Dictionary.extend({
    init: function(selector, className) {
        var obj = this;

        obj._super(new Array);

        $(selector).each(function() {
            obj.add(new window[className]($(this).attr('id')));
        });
    }
});