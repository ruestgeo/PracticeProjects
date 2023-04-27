package ruestgeo.ww.server;



import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.Collection;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.HashMap;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;
import java.util.Date;
import java.util.TimeZone;
import java.util.Calendar;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.lang.Math;
import java.io.IOException;

import com.google.gson.*;

import javax.websocket.Session;
import org.apache.commons.lang3.RandomStringUtils;
import org.glassfish.grizzly.Writer.Reentrant;

import javax.websocket.SendResult;
import javax.websocket.SessionException;
import javax.websocket.SendHandler;

import java.sql.Timestamp;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import javax.xml.bind.DatatypeConverter;





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
    
    Gson gson = new Gson();

    private static ChatManager manager = null; //global chat manager

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
     */
    static synchronized void init (){
        if ( manager == null )
            manager = new ChatManager();   
    }


    /***
     * Get the global chat manager. 
     * Must first be initialized with ChatManager.init()
     * @return the global chat manager
     */
    static ChatManager getGlobalManager (){
        return manager;
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
        /*
        try {
            String token;
            long time_stamp = (new Timestamp(System.currentTimeMillis())).getTime();
            String str = name + time_stamp + "ruestgeo_warehouse-wars_chat";
            MessageDigest digest;
            digest = MessageDigest.getInstance("SHA-256");
            byte[] sha2hash = digest.digest(str.getBytes(StandardCharsets.UTF_8));
            String shaHalf = DatatypeConverter.printHexBinary(sha2hash).toLowerCase();
            String prefix = UUID.randomUUID().toString() + "-";
            token = prefix + shaHalf;
            while ( this.tokens.containsKey(token) ){ //if id already exists then generate new prefix
                prefix = UUID.randomUUID().toString() + "-";
                token = prefix + shaHalf;
            }
            tokens.put(token, new ChatEntry(token));
            return token;
            
        }
        catch (NoSuchAlgorithmException e){ System.err.println(e); }
        */
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

    public ChatEntry setEntryContent (JsonObject pack) throws IllegalArgumentException {
        if (!pack.has("token")){
            throw new IllegalArgumentException("Missing ['token']"); 
        }if (!pack.has("content")){
            throw new IllegalArgumentException("Missing ['content']"); 
        }if (!pack.has("user")){
            throw new IllegalArgumentException("Missing ['user']"); 
        }
        JsonObject user = pack.get("user").getAsJsonObject();
        if (!user.has("id")){
            throw new IllegalArgumentException("Missing ['user.id']"); 
        }if (!user.has("name")){
            throw new IllegalArgumentException("Missing ['user.name']"); 
        }
        String token = pack.get("token").getAsString();
        if (!tokens.containsKey(token))
            throw new IllegalArgumentException("Token does not exist");

        ChatEntry entry = tokens.get(token);
        if (entry == null)
            throw new IllegalArgumentException("Token does not exist");
        entry.expiry = null;
        entry.content = pack.get("content").getAsString();
        entry.userId = user.get("id").getAsString();
        entry.userName = user.get("name").getAsString();
        if (user.has("color"))
            entry.color = user.get("color").getAsString();
        entry.timestamp = (new Timestamp(System.currentTimeMillis())).getTime();
        entry.updateNum = generateUpdateNumber();
        this.messages.put(entry.updateNum, entry);
        this.queue.add(entry.updateNum);
        if (this.queue.size() > queueCapacity) 
            this.queue.poll();
        return entry;
    }




    public void broadcast (String token){
        String message = this.tokens.get(token).toString();
        for (ChatMember member : this.members.values()){
            member.getSession().getAsyncRemote().sendText(message, new AsyncMemberMessageHandler(member));
        }
        
    }


    public synchronized void receiveMessage (Session session, JsonObject pack) throws IllegalArgumentException {
        ChatEntry entry;
        try { 
            entry = setEntryContent(pack);
        }
        catch (IllegalArgumentException e){
            throw e;
        }
        this.membersMutex.lock();
        try {
            if (!members.containsKey(session.getId()))
                this.members.put(session.getId(), new ChatMember(session, entry.userId, entry.userName));
        }
        finally {
            this.membersMutex.unlock();
        }
        this.broadcast(entry.token);
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
                member.getSession().getBasicRemote().sendText(message);
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
     * @return JsonObject containing the failed messageupdates (may be empty) 
     *      and any non-existent messages (may be empty)
     */
    public JsonObject fetch (String sessionId, JsonArray missingUpdates){
        //fetch all
        JsonObject pack = new JsonObject();
        JsonArray failedUpdates = new JsonArray();
        JsonArray nonexistent = new JsonArray();
        ChatMember member = this.members.get(sessionId);
        for (Integer missing: gson.fromJson(missingUpdates, Integer[].class) ){
            if (!this.messages.containsKey(missing)){
                nonexistent.add(missing);
                continue;
            }
            String message = this.messages.get(missing).toString();
            try{
                member.getSession().getBasicRemote().sendText(message);
            }
            catch (IOException e){
                failedUpdates.add(missing);
                System.err.println("error sending sync message ("+missing+") to ChatMember["+member.getName()+" ::   "+member.getId()+"]\n"+e);
            }
        }
        pack.add("failed", failedUpdates);
        pack.add("nonexistent", nonexistent);
        return pack;
    }



    public void removeMember (Session session){
        this.membersMutex.lock();
        try{
            if (this.members.containsKey(session.getId()))
                this.members.remove(session.getId());
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
                if (!member.getSession().isOpen())
                    this.members.remove(member.getSession().getId());
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
            JsonObject pack = new JsonObject();
            JsonObject user = new JsonObject();
            pack.addProperty("type", "chat");
            pack.addProperty("content", this.content);
            pack.addProperty("token", this.token);
            pack.addProperty("timestamp", this.timestamp);
            pack.addProperty("updateNum", this.updateNum);
            user.addProperty("id", this.userId);
            user.addProperty("name", this.userName);
            if (this.color != null)
                user.addProperty("color", this.color);
            pack.add("user", user);
            return gson.toJson(pack);
        }
    }


    private class ChatMember {
        private Session session = null;
        private String userId = null;
        private String userName = null;

        ChatMember (Session session, String id, String name){
            this.userId = id;
            this.userName = name;
            this.session = session;
        }

        String getId (){ return this.userId; }
        String getName (){ return this.userName; }
        Session getSession (){ return this.session; }
    }




    protected class AsyncMemberMessageHandler implements SendHandler {
        private ChatMember member;
        /***
         * A SendHandler that is given a handle to a ChatMember
         * @param member the member with the session using this handler for sending an async message
         */
        public AsyncMemberMessageHandler (ChatMember member){
            this.member = member;
        }
        //@Override
        public void onResult(SendResult result) {
            if ( !result.isOK() ){
                System.err.println("error sending async message to ChatMember["+this.member.getName()+" ::   "+this.member.getId()+"]\n"+result.getException());
            }
        }
    }
}


