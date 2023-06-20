package ruestgeo.warehousewars.server;

import java.io.IOException;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;
import ruestgeo.warehousewars.chat.ChatManager;




public abstract class ChatMessageHandler {

    public static void onOpen (String sessionId){
        System.out.println("^^^   Connected chat client  ^^^\n  session id:  "+sessionId);
    }



    public static void onError (String sessionId, Throwable throwable){
        System.err.println("!@!   Chat Error: client["+sessionId+"]   !@!");
        throwable.printStackTrace();
        ChatManager.getGlobalManager().removeMember(sessionId);
    }



    public static void onClose (String sessionId, Json info){
        System.out.println("vvv   Disconnected chat client   vvv\n  session id:  "+sessionId
        + ((info == null) ? "" : "\n  "+info.toString()) );
        ChatManager.getGlobalManager().removeMember(sessionId);
    }



    public static void onMessage (String sessionId, Json message){
        //System.out.println("sess ["+sessionId+"] message\n  package ::   "+message.toString());
        if ( !message.has("type") )
            return;
        
        System.out.println("received ::  "+message.toString());
        ChatManager manager = ChatManager.getGlobalManager();
        String type = message.get("type").getString();
        Json response = JsonFactory.createObject();
        try{
            switch ( type ){
                
                case "request_name":
                case "request_id": {
                    response.set("type", "error");
                    response.set("message", "WW Chat websocket does not support name/id requests");
                    return;
                }



                //{type:'request_token'}
                //reply
                //{type:'token', token: string}
                case "request_token": {
                    String token = null;
                    token = manager.generateUniqueToken(sessionId);
                    System.out.println("got "+token);
                    if (token == null){
                        response.set("type", "error");
                        response.set("message", "Could not generate a token");
                        return;
                    }
                    else {
                        response.set("type", "token");
                        response.set("token", token);
                        return;
                    }
                }



                //(type:'chat', content:string, token:string, user:{id,name,color? *:string})
                //broadcast 
                //(type:'chat', content:string, token:string, user:{id,name,color? *:string}, timestamp:number, updateNum:number)
                case "chat": {
                    try{
                        manager.receiveMessage(sessionId, message);
                    }
                    catch (IllegalArgumentException e){
                        response.set("type", "error");
                        response.set("message", e.toString());
                        System.err.println(e.toString());
                        System.err.println(e.getMessage());
                        e.printStackTrace();
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
                        Json requestedUpdates = message.get("missingUpdates");
                        Json result = manager.fetch(sessionId, requestedUpdates);
                        response = result;
                        response.set("type", "fetch_done");
                        return;
                    }
                    else if (message.has("token")){
                        try{
                            String token = message.get("token").getString();
                            if (manager.fetch(sessionId, token)){ //successfully sent
                                response.set("type", "fetch_done");
                                return;
                            }
                            else { //token does not exist
                                response.set("type", "non-existent");
                                response.set("token", token);
                                return;
                            }
                        }catch (IOException e){ //error when sending
                            response.set("type", "error");
                            response.set("message", e.toString());
                            return;
                        }
                    }
                    else {
                        response.set("type", "error");
                        response.set("message", "Bad request. Must have either 'missingUpdates' or 'token'");
                        return;
                    }
                }


                
                //{type: 'info'}
                //reply
                //{type: 'info', max_updateNum: number, queue_limit: number, current_updateNum: number}
                case "init":  //init could trigger sending chat history
                case "info": {
                    response.set("type", "info");
                    response.set("current_updateNum", manager.getUpdateNum());
                    response.set("queue_limit", manager.QUEUE_LIMIT);
                    response.set("max_updateNum", manager.MAX_UPDATE_NUM);
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
                SessionManager.get("chat").send(sessionId, response);
            }
        }
    }




}
