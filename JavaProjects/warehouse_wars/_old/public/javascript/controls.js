//START TEMP
var chatEnabled = false;
var chatFocus = false;
//END TEMP


function send_control (direction){ 
    if ( !stage || !playerId || !roomId || updateLock ) 
        return;
    if ( stage.controlsDisabled )
		return;
	updateLock = true;
	console.log("send_control: "+direction+"\t\tisPulling: "+specialAction);
    var message = JSON.stringify({ 'type':'player_movement', 'player_id':playerId, 'room_id':roomId, 'dir':direction, 'isPulling':specialAction, 'updateNum': stage.clientUpdateNum });
    socket.send(message);
}

function leaveRoom (){
	let json = {'type': "leave_room", 'player_id': playerId, 'room_id': roomId};
	console.log(json);
	socket.send(JSON.stringify(json));
	if ( $("#main").hasClass("game") )
		document.getElementById("game_view_grid").classList.remove("transparent");
	stage = null;
	roomId = null;
	roomName = null;
	updateLock = true;
	loadView("lobby.html", addCookieListener());
}



var specialAction = false;
function specialActionToggle () {
    if ( !stage ) return;

    if (specialAction) { // toggle off
        specialAction = false;
        var t = document.getElementById('ctrl_shift');
        t.setAttribute("src", "assets/icons/toggle-off.gif");
        t.setAttribute("alt", "⭲");
    } 
    else { // toggle on
        specialAction = true;
        var t = document.getElementById('ctrl_shift');
        t.setAttribute("src", "assets/icons/toggle-on.gif");
        t.setAttribute("alt", "⤟");
    }
}





function handleKeydown (eventkey) {
    if ( (chatEnabled) && (eventkey == keyVal['enter']) && (chatFocus) ) sendChat();
    if ( !stage ) return;
    if ( !(chatFocus) ){
        switch (eventkey) {
            case keyVal['w']:
                send_control([0,-1]);
                break;
            case keyVal['a']:
                send_control([-1,0]);
                break;
            case keyVal['s']:
                send_control([0,1]);
                break;
            case keyVal['d']:
                send_control([1,0]);
                break;
            case keyVal['shift']:
                specialAction = true;
                break;
            default:
                break;
        }
    }
}

function handleKeyup (eventkey) {
    if ( !(stage) ) return;
    if ( !(chatFocus) ){
        switch (eventkey) {
            case keyVal['shift']:
                specialAction = false;
                break;
            default:
                break;
        }
    }

}

var keyVal = {
    "w": 87,
    "a": 65,
    "s": 83,
    "d": 68,
    //"q": 81,
    //"e": 69,
    //"z": 90,
    //"c": 67,
    "shift": 16,
    "enter": 13
};






















//#region MOBILE

var x = 0;
var y = 0;
var nx = 0;
var ny = 0;
var specialTouch = false;
var enableGyroMove = false;

var gyroTO = null; //this is to prevent spam
var gyroTOinterval = 500;

//NOTE gyro doesnt work on my device, i cannot test this
function toggleGyroMove(){ 
	if (enableGyroMove){ //toggle off
		enableGyroMove = false;
		document.getElementById("gyroToggle").setAttribute("value","Turn On GyroMovement");
		window.removeEventListener('deviceorientation', gyroMove);
	}
	else { //toggle on
		enableGyroMove = true;
		document.getElementById("gyroToggle").setAttribute("value","Turn Off GyroMovement");
		window.addEventListener('deviceorientation', gyroMove);	
	}
}

function gyroMove(eventData) { //the eventListener should pass in the eventData

	// gamma is the left-to-right tilt in degrees, where right is positive
	var tiltLeftRight = round1(eventData.gamma);
			
	// beta is the front-to-back tilt in degrees, where front is positive
	var tiltFrontBack = round1(eventData.beta);

	document.getElementById("game_debug").innerHTML = "orientation=(" + tiltLeftRight + "," + tiltFrontBack + ")";
	
	console.log("FB tilt "+tiltFrontBack);
	console.log("LR tilt "+tiltLeftRight);
	gyroTrigger = 20; // TODO adjust this

	if (gyroTO != null) return;

	if (tiltLeftRight > gyroTrigger){ 
		if (tiltFrontBack > gyroTrigger) { //se
			return;
		}
		else if (tiltFrontBack < -gyroTrigger) { //ne
			return;
		}
		else { //e
			send_control("e");
			gyroTO = setTimeout(function(){gyroTO = null;}, gyroTOinterval);
		}
	}
	else if (tiltLeftRight < -gyroTrigger){ 
		if (tiltFrontBack > gyroTrigger) { //sw
			return;
		}
		else if (tiltFrontBack < -gyroTrigger) { //nw 
			return;
		}
		else { //w
			send_control("w");
			gyroTO = setTimeout(function(){gyroTO = null;}, gyroTOinterval);
		}
	}
	else{
		if (tiltFrontBack > gyroTrigger){ //s
			send_control("s");
			gyroTO = setTimeout(function(){gyroTO = null;}, gyroTOinterval);
		}
		else if (tiltFrontBack < -gyroTrigger) { //n
			send_control("n");
			gyroTO = setTimeout(function(){gyroTO = null;}, gyroTOinterval);
		}
	}
}


// Calculates angle of a right-angle triangle in radians
function calcAngle(opposite, adjacent) {
	return (Math.atan(opposite / adjacent)* 180 / Math.PI);
}







function touchStart (event){
	if (event.touches.length > 1) specialTouch = true;
	else specialTouch = false;
	x = event.touches[0].pageX;
	y = event.touches[0].pageY;
}

function touchMove (event){
	if (event.touches.length > 1) specialTouch = true;
	//if player had two points of contact at any time then specialTouch is true
	nx = event.touches[0].pageX;
	ny = event.touches[0].pageY;
}

function touchEnd (event){
	var dx = x-nx; //positive left,  negative right
	var dy = y-ny; //positive up,  negative down

	var Dtrigger = 100; //movement should displace by at least a value of 100 to trigger action

	if (Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2)) < Dtrigger) return; //if distance from touch-orgin is less than Dtrigger then no action
	

	//touch displacement is sufficient, so determine quadrant and direction
	if ((dx > 0) && (dy > 0)){ // NW quadrant4
		angle = calcAngle(Math.abs(dx), Math.abs(dy));
		if ((angle >= 0) && (angle < 45)) send_control([0,-1]); //n
		else if ((angle >= 45) && (angle <= 90)) send_control([-1,0]); //w
		else console.log("error touch x:"+dx+"  ,  y:"+dy);
	}

	else if ((dx < 0) && (dy > 0)){ // NE quadrant1
		angle = calcAngle(Math.abs(dx), Math.abs(dy));
		if ((angle >= 0) && (angle < 45)) send_control([0,-1]); //n
		else if ((angle >= 45) && (angle <= 90)) send_control([1,0]); //e
		else console.log("error touch x:"+dx+"  ,  y:"+dy);
	}

	if ((dx > 0) && (dy < 0)){ // SW quadrant3
		angle = calcAngle(Math.abs(dx), Math.abs(dy));
		if ((angle >= 0) && (angle < 45)) send_control([0,1]); //s
		else if ((angle >= 45) && (angle <= 90)) send_control([-1,0]); //w
		else console.log("error touch x:"+dx+"  ,  y:"+dy);
	}

	else if ((dx < 0) && (dy < 0)){ // SE quadrant2
		angle = calcAngle(Math.abs(dx), Math.abs(dy));
		if ((angle >= 0) && (angle < 45)) send_control([0,1]); //s
		else if ((angle >= 45) && (angle <= 90)) send_control([1,0]); //e
		else console.log("error touch x:"+dx+"  ,  y:"+dy);
	}
}


function round1(a){
// return Math.round(100*a)/100;
	return Math.round(a);
}

function mobile () {
	canvas = document.getElementById ('game_stage'); //only record touches on the stage(div) itself
	canvas.addEventListener ('touchend', function (event) { touchEnd(event); });
	canvas.addEventListener ('touchmove', function (event) { touchMove(event); });
	canvas.addEventListener ('touchstart', function (event) { touchStart(event); });

	// accelerometer
	var maxAG = 0;
	window.ondevicemotion = function(event) {
		agx = round1(event.accelerationIncludingGravity.x);
		agy = round1(event.accelerationIncludingGravity.y);
		agz = round1(event.accelerationIncludingGravity.z);

		//this doesnt work on my device
		ax = round1(event.acceleration.x);
		ay = round1(event.acceleration.y);
		az = round1(event.acceleration.z);
		ag = Math.abs(agx) + Math.abs(agy) + Math.abs(agz);
		a = Math.abs(ax) + Math.abs(ay) + Math.abs(az);	
		maxAG = Math.max(maxAG, ag);	
		//document.getElementById("debugmotion").innerHTML = "ag=(" + agx + "," + agy + "," + agz+")"+ "a=(" + ax + "," + ay + "," + az+")  AG:"+ag+"</br> maxAG: "+maxAG;
		//document.getElementById('debug2').innerHTML = "stage.mimicReveal = "+stage.mimicReveal;
		//document.getElementById('debug3').innerHTML = "stage.reveal = "+stage.reveal;
		if (((ag > 15) || (a > 3))  && (stage != null)){ 
			//if device motion is greater than set value then do some special action
			stage.mimicReveal();
		}
	}
	//document.getElementById('debug').innerHTML = "mobile loaded";
}



//deviation from y-axis (simplifly by absolute value and quadrant case)
// consider n, nw, w (positives)
/*
console.log(calcAngle(1, 1) + " nw");
console.log(calcAngle(0, 1) + " n");
console.log(calcAngle(-1, 1) + " ne");
console.log(calcAngle(-1, 0) + " e");

console.log(calcAngle(-1, -1) + " se");
console.log(calcAngle(0, -1) + " s");
console.log(calcAngle(1, -1) + " sw");
console.log(calcAngle(1, 0) + " w");

> "-45 ne"
> "-90 e"
> "45 se"
> "0 s"

> "-45 sw"
> "90 w"
> "45 nw"
> "0 n"
*/


//#endregion