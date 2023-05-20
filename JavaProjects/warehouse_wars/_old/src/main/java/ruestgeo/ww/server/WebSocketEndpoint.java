package ruestgeo.ww.server;


//import java.io.*;
import java.io.FileReader; 
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;


import java.util.ArrayList;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Timer; 
import java.util.TimerTask; 
import java.util.StringTokenizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

//import java.net.*;
import java.net.InetSocketAddress;
import java.net.InetAddress;
import java.net.URL;
import java.security.NoSuchAlgorithmException;

import javax.websocket.server.*;
import javax.websocket.*;


import com.google.gson.*;




@ServerEndpoint(
    value = "/",
    decoders = MessageDecoder.class, 
    encoders = MessageEncoder.class 
)
public class WebSocketEndpoint {
    Gson gson = new Gson();

    @OnOpen
    public void onOpen(Session session) throws IOException {
        System.out.println("^^^   Connected websocket client  ^^^\n  session id:  "+session.getId());
    }
     
    @OnClose
    public void onClose(Session session) throws IOException {
        System.out.println("vvv   Disconnected websocket client   vvv\n  session id:  "+session.getId());
        GameManager.getGlobalManager().removePlayer(session);
    }
 
    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("!@!   Websocket Error: client["+session.getId()+"]   !@!");
        throwable.printStackTrace();
    }

 
    @OnMessage
    public void onMessage(Session session, JsonObject message) throws IOException {
        //System.out.println("sess ["+session.getId()+"] message\n  package ::   "+message.toString());
        if ( !message.has("type") )
            return;
        
        String type = message.get("type").getAsString();
        GameManager manager = GameManager.getGlobalManager();
        JsonObject response = new JsonObject();
        try{
            switch ( type ){
                case "request_name":{ //{type: request_name, id: <string>, name: <string>}  ||  {type: request_name, name: <string>}
                    if ( !message.has("name") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'name' entry");
                        return;
                    }
                    String name;
                    try {
                        name = message.get("name").getAsString();
                    } 
                    catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'name'");
                        return;
                    }
                    
                    if ( message.has("id") ){ //replace existing id

                        String id;
                        try {
                            id = message.get("id").getAsString();
                        } 
                        catch (Exception e){
                            response.addProperty("type", "error");
                            response.addProperty("message", "Error occured when parsing 'id'");
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
                            response.addProperty("type", "error");
                            response.addProperty("message", "Error occured when creating an id.  Contact a system administrator");
                            return;
                        }
                        response.addProperty("type", "receive_name"); 
                        response.addProperty("id", newId);
                        response.addProperty("name", name);
                        response.addProperty("expiry", expiry);
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
                            response.addProperty("type", "error");
                            response.addProperty("message", "Error occured when creating an id.  Contact a system administrator");
                            return;
                        }
                        response.addProperty("type", "receive_name"); 
                        response.addProperty("id", newId);
                        response.addProperty("name", name);
                        response.addProperty("expiry", expiry);
                    } 
                    return;
                }


                
                case "create_room":{ //{type: create_room, player_id: <string>, name: <string>, configs: <configs json>}
                    if ( !message.has("player_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getAsString();
                    } 
                    catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    if ( !message.has("name") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'name' entry");
                        return;
                    }
                    String name;
                    try {
                        name = message.get("name").getAsString();
                    } 
                    catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'name'");
                        return;
                    }
                    if ( !message.has("configs") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'configs' entry");
                        return;
                    }
                    String configsJson;
                    try {
                        configsJson = gson.toJson(message.get("configs").getAsJsonObject());
                    } 
                    catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'configs'");
                        return;
                    }
                    
                    GameRoom room = null;
                    try {
                        room = manager.createRoom(name, GameRoomConfigs.parseConfigs(configsJson));
                    }
                    catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "The server is currently full and cannot create a room.  Please try again later");
                        return;
                    }
                    String roomId = room.getId();
                    String roomName = null;
                    try{
                        room = manager.joinRoom(playerId, roomId, session);
                        if ( room != null )
                            roomName = room.getName();
                    }
                    catch (IllegalStateException e){ //if either id is wrong, or room already started
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when trying to join room ::   "+e.getMessage());
                        return;
                    }

                    if ( roomName != null ){
                        JsonArray playersReady = null;
                        try {
                            playersReady = room.getPlayersReadyState();
                        }
                        catch (IllegalStateException e){
                            response.addProperty("type", "error");
                            response.addProperty("message", "Error occured when trying to join room ::   "+e.getMessage());
                            return;
                        }
                        response.addProperty("room_id", roomId);
                        response.addProperty("capacity", room.getCapacity());
                        response.add("players", playersReady);
                    }
                    response.addProperty("type", "enter_room");
                    response.addProperty("room_name", roomName); //if roomName == null, room is full capacity
                    return;
                }



                case "join_room":{ //{type: join_room, room_id: <string>, player_id: <string>}
                    if ( !message.has("room_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'player_id'");
                        return;
                    }

                    GameRoom room;
                    String roomName = null;
                    try{
                        room = manager.joinRoom(playerId, roomId, session);
                        if ( room != null )
                            roomName = room.getName();
                    }
                    catch (IllegalStateException e){ //if either id is wrong, or room already started
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when trying to join room ::   "+e.getMessage());
                        return;
                    }
                    
                    JsonArray playersReady = null;
                    if ( roomName != null ){
                        try {
                            playersReady = room.getPlayersReadyState();
                        }
                        catch (IllegalStateException e){
                            response.addProperty("type", "error");
                            response.addProperty("message", "Error occured when trying to join room ::   "+e.getMessage());
                            return;
                        }
                        response.addProperty("room_id", roomId);
                        response.addProperty("capacity", room.getCapacity());
                        response.add("players", playersReady);
                    }
                    response.addProperty("type", "enter_room");
                    response.addProperty("room_name", roomName); //if roomName == null, room is full capacity

                    //broadcast update to all other players
                    JsonObject broadcast = new JsonObject();
                    broadcast.addProperty("type", "players_ready_states");
                    broadcast.addProperty("room_id", roomId);
                    broadcast.add("players", playersReady);
                    room.broadcast(gson.toJson(broadcast), playerId);
                    return;
                }



                case "player_ready":{ //{type: player_ready, room_id: <string>, player_id: <string>}
                    if ( !message.has("room_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    
                    GameRoom room = manager.getRoom(roomId);
                    try { 
                        room.readyPlayer(playerId, true); // will broadcast
                    }
                    catch (IllegalAccessError e){ //player not in room
                        response.addProperty("type", "error");
                        response.addProperty("message", "The given player id ["+playerId+"] was not found in the room with the given room id ["+roomId+"]");
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
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    
                    //only set ready state to false if room isn't active yet
                    GameRoom room = manager.getRoom(roomId);
                    try { 
                        room.readyPlayer(playerId, false);
                    }
                    catch (IllegalAccessError e){ //player not in room
                        response.addProperty("type", "error");
                        response.addProperty("message", "The given player id ["+playerId+"] was not found in the room with the given room id ["+roomId+"]");
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
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'player_id'");
                        return;
                    }

                    manager.removePlayer(playerId); //remove player from room (if in one)
                    response = null;
                    return;
                }



                case "request_update":{ //{ type: request_update, player_id , room_id }
                    if ( !message.has("room_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    
                    manager.getRoom(roomId).sendFullUpdate();
                    response = null;
                    return;
                }



                case "player_movement":{ //{type: player_movement, player_id: <num>, room_id: <num>, dir: <[num,num]>, isPulling: <bool>, updateNum: <num> }
                    if ( !message.has("room_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'room_id' entry");
                        return;
                    }
                    String roomId;
                    try {
                        roomId = message.get("room_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'room_id'");
                        return;
                    }

                    if ( !message.has("player_id") ){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Request JSON is missing 'player_id' entry");
                        return;
                    }
                    String playerId;
                    try {
                        playerId = message.get("player_id").getAsString();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'player_id'");
                        return;
                    }
                    short[] dir;
                    try {
                        dir = gson.fromJson(message.get("dir"), short[].class);
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'dir'");
                        return;
                    }
                    Boolean isPulling;
                    try {
                        isPulling = message.get("isPulling").getAsBoolean();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'isPulling'");
                        return;
                    }
                    int updateNum;
                    try {
                        updateNum = message.get("updateNum").getAsInt();
                    } catch (Exception e){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Error occured when parsing 'updateNum'");
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
                    response.addProperty("type", "error");
                    response.addProperty("message", "Invalid type: "+type);
                    return;
                }
            }
        }
        finally { //send the response 
            if ( response != null ){
                System.out.println("sending ::  "+response.toString());
                session.getAsyncRemote().sendText(gson.toJson(response), new AsyncMessageHandler(session));
            }
        }
        
    }

    protected class AsyncMessageHandler implements SendHandler {
        Session session;
        public AsyncMessageHandler (Session sess){
            this.session = sess;
        }
        //@Override
        public void onResult(SendResult result) {
            if ( !result.isOK() ){
                System.err.println("error sending async message to sess ["+session.getId()+"]\n"+result.getException());
            }
        }
    }
}