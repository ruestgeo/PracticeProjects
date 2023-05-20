package ruestgeo.warehousewars.server.session.jws;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.random.RandomString;
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

import org.java_websocket.WebSocket;






public class SessionManagerImpl extends SessionManager {

    private final int CLEAN_INTERVAL = 30*60*1000;
    private final Timer cleanTimer;

    private final String idPattern = ".????-";

    private Map<String, WebSocket> sessions = new ConcurrentHashMap<String, WebSocket>();
    private ReentrantLock mutex = new ReentrantLock();



    public SessionManagerImpl (){
        this.cleanTimer = new Timer();
        this.cleanTimer.schedule(new SessionManagerInterval(this), CLEAN_INTERVAL, CLEAN_INTERVAL);
    }



    public boolean exists (String sessionId){
        return this.sessions.containsKey(sessionId);
    }


    public String generateId (){
        return this.generateId(null, null);
    }
    public String generateId (String prefix){
        return this.generateId(prefix, null);
    }
    public String generateId (String prefix, String suffix){
        if (prefix == null)
            prefix = "";
        if (suffix == null)
            suffix = "";
        String rand = RandomString.generate(this.idPattern);
        String id = prefix + rand + suffix;
        int count = 0;
        while (this.sessions.containsKey(id)){
            if (count%10 == 0){
                suffix += "*";
            }
            rand = RandomString.generate(this.idPattern);
            id = prefix + rand + suffix;
            count++;
        }
        System.out.println("generated: "+id);
        return id;
    }


    


    public void open(String sessionId, Object session) {
        try {
            mutex.lock();
            if (session instanceof WebSocket)
                sessions.put(sessionId, (WebSocket) session);
        } finally {
            mutex.unlock();
        }
    }



    public void close(String sessionId, int code, String reason, Object obj) {
        try {
            mutex.lock();
            if (sessions.containsKey(sessionId)){
                sessions.remove(sessionId);
                System.out.println("||  Session closed\n||      code: "+ code
                +"\n||      reason: "+reason
                +"\n||      remote: "+((boolean) obj));
            }
        } finally {
            mutex.unlock();
        }
    }



    public void clean() {
        try {
            mutex.lock();
            for (Entry<String,WebSocket> entry : sessions.entrySet()){
                WebSocket session = entry.getValue();
                if (!session.isOpen()){
                    sessions.remove(entry.getKey());
                }
            }
        } finally {
            mutex.unlock();
        }
    }



    public boolean isOpen (String sessionId) {
        WebSocket session = sessions.get(sessionId);
        if (session != null){
            return session.isOpen();
        }
        else  return false;
    }




    public void send (String sessionId, Json json )  {
        send(sessionId, json.toString());
    }
    public void send (String sessionId, String message ) {
        WebSocket session = sessions.get(sessionId);
        if (session != null){
            if (!session.isOpen()){
                System.err.println("Send Message error ::   session["+sessionId+"] not open");
            }
            else {
                session.send(message);
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
        WebSocket session = sessions.get(sessionId);
        if (session != null){
            if (!session.isOpen()){
                throw new IOException("Send Message error ::   session["+sessionId+"] not open");
            }
            else {
                session.send(message);
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



    
}
