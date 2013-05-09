var dragTriggerElementID = 0;
var current_speed;
var speed_max = 5;
var speed_min = 1;
var speeds = [0,5,10,12,15,18];
var colors = ["red", "blue", "green", "brown", "#663399", "#666633", "#330099", "#009900"];
var color_index = 0;
var color_middle = "black";
var start_timer=0;
var timer_arr = new Array();
var moved = 0;
var DataElements;
var Containers;
var GravityElements;
var Grouping;
var ServerLoading;
var App;
var FeedPanel;
var Search;
var Report;
var Session;
var ServerCalls;
var Events;
var Timeline;
var GravityTrap;
var Operations;
var UI;
var Canvas;
var current_size = 50;
var canvas;
var gateway;
var touch;
var actions;

$(window).load(function() {
    App = new AppController();
    App.InitApp();
});

function AbsParent(HTMLel) {
    var point = new Object();

    point.x = 0;
    point.y = 0;

    var p = HTMLel.parent();
    
    while(p.length && p.prop("tagName") != 'BODY') {
        if (p.css('position') == 'absolute' || p.css('position') == 'fixed') {
            point.x += p.position().left;
            point.y += p.position().top;
        }
        p = p.parent();
    }
    

    return point;
}
function AttrFix(str)
{   
    str = str.replace(/_/g, ' ');
    return str.replace(/\w*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function noise_word(word, item) {
    $.get(gateway+'&do=noise_word&word='+word);
    $(item).parent().hide();
}

function add_attr() {
    var attr = $('#add_attr').val();
    
    var c = Containers.get('selected');
    $(c.DataElements.GetAsArray()).each(function(k, v){
        v.AddAttribute(GravityElements.GetAttr(attr), $('#add_attr_check').is(':checked'));
    });
}
    
function drawLineBetweenContainers(c1, c2, color, width){
    c1 = Containers.get(c1);
    c2 = Containers.get(c2);

    if (c1 && c1.Hidden == 0 && c2 && c2.Hidden == 0) {
        var p1 = c1.GetGPCoords();
        var p2 = c2.GetGPCoords();
        
        Canvas.DrawLine(p1.x, p1.y, p2.x, p2.y, color, width);
    }
}

function place_at(id, x, y) {
    $("#"+id).css({
        left: x,
        top: y
    });
}
function increase_img()
{
    size = 10;
    if (current_size<=73)
    {
        current_size+=10;
    }
    set_img_size(size);
}
function set_img_size(size)
{
    var elements = DataElements.GetAsArray();
    if (elements)
    {
        for (e in elements)
        {
            var container =  Containers.findByItem(elements[e]);
            if (container != 'selected')
            {
                if(size == 10)
                { 
                    $('#'+elements[e].UID+' img').css({
                        'width': current_size, 
                        'height': current_size
                    });
                   
                }
                else
                {
                    $('#'+elements[e].UID+' img').css({
                        'width': current_size, 
                        'height': current_size
                    });
                  
                }
            }
            else
            {
                var img_size = parseInt($('#'+elements[e].UID+' img').css('width'));
                if (img_size+size>=33 && img_size+size<= 83 )
                {
                    $('#'+elements[e].UID+' img').css({
                        'width': img_size+size, 
                        'height': img_size+size
                    });
                }
            }
        }
    }
}
function decrease_img()
{
    size = -10;
    if (current_size>=43)
    {
        current_size-=10;
    }
    set_img_size(size);
}

function my_actions(item) {
    for (var a in actions) {
        var action = actions[a];

        if (action[0] == item.attr('id')) {
            my_actions_open(action[2]);
        }
    }
}
function my_actions_open(url)
{
    var items = GravityTrap.GetTrappedElements();
    
    for (var a in items)
    {
        var openurl = $('#'+items[a].key).find('info').attr('site');

        if (openurl.search('news.google.com') != -1) {
            var urlstr = /url=(.*)/;
            urlstr = urlstr.exec(openurl);
            if (urlstr && urlstr[1]) openurl = urlstr[1];
        }
        
        window.open(url.replace('[object.url]', escape(openurl)));
        self.focus();
    }
}

function show_and_or(container_id)
{
    var checked = $('#container_'+container_id+' input[value=or]').attr('checked');
    var cont = $('#container_'+container_id+' .info_selected td:first-child').text();
    if (checked == true)
    {
        if (cont.search(' OR') == -1 )
        {
            cont= cont + ' OR';
        }  
    }
    else
    {
        cont= cont.replace(' OR' , '');
    }
    $('#container_'+container_id+' .info_selected td:first-child').text(cont);
}
function my_open() 
{ 
    var items = GravityTrap.GetTrappedElements();
    
    for (var a in items)
    {
        var DE = items[a];
        
        var openurl = DE.GetURL();

        if (openurl.search('news.google.com') != -1) {
            var urlstr = /url=(.*)/;
            urlstr = urlstr.exec(openurl);
            if (urlstr && urlstr[1]) openurl = urlstr[1];
        }
        
        window.open(openurl);
        self.focus();
    }
}

function fast_speed() {
    current_speed = 5;
    assign_speed(current_speed);
            
}
function slow_speed() {
    current_speed = 1;
    assign_speed(current_speed);
}

function inc_speed() {
    if (current_speed == speed_max) {
        return;
    }
    else {
        current_speed++;
        assign_speed(current_speed);
    }
}

function dec_speed() {
    if (current_speed == speed_min)
    {
        return
    }
    else {
        current_speed--;
        assign_speed(current_speed);
    }
}

function assign_speed(speed) {
    current_speed = speed;
    
    for (a in timer_arr) {
        timer_arr[a].speed = speeds[current_speed];
        timer_arr[a].step_x = timer_arr[a].resX/speeds[current_speed];
        timer_arr[a].step_y = timer_arr[a].resY/speeds[current_speed];
    }

    $('#current_speed1').html(current_speed);
    $('#current_speed2').html(speeds[current_speed]);
}

