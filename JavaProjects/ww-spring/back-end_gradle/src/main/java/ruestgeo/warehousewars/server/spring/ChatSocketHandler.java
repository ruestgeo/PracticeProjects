package ruestgeo.warehousewars.server.spring;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;
import ruestgeo.warehousewars.server.ChatMessageHandler;
import ruestgeo.warehousewars.server.SessionManager;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;




@Component
public class ChatSocketHandler extends TextWebSocketHandler {
    

	@Override
	public void handleTextMessage(WebSocketSession session, TextMessage message)
        throws InterruptedException, IOException 
    {
        System.out.println(message.getPayload());
        try{
            Json json = JsonFactory.parse(message.getPayload());
            ChatMessageHandler.onMessage(session.getId(), json);
        }
        catch (IllegalArgumentException e){
            System.err.println(e);
            e.printStackTrace();
        }
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		SessionManager.get("chat").open(session.getId(), session);
	}


    @Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        SessionManager.get("chat").close(session.getId(), status.getCode(), status.getReason(), status);
	}


    @Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        SessionManager.get("chat").close(
            session.getId(), 
            4001, 
            "Transport Error ::   "+exception.getMessage(), 
            new CloseStatus( 4001, ("Transport Error ::   "+exception.getMessage()) )
        );
	}


    
}
