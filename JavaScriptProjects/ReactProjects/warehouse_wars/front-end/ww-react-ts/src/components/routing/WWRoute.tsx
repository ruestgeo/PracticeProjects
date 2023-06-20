
import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { RootState } from '../../redux/_store';

import ProtectedRoute from './ProtectedRoute'

import { canNavigateTo } from '../../utils/RouteGuard';



const routesRequiringLogin = [
  'lobby',
  'game',
];

function trim (route: string){
  return route.replace(/^\/+/g, '').trim();
}
function format (route: string){
  route = route.trim();
  return route.startsWith('/') ? route : `/${route}`
}


function WWRoute({route, children}: {route: string, children: ReactNode}) {

  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const from = location.state?.from ?? location.pathname;

  return (
    <ProtectedRoute 
      canNavigate={() => (routesRequiringLogin.includes(trim(route)) ? user !== null : true) 
        && canNavigateTo(from, route)}
      redirect={'/login'}
      route={format(trim(route))}
    > 
      <>{children}</>
    </ProtectedRoute>
  )
}

export default WWRoute