package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public abstract class Actor {
    final protected GameRoom room;
    protected short[] position;

    /***
     * An Actor is a game element on the grid which has specific functions 
     * as defined by the subclasses inheriting the Actor class.
     * @param room the GameRoom this Actor was spawned in
     * @param x the x position of the actor
     * @param y the y position of the actor
     */
    public Actor (GameRoom room, int x, int y){
        this.room = room;
        this.position = new short[2];
        this.position[0] = (short) x;
        this.position[1] = (short) y;
    }

    /***
     * @return the game room this Actor is located in
     */
    public GameRoom getRoom (){
        return this.room;
    }

    /***
     * @return the position of this Actor on the grid
     */
    public short[] getPosition (){
        return position;
    }

    /***
     * Set the Actors position to the given x and y coordinate
     * An Actor should not call this function itself, instead use room.setActorPosition
     * @param x
     * @param y
     */
    public void setPosition (int x, int y){
        this.position[0] = (short) x;
        this.position[1] = (short) y;
    }

    
    /***
     * @return whether the Actor is dangerous to a Player or not
     */
    abstract public Boolean isDangerous ();


    /***
     * Check whether an actor is able to push this Actor.
     * (DEPREC) this is mostly for defining the Actor; instead defining behaviour in step/move and requestMove
     * @param actor the actor instance who is pushing this Actor
     * @return
     */
    abstract public Boolean isPushableBy (Actor actor);


        /***
     * Check whether an actor is able to pull this Actor
     * (DEPREC) this is mostly for defining the Actor; instead defining behaviour in step/move and requestMove
     * @param actor the actor instance who is pulling this Actor
     * @return
     */
    abstract public Boolean isPullableBy (Actor actor);


    /***
     * Check whether this Actor can push a target actor
     * (DEPREC) this is mostly for defining the Actor; instead defining behaviour in step/move and requestMove
     * @param actor the actor to be pushed
     * @return
     */
    abstract public Boolean canPush (Actor actor);

    
    /***
     * Request this actor to move by checking the new position via the game room
     * and requesting movement if an actor is in that position or moving if it 
     * is empty space.
     * This is not to be called by the actor itself;  rather another actor will call this method
     * @param requestor the Actor who is requesting the move
     * @param dx the x direction of the movement
     * @param dy the y direction of the movement
     * @return true and set position if able to move, false if unable to move
     */
    abstract public Boolean requestMove (Actor requestor, int dx, int dy);
    
}
