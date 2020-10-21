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
var connectURL = "ws://"+hostname+":"+(parseInt(port)+1)+ws_path;
var socket;
function connectSocket (){
    playerId = getCookie("playerID");
    console.log("connecting to:  "+connectURL);
    socket = new WebSocket( connectURL );
    socket.onopen = function (event){
        console.log("Connected to server\n--"+event.type);
        loadView("intro.html");
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
        if (!json.hasOwnProperty("type"))
            return;
        messageHandler(json);
    }
    //socket.send(str);
}


$(function (){
    $(document).keydown(function(event) {
        handleKeydown(event.which);
    });
    $(document).keyup(function(event) {
        handleKeyup(event.which);
    });
});




/*
#main
class{
    connecting (the filler page until socket connected)
}
*/

// connecting -> intro_view -> lobby_view (-> room_configs_view) -> room_prep_view -> game_view







function loadView (htmlView, callback, argsObject){
    htmlView = "html/"+htmlView;
    $('#main').load(htmlView, function(responseTxt, statusTxt, xhr){
        if(statusTxt == "success"){
            console.log("LOADED :  "+htmlView); 
            if ( htmlView.toLowerCase().endsWith(".html") )
                $('#main').attr("class", htmlView.substring(0,htmlView.length-5));
            else
                $('#main').attr("class", "");
        }
        if(statusTxt == "error"){
            console.error("EEROR LOADING : "+htmlView+"\n" + xhr.status + ": " + xhr.statusText);
            alert("Error loading: "+htmlView+"\n" + xhr.status + ": " + xhr.statusText);
        }
        if (callback) //if callback provided, execute it
            callback(argsObject);
    });
}







var stage = null;
var playerId = null;  //set in connectSocket()
var roomId = null;
var playerName = null;
var roomName = null;

var updateLock = true;

function messageHandler (message){
    var type = message["type"];
    switch (type){
        case "error":{
            console.error("ERROR ::   "+message["message"]);
            if ( !$("#main").hasClass("game") )
                alert(message["message"]);
            return;
        }



        case "receive_name":{ //{type: receive_name, id: <string>, name: <string>, expiry: <string>} || {type: receive_name, id: <null>}
            if ( !message.id ){
                alert("Display name is already being used");
                return;
            }
            playerId = message.id;
            playerName = message.name;
            setCookie2("WW_Java_Id", message.id, message.expiry);
            setCookie2("WW_Java_DisplayName", message.name, message.expiry);
            loadView("lobby.html", addCookieListener());
            break;
        }



        case "enter_room":{ //{type: enter_room, room_name: <string>, room_id: <string>, capacity: <num>, players: [{id,name,ready}...]}  ||  {type: enter_room, room_name: null}
            roomName = message["room_name"];
            if ( !roomName ){
                console.log("Room is full capacity, cannot join");
                alert("Room is full capacity, cannot join");
                return;
            }
            roomId = message["room_id"];
            loadView( "room_prep.html", function(json){ 
                removeCookieListener();
                loadPlayerReadyStates(json);
            }, message );
            break;
        }



        case "players_ready_states":{ //{type: players_ready_states, room_id: <string>, players: [{id,name,ready}...]}
            if ( message["room_id"] != roomId ){
                console.error("Invalid message while roomId=("+roomId+") ::\n"+JSON.stringify(message,null,4));
                return;
            }
            updatePlayerReadyStates(message["players"]);
            break;
        }


        
        case "room_init":{ //{type: room_init, room_id: <string>, room_name: <string>, height: <num>, width: <num>,  actors: {players/mobs/misc: [...]}, max_hp: <num>, updateNum: <num> }
            if ( message["room_id"] != roomId ){
                console.error("Invalid message while roomId=("+roomId+") ::\n"+JSON.stringify(message,null,4));
                return;
            }
            loadView("game.html", (json) => {
                stage = new clientStage(json);
                stage.initialize(json);
                //updateLock = false;
            }, message);
            break;
        }



        case "update":{ //{type: update, room_id: <num>, updateNum: <num>, blanks: [[x,y] ...], updated: {players: [], mobs: [], misc: []}, removed: {players: [], mobs: [], misc: []} }
            if ( message["room_id"] != roomId ){
                console.error("Invalid message while roomId=("+roomId+") ::\n"+JSON.stringify(message,null,4));
                return;
            }
            updateLock = false;
            stage.partial_update(message);
            break;
        }



        case "full_update":{ //{type: full_update, room_id: <num>, updateNum: <num>, hp: <num>, update: {players: [{name, id, out, spawned, pos, dir} ...], mobs: [{class, pos, dir} ...], misc: [{class, pos} ...]}}
            if ( message["room_id"] != roomId ){
                console.error("Invalid message while roomId=("+roomId+") ::\n"+JSON.stringify(message,null,4));
                return;
            }
            updateLock = false;
            stage.full_update(message);
            break;
        }



        case "victory":{
            if ( message["room_id"] != roomId ){
                console.error("Invalid message while roomId=("+roomId+") ::\n"+JSON.stringify(message,null,4));
                return;
            }
            updateLock = true;
            stage.constrolsDisabled = true;
            enableOverlay("game_overlay", "banner_text", "Victory!");
            document.getElementById("game_view_grid").classList.add("transparent");
            break;
        }



        case "defeat":{
            if ( message["room_id"] != roomId ){
                console.error("Invalid message while roomId=("+roomId+") ::\n"+JSON.stringify(message,null,4));
                return;
            }
            updateLock = true;
            stage.constrolsDisabled = true;
            enableOverlay("game_overlay", "banner_text", "Defeat...");
            document.getElementById("game_view_grid").classList.add("transparent");
            break;
        }



        case "removed_from_room":{ //{type: removed_from_room, reason: <string>}
            alert(message["reason"]);
            stage = null;
            roomId = null;
            roomName = null;
            updateLock = true;
            loadView("lobby.html", addCookieListener());
        }



        default:{
            console.log("invalid message type ::   "+message);
            break;
        }
    }
}

/**
 * client send
 *      {type: request_name, id: <string>, name: <string>}  ||  {type: request_name, name: <string>}
 *      {type: create_room, player_id: <string>, name: <string>, configs: <configs json>}
 *      {type: join_room, room_id: <string>, player_id: <string>}
 *      {type: player_ready, room_id: <string>, player_id: <string>} || {type: player_unready, room_id: <string>, player_id: <string>}
 *      {type: player_movement, player_id: <num>, room_id: <num>, dir: <[num,num]>, isPulling: <bool>, updateNum: <num> }
 *      {type: leave_room, player_id , room_id }
 *      {type: request_update, player_id , room_id }
 * client receive       (assumed always correct if json is parsable)
 *      {type: receive_name, id: <string>, name: <string>, expiry: <string>} || {type: receive_name, id: <null>}
 *      {type: enter_room, room_name: <string>, room_id: <string>, capacity: <num>, players: [{id,name,ready}...]}  ||  {type: enter_room, room_name: null}
 *      {type: players_ready_states, room_id: <string>, players: [{id,name,ready}]}
 *      {type: room_init, room_id: <string>, actors: {players/mobs/misc: [...]}, max_hp: <num>, updateNum: <num>}
 *      {type: update, updateNum: <num>, blanks: [[x,y] ...], updated: {players: [], mobs: [], misc: []}, removed: {players: [], mobs: [], misc: []} }
 *      {type: full_update, updateNum: <num>, hp: <num>, update: {players: [{name, id, out, spawned, pos, dir} ...], mobs: [{class, pos, dir} ...], misc: [{class, pos} ...]}}
 *      {type: victory}
 *      {type: defeat}
 *      {type: removed_from_room, reason: <string>}
 * 
 * maybe keep track of 3 last updates, if missing any after 3 updates or update gap > 3 then request full update
 * otherwise try to wait and reconstruct the grid via out of order updates [(1,3,2),(2,3,1),(2,1,3),(3,2,1),(3,1,2)]
 * 
 * on death blink player icon (100 to 10% opacity?)
 * 
*/