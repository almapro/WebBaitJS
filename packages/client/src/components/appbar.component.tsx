import React from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LightModeOutlined as LightModeOutlinedIcon,
  DarkModeOutlined as DarkModeOutlinedIcon,
  Translate as TranslateIcon,
  Dashboard as DashboardIcon,
  Webhook as WebhookIcon,
} from '@mui/icons-material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import _ from "lodash";

export const MyAppBar: FC = () => {
  const { t, i18n } = useTranslation();
  const [showDrawer, setShowDrawer] = useState(false);
  const { mode, setMode } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/login') return null;
  const navs: { [key: string]: [string, string, JSX.Element] } = {
    '/': [t('titles.dashboard'), t('descriptions.dashboard'), <DashboardIcon />],
    '/agents': [t('titles.agents'), t('descriptions.agents'), <WebhookIcon />],
    '/test-agent': [t('titles.test_agent'), t('descriptions.test_agent'), <WebhookIcon />],
  };
  let currentTitle = '';
  let foundNavPath: string | undefined = '';
  const currentNav = navs[location.pathname];
  if (currentNav) currentTitle = currentNav[0];
  else {
    foundNavPath = _.keys(navs).find(nav => {
      if (nav === '/') return;
      if (location.pathname.includes(nav)) {
        return nav;
      }
    });
    if (foundNavPath) currentTitle = navs[foundNavPath][0];
  }
  return (
    <>
      <AppBar position="static" enableColorOnDark>
        <Toolbar>
          <Tooltip title={t('showSidebar') as string}>
            <IconButton
              onClick={() => setShowDrawer(true)}
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {currentTitle}
          </Typography>
          <Tooltip title={t('changeLanguage') as string}>
            <IconButton
              color="inherit"
              size="large"
              onClick={() =>
                i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')
              }
            >
              <TranslateIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('changeMode') as string}>
            <IconButton
              color="inherit"
              size="large"
              onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            >
              {mode === 'light' ? (
                <DarkModeOutlinedIcon />
              ) : (
                <LightModeOutlinedIcon />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
      >
        <Box
          role="presentation"
          sx={{ width: 350 }}
          onClick={() => setShowDrawer(false)}
        >
          <List>
            {Object.keys(navs).map((key) => (
              <ListItem
                key={key}
                button
                selected={key === foundNavPath || key === location.pathname}
                onClick={() => navigate(key)}
              >
                <ListItemIcon>{navs[key][2]}</ListItemIcon>
                <ListItemText primary={navs[key][0]} secondary={navs[key][1]} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
