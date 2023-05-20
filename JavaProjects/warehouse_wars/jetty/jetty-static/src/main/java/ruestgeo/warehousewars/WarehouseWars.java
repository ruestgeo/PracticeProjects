package ruestgeo.warehousewars;

import ruestgeo.warehousewars.server.Configs;
import ruestgeo.warehousewars.server.jetty.ChatEndSession;
import ruestgeo.warehousewars.server.jetty.GameEndSession;
//import ruestgeo.warehousewars.server.jetty.GameEndCreator;
//import ruestgeo.warehousewars.server.jetty.ChatEndCreator;

import java.io.IOException;
//import java.io.File;
import java.time.Duration;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ErrorPageErrorHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.util.resource.Resource;
import org.eclipse.jetty.websocket.server.config.JettyWebSocketServletContainerInitializer;




/***
 * Warehouse wars websocket server
 */
public class WarehouseWars {
    static final String WEB_ROOT_PATH = "../../static/";
    //static final File WEB_ROOT = new File(WEB_ROOT_PATH);
    static final String DEFAULT_FILE = "index.html";
    static final String CONFIGS = "../../static/assets/configs/configs.json";

    static final long IDLE_TIMEOUT = 1000L*60*30;


    Server server = null;
    public String address = null;
    public int serverPort;

    public static void main (String[] args) throws InterruptedException, IOException {
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
     * @throws IOException
     */
    public void init (WarehouseWars app) throws IOException {
    
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
        //connector.setReuseAddress(true);
        //connector.setIdleTimeout(-1L); //default: inf
        server.addConnector(connector);
        

        ServletContextHandler handler = new ServletContextHandler(server, "/", ServletContextHandler.SESSIONS);
        //ServletContextHandler handler = new ServletContextHandler(ServletContextHandler.SESSIONS);
        //handler.setContextPath("/");
        //server.setHandler(handler);

        /* //doesnt work with any ServletContext
        ResourceHandler resourceHandler = new ResourceHandler(); 
	    resourceHandler.setDirectoriesListed(true);
	    resourceHandler.setWelcomeFiles(new String[]{ DEFAULT_FILE });
	    resourceHandler.setResourceBase(WEB_ROOT_PATH);
	    HandlerList handlers = new HandlerList();
	    handlers.setHandlers(new Handler[] { handler, resourceHandler, new DefaultHandler() });
        server.setHandler(handlers);
         */

        handler.setContextPath("/");
        handler.setWelcomeFiles(new String[] { "index.html" });
        handler.setBaseResource(Resource.newResource(WEB_ROOT_PATH));
        handler.addServlet(DefaultServlet.class, "/");
        ErrorPageErrorHandler errorMapper = new ErrorPageErrorHandler();
        errorMapper.addErrorPage(404,"/"); // map all 404's to root (aka /index.html)
        handler.setErrorHandler(errorMapper);

        

        JettyWebSocketServletContainerInitializer.configure(
            handler, 
            (context, container) -> {
                container.addMapping("/ww", GameEndSession.class);
                container.addMapping("/chat", ChatEndSession.class);
                //container.addMapping("/ww", new GameEndCreator());
                //container.addMapping("/chat", new ChatEndCreator());

                container.setIdleTimeout(Duration.ofMillis(IDLE_TIMEOUT));
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