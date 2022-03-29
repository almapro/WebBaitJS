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
} from '@mui/icons-material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';

export const MyAppBar: FC = () => {
  const location = useLocation();
  if (location.pathname === '/login') return null;
  const { t, i18n } = useTranslation();
  const [showDrawer, setShowDrawer] = useState(false);
  const { mode, setMode } = useAppContext();
  const navigate = useNavigate();
  const navs: { [key: string]: [string, string, JSX.Element] } = {
    '/': [t('titles.dashboard'), t('descriptions.dashboard'), <DashboardIcon />],
  };
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
            {navs[location.pathname][0]}
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
                selected={key === location.pathname}
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
