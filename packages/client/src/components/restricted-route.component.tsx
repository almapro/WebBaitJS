import React, { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { RootState } from "../redux";

export const RestrictedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedIn] = useSelector<RootState, [boolean]>(state => [state.app.loggedIn]);
  const location = useLocation();
  return loggedIn ? <>{children}</> : <Navigate to='/login' replace state={{ from: location.pathname }} />;
}
