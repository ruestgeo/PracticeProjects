package ruestgeo.warehousewars.server.jws;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;
import ruestgeo.warehousewars.server.SessionManager;
import ruestgeo.warehousewars.server.session.jws.SessionManagerWrapper;

import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import org.java_websocket.WebSocket;
import org.java_websocket.drafts.Draft;
import org.java_websocket.exceptions.InvalidDataException;
import org.java_websocket.framing.CloseFrame;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.handshake.ServerHandshakeBuilder;
import org.java_websocket.server.WebSocketServer;




public class Server extends WebSocketServer {

    GameEndpoint game;
    ChatEndpoint chat; 

    public List<String> endpoints = List.of(
        "/ww",
        "/chat"
    );


    public Server(InetSocketAddress address) {
        super(address);

        game = new GameEndpoint();
        chat = new ChatEndpoint();
    }


    

    @Override
    public void onStart() {
        System.out.println("Server started!");
        setConnectionLostTimeout(120);
    }


    @Override
    public ServerHandshakeBuilder onWebsocketHandshakeReceivedAsServer(
        WebSocket conn, Draft draft, ClientHandshake request) throws InvalidDataException 
    {
        System.out.println("Received connection request at ["+request.getResourceDescriptor()+"]");

        //conn.getRemoteSocketAddress() -> the inet-address of the endpoint this socket is connected to, or null if it is unconnected
        //conn.getResourceDescriptor() -> the decoded path component of this URI

        ServerHandshakeBuilder builder = super
        .onWebsocketHandshakeReceivedAsServer(conn, draft, request);

        builder.put("Access-Control-Allow-Origin", "*");

        if (!this.endpoints.contains(request.getResourceDescriptor())) {
            throw new InvalidDataException(CloseFrame.POLICY_VALIDATION, "Not accepted! :  "+request.getResourceDescriptor());
        }

        return builder;
    }



    
    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("== conn open ==  ["+conn.getResourceDescriptor()+"]");
        String timestamp = Long.toString(new Date().getTime());
        if (conn.getResourceDescriptor().equals("/ww")){
            System.out.println("||  ww");
            conn.setAttachment(((SessionManagerWrapper) SessionManager.get("ww")).generateId("ww",timestamp));
            game.onOpen(conn);
        }
        else if (conn.getResourceDescriptor().equals("/chat")){
            System.out.println("||  chat");
            conn.setAttachment(((SessionManagerWrapper) SessionManager.get("chat")).generateId("chat",timestamp));
            chat.onOpen(conn);
        }
        System.out.println("|# "+conn.getAttachment());
    }
    
    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("== conn close ==");
        if (conn == null)
            return;
        System.out.println("|# "+conn.getAttachment());
        if (conn.getResourceDescriptor().equals("/ww")){
            game.onClose(conn, code, reason, remote);
        }
        else if (conn.getResourceDescriptor().equals("/chat")){
            chat.onClose(conn, code, reason, remote);
        }
    }
    
    @Override
    public void onMessage(WebSocket conn, String message) {
        System.out.println("== conn message string ==");
        if (conn == null)
            return;
        System.out.println("|# "+conn.getAttachment());
        System.out.println("|< "+message);
        Json json;
        if (conn.getResourceDescriptor().equals("/ww")){
            try { 
                json = JsonFactory.parse(message);
            }
            catch (IllegalArgumentException e){
                System.err.println(e);
                e.printStackTrace();
                return;
            }
            game.onMessage(conn, json);
        }
        else if (conn.getResourceDescriptor().equals("/chat")){
            try { 
                json = JsonFactory.parse(message);
            }
            catch (IllegalArgumentException e){
                System.err.println(e);
                e.printStackTrace();
                return;
            }
            chat.onMessage(conn, json);
        }
    }
    
    @Override
    public void onMessage(WebSocket conn, ByteBuffer buffer) {
        System.out.println("== conn message byte ==");
        if (conn == null)
            return;
        System.out.println("|# "+conn.getAttachment());
        String message = new String(buffer.array(), StandardCharsets.UTF_8);
        System.out.println("|< "+message);
        Json json;
        if (conn.getResourceDescriptor().equals("/ww")){
            try { 
                json = JsonFactory.parse(message);
            }
            catch (IllegalArgumentException e){
                System.err.println(e);
                e.printStackTrace();
                return;
            }
            game.onMessage(conn, json);
        }
        else if (conn.getResourceDescriptor().equals("/chat")){
            try { 
                json = JsonFactory.parse(message);
            }
            catch (IllegalArgumentException e){
                System.err.println(e);
                e.printStackTrace();
                return;
            }
            chat.onMessage(conn, json);
        }
    }

    @Override
    public void onError(WebSocket conn, Exception throwable) {
        System.out.println("== conn error ==");
        if (conn == null)
            return;
        System.out.println("|# "+conn.getAttachment());
        if (conn.getResourceDescriptor().equals("/ww")){
            game.onError(conn, throwable);
        }
        else if (conn.getResourceDescriptor().equals("/chat")){
            chat.onError(conn, throwable);
        }
    }




    /***
     * Stop the server
     */
    public void exit () {
        try {
            this.stop();
        } 
        catch (InterruptedException e) {
            System.err.println(e);
            e.printStackTrace();
            System.exit(1);
        }
        finally {
            System.out.println("!!!  Server Closed  !!!");
        }
    }
}
