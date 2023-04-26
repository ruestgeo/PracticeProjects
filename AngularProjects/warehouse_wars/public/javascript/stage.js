//create client stage after receiving room init
function clientStage(room){
    this.id = room['room_id'];
    this.name = roomName; //room['room_name'];
	this.width = room['width'];
	this.height = room['height'];
    this.max_hp = null;
	this.hp = null;
	this.players = null;

	this.clientUpdateNum = null;
	this.previousUpdateType = null;	//"full" or "partial"
	this.missedUpdates = 0;
    
	this.stageElementId = "game_stage";
	this.debugElementId = "game_debug";
	this.playerStatesElementId = "game_players";

    this.controlsDisabled = true;
	this.reveal = false;


	this.emptyStage = null; //blank stage
	this.baseStage = null; //clean stage (only walls)

	this.imgs = {
		"player1n": "assets/icons/player1-n.gif",
		"player1e": "assets/icons/player1-e.gif",
		"player1w": "assets/icons/player1-w.gif",
		"player1s": "assets/icons/player1-s.gif",

		"player2n": "assets/icons/player2-n.gif",
		"player2e": "assets/icons/player2-e.gif",
		"player2w": "assets/icons/player2-w.gif",
		"player2s": "assets/icons/player2-s.gif",

		"player3n": "assets/icons/player3-n.gif",
		"player3e": "assets/icons/player3-e.gif",
		"player3w": "assets/icons/player3-w.gif",
		"player3s": "assets/icons/player3-s.gif",

		"player4n": "assets/icons/player4-n.gif",
		"player4e": "assets/icons/player4-e.gif",
		"player4w": "assets/icons/player4-w.gif",
        "player4s": "assets/icons/player4-s.gif",

        "player5n": "assets/icons/player1-n.gif",
		"player5e": "assets/icons/player1-e.gif",
		"player5w": "assets/icons/player1-w.gif",
		"player5s": "assets/icons/player1-s.gif",

		"player6n": "assets/icons/player2-n.gif",
		"player6e": "assets/icons/player2-e.gif",
		"player6w": "assets/icons/player2-w.gif",
		"player6s": "assets/icons/player2-s.gif",

		"player7n": "assets/icons/player3-n.gif",
		"player7e": "assets/icons/player3-e.gif",
		"player7w": "assets/icons/player3-w.gif",
		"player7s": "assets/icons/player3-s.gif",

		"player8n": "assets/icons/player4-n.gif",
		"player8e": "assets/icons/player4-e.gif",
		"player8w": "assets/icons/player4-w.gif",
        "player8s": "assets/icons/player4-s.gif",

		"blank": "assets/icons/blank.gif",
		"Wall": "assets/icons/wall.gif",
		"Box": "assets/icons/box1.gif",
		"Box1": "assets/icons/box1.gif",
		"Box2": "assets/icons/box2.gif",
		"Box3": "assets/icons/box3.gif",
		"hp+": "assets/icons/hp.gif",
		"hp-": "assets/icons/out.gif",
		"out": "assets/icons/grave.gif",

		"Bouncer": "assets/icons/mob.gif",
		"Wanderer": "assets/icons/wanderer.gif",
		"Crawler": "assets/icons/crawler.gif",
		"Warper": "assets/icons/warper.gif",
		"Pusher": "assets/icons/pusher.gif", 
		"Charger": "assets/icons/charger.gif",
		"Charger-n": "assets/icons/charger-n.gif",
		"Charger-e": "assets/icons/charger-e.gif",
		"Charger-s": "assets/icons/charger-s.gif",
		"Charger-w": "assets/icons/charger-w.gif",
		"Mimic": "assets/icons/mimic1.gif",
		"Mimic_revealed": "assets/icons/mimic_reveal.gif"

	}; //this.imgs['blank']

	this.alts = {
		"player1n": '1⮝',
		"player1e": '1⮞',
		"player1w": '1⮜',
		"player1s": '1⮟',

		"player2n": '2⮝',
		"player2e": '2⮞',
		"player2w": '2⮜',
		"player2s": '2⮟',

		"player3n": '3⮝',
		"player3e": '3⮞',
		"player3w": '3⮜',
		"player3s": '3⮟',

		"player4n": '4⮝',
		"player4e": '4⮞',
		"player4w": '4⮜',
        "player4s": '4⮟',
        
        "player5n": '5⮝',
		"player5e": '5⮞',
		"player5w": '5⮜',
		"player5s": '5⮟',

		"player6n": '6⮝',
		"player6e": '6⮞',
		"player6w": '6⮜',
		"player6s": '6⮟',

		"player7n": '7⮝',
		"player7e": '7⮞',
		"player7w": '7⮜',
		"player7s": '7⮟',

		"player8n": '8⮝',
		"player8e": '8⮞',
		"player8w": '8⮜',
		"player8s": '8⮟',

		"blank": "---",
		"Wall": "||||",
		"Box": "['']",
		"Box1": "['']",
		"Box2": "[--]",
		"Box3": "[__]",
		"hp+": "O",
		"hp-": "X",
		"out": "--",

		"Bouncer": "\\-/",
		"Wanderer": "* *",
		"Crawler": "<^>",
		"Warper": "=-=",
		"Pusher": "<->",
        "Charger": "'-'",
        "Charger-n": "⮉", 
        "Charger-e": "⮊",
        "Charger-s": "⮋",
        "Charger-w": "⮈",
		"Mimic": "[``]",
		"Mimic_revealed": "[**]"
	};
}

clientStage.prototype.toString = function(){
	var json = {
		"stage_id": this.id,
		"stage_name": this.name,
		"stage_width": this.width,
		"stage_height": this.height,
		"max_healthPoints": this.max_hp,
		"current_healthPoints": this.hp,
		"players": this.players
	}
	return JSON.stringify(json,null,4);
}



clientStage.prototype.initialize = function(json){
	this.max_hp = json.max_hp;
	this.hp = this.max_hp;
	var players = json.actors["players"];
	var mobs = json.actors["mobs"];
	var misc = json.actors["misc"];
	
	this.players = {};
	for (var i = 0;  i < players.length;  i++){
		var player = players[i];
		this.players[player.id] = {"num":i, "name": player.name};
	}

	//init the stage
	let table = document.createElement("table");
    table.setAttribute("border","0");
    table.setAttribute("cellspacing","0");
	table.setAttribute("cellpadding","0");
	table.setAttribute("id","stage_table");
	for (let y = 0; y < this.height; y++){
		let row = document.createElement("tr");
		for (let x = 0; x < this.width; x++){
			let cell = document.createElement("td");
			let content = document.createElement("img");
			content.setAttribute("id", "stage_img("+x+","+y+")"); //update this elem on re-draw
			content.setAttribute("src", this.imgs['blank']);
			content.setAttribute("alt", this.alts['blank']);
			content.setAttribute("class", "blank");
            cell.setAttribute("id", "stage("+x+","+y+")"); 
            cell.setAttribute("overflow", "hidden"); //prevent img overlapping
			cell.appendChild(content);
			row.appendChild(cell);
		}
		table.appendChild(row);
	}
	this.emptyStage = table.cloneNode(true);
	let stageDiv = document.getElementById(this.stageElementId);
	while (stageDiv.firstChild) { //empty the div
		stageDiv.removeChild(stageDiv.firstChild);
	}
    stageDiv.appendChild(table);
    
    

    //hp init (resized to 100% width of div)
    let HP_table = document.createElement("table");
	HP_table.setAttribute("border","0");
    HP_table.setAttribute("cellspacing","0");
	HP_table.setAttribute("cellpadding","0");
	HP_table.setAttribute("id","hp_table");
    let HP_row = document.createElement("tr");
    for (let i = 1; i <= this.max_hp; i++){
        let cell = document.createElement("td");
        let content = document.createElement("img");
        content.setAttribute("id", "hp_img("+i+")");
        content.setAttribute("src", this.imgs['hp+']);
        content.setAttribute("alt", this.alts['hp+']);
        content.setAttribute("class", "hp+");
        cell.setAttribute("id", "hp("+i+")"); 
        cell.appendChild(content);
        HP_row.appendChild(cell);
    }
	HP_table.appendChild(HP_row);
    stageDiv.appendChild(HP_table); //add below grid table, same div


	//create player states table
	let playersDiv = document.getElementById(this.playerStatesElementId);
	while (playersDiv.firstChild) { //empty the div
		playersDiv.removeChild(playersDiv.firstChild);
	}
    
	let statesTable = document.createElement("table");
	statesTable.setAttribute("id","states_table");
	let ids = Object.keys(this.players);
	for (let i = 0;  i < ids.length;  i++){
		let s_row = document.createElement("tr");
		let rowPrefix = "player_states_"+i;

		let cell = document.createElement("td");
		let content = document.createElement("p");
		content.setAttribute("id", rowPrefix+"_num");
		let cell1 = document.createElement("td");
		let content1 = document.createElement("img");
		content1.setAttribute("id", rowPrefix+"_icon"); 
		let cell2 = document.createElement("td");
		let content2 = document.createElement("p");
		content2.setAttribute("id", rowPrefix+"_name"); 
		let cell3 = document.createElement("td");
		let content3 = document.createElement("p");
		content3.setAttribute("id", rowPrefix+"_id"); 
		content3.setAttribute("style", "width: 10ch;");
		
		content.innerHTML = "--";
		content1.setAttribute("alt", '-');
		content2.innerHTML = "--";
		content3.innerHTML = "--";

		cell.appendChild(content);
		s_row.appendChild(cell);
		cell1.setAttribute("overflow", "hidden");
		cell1.appendChild(content1);
		s_row.appendChild(cell1);
		cell2.appendChild(content2);
		s_row.appendChild(cell2);
		cell3.appendChild(content3);
		s_row.appendChild(cell3);
		
		statesTable.appendChild(s_row); 
	}
	playersDiv.appendChild(statesTable);
	for (let id in this.players){
		let num = this.players[id].num;
		let rowPrefix = "player_states_"+num;
		console.log("setting up status for #"+rowPrefix+"_*");
		$("#"+rowPrefix+"_num").html(num+1);
		$("#"+rowPrefix+"_icon").attr("src", 'assets/icons/player'+(num+1)+'-s.gif');
		$("#"+rowPrefix+"_icon").attr("alt", 'Player '+(num+1))
		$("#"+rowPrefix+"_name").html(this.players[id].name);
		$("#"+rowPrefix+"_id").html(id);
		$("#"+rowPrefix+"_id").addClass("playerId");
	}
	


	//populate the stage
	this.update(players, mobs, misc);
	this.previousUpdateType = "full";
	this.controlsDisabled = false;
	this.clientUpdateNum = json.updateNum;
}




 


clientStage.prototype.full_update = function(json){
	var newUpdateNum = json["updateNum"];
	if ( (this.clientUpdateNum > newUpdateNum) && (newUpdateNum > 0) && (this.previousUpdateType != "full") ){ //dont update if new update seems older
		requestUpdate();
		return;
	}

	this.clientUpdateNum = newUpdateNum;
	this.previousUpdateType = "full";
	this.missedUpdates = 0;
	
    var cleanStage = this.empty.cloneNode(true);
	var stageTable = document.getElementById("stage_table");
	stageTable.parentNode.replaceChild(cleanStage, stageTable); //replace
    
    var players = json.update["players"];
    var mobs = json.update["mobs"];
	var misc = json.update["misc"];

	if ( json["hp"] < this.hp ){
		let newHP = this.max_hp - json["hp"];
		if ( newHP < 0 ) newHP = 0;
		for (let i=1;  i <= this.max_hp;  i++){
			if ( i <= newHP ){
				$("#hp_img\\("+i+"\\)").attr("src", this.imgs['hp+']);
				$("#hp_img\\("+i+"\\)").attr("alt", this.alts['hp+']);
			}
			else {
				$("#hp_img\\("+i+"\\)").attr("src", this.imgs['hp-']);
				$("#hp_img\\("+i+"\\)").attr("alt", this.alts['hp-']);
			}
		}
		this.hp = newHP;
	}
	
	this.update(players,mobs,misc);
}




clientStage.prototype.partial_update = function(json){
	var newUpdateNum = json["updateNum"];
	if ( (this.clientUpdateNum > newUpdateNum) && (newUpdateNum > 0) && (this.previousUpdateType != "full") ){ //dont update if new update seems older
		requestUpdate();
		return;
	}
	let updateGap = newUpdateNum - this.clientUpdateNum;
	if ( updateGap > 1) 
		this.missedUpdates += updateGap;
	if ( this.missedUpdates > 4 ){ //if continue missing partial updates, then request a full update
		requestUpdate();
	}
	this.clientUpdateNum = newUpdateNum;
	this.previousUpdateType = "partial";


    var blanks = json.blanks;
    for (var i = 0;  i < blanks.length; i++){
		this.setImage(blanks[i][0], blanks[i][1], this.imgs['blank'], this.alts['blank'], 'blank');
    }
    this.remove(json.removed['players'],json.removed['mobs'],json.removed['misc']);
	this.update(json.updated['players'],json.updated['mobs'],json.updated['misc']);

	//interpret player spawned=true as a decrease in hp
	let hpLoss = 0;
	for (let actor of json.updated['players']){
		if ( actor.spawned ) {
			hpLoss++;
		}
	}
	if (hpLoss > 0){
		let newHP = (this.hp-hpLoss);
		if ( newHP < 0 ) newHP = 0;
		for (let i=this.hp;  i > newHP;  i--){
			$("#hp_img\\("+i+"\\)").attr("src", this.imgs['hp-']);
			$("#hp_img\\("+i+"\\)").attr("alt", this.alts['hp-']);
		}
		this.hp = newHP;
	}
}




clientStage.prototype.update = function (players, mobs, misc){
    for (var actor of misc){
		var type = actor["class"]; 
        if ( !this.imgs[type] )
			this.setImage(actor.pos[0], actor.pos[1], "assets/icons/unknown.gif", "?", type);
		else if ( type === "Box" ){
			if ( this.imgs[type+actor["variant"]] )
				this.setImage(actor.pos[0], actor.pos[1], this.imgs[type+actor["variant"]], this.alts[type+actor["variant"]], type);
			else
				this.setImage(actor.pos[0], actor.pos[1], this.imgs[type], this.alts[type], type);
		}
        else
            this.setImage(actor.pos[0], actor.pos[1], this.imgs[type], this.alts[type], type);
		
	}
	for (var actor of mobs){
        var type = actor["class"];
        var dir = ""; //css img transformations based on class
        if ( (actor.dir[0] == 1) && (actor.dir[1] == 1) )   dir = " mob_se";//"-e";/*se*/
        else if ( (actor.dir[0] == 1) && (actor.dir[1] == 0) )   dir = " mob_e";//"-e";
        else if ( (actor.dir[0] == 1) && (actor.dir[1] == -1) )   dir = " mob_ne";//"-e";/*ne*/
        else if ( (actor.dir[0] == 0) && (actor.dir[1] == 1) )   dir = " mob_s";//"-s";
        else if ( (actor.dir[0] == 0) && (actor.dir[1] == -1) )   dir = " mob_n";//"-n";
        else if ( (actor.dir[0] == -1) && (actor.dir[1] == 1) )   dir = " mob_sw";//"-w";/*sw*/
        else if ( (actor.dir[0] == -1) && (actor.dir[1] == 0) )   dir = " mob_w";//"-w";
        else if ( (actor.dir[0] == -1) && (actor.dir[1] == -1) )   dir = " mob_nw";//"-w";/*nw*/
		
		//TODO add mob gif variants randomly picked on update
		
		if ( this.reveal && (type === "Mimic") ) this.setImage(actor.pos[0], actor.pos[1], this.imgs["Mimic_reveal"], this.alts["Mimic_reveal"], type);
        //else if ( type === "Charger" )  this.setImage(actor.pos[0], actor.pos[1], this.imgs[type+dir], this.alts[type], type);
        else this.setImage(actor.pos[0], actor.pos[1], this.imgs[type], this.alts[type], type+dir); 
	}
    for (var actor of players){
		var classes = "";
		if ( actor.spawned && !$("#stage_img\\("+x+","+y+"\\)").hasClass("spawned") ) 
			classes = " spawned";
		var img_src = "player" + (this.players[actor.id].num+1) + actor.dir;
		this.setImage(actor.pos[0], actor.pos[1], this.imgs[img_src], this.alts[img_src], "Player"+classes);
	}
}



clientStage.prototype.remove = function (players, mobs, misc){
    for (var actor of players){
		var playerNum = this.players[actor.id].num;
		var rowPrefix = "player_states_"+playerNum;
		$("#"+rowPrefix+"_num").html(playerNum+1);
		$("#"+rowPrefix+"_icon").attr("src", 'assets/icons/grave.gif');
		$("#"+rowPrefix+"_icon").attr("alt", 'Player '+(playerNum+1))
		$("#"+rowPrefix+"_name").html(this.players[actor.id].name);
		$("#"+rowPrefix+"_id").html(actor.id);
		if ( actor.id === playerId ){
			this.controlsDisabled = true;
			//MAYBE requestUpdate on interval with current updateNum 
		}
    }
    for (var i = 0;  i < mobs.length;  i++){
        var actor = mobs[i]; 
        this.setImage(actor.pos[0], actor.pos[1], this.imgs['blank'], this.alts['blank'], 'blank');
    }
    for (var i = 0;  i < misc.length;  i++){
        var actor = misc[i];
        this.setImage(actor.pos[0], actor.pos[1], this.imgs['blank'], this.alts['blank'], 'blank');
    }
}





// Set the src of the image at stage location (x,y) to src, and set class to type
clientStage.prototype.setImage = function(x, y, src, alt, type){
	//console.log("class "+type+"\nx "+x+"\ny "+y+"\nsrc "+src+"\nalt "+alt+"\n");
	var content = document.getElementById("stage_img("+x+","+y+")");
	content.setAttribute("src", src);
	content.setAttribute("alt", alt);
	content.setAttribute("class", type);
}






// function is called only for mobile when device accelerometer triggers event
// mobs with Mimic src will flash to Mimic_reveal src every 200ms for 3 seconds
clientStage.prototype.mimicReveal = function(){
	this.reveal = true;
	var reveal_interval = setInterval(	function(){
		var mimics = document.getElementsByClassName("Mimic");
		for (var mimic_img of mimics){
			if (mimic_img.getAttribute("src") === "Mimic"){
				mimic_img.setAttribute("src") = "Mimic_reveal";
				mimic_img.setAttribute("alt") = "Mimic_reveal";
			}
		}
    }, 200);
	setTimeout(	function(){ 
        clearInterval(reveal_interval);
        this.reveal = false; 
    }, 3000);
}








function requestUpdate (){ //{type: request_update, player_id , room_id }
	var json = {"type": "request_update", 'room_id': roomId, 'player_id': playerId};
	console.log(json);
	socket.send(JSON.stringify(json));
}