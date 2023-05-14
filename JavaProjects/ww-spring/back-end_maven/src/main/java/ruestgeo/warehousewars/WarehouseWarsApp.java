package ruestgeo.warehousewars;

import ruestgeo.warehousewars.server.spring.Configs;

import java.util.Collections;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;



@SpringBootApplication
public class WarehouseWarsApp {

	static Configs configs = Configs.getConfigs(); //cant use autowired before app.run


	public static void main(String[] args) {
		System.out.println("\n+++  Starting Spring App  +++");
		//SpringApplication.run(WarehouseWarsApp.class, args);
		SpringApplication app = new SpringApplication(WarehouseWarsApp.class);
        app.setDefaultProperties(Collections.singletonMap( "server.port", Integer.toString(configs.getPort()) ));
        app.run(args);
	}

}
