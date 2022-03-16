import { Alert, AlertTitle, Collapse, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, useTheme, CircularProgress, Button } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useAppContext } from "../App";
import { ThemeModeSwitch } from "../components";
import { LOGIN_ACTION, RootState } from "../redux";
import {
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTitle } from "react-use";

export const LoginView = () => {
  const [username, setLocalUsername] = useState('');
  const [password, setLocalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const { mode, setMode } = useAppContext();
  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light');
  const dispatch = useDispatch();
  const [actionError, actionErrorMessage, submitting] = useSelector<RootState, [boolean, string, boolean]>((state) => [state.app.actionError, state.app.actionErrorMessage, state.app.submitting]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(LOGIN_ACTION({ username, password }));
  }
  const { t } = useTranslation();
  useTitle(`WebBait - ${t('titles.login')}`);
  return (
    <Grid
      container
      spacing={2}
      direction='column'
      alignItems='center'
      justifyContent='center'
      p={2}
      style={{ minHeight: '100vh' }}>
      <Grid item xs={12}>
        <Paper style={{ padding: theme.spacing(3), maxWidth: 700 }} elevation={3}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid container item xs={12} alignItems='center' direction='column' justifyContent='center'>
                <ThemeModeSwitch onClick={toggleMode} checked={mode === 'dark'} />
              </Grid>
              <Grid item xs={12}>
                <Collapse in={actionError}>
                  <Alert severity="error">
                    <AlertTitle>{t('actions.login.errors.title')}</AlertTitle>
                    {t(actionErrorMessage)}
                  </Alert>
                </Collapse>
              </Grid>
              <Grid container item xs={12} spacing={3}>
                <Grid item xs={12}>
                  <FormControl required fullWidth variant="outlined">
                    <InputLabel htmlFor="username">{t('inputs.username')}</InputLabel>
                    <OutlinedInput
                      inputProps={{ color: 'inherit' }}
                      value={username}
                      id="username"
                      label={t('inputs.username')}
                      onChange={e => setLocalUsername(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl required fullWidth variant="outlined">
                    <InputLabel htmlFor="password">{t('inputs.password')}</InputLabel>
                    <OutlinedInput
                      inputProps={{ color: 'inherit' }}
                      value={password}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      onChange={e => setLocalPassword(e.target.value)}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label={t('inputs.password')}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Button disabled={submitting} fullWidth type='submit' variant='contained'>{submitting ? <CircularProgress /> : t('actions.login.login')}</Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};
