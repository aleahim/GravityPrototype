var AppController = Class.extend({
    init: function() {
        this.UID_GENERATOR = 0;

        this.CONTAINER_TYPE_SYSTEM = 1; // listovete i trapa
        this.CONTAINER_TYPE_GENERAL = 2; // syzdadeni chrez drag i sa s predefined menu
        this.CONTAINER_TYPE_INPUT = 3; // dropnati ot feed panela
        this.CONTAINER_TYPE_MIDDLE = 4; // sredni tochki sled grupirane
        this.CONTAINER_TYPE_CHILD = 5; // syzdadeni ot element
        this.CONTAINER_TYPE_LOAD = 6 // nezaredeni vyv feed panela

        this.ARRANGE_JUMBLE_COLUMNS = 9;
        this.ARRANGE_JUMBLE_ROWS = 6;

        this.ARRANGE_SPLIT_COLUMNS = 3;
        this.ARRANGE_SPLIT_ROWS = 3;
        this.SCREEN_WIDTH = $(window).width();

        this.LOAD_BUFFER_SIZE = 100;

        var urlParams = {};
        var e,
                a = /\+/g, // Regex for replacing addition symbol with a space
                r = /([^&=]+)=?([^&]*)/g,
                d = function(s) {
            return decodeURIComponent(s.replace(a, " "));
        },
                q = window.location.search.substring(1);

        while (e = r.exec(q))
            urlParams[d(e[1])] = d(e[2]);

        this.urlParams = urlParams;

        this.ImageLoader = new goog.net.ImageLoader();

        this.MasterObjectsMap = new goog.structs.Map;

        this.ToggleVisibilityForSettings();
    },
    GetNewUID: function() {
        this.UID_GENERATOR++;

        return 'UID' + this.UID_GENERATOR;
    },
    InitApp: function() {
        Render = new RenderEngine();
        
        this.blockUI();

        var urlParams = this.urlParams;

        gateway = "php/gateway.php?db=" + urlParams['db'];

        DOM = new DOMController();
        Report = new ReportController();
        ServerLoading = new ServerLoadingController();
        Grouping = new GroupingController();
	EventsController = new EventController();
        DataElements = new DataElementsController('');
        Session = new SessionController();
        Events = new PointerController();
        Background = new BackgroundController('desktop');
        GravityElements = new GravityElementsController();
        Containers = new ContainersController();
        Canvas = new CanvasController();
        UI = new UIBackbone();
        Operations = new OperationsController();
        LandingZones = new LandingZonesController();

        FeedElements = new FeedElementsController();
        FeedElements.promise.done(function() {
            FeedPanel = new FeedPanelController();

            var container_trap = Containers.CreateHTMLContainer('gravity_trap', App.CONTAINER_TYPE_SYSTEM,
                    new Dictionary(new Array())
                    );
            container_trap.DisableButton('group');
            GravityTrap = new GravityTrapController();

            Horizon = new HorizonController();
            container_trap.Hide();
            Timeline = new TimelineController();

            var list = Containers.CreateHTMLContainer('list', App.CONTAINER_TYPE_SYSTEM,
                    new Dictionary(new Array())
                    );
            list.SetShowFristRowElements(1);
            list.Resize($('#horizon').width(), 0, 1);
            //          list.Reposition($('#left_panel').width()+7, $('.panel_buttons').position().top - list.GetFullHeight() + 13);
            list.DisableButton('group');
            list.DisableButton('close');
            list.Hide();

            var list_south = Containers.CreateHTMLContainer('list_south', App.CONTAINER_TYPE_SYSTEM,
                    new Dictionary(new Array())
                    );
            list_south.SetShowFristRowElements(1);
            list_south.Resize($('#horizon').width(), 0, 1);
            list_south.Reposition($('#left_panel').width() + 7, $('.panel_buttons').position().top - list_south.GetFullHeight() + 13);
            list_south.DisableButton('group');
            list_south.DisableButton('close');
            list_south.Hide();

            Horizon.RefreshPosition();
            Horizon.ToggleVisibility();

            $('.panel_buttons').width($(window).width() - 14);
            $('#panel_buttons_border').width($(window).width() - 14);
            $('.panel_buttons table').width($(window).width() - $('#gravity_trap').width() - $('#left_panel').width() - 14);
            $('.panel_buttons table').css('left', $('#left_panel').width());
            $('#gravity_trap').height($(window).height());
            $('#left_panel').height($(window).height());


            Search = new SearchController();

            switch (urlParams["viz"]) {
                case "1":
                    $('.page').css({
                        "background-color": "white"
                    });
                    break;
                case "2":
                    $('.page').css({
                        "background-color": "black"
                    });
                    break;
                case "3":
                    $('.page').css({
                        "background-color": "pink"
                    });
                    break;
                case "4":
                    $('.page').css({
                        "background-color": "#66ccff"
                    });
                    break;
            }

            actions = new Array();
            var action_ids = urlParams["action_id"].split(',');

            for (var index_action in action_ids) {
                var action = action_ids[index_action];

                if (action) {
                    $.getJSON(gateway + '&do=output-cmd&id=' + action, function(data) {
                        actions.push(data);
                        $('#selected_actions').append(
                                $('<input>', {
                            "type": "button",
                            "value": data[1],
                            "id": data[0]
                        }).click(function() {
                            my_actions($(this));
                        })
                                );
                    });
                }
            }

            if (urlParams['touch']) {
                touch = urlParams['touch']
            }
            else {
                touch = 0;
            }

            assign_speed(5);

            //App.InitFB();

            App.unblockUI();
        });

        $(document).on('keydown', '.clickarea', function(e) {
            console.log(e);
            if (e.which != 46) {
                return;
            }

            var GPs = Containers.arr();

            for (var i in GPs) {
                var GP = GPs[i];

                if ($(e.target).attr('id') == GP.GetUID()) {
                    GP.Close();
                    GP.Destroy();

                    return;
                }
            }
        });

        this.InitPanelPopUps();
    },
    InitPanelPopUps: function() {
        $('.panel_buttons td').each(function(k, v) {
            var button = $(v).find('img');
            var text = $(v).find('span').html();
            var UID = App.GetNewUID();


            $(button).hover(
                    function(event) {
                        var pos = $(this).position();
                        var position = AbsParent($(this));

                        var left = pos.left + 30;
                        var top = position.y + 50;
                        var popup = App.MakePopUp(UID, text, left, top, 'bottom');
                        popup.show();
                    },
                    function() {
                        $('#' + UID).hide();
                    }

            );

        });
    },
    InitFB: function() {
        window.fbAsyncInit = function() {
            // init the FB JS SDK
            FB.init({
                appId: '319311268160283', // App ID from the App Dashboard
                status: true, // check the login status upon init?
                cookie: true, // set sessions cookies to allow your server to access the session?
                xfbml: true  // parse XFBML tags on this page?
            });

            // Additional initialization code such as adding Event Listeners goes here

        };

        // Load the SDK's source Asynchronously
        (function(d, debug) {
            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
            ref.parentNode.insertBefore(js, ref);
        }(document, /*debug*/false));
    },
    InitItems: function() {
        var themes = {};

        $("div.img_list > category group").each(function() {
            if ($(this).parent().attr('name') == 'system') {
                return;
            }
            themes[$(this).attr('name')] = $(this).parent().attr('name');
        });

        for (var group in themes) {
            do_normalize(themes[group], group);
        }

        $('div.img_list').each(function() {
            //Events.ImagePointer($(this).attr('id'));
        });

        $('.image_container').css('display', 'block');

        //  imagePreview();

        Horizon.CreateHorizonMenu();
    },
    blockUI: function() {
//	var pics = new Array('G.png');
//	$.blockUI({
//	    css: {
//		'top': 120,
//		'border': 0,
//		backgroundColor: 'transparent'
//	    },
//	    message: '<img width="300" src="pics/' + pics[Math.floor(Math.random() * pics.length)] + '" /><br /><b>Loading...</b>'
//	});
        Render.Sleep();
    },
    unblockUI: function() {
//	$.unblockUI();
        Render.WakeUp();
    },
    ToggleVisibilityForSettings: function() {
        if (this.HiddenSettings) {
            $('#additional_settings').show();

            this.HiddenSettings = 0;
        }
        else {
            $('#additional_settings').hide();

            this.HiddenSettings = 1;
        }
    },
    GetEditMode: function() {
        return 0;
    },
    MakePopUp: function(UID, text, x, y, direction) {
        if (!$('#' + UID).length) {
            $.tmpl('popup', {
                "UID": UID,
                'text': text,
                'direction': direction
            }).appendTo('#page');
        }

        $('#' + UID).css({
            'left': x,
            'top': y
        });

        return $('#' + UID);

    },
    OpenGenesis: function() {
        window.open("index.html?db=" + App.urlParams['db'], '_blank');
    }
});