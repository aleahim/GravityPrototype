function move_to_y(relative_to, selector, offset) {
    if (!offset) {
        offset = 0;
    }
    if (relative_to[0] != '.') {
        relative_to = '#'+relative_to;
    }
    var move_speed = current_speed;
    $("#"+selector).each(function() {
        var type = 0;
        timer_add($(this).attr('id') , $(this).position().left , $(relative_to).position().top+offset, move_speed , null , null ,type);
    });
}
function passive()
{
   Grouping.passive();
}
function release()
{
    var selected_items = Containers.get('selected').DataElements.GetAsArray(); 
    
    for (a in selected_items)
    {    
        var item = selected_items[a];
        
        var key = item.UID;
        //console.log(item , key);
        Containers.get('list').DataElements.add(item);
        Containers.get('selected').DataElements.remove(key);
         
        $("#"+item.GetHTMLid()+" img").css({
            'width' : current_size, 
            'height' : current_size
        });
        move_to_y('container_list', key);
    }
}

function release_drag()
{
    var containers = Containers.GetAsArray();

    for (var a in containers) {
        var container = containers[a];

        if (container.IsStatic == 0) {
            container.Release();
        }
    }
}