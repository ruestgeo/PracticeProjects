//var ports = require('ports.json');
var url = window.location.href;
var protocol = window.location.protocol; 
var hostname = window.location.hostname; 
var port = window.location.port; 
if ( !hostname || hostname === "" ) hostname = "#local";
if ( !port || port === "" ) port = "80";
console.log(url);
console.log(protocol);
console.log(hostname);
console.log(port);
var connectURL = (port==="80") ? (hostname) : (hostname+":"+port);
var socket;

//document.getElementById("count").innerHTML = 0;
//$('#count').html(0);

function connectSocket(){
    console.log("TCP SOCKET NOT AVAILABLE");

    /* NOTE: only for chrome extensions (& apps?)
    //https://developer.chrome.com/apps/sockets_tcp
    //https://developer.chrome.com/apps/app_network

    chrome.sockets.tcp.onReceive.addListener(function(info) {
        if (info.socketId != socket)
            return;
        var message = ab2str(info.data);
        console.log(message);
    });

    chrome.sockets.tcp.onReceiveError.addListener(function (info){
        console.error("socket["+info.socketId+"]: err "+info.resultCode);

        //on close
        //console.error("Closed connection socket["+info.socketId+"]: err code "+info.resultCode);        

        //on any other err
        //console.error("socket["+info.socketId+"]: err code "+info.resultCode);
    });

    console.log("Connecting to:  "+connectURL);
    chrome.sockets.tcp.create({}, function(createInfo) {
        socket = createInfo.socketId;
        chrome.sockets.tcp.connect(createInfo.socketId, hostname, port, 
            function (event){
                console.log("Connected to server (socker["+socket+"])\n--"+event);
                chrome.sockets.tcp.send(socket,
                    str2ab("JG_client::hello world!"),
                    function(sendInfo) {
                        console.log("Sent initial message\n--result: "+sendInfo.resultCode);
                    }
                );
            }
        );
    });
    */
}

//https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}




connectSocket();