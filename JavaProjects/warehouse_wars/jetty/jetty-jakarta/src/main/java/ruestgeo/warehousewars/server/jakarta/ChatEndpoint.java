package ruestgeo.warehousewars.server.jakarta;

import ruestgeo.warehousewars.server.SessionManager;
import ruestgeo.warehousewars.server.ChatMessageHandler;
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
    value = "/chat",
    decoders = MessageDecoder.class,
    encoders = MessageEncoder.class 
)
public class ChatEndpoint {

    @OnOpen
    public void onOpen(Session session) throws IOException {
        SessionManager.get("chat").open(session.getId(), session);
        ChatMessageHandler.onOpen(session.getId());
    }
     
    @OnClose
    public void onClose(Session session) throws IOException {
        SessionManager.get("chat").close(session.getId(), CloseReason.CloseCodes.NORMAL_CLOSURE.getCode(), "closed normally", null);
        ChatMessageHandler.onClose(session.getId(), null);
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
        SessionManager.get("chat").close(session.getId(), code, reason, null);
        ChatMessageHandler.onError(session.getId(), throwable);
    }

 
    @OnMessage
    public void onMessage(Session session, Json message) throws IOException {
        ChatMessageHandler.onMessage(session.getId(), message);
    }
}