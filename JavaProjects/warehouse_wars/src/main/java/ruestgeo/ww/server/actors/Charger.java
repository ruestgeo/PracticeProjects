package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public class Charger extends Mob {
    public static final short MIN_DELAY = 10; //should be > CHARGE_DELAY
    public static final short MAX_DELAY = 30;
    private static final short CHARGE_DELAY = 5;
    
    private Boolean charging;

    public Charger(GameRoom room, int x, int y, int dx, int dy, int delay) {
        super(room, x, y, dx, dy, delay);
        this.charging = false;
    }

    //Charger will randomly switch directions and will charge at the Player on sight after a delay
    public void step() {
        short[] pos = this.getPosition();
        short[] dir = this.getDirection();
        if ( !this.charging && Player.class.isInstance(this.room.getActorInDirection(pos[0], pos[1], dir[0], dir[1])) ){
            //System.out.println("pending charge");
            this.charging = true;
            this.setDelayCount( this.getDelay() - Charger.CHARGE_DELAY );
            return;
        }
        if ( this.delayCount < this.delay ){
            this.incrementDelayCount();
            return;
        }
        Actor actorInDir = this.room.getActor(pos[0]+dir[0], pos[1]+dir[1]);
        if ( this.charging ){ //if hit actor that is not player and not requestMove then stop charge
            if ( actorInDir == null ){ //move to empty space
                //System.out.println("charging!");
                this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
                return;
            }
            if ( actorInDir.requestMove(this, dir[0], dir[1]) ){ //request actor to move
                //System.out.println("hit something and moved it!");
                this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
                this.setDelayCount(0);
                this.newRandomDirection();
                this.charging = false;
                return;
            } 
            //else end charge
            //System.out.println("hit something and charge ended");
            this.setDelayCount(0);
            this.newRandomDirection();
            this.charging = false;
            this.room.updateActorDirection(this);
            return;
        }
        //else not charging
        if ( actorInDir == null ){ //move to empty space
            //System.out.println("wandering around to a new position");
            this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
            this.setDelayCount(0);
            this.newRandomDirection();
            return;
        }
        if ( actorInDir.requestMove(this, dir[0], dir[1]) ){ //request actor to move
            //System.out.println("pushed something");
            this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
            this.setDelayCount(0);
            this.newRandomDirection();
            return;
        }
        //System.out.println("cant move, switching direction");
        this.setDelayCount(0); 
        this.newRandomDirection();
        this.room.updateActorDirection(this);
    }

    //Charger cannot be terminated by another actor
    public Boolean terminate(Actor actor) {
        return false;
    }

    //Charger can be terminated by surrounding it with Boxes
    public void checkCondition() {
        if ( this.getDelayCount() != this.getDelay() )
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

    //Charger is dangerous to Players
    public Boolean isDangerous() {
        return true;
    }

    //Charger is not pushable
    public Boolean isPushableBy(Actor actor) {
        return false;
    }

    //Charger is not pullable
    public Boolean isPullableBy(Actor actor) {
        return false;
    }

    //Charger cannot push any actor
    public Boolean canPush(Actor actor) {
        return false;
    }

    //Charger will not move by request
    public Boolean requestMove(Actor requestor, int dx, int dy) {
        return false;
    }
    
}
