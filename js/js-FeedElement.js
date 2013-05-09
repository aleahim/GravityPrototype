var FeedElementsController = Dictionary.extend({
    init: function()
    {
        this._super(new Array());

        var obj = this;

        this.promise = $.getJSON(gateway+'&do=list', function(data) {
            data.sort(function(a, b) {
                if (a[5] < b[5]) {
                    return -1;
                }
                else if (a[5] > b[5]) {
                    return 1;
                }
                if (a[3] > b[3]) {
                    return -1;
                }
                else if (a[3] < b[3]) {
                    return 1;
                }
                return 0;
            });
            
            $(data).each(function(key, val) {
                obj.add(new FeedElement(val));
            });
        });
    },

    GetByDBid: function(ID) {
        var all = this.arr();

        for (var a in all) {
            var feed = all[a];

            if (feed.GetDBid() == ID) {
                return feed;
            }
        }

        return null;
    }
});


var FeedElement = Class.extend({
    init: function (val) 
    {
        var obj = this;

        obj.UID = App.GetNewUID();
        
        obj.DBid  = val[0];
        obj.title = val[2];
        obj.date = val[3];
        obj.SetImage(val[4]);
        obj.type = val[5];
        obj.active = val[6];
        obj.notes = val[7];
        obj.LoadedElements = 0;
        obj.TotalElements = parseInt(val[8]);
        obj.images = val[9]
        obj.SetImagesSplit(obj.images) ; 
        obj.dataID = val[10];
        obj.elementsIDs = val[11].split('@@delim@@');
        obj.LoadX = 0;
        obj.LoadY = 0;
        obj.ElementsLabel = '';
        obj.ItemsToLoad = '';

        if (obj.type.toLowerCase() == 'youtube')
        {
            obj.SetTooltipType ('youtube');
        }
        else if(obj.type == 'GDrive')
        {
            obj.SetTooltipType ('normal');
        }
        else
        {
            obj.SetTooltipType ('normal');
        }
    //obj.Hover();
    // obj.Out();
    },
    SetItemsToLoad: function(items) {
        this.ItemsToLoad = items;
    },
    GetItemsToLoad: function() {
        return this.ItemsToLoad;
    },
    SetTooltipType: function(TooltipType)
    {
        this.TooltipType = TooltipType;
    },
    GetTooltipType: function()
    {
        return this.TooltipType;
    },
    SetImagesSplit: function(arr)
    {
        this.ImagesSplit = arr.split('@@delim@@');
    },
    GetImagesSplit: function()
    {        
        return this.ImagesSplit;
    },
    SetImage: function(image) {
        this.image = image;
    },
    
    SetLoadX: function(x) {
        this.LoadX = x;
    },
    
    SetLoadY: function(y) {
        this.LoadY = y;
    },
    
    GetLoadX: function() {
        if (!this.LoadX) {
            this.LoadX = 73;
        }
        return this.LoadX;
    },
    
    GetLoadY: function() {
        if (!this.LoadY) {
            this.LoadY = 120;
        }
        return this.LoadY;
    },

    SetElementsLabel: function() {
        this.ElementsLabel = this.GetLoadedElements() + '/' + this.GetTotalElements();
    },

    GetElementsLabel: function() {
        return this.ElementsLabel;
    },

    GetLoadedElements: function() {
        return this.LoadedElements;
    },

    SetLoadedElements: function(count) {
        if (count) {
            this.LoadedElements += count;

            if (this.LoadedElements > this.TotalElements) {
                this.LoadedElements = this.TotalElements;

                console.log('Invalid loaded elements count:', this.LoadedElements, this.TotalElements);
            }
        }
        
        this.SetElementsLabel();
    },

    GetTotalElements: function() {
        return this.TotalElements;
    },

    GetTitle: function() {
        return this.title;
    },
    SetTitle: function(title) {
        this.title = title;
    },
    
    GetDate: function() {
        return this.date;
    },
    
    GetImage: function() {
        return this.image;
    },

    GetType: function() {
        return this.type;
    },

    GetActive: function() {
        return this.active;
    },

    GetNotes: function() {
        return this.notes;
    },

    GetImages: function() {
        return this.images;
    },

    GetElementsIDs: function() {
        return this.elementsIDs;
    },

    GetUID: function() {
        return this.UID;
    },

    GetDBid: function() {
        return this.DBid;
    },

    Hover: function(id , parentId)
    {
        // console.log(id , parentId);
        var  obj = this;
        $('#'+id).mouseover(function(event){
               
            //  $('#feed_'+obj.UID+' img').mouseover(function(event){
            
            var data = {
                "tableID":parentId+'_tooltip',
                "type": obj.type,
                "title": obj.title,
                "date": obj.date,
                "count": obj.TotalElements
            };
            // console.log(data ,obj.UID , id );
         //   obj.Tooltip = new Tooltip(parentId ,'feed' , data);
            
            for (var i in obj.ImagesSplit)
            {
                if (i<= 9)
                {
                    $('td.feed_images').append('<img src="'+obj.ImagesSplit[i]+'" width="30" height="30" style="margin-right:5px;"/>');
                }
                
            }
        });
    },

    Out: function(id)
    {
        var  obj = this;
        $('#'+id).mouseout(function(event){
            // console.log(obj.Tooltip);
            if (obj.Tooltip) {
                obj.Tooltip.Remove();
                obj.Tooltip = '';
            }
        });
    }
});