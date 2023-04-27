package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public class Wall extends Misc {
    /***
     * A Wall is an immovable and indestructible actor
     * @param room the GameRoom this Wall was spawned in
     * @param x position
     * @param y position
     */
    public Wall (GameRoom room, int x, int y){
        super(room,x,y);
    }


    //Wall is not dangerous to Player
    public Boolean isDangerous() {
        return false;
    }

    //Wall cannot be pushed
    public Boolean isPushableBy(Actor actor) {
        return false;
    }

    //Wall cannot be pulled
    public Boolean isPullableBy(Actor actor) {
        return false;
    }

    //Wall cannot push
    public Boolean canPush(Actor actor) {
        return false;
    }

    //Wall cannot move
    public Boolean requestMove (Actor requestor, int dx, int dy) {
        return false;
    }

    //Wall cannot be destroyed
    public Boolean destroy(Actor actor) {
        return false;
    }    
}
