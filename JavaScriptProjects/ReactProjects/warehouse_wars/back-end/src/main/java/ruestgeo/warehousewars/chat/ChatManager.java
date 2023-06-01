package ruestgeo.warehousewars.chat;


import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;
import ruestgeo.warehousewars.server.SessionManager;

import java.util.Set;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.HashMap;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;
import java.util.Date;
import java.util.Calendar;
import java.io.IOException;

import java.sql.Timestamp;
import java.security.NoSuchAlgorithmException;








/***
 * A manager to keep track of all info pertaining to the game and its players
 */
public class ChatManager {
    public final String ALPHA_NUMERIC = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; //length 62
    private final Integer CLEAN_INTERVAL = 30*60*1000;
    public final Integer EXPIRY_MS = 5*60*1000; //5 min
    public final Integer MAX_UPDATE_NUM = Integer.MAX_VALUE; 
    public final Integer QUEUE_LIMIT = 200;
    private Integer queueCapacity = Integer.min(QUEUE_LIMIT, MAX_UPDATE_NUM);
    

    private static ChatManager global = new ChatManager(); //global chat manager

    private String name;
    
    private ReentrantLock channelMutex = new ReentrantLock(true); //keeping it simple with one channel
    private ReentrantLock membersMutex = new ReentrantLock(true);
    
    private Map<String, ChatMember> members = new HashMap<String, ChatMember>(); //members of the channel via sessionId
    private Map<String, ChatEntry> tokens = new HashMap<String, ChatEntry>();
    private Map<Integer, ChatEntry> messages = new HashMap<Integer, ChatEntry>();

    
    private Queue<Integer> queue = new LinkedList<Integer>();
    private Integer latestUpdateNum = 0;

    private final Timer cleanUp;
    



    /***
     * Create a ChatManager with default properties
     */
    private ChatManager (){
        this.name = "Global";

        this.cleanUp = new Timer();
        this.cleanUp.schedule(new ChatManagerInterval(this), CLEAN_INTERVAL, CLEAN_INTERVAL);
    }
    



    /***
     * Initialize a global game manager
     * @deprecated global ChatManager is already initialized with defaults
     */
    @Deprecated
    public static synchronized void init (){
        if ( global == null )
            global = new ChatManager();
    }


    /***
     * Get the global chat manager. 
     * Must first be initialized with ChatManager.init()
     * @return the global chat manager
     */
    public static ChatManager getGlobalManager (){
        return global;
    }



    
    /***
     * Get the chat manager name
     * @return name of the manager object from which this was called
     */
    public String getName (){
        return this.name;
    }

    public Integer getUpdateNum (){
        return this.latestUpdateNum;
    }


    /***
     * Request a unique token to use, 
     * if successful then the a chat entry is assigned a unique token and returns the token
     * if unsuccessful then returns null
     * @return a string id on success or null on failure
     * @throws NoSuchAlgorithmException if "SHA-256" doesn't exist for MessageDigest
     */
    public String generateUniqueToken (){
        this.channelMutex.lock();
        String token;
        long time_stamp = (new Timestamp(System.currentTimeMillis())).getTime();
        token = "--." + time_stamp; //should be unique due to lock
        Integer count = 1;
        while ( this.tokens.containsKey(token) && count++ < 32 ){
            time_stamp = (new Timestamp(System.currentTimeMillis())).getTime();
            token = "-".repeat(count)+"." + time_stamp; //should be unique due to lock
        }
        if (this.tokens.containsKey(token)){
            return null;
        }
        try {
            tokens.put(token, new ChatEntry(token));
        }
        finally {
            this.channelMutex.unlock();
        }
        return token;
    }
    public String generateUniqueToken (String userId){
        this.channelMutex.lock();
        String token;
        long time_stamp = (new Timestamp(System.currentTimeMillis())).getTime();
        token = userId + "." + time_stamp; //assuming userId is unique, this will be as well
        try {
            tokens.put(token, new ChatEntry(token));
        }
        finally {
            this.channelMutex.unlock();
        }
        return token;
    }


    /**
     * generate the next update number
     * @return An integer update number 
     */
    public synchronized Integer generateUpdateNumber (){
        Integer updateNum = this.latestUpdateNum++;
        if (this.latestUpdateNum > MAX_UPDATE_NUM)
            this.latestUpdateNum = 0;
        return updateNum;
    }

    
    public ChatEntry setEntryContent (String token, String message, String id, String name, String color) throws IllegalArgumentException {
        if (!tokens.containsKey(token))
            throw new IllegalArgumentException("Token does not exist");
        ChatEntry entry = tokens.get(token);
        if (entry == null)
            throw new IllegalArgumentException("Token does not exist");
        entry.expiry = null;
        entry.content = message;
        entry.userId = id; 
        entry.userName = name;
        entry.color = color;
        entry.timestamp = (new Timestamp(System.currentTimeMillis())).getTime();
        entry.updateNum = generateUpdateNumber();
        this.messages.put(entry.updateNum, entry);
        this.queue.add(entry.updateNum);
        if (this.queue.size() > queueCapacity) 
            this.queue.poll();
        return entry;
    } //(type:'chat', content:string, token:string, user:{id,name,color? *:string}, timestamp?:number, updateNum?:number)

    public ChatEntry setEntryContent (Json pack) throws IllegalArgumentException {
        if (!pack.has("token")){
            throw new IllegalArgumentException("Missing ['token']"); 
        }if (!pack.has("content")){
            throw new IllegalArgumentException("Missing ['content']"); 
        }if (!pack.has("user")){
            throw new IllegalArgumentException("Missing ['user']"); 
        }
        Json user = pack.get("user");
        if (!user.has("id")){
            throw new IllegalArgumentException("Missing ['user.id']"); 
        }if (!user.has("name")){
            throw new IllegalArgumentException("Missing ['user.name']"); 
        }
        String token = pack.get("token").getString();
        if (!tokens.containsKey(token))
            throw new IllegalArgumentException("Token does not exist");

        ChatEntry entry = tokens.get(token);
        if (entry == null)
            throw new IllegalArgumentException("Token does not exist");
        entry.expiry = null;
        entry.content = pack.get("content").getString();
        entry.userId = user.get("id").getString();
        entry.userName = user.get("name").getString();
        if (user.has("color"))
            entry.color = user.get("color").getString();
        entry.timestamp = (new Timestamp(System.currentTimeMillis())).getTime();
        entry.updateNum = generateUpdateNumber();
        this.messages.put(entry.updateNum, entry);
        this.queue.add(entry.updateNum);
        if (this.queue.size() > queueCapacity) 
            this.queue.poll();
        return entry;
    }




    public void broadcast (String token) throws IOException {
        String message = this.tokens.get(token).toString();
        SessionManager.get("chat").broadcast(
            this.members.values().stream().map(member -> member.getSessionId()).collect(Collectors.toSet()), 
            message
        );
    }


    public synchronized void receiveMessage (String sessionId, Json pack) throws IllegalArgumentException {
        ChatEntry entry;
        try { 
            entry = setEntryContent(pack);
        }
        catch (IllegalArgumentException e){
            throw e;
        }
        this.membersMutex.lock();
        try {
            if (!members.containsKey(sessionId))
                this.members.put(sessionId, new ChatMember(sessionId, entry.userId, entry.userName));
        }
        finally {
            this.membersMutex.unlock();
        }

        try {
            this.broadcast(entry.token);
        } 
        catch (IOException e) {
            System.err.println("!!  ERROR broadcasting message to Chat["+this.name+"]\n"+e);
        }
        
    }

    /**
     * fetch one message and send to member
     * @param sessionId
     * @param token
     * @return true if successfully sent, false if token does not exist
     * @throws IOException if failed to send the message
     */
    public boolean fetch (String sessionId, String token) throws IOException{
        //fetch one
        ChatMember member = this.members.get(sessionId);
        if (!this.tokens.containsKey(token))
            return false;
        String message = this.tokens.get(token).toString();
            try{
                SessionManager.get("chat").sendSync(member.getSessionId(), message);
            }
            catch (IOException e){
                System.err.println("error sending sync message to ChatMember["+member.getName()+" ::   "+member.getId()+"]\n"+e);
                throw e;
            }
            return true;
    }
    /**
     * fetch all missing messages and send them to memeber
     * @param sessionId
     * @param missingUpdates
     * @return Json containing the failed messageupdates (may be empty) 
     *      and any non-existent messages (may be empty)
     */
    public Json fetch (String sessionId, Json missingUpdates){
        //fetch all
        Json pack = JsonFactory.createObject();
        Json failedUpdates = JsonFactory.createArray();
        Json nonexistent = JsonFactory.createArray();;
        ChatMember member = this.members.get(sessionId);
        for (Json json: missingUpdates ){
            Integer missing = json.getAsInteger();
            if (!this.messages.containsKey(missing)){
                nonexistent.add(missing);
                continue;
            }
            String message = this.messages.get(missing).toString();
            try{
                SessionManager.get("chat").sendSync(member.getSessionId(), message);
            }
            catch (IOException e){
                failedUpdates.add(missing);
                System.err.println("error sending sync message ("+missing+") to ChatMember["+member.getName()+" ::   "+member.getId()+"]\n"+e);
            }
        }
        pack.set("failed", failedUpdates);
        pack.set("nonexistent", nonexistent);
        return pack;
    }



    public void removeMember (String sessionId){
        this.membersMutex.lock();
        try{
            if (this.members.containsKey(sessionId))
                this.members.remove(sessionId);
        }
        finally {
            this.membersMutex.unlock();
        }
    }
    



    /***
     * Remove any empty chat entries to free up the token
     */
    public void cleanUp (){
        //clean up channel
        this.channelMutex.lock();
        try {
            Set<String> tokens = this.tokens.keySet();
            Iterator<String> iter = tokens.iterator();
            while (iter.hasNext()){
                String token = iter.next();
                ChatEntry entry = this.tokens.get(token);
                Integer updateNum = entry.updateNum;

                if ( entry.isEmpty() && entry.isExpired() ){
                    iter.remove();
                    if (this.messages.containsKey(updateNum)) 
                        this.messages.remove(updateNum);
                    System.out.println("REMOVED EXPIRED entry ["+token+"]");
                }
            }
        }
        finally {
            this.channelMutex.unlock();
        }

        //clean up connections
        this.membersMutex.lock();
        try{
            for (ChatMember member : this.members.values())
                if (!SessionManager.get("chat").isOpen(member.getSessionId()))
                    this.members.remove(member.getSessionId());
        }
        finally {
            this.membersMutex.unlock();
        }

    }





    private class ChatManagerInterval extends TimerTask {
        private ChatManager manager;
        public ChatManagerInterval (ChatManager manager){
            this.manager = manager;
        }
        public void run (){
            this.manager.cleanUp();
        }
    }

    private class ChatEntry {
        //(content:string, token:string, user:{id,name,color? *:string}, timestamp?:number, updateNum?:number)
        String token;
        Date expiry; //null when content filled
        String content = null;
        String userId = null;
        String userName = null;
        String color = null; 
        long timestamp = -1; 
        Integer updateNum = -1;
        
        ChatEntry (String newToken){
            this.token = newToken;
            this.timestamp = (new Timestamp(System.currentTimeMillis())).getTime();

            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.MILLISECOND, EXPIRY_MS);
            this.expiry = calendar.getTime();
        }

        Boolean isEmpty (){
            return this.expiry != null; 
        }
        Boolean isExpired (){
            return this.expiry.before(new Date());
        }

        /**
         * Return a JSON representation
         */
        public String toString (){ //(type:'chat', content:string, token:string, user:{id,name,color? *:string}, timestamp?:number, updateNum?:number)
            Json pack = JsonFactory.createObject();
            Json user = JsonFactory.createObject();
            pack.set("type", "chat");
            pack.set("content", this.content);
            pack.set("token", this.token);
            pack.set("timestamp", this.timestamp);
            pack.set("updateNum", this.updateNum);
            user.set("id", this.userId);
            user.set("name", this.userName);
            if (this.color != null)
                user.set("color", this.color);
            pack.set("user", user);
            return pack.toString();
        }
    }


    private class ChatMember {
        private String sessionId = null;
        private String userId = null;
        private String userName = null;

        ChatMember (String sessionId, String id, String name){
            this.userId = id;
            this.userName = name;
            this.sessionId = sessionId;
        }

        String getId (){ return this.userId; }
        String getName (){ return this.userName; }
        String getSessionId (){ return this.sessionId; }
    }


    
}


