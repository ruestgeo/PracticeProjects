package ruestgeo.warehousewars;

import ruestgeo.warehousewars.server.Configs;
import ruestgeo.warehousewars.server.jakarta.ChatEndpoint;
import ruestgeo.warehousewars.server.jakarta.GameEndpoint;

import java.io.File;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.jakarta.server.config.JakartaWebSocketServletContainerInitializer;





/***
 * Warehouse wars websocket server
 */
public class WarehouseWars {
    static final String WEB_ROOT_PATH = "../../static/";
    static final File WEB_ROOT = new File(WEB_ROOT_PATH);
    static final String DEFAULT_FILE = "index.html";
    static final String CONFIGS = "../../static/assets/configs/configs.json";

    static final long IDLE_TIMEOUT = 1000L*60*30;


    Server server = null;
    public String address = null;
    public int serverPort;

    public static void main (String[] args) throws InterruptedException {
        final WarehouseWars server = new WarehouseWars();
        server.init(server);
        server.start();

        //Thread.currentThread().join(); // keep the main running
        server.join();
    }


    public void join () throws InterruptedException {
        server.join();
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
        
        this.server = new Server();
        ServerConnector connector = new ServerConnector(server);
        connector.setPort(this.serverPort);
        connector.setHost(this.address);
        connector.setReuseAddress(true);
        //connector.setIdleTimeout(IDLE_TIMEOUT);
        server.addConnector(connector);

        ServletContextHandler handler = new ServletContextHandler(ServletContextHandler.SESSIONS);
        handler.setContextPath("/");
        server.setHandler(handler);

        JakartaWebSocketServletContainerInitializer.configure(
            handler, 
            (context, container) -> {
                container.addEndpoint(GameEndpoint.class);
                container.addEndpoint(ChatEndpoint.class);

                container.setAsyncSendTimeout(IDLE_TIMEOUT);
                container.setDefaultMaxSessionIdleTimeout(IDLE_TIMEOUT);
                context.setSessionTimeout((int) IDLE_TIMEOUT);
            }
        );
    }

    /***
     * Start the server 
     */
    public void start () {
        System.out.println("===  Starting servers  ===");
        if (this.server != null){
            try {
                this.server.start();
            } catch (Exception e) {
                System.err.println(e);
                e.printStackTrace();
                System.exit(1);
            }
        }
            
    }

    /***
     * Stop the server
     * @throws Exception
     */
    public void stop () throws Exception {
        if (this.server != null){
            this.server.stop();
            System.out.println("!!!  Server Closed  !!!");
        }
    }
}