package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public class Bouncer extends Mob {
    public static final short MIN_DELAY = 1;
    public static final short MAX_DELAY = 6;

    private Boolean isBouncing = false;

    /***
     * The Bouncer is a Mob that moves in a direction then flips when it hits something
     * @param room the room this instance was spawned in
     * @param dx the x displacement value
     * @param dy the y displacement value
     */
    public Bouncer (GameRoom room, int x, int y, int dx, int dy, int delay){
        super(room, x, y, dx, dy, delay);
    }

    
    //Bouncer will take a step after a delay in the direction it is set to but will reverse direction on collision
    public void step (){
        if ( this.delayCount < this.delay ){
            this.incrementDelayCount();
            return;
        }

        short[] dir = this.getDirection();
        short[] pos = this.getPosition();
        Actor actorInDir = this.room.getActor(pos[0]+dir[0], pos[1]+dir[1]);
        if ( actorInDir == null ){ //move to empty space
            this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
            this.setDelayCount(0);
            this.isBouncing = false;
            return;
        }
        if ( actorInDir.requestMove(this, dir[0], dir[1]) ){ //request actor to move
            this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
            this.setDelayCount(0);
            this.isBouncing = false;
            return;
        }
        //else bounce to opposite direction
        this.flipDirection();
        this.setDelayCount(0);
        this.isBouncing = true;
        this.room.updateActorDirection(this);
    }
    
    //Bouncer cannot be terminated by any Actor (currently)
    public Boolean terminate (Actor actor){
        //if (ClassType.class.isInstance())
            //this.room.removeMob(this);
        return false;
    }

    //Terminated when surrounded by Misc actors
    public void checkCondition (){
        if ( !(this.isBouncing) || (this.getDelayCount() != 0) ) 
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

    
    //Bouncer is dangerous to Players
    public Boolean isDangerous() {
        return true;
    }

    
    //Bouncer cannot be pushed
    public Boolean isPushableBy(Actor actor) {
        return false;
    }

    
    //Bouncer cant be pulled
    public Boolean isPullableBy(Actor actor) {
        return false;
    }


    //Bouncer cant move any Actor
    public Boolean canPush(Actor actor) {
        return false;
    }

    
    //Bouncer is immovable
    public Boolean requestMove(Actor requestor, int dx, int dy) {
        return false;
    }
}
