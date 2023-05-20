package ruestgeo.warehousewars.server.session.jakarta;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.warehousewars.server.session.SessionManager;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

import jakarta.websocket.SendHandler;
import jakarta.websocket.SendResult;
import jakarta.websocket.Session;




public class SessionManagerImpl extends SessionManager {

    private final int CLEAN_INTERVAL = 30*60*1000;
    private final Timer cleanTimer;

    private Map<String, Session> sessions = new ConcurrentHashMap<String, Session>();
    private ReentrantLock mutex = new ReentrantLock();



    public SessionManagerImpl (){
        this.cleanTimer = new Timer();
        this.cleanTimer.schedule(new SessionManagerInterval(this), CLEAN_INTERVAL, CLEAN_INTERVAL);
    }


    


    public void open(String sessionId, Object session) {
        try {
            mutex.lock();
            if (session instanceof Session)
                sessions.put(sessionId, (Session) session);
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
            for (Entry<String,Session> entry : sessions.entrySet()){
                Session session = entry.getValue();
                if (!session.isOpen()){
                    sessions.remove(entry.getKey());
                }
            }
        } finally {
            mutex.unlock();
        }
    }



    public boolean isOpen (String sessionId) {
        Session session = sessions.get(sessionId);
        if (session != null){
            return session.isOpen();
        }
        else  return false;
    }




    public void send (String sessionId, Json json )  {
        send(sessionId, json.toString());
    }
    public void send (String sessionId, String message ) {
        Session session = sessions.get(sessionId);
        if (session != null){
            try {
                session.getAsyncRemote().sendText(message, new AsyncMessageHandler(session));
            } catch (IllegalArgumentException e) {
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
        Session session = sessions.get(sessionId);
        if (session != null){
            try {
                session.getBasicRemote().sendText(message);
            } catch (IllegalArgumentException e) {
                System.err.println("Send Message error ::   "+e);
                e.printStackTrace();
            }
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
                +"\n\n"+exceptions.entrySet().stream().map(e -> e.getKey()+" ::\n"+e.getValue()+"\n\n"));
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



    protected class AsyncMessageHandler implements SendHandler {
        Session session;
        public AsyncMessageHandler (Session sess){
            this.session = sess;
        }
        //@Override
        public void onResult(SendResult result) {
            if ( !result.isOK() ){
                System.err.println("error sending async message to sess ["+session.getId()+"]\n"+result.getException());
            }
        }
    }



    
}
