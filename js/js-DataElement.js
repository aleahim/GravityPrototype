var Attribute = Class.extend({
    init: function(type, name, value) {
	this.UID = App.GetNewUID();

	this.type = type;
	this.name = name;
	this.value = value;
    }
});
var DataElement = Class.extend({
    init: function(UID, MOVEUID, attrsListUID, feed, DO) {
	var obj = this;

	obj.UID = UID;
	obj.attrsListUID = attrsListUID;
	obj.feed = feed;
	obj.DO = DO;
	obj.DBid = DO.data.data_xml_item_id;

	obj.HTMLid = obj.UID;
	obj.GroupingContainer = null;
	obj.CurrentlyInContainer = null;
	obj.workspace = 1;
	obj.GroupingMove = 0;
	obj.ContainerCreated = 0;
	obj.attrsListVisible = 0;

	obj.gravity = new Dictionary(new Array());
	obj.gravity_sys = new Dictionary(new Array());

	for (var a in DO.attrs) {
	    var attr_data = DO.attrs[a];

	    var attr = GravityElements.GetAttribute(attr_data.attr_type, attr_data.attr_name, attr_data.attr_value);

	    if (attr_data.attr_type === 'general') {
		obj.gravity.add(attr);
	    }
	    else {
		switch (attr_data.attr_name) {
		    case 'date':
			obj.date = attr_data.attr_value;

			obj.date = obj.date.split('/').join('-');
			break;
		    case 'num1':
			obj.num1 = attr_data.attr_value;

			break;
		    case 'num2':
			obj.num2 = attr_data.attr_value;

			break;
		    default:
		}

		obj.gravity_sys.add(attr);
	    }
	}

	obj.image = DO.data.image;

	App.ImageLoader.addImage(obj.UID, obj.image);

	obj.type = DO.data.type;
	obj.title = DO.data.title;
	obj.fullurl = DO.data.url;
	var urlstr = /url=(http(s?):\/\/.*?)\//;
	urlstr = urlstr.exec(obj.fullurl);
	if (urlstr && urlstr[1])
	    urlstr = urlstr[1];
	else
	    urlstr = obj.fullurl;
	obj.url = urlstr;

	obj.SetTooltipType(obj.feed);

	//obj.ImageSize('small');
    },
    Tooltip: function() {
	
    },
    CreateTooltip: function() {
	var obj = this;
	var text = '';
	var attrs = obj.gravity.arr();
	for (var a in attrs) {
	    var attr = attrs[a];

	    text += '<div>' + attr.GetDisplayName() + ' <span>' + attr.GetValue() + '</span></div>';
	}
	obj.content_text = text;
	obj.content_date = obj.date;

	var data = {
	    "tooltip_class": "element_tooltip",
	    "src": obj.image,
	    "urlstr": obj.url,
	    "info_title": obj.title,
	    "feed_image": obj.feed.GetImage(),
	    "feed": obj.feed.GetTitle(),
	    "date": obj.content_date
	};

	var position = {
	    "type": "static",
	    "offsetX": "80",
	    "offsetY": "150"
	};

	obj.Tooltip = new Tooltip("mouse_normal_tooltip", data, position, obj, true);

	var tooltip_box = obj.Tooltip.GetUID();
	$('#' + tooltip_box).find('.do_attr_list').html(obj.content_text);

	/*	this.HTMLel.find('img').mousemove(function(event) {
	 obj.Tooltip.Show();
	 
	 });
	 this.HTMLel.find('img').mouseout(function(event) {
	 obj.Tooltip.Hide();
	 });  */
    },
    SelectAttribute: function(attrUID) {
	this.CreateGP();

	this.GP.SelectAttribute(attrUID);
    },
    CreateGP: function() {
	if (this.GP) {
	    return;
	}
	var container = Containers.CreateHTMLContainer(this.GetUID(), App.CONTAINER_TYPE_CHILD, this.gravity);

	container.SetWorkspace(this.GetWorkspace());
	container.setCreatedFrom(this.GetUID());

	var point = this.GetCoordinates();

	container.Reposition(point.x, point.y + 32);

	this.ContainerCreated = 1;

	this.GP = container;
    },
    RefreshAttrsList: function() {
	$('#' + this.attrsListUID).find('div.is_selected').removeAttr('class');
    },
    ToggleAttrsList: function() {
	if (this.attrsListVisible) {
	    this.HideAttrsList();

	    this.attrsListVisible = 0;
	}
	else {
	    this.ShowAttrsList();

	    this.attrsListVisible = 1;
	}
    },
    HideAttrsList: function() {
	$('#' + this.attrsListUID).hide();

	this.attrsListVisible = 0;
    },
    ShowAttrsList: function() {
//        $('#' + this.attrsListUID).show();
//        
//        this.attrsListVisible = 1;
    },
    GetDBid: function() {
	return this.DBid;
    },
    GetFeedID: function() {
	return this.feed.GetUID();
    },
    GetType: function() {
	return this.type;
    },
    GetNum1: function() {
	return this.num1;
    },
    GetNum2: function() {
	return this.num2;
    },
    IsActive: function() {
	this.HTMLel.find('img').css({
	    'border': '10px solid #E47A46',
	    'border-radius': '15px'
	});
    },
    IsNotActive: function() {
	this.HTMLel.find('img').css({
	    'border': '0',
	    'border-radius': '0px'
	});
    },
    GetFeed: function() {
	return this.feed;
    },
    GetTooltipType: function()
    {
	return this.TooltipType;
    },
    SetTooltipType: function(feed)
    {
	this.TooltipType = feed.TooltipType;
	if (this.type.search('video/') != -1) {
	    this.TooltipType = 'gdrivevideo';
	}
    },
    /*   Hover: function()
     {
     var obj = this;
     
     $('#' + this.UID + ' img').mouseover(function(event) {
     var text = '';
     
     var attrs = obj.gravity.arr();
     for (var a in attrs) {
     var attr = attrs[a];
     
     text += '<div>' + attr.GetDisplayName() + ' <span>' + attr.GetValue() + '</span></div>';
     }
     
     obj.content_text = text;
     obj.content_date = obj.date;
     
     var data = {
     "src": obj.image,
     "urlstr": obj.url,
     "info_title": obj.title,
     "feed": obj.feed.GetTitle(),
     "date": obj.content_date,
     "c": obj.content_text,
     "tableID": obj.UID + '_tooltip'
     };
     
     
     obj.Tooltip = new Tooltip(obj.UID, 'normal', data);
     
     $('#do_tooltip_attrs').html(obj.content_text);
     
     switch (obj.GetTooltipType().toLowerCase())
     {
     case 'normal':
     break;
     case 'youtube':
     $("span.playBytton").css('display', 'block');
     obj.StartTimer('youtube');
     break;
     case 'gdrivevideo':
     $("span.playBytton").css('display', 'block');
     obj.StartTimer('gdrivevideo');
     break;
     }
     // console.log(event);
     
     });
     },
     Out: function()
     {
     var obj = this;
     $('#' + this.UID + ' img').mouseout(function(event) {
     // console.log(event);
     if (obj.tooltip_timer)
     {
     obj.StopTimer();
     }
     obj.Tooltip.Remove();
     });
     },
     StartTimer: function(type)
     {
     
     var obj = this;
     switch (type)
     {
     case 'youtube':
     obj.tooltip_timer = setTimeout(function() {
     var url = obj.url.substring(31, 42);
     // console.log(url , this.url,this.title,  this.feed, this.date, this.text, this.tableID);
     var data =
     {
     "url": url,
     "urlstr": obj.url,
     "info_title": obj.title,
     "feed": obj.feed.GetTitle(),
     "date": obj.content_date,
     "c": obj.content_text,
     "tableID": obj.UID + '_tooltip'
     };
     obj.ChangeTooltip('youtube', data);
     $('#do_tooltip_attrs').html(obj.content_text);
     }, 2000);
     
     break;
     case 'gdrivevideo':
     obj.tooltip_timer = setTimeout(function() {
     var id = /\/file\/d\/(.*?)\/edit/;
     id = id.exec(obj.url);
     id = id[1];
     
     var data =
     {
     "url": 'https://video.google.com/get_player?ps=docs&partnerid=30&autoplay=1&docid=' + id,
     "urlstr": obj.url,
     "info_title": obj.title,
     "feed": obj.feed.GetTitle(),
     "date": obj.content_date,
     "c": obj.content_text,
     "tableID": obj.UID + '_tooltip'
     };
     obj.ChangeTooltip('gdrive', data);
     $('#do_tooltip_attrs').html(obj.content_text);
     }, 2000);
     break;
     }
     
     
     },  */
    StopTimer: function()
    {
	clearTimeout(this.tooltip_timer);
    },
    ChangeTooltip: function(type, data)
    {
	var obj = this;
	obj.StopTimer();
	obj.tooltip_timer = '';

	obj.Tooltip.Remove();
	obj.Tooltip = null;

	obj.Tooltip = new Tooltip(obj.UID, type, data);
    },
    IsInSystemContainer: function() {
	if (this.IsInContainer()) {
	    if (this.GetCurrentContainer().GetContainerType() == App.CONTAINER_TYPE_SYSTEM) {
		return true;
	    }
	}

	return false;
    },
    IsTrapped: function() {
	if (this.IsInContainer()) {
	    return this.GetCurrentContainer().IsTrapped();
	}

	return false;
    },
    GetUID: function() {
	return this.UID;
    },
    GetHTMLid: function() {
	return this.HTMLid;
    },
    GetOwnContainerID: function() {
	return this.OwnContainerID;
    },
    GetDate: function() {
	return this.date;
    },
    GetImage: function() {
	return this.image;
    },
    GetTitle: function() {
	return this.title;
    },
    GetSite: function() {
	return this.url;
    },
    GetURL: function() {
	return this.fullurl;
    },
    GetX: function() {
	return this.x;
    },
    GetY: function() {
	return this.y;
    },
    IsInContainer: function() {
	return this.CurrentlyInContainer != null;
    },
    GetCurrentContainer: function() {
	return this.CurrentlyInContainer;
    },
    GroupingStarted: function(c, speed) {
	if (this.IsInContainer()) {
	    this.GetCurrentContainer().RemoveElement(this);
	}

	this.speed = speed;

	this.Show();

	this.GroupingMove = 1;
    },
    GroupingEnded: function() {
	this.GroupingMove = 0;
    },
    SetWorkspace: function(workspace) {
	this.workspace = workspace;
    },
    GetWorkspace: function() {
	return this.workspace;
    },
    JoinedContainer: function(c) {
	this.CurrentlyInContainer = c;
    },
    LeftContainer: function() {
	this.CurrentlyInContainer = null;
	this.GroupingContainer = null;
	return;
	if (!this.IsInContainer()) {
	    console.log('Cant leave if not in container. DE: ' + this.GetUID());
	    return;
	}

	var c = this.GetCurrentContainer();

	this.CurrentlyInContainer = null;
	this.GroupingContainer = null;

	var pos_el = c.GetGPLandCoords();

//        Render.Add('#' + this.GetHTMLid(), 'appendTo', {
//            'target': '#page'
//        });

	this.Reposition(pos_el.x + this.GetX(), pos_el.y + this.GetY());
    },
    ImageSize: function(size) {
	switch (size) {
	    case 'small':
		this.HTMLel.find('img.main_img').css({
		    "width": "28px",
		    "height": "28px"
		});

		this.w = this.h = 35;

		break;
	    case 'normal':
		this.HTMLel.find('img.main_img').css({
		    "width": "50px",
		    "height": "50px"
		});

		this.w = this.h = 50;

		break;
	    case 'big':
		this.HTMLel.find('img.main_img').css({
		    "width": "80px",
		    "height": "80px"
		});

		this.w = this.h = 80;

		break;
	}
    },
    RefreshPosition: function(x, y) {
	var pos = this.HTMLel.position();

	this.x = parseInt(pos.left);
	this.y = parseInt(pos.top);
    },
    LeaveContainer: function() {
	var c = Containers.findByItem(this);

	if (c) {
	    Containers.get(c).RemoveElement(this);
	    this.LeftContainer(c);
	}

	this.HTMLel.show();
    },
    Show: function() {
	this.HTMLel.show();
    },
    Hide: function() {
	this.HTMLel.hide();
    },
    GetCoordinates: function() {
	return {
	    'x': this.GetX(),
	    'y': this.GetY()
	};
    },
    AddAttribute: function(attr, save) {
	if (!this.gravity.get(attr.GetUID())) {
	    this.gravity.add(attr);
	    $('#' + this.GetUID()).find('group[name="general"]').append('<gravity uid="' + attr.gravity.name + '" name="' + attr.gravity.name + '" type="gravity" value="1" relative="1"></gravity>');

	    if (save) {
		$.post(gateway + "&do=add_attribute", {
		    'id': this.GetUID().replace('img_', ''),
		    'attrs[]': new Array(attr.gravity.name + ':1:general')
		}, function(data) {
		});
	    }
	}
    },
    Reposition: function(x, y) {
	x = parseInt(x);
	y = parseInt(y);

	Render.Add('#' + this.GetHTMLid(), 'position', {'left': x, 'top': y});

	this.x = x;
	this.y = y;
    },
    RepositionInContainer: function() {
	var c = this.GetCurrentContainer();
	if (!c) {
	    return;
	}
	var point = c.GetGPLandCoords();

	this.Reposition(point.x, point.y);
    },
    RepositionToPage: function() {
	var pos = this.HTMLel.position();


	var x = parseInt(pos.left) + $(document).scrollLeft();
	var y = parseInt(pos.top) + $(document).scrollTop();

	this.Reposition(x, y);
    },
    Destroy: function() {
	if (this.IsInContainer()) {
	    this.GetCurrentContainer().RemoveElement(this);
	}

	this.Tooltip.Remove();

	DataElements.remove(this.GetUID());

	Horizon.CreateHorizonMenu();

	$('#' + this.GetUID()).remove();
	$('#touch_tooltip_box, #mouse_tooltip_box').remove();

	FeedPanel.UpdateFeedsInfo(this.feed_id, '', -1);
    }
});


