var DataElementsController = Controller.extend({
    init: function(selector) {
	this._super(selector, 'DataElement');

	this.IDsMap = new goog.structs.Map;
	this.LoadedDOs = new Array();

	this.LabelVisibility = 0;

	EventsController.Add('#page', 'mouseover', ".img_container", this.MouseoverHandler);
	EventsController.Add('#page', 'mousemove', ".img_container", this.MoveHandler);
	EventsController.Add('#page', 'mouseout', ".img_container", this.MouseoutHandler);

    },
    MouseoverHandler: function(event) {
	var UID = $(event.currentTarget).attr("id");

	var DE = DataElements.get(UID);
	DE.CreateTooltip();
    },
    MoveHandler: function(event) {
	var UID = $(event.currentTarget).attr("id");

	var DE = DataElements.get(UID);

    },
    MouseoutHandler: function(event) {
	var UID = $(event.currentTarget).attr("id");

	var DE = DataElements.get(UID);
	DE.CreateTooltip();
    },
    CreateDataObject: function(DO, x, y) {
	if (this.LoadedDOs.indexOf(DO.data.data_xml_item_id) > -1) {
	    throw "Data Object already loaded.";
	}

	this.LoadedDOs.push(DO.data.data_xml_item_id);

	var feed = FeedElements.GetByDBid(DO.data.data_xml_feed_id);

	if (!feed) {
	    throw "Invalid feed ID. " + DO.data.data_xml_feed_id;
	}

	var UID = App.GetNewUID();

	var boxtpl = $.tmpl('data_object_box', {
	    "UID": UID
	});

	var attrListUID = App.GetNewUID();

	$.tmpl('data_object_attrs_list', {
	    'UID': attrListUID
	}).appendTo(boxtpl);

	var x = $('<span>');

	x.html(DO.data.title);
	var main_img_alt = x.html();

	var urlstr = /:\/\/(.[^/]+)/;
	urlstr = urlstr.exec(DO.data.url);
	if (urlstr && urlstr[1])
	    urlstr = urlstr[1];
	else
	    urlstr = DO.data.url;
	url_title = urlstr;
	x.html(url_title);
	var url_title = x.html();

	x.html(feed.GetTitle());
	var feed_label_alt = x.html();

	var MOVEUID = App.GetNewUID();

	$.tmpl('data_object_vis_icon', {
	    'MOVEUID': MOVEUID,
	    'main_img_src': DO.data.image,
	    'main_img_alt': main_img_alt,
	    'feed_label_src': feed.GetImage(),
	    'feed_label_alt': feed_label_alt,
	    'title': main_img_alt,
	    'url': DO.data.url,
	    'url_title': url_title
	}).appendTo(boxtpl);

	DOM.Add(boxtpl, MOVEUID, UID, x, y);

	var DE = new DataElement(UID, MOVEUID, attrListUID, feed, DO);

	this.add(DE);

	this.IDsMap.set(DO.data.data_xml_item_id, UID);

	return DE;
    },
    ToggleFeedLabels: function() {
	var obj = this;

	if (obj.LabelsVisibility) {
	    $(obj.arr()).each(function(k, v) {
		v.HTMLel.find('.feed_label').hide();
	    });
	    obj.LabelsVisibility = 0;
	}
	else {
	    $(obj.arr()).each(function(k, v) {
		v.HTMLel.find('.feed_label').show();
	    });
	    obj.LabelsVisibility = 1;
	}
    },
    search: function(group, group_value) {
	var obj = this;
	var found = new Array;

	for (i in obj.elements) {
	    var el = obj.elements[i].value;

	    if (Containers.findByItem(el) && el.moving == 0) {
		continue;
	    }

	    for (n in el.categories) {
		var categories = el.categories[n];
		for (k in categories.elements) {
		    var gravity = categories.elements[k];

		    if (gravity.group == group && gravity.value == group_value) {
			found[found.length] = el;
		    }
		}
	    }
	}

	return new Dictionary(found);
    },
    FindByGravity: function(GravityUID) {
	var all = new Dictionary(new Array());

	var elements = this.GetAsArray();

	for (a in elements) {
	    var element = elements[a];

	    var elementGravities = element.gravity.GetAsArray();

	    for (k in elementGravities) {
		var elementGravity = elementGravities[k];

		if (GravityUID == elementGravity.GetUID()) {
		    all.add(element);

		}
	    }
	}

	return all;
    },
    FindByUID: function(UID) {
	var elements = this.GetAsArray();
	for (var i in elements)
	{
	    var ElementUid = elements[i].GetUID();
	    if (ElementUid == UID)
	    {
		return elements[i];
	    }
	}
    }
});