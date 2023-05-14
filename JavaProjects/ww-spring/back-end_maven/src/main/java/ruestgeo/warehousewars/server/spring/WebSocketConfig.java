package ruestgeo.warehousewars.server.spring;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;




@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(getGameSocketHandler(), "/ww").setAllowedOrigins("*");
        registry.addHandler(getChatSocketHandler(), "/chat").setAllowedOrigins("*");
	}


	@Bean 
	GameSocketHandler getGameSocketHandler () {
		return new GameSocketHandler();
	}

	@Bean 
	ChatSocketHandler getChatSocketHandler () {
		return new ChatSocketHandler();
	}


    
}
