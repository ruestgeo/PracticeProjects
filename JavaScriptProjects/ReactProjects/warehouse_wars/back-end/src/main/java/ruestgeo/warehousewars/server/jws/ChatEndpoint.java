package ruestgeo.warehousewars.server.jws;

import ruestgeo.warehousewars.server.SessionManager;
import ruestgeo.warehousewars.server.ChatMessageHandler;
import ruestgeo.utils.json.wrapper.Json;

import org.java_websocket.WebSocket;





public class ChatEndpoint {

    public void onOpen(WebSocket session) {
        SessionManager.get("chat").open(session.getAttachment(), session);
        ChatMessageHandler.onOpen(session.getAttachment());
    }

    public void onClose(WebSocket session, int code, String reason, boolean remote) {
        SessionManager.get("chat").close(session.getAttachment(), code, reason, remote);
        ChatMessageHandler.onClose(session.getAttachment(), null);
    }

    public void onError(WebSocket session, Throwable throwable) {
        int code = 1011; 
        String reason = "unexpected runtime error ::   "+throwable.getMessage();
        SessionManager.get("chat").close(session.getAttachment(), code, reason, false);
        ChatMessageHandler.onError(session.getAttachment(), throwable);
    }

    public void onMessage(WebSocket session, Json message) {
        ChatMessageHandler.onMessage(session.getAttachment(), message);
    }
}