function my_open() {
    $('input:checked').each(function() {
        window.open($(this).parent().parent().find('a').attr('href'));
        self.focus();
    });
}
var urlParams = {};
var gateway;
var columns = {
    'feeds' : ['data_xml_feed_id','title','time_added','image','type','active','notes'],
    'items' : ['data_xml_feed_id','data_xml_item_id','type','image','url','title','desc'],
    'attrs' : ['data_xml_feed_id','data_xml_item_id','data_xml_attr_id','attr_type','attr_name','attr_value']
}
var report;
var DOMap;

$(window).load(function() {
    DOMap = new goog.structs.Map;
    GPMap = new goog.structs.Map;
	
    var e,
    a = /\+/g,  // Regex for replacing addition symbol with a space
    r = /([^&=]+)=?([^&]*)/g,
    d = function (s) {
        return decodeURIComponent(s.replace(a, " "));
    },
    q = window.location.search.substring(1);

    while (e = r.exec(q))
        urlParams[d(e[1])] = d(e[2]);
       
    $('#items_fields').attr('value', "data_xml_feed_id\tdata_xml_item_id\ttype\timage\turl\ttitle\tdesc");
    $('#attrs_fields').attr('value', "data_xml_feed_id\tdata_xml_item_id\tdata_xml_attr_id\tattr_type\tattr_name\tattr_value");

    gateway = "php/gateway.php?db=" + urlParams['db'];
    report_id = urlParams['report'];
    
    var pics = new Array('G.png');
    $.blockUI({
        css: {
            'top': 120, 
            'border': 0, 
            backgroundColor: 'transparent'
        }, 
        message: '<img width="300" src="pics/'+pics[Math.floor(Math.random()*pics.length)]+'" /><br /><b>Loading...</b>'
    });
    
    $.getJSON(gateway+'&do=report_load&report_id=' + report_id, function(data) {
        report = data;
        
        load_report();
    });
});

function load_into_textarea(htmlid, data) {
    $(htmlid).val($(htmlid).val() + data.join("\t") + "\n");
}

function load_report() {
    var horizon_shown = false;
    
    for (var a in report.grouping_points) {
        GP = report.grouping_points[a];
        if (horizon_shown == false && GP.workspace == 2) {
            if (report.horizon_active_date) {
                $.tmpl('report_horizon', {
                    "date": report.horizon_active_date
                }).appendTo('#report');
            }
        }

        DOMap.set(GP.report_grouping_point_id, GP);
        for (var i in GP.data_objects){
            GPMap.set(GP.data_objects[i].do_id, GP);
        }

        $.tmpl('report', {
            "GP_id" : GP.report_grouping_point_id
        }).appendTo('#report');
		
        $.tmpl('report_headline', {
            "GP_id" : GP.report_grouping_point_id,
            "color": GP.color,
            "expression": GP.name,
            "is_selected": +GP.in_gravity_trap,
            "operator": GP.operator,
            "length": GP.data_objects_count,
            "num1": GP.sum1,
            "num2": GP.sum2
        }).appendTo('#'+GP.report_grouping_point_id);
        
        var chain = new Array();
        for (var i in GP.data_objects) {
            var DOid = GP.data_objects[i].do_id;

            var def = $.getJSON(gateway+'&do=load_data_object&id=' + DOid, function(data) {
                var DO = data.data;
                var attrs = data.attrs;
        
                DOMap.set(data.id, data);
			
                var
                num1 = 0,
                num2 = 0,
                date = '';
            
                for (var n in attrs) {
                    var attr = attrs[n];
                
                    switch (attr.attr_name) {
                        case 'num1':
                            num1 = attr.attr_value;
                            break;
                        case 'num2':
                            num2 = attr.attr_value;
                            break;
                        case 'date':
                            date = attr.attr_value;
                            break;
                    }
                
                    load_into_textarea('#attrs', [ attr.data_xml_feed_id, attr.data_xml_item_id, attr.data_xml_attr_id, attr.attr_type, attr.attr_name, attr.attr_value ]);
                }

                var GP_DO = GPMap.get(DO.data_xml_item_id);
                $.tmpl('report_line', {
                    "id": DO.data_xml_feed_id,
                    "color": GP_DO.color,
                    "img": DO.image,
                    "is_selected": +GP_DO.in_gravity_trap,
                    "date": date,
                    "headline": DO.title,
                    "site": DO.url,
                    "url": DO.url,
                    "output_line": '',
                    "attrs": fillAtrr(DO.data_xml_item_id),
                    'num1' : num1,
                    'num2' : num2,
                    'item_id' : DO.data_xml_item_id
                }).appendTo('#'+ GP_DO.report_grouping_point_id);
			
                load_into_textarea('#items', [ DO.data_xml_feed_id, DO.data_xml_item_id, DO.type, DO.image, DO.url, DO.title, DO.desc ]);
            });
            
            chain.push(def);
        }
    }
    
    $.when.apply(null, chain).then(function() {
        $.unblockUI();
    });    
}

// CHECK/UNCHECK ALL

function CheckAll(GP_ID){
    var GPCHECK = DOMap.get(GP_ID);
	
    var checked = $("#GP" + GP_ID).is(":checked");
	
    var ObjectsIn = GPCHECK.data_objects;

    for (var i in ObjectsIn){
        $('input[type=checkbox]').each( function() {
            if($(this).val()==ObjectsIn[i].do_id)
                this.checked = checked;
        });
    }
} 

function fillAtrr(DO_id){
    var DO = DOMap.get(DO_id);
    var DO_attr = DO.attrs;
	
    var AttrArray = new Array();
    for (var n in DO_attr) {
        var attr = DO_attr[n];
        if (attr.attr_type == "general"){
            AttrArray.push(" "+attr.attr_name) ;
        }
    }
    return AttrArray; 
}

//POP UP EDIT DATA OF OBJECT

function fillPopUp(DO_id){

    $("#item_info").val('');
    $("#item_attrs").val('');

    var DO = DOMap.get(DO_id);
    var DO_obj = DO.data;
    var DO_attr = DO.attrs;
	
    //POSITIONING POP UP DIV
    var w = $(window).width();
    var h = $(window).height();
    var d = document.getElementById('report_item_edit');
    var divW = $(d).width();
    var divH = $(d).height();

    d.style.position="fixed";
    d.style.top = (h/4)-(divH/2)+"px";
    d.style.right = (w/3)-(divW/2)+"px";
    $("#report_item_edit").show();
	
    load_into_textarea('#item_info', [ DO_obj.data_xml_feed_id, DO_obj.data_xml_item_id, DO_obj.type, DO_obj.image, DO_obj.url, DO_obj.title, DO_obj.desc ]);
	
    var num1 = 0,
    num2 = 0,
    date = '';
	
    for (var n in DO_attr) {
        var attr = DO_attr[n];
                
        switch (attr.attr_name) {
            case 'num1':
                num1 = attr.attr_value;
                break;
            case 'num2':
                num2 = attr.attr_value;
                break;
            case 'date':
                date = attr.attr_value;
                break;
        }
                
        load_into_textarea('#item_attrs', [ attr.data_xml_feed_id, attr.data_xml_item_id, attr.data_xml_attr_id, attr.attr_type, attr.attr_name, attr.attr_value ]);
    }
}
function closePopUp(){
    $("#report_item_edit").hide();
    $("#item_info").val('');
    $("#item_attrs").val('');
}


function delete_item(id) {
    if (confirm('Are you sure?')) {
        $.get(gateway+'&do=item_delete&id='+id.replace('img_',''), function() {
            alert('Deleted');
        });
    }
}
function update_image(id) {
    $.get(gateway+'&do=item_update_image&id='+id.replace('img_', '')+'&img='+escape($('#'+id+'_img').val()), function() {
        alert('Image updated.');
    });
}

function getdata(dbid, htmlid, proc) {
    $.post(gateway+'&do=' + proc, {
        'dbid' : dbid
    }, function(data) {
        if (data) {
            $(htmlid).val('');

            var rows = data.split('@@DELIM_ROWS@@');

            for (var i in rows) {
                var row = rows[i];

                row = row.split('@@DELIM_COLS@@');

                row = row.join("\t");

                $(htmlid).val($(htmlid).val() + row + "\n");
            }

            switch (htmlid) {
                case '#feeds':
                    loadfeeds();
                    break;
                case '#items':
                    loaditems();
                    break;
            }

            update_rows_count(htmlid, htmlid + '_count');
        }
    });
}

function setdata(dbid, htmlid, proc) {
    var data = $(htmlid).val();

    data = data.split("\n");
    for (var a in data) {
        var row = data[a];
                
        row = row.split("\t");
        row = row.join('@@DELIM_COLS@@');
                    
        data[a] = row;
    };
    data = data.join('@@DELIM_ROWS@@');

    return $.post(gateway+'&do=' + proc, {
        'dbid' : dbid, 
        'data' : data
    }, function(data) {
        alert('Request sent.');
    });
}

function get_data_string_from_textarea(htmlid) {
    var data = $(htmlid).val();
                
    data = data.split("\n");
    for (var a in data) {
        var row = data[a];
                
        row = row.split("\t");
        row = row.join('@@DELIM_COLS@@');
                    
        data[a] = row;
    };
    data = data.join('@@DELIM_ROWS@@');

    return data;
}
            
var $idown;  // Keep it outside of the function, so it's initialized once.
function downloadURL(url) {
    url = 'php/download.php?fname=' + url;
                
    if ($idown) {
        $idown.attr('src',url);
    } else {
        $idown = $('<iframe>', {
            id:'idown', 
            src:url
        }).hide().appendTo('body');
    }
                
    alert('CSV file has been exported.');
}
function export_csv(htmlid) {
    var data = get_data_string_from_textarea(htmlid);
                
    var headers, fname;
                
    switch(htmlid) {
        case '#feeds':
            headers = columns.feeds;
            fname = 'feeds';
            break;
        case '#items':
            headers = columns.items;
            fname = 'items';
            break;
        case '#attrs':
            headers = columns.attrs;
            fname = 'attrs';
            break;
    }
                
    data = headers.join('@@DELIM_COLS@@') + '@@DELIM_ROWS@@' + data;
                
    var postData = {
        'fname' : fname,
        'data' : data
    }
                
    $.post('php/export.php', postData, function(url){
        downloadURL(url);
    }); 
}
            
function import_csv(htmlid, data) {
    data = data.split(",").join("\t");
    data = data.split("\n");
    data.shift();
    data = data.join("\n");
                
    $('#'+htmlid).val(data);

    var def;
    
    switch(htmlid) {
        case 'items':
            //def = setdata(-1, '#items', 'setraw_items');
            break;
        case 'attrs':
            //def = setdata(-1, '#attrs', 'setraw_attrs');
            break;
    }
    
    if (def) {
        $.when(def).done(function() {
            alert('CSV file has been imported into the database.');
        });
    }
    else {
        alert('CSV file has been imported into the textarea.');
    }
}
            
function readBlob(htmlid) {
    var files = document.getElementById(htmlid + '_file').files;
    if (!files.length) {
        alert('Please select a file!');
        return;
    }

    var file = files[0];
    var start = 0;
    var stop = file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            import_csv(htmlid, evt.target.result);
        }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}