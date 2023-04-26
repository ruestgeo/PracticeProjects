//var ports = require('ports.json');
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
var connectURL = "ws://"+( (port==="80") ? (hostname/*+port?*/+ws_path) : (hostname+":"+(parseInt(port)+1)+ws_path) );
var socket;
var countTimeout;
function connectSocket(){
    console.log("connecting to:  "+connectURL);
    socket = new WebSocket( connectURL );
    socket.onopen = function (event){
        console.log("Connected to server\n--"+event.type);
        socket.send('{"type": "message","content": "hello world!"}');
    }
    socket.onclose = function (event){
        clearTimeout(countTimeout);
        alert("CloseEvent code:" + event.code + "\nreason:" +event.reason + "\nwasClean:"+event.wasClean);
    }
    socket.onerror = function (event){
        clearTimeout(countTimeout);
        console.error(event);
    }    
    socket.onmessage = function (message) {
        console.log(message.data);
        var json = JSON.parse(message.data);
        if (!json.hasOwnProperty("type"))
            return;
        if (json.type === "count"){
            //document.getElementById("count").innerHTML = json.value;
            $('#count').html(json.value);

            //send another message for the count in 2 seconds
            countTimeout = setTimeout(() => {
                socket.send('{"type": "requestCount"}');
            }, 2000);
        }
    }
}
connectSocket();