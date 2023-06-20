//import React from "react"
import { Direction, GameMovement } from "../../types/game/Room";


const onSrc = '/game/toggle-on.gif';
const onAlt = '⤟';

const offSrc = '/game/toggle-off.gif';
const offAlt = '⭲';



interface GameControlProps {
  specialAction: boolean,
  specialActionToggle: () => void,
  sendControl: (move: Direction) => void,
}

const GameControl = /*React.memo*/(({specialAction, specialActionToggle, sendControl}: GameControlProps) => {


  return (
    <div id="game_control_panel">
      {/* 🢀 🢂 🢁 🢃 🢄 🢅 🢆 🢇   pull: ⤟   push: ⭲ */}
      <table id="game_ctrl">
        <tbody>
          <tr>
            <td><img src='/game/blank.gif' alt=' '/></td> 
            <td><img id="ctrl_n" className="control_button" src="/game/n.gif" alt="🢁" onClick={() => sendControl(GameMovement.up)} /></td>
            <td><img src='/game/blank.gif' alt=' '/></td>
          </tr>
          <tr>
            <td><img id="ctrl_w" className="control_button" src="/game/w.gif" alt="🢀" onClick={() => sendControl(GameMovement.left)} /></td>
            <td>
              <img id="ctrl_shift" className="control_button" 
                src={specialAction ? onSrc : offSrc}
                alt={specialAction ? onAlt : offAlt} 
                onClick={specialActionToggle} />
            </td>
            <td><img id="ctrl_e" className="control_button" src="/game/e.gif" alt="🢂" onClick={() => sendControl(GameMovement.right)} /></td>
          </tr>
          <tr>
            <td><img src='/game/blank.gif' alt=' '/></td>
            <td><img id="ctrl_s" className="control_button" src="/game/s.gif" alt="🢃" onClick={() => sendControl(GameMovement.down)} /></td>
            <td><img src='/game/blank.gif' alt=' '/></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
});

export default GameControl