var Tooltip = VisualObject.extend({
    init: function(tplBox, tplData, position, parent, dontHide) {
	this._super(tplBox, tplData, position);

	this.parent = parent;
	this.dontHide = dontHide;

	/*$("#" + parent.GetUID()).on('mouseover', function() {
	    console.log(this.Tooltip);
	    this.Show();
	});  */
    }



    /*  Hide: function() {
     $("#" + this.boxID).hide();
     },
     Show: function() {
     var obj = this;	
     var type = this.type.position;
     var popup = $("#" + this.boxID);
     
     switch (type) {
     case 'static':
     console.log("static");
     var cont = this.typeData.GetCurrentContainer();
     var pos = $("#container_" + cont.GetUID()).position();
     var top = pos.top + 64;
     var left = pos.left + 380;
     
     popup.css({
     "left": (left) + "px",
     "top": (top) + "px",
     "display": "block"
     });
     
     
     break;
     case 'relative':
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
     popup_height = popup.height();
     popup_width = popup.width();
     el_height = $("#" + this.typeData + ' img').height();
     el_width = $("#" + this.typeData + ' img').width();
     
     var pos_parent = AbsParent($("#" + this.typeData + ' img'));
     
     pos.left = pos_parent.x;
     pos.top = pos_parent.y;
     
     left = pos.left + el_width + 32;
     if (left + popup_width >= screen_width - 20) {
     left = pos.left - el_width - popup_width + 10;
     }
     top = pos.top - 20;
     if (top + popup_height >= screen_height + $(document).scrollTop() - 30) {
     top = pos.top - el_height - popup_height;
     }
     
     popup.css({
     "left": (left) + "px",
     "top": (top) + "px",
     "display": "block"
     });
     
     
     break;
     
     default:
     }
     } */
});



