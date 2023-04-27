package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public class Pusher extends Mob {
    public static final short MIN_DELAY = 5;
    public static final short MAX_DELAY = 20;
    

    public Pusher(GameRoom room, int x, int y, int dx, int dy, int delay) {
        super(room, x, y, dx, dy, delay);
        
    }

    //Pusher will move random directions
    public void step() {
        //System.out.println("delay: "+this.delay+"   count"+this.delayCount);
        if ( this.delayCount < this.delay ){
            this.incrementDelayCount();
            return;
        }
        short[] dir = this.getDirection();
        short[] pos = this.getPosition();
        Actor actorInDir = this.room.getActor(pos[0]+dir[0], pos[1]+dir[1]);
        //System.out.println("actorInDir "+(actorInDir==null? "null": actorInDir.getClass().getSimpleName()));
        if ( actorInDir == null ){ //move to empty space
            //System.out.println("free move to empty space");
            this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
            this.setDelayCount(0);
            this.newRandomDirection();
            return;
        }
        if ( actorInDir.requestMove(this, dir[0], dir[1]) ){ //request actor to move
            //System.out.println("request move: success");
            this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
            this.setDelayCount(0);
            this.newRandomDirection();
            return;
        }
        //System.out.println("request move: failed");
        this.setDelayCount(0); //couldn't move, so 'stunned'
        this.newRandomDirection();
        this.room.updateActorDirection(this);
    }

    //Pusher cannot be terminated by another actor
    public Boolean terminate(Actor actor) {
        return false;
    }

    //Pusher can be terminated by surrounding it by boxes
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

    //Pusher is dangerous to the player
    public Boolean isDangerous() {
        return false;
    }

    //Pusher is not pushable
    public Boolean isPushableBy(Actor actor) {
        return false;
    }

    //Pusher is not pullable
    public Boolean isPullableBy(Actor actor) {
        return false;
    }

    //Pusher can push Player, Box, and Wanderer actors
    public Boolean canPush(Actor actor) {
        return ( (Player.class.isInstance(actor)) || (Box.class.isInstance(actor)) || (Wanderer.class.isInstance(actor)) );
    }

    //Pusher will not move by request
    public Boolean requestMove(Actor requestor, int dx, int dy) {
        return false;
    }
    
}
