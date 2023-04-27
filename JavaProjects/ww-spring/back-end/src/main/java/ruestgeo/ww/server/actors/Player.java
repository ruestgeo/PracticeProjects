package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;

import javax.websocket.Session;
import javax.websocket.SendResult;
import javax.websocket.SessionException;
import javax.websocket.SendHandler;
import java.util.Map;
import java.util.HashMap;
import java.io.IOException;
import java.util.Collections;



//players: {id, name, Session obj}
public class Player extends Actor {
    public static final char[][] DIRECTIONS = {/*-1*/{'4','w','3'}, /*0*/{'n','c','s'}, /*1*/{'1','e','2'}};
    /* DIRECTIONS (only n/e/s/w are used)
        4 n 1
        w c e
        3 s 2
    */
    public static final Map<Character, short[]>PULL_POSITIONS;
    public static final Map<Character, short[]>MUTABLE_PULL_POSITIONS = new HashMap<Character, short[]>();
    public static final Map<Character, char[][]> PULL_DIRECTIONS; //based on Player.direction
    protected static final Map<Character, char[][]> MUTABLE_PULL_DIRECTIONS = new HashMap<Character, char[][]>();
    static {
        MUTABLE_PULL_DIRECTIONS.put(Character.valueOf('n'), new char[][]{{'-','e','-'}, {'-','-','n'}, {'-','w','-'}} ); //facing N, can pull E/S/W
        MUTABLE_PULL_DIRECTIONS.put(Character.valueOf('e'), new char[][]{{'-','e','-'}, {'s','-','n'}, {'-','-','-'}} ); //facing E, can pull S/W/N
        MUTABLE_PULL_DIRECTIONS.put(Character.valueOf('s'), new char[][]{{'-','e','-'}, {'s','-','-'}, {'-','w','-'}} ); //facing S, can pull W/N/E
        MUTABLE_PULL_DIRECTIONS.put(Character.valueOf('w'), new char[][]{{'-','-','-'}, {'s','-','n'}, {'-','w','-'}} ); //facing W, can pull N/E/S
        PULL_DIRECTIONS = Collections.unmodifiableMap(MUTABLE_PULL_DIRECTIONS);

        MUTABLE_PULL_POSITIONS.put('n', new short[]{0,-1});
        MUTABLE_PULL_POSITIONS.put('e', new short[]{1,0});
        MUTABLE_PULL_POSITIONS.put('s', new short[]{0,1});
        MUTABLE_PULL_POSITIONS.put('w', new short[]{-1,0});
        PULL_POSITIONS = Collections.unmodifiableMap(MUTABLE_PULL_POSITIONS);
    }


    protected String id;
    protected String name;
    protected Session session;
    protected Boolean readyToStart;
    protected Boolean isLeader;
    protected int lastUpdate;
    protected Boolean out;
    protected char direction; //nsew  ; no diagonal movement
    protected Boolean invincible;
    protected Boolean spawned;
    


    public Player (String id, String name, Session session, GameRoom room){
        super(room,-1,-1);
        this.id = id;
        this.name = name; 
        this.session = session;
        this.out = false;
        this.invincible = true;
        this.readyToStart = false;
        this.spawned = false;
        this.direction = 's';
    }
    public Player (String id, String name, GameRoom room){
        super(room,-1,-1);
        this.id = id;
        this.name = name; 
        this.session = null;
        this.out = false;
        this.invincible = true;
        this.readyToStart = false;
        this.spawned = false;
        this.direction = 's';
    }

    public String getId (){
        return this.id;
    }
    public void setId (String val){
        this.id = val;
    }

    public String getName (){
        return this.name;
    }
    public void setName (String val){
        this.name = val;
    }

    public Session getSession (){
        return this.session;
    }
    public void setSession (Session val){
        this.session = val;
    }

    public int getLastUpdateNum (){
        return this.lastUpdate;
    }
    public void setLastUpdateNum (int updateNum){
        this.lastUpdate = updateNum;
    }

    public Boolean isOut (){
        return this.out;
    }
    public void playerOut (){
        this.out = true;
    }

    public void ready (){
        this.readyToStart = true;
    }
    public void notReady (){
        this.readyToStart = false;
    }
    public Boolean isReady (){
        return this.readyToStart;
    }

    public Boolean isSpawned (){
        return this.spawned;
    }

    public void spawn (int x, int y){
        this.invincible = true;
        this.spawned = true;
        this.setPosition(x, y);
        this.room.setActorPosition(this, x, y);
    }

    /**
     * Send an Async message to the client
     * @param message the string message to send
     */
    public void sendAsync (String message){
        if (message == null)
            return;
        this.getSession().getAsyncRemote().sendText(message, new AsyncPlayerMessageHandler(this));
    }

    /**
     * Send a sync message to the client
     * @param message the string message to send
     */
    public void sendSync (String message){
        if (message == null)
            return;
        try{
            this.getSession().getBasicRemote().sendText(message);
        }
        catch (IOException e){
            System.err.println("error sending sync message to Player["+this.name+"::"+this.id+"]\n"+e);
            //if player disconnects the endpoint should (?) detect it and handle it accordingly
            //set full update
            this.room.sendFullUpdate();
        }
    }

    

    //Player is not dangerous to other Player actors
    public Boolean isDangerous() {
        return false;
    }

    
    //Player can be pushed by a Pusher(Mob)
    public Boolean isPushableBy (Actor actor) {
        return Pusher.class.isInstance(actor);
    }

    //Player is not pullable
    public Boolean isPullableBy (Actor actor) {
        return false;
    }

    
    //Player can push actors who are not dangerous, a Wall or a Player
    public Boolean canPush (Actor actor) {
        // Anything except dangerous actors, Walls, Players
        if ( !(actor.isDangerous()) || Wall.class.isInstance(actor) || Player.class.isInstance(actor) )
            return false;
        return true;
    }


    //Player is only movable by Pusher(Mob)
    public Boolean requestMove (Actor requestor, int dx, int dy) {
        if ( this.invincible )
            return false;
        if ( requestor.isDangerous() ){
            //System.out.println("requestor ["+(requestor.getClass().getSimpleName())+"] is hostile; player out");
            this.room.playerOut(this);
            return true;
        }
        short[] pos = this.position;
        if ( Pusher.class.isInstance(requestor) ){
            Actor actor = this.room.getActor(pos[0]+dx, pos[1]+dy);
            if ( actor.isDangerous() ){
                this.room.playerOut(this);
                return true;
            }
            if ( actor.requestMove(this, dx, dy) ){
                this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
                return true;
            }
        }
        return false;
    }

    
    /***
     * @return whether the requested move is valid, 
     * which is a single cell movement either vertically or horizontally
     */
    public Boolean isValidMove (int dx, int dy){
        return ( (Math.abs(dx) <= 1)  &&  (Math.abs(dy) <= 1) && (Math.abs(dx)+Math.abs(dy) == 1) );
    }

    /***
     * @return the direction the player is facing
     */
    public char getDirection (){
        return this.direction;
    }

    /***
     * Set the direction the player is facing
     * @param dir the direction character
     */
    public void setDirection (char dir){
        this.direction = dir;
    }


    /***
     * The Player will move as per the provided inputs.
     * If the player moves into a dangerous actor then the player is outted
     * @param dx the horizontal direction
     * @param dy the vertical direction
     * @param isPulling whether the player is performing a pulling movement
     */
    public void move (int dx, int dy, Boolean isPulling){  
        if ( this.spawned ){
            this.invincible = false;
            this.spawned = false;
        }
        char previousDirection = this.direction;
        short[] pos = this.position;
        if ( !(isPulling) ){ //if not pulling
            char movementDirection = Player.DIRECTIONS[dx+1][dy+1];
            //System.out.println("moveDir(push) "+movementDirection+"\ndx "+dx+"\ndy"+dy);
            this.direction = movementDirection; //set based on dx,dy mapping
            Actor actor = this.room.getActor(pos[0]+dx, pos[1]+dy);
            if ( actor == null ){
                //System.out.println("free move to emptyspace");
                this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
            }
            else {
                if ( actor.isDangerous() ){
                    //System.out.println("actorInDir ["+(actor.getClass().getSimpleName())+"] is hostile; player out");
                    this.room.playerOut(this); 
                }
                else if ( actor.requestMove(this, dx, dy) ){
                    //System.out.println("requested move, success");
                    this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
                }
                else { //if ( previousDirection == movementDirection ){
                    //System.out.println("requested move, failed; updating player direction");
                    this.room.updateActorDirection(this);
                }
            }
        }
        else {
            Actor actor = this.room.getActor( pos[0]+dx, pos[1]+dy);
            if ( actor != null ){ //only move if empty space
                //System.out.println("cannot move, actor in the way");
                if ( actor.isDangerous() ){
                    //System.out.println("actorInDir ["+(actor.getClass().getSimpleName())+"] is hostile; player out");
                    this.room.playerOut(this); 
                }
                else {
                    this.room.updateActorDirection(this);
                }
            }
            else{
                short[] relativePosition = PULL_POSITIONS.get(previousDirection);
                Actor actorToPull = this.room.getActor(pos[0]+relativePosition[0], pos[1]+relativePosition[1]);
                char movementDirection = PULL_DIRECTIONS.get(this.direction)[dx+1][dy+1];
                this.direction = movementDirection;
                //System.out.println("moveDir(pull) "+movementDirection+"\ndx "+dx+"\ndy"+dy);
                this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy); //move regardless of pull result
                if ( actorToPull == null ){
                    return;
                }
                if ( !actorToPull.isPullableBy(this) ){
                    return;
                }
                actorToPull.requestMove(this, relativePosition[0]*(-1), relativePosition[1]*(-1)); //move to where player was prior
                return;
            }
            
        }
    }



    protected class AsyncPlayerMessageHandler implements SendHandler {
        private Player player;
        /***
         * A SendHandler that is given a handle to a Player (this Player)
         * @param player the player with the session using this handler for sending an async message
         */
        public AsyncPlayerMessageHandler (Player player){
            this.player = player;
        }
        //@Override
        public void onResult(SendResult result) {
            if ( !result.isOK() ){
                System.err.println("error sending async message to Player["+this.player.getName()+"::"+this.player.getId()+"]\n"+result.getException());
            }
        }
    }
}
