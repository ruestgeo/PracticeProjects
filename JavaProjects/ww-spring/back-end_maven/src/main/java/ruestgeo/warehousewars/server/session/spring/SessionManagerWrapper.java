package ruestgeo.warehousewars.server.session.spring;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.warehousewars.server.SessionManager;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;



public class SessionManagerWrapper extends SessionManager {

    private final int CLEAN_INTERVAL = 30*60*1000;
    private final Timer cleanTimer;

    private Map<String, WebSocketSession> sessions = new ConcurrentHashMap<String, WebSocketSession>();
    private ReentrantLock mutex = new ReentrantLock();



    public SessionManagerWrapper (){
        this.cleanTimer = new Timer();
        this.cleanTimer.schedule(new SessionManagerInterval(this), CLEAN_INTERVAL, CLEAN_INTERVAL);
    }


    


    public void open(String sessionId, Object session) {
        try {
            mutex.lock();
            if (session instanceof WebSocketSession)
                sessions.put(sessionId, (WebSocketSession) session);
        } finally {
            mutex.unlock();
        }
    }



    public void close(String sessionId, int code, String reason, Object obj) {
        try {
            mutex.lock();
            if (sessions.containsKey(sessionId)){
                sessions.remove(sessionId);
                System.out.println("||  Session closed\n||      code: "+ code+"\n||      reason: "+reason);
            }
        } finally {
            mutex.unlock();
        }
    }



    public void clean() {
        try {
            mutex.lock();
            for (Entry<String,WebSocketSession> entry : sessions.entrySet()){
                WebSocketSession session = entry.getValue();
                if (!session.isOpen()){
                    sessions.remove(entry.getKey());
                }
            }
        } finally {
            mutex.unlock();
        }
    }



    public boolean isOpen (String sessionId) {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null){
            return session.isOpen();
        }
        else  return false;
    }




    public void send (String sessionId, Json json )  {
        send(sessionId, json.toString());
    }
    public void send (String sessionId, String message ) {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null){
            try {
                session.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                System.err.println("Send Message error ::   "+e);
                e.printStackTrace();
            }
        }
    }



    public void broadcast (Collection<String> sessionIds, Json json ) {
        broadcast(sessionIds, json.toString());
    }
    public void broadcast (Collection<String> sessionIds, String message ) {
        for (String sessionId  :  sessionIds){
            send(sessionId, message);
        }
    }



    public void sendSync (String sessionId, Json json ) throws IOException {
        sendSync(sessionId, json.toString());
    }
    public void sendSync (String sessionId, String message ) throws IOException {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null){
            session.sendMessage(new TextMessage(message));
        }
    }



    public void broadcastSync (Collection<String> sessionIds, Json json ) throws IOException {
        broadcastSync(sessionIds, json.toString());
    }
    public void broadcastSync (Collection<String> sessionIds, String message ) throws IOException {
        Map<String, IOException> exceptions = new HashMap<String,IOException>();
        for (String sessionId  :  sessionIds){
            try {
                sendSync(sessionId, message);
            }
            catch (IOException e){
                exceptions.put(sessionId, e);
            }
        }
        if (exceptions.size() > 0){
            throw new IOException("Errors occurred when sending to :  "
                +exceptions.keySet().toString()
                +"\n\n"+exceptions.values().stream().map(e -> e.toString()+"\n"));
        }
    }



    

    private class SessionManagerInterval extends TimerTask {
        private SessionManager manager;
        public SessionManagerInterval (SessionManager manager){
            this.manager = manager;
        }
        public void run (){
            this.manager.clean();
        }
    }




}
