package ruestgeo.warehousewars.server.jetty;


import ruestgeo.warehousewars.server.session.SessionManager;
import ruestgeo.warehousewars.server.session.jetty.SessionManagerImpl;
import ruestgeo.warehousewars.server.GameMessageHandler;
import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;

import java.util.Date;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.StatusCode;
import org.eclipse.jetty.websocket.api.WebSocketAdapter;





public class GameEndSession extends WebSocketAdapter {

    //private Session session;
    private String sessionId;



    @Override
    public void onWebSocketConnect(Session session) {
        super.onWebSocketConnect(session); 
        //this.session = session;
        String timestamp = Long.toString(new Date().getTime());
        this.sessionId = ((SessionManagerImpl) SessionManager.get("ww")).generateId("ww", timestamp);
        SessionManager.get("ww").open(this.sessionId, session);
        GameMessageHandler.onOpen(this.sessionId);
    }

    @Override
    public void onWebSocketClose(int statusCode, String reason) {
        SessionManager.get("ww").close(this.sessionId, statusCode, reason, null);
        GameMessageHandler.onClose(this.sessionId, null);
        super.onWebSocketClose(statusCode, reason);
    }

    @Override
    public void onWebSocketError(Throwable throwable) {
        GameMessageHandler.onError(this.sessionId, throwable);
        int code = StatusCode.SERVER_ERROR; //1011 
        String reason = "unexpected runtime error ::   "+throwable.getMessage();
        SessionManager.get("ww").close(this.sessionId, code, reason, null);
        super.onWebSocketError(throwable);
    }

    @Override
    public void onWebSocketText(String message) {
        super.onWebSocketText(message);
        Json json;
        try {
            json = JsonFactory.parse(message);
        }
        catch (IllegalArgumentException e){
            System.err.println(e);
            e.printStackTrace();
            return;
        }
        GameMessageHandler.onMessage(this.sessionId, json);
    }

    
}