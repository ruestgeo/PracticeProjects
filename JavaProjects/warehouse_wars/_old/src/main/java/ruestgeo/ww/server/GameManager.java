package ruestgeo.ww.server;

//
import ruestgeo.ww.server.actors.Player;
//import sun.net.www.content.text.plain;

import java.util.ArrayList;
import java.util.Set;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
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

import com.google.gson.*;

import javax.websocket.Session;
import org.apache.commons.lang3.RandomStringUtils;
import org.glassfish.grizzly.Writer.Reentrant;

import java.sql.Timestamp;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import javax.xml.bind.DatatypeConverter;


/***
 * A manager to keep track of all info pertaining to the game and its players
 */
public class GameManager {
    public final String ALPHA_NUMERIC = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; //length 62
    public final static int DEFAULT_ROOM_ID_MIN_LENGTH = 6;
    public final static int DEFAULT_ROOM_ID_MAX_LENGTH = 8;
    

    private static GameManager manager = null; //global game manager

    private String name;
    private Map<String, GameRoom> rooms = new HashMap<String, GameRoom>(); //id to GameRoom
    private Map<String, Date> roomExpiration = new HashMap<String, Date>(); //id to expiration time
    private Map<String, String> players = new HashMap<String, String>(); //id to name
    private Map<String, Date> playerIdExpiration = new HashMap<String, Date>(); //id to expiration time
        /*on interval check if expired, 
        if so and player in game then extend by 1hour, 
        otherwise remove player entirely
        */
    private Map<String, Player> playerMapById = new HashMap<String, Player>(); //id to Player (only if player in a room)
    private Map<Session, Player> playerMapBySession = new HashMap<Session, Player>(); //Session to Player  (only if player in a room)
    
    private ReentrantLock roomMutex = new ReentrantLock(true); //outer
    private ReentrantLock playerIdMutex = new ReentrantLock(true); //middle
    private ReentrantLock playerMapMutex = new ReentrantLock(true); //inner
    //if accessing 2 or more field levels, then follow the order of obtaining the outer most lock first to the inner most lock last

    private final int maxNumRooms;
    private final int roomIdMinLength;
    private final int roomIdMaxLength;

    private final Timer cleanUp;

    



    /***
     * Create a GameManager with default properties
     * @param name the name of the manager
     */
    public GameManager (String name){
        this.name = name;

        this.roomIdMinLength = DEFAULT_ROOM_ID_MIN_LENGTH;
        this.roomIdMaxLength = DEFAULT_ROOM_ID_MAX_LENGTH;
        int maxRoomsCount = 0;
        for (int i = this.roomIdMinLength;  i < this.roomIdMaxLength;  i++){ //there's probably a better way to do this that i can't remember
            maxRoomsCount += Math.pow(ALPHA_NUMERIC.length(), i);
        }
        this.maxNumRooms = maxRoomsCount;
        

        this.cleanUp = new Timer();
        this.cleanUp.schedule(new GameManagerInterval(this), 30*60*1000, 30*60*1000); 
    }  
    /***
     * Create a GameManager with specified id length
     * @param name the name of the manager
     * @param minRoomIdLength the min length for a room id
     * @param maxRoomIdLength the max length for a room id
     */
    public GameManager (String name, int minRoomIdLength, int maxRoomIdLength){
        this.name = name;
        this.roomIdMinLength = minRoomIdLength;
        this.roomIdMaxLength = maxRoomIdLength;
        int maxRoomsCount = 0;
        for (int i = this.roomIdMinLength;  i < this.roomIdMaxLength;  i++){
            maxRoomsCount += Math.pow(ALPHA_NUMERIC.length(), i);
        }
        this.maxNumRooms = maxRoomsCount;

        this.cleanUp = new Timer();
        this.cleanUp.schedule(new GameManagerInterval(this), 30*60*1000, 30*60*1000); 
    }



    /***
     * Initialize a global game manager
     */
    static void init (){
        if ( manager != null )
            throw new IllegalStateException("Global GameManager has already been initialized.");
        manager = new GameManager("global_ww_manager");   
    }


    /***
     * Get the global game manager. 
     * Must first be initialized with GameManager.init()
     * @return the global game manager
     */
    static GameManager getGlobalManager (){
        return manager;
    }



    
    /***
     * Get the game manager name
     * @return name of the manager object from which this was called
     */
    public String getName (){
        return this.name;
    }

    
    
    /***
     * Create a gameroom using the provided configs object
     * @param name name of the game room
     * @return the GameRoom created
     * @throws IllegalStateException if max capacity for gamerooms has been reached
     */
    public GameRoom createRoom (String name, GameRoomConfigs configs) throws IllegalStateException{
        this.roomMutex.lock();
        try{
            Set<String> roomIds = this.rooms.keySet();
            if ( roomIds.size() >= this.maxNumRooms*0.5 ) //50% of room ids have been used, collision would be too high for comfort
                throw new IllegalStateException("No more GameRooms can be created.");
            String id = null;
            id = RandomStringUtils.randomAlphanumeric(this.roomIdMinLength, this.roomIdMaxLength);
            while ( roomIds.contains(id) ){
                id = RandomStringUtils.randomAlphanumeric(this.roomIdMinLength, this.roomIdMaxLength);
            }
            GameRoom room = new GameRoom(name, id, configs);
            rooms.put(id,room);
            this.setRoomExpiration(id, 2);
            return room;
        }
        finally {
            this.roomMutex.unlock();
        }
    }


    /***
     * Obtain the room by id if it exists
     * @param id the id of the room
     * @return the GameRoom or null
     */
    public GameRoom getRoom (String id){
        this.roomMutex.lock();
        try {
            return this.rooms.get(id);
        }
        finally {
            this.roomMutex.unlock();
        }
    }

    
    /***
     * Insert a player into a room if there is space.
     * @param playerId the player to enter into the room
     * @param roomId the room to insert the player
     * @param session the player session
     * @return the GameRoom if player was able to enter, otherwise null
     * @throws IllegalStateException if either id is invalid
     */
    public GameRoom joinRoom (String playerId, String roomId, Session session) throws IllegalStateException{
        this.roomMutex.lock();
        try {
            GameRoom room = rooms.get(roomId);
            if ( room == null )
                throw new IllegalStateException("Room id is invalid");
            if ( room.isActive() )
                throw new IllegalStateException("Room has already started");
            this.playerIdMutex.lock();
            try {
                if ( !players.containsKey(playerId) )
                    throw new IllegalStateException("Player id is invalid");
                Player player = new Player(playerId, players.get(playerId), session, room);
                this.playerMapMutex.lock();
                try {
                    if ( this.playerMapById.containsKey(playerId) ){ //destroy the old player
                        Player oldPlayer = this.playerMapById.get(playerId);
                        oldPlayer.getRoom().removePlayer(playerId);
                        this.playerMapById.remove(playerId);
                        this.playerMapBySession.remove(oldPlayer.getSession());
                    }                        
                    this.playerMapById.put(playerId, player);
                    this.playerMapBySession.put(session, player);
                    return (room.addPlayer(player) ? room : null);
                }
                finally {
                    this.playerMapMutex.unlock();
                }
            }
            finally {
                this.playerIdMutex.unlock();
            }
        }
        finally {
            this.roomMutex.unlock();
        }   
    }



    /***
     * Destroy the room if it is empty.
     * This is called when a player leaves a room (by the manager), or on room victory/defeat (by the room)
     * @param id of the room
     */
    public void destroyRoomIfEmpty (String id){
        this.roomMutex.lock();
        try {
            GameRoom room = this.rooms.get(id);
            if ( room == null )
                return;
            if ( room.isEmpty() ){
                System.out.println("room ["+id+"] is empty thus is destroyed");
                room.stop();
                this.rooms.remove(id);
                this.roomExpiration.remove(id);
            }
        }
        finally {
            this.roomMutex.unlock();
        }
    }



    /***
     * Remove player from rooms.
     * The player id to name relation will remain until expiry.
     * @param session of the player 
     */
    public void removePlayer (Session session){
        GameRoom room = null;
        this.playerMapMutex.lock();
        try {
            Player player = this.playerMapBySession.get(session);
            if ( player == null )
                return;
            room = player.getRoom();
            room.removePlayer(player.getId());
            this.playerMapById.remove(player.getId());
            this.playerMapBySession.remove(session);
        }
        finally {
            this.playerMapMutex.unlock();
            if ( room != null ) 
                this.destroyRoomIfEmpty(room.getId());
        }
    }



    /***
     * Remove player from rooms.
     * The player id to name relation will remain until expiry.
     * @param session of the player 
     */
    public void removePlayer (String id){
        GameRoom room = null;
        this.playerMapMutex.lock();
        try {
            Player player = this.playerMapById.get(id);
            if ( player == null )
                return;
            room = player.getRoom();
            room.removePlayer(id);
            this.playerMapById.remove(id);
            this.playerMapBySession.remove(player.getSession());
        }
        finally {
            this.playerMapMutex.unlock();
            if ( room != null )
                this.destroyRoomIfEmpty(room.getId());
        }
    }
    








    /***
     * Request a unique name to use, 
     * if successful then the player is also assigned a unique id (to be kept as a cookie) and returns the id
     * if unsuccessful then returns null
     * @param name the requested name
     * @return a string id on success or null on failure
     * @throws NoSuchAlgorithmException if "SHA-256" doesn't exist for MessageDigest
     */
    public String[] requestUniqueName (String name) throws NoSuchAlgorithmException{
        this.playerIdMutex.lock();
        try {
            if ( players.containsValue(name) ){
                return null;
            }
            /* create a unique ID */
            String id;
            long time_stamp = (new Timestamp(System.currentTimeMillis())).getTime();
            String str = name + time_stamp + "ruestgeo_warehouse-wars";
            MessageDigest digest;
            digest = MessageDigest.getInstance("SHA-256");
            byte[] sha2hash = digest.digest(str.getBytes(StandardCharsets.UTF_8));
            String shaHalf = DatatypeConverter.printHexBinary(sha2hash).toLowerCase();
            String prefix = UUID.randomUUID().toString() + "-";
            id = prefix + shaHalf;
            while ( this.players.containsKey(id) ){ //if id already exists then generate new prefix
                prefix = UUID.randomUUID().toString() + "-";
                id = prefix + shaHalf;
            }
            players.put(id, name);
            return new String[]{id, this.dateToHttpDate(this.setPlayerExpiration(id, 24))};
        }
        finally {
            this.playerIdMutex.unlock();
        }
        
    }


    /***
     * Request a unique name to use given an already assigned unique id.
     * If the id is invalid then request the name and a new unique id (to be kept as a cookie) 
     * 
     * @param id the existing id
     * @param name the requested name
     * @return the id if successful, otherwise  null
     * @throws NoSuchAlgorithmException if "SHA-256" doesn't exist for MessageDigest
     */
    public String[] requestUniqueName (String id, String name) throws NoSuchAlgorithmException{
        this.playerIdMutex.lock();
        Boolean unlock = true;
        try {
            if ( !(players.containsKey(id)) ){
                this.playerIdMutex.unlock();
                unlock = false;
                return this.requestUniqueName(name);
            }
            if ( players.containsValue(name) )
                return null;
            players.replace(id, name);
            return new String[]{id, this.dateToHttpDate(this.setPlayerExpiration(id, 24))};
        }
        finally {
            try{
                if ( unlock )
                    this.playerIdMutex.unlock();
            }
            catch (IllegalMonitorStateException e){} //not the lock holding thread
        }
        
    }


    /***
     * Request a non-unique name to use, 
     * the player is also assigned a unique id (to be kept as a cookie) and returns the id
     * @param name the requested name
     * @return a string id
     * @throws NoSuchAlgorithmException if "SHA-256" doesn't exist for MessageDigest
     */
    public String[] requestName (String name) throws NoSuchAlgorithmException{
        this.playerIdMutex.lock();
        try {
            String id;
            long time_stamp = (new Timestamp(System.currentTimeMillis())).getTime();
            String str = name + time_stamp + "ruestgeo_warehouse-wars";
            MessageDigest digest;
            digest = MessageDigest.getInstance("SHA-256");
            byte[] sha2hash = digest.digest(str.getBytes(StandardCharsets.UTF_8));
            String shaHalf = DatatypeConverter.printHexBinary(sha2hash).toLowerCase();
            String prefix = UUID.randomUUID().toString() + "-";
            id = prefix + shaHalf;
            while ( this.players.containsKey(id) ){ //if id already exists then generate new prefix
                prefix = UUID.randomUUID().toString() + "-";
                id = prefix + shaHalf;
            }
            players.put(id, name);
            return new String[]{id, this.dateToHttpDate(this.setPlayerExpiration(id, 24))};
        }
        finally {
            this.playerIdMutex.unlock();
        }
    }


    /***
     * Request a non-unique name to use given an already assigned unique id.
     * If the id is invalid then request the name and a new unique id (to be kept as a cookie)
     * 
     * @param id the existing id
     * @param name the requested name
     * @return the id if successful, otherwise  null
     * @throws NoSuchAlgorithmException if "SHA-256" doesn't exist for MessageDigest
     */
    public String[] requestName (String id, String name) throws NoSuchAlgorithmException{
        this.playerIdMutex.lock();
        Boolean unlock = true;
        try {
            if ( !(players.containsKey(id)) ){
                this.playerIdMutex.unlock();
                unlock = false;
                return this.requestName(name);
            }
            players.replace(id, name);
            return new String[]{id, this.dateToHttpDate(this.setPlayerExpiration(id, 24))};
        }
        finally {
            try{
                if ( unlock )
                    this.playerIdMutex.unlock();
            }
            catch (IllegalMonitorStateException e){} //not the lock holding thread
        }
        
    }



    /***
     * Set the room expiration;  Should be called within a block with roomMutex Obtained
     * @param id the room id to set expiry for
     * @param hoursUntilExpiration the hours until expiry
     * @return the expiration as a Date object
     */
    private Date setRoomExpiration (String id, int hoursUntilExpiration){
        Calendar calendar = Calendar.getInstance();
	    calendar.add(Calendar.HOUR_OF_DAY, hoursUntilExpiration);
        Date date = calendar.getTime();
        this.roomExpiration.put(id, date);
        return date;
    }

    /***
     * Set the player Expiration;  Should be called within a block with playerIdMutex locked
     * @param id the player id to set expiry for
     * @param hoursUntilExpiration the hours until expiry
     * @return the expiration as a Date object
     */
    private Date setPlayerExpiration (String id, int hoursUntilExpiration){
        Calendar calendar = Calendar.getInstance();
	    calendar.add(Calendar.HOUR_OF_DAY, hoursUntilExpiration);
        Date date = calendar.getTime();
        this.playerIdExpiration.put(id, date);
        return date;
    }


    /***
     * Return the date as an HTTP friendly date format
     * @param date the Date object
     * @return a string representation
     */
    private String dateToHttpDate (Date date){
        DateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", java.util.Locale.US);
        df.setTimeZone(TimeZone.getTimeZone("GMT"));
        return df.format(date);
    }




    /***
     * Check the player Id expiration date and remove expired Id's from the list
     * if the player is not currently playing, otherwise extend the expiration period another 25min locally.
     */
    public void cleanUp (){
        this.playerIdMutex.lock();
        try {
            this.playerMapMutex.lock();
            try {
                Set<String> playerIds = this.playerIdExpiration.keySet();
                Iterator<String> iter = playerIds.iterator();
                while (iter.hasNext()){
                    String id = iter.next();
                    Date expiry = this.playerIdExpiration.get(id);
                    Date now = new Date();
                    if ( expiry.before(now) ){ //expired
                        if ( this.playerMapById.get(id) != null ){ //currently in a game
                            Calendar calendar = Calendar.getInstance();
                            calendar.add(Calendar.MINUTE, 25);
                            Date extension = calendar.getTime();
                            this.playerIdExpiration.replace(id, extension);
                            System.out.println("EXTENDED player ["+id+"] until "+expiry.toString());
                        }
                        else {
                            iter.remove(); //player will check cookie expiration every time they visit the lobby and watches for cookie changes while in lobby
                            //playerIds.remove(id);
                            System.out.println("REMOVED EXPIRED player ["+id+"]");
                        }
                    }
                }
            }
            finally {
                this.playerMapMutex.unlock();
            }    
        }
        finally {
            this.playerIdMutex.unlock();
        }

        //clean up all rooms
        this.roomMutex.lock();
        try {
            Set<String> roomIds = this.rooms.keySet();
            Iterator<String> iter = roomIds.iterator();
            while (iter.hasNext()){
                String roomId = iter.next();
                GameRoom room = this.rooms.get(roomId);
                Date expiry = this.roomExpiration.get(roomId);
                Date now = new Date();
                
                if ( expiry.before(now) ){
                    iter.remove();
                    this.roomExpiration.remove(roomId);
                    System.out.println("REMOVED EXPIRED room ["+roomId+"]");
                    room.removeAllPlayers("Time limit has been reached!\nReturning to lobby");
                    continue;
                }

                if ( room.isEmpty() ){
                    iter.remove();
                    this.roomExpiration.remove(roomId);
                    System.out.println("REMOVED EMPTY room ["+roomId+"]");
                    continue;
                }
            }
        }
        finally {
            this.roomMutex.unlock();
        }
    }
}
