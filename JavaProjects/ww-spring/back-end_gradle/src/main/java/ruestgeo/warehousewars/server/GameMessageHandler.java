package ruestgeo.warehousewars.server;

import java.security.NoSuchAlgorithmException;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;
import ruestgeo.warehousewars.game.GameManager;
import ruestgeo.warehousewars.game.GameRoom;
import ruestgeo.warehousewars.game.GameRoomConfigs;




public abstract class GameMessageHandler {

    public static void onOpen (String sessionId){
        System.out.println("^^^   Connected game client  ^^^\n  session id:  "+sessionId);
    }



    public static void onError (String sessionId, Throwable throwable){
        System.err.println("!@!   Websocket Error: client["+sessionId+"]   !@!");
        throwable.printStackTrace();
    }



    public static void onClose (String sessionId, Json info){
        System.out.println("vvv   Disconnected game client   vvv\n  session id:  "+sessionId
        + ((info == null) ? "" : "\n  "+info.toString()) );
        GameManager.getGlobalManager().removePlayerSession(sessionId);
    }



    public static void onMessage (String sessionId, Json message){
        //System.out.println("sess ["+session.getId()+"] message\n  package ::   "+message.toString());
        if ( !message.has("type") )
            return;
        
        String type = message.get("type").getString();
        GameManager manager = GameManager.getGlobalManager();
        Json response = JsonFactory.createObject();
        
        if ( message.has("token") ){
            response.set("token", message.get("token").getString());
        }  //ISSUE:  request to join room and such does not have an 'ack' to proceed, nor ping to verify state

        try{
            switch ( type ){
                case "request_name":{ //{type: request_name, id: <string>, name: <string>}  ||  {type: request_name, name: <string>}
                    if ( !message.has("name") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'name' entry");
                        return;
                    }
                    String name;
                    try {
                        name = message.get("name").getString();
                    } 
                    catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'name'");
                        return;
                    }
                    
                    if ( message.has("id") ){ //replace existing id

                        String id;
                        try {
                            id = message.get("id").getString();
                        } 
                        catch (Exception e){
                            response.set("type", "error");
                            response.set("message", "Error occured when parsing 'id'");
                            return;
                        }
                        String newId;
                        String expiry;
                        try {
                            String[] temp = manager.requestName(id, name);
                            newId = temp[0];
                            expiry = temp[1];
                        }
                        catch (NoSuchAlgorithmException e){
                            response.set("type", "error");
                            response.set("message", "Error occured when creating an id.  Contact a system administrator");
                            return;
                        }
                        response.set("type", "receive_name"); 
                        response.set("id", newId);
                        response.set("name", name);
                        response.set("expiry", expiry);
                    }
                    else { //create new id
                        String newId;
                        String expiry;
                        try {
                            String[] temp = manager.requestName(name);
                            newId = temp[0];
                            expiry = temp[1];
                        }
                        catch (NoSuchAlgorithmException e){
                            response.set("type", "error");
                            response.set("message", "Error occured when creating an id.  Contact a system administrator");
                            return;
                        }
                        response.set("type", "receive_name"); 
                        response.set("id", newId);
                        response.set("name", name);
                        response.set("expiry", expiry);
                    } 
                    return;
                }


                
                case "create_room":{ //{type: create_room, player_id: <string>, name: <string>, configs: <configs json>}
                    if ( !message.has("player_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getString();
                    } 
                    catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    if ( !message.has("name") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'name' entry");
                        return;
                    }
                    String name;
                    try {
                        name = message.get("name").getString();
                    } 
                    catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'name'");
                        return;
                    }
                    if ( !message.has("configs") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'configs' entry");
                        return;
                    }
                    String configsJson;
                    try {
                        configsJson = message.get("configs").toString();
                    } 
                    catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'configs'");
                        return;
                    }
                    
                    GameRoom room = null;
                    try {
                        room = manager.createRoom(name, GameRoomConfigs.parseConfigs(configsJson));
                    }
                    catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "The server is currently full and cannot create a room.  Please try again later");
                        return;
                    }
                    String roomId = room.getId();
                    String roomName = null;
                    try{
                        room = manager.joinRoom(playerId, roomId, sessionId);
                        if ( room != null )
                            roomName = room.getName();
                        else 
                            throw new IllegalStateException("Room is null");
                    }
                    catch (IllegalStateException e){ //if either id is wrong, or room already started
                        response.set("type", "error");
                        response.set("message", "Error occured when trying to join room ::   "+e.toString());
                        return;
                    }

                    if ( roomName != null ){
                        Json playersReady = null;
                        try {
                            playersReady = room.getPlayersReadyState();
                        }
                        catch (IllegalStateException e){
                            response.set("type", "error");
                            response.set("message", "Error occured when trying to join room ::   "+e.toString());
                            return;
                        }
                        response.set("room_id", roomId);
                        response.set("capacity", room.getCapacity());
                        response.set("players", playersReady);
                    }
                    response.set("type", "enter_room");
                    response.set("room_name", roomName); //if roomName == null, room is full capacity
                    return;
                }



                case "join_room":{ //{type: join_room, room_id: <string>, player_id: <string>}
                    if ( !message.has("room_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'player_id'");
                        return;
                    }

                    GameRoom room;
                    String roomName = null;
                    try{
                        room = manager.joinRoom(playerId, roomId, sessionId);
                        if ( room != null )
                            roomName = room.getName();
                        else 
                            throw new IllegalStateException("Room is null");
                    }
                    catch (IllegalStateException e){ //if either id is wrong, or room already started
                        response.set("type", "error");
                        response.set("message", "Error occured when trying to join room ::   "+e.toString());
                        return;
                    }
                    
                    Json playersReady = null;
                    if ( roomName != null ){
                        try {
                            playersReady = room.getPlayersReadyState();
                        }
                        catch (IllegalStateException e){
                            response.set("type", "error");
                            response.set("message", "Error occured when trying to join room ::   "+e.toString());
                            return;
                        }
                        response.set("room_id", roomId);
                        response.set("capacity", room.getCapacity());
                        response.set("players", playersReady);
                    }
                    response.set("type", "enter_room");
                    response.set("room_name", roomName); //if roomName == null, room is full capacity

                    //broadcast update to all other players
                    Json broadcast = JsonFactory.createObject();
                    broadcast.set("type", "players_ready");
                    broadcast.set("room_id", roomId);
                    broadcast.set("players", playersReady);
                    room.broadcast(broadcast.toString());
                    return;
                }



                case "player_ready":{ //{type: player_ready, room_id: <string>, player_id: <string>}
                    if ( !message.has("room_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    
                    GameRoom room = manager.getRoom(roomId);
                    if (room == null){
                        response.set("type", "error");
                        response.set("message", "Room Id is invalid");
                        return;
                    }
                    try { 
                        room.readyPlayer(playerId, true); // will broadcast
                    }
                    catch (IllegalAccessError e){ //player not in room
                        response.set("type", "error");
                        response.set("message", "The given player id ["+playerId+"] was not found in the room with the given room id ["+roomId+"]");
                        return;
                    }
                    catch (IllegalStateException e){ //game already started
                        response = null;
                        return;
                    }
                    response = null;
                    return;
                }



                case "player_unready":{ //{type: player_unready, room_id: <string>, player_id: <string>}
                    if ( !message.has("room_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    
                    //only set ready state to false if room isn't active yet
                    GameRoom room = manager.getRoom(roomId);
                    if (room == null){
                        response.set("type", "error");
                        response.set("message", "Room Id is invalid");
                        return;
                    }
                    try { 
                        room.readyPlayer(playerId, false);
                    }
                    catch (IllegalAccessError e){ //player not in room
                        response.set("type", "error");
                        response.set("message", "The given player id ["+playerId+"] was not found in the room with the given room id ["+roomId+"]");
                        return;
                    }
                    catch (IllegalStateException e){ //game already started
                        //ignored if already started
                    }
                    response = null;
                    return;
                }
                
                
                
                case "leave_room":{ //{type: leave_room, player_id , room_id }
                    if ( !message.has("room_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }

                    String roomId;
                    try {
                        roomId = message.get("room_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'player_id'");
                        return;
                    }

                    manager.removePlayer(roomId, playerId); //remove player from room (if in one)
                    response = null;
                    return;
                }



                case "request_update":{ //{ type: request_update, player_id , room_id }
                    if ( !message.has("room_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'room_id'");
                        return;
                    }
                    GameRoom room = manager.getRoom(roomId);

                    if ( !message.has("player_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }

                    
                    if (room == null){
                        response.set("type", "error");
                        response.set("message", "Room Id is invalid");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    
                    if (room.hasPlayer(playerId)) 
                        room.sendFullUpdate();
                    response = null;
                    return;
                }



                case "player_movement":{ //{type: player_movement, player_id: <num>, room_id: <num>, dir: <[num,num]>, isPulling: <bool>, updateNum: <num> }
                    if ( !message.has("room_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.set("type", "error");
                        response.set("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getString();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    short[] dir = new short[2];
                    try {
                        Json dirJson = message.get("dir");
                        dir[0] = dirJson.get(0).getAsShort();
                        dir[1] = dirJson.get(1).getAsShort();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'dir'");
                        return;
                    }
                    Boolean isPulling;
                    try {
                        isPulling = message.get("isPulling").getBoolean();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'isPulling'");
                        return;
                    }
                    int updateNum;
                    try {
                        updateNum = message.get("updateNum").getAsInteger();
                    } catch (Exception e){
                        response.set("type", "error");
                        response.set("message", "Error occured when parsing 'updateNum'");
                        return;
                    }
                    GameRoom room = manager.getRoom(roomId);
                    response = null;
                    if ( room != null )
                        room.playerMove(playerId, updateNum, dir[0], dir[1], isPulling);
                    else
                        System.err.println("ERROR: invalid room id for player movement\n    roomId: ["+roomId+"]\n .   playerId: ["+playerId+"]");
                    return;
                }


                default:{
                    response.set("type", "error");
                    response.set("message", "Invalid type: "+type);
                    return;
                }
            }
        }
        finally { //send the response 
            if ( response != null ){
                System.out.println("sending ::  "+response.toString());
                SessionManager.get("ww").send(sessionId, response);
            }
        }
    }



}
