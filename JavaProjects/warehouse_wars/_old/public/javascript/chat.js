

var chatEnabled = true;
var chatFocus = false; //set true when typing in chat form
var autoscroll = true;

function toggleChatScroll(){
    if (autoscroll){
        autoscroll = false;
        document.getElementById("toggleScroll").setAttribute("value","Enable Jump-To-Newest");
    }
    else {
        autoscroll = true;
        document.getElementById("toggleScroll").setAttribute("value","Disable Jump-To-Newest");
        $("#chat_box").scrollTop($("#chat_box")[0].scrollHeight); //keep scroll down
    }
}


function sendChat(){ //TODO add chat tabs; chat_id
    var content = $('#chat_input').val(); 
    if ( !content || content==="" ) return;
    var txt = (playerName ? playerName : "???")+" :   "+content;
    var message = JSON.stringify({ 'type': 'chat', 'text': txt });
    socket.send(message);
    $('#chat_input').val("");
}
