var Pointer  = Class.extend({
    init: function (id, uid) {
        var obj = this;
        obj.uid = uid;
        obj.id = id;
        obj.HTMLel = $('#' + obj.id);
        obj.dragable = true;
        obj.x = 0;
        obj.y = 0;
        obj.EndX = 0;
        obj.EndY = 0;
        obj.rightButton = false;
        obj.movedLength = 0;
        obj.mouseMinLength = 10;
        obj.touchMinLength = 10;
        obj.isExecutedBefore = false;
        obj.fingerCount = 0;
        obj.lastTouched = 0;
        obj.AttachHandlers();
        obj.touchevents = false;
        
        obj.events = new goog.structs.Map;
    },
    
    bind: function(event, func) {
        this.events.set(event, func);
        
        return this;
    },
    
    AttachHandlers: function()
    {
        var obj = this;
        document.getElementById(obj.id).addEventListener('touchstart', function(event) {
            obj.TouchStart(event);
        }, false);
        document.getElementById(obj.id).addEventListener('touchmove', function(event) {
            obj.TouchMove(event);
        }, false);
        document.getElementById(obj.id).addEventListener('touchend', function(event) {
            obj.TouchEnd(event);
        }, false);  
   
        $(obj.HTMLel).bind('mousedown' ,function(event){
            obj.MouseDown(event);
        });
        $(document).bind('mousemove', function(event){ 
            obj.MouseMove(event);
        });
        $(document).bind('mouseup', function(event){
            obj.MouseUp(event);
        });       
    },
    
 
    MouseDown: function(event) 
    {
        event.Type = 'mouse';
        if (this.touchevents == true)
        {
            return;
        }
        var d = (document.documentElement && 
            document.documentElement.scrollLeft != null) ?
        document.documentElement : document.body;
        this.scrollTop = $(document).scrollTop();
        this.scrollLeft = $(document).scrollLeft();
        this.x = event.clientX + d.scrollLeft;
        this.y = event.clientY + d.scrollTop;
        event.StartX = this.x;
        event.StartY = this.y;
        event.HTMLel = this.HTMLel;
        event.id = this.id; event.uid = this.uid;
            
        this.ExecuteBefore(event);
        
        event.preventDefault();
    },
    
    MouseMove: function(event) 
    {
        event.Type = 'mouse';
        if (this.touchevents == true)
        {
            return;
        }
        if(this.x != 0 && this.y != 0)
        {
            this.EndX = event.clientX ;
            this.EndY =  event.clientY;
            event.EndX = this.EndX ;
            event.EndY = this.EndY ;
            event.ScrollTop = this.scrollTop;
            event.ScrollLeft = this.scrollLeft;
            event.HTMLel = this.HTMLel;
            event.id = this.id; event.uid = this.uid;
            
            this.movedLength = Math.round(Math.sqrt(Math.pow(this.EndX - this.x,2) + Math.pow(this.EndY - this.y,2)));
        
            if(this.movedLength > this.mouseMinLength)
            {   
                this.ExecuteMove(event);
            }           
        }
    },
    
    MouseUp: function (event)
    {
        event.Type = 'mouse';
        if (this.touchevents == true)
        {
            return;
        }
        if(this.x!=0 && this.y!=0)
        {                    
            event.EndX = this.EndX;
            event.EndY = this.EndY;            
            event.ScrollTop = this.scrollTop;
            event.ScrollLeft = this.scrollLeft;
            event.HTMLel = this.HTMLel;
            event.id = this.id; event.uid = this.uid;
            
            if (this.movedLength > this.mouseMinLength)
            {
                this.ExecuteDrag(event);
                this.movedLength = 0;
            }
            else if (this.movedLength >= 0 && this.movedLength < this.mouseMinLength )
            {
                this.OnClickCheck(event);
            }
            this.ExecuteAfter(event);

            this.x=0;
            this.y=0;
            this.EndX = 0;
            this.EndY = 0;
            this.movedLength = 0 ;
        }
    },
    
    TouchStart: function (event)
    {
        event.Type = 'touch';
        this.touchevents = true;
        event.preventDefault();
        this.fingerCount = event.touches.length; // get the total number of fingers touching the screen
        
        // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),check that only one finger was used
        if ( this.fingerCount == 1 ) 
        {
            var d = (document.documentElement && 
                document.documentElement.scrollLeft != null) ?
            document.documentElement : document.body;
            this.scrollTop = $(document).scrollTop();
            this.scrollLeft = $(document).scrollLeft();
            this.x = event.touches[0].pageX;
            this.y = event.touches[0].pageY;
            event.StartX = this.x;
            event.StartY = this.y;
            event.HTMLel = this.HTMLel;
            event.id = this.id; event.uid = this.uid;
            
            this.ExecuteBefore(event);
        }
    },
    
    TouchMove: function (event)
    {
        event.Type = 'touch';
        if (this.touchevents == true)
        {   
            event.preventDefault();
            if ( event.touches.length == 1 ) 
            {
                this.EndX = event.touches[0].pageX;
                this.EndY = event.touches[0].pageY;
                event.EndX = this.EndX ;
                event.EndY = this.EndY ;
                event.ScrollTop = this.scrollTop;
                event.ScrollLeft = this.scrollLeft;                
                event.HTMLel = this.HTMLel;
                event.id = this.id; event.uid = this.uid;
            
                this.movedLength = Math.round(Math.sqrt(Math.pow(this.EndX - this.x,2) + Math.pow(this.EndY - this.y,2)));
                if(this.movedLength > this.touchMinLength)
                {
                    this.ExecuteMove(event);
                }
            }
        }
    },
    
    TouchEnd: function (event)
    {
        event.Type = 'touch';
        if (this.touchevents == true)
        {   
            event.preventDefault();
            if ( this.fingerCount == 1)
            {   
                event.EndX = this.EndX;
                event.EndY = this.EndY;            
                event.ScrollTop = this.scrollTop;
                event.ScrollLeft = this.scrollLeft;
                event.HTMLel = this.HTMLel;
                event.id = this.id; event.uid = this.uid;
            
                if(this.x!=0 && this.y!=0)
                {
                    if ( this.movedLength >= this.touchMinLength)
                    {
                        this.ExecuteDrag(event);
                        this.movedLength = 0;
                    }
                    else if (this.movedLength >= 0 && this.movedLength < this.touchMinLength )
                    {
                        this.OnClickCheck(event);
                    }
                }
                this.ExecuteAfter(event);

                this.x=0;
                this.y=0;
                this.EndX = 0;
                this.EndY = 0;
                this.movedLength = 0 ;
                this.touchevents = false;
            }
        }
    },
    
    OnClickCheck: function (event)
    { 
        event.preventDefault();
        var timeNow = (new Date()).getTime();

        if (timeNow < (this.lastTouched + 250)) 
        {  
            this.ExecuteDoubleClick(event);
        }
        else
        {
            this.ExecuteClick(event);  
        }
        this.lastTouched = timeNow;
    },
    
    ExecuteBefore: function(event)
    {
        var func = this.events.get('pointerdown');
        
        if (func) {
            func(event);
        }
    },
    
    ExecuteMove: function(event)
    {
        var func = this.events.get('move');
        
        if (func) {
            func(event);
        }
    },
    
    ExecuteAfter: function(event)
    {
        var func = this.events.get('pointerup');
        
        if (func) {
            func(event);
        }
    },
    
    ExecuteDrag: function(event)
    {
        var func = this.events.get('dragend');
        
        if (func) {
            func(event);
        }
    },
    
    ExecuteClick: function(event)
    {
        var func = this.events.get('pointerclick');
        
        if (func) {
            func(event);
        }
    },
    
    ExecuteDoubleClick: function(event)
    {
        var func = this.events.get('pointerdoubleclick');
        
        if (func) {
            func(event);
        }
    }
});