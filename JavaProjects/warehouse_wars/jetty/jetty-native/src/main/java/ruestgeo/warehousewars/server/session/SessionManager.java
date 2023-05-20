package ruestgeo.warehousewars.server.session;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.warehousewars.server.session.jetty.SessionManagerImpl;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;



public abstract class SessionManager {

    /** A global instance of a SessionManager */
    public static final SessionManager global = new SessionManagerImpl();
    private static ReentrantLock mutex = new ReentrantLock();



    private static Map<String, SessionManager> managers = new HashMap<String, SessionManager>();


    /**
     * Get the SessionManager of a given name, or create it if it does not exist.
     * @param name
     * @return the matched SessionManager or a new instance of SessionManager under given name
     */
    public static SessionManager get (String name) {
        try {
            mutex.lock();
            if (managers.containsKey(name)){
                return managers.get(name);
            }
            else {
                SessionManager manager = new SessionManagerImpl();
                managers.put(name, manager);
                return manager;
            }
        }
        finally {
            mutex.unlock();
        }
    }


    /**
     * Create a SessionManager with a given name if it doesn't already exist
     * @param name
     */
    public static void create (String name) {
        try {
            mutex.lock();
            if (!managers.containsKey(name)){
                managers.put(name, new SessionManagerImpl());
            }
        }
        finally {
            mutex.unlock();
        }
    }






    /**
     * Registers a session to the session manager
     * @param session An object of a Session, to be handled internally by the SessionManagerImpl
     */
    public abstract void open (String sessionId, Object session);


    /**
     * Removes a session
     */
    public abstract void close (String sessionId, int code, String reason, Object obj);


    /**
     * Remove all unused sessions
     */
    public abstract void clean ();


    /** 
     * Whether a session is open and connected
     */
    public abstract boolean isOpen (String sessionId);




    /**
     * Asynchronously send a message to a client session
     */
    public abstract void send (String sessionId, Json json );

    /**
     * Asynchronously send a message to a client session
     */
    public abstract void send (String sessionId, String message );



    /**
     * Asynchronously send a message to all client sessions listed in a collection
     */
    public abstract void broadcast (Collection<String> sessionIds, Json json );

    /**
     * Asynchronously send a message to all client sessions listed in a collection
     */
    public abstract void broadcast (Collection<String> sessionIds, String message );





    /**
     * Synchronously send a message to a client session
     */
    public abstract void sendSync (String sessionId, Json json ) throws IOException;

    /**
     * Synchronously send a message to a client session
     */
    public abstract void sendSync (String sessionId, String message ) throws IOException;



    /**
     * Synchronously send a message to all client sessions listed in a collection
     */
    public abstract void broadcastSync (Collection<String> sessionIds, Json json ) throws IOException;

    /**
     * Synchronously send a message to all client sessions listed in a collection
     */
    public abstract void broadcastSync (Collection<String> sessionIds, String message ) throws IOException;




}
