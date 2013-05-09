/*
 * Image preview script 
 * powered by jQuery (http://www.jquery.com)
 * 
 * written by Alen Grakalic (http://cssglobe.com)
 * 
 * for more info visit http://cssglobe.com/post/1695/easiest-tooltip-and-image-preview-using-jquery
 *
 */
 
this.imagePreviewClickArea = function imagePreviewClickArea(cont_obj ,e){	
    /* CONFIG */
    var screen_height ;
    var screen_width ;	
    var tt_top ;
    var tt_left;
    var tttop;
    var ttleft;
    var border;
		
    // these 2 variable determine popup's distance from the cursor
    // you might want to adjust to get the right result
		
    /* END CONFIG */
   
        
    var Container = cont_obj.HTMLid ;
    var points =  $('#'+Container+' .info_selected td').text();
    var text;

    text = ''   //<br /><br />

    text += points; //+ ';<br />'
             
    
    var c = text;     
    
    $("body").append("<table id='tooltip_box_clickarea'><tr><td>"+ c +"</td></tr></table>");
    $("#tooltip_box_clickarea")
    .css("top",(e.pageY) + "px")
    .css("left",(e.pageX) + "px")
    .fadeIn("fast");
    if (c == '')
        {
            $("#tooltip_box_clickarea").css('display' , 'none');
        }
        else
            {
                 $("#tooltip_box_clickarea").css('display' , 'block');
            }
        
    border = $('#clickarea_'+Container).css('background-color');
    $("#tooltip_box_clickarea").css('border-color' , border);
    $("#tooltip_box_clickarea").css('color' , border);
    
    $('#clickarea_'+cont_obj.HTMLid).mouseout(function(e){
        $("#tooltip_box_clickarea").remove();
        $("#tooltip_box_clickarea").css('border-color' , '#00005C');
        $("#tooltip_box_clickarea").css('color' , 'black');
    });
    $('#clickarea_'+cont_obj.HTMLid).mousemove(function(e){
     var l=   $('#'+Container).css('left');
      var t=    $('#'+Container).css('top');
       
      
        var height = $("#tooltip_box_clickarea").height();
         tt_top =  e.pageY-60-height;
        tt_left = e.pageX;
     //   console.log(height , tt_top ,tt_left , t , l);
        tttop = tt_top; 

        
        ttleft = tt_left; 
       
        $("#tooltip_box_clickarea")
        .css("top",(tttop) + "px")
        .css("left",(ttleft) + "px");
    });	
};
   
	

