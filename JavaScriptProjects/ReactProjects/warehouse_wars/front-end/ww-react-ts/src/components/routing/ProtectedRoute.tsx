
import { Navigate, Outlet, /*useLocation*/ } from "react-router-dom";
import { ReactNode } from "react";



interface ProtectedRouteProps {
  canNavigate: () => boolean,
  redirect?: string, 
  route: string,
  children?: ReactNode
}



function ProtectedRoute({ canNavigate, route, redirect = '/', children}: ProtectedRouteProps) {
  //const location = useLocation();
  //console.log(location.pathname);
  //console.log(location.state);

  if (!canNavigate()){
    console.log(`navigating to ${redirect}`)
    return <Navigate to={redirect} replace />;
  } 
  else {
    console.log(`canNavigate to ${route}`)
    return children ? <>{children}</> : <Outlet />;
  }
}

export default ProtectedRoute