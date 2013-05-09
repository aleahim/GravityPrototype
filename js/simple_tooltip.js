/*
 * Image preview script 
 * powered by jQuery (http://www.jquery.com)
 * 
 * written by Alen Grakalic (http://cssglobe.com)
 * 
 * for more info visit http://cssglobe.com/post/1695/easiest-tooltip-and-image-preview-using-jquery
 *
 */
 
this.imagePreview = function imagePreview(){	
    /* CONFIG */
    var screen_height ;
    var screen_width ;	
    var tt_top ;
    var tt_left;
    var tttop;
    var ttleft;
    var border;
    var Tcontainer;
    var Ttemplate;
    var tableID;
    
		
    /* END CONFIG */
    $(".tooltip").hover(function(e){
        
        if (touch == true)
        {
            Tcontainer = ".container_tooltip";
            Ttemplate = 'touch_tooltip';
            tableID = 'touch_tooltip_box';
            $('#'+tableID).remove();
        }
        else
        {
            Tcontainer = "body";
            Ttemplate = 'mouse_tooltip';
            tableID = 'mouse_tooltip_box';
            var Datael  = DataElements.FindByUID($(this).attr('id'));
            var Container = Containers.findByItem(Datael);
        }
        
        var text='';
        var date;

        $(this).find("category").each(function() {
            var category = new GeneralObject($(this).attr('uid'), $(this).attr('name'), $(this).attr('type'), $(this).attr('value'));

            $(this).find('group').each(function() {
                var group = new GeneralObject($(this).attr('uid'), $(this).attr('name'), $(this).attr('type'), $(this).attr('value'));

                $(this).find('gravity').each(function() {
                    var gravity = new GeneralObject($(this).attr('uid'), $(this).attr('name'), $(this).attr('type'), $(this).attr('value'));
                    if ($(this).attr('name') == 'date') {
                        date = gravity.value;
                    }
                    else {
                        if (category.name == 'system') {
                            return;
                        }
                        text += gravity.name + ': ' + gravity.value + '; '; 
                    }
                });
            });
        });
        
        var src = $(this).find('img').attr('src');
        var urlstr = /url=(.*)\//;
        urlstr = urlstr.exec($(this).find('info').attr('site'));
        if (urlstr && urlstr[1]) urlstr = urlstr[1];
        else urlstr = $(this).find('info').attr('site');
        var feed = $(this).find('info').attr('feed');
        
        var c = text; 
        var info_title= $(this).find('info').attr('title');
        
        $.tmpl(Ttemplate , {
            "src": src,
            "urlstr": urlstr,
            "info_title": info_title,
            "feed": feed,
            "date": date,
            "c": c,
            "tableID":tableID
        }).appendTo(Tcontainer);
        
        
        if (touch == false)
        {
            $("#"+tableID)
            .css("top",(e.pageY) - 50 + "px")
            .css("left",(e.pageX) - 20 + "px")
            .fadeIn("fast");
            if (Container != 'list' && Container != 'selected')
            {
                border = $('#clickarea_container_'+Container).css('background-color');
                //$("#"+tableID).css('border-color' , '#808080')
            }
            else
            {
                $("#"+tableID).css('border-color' , '#00005C');
            }
        }
        else
        {
            $('#'+tableID).css('display' , 'block');
        }
    },
    function(){
        if (touch == false)
        {
            $("#"+tableID).remove();
        }
    });	
    $(".tooltip").mousemove(function(e){
        if (touch == false)
        {
            screen_height =$(window).height();
            screen_width = $(window).width();
            var height = $("#"+tableID).height();
            var width = $("#"+tableID).width();
            tt_top =  e.pageY;
            tt_left = e.pageX;
            if (tt_top>= screen_height-height-140)
            {
                tttop = e.pageY - height - 35;
            }
            else
            {
                tttop = tt_top + 25; 
            }
            if (tt_left>= screen_width-width-25)
            {
                ttleft = e.pageX - width + 25;
            }
            else
            {
                ttleft = tt_left - 15; 
            }
            $("#"+tableID)
            .css("top",(tttop) + "px")
            .css("left",(ttleft) + "px");
        }
    });			
};
