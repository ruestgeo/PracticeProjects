package ruestgeo.warehousewars.server.jakarta;

import ruestgeo.warehousewars.server.GameMessageHandler;
import ruestgeo.warehousewars.server.session.SessionManager;
import ruestgeo.utils.json.wrapper.Json;

import java.io.IOException;

import jakarta.websocket.CloseReason;
import jakarta.websocket.DecodeException;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.SessionException;
import jakarta.websocket.server.ServerEndpoint;




@ServerEndpoint(
    value = "/ww",
    decoders = MessageDecoder.class, 
    encoders = MessageEncoder.class 
)
public class GameEndpoint {

    @OnOpen
    public void onOpen(Session session) throws IOException {
        SessionManager.get("ww").open(session.getId(), session);
        GameMessageHandler.onOpen(session.getId());
    }
     
    @OnClose
    public void onClose(Session session) throws IOException {
        SessionManager.get("ww").close(session.getId(), CloseReason.CloseCodes.NORMAL_CLOSURE.getCode(), "closed normally", null);
        GameMessageHandler.onClose(session.getId(), null);
    }
 
    @OnError
    public void onError(Session session, Throwable throwable) {
        int code = CloseReason.CloseCodes.UNEXPECTED_CONDITION.getCode(); 
        String reason = "unexpected runtime error";
        if (throwable instanceof DecodeException){
            code = CloseReason.CloseCodes.VIOLATED_POLICY.getCode();
            reason = ((DecodeException) throwable).getMessage();
        }
        else if (throwable instanceof SessionException){
            reason = ((SessionException) throwable).getMessage();
        }
        SessionManager.get("ww").close(session.getId(), code, reason, null);
        GameMessageHandler.onError(session.getId(), throwable);
    }

 
    @OnMessage
    public void onMessage(Session session, Json message) throws IOException {
        GameMessageHandler.onMessage(session.getId(), message);
    }

    
}