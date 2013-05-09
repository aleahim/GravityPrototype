var VisualObjectOld = Class.extend({
    init: function(HTMLid) {
        this.HTMLid = HTMLid;
    },

    ChangeTemplate: function(tpl, data) {
        if (this.HTMLel && this.HTMLel.length) {
            this.HTMLel.remove();
        }

        $.tmpl(tpl, data).appendTo('#page');

        this.HTMLel = $(this.HTMLid);
    },

    AppendChildTPL: function(tpl, data) {
        $.tmpl(tpl, data).appendTo(this.HTMLid);
    },

    AppendChild: function(obj) {
        obj.appendTo(this.HTMLid);
    },

    GetHTMLid: function() {
        return this.HTMLid;
    },

    GetTextHTMLid: function() {
        return this.GetHTMLid().replace('#', '');
    },

    GetHTMLel: function() {
        return this.HTMLel;
    },

    GetX: function() {
        return this.HTMLel.position().left;
    },

    GetY: function() {
        return this.HTMLel.position().top;
    }
});