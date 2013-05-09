$.support.cors = true;  // without this line it's not working in IE
var serviceRootUrl="http://gravity.elido.info/demo_2012.12.03_v47.5/php/v003gateway.php?do=timeline_load";

var serviceRootUrl2="http://gravity.elido.info/demo_2012.12.03_v47.5/php/v003gateway.php?do=timeline_save&dates=";

function performGetRequest(serviceUrl, onSuccess, onError) {
    $.ajax({
        url: serviceUrl,
        type: "GET",
        timeout: 5000,
        contentType: "text/plain; charset=utf-8",
        dataType: "json",
        success: onSuccess,
        error: onError
    });
}

function performPostRequest(serviceUrl, data, onSuccess, onError) {
    $.ajax({
        url: serviceUrl,
        type: "POST",
        timeout: 5000,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: data,
        success: onSuccess,
        error: onError
    });
}


$(document).ready(function(){
    $("#save_but").on("click", sendData);
    $("#load_but").on("click", loadData);
    
    loadData();
});


function sendData(){
    var inputArea = $('#timeline_result').val().split("\n").join(',');

    $.get("../php/gateway.php?db="+db+"do=timeline_save&dates="+inputArea, function() {});
}

function loadData(){
    $.get("../php/gateway.php?db="+db+"do=timeline_load", function(data) {
        $('#timeline_result').val(data.split(',').join("\n"));
    });
}

function onSendSuccess(data){
    alert("works");
}

function onSendError(xhr){
    console.log(xhr);
    alert("shit");
}



function onLoadSuccess(data){
    alert("works2");
}

function onLoadError(xhr){
    alert("shit2");
    alert(xhr.statusText);
}