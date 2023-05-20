package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public abstract class Misc extends Actor {

    /***
     * An actor which is neither a player nor a mob.
     * A Misc actor may have special properties
     * @param room the game room this Misc actor was spawned in
     * @param x the x position of this actor
     * @param y the y position of this actor
     */
    public Misc (GameRoom room, int x, int y){
        super(room,x,y);
    }


    /***
     * If this Misc actor can be destroyed by the requesting actor, 
     * then it will destroy itself through the game room.
     * @param actor the requesting actor who is trying to destroy this Misc actor
     * @return whether this actor was successfully destroyed
     */
    public abstract Boolean destroy (Actor actor);
}
