var GravityElementsController = Controller.extend({
    init: function() {
        var obj = this;

        obj._super('', 'GravityElement');

        $("category").each(function() {
            if ($(this).attr('name') == 'system') {
                return;
            }
            var category = new GeneralObject($(this).attr('uid'), $(this).attr('name'), $(this).attr('type'), $(this).attr('value'));

            $(this).find('group').each(function() {
                var group = new GeneralObject($(this).attr('uid'), $(this).attr('name'), $(this).attr('type'), $(this).attr('value'));

                $(this).find('gravity').each(function() {
                    var gravity = new GeneralObject($(this).attr('uid'), $(this).attr('name'), $(this).attr('type'), $(this).attr('value'));

                    obj.add(new GravityElement(category, group, gravity));
                });
            });
        });
    },
    
    GetAttribute: function(type, name, value) {
        name = this.FixAttr(name);

        var attr = new GravityElement(
            new GeneralObject(type, type, 'category', type),
            new GeneralObject(type, type, 'group', type),
            new GeneralObject(name, name, 'gravity', value)
            );

        return attr;
    },
    
    GetAttr: function(attr_name) {
        attr_name = this.FixAttr(attr_name);

        var attr = new GravityElement(
            new GeneralObject('general', 'general', 'category', 'general'),
            new GeneralObject('general', 'general', 'group', 'general'),
            new GeneralObject(attr_name, attr_name, 'gravity', 1)
            );

        return attr;
    },

    FixAttr: function(attr) {
        attr = $.trim(attr);
        attr = attr.replace('/[^А-Яа-яA-Za-z0-9\- ]/iug', '');
        attr = attr.toLowerCase();
        attr = attr.split('-').join(' ');
        attr = attr.split('/').join(' ');
        attr = attr.split('.').join('');
        attr = attr.replace('/\s+/g', ' ');
        attr = $.trim(attr);

        attr = attr.split(' ').join('_');
    
        return attr;
    }
});
