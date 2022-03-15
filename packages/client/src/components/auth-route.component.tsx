import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../redux';

export const AuthRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [loggedIn] = useSelector<RootState, [boolean]>(state => [state.app.loggedIn]);
  const state = location.state as { from: string };
  if (loggedIn) {
    if (state && state.from !== "/logout") return <Navigate to={state.from} />
    else return <Navigate to='/' />;
  }
  else return <>{children}</>;
}
