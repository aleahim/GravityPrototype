var BackgroundController = Class.extend({
    init: function(UID) {
        this.UID = UID;
    },

    CangeSrc: function(src)
    {
        $('#'+this.UID+' img').attr('src', src);
        this.Imgsrc = src;
        Canvas.Clear();
    },
    ImageResize: function(value , type)
    {
        var width = $('#'+this.UID+' img').css('width').replace("px", "");
        var height = $('#'+this.UID+' img').css('height').replace("px", "");
        switch(type)
        {
            case 'both':
                if (value == 0)
                {
                    //  if (width<=500 && height<=500)
                    // {
                    $('#'+this.UID+' img').css({
                        'width': '+=100' , 
                        'height':'+=100'
                    });
                    this.Imgwidth = width+=100 ;
                    this.Imgheight = height+=100 ;
                //  }
                }
                else
                {
                    // if (width>=200&& height>=200)
                    // {
                    $('#'+this.UID+' img').css({
                        'width': '-=100', 
                        'height':'-=100'
                    });
                    this.Imgwidth = width-=100 ;
                    this.Imgheight = height-=100 ;
                // }
                }
                break;
            case 'width':
                if (value == 0)
                {
                    // if (width<=500)
                    // {
                    $('#'+this.UID+' img').css({
                        'width': '+=100'
                    });
                    this.Imgwidth = width+=100 ;
                // }
                }
                else
                {
                    // if (width>=200)
                    // {
                    $('#'+this.UID+' img').css({
                        'width': '-=100'
                    });
                    this.Imgwidth = width-=100 ;
                // }
                }
                break;
            case 'height':
                if (value == 0)
                {
                    //   if (height<=500)
                    //  {
                    $('#'+this.UID+' img').css({
                        'height':'+=100'
                    });
                    this.Imgheight = height+=100 ;
                //  }
                }
                else
                {
                    // if (height>=200)
                    // {
                    $('#'+this.UID+' img').css({
                        'height':'-=100'
                    });
                    this.Imgheight = height-=100 ;
                // }
                }
                break;
        }
    },
    Move: function(value , type)
    {
        var top = $('#'+this.UID).css('top').replace("px", "");
        var left = $('#'+this.UID).css('left').replace("px", "");
        
        
        switch(type)
        {
            case 'horizontal':
                if (value == 0)
                {
                    $('#'+this.UID).css({
                        'left': '+=10'
                    });
                }
                else
                {
                    $('#'+this.UID).css({
                        'left': '-=10'
                    });
                }
                break;
            case 'vertical':
                if (value == 0)
                {
                    $('#'+this.UID).css({
                        'top': '+=10'
                    });
                }
                else
                {
                    $('#'+this.UID).css({
                        'top': '-=10'
                    });
                }
                break;
        }
    },
    ChangeOpacity: function(value)
    {
        if (value == 0)
        {
            $('#'+this.UID+' img').css({
                'opacity': '+=0.05'
            });
        }
        else
        {
            $('#'+this.UID+' img').css({
                'opacity': '-=0.05'
            });
        }
    },
    ChangeBlackWhite: function(value)
    {
        if (value == 0)
        {
           $('#'+this.UID+' img').addClass('desaturate')
        }
        else
        {
            $('#'+this.UID+' img').removeClass('desaturate')
            
        }
    }
})
