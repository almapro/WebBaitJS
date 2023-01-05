import { createTheme, ThemeProvider, AppBar, Toolbar, Typography, Stack, Tooltip, IconButton, Avatar, Grid, useMediaQuery } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useFavicon, useTitle } from "react-use";
import { GoogleMeetWordmark } from "../images";
import { AgentTemplateProps } from "../types";
import './meet.template.css';
import moment from 'moment';
import {
  HelpOutline as HelpOutlineIcon,
  FeedbackOutlined as FeedbackOutlinedIcon,
  SettingsOutlined as SettingsIcon,
  Apps as AppsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export const MeetTemplate: FC<AgentTemplateProps> = ({ title }) => {
  useTitle(title || document.title || "Google Meet");
  useFavicon('https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-24dp/logo_meet_2020q4_color_1x_web_24dp.png');
  const theme = createTheme({
    typography: {
      allVariants: {
        color: '#5f6368'
      }
    },
    mixins: {
      toolbar: {
        minHeight: 48
      }
    }
  });
  const [timeDateFormatted, setTimeDateFormatted] = useState(moment().format('h:mm A • ddd, MMM DD'));
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeDateFormatted(moment().format('h:mm A • ddd, MMM DD'));
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, []);
  const [showJoin, setShowJoin] = useState(false);
  const bigScreen = useMediaQuery(theme.breakpoints.up('md'));
  return <ThemeProvider theme={theme}>
    <AppBar position='static' sx={{ bgcolor: 'transparent', boxShadow: 0 }}>
      <Toolbar sx={{ p: 0.8, px: '16px !important' }}>
        <img src={GoogleMeetWordmark} width='110' height='35' alt="Google Meet" />
        <Typography sx={{ fontFamily: '"Product Sans",Arial,sans-serif', color: '#5f6368', pl: '4px', fontSize: '22px' }}>Meet</Typography>
        <Stack spacing={1} sx={{ marginLeft: "auto" }} direction='row'>
          <Typography sx={{ my: 'auto' }}>{timeDateFormatted}</Typography>
          <Tooltip title='Support'>
            <IconButton><HelpOutlineIcon /></IconButton>
          </Tooltip>
          <Tooltip title='Feedback'>
            <IconButton><FeedbackOutlinedIcon /></IconButton>
          </Tooltip>
          <Tooltip title='Settings'>
            <IconButton><SettingsIcon /></IconButton>
          </Tooltip>
          <Tooltip title='Google Apps' sx={{ ml: `${theme.spacing(3)} !important` }}>
            <IconButton><AppsIcon /></IconButton>
          </Tooltip>
          <Tooltip title='Google Account'>
            <Avatar sx={{ width: 32, height: 32, my: 'auto !important' }}><PersonIcon /></Avatar>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
    <Grid container justifyContent='space-evenly' sx={{ height: 'calc(100vh - 4rem)', width: '100vw', display: 'inline-flex' }} alignItems='center' direction='row'>
      <Grid item sx={{ maxWdith: '35rem', flexBasis: '35rem', my: 'auto !important' }}>
        <Typography
          sx={{
            fontFamily: '"Google Sans Display",Roboto,Arial,sans-serif',
            fontWeight: 400,
            fontSize: 44,
            letterSpacing: 'normal',
            lineHeight: '52px',
            color: 'rgba(0,0,0,.87)',
            textAlign: bigScreen ? 'left': 'center',
        }}>Premium video meetings. Now free for everyone.</Typography>
        <Typography>We re-engineered the service we built for secure business meetings, Google Meet, to make it free and available for all.</Typography>
      </Grid>
      <Grid item xs={6}>
        Here
      </Grid>
    </Grid>
  </ThemeProvider>;
}
