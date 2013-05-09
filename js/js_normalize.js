

function do_normalize(category, group) {
    var sum = 0;
    var num = 0;

    var min = 'start';
    var max = 'start';

    $("div.img_list > category[name='"+category+"'] > group[name='"+group+"'] > gravity").each(function() {
        num = parseFloat($(this).attr('value'));
        if (isNaN(num)) {
            num = 0;
        }
        if (max == 'start') {
            max = num;
            min = num;
        }
        else {
        if (num < min) {
            min = num;
        }
        if (num > max) {
            max = num;
        }
        }
        sum += Math.pow(num, 2);
    });

    sum = Math.sqrt(sum);

    $("div.img_list > category[name='"+category+"'] > group[name='"+group+"'] > gravity").each(function() {
        num = parseFloat($(this).attr('value'));
        if (isNaN(num)) {
            num = 0;
        }
        else {
            num = parseFloat($(this).attr('value'));
        }

        var norm = Math.round(1 + (num-min)*(5-1)/(max-min));
        if (norm !== 0) {
            if (isNaN(norm)) {
                norm = 5;
            }
            $(this).attr('relative', $(this).attr('value'));
            $(this).attr('value', norm);
        }
    });
}
function normalize_speed(speed) {
    switch (true) {
        case speed == 0:
            return 0;
        case speed < 0.2:
            return 1;
        case speed > 0.2 && speed < 0.4:
            return 2;
        case speed > 0.4 && speed < 0.6:
            return 3;
        case speed > 0.6 && speed < 0.8:
            return 4;
        case speed > 0.8:
            return 5;
    }
}