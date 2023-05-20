package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public class Mimic extends Mob {
    public static final short MIN_DELAY = 10; //interval for hunting player after sensing it
    public static final short MAX_DELAY = 25;
    public static final short SENSE_DELAY = 5; //interval for sensing player nearby
    
    private Boolean wary = false;
    private Boolean attacking = false;

    public Mimic(GameRoom room, int x, int y, int delay) {
        super(room, x, y, 0, 0, delay);
    }

    //Mimic will attack a Player if remaining near it for a number of frames
    public void step() {
        //if wary, look for player nearby and move to player
        //else look for player nearby every SENSE_DELAY
        int dc = this.delayCount;
        short[] pos = this.getPosition();
        if ( (this.wary && (dc < this.delay)) || (!(this.wary) && (dc < Mimic.SENSE_DELAY)) ){
            this.setDelayCount(dc+1);
            return;
        }
        if ( this.wary ){ //wary, check for player nearby on delay interval and attack if nearby
            this.wary = false;
            Player p = this.room.getPlayerNearby(pos[0], pos[1]);
            if ( p != null ){ //move towards player
                short[] playerPos = p.getPosition();
                this.attacking = true;
                int dx = playerPos[0]-pos[0];
                int dy = playerPos[1]-pos[1];
                if ( p.requestMove(this, dx, dy) )
                    this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
                this.setDelayCount(0);
                this.attacking = false;
            }
        }
        else { //not wary, check for player nearby on SENSE_DELAY interval
            Player p = this.room.getPlayerNearby(pos[0], pos[1]);
            if ( p != null ){
                this.wary = true;
                this.setDelayCount(0);
            }
        }
    }

    //Mimic cannot be requested to terminate
    public Boolean terminate(Actor actor) {
        return false;
    }

    //Mimic will not terminate by a passive condition
    public void checkCondition() {
        return;
    }

    //Mimic is only dangerous when attacking
    public Boolean isDangerous() {
        return this.attacking;
    }

    //Mimic can be pushed like a Box
    public Boolean isPushableBy(Actor actor) {
        return ( (Player.class.isInstance(actor)) || (Pusher.class.isInstance(actor)) 
            || (Box.class.isInstance(actor)) || (Mimic.class.isInstance(actor)) );
    }

    //Mimic can be pulled like a Box
    public Boolean isPullableBy(Actor actor) {
        return Player.class.isInstance(actor);
    }

    //Mimic can push like a Box
    public Boolean canPush(Actor actor) {
        return (Box.class.isInstance(actor) || Mimic.class.isInstance(actor));
    }

    //Mimic can be pushed by Player/Box/Pusher/Mimic, and will terminate if pushed with Boxes on both sides of push movement
    public Boolean requestMove(Actor requestor, int dx, int dy) {
        if ( !(Player.class.isInstance(requestor)) && !(Pusher.class.isInstance(requestor)) 
            && !(Misc.class.isInstance(requestor)) && !(Mimic.class.isInstance(requestor)) )
            return false;
        short[] pos = this.getPosition();
        Actor actorAhead = this.room.getActor(pos[0]+dx, pos[1]+dy);
        if ( actorAhead != null){
            if ( Misc.class.isInstance(actorAhead) && Misc.class.isInstance(requestor) ){ //terminate
                this.room.removeMob(this);
                return true;
            }
            if ( actorAhead.requestMove(this, dx, dy) ){
                this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
                return true;
            }
            else 
                return false;
        }
        //else actorAhead==null
        this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
        return true;
    }
    
}
