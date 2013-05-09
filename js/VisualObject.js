var VisualObject = Class.extend({
    init: function(tplBox, tplData, position) {
	this.tplBox = tplBox;
	this.tplData = tplData;
	this.position = position;

	this.boxID = App.GetNewUID();

	var tplCont = $.tmpl('vis_box', {
	    "UID": this.boxID
	});
	var page = $('#page');
	Render.Add(tplCont, 'appendTo', page);

	var template = $.tmpl(tplBox, this.tplData);
	var cont = $('#' + this.boxID);
	Render.Add(template, 'appendTo', cont);

	this.children = new goog.structs.Map;

    },
    GetUID: function() {
	return this.boxID;
    },
    Reposition: function(position) {
	if (position) {
	    var obj = this;
	    console.log(obj);
	}
	else {
	    console.log();
	    return;
	}
    },
    Hide: function() {
	Render.Add("#" + this.boxID, 'hide');
    },
    Show: function() {
	console.log("show!");
	Render.Add("#" + this.boxID, 'show');
    },
    Add: function(name, tpl, tplData) {
	var UID = App.GetNewUID();

	tplData.id = UID;

	var tmpl = $.tmpl(tpl, tplData);
	var cont = $('#' + this.boxID);

	Render.Add(tmpl, 'appendTo', cont);
	this.children.set(name, UID);
    },
    Remove: function(name) {
	var id = this.children.get(name);
	Render.Add("#" + id, 'remove');
    },
    Refresh: function(name, tplData) {
	var id = this.children.get(name);
	Render.Add("#" + id, 'remove');

	tplData.id = id;

	var tmpl = $.tmpl(this.tplBox, tplData);
	var cont = $('#' + this.boxID);

	Render.Add(tmpl, 'appendTo', cont);
	this.children.set(name, id);
    },
    Empty: function() {
	Render.Add("#" + this.boxID, 'empty');
    },
    Destroy: function() {
	Render.Add("#" + this.boxID, 'remove');
    }
});