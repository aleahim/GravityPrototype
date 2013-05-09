var ServerLoadingController = Class.extend({
    init: function() {
        this.SearchChoice = 'search_google';
    },
    SetSearchChoice: function() {
        this.SearchChoice = $("input[type='radio'][name='search_type']:checked").val();
    },
    GetSearchChoice: function() {
        return this.SearchChoice;
    },
    MakeRequest: function(middle_point, requests) {
        App.blockUI();

        var GPs = this.GetGroupingPoints();

        if (!middle_point) {
            requests = this.GenerateSearchRequest(GPs);
        }

        var params = Search.GetSettings();
        ServerLoading.Loaded = new Array();

        var callback;
        if (params.is_instant) {
            callback = ServerLoading.LoadResults;
        }
        else {
            callback = ServerLoading.OpenLoadPanel;
        }

        ServerLoading.SendRequest(requests, middle_point, callback);
    },
    OpenLoadPanel: function(requests, DOsGroupedByFeed) {
        $("#SearchResultsList table").empty();
        $("#SearchResultPannel").slideDown();

        var Feeds = DOsGroupedByFeed;

        var items_to_load = 0;

        $('#results_for').text('Results for: ' + ServerLoading.GetCriterionByRequest(requests));

        for (var i in Feeds) {
            var feed = FeedElements.get(Feeds[i].feed_id);

            $.tmpl('not_instant_search_list_item', {
                "f_id": Feeds[i].feed_id,
                "feed_name": feed.GetTitle(),
                "items_to_load": Feeds[i].items.length,
                "total_elements": feed.GetTotalElements(),
                "img_url": feed.GetImage()
            }).appendTo("#SearchResultsList table");
            var list = new Object();

            list.feed_id = Feeds[i].feed_id;
            list.items = Feeds[i].items.slice();

            $('.' + list.feed_id).find('img').on('click', function() {
                var feedUID = $(this).parent().parent().attr('class');

                ServerLoading.LoadSingleResult(feedUID);

                $('.' + feedUID).remove();
            });

            items_to_load += Feeds[i].items.length;
        }

        ServerLoading.updateLoadAllLabel();
        $('#load_panel_load_all').on('click', function() {
            ServerLoading.LoadResults(requests, DOsGroupedByFeed);
            ServerLoading.closeSearchResultPannel();
        });

        //POSITIONING NOT INSTANT SEARCH POP UP DIV
        var w = $(window).width() - $('#gravity_trap').width() - $('#left_panel').width();
        var d = document.getElementById("SearchResultPannel");
        var divW = $(d).width();

        d.style.left = (w / 2) - (divW / 2) + "px";
        $("#SearchResultPannel").slideDown();

        App.unblockUI();
    },
    LoadSingleResult: function(feedUID) {
        var list = this.DOsGroupedByFeed[feedUID];

        this.LoadResults(this.requests, [{
                'feed_id': list.feed_id,
                'items': list.items.slice()
            }]);

        this.Loaded.push(feedUID);

        if (this.Loaded.length == Object.keys(this.DOsGroupedByFeed).length) {
            this.closeSearchResultPannel();
        }
        else {
            this.updateLoadAllLabel();
        }
    },
    updateLoadAllLabel: function() {
        var itemsToLoad = 0;

        for (var i in this.DOsGroupedByFeed) {
            itemsToLoad += this.DOsGroupedByFeed[i].items.length;
        }

        for (var a in this.Loaded) {
            itemsToLoad -= this.DOsGroupedByFeed[this.Loaded[a]].items.length;
        }

        $('#load_panel_load_all').attr('value', 'Load All (' + itemsToLoad + ')');
    },
    LoadResults: function(requests, DOsGroupedByFeed, main_attr) {
        var DOs_load = new Array();

        for (var k in DOsGroupedByFeed) {
            var list = DOsGroupedByFeed[k];

            var feed = FeedElements.get(list.feed_id);

            var def = ServerLoading.LoadDataObjects(list.items, App.LOAD_BUFFER_SIZE, list.feed_id, feed.GetLoadX(), feed.GetLoadY(), main_attr);
            DOs_load.push(def);
        }

        $.when.apply(null, DOs_load).then(function() {
            Grouping.Move();

            App.unblockUI();
        });
    },
    GetCriterionByRequest: function(requests) {
        var criterion = new Array();
        for (var a in requests) {
            var GP = requests[a];

            var GPcrit = new Array();

            var s_attrs = GP.attrs;

            for (var i in s_attrs) {
                var attr = s_attrs[i];

                GPcrit.push(attr.split('_').join('+'));
            }

            var op;

            switch (GP.operator) {
                case 'and':
                    op = ' and ';
                    break;
                case 'or':
                    op = ' or ';
                    break;
                default:
                    op = '';
                    break;
            }

            criterion.push(GPcrit.join(op))
        }

        return criterion.join(', ');
    },
    SendRequest: function(requests, middlePoint, callback) {
        App.blockUI();

        ServerLoading.requests = requests;
        ServerLoading.middlePoint = middlePoint;

        if (!middlePoint) {
            middlePoint = 0;
        }

        var exclude = DataElements.LoadedDOs.join(',');

        $.post(gateway + '&do=' + this.SearchChoice, {
            'exclude': exclude,
            'data': requests,
            'middle_point': middlePoint
        }, function(sdata) {
            try {
                var data = $.parseJSON(sdata);
            }
            catch (e) {
                App.unblockUI();

                console.log(sdata);

                alert('Server error.');

                return;
            }

            try {
                if (data.length) {
                    var DOs;
                    if (data.connected) {
                        var main_attr = data.connected;
                        DOs = data.result;
                    }
                    else {
                        DOs = data;
                    }

                    var DOsGroupedByFeed = ServerLoading.GroupDataObjectsByFeeds(DOs);
                    ServerLoading.DOsGroupedByFeed = DOsGroupedByFeed;

                    callback(requests, DOsGroupedByFeed, main_attr);
                }
                else {
                    App.unblockUI();

                    alert('No results.');
                }
            }
            catch (e) {
                App.unblockUI();

                alert('No results.');
            }
        });
    },
    LoadDataObjects: function(items_ids, buffer_size, feed_id, x, y, main_attr) {
        var items = items_ids.slice()
        var loaded = DataElements.LoadedDOs;
        var loaded_len = DataElements.LoadedDOs.length;

        for (var i = 0; i < loaded_len; i++)
        {
            var index = items.indexOf(loaded[i]);
            if (index > -1) {
                items.splice(index, 1);
            }
        }

        var loaded_items = $.grep(items.slice(), function(n) {
            return(n);
        });
        var ids = items.splice(0, buffer_size);

        var promisses = new Array();

        while (ids.length)
        {
            var promise =
                    $.post(gateway + "&do=get_items", {
                'ids': ids
            }, function(sdata) {
                try {
                    var data = $.parseJSON(sdata);
                }
                catch (e) {
                    console.log(sdata, e);
                    return;
                }

                for (var a in data) {
                    var DO = data[a];

                    try {
                        var DE = DataElements.CreateDataObject(DO, x, y);

                        if (main_attr) {
                            DE.gravity.add(GravityElements.GetAttr(main_attr));
                        }
                    }
                    catch (err) {
                        console.log(err.message);
                    }
                }
            });

            promisses.push(promise);

            ids = items.splice(0, buffer_size);
        }

        var chain = $.when.apply(null, promisses);

        chain.then(function() {
            DOM.InsertQ('#page');

            var feed = FeedElements.get(feed_id);
            feed.SetLoadedElements(loaded_items.length);

            FeedPanel.GetCarousel().ShowActive();

            App.InitItems();
            App.ImageLoader.start();
        });

        return chain;
    },
    GenerateSearchRequest: function(containers) {
        var requests = new Array();

        for (var a in containers) {
            var c = containers[a];

            var attrs = c.GetSelectedAttributes();

            if (attrs.length === 0) {
                continue;
            }

            var request = {
                'operator': c.GetOperator(),
                'attrs': new Array()
            };

            for (var i in attrs) {
                var attr = attrs[i];

                request.attrs.push(attr.GetName());
            }

            requests.push(request);
        }
        return requests;
    },
    GroupDataObjectsByFeeds: function(DOs) {
        var loader = new goog.structs.Map;

        for (var n in DOs) {
            var DO = DOs[n];

            var feed_id = FeedElements.GetByDBid(DO.f_id).GetUID();

            var load = loader.get(feed_id);
            if (load) {
                load.items.push(DO.do_id);
            }
            else {
                load = new Object();

                load.items = [DO.do_id];
                load.feed_id = feed_id;

                loader.set(feed_id, load);
            }
        }

        var grouped = loader.getValues();
        var result = new Object();

        for (var a in grouped) {
            var list = grouped[a];

            result[list.feed_id] = {
                'feed_id': list.feed_id,
                'items': $.grep(list.items, function(v, k) {
                    return $.inArray(v, list.items) === k;
                })
            }
        }

        return result;
    },
    GetGroupingPoints: function() {
        var containers = $.grep(Containers.arr(), function(n, i) {
            return n.ContainerType != App.CONTAINER_TYPE_SYSTEM && n.ContainerType != App.CONTAINER_TYPE_MIDDLE;
        });

        return containers;
    },
    closeSearchResultPannel: function() {
        $("#SearchResultPannel").slideUp();
    }
});

