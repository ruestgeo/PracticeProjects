package ruestgeo.warehousewars.server.jws;

import ruestgeo.warehousewars.server.GameMessageHandler;
import ruestgeo.warehousewars.server.session.SessionManager;
import ruestgeo.utils.json.wrapper.Json;

import org.java_websocket.WebSocket;





public class GameEndpoint {

    public void onOpen(WebSocket session) {
        SessionManager.get("ww").open(session.getAttachment(), session);
        GameMessageHandler.onOpen(session.getAttachment());
    }

    public void onClose(WebSocket session, int code, String reason, boolean remote) {
        SessionManager.get("ww").close(session.getAttachment(), code, reason, remote);
        GameMessageHandler.onClose(session.getAttachment(), null);
    }

    public void onError(WebSocket session, Throwable throwable) {
        int code = 1011; 
        String reason = "unexpected runtime error ::   "+throwable.getMessage();
        SessionManager.get("ww").close(session.getAttachment(), code, reason, false);
        GameMessageHandler.onError(session.getAttachment(), throwable);
    }
    
    public void onMessage(WebSocket session, Json message) {
        GameMessageHandler.onMessage(session.getAttachment(), message);
    }

    
}