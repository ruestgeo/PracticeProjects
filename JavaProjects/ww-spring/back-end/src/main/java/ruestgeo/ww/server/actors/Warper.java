package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public class Warper extends Mob {
    public static final short MIN_DELAY = 80;
    public static final short MAX_DELAY = 120;
    

    public Warper(GameRoom room, int x, int y, int delay) {
        super(room, x, y, 0, 0, delay);
    }

    //Warper will relocate to a random location on the grid after some delay
    public void step() {
        if ( this.delayCount < this.delay ){
            this.incrementDelayCount();
            return;
        }
        this.room.relocateActor(this);
        this.setDelayCount(0);
    }

    //Warper cannot be terminated by any actor
    public Boolean terminate(Actor actor) {
        return false;
    }

    //Warper can be terminated by surrounding it by boxes
    public void checkCondition() {
        if ( this.delayCount != this.delay ) //only check before warp frame
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

    //Warper is dangerous to the player
    public Boolean isDangerous() {
        return true;
    }

    //Warper is not pushable
    public Boolean isPushableBy(Actor actor) {
        return false;
    }

    //Warper is not pullable
    public Boolean isPullableBy(Actor actor) {
        return false;
    }

    //Warper cannot push any actor
    public Boolean canPush(Actor actor) {
        return false;
    }

    //Warper will not move by request
    public Boolean requestMove(Actor requestor, int dx, int dy) {
        return false;
    }
    
}
