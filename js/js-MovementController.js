var MovementController = Class.extend({
    init: function() {
        this.vectors = new goog.structs.Map;

        this.timer = 0;
    },
    remove: function(key) {
        var vector = this.vectors.get(key);

        if (vector) {
            this.vectors.remove(key);

            if (this.vectors.getCount() == 0)
            {
                clearInterval(this.timer);

                this.timer = 0;
            }

            var item = DataElements.get(vector.id);

            if (item) {
                item.GroupingEnded();

                if (vector.deferred) {
                    vector.deferred.resolve(item);
                }
            }
            else {
                console.log("Not DE moving: " + vector);
            }
        }
    },
    pause: function(key) {
        var vector = this.vectors.get(key);

        if (vector) {
            vector.pause = 1;
        }
    },
    restart: function(key) {
        var vector = this.vectors.get(key);

        if (vector) {
            vector = vector_refresh_position(vector);
            vector = timer_refresh_steps(vector);
            vector.pause = 0;

            return 1;
        }

        return 0;
    },
    vector_refresh_position: function(vector) {

        vector.vector.a.x = vector.ob_id.position().left;
        vector.vector.a.y = vector.ob_id.position().top;

        return vector;
    },
    get_vector: function(x1, y1, x2, y2) {
        var vector = new Object;

        var a = new Object;
        a.x = x1;
        a.y = y1;
        var b = new Object;
        b.x = x2;
        b.y = y2;

        vector.a = a;
        vector.b = b;

        return vector;
    },
    refresh_vector: function(vector, x, y) {
        vector.vector = null;

        var item = DataElements.get(vector.id);

        vector.vector = this.get_vector(item.GetX(), item.GetY(), x, y);
    },
    timer_refresh_steps: function(vector) {
        vector.step_x = (vector.vector.b.x - vector.vector.a.x);
        vector.step_y = (vector.vector.b.y - vector.vector.a.y);

        var m = 1.0 / Math.sqrt(vector.step_x * vector.step_x + vector.step_y * vector.step_y);

        vector.step_x *= m;
        vector.step_y *= m;

        vector.step_x *= vector.speed;
        vector.step_y *= vector.speed;
    },
    add: function(id, x, y, speed, deferred)
    {
        var exists = this.vectors.get(id);

        if (exists) {
            this.remove(id);
        }

        var vector = new Object;
        vector.id = id;
        vector.ob_id = $('#' + id);
        vector.speed = speeds[speed];
        vector.deferred = deferred;

        this.refresh_vector(vector, x, y);

        this.timer_refresh_steps(vector);

        vector.pause = 0;

//        if (this.timer == 0)
//        {
//            var obj = this;
//
//            this.timer = setInterval(function() {
//                obj.move();
//            }
//            , 100);
//        }
//
//        this.vectors.set(id, vector);
        var item = DataElements.get(vector.id);
        Render.Add('#' + vector.id, 'move', [
            {
                'left': vector.vector.b.x,
                'top': vector.vector.b.y
            },
            {
                'duration': 5000,
                'complete': function() {
                    if (deferred) {
                        deferred.resolve(item);
                    }
                }
            }
        ]);
        return vector;
    },
    move: function()
    {
        var moved_x, moved_y;

        var arr = this.vectors.getValues();

        for (var a in arr)
        {
            var timer = arr[a];

            if (timer.pause) {
                continue;
            }

            var item = DataElements.get(timer.id);

            if (Math.abs(timer.vector.a.x + timer.step_x - timer.vector.b.x) > Math.abs(timer.step_x))
            {
                timer.vector.a.x += timer.step_x;

                moved_x = 1;

//                Render.Add('#' + timer.id, 'position', {"left": Math.round(timer.vector.a.x)});
//                item.x = Math.round(timer.vector.a.x);
                Render.Add('#' + timer.id, 'move', {"left": "+=" + Math.round(timer.step_x) + "px"});
            }
            else
            {
                moved_x = 0;

                Render.Add('#' + timer.id, 'move', {"left": Math.round(timer.vector.b.x)});
//                Render.Add('#' + timer.id, 'position', {"left": Math.round(timer.vector.b.x)});
//                item.x = Math.round(Math.round(timer.vector.b.x));
            }

            if (Math.abs(timer.vector.a.y + timer.step_y - timer.vector.b.y) > Math.abs(timer.step_y)) {
                timer.vector.a.y += timer.step_y;

                moved_y = 1;
                Render.Add('#' + timer.id, 'move', {"top": "+=" + Math.round(timer.step_y) + "px"});

//                Render.Add('#' + timer.id, 'position', {"top": Math.round(timer.vector.a.y)});
//                item.y = Math.round(timer.vector.a.y);
            }
            else {
                moved_y = 0;
                Render.Add('#' + timer.id, 'move', {"top": Math.round(timer.vector.b.y)});

//                Render.Add('#' + timer.id, 'position', {"top": Math.round(timer.vector.b.y)});
//                item.y = Math.round(timer.vector.b.y);
            }

            if (moved_x == 0 && moved_y == 0) {
                this.remove(timer.id);
            }
        }
    },
    Teleport: function() {
        var arr = this.vectors.getValues();

        for (var a in arr) {
            var vector = arr[a];

            vector.speed = 10000;
            this.timer_refresh_steps(vector);

            this.vectors.set(vector.id, vector);
        }
    },
    StartAll: function() {
        var arr = this.vectors.getValues();

        for (var i in arr) {
            var vector = arr[i];

            vector.pause = 0;

            this.vectors.set(vector.id, vector);
        }
    }
});