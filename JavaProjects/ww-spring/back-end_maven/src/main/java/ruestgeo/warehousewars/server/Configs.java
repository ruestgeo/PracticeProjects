package ruestgeo.warehousewars.server;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;

//import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;



/***
 * server configs
 */
public class Configs {
    private int port = 8080;
    private String address = "0.0.0.0";

    static final String configsFilePath = "static/assets/configs/configs.json"; //"" if no configs file -> use default

    
    public Configs (){
        System.out.println("+++  Obtaining address & port info  +++");
        System.out.println("  address:  "+this.address
            +"\n  server port:  "+this.port);
    }
    public Configs (String path){
        try {
            Path p = Paths.get(path);
            if (Files.notExists(p))
                throw new IOException("Path does not exist:  "+p.toRealPath());
            Json json = JsonFactory.read(p.toFile());
            this.setAddress(json.get("address").getString(this.address));
            this.setPort(json.get("port").getInteger(this.port));
        }
        catch (IOException e){
            System.err.println(e);
            e.printStackTrace();
        }
        catch (ArithmeticException e){
            System.err.println(e);
            e.printStackTrace();
        }
        System.out.println("+++  Obtaining address & port info  +++");
        System.out.println("  address:  "+this.address
            +"\n  server port:  "+this.port);
    }



    public int getPort(){
        return this.port;
    }
    private void setPort(int val){
        this.port = val;
    }



    public String getAddress(){
        return this.address;
    }
    private void setAddress(String val){
        this.address = val;
    }
}
