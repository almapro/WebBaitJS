import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { i18n } from './locales';
import { RTL } from './rtl';
import { AuthRoute, MyAppBar, RestrictedRoute } from './components';
import { AgentsView, AgentView, AgentWebRtcView, DashboardView, LoginView, TestAgentView } from "./views";
import { useDispatch } from 'react-redux';
import { CHECK_LOGGED_ACTION } from './redux';
import { SnackbarProvider } from "notistack";

export type AppContextType = {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  language: 'en' | 'ar';
  setLanguage: (language: 'en' | 'ar') => void;
}

export const AppContext = React.createContext<AppContextType>({
  mode: 'light',
  setMode: () => { },
  language: 'ar',
  setLanguage: () => { },
});

export const useAppContext = () => React.useContext(AppContext);

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState(i18n.language as 'en' | 'ar');
  useEffect(() => {
    const storedMode = localStorage.getItem('mode');
    if (storedMode) {
      setMode(storedMode as 'light' | 'dark');
    }
  }, []);
  const createThemeCallback = () => createTheme({
    direction: language === 'en' ? 'ltr' : 'rtl',
    palette: {
      mode,
      primary: {
        main: '#8D00CC',
      },
      secondary: {
        main: '#58007F',
      },
    },
  });
  const [theme, setTheme] = useState(createThemeCallback());
  i18n.on('languageChanged', setLanguage);
  useEffect(() => {
    localStorage.setItem('mode', mode);
    document.body.style.direction = language === 'ar' ? 'rtl' : 'ltr';
    setTheme(createThemeCallback());
  }, [language, mode]);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(CHECK_LOGGED_ACTION());
  }, [dispatch]);
  return (
    <AppContext.Provider value={{ mode, setMode, language, setLanguage }}>
      <RTL>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <Router>
              <MyAppBar />
              <Routes>
                <Route path='/' element={
                  <RestrictedRoute><DashboardView /></RestrictedRoute>
                } />
                <Route path='/agents' element={
                  <RestrictedRoute><AgentsView /></RestrictedRoute>
                } />
                <Route path='/agents/:agentId' element={
                  <RestrictedRoute><AgentView /></RestrictedRoute>
                } />
                <Route path='/agents/:agentId/webrtc' element={
                  <RestrictedRoute><AgentWebRtcView /></RestrictedRoute>
                } />
                <Route path='/test-agent' element={
                  <RestrictedRoute><TestAgentView /></RestrictedRoute>
                } />
                <Route path='/login' element={
                  <AuthRoute><LoginView /></AuthRoute>
                } />
              </Routes>
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </RTL>
    </AppContext.Provider>
  );
}

export default App;
