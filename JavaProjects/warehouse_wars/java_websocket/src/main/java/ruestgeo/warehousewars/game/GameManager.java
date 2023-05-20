package ruestgeo.warehousewars.game;

import ruestgeo.utils.random.RandomNumber;
import ruestgeo.utils.random.RandomString;
//
import ruestgeo.warehousewars.actors.Player;

import java.util.Set;
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

import java.sql.Timestamp;
import java.security.NoSuchAlgorithmException;


/***
 * A manager to keep track of all info pertaining to the game and its players
 */
public class GameManager {
    public final static int DEFAULT_ROOM_ID_MIN_LENGTH = 4;
    public final static int DEFAULT_ROOM_ID_MAX_LENGTH = 7;
    public final static String DEFAULT_ROOM_ID_PATTERN = "a0.";
    

    private static GameManager global = new GameManager("global_ww_manager"); ; //global game manager
    private static boolean initialized = false;

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
    private Map<String, Player> playerMapBySession = new HashMap<String, Player>(); //sessionId to Player  (only if player in a room)
    
    private ReentrantLock roomMutex = new ReentrantLock(true); //outer
    private ReentrantLock playerIdMutex = new ReentrantLock(true); //middle
    private ReentrantLock playerMapMutex = new ReentrantLock(true); //inner
    //if accessing 2 or more field levels, then follow the order of obtaining the outer most lock first to the inner most lock last

    private final int maxNumRooms;
    private final int roomIdMinLength;
    private final int roomIdMaxLength;
    private final String roomIdPattern;

    private final Timer cleanUp;

    



    /***
     * Create a GameManager with specified id length and pattern.
     * @param name the name of the manager
     * @param minRoomIdLength the min length for a room id (at least 4 and same as pattern length; silently enforced)
     * @param maxRoomIdLength the max length for a room id (at least same as min and pattern length; silently enforced)
     * @param pattern a pattern format for the room id (length should be between 0 and min, inclusive)
     * 
     * Positions of special characters (exlcuding "?"), alphabetic characters,
     *  and numeric characters are preserved.
     * Alphanumeric characters are randomized.
     * "?" represents a wildcard that selects a random alphanumeric character.
     * Special characters are maintained as provided.
     * 
     * "a.0-?" for example would mean a random alphabetic char followed by
     * a dot, followed by a numeric char, followed by a dash, followed by either
     * a numeric char or a alphabetic char.
     */
    private GameManager (String name, int minRoomIdLength, int maxRoomIdLength, String pattern){
        this.name = name;
        this.roomIdMinLength = Math.max(Math.max(4, minRoomIdLength), pattern.length());
        this.roomIdMaxLength = Math.max(Math.max(maxRoomIdLength, this.roomIdMinLength), pattern.length());
        this.roomIdPattern = pattern;
        int maxRoomsCount = 0;
        for (int i = this.roomIdMinLength;  i < this.roomIdMaxLength;  i++){
            maxRoomsCount += Math.pow(RandomString.ALPHANUMERIC_CHARS.length(), i);
        }
        this.maxNumRooms = maxRoomsCount;

        this.cleanUp = new Timer();
        this.cleanUp.schedule(new GameManagerInterval(this), 30*60*1000, 30*60*1000); 
    }


    /***
     * Create a GameManager with specified id pattern.
     * @param name the name of the manager
     * @param pattern a pattern format for the room id;  every generated id will have the same length
     * 
     * Positions of special characters (exlcuding "?"), alphabetic characters,
     *  and numeric characters are preserved.
     * Alphanumeric characters are randomized.
     * "?" represents a wildcard that selects a random alphanumeric character.
     * Special characters are maintained as provided.
     * 
     * "a.0-?" for example would mean a random alphabetic char followed by
     * a dot, followed by a numeric char, followed by a dash, followed by either
     * a numeric char or a alphabetic char.
     */
    private GameManager (String name, String pattern){
        this(name, pattern.length(), pattern.length(), pattern);
    }


    /***
     * Create a GameManager with specified id length
     * @param name the name of the manager
     * @param minRoomIdLength the min length for a room id (at least 4)
     * @param maxRoomIdLength the max length for a room id
     */
    private GameManager (String name, int minRoomIdLength, int maxRoomIdLength){
        this(name, minRoomIdLength, maxRoomIdLength, DEFAULT_ROOM_ID_PATTERN);
    }


    /***
     * Create a GameManager with default properties
     * @param name the name of the manager
     */
    private GameManager (String name){
        this(name, DEFAULT_ROOM_ID_MIN_LENGTH, DEFAULT_ROOM_ID_MAX_LENGTH, DEFAULT_ROOM_ID_PATTERN);
    }  




    /***
     * Initialize a global game manager
     * @deprecated global GameManager is already initialized with defaults
     */
    @Deprecated
    public static synchronized void init (){
        if ( !initialized ){
            initialized = true;
            global = new GameManager("global_ww_manager");   
        }
    }
    
    /***
     * Initialize a global game manager
     */
    static synchronized void init (int minRoomIdLength, int maxRoomIdLength){
        if ( !initialized ){
            initialized = true;
            global = new GameManager("global_ww_manager",minRoomIdLength, maxRoomIdLength);   
        }
    }
    
    /***
     * Initialize a global game manager
     */
    static synchronized void init (int minRoomIdLength, int maxRoomIdLength, String pattern){
        if ( !initialized ){
            initialized = true;
            global = new GameManager("global_ww_manager",minRoomIdLength, maxRoomIdLength, pattern);   
        }
    }


    /***
     * Get the global game manager. 
     * Must first be initialized with GameManager.init()
     * @return the global game manager
     */
    public static GameManager getGlobalManager (){
        return global; 
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
            int patternLength = RandomNumber.getInt(this.roomIdMinLength, this.roomIdMaxLength);
            String pattern = RandomString.extendPattern(this.roomIdPattern, patternLength-this.roomIdPattern.length());
            id = RandomString.generate(pattern);
            while ( roomIds.contains(id) ){
                id = RandomString.generate(pattern);
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
    public GameRoom joinRoom (String playerId, String roomId, String sessionId) throws IllegalStateException{
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
                Player player = new Player(playerId, players.get(playerId), sessionId, room);
                this.playerMapMutex.lock();
                try {
                    if ( this.playerMapById.containsKey(playerId) ){ //destroy the old player
                        Player oldPlayer = this.playerMapById.get(playerId);
                        oldPlayer.getRoom().removePlayer(playerId);
                        this.playerMapById.remove(playerId);
                        this.playerMapBySession.remove(oldPlayer.getSession());
                    }                        
                    this.playerMapById.put(playerId, player);
                    this.playerMapBySession.put(sessionId, player);
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
     * @param sessionId of the player 
     */
    public void removePlayerSession (String sessionId){
        GameRoom room = null;
        this.playerMapMutex.lock();
        try {
            Player player = this.playerMapBySession.get(sessionId);
            if ( player == null )
                return;
            room = player.getRoom();
            room.removePlayer(player.getId());
            this.playerMapById.remove(player.getId());
            this.playerMapBySession.remove(sessionId);
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
     * @param id of the player 
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
     * Remove player from room iff player is actually in the room.
     * The player id to name relation will remain until expiry.
     * @param playerId
     * @param roomId
     */
    public void removePlayer (String playerId, String roomId){
        GameRoom room = null;
        this.playerMapMutex.lock();
        try {
            Player player = this.playerMapById.get(playerId);
            if ( player == null )
                return;
            room = player.getRoom();
            if (room.getId().equals(roomId)){
                room.removePlayer(playerId);
                this.playerMapById.remove(playerId);
                this.playerMapBySession.remove(player.getSession());
            }
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
            String prefix = name + "-" + time_stamp+ "_";
            String random = UUID.randomUUID().toString();
            id = prefix + random;
            while ( this.players.containsKey(id) ){
                random = UUID.randomUUID().toString();
                id = prefix + random;
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
            String prefix = name + "-" + time_stamp+ "_";
            String random = UUID.randomUUID().toString();
            id = prefix  + random;
            while ( this.players.containsKey(id) ){
                random = UUID.randomUUID().toString();
                id = prefix + random;
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




    private class GameManagerInterval extends TimerTask {
        private GameManager manager;
        public GameManagerInterval (GameManager manager){
            this.manager = manager;
        }
        public void run (){
            try{
                this.manager.cleanUp();
            }
            catch (Exception e){
                System.err.println("Error occured during manager cleanup loop ::\n"+e);
            }
            
        }
    }
}
