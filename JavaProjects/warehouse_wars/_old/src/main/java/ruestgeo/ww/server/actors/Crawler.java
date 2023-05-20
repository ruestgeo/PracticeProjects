package ruestgeo.ww.server.actors;


import java.util.Random;

import ruestgeo.ww.server.GameRoom;
//



public class Crawler extends Mob {
    public static final short MIN_DELAY = 1;
    public static final short MAX_DELAY = 6;


    private Boolean clockwise;
    private Boolean sticking = false;
    

    public Crawler(GameRoom room, int x, int y, int dx, int dy, int delay) {
        super(room, x, y, dx, dy, delay);
        if ( Math.abs(dx)+Math.abs(dy) > 1 ){ //if diagonal direction, default to east
            dx = 1;
            dy = 0;
            this.setDirection(dx, dy);
        }
        this.clockwise = new Random().nextBoolean();
    }

    //Crawler will stick to and move around any actor that is not the Player
    public void step() {
        if ( this.delayCount < this.delay ){
            this.incrementDelayCount();
            return;
        }
        short[] dir = this.getDirection();
        short[] pos = this.getPosition();
        if ( !(this.sticking) ){
            //System.out.println("Not sticking");
            Actor actorInDir = this.room.getActor(pos[0]+dir[0], pos[1]+dir[1]);
            //System.out.println("actorInDir  = "+ (actorInDir==null ? "null" : actorInDir.getClass().getSimpleName()));
            if ( actorInDir == null ){ //move to empty space
                this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
                this.setDelayCount(0);
                return;
            }
            if ( actorInDir.requestMove(this, dir[0], dir[1]) ){ //request actor to move
                this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
                this.setDelayCount(0);
                return;
            }
            //else stick to that 
            this.rotateDirection(this.clockwise);
            //System.out.println("now sticking ["+this.direction[0]+", "+this.direction[1]+"]");
            this.setDelayCount(0);
            this.sticking = true;
            this.room.updateActorDirection(this);
        }
        else { //sticking
            //System.out.println("Is sticking");
            Actor stickingActor = this.checkStickingActor();
            //System.out.println("Sticking actor ("+(this.clockwise ? "left" : "right")+") = "+ (stickingActor==null ? "null" : stickingActor.getClass().getSimpleName()));
            if ( stickingActor != null ){
                Actor actorAhead = this.getActorAhead();
                //System.out.println("actor ahead = "+ (actorAhead==null ? "null" : actorAhead.getClass().getSimpleName()));
                if ( actorAhead != null ){
                    this.rotateDirection( this.clockwise ); // 90d rotation
                    dir = this.getDirection();
                    actorAhead = this.getActorAhead();
                    //System.out.println("actor ("+(this.clockwise ? "right" : "left")+") = "+ (actorAhead==null ? "null" : actorAhead.getClass().getSimpleName()));
                    if ( actorAhead == null){ 
                        dir = this.getDirection();
                        this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]); //problem here?
                        this.setDelayCount(0);
                        return;
                    }
                    this.rotateDirection( this.clockwise ); // 180d rotation
                    actorAhead = this.getActorAhead();
                    //System.out.println("actor behind = "+ (actorAhead==null ? "null" : actorAhead.getClass().getSimpleName()));
                    if ( actorAhead == null){ 
                        dir = this.getDirection();
                        this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
                        this.setDelayCount(0);
                        return;
                    }
                    //this.rotateDirection( this.clockwise ); // 270d rotation (is an actor)
                    //this.rotateDirection( this.clockwise ); // 360d rotation
                    //System.out.println("is stuck");
                    this.flipDirection();
                    this.setDelayCount(this.delay*(-2)); //3x the delay
                }
                else { //move ahead
                    this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
                    this.setDelayCount(0);
                    return;
                }
            }
            else { //no sticking actor found, rotate in reverse and try to find diagonal ahead
                this.rotateDirection( !this.clockwise );
                stickingActor = this.checkStickingActorDiagonal();
                //System.out.println("stickingActor diagonal ("+(this.clockwise ? "back left" : "back right")+") = "+ (stickingActor==null ? "null" : stickingActor.getClass().getSimpleName()));
                if ( stickingActor != null ){ //move towards the sticking actor
                    //System.out.println("pulling self towards sticking actor");
                    dir = this.getDirection();
                    this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
                    this.setDelayCount(0);
                }
                else { //not sticking, so move in original direction
                    //System.out.println("isn't sticking anymore");
                    this.sticking = false;
                    this.rotateDirection( this.clockwise );
                    this.room.setActorPosition(this, pos[0]+dir[0], pos[1]+dir[1]);
                    this.setDelayCount(0);
                }
            }
        }
    }

    //Crawler cannot be terminated by another actor
    public Boolean terminate(Actor actor) {
        return false;
    }

    //Crawler can be terminated by surrounding it with Boxes
    public void checkCondition() {
        if ( this.delayCount != this.delay )
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

    //Crawler is dangerous to Player
    public Boolean isDangerous() {
        return true;
    }

    //Crawler is not pushable
    public Boolean isPushableBy(Actor actor) {
        return false;
    }

    //Crawler is not pullable
    public Boolean isPullableBy(Actor actor) {
        return false;
    }

    //Crawler cannot push any actors
    public Boolean canPush(Actor actor) {
        return false;
    }

    //Crawler will not move by request
    public Boolean requestMove(Actor requestor, int dx, int dy) {
        return false;
    }
    

    /***
     * Obtain the actor to the left of this Crawler if clockwise, or right otherwise
     * @return the actor this Crawler is sticking to
     */
    private Actor checkStickingActor (){
        short[] pos = this.getPosition();
        short[] dir = this.getDirection();
        if ( dir[0]==0 && dir[1]==-1 ){ //n
            if ( this.clockwise )
                return this.room.getActor(pos[0]-1, pos[1]); //w
            else
                return this.room.getActor(pos[0]+1, pos[1]); //e
        }
        if ( dir[0]==1 && dir[1]==0 ){ //e
            if ( this.clockwise )
                return this.room.getActor(pos[0], pos[1]-1); //n
            else
                return this.room.getActor(pos[0], pos[1]+1); //s
        }
        if ( dir[0]==0 && dir[1]==1 ){ //s
            if ( this.clockwise )
                return this.room.getActor(pos[0]+1, pos[1]); //e
            else
                return this.room.getActor(pos[0]-1, pos[1]); //w
        }
        if ( dir[0]==-1 && dir[1]==0 ){ //w
            if ( this.clockwise )
                return this.room.getActor(pos[0], pos[1]+1); //s
            else
                return this.room.getActor(pos[0], pos[1]-1); //n
        }
        else { //set dir to east and return that actor (shouldn't happen)
            //System.out.println("An error!");
            this.setDirection(1, 0);
            if ( this.clockwise )
                return this.room.getActor(pos[0], pos[1]-1); //n
            else
                return this.room.getActor(pos[0], pos[1]+1); //s
        }
    }


    /***
     * Obtain the actor to the front left of this Crawler if clockwise, or front right otherwise
     * @return the actor this Crawler is sticking to
     */
    private Actor checkStickingActorDiagonal (){
        short[] pos = this.getPosition();
        short[] dir = this.getDirection();
        if ( dir[0]==0 && dir[1]==-1 ){ //n
            if ( this.clockwise )
                return this.room.getActor(pos[0]-1, pos[1]-1); //nw
            else
                return this.room.getActor(pos[0]+1, pos[1]-1); //ne
        }
        if ( dir[0]==1 && dir[1]==0 ){ //e
            if ( this.clockwise )
                return this.room.getActor(pos[0]+1, pos[1]-1); //ne
            else
                return this.room.getActor(pos[0]+1, pos[1]+1); //se
        }
        if ( dir[0]==0 && dir[1]==1 ){ //s
            if ( this.clockwise )
                return this.room.getActor(pos[0]+1, pos[1]+1); //se
            else
                return this.room.getActor(pos[0]-1, pos[1]+1); //sw
        }
        if ( dir[0]==-1 && dir[1]==0 ){ //w
            if ( this.clockwise )
                return this.room.getActor(pos[0]-1, pos[1]+1); //sw
            else
                return this.room.getActor(pos[0]-1, pos[1]-1); //nw
        }
        else { //set dir to east and return that actor (shouldn't happen)
            //System.out.println("An error!");
            this.setDirection(1, 0);
            if ( this.clockwise )
                return this.room.getActor(pos[0]+1, pos[1]-1); //ne
            else
                return this.room.getActor(pos[0]+1, pos[1]+1); //se
        }
    }


    /***
     * Rotate the direction of this Crawler clockwise or counter-clockwise
     * @param cw whether to rotate clockwise or opposite (ccw)
     */
    private void rotateDirection (Boolean cw){
        short[] dir = this.getDirection();
        //System.out.println("old dir ["+dir[0]+", "+dir[1]+"]");
        if (cw){
            if ( dir[0]==0 && dir[1]==-1 ){ //n : e
                this.setDirection(1, 0);
            }
            else if ( dir[0]==1 && dir[1]==0 ){ //e : s
                this.setDirection(0, 1);
            }
            else if ( dir[0]==0 && dir[1]==1 ){ //s : w
                this.setDirection(-1, 0);
            }
            else if ( dir[0]==-1 && dir[1]==0 ){ //w :n
                this.setDirection(0, -1);
            }
        }
        else { 
            if ( dir[0]==0 && dir[1]==-1 ){ //n : w
                this.setDirection(-1, 0);
            }
            else if ( dir[0]==-1 && dir[1]==0 ){ //w :s
                this.setDirection(0, 1);
            }
            else if ( dir[0]==0 && dir[1]==1 ){ //s : e
                this.setDirection(1, 0);
            }
            else if ( dir[0]==1 && dir[1]==0 ){ //e : n
                this.setDirection(0, -1);
            }
        }
        //short[] ndir = this.getDirection();
        //System.out.println("new dir ["+ndir[0]+", "+ndir[1]+"]");
    }

}
