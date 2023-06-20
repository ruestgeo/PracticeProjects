import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { AppDispatch } from './redux/_store';
import { activateSpinner } from './redux/SpinnerSlice';

import AppState from './components/AppState';
import Spinner from "./components/spinner/Spinner"
import Login from './components/game/Login';
import Lobby from './components/game/Lobby';
import Game from './components/game/Game';
import Chat from './components/chat/Chat';
import WWRoute from './components/routing/WWRoute';
import GameWebSocket from './components/game/GameWebSocket';
import ChatWebSocket from './components/chat/ChatWebSocket';







function App () {

  const dispatch: AppDispatch = useDispatch();
  console.log(`reloaded App`)

  return (
    <>
      <Spinner debug={true} >
        {"hello world"}
        <br/><button onClick={() => dispatch(activateSpinner('press G to disable'))}>activate spinner</button>
        {/* <Link to={'/login'} state={{from: location.pathname}}>login</Link>--
        <Link to={'/lobby'} state={{from: location.pathname}}>lobby</Link>--
        <Link to={'/game'} state={{from: location.pathname}}>game</Link> */}
        <hr />


        <AppState />
        <br/>
        {/*   init shared websocket for game & chat   */}
        <GameWebSocket />
        <ChatWebSocket />


        {/*   routing and protected route   */}
        <Routes>
          <Route path='/login' element={
            <WWRoute route={'login'}> 
              <Login route={'login'} /> 
            </WWRoute>
          } />

          <Route path='/lobby' element={
            <WWRoute route={'lobby'}> 
              <Lobby route={'lobby'} /> 
            </WWRoute>
          } />

          <Route path='/game'  element={
            <WWRoute route={'game'}> 
              <Game  route={'game'} /> 
            </WWRoute>
          } />

          <Route path='*' element={<Navigate to='/login' />} />
        </Routes>


        {/*   dedicated chat & misc components   */}
        <Chat />

      </Spinner>
    </>
  )
}



export default App
