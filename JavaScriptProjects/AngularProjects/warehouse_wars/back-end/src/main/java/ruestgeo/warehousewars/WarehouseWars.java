package ruestgeo.warehousewars;

import ruestgeo.warehousewars.server.Configs;
import ruestgeo.warehousewars.server.jws.Server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;






/***
 * Warehouse wars websocket server
 */
public class WarehouseWars {
    //static final String WEB_ROOT_PATH = "./static/";
    //static final File WEB_ROOT = new File(WEB_ROOT_PATH);
    //static final String DEFAULT_FILE = "index.html";
    static final String CONFIGS = "../configs.json";



    public static void main (String[] args) throws InterruptedException {
        Configs configs = new Configs(CONFIGS);

        System.out.println("+++  Creating server  +++");
        InetSocketAddress addr = new InetSocketAddress(configs.getAddress(), configs.getPort());
        final Server server = new Server(addr);

        System.out.println("===  Starting servers  ===");
        server.start();
        System.out.println("||  Server started on port: " + server.getPort()
            +"\n||      address: " + server.getAddress());

        
        final Thread mainThread = Thread.currentThread();
        Runtime.getRuntime().addShutdownHook(new Thread() {
            public void run() {
                try {
                    System.out.println("Captured Shutdown!");
                    server.exit();
                    mainThread.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } catch (Exception e){
                    e.printStackTrace();
                }
            }
        });
        

        BufferedReader sysin = new BufferedReader(new InputStreamReader(System.in));
        while (true) {
            String in = null;
            try {
                in = sysin.readLine();
            } catch (IOException e) {
                e.printStackTrace();
            }
            if (in == null || (in.equals("exit") || in.equals("stop") || in.equals ("quit"))) {
                server.stop(1000);
                break;
            }
        }


        //Thread.currentThread().join(); // keep the main running
    }

}