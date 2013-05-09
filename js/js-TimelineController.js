var TimelineController = Class.extend({
    init: function() {
        this.HTMLel = $('#timeline');

        var timeline = this;

        this.HTMLel.find('#timeline_save').click(function() {
            timeline.Save();
        });
        this.HTMLel.find('#timeline_start').click(function() {
            timeline.Start();
        });
        this.HTMLel.find('#timeline_stop').click(function() {
            timeline.Stop();
        });
        this.HTMLel.find('#timeline_next').click(function() {
            timeline.Next();
        });
        
        this.Load();
        this.Stop();
		
		this.ToggleVisibility();
    },

    Init: function() {
        this.timer = 0;
        this.iteration = 0;
    },

    ToggleVisibility: function() {
        if (this.Hidden) {
            this.HTMLel.show();

            this.Hidden = 0;

            Horizon.Show();
        }
        else {
            this.HTMLel.hide();

            this.Hidden = 1;
        }
    },

    Save: function() {
        var timeline = this;
        
        $.get(gateway+"&do=timeline_save&dates=" + timeline.HTMLel.find('#timeline_input').val(), function() {
            timeline.Load();
            alert('Dates are saved.');
        });
    },
    
    Load: function() {
        var timeline = this;
        
        $.get(gateway + "&do=timeline_load", function(data) {
            timeline.dates = data.split(',');
            timeline.HTMLel.find('#timeline_input').val(timeline.dates);
            
            timeline.Init();
            timeline.ShowCurrentDate();

            timeline.Update(-1);
        });
    },
    
    Start: function() {
        this.Init();
        
        var obj = this;

        obj.Next();
        this.timer = setInterval(function() {
            obj.Next();
        }
        ,9000);
        
        this.HTMLel.find('#timeline_stop').show();
        this.HTMLel.find('#timeline_start').hide();
    },
    
    Stop: function() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.HTMLel.find('#timeline_stop').hide();
        this.HTMLel.find('#timeline_start').show();
    },
    
    Next: function() {
        this.ShowCurrentDate();

        this.Update(this.iteration);

        this.iteration++;
        
        if (this.iteration == this.dates.length) {
            this.Stop();
            this.Init();
            
            return
        }
    },

    Update: function(current) {
        var timeline = this;
        
        $('#timeline_progress').empty();
        $(timeline.dates).each(function(k, v) {
            var li = $('<li>').click(function() {
                timeline.Update(k);
            }).text(v);

            if (v == timeline.dates[current]) {
                $('#timeline_progress').append(li.addClass('selected'));

                Horizon.LoadActive(' ' , ' ', timeline.dates[current]);
                Movement.Teleport();
                Horizon.Move();
            }
            else {
                $('#timeline_progress').append(li.text(v));
            }
        });
    },
    
    ShowCurrentDate: function() {
        //this.HTMLel.find('#timeline_date').text(this.dates[this.iteration]);
    }
});