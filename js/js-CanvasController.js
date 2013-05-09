var CanvasController = Class.extend({
    init: function() {
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        //this.canvas = new Raphael(document.getElementById('page'), 2000, 2000);  //Raphael(parseInt($('.feed_panel').css('width').replace('px', '')), 0, parseInt($('.page').css('width').replace('px', '')) - parseInt($('#container_selected').css('width').replace('px', '')), parseInt($('.page').css('height').replace('px', '')) - parseInt($('#container_list').css('height').replace('px', '')));
        //this.canvas.renderfix();
    },

    DrawLine: function(x1, y1, x2, y2, color, width) {
        if (!width) {
            width = 0.5;
        }
        
        var context = this.context;
              
        context.beginPath();
        context.lineWidth = width;
        context.strokeStyle = color;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();   
        
    //        this.canvas.path('M'+x1+' ' + y1 + ' L'+x2+' '+y2).attr({
    //            "stroke-width": width,
    //            stroke: color
    //        });
    },
    
    Clear: function() {
        //this.canvas.clear();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(document.getElementById("image"), 80, 60);
    }
});