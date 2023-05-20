package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public abstract class Mob extends Actor {
    protected short[] direction;
    protected int delay;
    protected int delayCount;


    /***
     * A Mob is an enemy Actor in the GameRoom to be defeated to win the game
     * @param room the GameRoom where this Mob instance is spawned in
     * @param dx the x direction this Mob is moving in when spawned
     * @param dy the y direction this Mob is moving in when spawned
     * @param delay the delay interval for this Mob;  this value is usually used to delay movement
     */
    public Mob (GameRoom room, int x, int y, int dx, int dy, int delay){
        super(room,x,y);

        this.direction = new short[2];
        this.direction[0] = (short) dx;
        this.direction[1] = (short) dy;
        this.delay = (short) delay;
        this.delayCount = 0;
    }


    /***
     * @param val Set the delay frame of this Mob to val
     */
    public void setDelayCount (int val){
        this.delayCount = val;
    }



    /***
     * Increment delay count
     */
    public void incrementDelayCount (){
        this.delayCount++;
    }



    /***
     * @return the current delay frame of this Mob
     */
    public int getDelayCount (){
        return this.delayCount;
    }


    /***
     * @return the delay interval of this Mob
     */
    public int getDelay (){
        return this.delay;
    }


    /***
     * Set the direction the Mob is moving in
     * @param dx the x direction
     * @param dy the y direction
     */
    protected void setDirection (int dx, int dy){
        this.direction[0] = (short) dx;
        this.direction[1] = (short) dy;
    }


    /***
     * Set the direction of this Mob randomly
     */
    protected void newRandomDirection (){
        int dir = (int) (Math.random() * 8);
        switch (dir){
            case 0: //n
                this.setDirection(-1, 0);
                return;
            case 1: //ne
                this.setDirection(-1, 1);
                return;
            case 2: //e
                this.setDirection(0, 1);
                return;
            case 3: //se
                this.setDirection(1, 1);
                return;
            case 4: //s
                this.setDirection(1, 0);
                return;
            case 5: //sw
                this.setDirection(1, -1);
                return;
            case 6: //w
                this.setDirection(0, -1);
                return;
            case 7: //nw
                this.setDirection(-1, -1);
                return;
            default: //maintain
                return;
        }
    }


    /***
     * Flip the direction of this Mob to the opposite direction
     */
    protected void flipDirection (){
        this.setDirection(this.direction[0]*(-1), this.direction[1]*(-1));
    }


    /***
     * @return the direction short[{x,y}] the Mob is moving in
     */
    public short[] getDirection () {
        return this.direction;
    }


    /***
     * Obtain a random relay between and including min and max.
     * Both should be above 0 and min is less than max
     * @param min  int > 0 and < max
     * @param max  int > 0 and > min
     * @return a random delay between min and max
     */
    public static short getRandomDelay (int min, int max){
        return (short) ((Math.random() * (max+1 - min)) + min);
    }

    /***
     * Obtain the actor who is ahead on the grid in the direction of the Mob based on its current position
     * @return the Actor or null
     */
    protected Actor getActorAhead (){
        short[] pos = this.getPosition();
        short[] dir = this.getDirection();
        return this.room.getActor(pos[0]+dir[0], pos[1]+dir[1]);
    }


    /***
     * The Mob will take a step in the game interval
     */
    abstract public void step ();


    /***
     * Terminate this Mob by asking the game room to remove it.
     * @param actor the actor requesting to terminate this Mob
     * @return whether the Mob was successfully terminated
     */
    abstract public Boolean terminate (Actor actor);


    /***
     * Check whether the Mob is in a condition that will result in a death
     * if so then it will terminate itself by asking the room for removal.
     * This is called separately and before the step function by the GameRoom.
     */
    abstract public void checkCondition ();
}
