package ruestgeo.warehousewars;

import ruestgeo.warehousewars.server.Configs;
import ruestgeo.warehousewars.server.jakarta.ChatEndpoint;
import ruestgeo.warehousewars.server.jakarta.GameEndpoint;

//import java.io.File;

import org.glassfish.tyrus.server.Server;

import jakarta.websocket.DeploymentException;





/***
 * Warehouse wars websocket server
 */
public class WarehouseWars {
    //static final String WEB_ROOT_PATH = "../static/";
    //static final File WEB_ROOT = new File(WEB_ROOT_PATH);
    //static final String DEFAULT_FILE = "index.html";
    static final String CONFIGS = "../static/assets/configs/configs.json";


    Server tyrusServer = null;
    public String address = null;
    public int serverPort;

    public static void main (String[] args) throws InterruptedException {
        final WarehouseWars server = new WarehouseWars();
        server.init(server);
        server.start();

        Thread.currentThread().join(); // keep the main running
    }

    /***
     * Initialize the server by obtaining all required info to start,
     * including the address and ports
     */
    public void init (WarehouseWars app) {
    
        final Thread mainThread = Thread.currentThread();
        Runtime.getRuntime().addShutdownHook(new Thread() {
            public void run() {
                try {
                    System.out.println("Captured Shutdown!");
                    app.stop();
                    mainThread.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } catch (Exception e){
                    e.printStackTrace();
                }
            }
        });


        Configs configs = new Configs(CONFIGS);
        this.serverPort = configs.getPort();
        this.address = configs.getAddress();


        System.out.println("+++  Creating server  +++");
        
        this.tyrusServer = new Server(this.address, this.serverPort, "/", null, GameEndpoint.class, ChatEndpoint.class);

    }

    /***
     * Start the server 
     */
    public void start () {
        System.out.println("===  Starting servers  ===");
        if (this.tyrusServer != null){
            try {
                this.tyrusServer.start();
            } catch (DeploymentException e) {
                System.err.println(e);
                e.printStackTrace();
                System.exit(1);
            }
        }
            
    }

    /***
     * Stop the server
     */
    public void stop () {
        if (this.tyrusServer != null){
            this.tyrusServer.stop();
            System.out.println("!!!  Server Closed  !!!");
        }
    }
}