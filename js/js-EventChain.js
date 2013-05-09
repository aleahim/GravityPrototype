var EventChain = Class.extend({
    init: function(Promisses, EventType) {
        if (!Promisses.length) {
            console.log('Cant init empty EventChain.');
            
            return;
        }

        var callback;
        var callbackArguments = arguments;

        switch (EventType) {
            case 'ContainerArrange':
                callback = this.EventArrange;
                break;
            case 'LoadElements':
                callback = this.EventLoadElements;
                break;
            case 'SaveReport':
                callback = this.EventSaveReport;
                break;
        }

        var MasterPromise = $.when.apply(null, Promisses);

        MasterPromise.then(function() {
            callback.apply(null, callbackArguments);
        });

        this.MasterPromise = MasterPromise;
    },

    GetMasterPromise: function() {
        return this.MasterPromise;
    },

    EventLoadElements: function(Promisses, EventType, feed_id, loaded_items, x, y) {
        var feed = FeedElements.get(feed_id);
        feed.SetLoadedElements(loaded_items.length);

        FeedPanel.GetCarousel().ShowActive();

        App.InitItems();
        App.ImageLoader.start();
    },

    EventArrange: function(Promisses, EventType, c) {
        c.Arrange();
        c.HideFrame();
        Grouping.Redraw();
        Containers.ClearInactive(1);
        Containers.ClearInactive(2);
    },
    
    EventSaveReport: function(Promisses, EventType, report_id) {
        Report.OpenReport(report_id);
    }
});