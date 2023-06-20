
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from '../../redux/_store'
import { deactivateSpinner } from '../../redux/SpinnerSlice';

import reactLogo from '../../assets/react.svg'

import './Spinner.css'



const DEBUG_DEACTIVATE_KEY = 'g';


function Spinner ({children, debug=false}: {debug?:boolean, children?: ReactNode}) {

  const spinnerActive = useSelector((state: RootState) => state.spinner.active);
  const spinnerMessage = useSelector((state: RootState) => state.spinner.message);
  const dispatch: AppDispatch = useDispatch();

  

  
  //function _handleKeyDown(e: KeyboardEvent) {
  //  if (e.key === DEBUG_DEACTIVATE_KEY){
  //    console.log(`spinned debug`);
  //    dispatch(deactivateSpinner());
  //  }
  //}
  //const handleKeyDown = useRef(_handleKeyDown);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === DEBUG_DEACTIVATE_KEY){
      console.log(`spinned debug`);
      dispatch(deactivateSpinner());
    }
  },[]);
  const listening = useRef(false);
  useEffect(() => {
    console.log(`spinner active: ${spinnerActive}`);
    if (debug){
      if (!listening.current && spinnerActive){
        console.log('added listener')
        //document.addEventListener('keydown', handleKeyDown.current);
        document.addEventListener('keydown', handleKeyDown);
        listening.current = true;
      }
      if (listening.current && !spinnerActive){
        console.log('removed listener')
        //document.removeEventListener('keydown', handleKeyDown.current);
        document.removeEventListener('keydown', handleKeyDown);
        listening.current = false;
      }
    }
  }, [spinnerActive]);



  return (
    <div>
      <div className={spinnerActive ? 'underlay' : ''}>
        {children}
      </div>

      {spinnerActive && (
        <div className="spinner-wrapper"
            style={{ pointerEvents: spinnerActive ? 'none' : 'auto' }}>
          <img src={reactLogo} className="spinner" alt="Processing..." />
          <br/>
          {(spinnerMessage !== '') && (<p className='spinner-message'>{spinnerMessage}</p>)}
        </div>
      )}
    </div>
  )
}



export default Spinner
