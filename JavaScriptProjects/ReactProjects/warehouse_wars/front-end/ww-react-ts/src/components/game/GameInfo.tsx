import React from "react";




const GameInfo = React.memo(() => {
  return (
    <div id="game_info_div">
        <h1>Warehouse Wars</h1>
        <table>
            <tbody>
                <tr>
                    <td>
                        <h2>Legend</h2>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table className="legend">
                            <tbody>
                                <tr>
                                    <th> Player </th>
                                    <td> &nbsp; </td>
                                    <td> 
                                        <table>
                                            <tr>
                                                <td><img src="/game/player1-n.gif" alt="1⮝"  id="playerN_image" /> </td>
                                                <td><img src="/game/player2-e.gif" alt="2⮞"  id="playerE_image" /> </td>
                                            </tr>
                                            <tr>
                                                <td><img src="/game/player3-w.gif" alt="3⮜"  id="playerW_image" /> </td>
                                                <td><img src="/game/player4-s.gif" alt="4⮟"  id="playerS_image" /> </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td> &nbsp; </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                    <th> Controls </th>
                                    <td> North </td>
                                    <td> <img src="/game/n.gif" alt="🢁" /> </td>
                                    <td> Move north, equivalent to pressing the 'W' key 
                                        <br /> On mobile you can move by touch and/or tilt if toggled on
                                    </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> East </td>
                                    <td> <img src="/game/e.gif" alt="🢂" /> </td>
                                    <td> Move east, equivalent to pressing the 'D' key 
                                        <br /> On mobile you can move by touch and/or tilt if toggled on
                                    </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> South </td>
                                    <td> <img src="/game/s.gif" alt="🢃" /> </td>
                                    <td> Move south, equivalent to pressing the 'S' key 
                                        <br /> On mobile you can move by touch and/or tilt if toggled on
                                    </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> West </td>
                                    <td> <img src="/game/w.gif" alt="🢀" /> </td>
                                    <td> Move west, equivalent to pressing the 'A' key 
                                        <br /> On mobile you can move by touch and/or tilt if toggled on
                                    </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Toggle Off </td>
                                    <td><img src="/game/toggle-off.gif" alt="⭲" /></td>
                                    <td> Default pushing </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Toggle On </td>
                                    <td><img src="/game/toggle-on.gif" alt="⤟" /></td>
                                    <td> Enable pulling, equivalent to holding down Shift 
                                        <br /> On mobile you can pull by touching the screen with two fingers
                                    </td>
                                </tr>
                                <tr>
                                    <td>&nbsp;</td>
                                </tr>
                                <tr>
                                    <th> Mobs </th>
                                    <td> &nbsp; </td>
                                    <td> &nbsp; </td>
                                    <td> Clear all mobs by surrounding them with boxes! (some exceptions)<br /> If you push an enemy, or an enemy pushes you, you're out! </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Generic </td>
                                    <td> <img src="/game/mob.gif" alt="\-/"  id="mob_image" /> </td>
                                    <td> moves in a direction then flips when it hits something </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Wanderer </td>
                                    <td> <img src="/game/wanderer.gif" alt="* *"  id="wanderer_image" /> </td>
                                    <td> roams around, but might chase the player if it gets close! </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Charger </td>
                                    <td> <img src="/game/charger.gif" alt="'-'"  id="charger_image" /> </td>
                                    <td> slowly roams around, but if a player gets in its sight then it charges forward! </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Crawler </td>
                                    <td> <img src="/game/crawler.gif" alt="<^>"  id="crawler_image" /> </td>
                                    <td> moves about in a clockwise direction, avoiding collision when it can </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Warper </td>
                                    <td> <img src="/game/warper.gif" alt="=-="  id="warper_image" /> </td>
                                    <td> teleports around the stage every so often, but doesnt move about otherwise </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Pusher </td>
                                    <td> <img src="/game/pusher.gif" alt="<->"  id="pusher_image" /> </td>
                                    <td> doesnt out the player, but can push around boxes as it roams around </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Mimic </td>
                                    <td> <img src="/game/mimic1.gif" alt="[``]"  id="mimic1_image" /> </td>
                                    <td> this tricky fellow looks like a box! It can be pushed around, but be warned! 
                                        <br /> Squish it between boxes and walls to rid of it 
                                        <br /> On mobile you can shake the device to temporarily reveal mimics
                                    </td>
                                </tr>
                                <tr>
                                    <td>&nbsp;</td>
                                </tr>
                                <tr>
                                    <th> Misc </th>
                                    <td> blank space </td>
                                    <td> <img src="/game/blank.gif" alt="---"  id="blank_image" /> </td>
                                    <td> simply empty space, nothing's there... </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Box </td>
                                    <td> <img src="/game/box1.gif" alt="[-]"  id="box1_image" /> <img src="/game/box2.gif" alt="[-]"  id="box2_image" /> <img src="/game/box3.gif" alt="[-]"  id="box3_image" /> </td>
                                    <td> a simple box. It can be pushed around and pulled. </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> Wall </td>
                                    <td> <img src="/game/wall.gif" alt="||||"  id="wall_image" /> </td>
                                    <td> a simple wall. It can't be pushed or pulled. </td>
                                </tr>
                                <tr>
                                    <th> &nbsp; </th>
                                    <td> HP </td>
                                    <td> <img src="/game/hp.gif" alt="O" id="hp+_image" /> <img src="/game/out.gif" alt="X" id="hp-_image" /> </td>
                                    <td> you'll be defeated if you run out of HP! </td>
                                </tr>
                                <tr>
                                    <td>&nbsp;</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  )
});

export default GameInfo