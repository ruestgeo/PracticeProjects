package ruestgeo.test.server.websocket;
import ruestgeo.test.server.*;


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

import javax.websocket.server.*;
import javax.websocket.*;

import com.google.gson.*;




@ServerEndpoint(
    value = "/",
    decoders = MessageDecoder.class, 
    encoders = MessageEncoder.class 
)
public class WebSocketEndpoint {
    private int count = 0;
    Gson gson = new Gson();

    @OnOpen
    public void onOpen(Session session) throws IOException {
        // Get session and WebSocket connection
        System.out.println("^^^   Connected websocket client  ^^^\n  session id:  "+session.getId());
    }
 
    @OnMessage
    public void onMessage(Session session, JsonObject message) throws IOException {
        // Handle new messages
        if ( !message.has("type") )
            return;
        if ( message.get("type").getAsString().equals("message") )
            System.out.println("sess ["+session.getId()+"] message\n  type:  "+message.get("type").getAsString()+"\n  content:  "+message.get("content").getAsString() );
        else
            System.out.println("sess ["+session.getId()+"] message\n  package ::   "+message.toString());
        
        System.out.println("  count:"+this.count);
        if ( this.count > 9 ){
            System.out.println("Count stopped");
            return;
        }
        this.count++;
        JsonObject jsonObj = new JsonObject();
        jsonObj.addProperty("type", "count");
        jsonObj.addProperty("value", this.count);
        session.getBasicRemote().sendText(gson.toJson(jsonObj));
    }
 
    @OnClose
    public void onClose(Session session) throws IOException {
        // WebSocket connection closes
        System.out.println("vvv   Disconnected websocket client   vvv\n  session id:  "+session.getId());
    }
 
    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
        System.err.println("!@!   Websocket Error: client["+session.getId()+"]   !@!");
        throwable.printStackTrace();
    }
}