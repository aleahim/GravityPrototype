var HorizonController = Class.extend({
    init: function() {
        this.HorizonImg =   '#horizon_img img';
        this.HorizonTitle = '#horizon_title';
        this.HorizonDate = '#horizon_date';
        this.DPid = '#datepicker';
        
        this.direction = 0;
        
        this.CreateHorizon();
        this.CreateDatePicker();
        this.CreateHorizonMenu();
        
        this.HTMLel = $('#horizon');

        this.LoadActive('' , '', '');

        LandingZones.AddZone('#horizon', [DataElement], 60, 'width', $('#horizon').height() + 90, 0);
    },
    
    ChangeDirection: function() {
        if (this.direction) {
            this.direction = 0;
            $('#horizon_dir').css({
                'background-color' : '#f0f0f0'
            });
        }
        else {
            this.direction = 1;
            $('#horizon_dir').css({
                'background-color' : '#CB540A'
            })
        }
        this.Move();
    },
    
    RefreshPosition: function() {
        $('#datepicker').css({
            top: $('#horizon').offset().top-240
        });
        $('#horizon_menu table').css({
            left: $('#horizon').offset().left-8,
            top: $('#horizon').offset().top + 3
        });

        var north = Containers.get('list');
        var south = Containers.get('list_south');

        if (south && north) {
            north.Reposition($('#horizon').offset().left - 8, $('#horizon').offset().top - 100 - $(document).scrollTop());
            south.Reposition($('#horizon').offset().left - 8, $('#horizon').offset().top + $('#horizon').height() + 5 - $(document).scrollTop());
        }
    },
    
    CreateHorizon: function()
    {
        $.tmpl('horizon_tmpl').appendTo('#page');
        
	var height = $(window).height() - 200;
	console.log(height);
        $('#horizon').css({
            left: $('#feed_panel').width() + 5,
            top: height 
        });
	

        $('#horizon').width(App.SCREEN_WIDTH - $('#horizon').position().left - $('#gravity_trap').width() - 20);
        $('#horizon_active').width($('#horizon').width());
        $('#horizon_menu table').width($('#horizon').width());

        $(window).resize(function(){
            $('#horizon').width($(window).width()-$('#horizon').position().left - $('#container_selected').width()-10);
            $('#horizon_active').width($('#horizon').width());
            $('#horizon_menu table').width($('#horizon').width());
            
            Horizon.RefreshPosition();
        });
        
        $.tmpl('horizon_drop_tmpl').appendTo('.page');
        $('#horizon_drop').width($('#horizon').width()-2);
        
        $('#horizon_dir').bind('click', function() {
            Horizon.ChangeDirection();
        });        
        $('#horizon_calendar').bind('click', function() {
            Horizon.ShowHideDatePicker();
        });
        $('#horizon_menu_button').bind('click', function() {
            Horizon.ShowHideHorizonMenu();
        });
        $('#horizon_ontop_button').bind('click', function() {
            Horizon.LoadActive('' , '', '');
            Horizon.Move();
        });
        
        this.drag = new Pointer('horizon');
        this.drag.bind('move', function (event) {
            $(event.HTMLel).css({
                top: event.EndY-15+event.ScrollTop
            });
        
            Horizon.RefreshPosition();
        }).bind('dragend', function(event) {
            App.blockUI();
            Horizon.Move();
            App.unblockUI();
        });
    },
    
    CreateDatePicker:function ()
    {
        $(this.DPid).datepicker({
            gotoCurrent: true,
            changeYear: true,
            yearRange: "1900:2012",
            
            onSelect: function(dateText, inst) {
                Horizon.LoadActive('' , '', dateText);
                Horizon.ShowHideDatePicker();
                Horizon.Move();
            }
        });
        
        this.DPhidden = 0;
        this.ShowHideDatePicker();
        
        var top = $('#horizon_calendar').offset().top;
        var left = $('#horizon_calendar').offset().left;
        $(this.DPid).css({
            top: top-50-$(this.DPid).height(),
            left: left-$(this.DPid).width()
        });
    },

    GetX: function() {
        return this.HTMLel.position().left;
    },

    GetY: function() {
        return this.HTMLel.position().top + $(document).scrollTop();
    },
    
    GetWidth: function() {
        return this.HTMLel.width();
    },

    GetHeight: function() {
        return this.HTMLel.height();
    },

    IsVisible: function() {
        return this.Hidden == 0;
    },

    ToggleVisibility: function() {
        if (this.Hidden) {
            this.Show();
        }
        else {
            $('#horizon').hide();
            $('#horizon_drop').hide();

            this.Hidden = 1;
        }
    },

    Show: function() {
        $('#horizon').show();
        $('#horizon_drop').show();

        this.RefreshPosition();

        this.Hidden = 0;
    },

    ShowHideDatePicker: function()
    {
        if (this.DPhidden) {
            $(this.DPid).show();
            this.DPhidden = 0;
        }
        else {
            $(this.DPid).hide();
            this.DPhidden = 1;
        }
    },
    
    CreateHorizonMenu: function()
    {
        $('#horizon_menu').remove();
        $('#page').append('<div id="horizon_menu" style="border: 1px solid black"><table></table></div>');
        
        var DE = DataElements.GetAsArray().sort(function(a, b) {
            if (!a.date || !b.date) {
                return 0;
            }
            if (new Date(a.date) < new Date(b.date)) {
                return -1;
            }
            else if (new Date(a.date) > new Date(b.date)) {
                return 1;
            }
            return 0;
        });
        for (var a in DE)
        {
            if (!DE[a].date) {
                continue;
            }
            
            $.tmpl('horizon_menu_tmpl', {
                "id": DE[a].GetUID(),
                "src": DE[a].image,
                "title":DE[a].title,
                "date":DE[a].date
            }).appendTo('#horizon_menu table');  
        }
        
        $('#horizon_menu td').bind('click' , function() {
            Horizon.ChangeActiveMenu($(this).parent().attr('id'));
            Horizon.ShowHideHorizonMenu();
            Horizon.Move();
        });
        
        $('#horizon_menu table').width($('#horizon').width());
        
        this.MenuHidden = 0;
        this.ShowHideHorizonMenu();
    },
    
    ShowHideHorizonMenu: function()
    {
        if (this.MenuHidden) {
            $('#horizon_menu').show();
            this.MenuHidden = 0;
        }
        else {
            $('#horizon_menu').hide();
            this.MenuHidden = 1;
        }
    },
    
    LoadActive: function(img , title , date) {
        if (!img) {
            img = 'blank.png';
        }
        //$(this.HorizonImg).attr('src', img);
        $(this.HorizonTitle).text(title);
        if (date) {
            date = (new Date(date)).format('longDate');
        }
        $(this.HorizonDate).text(date);
    },
    
    GetDate: function(){
        return  $('#horizon_date').text();
    },
    
    ChangeActiveMenu: function(id){
        var src =  $('#' + id + ' img').attr('src');
        var title = $('#' + id +' span.horizon_menu_title').text();
        var date = $('#' + id +' span.horizon_menu_date').text();
        
        this.LoadActive( src , title , date );
    },
    
    ChangeActiveDE: function(DE) {
        this.LoadActive(DE.GetImage(), DE.GetTitle(), DE.GetDate());
    },
    
    returnID: function() {
    
    },
    
    IsDroppedIn: function(x, y) {
        var box_x = $('#horizon').position().left;
        var box_y = $('#horizon').position().top - 60;
        var box_x_end = box_x + $('#horizon').width();
        var box_y_end = box_y + $('#horizon').height() + 90;
        
        //console.log(x,box_x,box_x_end, y,box_y, box_y_end);
        
        if (x > box_x && x < box_x_end && y > box_y && y < box_y_end) {
            return true;
        }
        
        return false;
    },
    
    DropIn: function(x, y , id)
    {
        var DE = DataElements.get(id);
        if (this.IsDroppedIn(x, y) && DE) {
            this.ChangeActiveDE(DE);
            this.Move();
            
            DE.IsNotActive();
            
            return true;
        }
        
        return false;
    },    
    
    Move: function() {
        DEs = DataElements.arr();

        var start_movement = false;

        var date_horizon = new Date(this.GetDate());

        for (var index in DEs) {
            var DE = DEs[index];
            
            DE.HideAttrsList();
            
            var date = new Date(DE.date);

            var dir;
            
            if (this.direction) {
                if (date_horizon < date) {
                    dir = 0;
                } 
                else {
                    dir = 1;
                }
            }
            else {
                if (date_horizon < date) {
                    dir = 1;
                }
                else {
                    dir = 0;
                }
            }
            
            if (dir) {
                if (DE.GetWorkspace() == 1) {
                    DE.SetWorkspace(2);

                    start_movement = true;
                }
            }
            else {
                if (DE.GetWorkspace() == 2) {
                    DE.SetWorkspace(1);
                    
                    start_movement = true;
                }
            }
        }

        var north = Containers.get('list');
        var south = Containers.get('list_south');

        this.RefreshPosition();
        
        if (start_movement) {
            Grouping.Move();
        }
    }
})