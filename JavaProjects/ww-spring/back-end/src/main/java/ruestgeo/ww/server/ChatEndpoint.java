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
    //value = "/",
    value = "/chat",
    decoders = MessageDecoder.class, 
    encoders = MessageEncoder.class 
)
public class ChatEndpoint {
    Gson gson = new Gson();

    @OnOpen
    public void onOpen(Session session) throws IOException {
        System.out.println("^^^   Connected chat client  ^^^\n  session id:  "+session.getId());
        session.setMaxIdleTimeout(1000*60*60);
    }
     
    @OnClose
    public void onClose(Session session) throws IOException {
        System.out.println("vvv   Disconnected chat client   vvv\n  session id:  "+session.getId());
        ChatManager.getGlobalManager().removeMember(session);
    }
 
    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("!@!   Chat Error: client["+session.getId()+"]   !@!");
        throwable.printStackTrace();

        try{ session.close();
        } catch (IOException e){ System.err.println("!@!   Chat Error: client["+session.getId()+"] failed to close   !@!\n"+e.getMessage()); }
        ChatManager.getGlobalManager().removeMember(session);
    }

 
    @OnMessage
    public void onMessage(Session session, JsonObject message) throws IOException {
        //System.out.println("sess ["+session.getId()+"] message\n  package ::   "+message.toString());
        if ( !message.has("type") )
            return;
        
        System.out.println("received ::  "+message.toString());
        ChatManager manager = ChatManager.getGlobalManager();
        String type = message.get("type").getAsString();
        JsonObject response = new JsonObject();
        try{
            switch ( type ){
                
                case "request_name":
                case "request_id": {
                    response.addProperty("type", "error");
                    response.addProperty("message", "WW Chat websocket does not support name/id requests");
                    return;
                }



                //{type:'request_token'}
                //reply
                //{type:'token', token: string}
                case "request_token": {
                    String token = null;
                    token = manager.generateUniqueToken(session.getId());
                    System.out.println("got "+token);
                    if (token == null){
                        response.addProperty("type", "error");
                        response.addProperty("message", "Could not generate a token");
                        return;
                    }
                    else {
                        response.addProperty("type", "token");
                        response.addProperty("token", token);
                        return;
                    }
                }



                //(type:'chat', content:string, token:string, user:{id,name,color? *:string})
                //broadcast 
                //(type:'chat', content:string, token:string, user:{id,name,color? *:string}, timestamp:number, updateNum:number)
                case "chat": {
                    try{
                        manager.receiveMessage(session, message);
                    }
                    catch (IllegalArgumentException e){
                        response.addProperty("type", "error");
                        response.addProperty("message", e.getMessage());
                        return;
                    }
                    response = null; //broadcast handled by chatmanager
                    return;
                }



                //(type:'fetch', token?:string, missingUpdates?:number[])
                //must have either token or missingUpdates
                //reply
                //send all missing to client then send 
                //{type: 'fetch_done' token?:string, failed?:number[], nonexistent?:number[]}
                //{type: 'non-existent', token: string } if token invalid
                case "fetch": {
                    if (message.has("missingUpdates")){
                        JsonArray requestedUpdates = message.get("missingUpdates").getAsJsonArray();
                        JsonObject result = manager.fetch(session.getId(), requestedUpdates);
                        response = result;
                        response.addProperty("type", "fetch_done");
                        return;
                    }
                    else if (message.has("token")){
                        try{
                            String token = message.get("token").getAsString();
                            if (manager.fetch(session.getId(), token)){ //successfully sent
                                response.addProperty("type", "fetch_done");
                                return;
                            }
                            else { //token does not exist
                                response.addProperty("type", "non-existent");
                                response.addProperty("token", token);
                                return;
                            }
                        }catch (IOException e){ //error when sending
                            response.addProperty("type", "error");
                            response.addProperty("message", e.getMessage());
                            return;
                        }
                    }
                    else {
                        response.addProperty("type", "error");
                        response.addProperty("message", "Bad request. Must have either 'missingUpdates' or 'token'");
                        return;
                    }
                }


                
                //{type: 'info'}
                //reply
                //{type: 'info', max_updateNum: number, queue_limit: number, current_updateNum: number}
                case "init":  //init could trigger sending chat history
                case "info": {
                    response.addProperty("type", "info");
                    response.addProperty("current_updateNum", manager.getUpdateNum());
                    response.addProperty("queue_limit", manager.QUEUE_LIMIT);
                    response.addProperty("max_updateNum", manager.MAX_UPDATE_NUM);
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