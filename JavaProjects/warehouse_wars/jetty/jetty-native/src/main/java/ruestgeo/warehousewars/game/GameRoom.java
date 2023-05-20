package ruestgeo.warehousewars.game;

//
import ruestgeo.warehousewars.actors.*;
import ruestgeo.warehousewars.actors.misc.Box;
import ruestgeo.warehousewars.actors.misc.Wall;
import ruestgeo.warehousewars.actors.mobs.Bouncer;
import ruestgeo.warehousewars.actors.mobs.Charger;
import ruestgeo.warehousewars.actors.mobs.Crawler;
import ruestgeo.warehousewars.actors.mobs.Mimic;
import ruestgeo.warehousewars.actors.mobs.Pusher;
import ruestgeo.warehousewars.actors.mobs.Wanderer;
import ruestgeo.warehousewars.actors.mobs.Warper;
import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;
import ruestgeo.utils.random.RandomPick;
import ruestgeo.utils.random.RandomPickTree;

import java.lang.Math;

import java.util.List;
import java.util.ArrayList;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.locks.ReentrantLock;







public class GameRoom {
    final static private String VICTORY_MESSAGE = "{\"type\": \"victory\"}";
    final static private String DEFEAT_MESSAGE = "{\"type\": \"defeat\"}";
    final static private short UPDATE_DIFFERENCE_THRESHOLD = 4;

    /*
     * client can send data at any time, server will send updates of modified actors
     * on interval client will not redraw or recalculate the grid by itself, only by
     * data sent by the server each update will be async and timestamped, only the
     * latest will apply
     * 
     * keep track of whether there was any movement to update, if so send update to
     * all players and set updateFlag to false else dont send update (save
     * bandwidth)
     * 
     * clients will send last update number, if their last update is 5 apart, send
     * the entire board (this will apply full update on Integer.MAX_VALUE as well)
     * 
     * server will track updated Actors per interval, only sending the updated info
     */

    private String name;
    private String id;
    private final GameManager manager;
    private Timer gameLoop;
    private int intervalTime;
    private GameRoomConfigs configs;

    private short width;
    private short height;
    private Actor[][] grid;

    // actor lists/maps?
    private List<Player> players;
    private List<Mob> mobs;
    private List<Misc> misc_movables;
    private List<Misc> misc_unmovables;

    private short currentHealthPoints; // shared extra lives

    // send and parse modified then removed then updated
    private List<Json> modified;
    private List<Actor> removed;
    private List<Actor> updated;
    private int updateNum;
    private Boolean forceFullUpdate;

    private Boolean active = false; // whether the room is started

    private ReentrantLock playersLock = new ReentrantLock();
    private ReentrantLock gameloopLock = new ReentrantLock();

    private ReentrantLock updateLock = new ReentrantLock();




    /***
     * Create a GameRoom object using the global GameManager
     * 
     * @param name the name of the room; not unique
     * @param id   id of the room; must be unique
     */
    public GameRoom(String name, String id, GameRoomConfigs configs) {
        this.manager = GameManager.getGlobalManager();
        this.name = name;
        this.id = id;
        this.players = new ArrayList<Player>();
        this.configs = configs;
        this.width = (short) (configs.gridWidth + 2);
        this.height = (short) (configs.gridHeight + 2);
        this.currentHealthPoints = configs.maxHealthPoints;
        this.grid = new Actor[this.width][this.height];
        this.mobs = new ArrayList<Mob>();
        this.misc_movables = new ArrayList<Misc>();
        this.misc_unmovables = new ArrayList<Misc>();
        this.modified = new ArrayList<Json>();
        this.removed = new ArrayList<Actor>();
        this.updated = new ArrayList<Actor>();
        this.updateNum = 0;
        this.forceFullUpdate = false;
        for (short x = 0; x < this.width; x++) {
            for (short y = 0; y < this.height; y++) {
                grid[x][y] = null; // initialize un-needed for nulls of reference type arrays (0 for Number, false
                                   // for Boolean)
            }
        }
        this.intervalTime = configs.intervalTime;
    }




    /***
     * Create a GameRoom object using the provided GameManager
     * 
     * @param name    the name of the room; not unique
     * @param id      id of the room; must be unique
     * @param manager the game manager responsible for this room
     */
    public GameRoom(String name, String id, GameRoomConfigs configs, GameManager manager) {
        this.manager = manager;
        this.name = name;
        this.id = id;
        this.players = new ArrayList<Player>();
        this.configs = configs;
        this.width = (short) (configs.gridWidth + 2);
        this.height = (short) (configs.gridHeight + 2);
        this.currentHealthPoints = configs.maxHealthPoints;
        this.grid = new Actor[this.width][this.height];
        this.mobs = new ArrayList<Mob>();
        this.misc_movables = new ArrayList<Misc>();
        this.misc_unmovables = new ArrayList<Misc>();
        this.modified = new ArrayList<Json>();
        this.removed = new ArrayList<Actor>();
        this.updated = new ArrayList<Actor>();
        this.updateNum = 0;
        this.forceFullUpdate = false;
        for (short x = 0; x < this.width; x++) {
            for (short y = 0; y < this.height; y++) {
                grid[x][y] = null; // initialize un-needed for nulls of reference type arrays (0 for Number, false
                                   // for Boolean)
            }
        }
        this.intervalTime = configs.intervalTime;
    }

    public Boolean isEmpty() {
        return (this.players.size() == 0);
    }




    /***
     * Add a player to the room if there is space
     * 
     * @param player the player to add
     * @return whether the player was able to join, or false if the game has already started
     */
    public Boolean addPlayer(Player player) {
        if (this.active)
            return false;
        this.playersLock.lock();
        try {
            if (!(this.players.size() < this.configs.maxNumPlayers))
                return false;
            this.players.add(player);
            return true;
        }
        finally {
            this.playersLock.unlock();
        }
    }




    /***
     * Set the player ready state and start the room if all players are ready
     * @param id the id of the player
     * @param ready the ready state of the player
     * @throws IllegalStateException if the player is not in this room
     */
    public void readyPlayer(String id, Boolean ready)
            throws IllegalStateException, IllegalAccessError {
        Player player = null;
        if (this.active)
            throw new IllegalStateException("Game room is already active, cannot switch player ready state");
        this.playersLock.lock();
        try{
            for (Player p : this.players) {
                if (!(p.getId().equals(id)))
                    continue;
                player = p;
                break;
            }
            if (player == null)
                throw new IllegalAccessError("Player is not in this game room");
            if (ready)
                player.ready();
            else
                player.notReady();
            if (this.readyToStart()) {
                this.init(); 
                this.start(); //only called here so no need for lock
                return;
            }
            //else broadcast the ready states to all players
            Json broadcast = JsonFactory.createObject();
            broadcast.set("type", "players_ready");
            broadcast.set("room_id", this.id);
            broadcast.set("players", this.playersReadyStateArray());
            String message = broadcast.toString();
            for (Player p : this.players) {
                p.sendAsync(message);
            }
        }
        finally {
            this.playersLock.unlock();
        }
    }

    

    /***
     * Get the ready state of each player
     * @return the players ready state info
     * @throws IllegalStateException if the game has already started
     */
    public Json getPlayersReadyState () throws IllegalStateException{
        if ( this.active )
            throw new IllegalStateException("Game is already in progress");
        
        this.playersLock.lock();
        try {
            return this.playersReadyStateArray();
        }
        finally {
            this.playersLock.unlock();
        }
    }



    /***
     * Obtain the players ready state info.
     * This should be called within a block that has obtained the playerLock
     * @return a ArrayList<> containing each players ready state info
     */
    private Json playersReadyStateArray (){
        ArrayList<Json> playersReady = new ArrayList<Json>();
        for (Player p : this.players) {
            Json playerInfo = JsonFactory.createObject();
            playerInfo.set("name", p.getName());
            playerInfo.set("id", p.getId());
            playerInfo.set("ready", p.isReady());
            playersReady.add(playerInfo);
        }
        return JsonFactory.create(playersReady);
    }



    /***
     * Check whether all players are ready
     * 
     * @return whether all players are ready
     */
    protected Boolean readyToStart() {
        Boolean ready = true;
        for (Player p : this.players) {
            ready &= p.isReady();
        }
        return ready;
    }



    /***
     * Broadcast a message to all players in the room
     * @param message the message to broadcast
     */
    public void broadcast (String message){
        this.playersLock.lock();
        try {
            for (Player p : this.players){
                p.sendAsync(message);
            }
        }
        finally {
            this.playersLock.unlock();
        }
    }
    /***
     * Broadcast a message to all but the specified player in the room
     * @param message the message to broadcast
     * @param excludePlayerId the player to exclude
     */
    protected void broadcast (String message, String excludePlayerId){
        this.playersLock.lock();
        try {
            for (Player p : this.players){
                if ( !p.getId().equals(excludePlayerId) )
                    p.sendAsync(message);
            }
        }
        finally {
            this.playersLock.unlock();
        }
    }




    /***
     * Initialize all the actors and broadcast a room_init message to all players
     */
    public void init() {
        this.spawnOuterWalls();
        this.spawnAllPlayers();
        this.spawnBoxes();
        this.spawnFixedMobs();
        this.spawnRandomMobs();
        this.spawnWalls();
        this.updated.clear();

        Json updateJson = JsonFactory.createObject();
        updateJson.set("type", "room_init");
        updateJson.set("room_id", this.id);
        updateJson.set("room_name", this.name);
        updateJson.set("height", this.height);
        updateJson.set("width", this.width);
        updateJson.set("actors", this.allActorsToJson(true));
        updateJson.set("max_hp", this.configs.maxHealthPoints);
        updateJson.set("updateNum", this.updateNum);
        String json = updateJson.toString();
        this.playersLock.lock();
        try {
            for (Player player : this.players) {
                player.setLastUpdateNum(this.updateNum);
                player.sendAsync(json);
            }
        }
        finally {
            this.playersLock.unlock();
        }
    }



    /***
     * Stop the game loop  (should be called within a block that has obtained gameloopLock)
     */
    public void stop() {
        if ( this.gameLoop != null )
            this.gameLoop.cancel();
        this.active = false;
    }



    /***
     * Start the game loop  (should be called within a block that has obtained gameloopLock)
     */
    private void start() {
        this.active = true;
        this.gameLoop = new Timer();
        this.gameLoop.schedule(new GameRoomInterval(this), 3000, this.intervalTime); // start after 3 seconds
    }



    /***
     * Pause the game loop  (should be called within a block that has obtained gameloopLock)
     */
    private void pause() {
        if (this.gameLoop == null)
            return;
        this.gameLoop.cancel();
        this.gameLoop = null;
    }



    /***
     * Resume the game loop   (should be called within a block that has obtained gameloopLock)
     */
    private void resume (){
        if (this.gameLoop == null){
            this.gameLoop = new Timer();
            this.gameLoop.schedule(new GameRoomInterval(this), this.intervalTime, this.intervalTime);
        }
            
    }




    public String getName (){
        return this.name;
    }


    public String getId (){
        return this.id;
    }


    /***
     * Is the game room started?
     * @return whether the game room has started
     */
    public Boolean isActive (){
        return this.active;
    }


    public int getUpdateNum (){
        return this.updateNum;
    }



    public int getCapacity (){
        return this.configs.maxNumPlayers;
    }



    public Actor getActor (int x, int y){
        return grid[x][y];
    }



    public Class<?> getActorClass (int x, int y){
        return grid[x][y].getClass();
    }



    public Boolean positionIsEmpty (int x, int y){
        return grid[x][y] == null;
    }



    public Boolean isInstanceOf (int x, int y, Class<?> classType){
        return classType.isInstance(grid[x][y]);
    }


    /***
     * Set the grid position to null and add the position to the list of modified positions
     * which will be used to trace blank spaces on update
     * @param x
     * @param y
     */ 
    protected void setNullPosition (int x, int y){
        this.grid[x][y] = null;
        this.modified.add( JsonFactory.create( 
            List.of(
                JsonFactory.create(x), 
                JsonFactory.create(y)
            )
        ));
    }



    /***
     * Only to be called by the actor specified.
     * Set the position of the actor on the grid to the location specified if the position is empty
     * @param actor the calling actor and the actor to set
     * @param x the horizontal position
     * @param y the vertical position
     */
    public void setActorPosition (Actor actor, int x, int y){
        short[] previousPosition = actor.getPosition();
        if ( !this.positionIsEmpty(x, y) ){  //only move if position is empty
            //System.out.println("cannot set actor pos;  pos not empty");
            return;
        }
        this.setNullPosition(previousPosition[0], previousPosition[1]);
        actor.setPosition(x, y);
        this.grid[x][y] = actor;
        this.updated.add(actor);
    }



    /***
     * Add the actor to updated list to signify that clients should update the 
     * actor icon to the updated direction
     * @param actor
     */
    public void updateActorDirection (Actor actor){
        this.updated.add(actor);
    }



    /***
     * Obtain a random cardinal direction
     * @return the direction represented as a short array [x,y]
     */
    public short[] createDirection (){
        int dx = 0;
        int dy = 0;
        while ( dx==0 && dy==0 ){
            dx = ((int)(Math.random() * (3))) -1;
            dy = ((int)(Math.random() * (3))) -1;
        }
        return new short[]{(short) dx, (short) dy};
    }



    /***
     * Look for a Player nearby and return either that player or null
     * @param x the x coordinate to look around
     * @param y the y coordinate to look around
     * @return a Player nearby or null
     */
    public Player getPlayerNearby (int x, int y){
        if ( Player.class.isInstance(grid[x][y-1]) ) //n
            return (Player) grid[x][y-1];
        if ( Player.class.isInstance(grid[x+1][y-1]) ) //ne
            return (Player) grid[x+1][y-1];
        if ( Player.class.isInstance(grid[x+1][y]) ) //e
            return (Player) grid[x+1][y];
        if ( Player.class.isInstance(grid[x+1][y+1]) ) //se
            return (Player) grid[x+1][y+1];
        if ( Player.class.isInstance(grid[x][y+1]) ) //s
            return (Player) grid[x][y+1];
        if ( Player.class.isInstance(grid[x-1][y+1]) ) //sw
            return (Player) grid[x-1][y+1];
        if ( Player.class.isInstance(grid[x-1][y]) ) //w
            return (Player) grid[x-1][y];
        if ( Player.class.isInstance(grid[x-1][y-1]) ) //nw
            return (Player) grid[x-1][y-1];
        return null;
    }



    /***
     * Obtain the actor in the direction specified relative to the specified position
     * @param x the horizontal position
     * @param y the vertical position
     * @param dx the horizontal direction
     * @param dy the vertical direction
     * @return
     */
    public Actor getActorInDirection (int x, int y, int dx, int dy){
        Actor actor = null;
        int[] pos = new int[]{x+dx, y+dy};
        //System.out.println("actorInDir from pos ("+x+", "+y+") in dir ("+dx+", "+dy+") for new pos ("+pos[0]+","+pos[1]+")");
        while ( actor == null /*&& (pos[0]>0 && pos[0]<this.width && pos[1]>0 && pos[1]<this.height)*/ ){ 
            //will always hit a wall or another actor
            actor = grid[pos[0]][pos[1]];
            //System.out.println("actorInDir at pos ("+pos[0]+","+pos[1]+") is "+(actor==null? "empty": actor.getClass().getSimpleName()) );
            pos[0] += dx;
            pos[1] += dy;
        }
        return actor;
    }




    /***
     * Obtain position that is empty from the grid.
     * If the grid is 50% full then an exception is thrown
     * @return the position of an empty space
     * @throws IllegalStateException if grid is 50% full (not including outer walls)
     */
    public short[] getEmptySpace () throws IllegalStateException{
        int numActors = this.players.size()+this.mobs.size()+this.misc_movables.size()+this.misc_unmovables.size() - ((this.width*2)+(this.height*2)-4); //minus the outer wall
        int numSpaces = (int) (0.5*((this.width-2)*(this.height-2)));
        //System.out.println("numActors "+numActors+"   numSpaces "+numSpaces);
        if ( numActors > numSpaces )
            throw new IllegalStateException("Grid capacity reached (50%).");
        int x = 0;
        int y = 0;
        Boolean cond = false;
        while ( !(cond) ){
            x = (int)((Math.random() * (this.width-1)) + 1);
            y = (int)((Math.random() * (this.height-1)) + 1);
            cond = this.positionIsEmpty(x, y);
        }
        return new short[]{(short) x, (short) y};
    }




    /***
     * Relocate the actor to a free space on the grid
     * @param actor the actor to relocate
     */
    public void relocateActor (Actor actor) {
        int x = 0;
        int y = 0;
        Boolean cond = false;
        short[] pos = actor.getPosition();
        while ( !(cond) ){
            x = (int)((Math.random() * (this.width-1)) + 1);
            y = (int)((Math.random() * (this.height-1)) + 1);
            cond = (this.positionIsEmpty(x, y) && (x != (int)pos[0] || y != (int)pos[1]) );
        }
        short[] previousPosition = actor.getPosition();
        this.setNullPosition(previousPosition[0], previousPosition[1]);
        actor.setPosition(x, y);
        this.grid[x][y] = actor;
        this.updated.add(actor);
    }




    /***
     * Find a new position with free space to relocate an actor
     * @param pos the current position of the actor
     * @return the position to relocate to
     */
    public short[] newPosition (short[] pos) {
        int x = 0;
        int y = 0;
        Boolean cond = false;
        while ( !(cond) ){
            x = (int)((Math.random() * (this.width-1)) + 1);
            y = (int)((Math.random() * (this.height-1)) + 1);
            cond = (this.positionIsEmpty(x, y) && (x != (int)pos[0] || y != (int)pos[1]) );
        }
        //System.out.println("newPos x "+x+"  y "+y);
        return new short[]{(short) x, (short) y};
    }


    /***
     * Spawn the required outer walls that prevent movement outside of the grid
     */
    protected void spawnOuterWalls (){
        for (int x = 0;  x < this.width;  x++){
            Wall wall = new Wall(this, x, 0);
            this.misc_unmovables.add(wall);
            grid[x][0] = wall;
        }
        for (int x = 0;  x < this.width;  x++){
            Wall wall = new Wall(this, x, this.height-1);
            this.misc_unmovables.add(wall);
            grid[x][this.height-1] = wall;
        }
        for (int y = 1;  y < this.height-1;  y++){
            Wall wall = new Wall(this, 0, y);
            this.misc_unmovables.add(wall);
            grid[0][y] = wall;
        }
        for (int y = 1;  y < this.height-1;  y++){
            Wall wall = new Wall(this, this.width-1, y);
            this.misc_unmovables.add(wall);
            grid[this.width-1][y] = wall;
        }
    }



    /***
     * Spawn the inner walls randomly positioned
     */
    protected void spawnWalls (){ 
        for ( int numWalls = 0;  numWalls < this.configs.numWalls;  numWalls++ ){
            short[] pos;
            try {
                pos = this.getEmptySpace();
            }
            catch (IllegalStateException e){
                return;
            }
            Wall wall = new Wall(this,pos[0],pos[1]);
            this.misc_unmovables.add(wall);
            grid[pos[0]][pos[1]] = wall;
        }
    }



    /***
     * Spawn the player randomly positioned
     * @param player
     */
    protected void spawnPlayer (Player player){
        short[] pos;
        try {
            pos = this.getEmptySpace();
        }
        catch (IllegalStateException e){
            return;
        }
        player.spawn(pos[0], pos[1]); //sets grid pos
    }



    /***
     * Spawn all players randomly positioned
     */
    protected void spawnAllPlayers (){
        for ( Player player : this.players ){
            this.spawnPlayer(player);
        }        
    }



    /***
     * Spawn all boxes randomly positioned
     */
    protected void spawnBoxes (){
        for ( int numBoxes = 0;  numBoxes < this.configs.numBoxes;  numBoxes++ ){
            short[] pos;
            try {
                pos = this.getEmptySpace();
            }
            catch (IllegalStateException e){
                return;
            }
            Box box = new Box(this,pos[0],pos[1]);
            this.misc_movables.add(box);
            grid[pos[0]][pos[1]] = box;
        }
    }



    /***
     * Spawn as many mobs as possible at random by the weights defined in the configs
     */
    protected void spawnRandomMobs (){
        RandomPick<String> randomPicker = new RandomPick<String>(this.configs.randomMobWeights);
        randomPicker.compileTable();
        //System.out.println("numRandomMobs "+this.configs.numRandomMobs);
        for ( int mobNum = 0;  mobNum < this.configs.numRandomMobs;  mobNum++ ){
            String randomMobType = randomPicker.getRandom();
            //System.out.println(randomMobType);
            short[] pos;
            short[] dir = this.createDirection();
            //System.out.println("    dir "+dir[0]+", "+dir[1]);
            Mob mob = null;
            try {
                pos = this.getEmptySpace();
                //System.out.println("    pos "+pos[0]+", "+pos[1]);
            }
            catch (IllegalStateException e){ 
                break;
            }
            switch (randomMobType){
                case "Bouncer":
                    mob = new Bouncer(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Bouncer.MIN_DELAY, Bouncer.MAX_DELAY));
                    break;
                case "Wanderer":
                    mob = new Wanderer(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Wanderer.MIN_DELAY, Wanderer.MAX_DELAY));
                    break;
                case "Warper":
                    mob = new Warper(this, pos[0], pos[1], Mob.getRandomDelay(Warper.MIN_DELAY, Warper.MAX_DELAY));
                    break;
                case "Pusher":
                    mob = new Pusher(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Pusher.MIN_DELAY, Pusher.MAX_DELAY));
                    break;
                case "Crawler":
                    mob = new Crawler(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Crawler.MIN_DELAY, Crawler.MAX_DELAY));
                    break;
                case "Charger":
                    mob = new Charger(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Charger.MIN_DELAY, Charger.MAX_DELAY));
                    break;
                case "Mimic":
                    mob = new Mimic(this, pos[0], pos[1], Mob.getRandomDelay(Mimic.MIN_DELAY, Mimic.MAX_DELAY));
                    break;
                default: //bouncer
                    mob = new Bouncer(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Bouncer.MIN_DELAY, Bouncer.MAX_DELAY));
            }
            this.mobs.add(mob);
            grid[pos[0]][pos[1]] = mob;
        }
    }



    /***
     * Spawn as many mobs as possible in a random order, 
     * each iteration of spawning is as defined in the configs
     */
    protected void spawnFixedMobs (){
        RandomPickTree<String> randomPicker = new RandomPickTree<String>(this.configs.fixedMobAmounts);
        //System.out.println("numFixedMobs "+this.configs.numFixedMobs);
        //System.out.println("fixedMobAmounts "+this.configs.fixedMobAmounts.toString());
        for ( int mobNum = 0;  mobNum < this.configs.numFixedMobs;  mobNum++ ){
            String randomMobType = randomPicker.pullRandom();
            //System.out.println(randomMobType == null ? "no further samples can be made" : randomMobType);
            if ( randomMobType == null ){
                break;
            }
            short[] pos;
            short[] dir = this.createDirection();
            //System.out.println("    dir "+dir[0]+", "+dir[1]);
            Mob mob = null;
            try {
                pos = this.getEmptySpace();
                //System.out.println("    pos "+pos[0]+", "+pos[1]);
            }
            catch (IllegalStateException e){ 
                break;
            }
            switch (randomMobType){
                case "Bouncer":
                    mob = new Bouncer(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Bouncer.MIN_DELAY, Bouncer.MAX_DELAY));
                    break;
                case "Wanderer":
                    mob = new Wanderer(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Wanderer.MIN_DELAY, Wanderer.MAX_DELAY));
                    break;
                case "Warper":
                    mob = new Warper(this, pos[0], pos[1], Mob.getRandomDelay(Warper.MIN_DELAY, Warper.MAX_DELAY));
                    break;
                case "Pusher":
                    mob = new Pusher(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Pusher.MIN_DELAY, Pusher.MAX_DELAY));
                    break;
                case "Crawler":
                    mob = new Crawler(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Crawler.MIN_DELAY, Crawler.MAX_DELAY));
                    break;
                case "Charger":
                    mob = new Charger(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Charger.MIN_DELAY, Charger.MAX_DELAY));
                    break;
                case "Mimic":
                    mob = new Mimic(this, pos[0], pos[1], Mob.getRandomDelay(Mimic.MIN_DELAY, Mimic.MAX_DELAY));
                    break;
                default: //bouncer
                    mob = new Bouncer(this, pos[0], pos[1], dir[0], dir[1], Mob.getRandomDelay(Bouncer.MIN_DELAY, Bouncer.MAX_DELAY));
            }
            this.mobs.add(mob);
            grid[pos[0]][pos[1]] = mob;
        }
    }



    /***
     * Whether a player of given id is in the room.
     * @param id the id of the player
     */
    public boolean hasPlayer (String id){
        this.playersLock.lock();
        try {
            for ( Player p : this.players ){
                if ( p.getId().equals(id) )
                    return true;
            }
        }
        finally {
            this.playersLock.unlock();
        }
        return false;
    }



    /***
     * Remove the Mob actor from the grid and the game, 
     * and prepare info to update each client grid
     * @param mob the Mob actor
     */
    public void removeMob (Mob mob){
        short[] pos = mob.getPosition();
        this.setNullPosition(pos[0], pos[1]);
        this.mobs.remove(mob);
        this.removed.add(mob);
    }



    /***
     * Remove the Misc actor from the grid and the game, 
     * and prepare info to update each client grid
     * @param misc the Misc actor
     */
    public void removeMisc (Misc misc){
        short[] pos = misc.getPosition();
        this.setNullPosition(pos[0], pos[1]);
        if ( this.misc_movables.contains(misc) )
            this.misc_movables.remove(misc);
        else 
            this.misc_unmovables.remove(misc);
        this.removed.add(misc);
    }



    /***
     * Remove the player of given id from the game room.
     * If active, the game is paused momentarily while removing the player before resuming
     * @param id the id of the player
     */
    public void removePlayer (String id){
        if ( this.active ){
            this.gameloopLock.lock();
            this.pause();
        }
        try {
            Player player = null;
            this.playersLock.lock();
            try {
                for ( Player p : this.players ){
                    if ( !(p.getId().equals(id)) )
                        continue;
                    player = p;
                    break;
                }
                if ( player == null )
                    return;
                this.players.remove(player);
                
                if ( !this.active ){ //if game hasn't started (prep phase) then broadcast all player ready states as not ready
                    for ( Player p : this.players){
                        p.notReady();
                    }
                    Json playersReady = this.playersReadyStateArray();
                    Json response = JsonFactory.createObject();
                    response.set("type", "players_ready");
                    response.set("room_id", this.id);
                    response.set("players", playersReady);
                    
                    for (Player p : this.players) {
                        p.sendAsync(response.toString());
                    }
                }
            }
            finally {
                this.playersLock.unlock();
            }

            this.updateLock.lock();
            try {
                if ( this.active && (player != null) ){
                    Player temp = new Player(player.getId(), player.getName(), this);
                    temp.playerOut();
                    this.removed.add(temp); //to be used for updating client
                    short[] pos = player.getPosition();
                    this.setNullPosition(pos[0], pos[1]);
                    if (this.isEmpty())
                        this.manager.destroyRoomIfEmpty(this.id);
                }
            }
            finally {
                this.updateLock.unlock();
            }
        }
        finally {
            if ( this.active ){
                this.resume();
                this.gameloopLock.unlock();
            }
        }
    }




    /***
     * Remove all players from the room and broadcast the reason for removal
     * to each player in the room
     * @param reason the reason for removing all players
     */
    public void removeAllPlayers (String reason){
        Json response = JsonFactory.createObject();
        response.set("type", "removed_from_room");
        response.set("reason", reason);
        this.gameloopLock.lock();
        try {
            this.playersLock.lock();
            try {
                for (Player p : this.players) {
                    p.sendAsync(response.toString());
                }
                this.players.clear();
                this.stop();
            }
            finally {
                this.playersLock.unlock();
            }
        }
        finally {
            this.gameloopLock.unlock();
        }
    }


    

    /***
     * Player is out;  
     * if there is remaining health points (lives) then respawn the player and decrement,
     * otherwise remove the player from the grid
     * @param player the Player
     */
    public void playerOut (Player player){
        short[] pos = player.getPosition();
        this.setNullPosition(pos[0], pos[1]);
        
        if ( this.currentHealthPoints == (short) 0 ){
            //System.out.println("player fully out");
            this.removed.add(player);
            player.playerOut();
            //System.out.println(this.removed.toString());
            return;
        }
        //System.out.println("player used spare hp");
        this.currentHealthPoints--;
        short[] newPos = this.newPosition(pos);
        //System.out.println("player respawned to "+newPos[0]+", "+newPos[1]);
        player.spawn(newPos[0], newPos[1]);
    }


    /***
     * Create a JSON representation of all actors in the game room;
     * sorted into bins of player, mob, and misc actors.
     * @return the JSON string
     */
    protected Json allActorsToJson (boolean includeUnmovables){
        Json json = JsonFactory.createObject();
        ArrayList<Json> playersArr = new ArrayList<Json>();
        ArrayList<Json> mobsArr = new ArrayList<Json>();
        ArrayList<Json> miscArr = new ArrayList<Json>();
        for (Player p : this.players){
            Json actorJson = JsonFactory.createObject();
            actorJson.set("name", p.getName());
            actorJson.set("id", p.getId());
            actorJson.set("out", p.isOut());
            actorJson.set("spawned", p.isSpawned());
            actorJson.set("pos",p.getPositionList());
            actorJson.set("dir", Character.toString(p.getDirection()));
            playersArr.add(actorJson);
        }
        for (Mob m : this.mobs){
            Json actorJson = JsonFactory.createObject();
            actorJson.set("class", m.getClass().getSimpleName());
            actorJson.set("pos", m.getPositionList());
            actorJson.set("dir", m.getDirectionList());
            mobsArr.add(actorJson);
        }
        for (Misc m : this.misc_movables){
            Json actorJson = JsonFactory.createObject();
            actorJson.set("class", m.getClass().getSimpleName());
            actorJson.set("pos", m.getPositionList());
            if ( Box.class.isInstance(m) )
                    actorJson.set("variant", ((Box) m).getVariant());
            miscArr.add(actorJson);
        }
        if ( includeUnmovables ){
            for (Misc m : this.misc_unmovables){
                Json actorJson = JsonFactory.createObject();
                actorJson.set("class", m.getClass().getSimpleName());
                actorJson.set("pos", m.getPositionList());
                miscArr.add(actorJson);
            }
        }
        json.set("players", playersArr);
        json.set("mobs", mobsArr);
        json.set("misc", miscArr);
        return json;
    }


    /***
     * Given a list of Actors, return a JSON containing information about those actors
     * sorted into bins of players, mobs, and misc actors.
     * @param list the Actor ArrayList to parse
     * @return a JSON representation of that list of actors
     */
    protected Json listToJson (List<Actor> list){
        Json json = JsonFactory.createObject();
        ArrayList<Json> playersArr = new ArrayList<Json>();
        ArrayList<Json> mobsArr = new ArrayList<Json>();
        ArrayList<Json> miscArr = new ArrayList<Json>();
        for (Actor actor : list){
            Json actorJson = JsonFactory.createObject();
            if ( Player.class.isInstance(actor) ){
                Player p = (Player) actor;
                actorJson.set("name", p.getName());
                actorJson.set("id", p.getId());
                actorJson.set("out", p.isOut());
                actorJson.set("spawned", p.isSpawned());
                if ( !(p.isOut()) ) {
                    actorJson.set("pos", actor.getPositionList());
                    actorJson.set("dir", Character.toString(p.getDirection()));
                }
                playersArr.add(actorJson);
            }
            else if ( Mob.class.isInstance(actor) ){
                actorJson.set("class", actor.getClass().getSimpleName());
                actorJson.set("pos", actor.getPositionList());
                actorJson.set("dir", ((Mob) actor).getDirectionList());
                mobsArr.add(actorJson);
            }
            else {
                if ( Box.class.isInstance(actor) )
                    actorJson.set("variant", ((Box) actor).getVariant());
                actorJson.set("class", actor.getClass().getSimpleName());
                actorJson.set("pos", actor.getPositionList());
                miscArr.add(actorJson);
            }
        }
        json.set("players", playersArr);
        json.set("mobs", mobsArr);
        json.set("misc", miscArr);
        
        return json;
    }


    /**
     * Determine which grid spaces have been set to empty in this interval
     * @return the JSON array containing positions that have been set empty this interval
     */
    protected ArrayList<Json> getBlanksJson (){
        ArrayList<Json> mod = new ArrayList<Json>();
        for ( Json pos : this.modified ){
            if ( this.positionIsEmpty(  pos.get(0).getAsInteger(),  pos.get(1).getAsInteger()  ) ){
                mod.add(pos);
            }
        }
        return mod;
    }


    /***
     * Send full update on the next interval
     */
    public void sendFullUpdate (){
        this.forceFullUpdate = true;
    }


    /***
     * Move the player based on received input.
     * The player cannot move diagonally or move in place.
     * @param id the id of the player
     * @param dx the horizontal movement input
     * @param dy the vertical movement input
     * @param isPulling whether the player is doing a pulling movement
     */
    public void playerMove (String id, int lastUpdateNum, int dx, int dy, Boolean isPulling) {
        this.updateLock.lock();
        try {
            this.playersLock.lock();
            try {
                Player player = null;
                for (Player p : this.players){
                    if ( !(p.getId().equals(id)) )
                        continue;
                    player = p;
                    break;
                }
                if ( player != null ){
                    player.setLastUpdateNum(lastUpdateNum);
                    if ( player.isValidMove(dx, dy) )
                        player.move(dx, dy, isPulling);
                    //else System.out.println("playersMove invalid move dx "+dx+"   dy"+dy);
                }
                //else   System.out.println("playerMove: couldn't find player "+id);
            }
            finally {
                this.playersLock.unlock();
            }
        } 
        finally {
            this.updateLock.unlock();
        }
    }


    /***
     * Do a step in the game room interval.
     * This will first ask each mob to take a step, 
     * then it will ask each Mob to check its states (terminate itself if conditions fufilled).
     */
    public void step (){
        List<Mob> temp = new ArrayList<Mob>(this.mobs);
        for ( Mob mob : temp ){
            mob.step();
        }
        for ( Mob mob : temp ){
            mob.checkCondition();
        }
    }



    /***
     * Send updates to all players.
     * If the victory condition is met then also send a victory message
     */
    public void update (){
        String json;
        Json updateJson = JsonFactory.createObject();
        Boolean updateFull = this.forceFullUpdate;
        this.updateNum++; //overflow will force full update
        
        //safely send updates (which may be ignored by client if left room during this time)
        //alternatively obtain playersLock
        List<Player> playersCopy = new ArrayList<Player>(this.players); 
        if ( updateFull ){
            for ( Player player : playersCopy ){
                if (Math.abs(this.updateNum - player.getLastUpdateNum()) > GameRoom.UPDATE_DIFFERENCE_THRESHOLD) { //send entire board info 
                    updateFull = true;
                    break;
                } //else send only the updated
            }
        }

        this.updateLock.lock();
        try {
            if ( updateFull ){
                updateJson.set("type", "full_update");
                updateJson.set("update", this.allActorsToJson(true));
                updateJson.set("hp", this.currentHealthPoints);
                this.forceFullUpdate = false;
            }
            else if ( !updateFull && this.updated.isEmpty() && this.removed.isEmpty() && this.modified.isEmpty() ){
                //skip update broadcast if partial update and nothing new
                this.checkStageCondition();
                return;
            }
            else {
                updateJson.set("type", "update");
                updateJson.set("blanks", this.getBlanksJson());
                updateJson.set("removed", this.listToJson(this.removed));
                updateJson.set("updated", this.listToJson(this.updated));
            }
            this.updated.clear();
            this.removed.clear();
            this.modified.clear();

            updateJson.set("updateNum", this.updateNum);
            updateJson.set("room_id", this.id);
        }
        finally {
            this.updateLock.unlock();
        }

        json = updateJson.toString();
        for ( Player player : playersCopy ){
            player.sendAsync( json );
        }

        this.checkStageCondition();
    }


    /***
     * Send a player a full update of all actors in the game room
     * @param id the id of the player
     */
    public void sendPlayerFullUpdate (String id){
        this.updateLock.lock();
        try {
            this.playersLock.lock();
            try {
                Player player = null;
                List<Player> playersCopy = new ArrayList<Player>(this.players);
                for (Player p : playersCopy){
                    if ( !(p.getId().equals(id)) )
                        continue;
                    player = p;
                    break;
                }
                if ( player == null )
                    return;
                Json updateJson = JsonFactory.createObject();
                updateJson.set("type", "full_update");
                updateJson.set("update", this.allActorsToJson(true));
                updateJson.set("hp", this.currentHealthPoints);
                updateJson.set("updateNum", this.updateNum+1);
                updateJson.set("room_id", this.id);
                String json = updateJson.toString();
                player.setLastUpdateNum(this.updateNum);
                player.sendAsync(json);
            }
            finally {
                this.playersLock.unlock();
            }
        }
        finally {
            this.updateLock.unlock();
        }
    }


    public void checkStageCondition (){
        List<Player> playersCopy = new ArrayList<Player>(this.players); 
        if  ( this.mobs.isEmpty() ){ //victory
            System.out.println("victory in room "+this.name+" : "+this.id);
            Json broadcast = JsonFactory.parse(VICTORY_MESSAGE);
            broadcast.set("room_id", this.id);
            this.gameloopLock.lock();
            try {
                this.stop();
                for ( Player player : playersCopy ){
                    player.sendAsync(broadcast.toString());
                }
                this.players.clear();
                this.manager.destroyRoomIfEmpty(this.id);
                return;
            }
            finally {
                this.gameloopLock.unlock();
            }
        }

        Boolean allPlayersOut = true;
        for ( Player p : playersCopy ){ 
            allPlayersOut &= p.isOut();
        }
        if ( allPlayersOut ){ //defeat
            System.out.println("defeat in room "+this.name+" : "+this.id);
            Json broadcast = JsonFactory.parse(DEFEAT_MESSAGE);
            broadcast.set("room_id", this.id);
            this.gameloopLock.lock();
            try {
                this.stop();
                for ( Player player : playersCopy ){
                    player.sendAsync(broadcast.toString());
                }
                this.players.clear();
                this.manager.destroyRoomIfEmpty(this.id);
                return;
            }
            finally {
                this.gameloopLock.unlock();
            }
        }
    }







    private class GameRoomInterval extends TimerTask {
        private GameRoom room;
        public GameRoomInterval (GameRoom room){
            this.room = room;
        }
        public void run (){
            try{
                room.step();
                room.update();
            }
            catch (Exception e){
                System.err.println("Error occured during game loop for gameroom ["+this.room.getName()+" :: "+this.room.getId()+"]\n"+e);
                e.printStackTrace();
                System.exit(1);
            }
            
        }
    }
}
