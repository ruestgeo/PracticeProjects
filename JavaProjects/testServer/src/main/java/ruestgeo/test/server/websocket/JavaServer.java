package ruestgeo.test.server.websocket;
import ruestgeo.test.server.*;



//import java.io.*;
import java.io.FileReader; 
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.File;

import com.google.gson.*;

//import java.net.*;
import java.net.InetSocketAddress;
import java.net.InetAddress;
import java.net.URL;

import javax.websocket.DeploymentException;
import javax.websocket.server.*;
import org.glassfish.tyrus.server.Server;

import com.sun.net.httpserver.HttpServer;






/***
 * Test server using java http and websocket server 
 */
public class JavaServer {
    static final String WEB_ROOT_PATH = "./public/";
    static final File WEB_ROOT = new File(WEB_ROOT_PATH);
    static final String DEFAULT_FILE = "index.html"; /* added */
    static final String CONFIGS = "configs.json";


    HttpServer serverHttp = null;
    Server serverWebSocket = null;
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
    public void init (JavaServer server) throws Exception, IOException, FileNotFoundException, ClassCastException, NullPointerException {
    
        //unnecessary for test server
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
        /*
        //gson method 1
        Gson gson = new Gson();
        Configs configs = gson.fromJson(new FileReader(CONFIGS), Configs.class);
        this.serverPort = configs.getPort();
        this.address = configs.getAddress();
        */

        //gson method 2;
        JsonObject configs2 = JsonParser.parseReader(new FileReader(CONFIGS)).getAsJsonObject();
        this.serverPort = configs2.get("port").getAsInt();
        this.address = configs2.get("address").getAsString();

        System.out.println("  address:  "+this.address
            +"\n  server port:  "+this.serverPort
            +"\n+++  Creating server  +++");

        this.serverHttp = HttpServer.create(); //.create(new InetSocketAddress("0.0.0.0", PORT), 0))
        this.serverHttp.bind(new InetSocketAddress(this.address, this.serverPort), 0);
        //this.serverHttp.createContext("/", new StaticFileHandler("/", WEB_ROOT, DEFAULT_FILE));
        StaticFileHandler.create(this.serverHttp, "/", WEB_ROOT_PATH, DEFAULT_FILE);

        this.serverWebSocket = new Server(this.address, this.serverPort+1, "/ws", null, WebSocketEndpoint.class);
    }

    /***
     * Start the server 
     */
    public void start () throws  IOException, DeploymentException {
        System.out.println("===  Starting servers  ===");
        this.serverHttp.start();
        this.serverWebSocket.start();
    }

    /***
     * Stop the server
     */
    public void stop () throws Exception {
        if (this.serverWebSocket != null){
            this.serverWebSocket.stop();
            System.out.println("!!!  WebSocket Server Closed  !!!");
        }
        if (this.serverHttp != null){
            this.serverHttp.stop(0);
            System.out.println("!!!  HTTP Server Closed  !!!");
        }
    }
}