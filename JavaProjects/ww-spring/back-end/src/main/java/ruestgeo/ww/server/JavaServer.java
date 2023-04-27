package ruestgeo.ww.server;



//import java.io.*;
import java.io.FileReader; 
import java.io.IOException;

import com.google.gson.*;


import javax.websocket.DeploymentException;
//import javax.websocket.server.*;
import org.glassfish.tyrus.server.Server;


/* 
    MVVM design pattern
    - server will receive data from angular front-end and reply with data
    - server only handles data provided from front-end and replies with data for view to handle
    - angular front-end will modify view by its own logic
    
    note:  
        can alternatively use java http server for serving `ng build` static files
*/




/***
 * Test server using java http and websocket server 
 */
public class JavaServer {
    static final String CONFIGS = "configs.json";


    Server serverWebSocket = null;
    Server chatWebSocket = null;
    public String address = null;
    public int serverPort = 0;

    public static void main (String[] args) throws Exception {
        final JavaServer server = new JavaServer();
        server.init(server);
        server.start();
    }

    /***
     * Initialize the server by obtaining all required info to start,
     * including the address and ports
     */
    public void init (JavaServer server) throws IOException, NullPointerException {
    
        final Thread mainThread = Thread.currentThread();
        Runtime.getRuntime().addShutdownHook(new Thread() {
            public void run() {
                try {
                    System.out.println("Captured Shutdown!");
                    server.stop();
                    mainThread.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } catch (Exception e){
                    e.printStackTrace();
                }
            }
        });


        System.out.println("+++  Obtaining port info  +++");
        JsonObject configs = JsonParser.parseReader(new FileReader(CONFIGS)).getAsJsonObject();
        this.serverPort = configs.get("port").getAsInt();
        this.address = configs.get("address").getAsString();

        System.out.println("  address:  "+this.address
            +"\n  server port:  "+this.serverPort
            +"\n+++  Creating server  +++");


        this.serverWebSocket = new Server(this.address, this.serverPort, "/", null, WebSocketEndpoint.class, ChatEndpoint.class);
        //this.serverWebSocket = new Server(this.address, this.serverPort, "/ww", null, WebSocketEndpoint.class);
        //this.chatWebSocket = new Server(this.address, this.serverPort+1, "/chat", null, ChatEndpoint.class);

        System.out.println("+++  Starting GameManager  +++");
        GameManager.init();
        System.out.println("+++  Starting ChatManager  +++");
        ChatManager.init();
    }

    /***
     * Start the server 
     */
    public void start () throws  IOException, DeploymentException {
        System.out.println("===  Starting servers  ===");
        if (this.serverWebSocket != null)
            this.serverWebSocket.start();
        if (this.chatWebSocket != null)
            this.chatWebSocket.start();
    }

    /***
     * Stop the server
     */
    public void stop () throws Exception {
        if (this.serverWebSocket != null){
            this.serverWebSocket.stop();
            System.out.println("!!!  WebSocket Server Closed  !!!");
        }
        if (this.chatWebSocket != null){
            this.chatWebSocket.stop();
            System.out.println("!!!  Chat Server Closed  !!!");
        }
    }
}