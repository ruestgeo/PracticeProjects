package ruestgeo.test.server.socket;
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

//import java.net.*;
import java.net.Socket;
import java.net.ServerSocket;
import java.net.SocketAddress;
import java.net.InetSocketAddress;
import java.net.InetAddress;
import java.net.URL;

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

/*
import org.json.JSONObject; 
import org.json.JSONTokener;
import org.json.JSONException;
*/
import com.google.gson.*;




/***
 * Test server using java socketserver and socket client handler
 */
public class JavaServer {
    static final File WEB_ROOT = new File("./public/");
    static final String CONFIGS = "configs.json";

    ServerSocket serverSocket = null;
    public String address = null;
    public int serverPort = 0;

    public static void main (String[] args) throws Exception {
        JavaServer server = new JavaServer();
        server.init();
        server.start();
    }

    /***
     * Initialize the server by obtaining all required info to start,
     * including the address and ports
     */
    public void init () throws Exception, IOException, FileNotFoundException, ClassCastException, NullPointerException {
        //if using org.json, throws JSONException

        System.out.println("+++  Obtaining port info  +++");
        /*
        //org.json method
        JSONObject configs = new JSONObject(new JSONTokener(new FileReader(CONFIGS)));
        this.serverPort = configs.getInt("port");
        this.address = configs.getString("address");
        */

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

        System.out.println("--address:  "+this.address
            +"\n--server port:  "+this.serverPort
            +"\n+++  Creating server  +++");

        this.serverSocket = new ServerSocket();
        this.serverSocket.bind(new InetSocketAddress(this.address, this.serverPort));
        System.out.println("--binded to:  "+this.serverSocket.getInetAddress().toString());
    }

    /***
     * Start the server 
     */
    public void start () throws  IOException {
        System.out.println("===  Starting servers  ===");
        while (true) {
            try {
                Socket clientSocket = serverSocket.accept();
                System.out.println("###  Accepted Connection ["+clientSocket.getInetAddress().toString()+"]  ###");
                new Thread(new ClientHandler(this, clientSocket)).start();
                //add to list of clients

            }
            catch (Exception err){
                System.err.println("An error occured in client accepting loop :: \n"+err);
            }
        }
    }

    /***
     * Stop the server
     */
    public void stop () throws Exception {
        if (serverSocket != null){
            serverSocket.close();
            serverSocket = null;
            System.out.println("!!!  Server Closed  !!!");
        }
    }
}