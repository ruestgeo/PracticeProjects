import { Link } from 'react-router-dom'
import reactLogo from '../assets/react.svg'
import './ReactLogo.css'



const ReactLogo = () => {
  return (
    <div className='center'>
      <a href="https://react.dev" target="_blank" rel="noreferrer">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </a>
      <Link to={'/'} className='btn'>return</Link>
    </div>
  )
}

export default ReactLogo