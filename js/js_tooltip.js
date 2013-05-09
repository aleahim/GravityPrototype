var Tooltip = Class.extend({
    init: function(parent_element, toolltip_type, data) {

	if (touch == false)
	{
	    this.EventType = 'mouse';
	}
	else
	{
	    this.EventType = 'touch';
	}

	this.Parent = parent_element;
	this.TooltipType = toolltip_type.toLowerCase();
	this.Data = data;


	this.Create(this.EventType + '_' + this.TooltipType + '_tooltip', this.Data);

	this.Move();
    },
    Create: function(tpl, data)
    {
	$.tmpl(tpl, data).appendTo('body');
    },
    Remove: function()
    {
	if (this.EventType == 'mouse')
	{
	    $("#" + this.Parent + '_tooltip').remove();
	}
    },
    Move: function()
    {
	var obj = this;


	$("#" + obj.Parent + ' img').mousemove(function(e) {
	    var top;
	    var left;
	    var screen_height;
	    var screen_width;
	    var el_height;
	    var el_width;
	    var popup_height;
	    var popup_width;
	    var pos = {};

	    screen_height = $(window).height();
	    screen_width = $(window).width();
	    popup_height = $("#" + obj.Parent + "_tooltip").height();
	    popup_width = $("#" + obj.Parent + "_tooltip").width();
	    el_height = $("#" + obj.Parent + ' img').height();
	    el_width = $("#" + obj.Parent + ' img').width();

	    var pos_parent = AbsParent($(this));
	    var pos_el = $(this).position();

	    pos.left = pos_parent.x + pos_el.left;
	    pos.top = pos_parent.y + pos_el.top;

	    left = pos.left + el_width + 32;
	    if (left + popup_width >= screen_width - 20) {
		left = pos.left - el_width - popup_width + 10;
	    }
	    top = pos.top - 20;
	    if (top + popup_height >= screen_height + $(document).scrollTop() - 30) {
		top = pos.top - el_height - popup_height;
	    }

	    $("#" + obj.Parent + "_tooltip")
		    .css("top", (top) + "px")
		    .css("left", (left) + "px");
	    var display = $("#" + obj.Parent + "_tooltip").css('display');
	    if (display == 'none')
	    {
		$("#" + obj.Parent + "_tooltip").css('display', 'block');
	    }
	});
    }

});