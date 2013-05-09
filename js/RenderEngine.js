var RenderEngine = Class.extend({
    init: function() {
	this.ClearQ();
	this.ClearBuffer();
	this.ClearCMDs();
	this.ClearCache();

	(function() {
	    var lastTime = 0;
	    var vendors = ['ms', 'moz', 'webkit', 'o'];
	    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
			|| window[vendors[x] + 'CancelRequestAnimationFrame'];
	    }

	    if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
		    var currTime = new Date().getTime();
		    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		    var id = window.setTimeout(function() {
			callback(currTime + timeToCall);
		    },
			    timeToCall);
		    lastTime = currTime + timeToCall;
		    return id;
		};

	    if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
		    clearTimeout(id);
		};
	}());

	this.WakeUp();
    },
    Loop: function() {
	var obj = this;

	(function animloop() {
	    if (obj.sleep === false) {
		obj.Render();
		window.requestAnimationFrame(animloop);
	    }
	})();
    },
    Sleep: function() {
	this.sleep = true;
    },
    WakeUp: function() {
	this.sleep = false;

	this.Loop();
    },
    Add: function(selector, type, data) {
	this.q.push({
	    'type': type,
	    'data': data,
	    'selector': selector
	});
    },
    Render: function() {
	if (this.q.length === 0) {
	    return;
	}

	this.LoadBuffer();
	this.ParseBuffer();

	this.ClearQ();
	this.ClearBuffer();
	this.ClearCMDs();
    },
    LoadBuffer: function() {
	for (var a in this.q) {
	    var action = this.q[a];

	    this.buffer.add(App.GetNewUID(), action);
	}
    },
    ParseBuffer: function() {
	var buffer = this.buffer.getMap();

	for (var a in buffer) {
	    var selector = buffer[a][0].selector;
	    var obj = $(selector);
	    var actions = buffer[a];

	    var cached = this.cache.get(obj.selector);
	    if (!cached) {
		this.cache.set(obj.selector, obj);
	    }
	    var header = this.cache.get(obj.selector);

	    var cmds = new omMap();

	    for (var b in actions) {
		var action = actions[b];

		switch (action.type) {
		    case 'remove':
			cmds.add('remove', {'func': 'remove', 'params': []});
			break;
		    case 'empty':
			cmds.add('empty', {'func': 'empty', 'params': []});
			break;
		    case 'appendTo':
			cmds.add('appendTo', {'func': 'appendTo', 'params': [action.data]});
			break;
		    case 'append':
			cmds.add('append', {'func': 'append', 'params': [action.data]});
			break;
		    case 'position':
			cmds.add('position', {'func': 'css', 'params': [action.data]});
			break;
		    case 'move':
			action.data[1].easing = 'linear';
			action.data[1].queue = false;
			cmds.add('move', {'func': 'animate', 'params': action.data});
			break;
		    case 'show':
			cmds.add('show', {'func': 'show', 'params': []});
			break;
		    case 'hide':
			cmds.add('hide', {'func': 'hide', 'params': []});
			break;
		}
	    }

	    var cmds = cmds.getMap();

	    for (var c in cmds) {
		var cmd = cmds[c];

		cmd = cmd[cmd.length - 1];

		header[cmd.func].apply(header, cmd.params);
	    }
	}
    },
    ClearQ: function() {
	if (this.q) {
	    delete this.q;
	}

	this.q = new Array();
    },
    ClearBuffer: function() {
	if (this.buffer) {
	    delete this.buffer;
	}

	this.buffer = new omMap();
    },
    ClearCMDs: function() {
	if (this.cmds) {
	    delete this.cmds;
	}

	this.cmds = new Array();
    },
    ClearCache: function() {
	if (this.cache) {
	    delete this.cache;
	}

	this.cache = new goog.structs.Map;
    },
    GetDistance: function(a, b) {
	var xs = b.GetX() - a.GetX();
	xs = xs * xs;

	var ys = b.GetY() - a.GetY();
	ys = ys * ys;

	return Math.sqrt(xs + ys);
    },
    GetSpeedMS: function(a, b, v) {
	v = 150;
	var s = this.GetDistance(a, b);
	var t = s / v * 1000;
	t = parseInt(t);

	return t;
    }
});