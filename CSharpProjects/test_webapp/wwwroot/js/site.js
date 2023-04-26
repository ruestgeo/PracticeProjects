// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your Javascript code.




function getPressCount(elem) {
    $.get("/Request/GetPressCount", function (data) {
        $(elem).html("button press count is "+data);
    });
}

function getCount2(elem){
    $.get("/Requests2/GetCount", function (data) {
        console.log(data);
        $(elem).html("button press count is "+data);
    });
}


function sendBody(elem){
    var body = {"type":"dev", "message":"testing request"};

    // construct an HTTP request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/Request/readRequestBody", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // setup callbacks
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            // response received
            console.log("response:  "+ xhr.responseText);
            let json = JSON.parse(xhr.responseText);
            console.log(json);
            $(elem).html(json);
        }
    }
    xhr.onloadend = function () {
        // request sent
    };

    // send the collected data as JSON
    xhr.send(JSON.stringify(body));
}



function sendBody2(elem){
    var body = {"type":"dev", "message":"testing request2"};

    // construct an HTTP request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/Request/readRequestBody2", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // setup callbacks
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            // response received
            console.log("response:  "+ xhr.responseText);
            let json = JSON.parse(xhr.responseText);
            console.log(json);
            $(elem).html(json);
        }
    }
    xhr.onloadend = function () {
        // request sent
    };

    // send the collected data as JSON
    xhr.send(JSON.stringify(body));
}


function connectWebSocket(){
    var url = window.location.href;
    var protocol = window.location.protocol; 
    var hostname = window.location.hostname; 
    var port = window.location.port; 
    var ws_path = "/ws/";
    if ( !hostname || hostname === "" ) hostname = "#local";
    if ( !port || port === "" ) port = "80";
    console.log(url);
    console.log(protocol);
    console.log(hostname);
    console.log(port);
    var connectURL = "wss://"+hostname+":"+parseInt(port)+ws_path;
    socket = new WebSocket(connectURL);
    socket.onopen = function (event){
        console.log("Connected to server\n--"+event.type);
        socket.send(JSON.stringify({"type": "dev", "content":"HELLO WORLD!"}));
    }
    socket.onclose = function (event){
        alert("CloseEvent code:" + event.code + "\nreason:" +event.reason + "\nwasClean:"+event.wasClean);
    }
    socket.onerror = function (event){
        console.error(event);
    }    
    socket.onmessage = function (message) {
        console.log(message.data);
        let json;
        try {
            json = JSON.parse(message.data);
        }catch (e){
            console.error("ERROR Couldn't parse message:\n"+message+"\n"+e);
            return;
        }
        if (!json.hasOwnProperty("type")){
            console.error("message has no 'type'");
            return;
        }
        console.log(json);
    }
}
connectWebSocket(); //will reconnect the socket each time a page is laoded, use SPA