package ruestgeo.warehousewars.server.spring;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;

import java.io.File;
import java.io.IOException;

//import org.springframework.beans.factory.config.ConfigurableBeanFactory;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.ComponentScan;
//import org.springframework.context.annotation.Scope;
//import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;



/***
 * server configs
 */
//Configuration
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
            File configFile = new ClassPathResource(path).getFile();
            Json json = JsonFactory.read(configFile);
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

    //Bean
    //Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)
    public static /**/ Configs getConfigs(){
        //System.out.println("--- Creating Configs Bean ---\npath: " + configsFilePath);
        System.out.println("--- Fetching Configs ---\npath: " + configsFilePath);
        return new Configs(configsFilePath);
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
