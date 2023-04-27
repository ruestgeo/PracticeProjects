package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public class Wanderer extends Mob {
    public static final short MIN_DELAY = 4;
    public static final short MAX_DELAY = 12;
    
    private Boolean hunting = false;

    public Wanderer(GameRoom room, int x, int y, int dx, int dy, int delay) {
        super(room, x, y, dx, dy, delay);
    }


    //Wanderer will move in random directions and chase the player if close
    public void step() {
        if ( !(this.hunting) && (this.delayCount % 3 == 0) ){
            short[] pos = this.getPosition();
            Player p = this.room.getPlayerNearby(pos[0], pos[1]);
            //System.out.println("player nearby = "+(p==null ? "null" : p.getName()) );
            if ( p != null ){
                short[] playerPos = p.getPosition();
                int[] newDir = new int[]{playerPos[0]-pos[0], playerPos[1]-pos[1]};
                //System.out.println("now hunting in dir ["+newDir[0]+", "+newDir[1]+"]");
                if ( (this.delay/2) > this.delayCount )
                    this.setDelayCount((int) this.delay/2);
                this.hunting = true;
                this.setDirection(newDir[0], newDir[1]);
            }
        }
        if ( this.delayCount < this.delay ){
            this.incrementDelayCount();
            return;
        }
        short[] dir = this.getDirection();
        short[] pos = this.getPosition();
        //System.out.println("pos ["+pos[0]+", "+pos[1]+"]\ndir ["+dir[0]+", "+dir[1]+"]");
        Actor actorInDir = this.room.getActor(pos[0]+dir[0], pos[1]+dir[1]);
        //System.out.println("actorInDir = "+(actorInDir==null ? "null" : actorInDir.getClass().getSimpleName()) );
        if ( actorInDir == null ){ //move to empty space
            //System.out.println("moving to empty space");
            this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
            this.setDelayCount(0);
            this.newRandomDirection();
            this.hunting = false;
            return;
        }
        if ( actorInDir.requestMove(this, dir[0], dir[1]) ){ //request actor to move
            //System.out.println("request to move: success");
            this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
            this.setDelayCount(0);
            this.newRandomDirection();
            this.hunting = false;
            return;
        }
        //System.out.println("couldn't move");
        this.setDelayCount(0);
        this.newRandomDirection();
        this.room.updateActorDirection(this);
        this.hunting = false;
    }

    //Wanderer cannot be terminated by another actor
    public Boolean terminate(Actor actor) {
        return false;
    }

    //Wanderer can be terminated by surrounding it by boxes
    public void checkCondition() {
        if ( (this.getDelayCount() != this.getDelay()) ) // only check if stunned and before move frame
            return;
        short[] pos = this.getPosition();
        if ( !Misc.class.isInstance(this.room.getActor(pos[0], pos[1]-1)) )//n
            return;
        if ( !Misc.class.isInstance(this.room.getActor(pos[0]+1, pos[1]-1)) )//ne
            return;
        if ( !Misc.class.isInstance(this.room.getActor(pos[0]+1, pos[1])) )//e
            return;
        if ( !Misc.class.isInstance(this.room.getActor(pos[0]+1, pos[1]+1)) )//se
            return;
        if ( !Misc.class.isInstance(this.room.getActor(pos[0], pos[1]+1)) )//s
            return;
        if ( !Misc.class.isInstance(this.room.getActor(pos[0]-1, pos[1]+1)) )//sw
            return;
        if ( !Misc.class.isInstance(this.room.getActor(pos[0]-1, pos[1])) )//w
            return;
        if ( !Misc.class.isInstance(this.room.getActor(pos[0]-1, pos[1]-1)) )//nw
            return;
        //else terminate
        this.room.removeMob(this);
    }

    //Wanderer is dangerous to the player
    public Boolean isDangerous() {
        return true;
    }

    //Wanderer pusable by Pusher actors
    public Boolean isPushableBy(Actor actor) {
        return (Pusher.class.isInstance(actor)) ;
    }

    //Wanderer is not pullable
    public Boolean isPullableBy(Actor actor) {
        return false;
    }

    //Wanderer cannot push other actors
    public Boolean canPush(Actor actor) {
        return false;
    }

    //Wanderer will move by a Pusher
    public Boolean requestMove(Actor requestor, int dx, int dy) {
        if ( !(Pusher.class.isInstance(requestor)) )
            return false;
        short[] pos = this.getPosition();
        Actor actor = this.room.getActor(pos[0]+dx, pos[1]+dy);
        if ( actor != null){
            if ( actor.requestMove(this, dx, dy) ){
                this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
                return true;
            }
            else 
                return false;
        }
        //else actor==null
        this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
        return true;
    }
    
}
