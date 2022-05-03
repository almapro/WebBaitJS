import { useTranslation } from "react-i18next";
import React, { FC, useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Menu, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { connectClientWebsocket, clientWebsocketService, WebRtcWebsocket, websocketManager, WebRtcSubjects } from "../services";
import { useTitle } from "react-use";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import _ from "lodash";
import {
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Subject } from "rxjs";
import { Device } from 'mediasoup-client';
import { useSnackbar } from "notistack";

export type AgentCmdOption = {
  label: string;
  action: () => void;
  enabled?: boolean | (() => boolean)
}

export const RowOptionsCell: FC<{
  params: GridRenderCellParams<boolean>,
  clickedOnViewSubject: Subject<boolean>,
  deleteCmd: (cmdId: string) => void,
  getCmd: (cmdId: string) => { cmd: string, cmdId: string, options: boolean, data?: any } | undefined,
}> = ({ params, clickedOnViewSubject, deleteCmd, getCmd }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const [openSendResult, setOpenSendResult] = useState(false);
  const [resultValue, setResultValue] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const subscription = clickedOnViewSubject.subscribe({
      next: () => {
        if (openMenu) setOpenMenu(false);
      }
    });
    return () => {
      subscription.unsubscribe();
    }
  }, [clickedOnViewSubject, openMenu, setOpenMenu]);
  const cmd = getCmd(params.id.toString());
  const options: AgentCmdOption[] = [
    {
      label: t('titles.acknowledge_command'),
      action: () => {
        if (clientWebsocketService) clientWebsocketService.emit('cmd received', { cmdId: params.id });
      }
    },
    {
      label: t('titles.send_result'),
      action: () => {
        setOpenSendResult(true);
      }
    },
  ];
  const [webRtcConnected, setWebRtcConnected] = useState(false);
  const [webRtcWebsocket, setWebRtcWebsocket] = useState<WebRtcWebsocket | undefined>(undefined);
  const [subject] = useState(new Subject<WebRtcSubjects>());
  useEffect(() => {
    const subscription = subject.subscribe({
      next: async subject => {
        if (!webRtcWebsocket) return;
        switch (subject.type) {
          case 'disconnected':
            setWebRtcConnected(false);
            break;
          case 'connected':
            setWebRtcConnected(true);
            break;
          default:
            break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    }
  }, [webRtcWebsocket]);
  if (cmd) {
    switch (cmd.cmd) {
      case 'init-webrtc-device':
        options.push({
          label: t('titles.init_webrtc_device'),
          enabled: !webRtcConnected,
          action: async () => {
            if (cmd.data) {
              if (webRtcWebsocket) {
                webRtcWebsocket.connect();
                return;
              }
              const { token } = cmd.data as { token: string };
              const socket = websocketManager.socket('/webrtc', {
                auth: {
                  token,
                }
              });
              const device = new Device();
              setWebRtcWebsocket(new WebRtcWebsocket(socket, device, subject));
            } else {
              enqueueSnackbar('No token was sent with the command', { variant: 'error' })
            }
          }
        });
        options.push({
          label: t('titles.close_webrtc_device'),
          enabled: webRtcConnected,
          action: () => {
            if (webRtcWebsocket) webRtcWebsocket.close();
          }
        });
        break;
      default:
        break;
    }
  }
  const handleSendResultClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (clientWebsocketService) clientWebsocketService.emit('result', { cmdId: params.id, result: resultValue, agentId: localStorage.getItem('WEBBAIT_CLIENT_AGENT_ID') });
    setOpenSendResult(false);
    setResultValue('');
    deleteCmd(params.id.toString());
  }
  return (
    <>
      <IconButton ref={btnRef} disabled={!params.value} onClick={() => setOpenMenu(true)}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={btnRef.current}
        keepMounted={false}
        open={openMenu}>
        {options.map((value, idx) => (
          <MenuItem disabled={value.enabled === false || (typeof value.enabled === 'function' && !value.enabled())} key={idx} onClick={() => { setOpenMenu(false); value.action(); }}>{value.label}</MenuItem>
        ))}
      </Menu>
      <Dialog open={openSendResult} maxWidth='lg' fullWidth>
        <DialogTitle>{t('titles.send_result')}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label={t('inputs.result')} value={resultValue} onChange={e => setResultValue(e.currentTarget.value)} />
        </DialogContent>
        <DialogActions>
          <Button color='inherit' onClick={() => setOpenSendResult(false)}>{t('titles.cancel')}</Button>
          <Button variant='contained' onClick={handleSendResultClick}>{t('titles.send_result')}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export const TestAgentView = () => {
  const { t } = useTranslation();
  const [c2Host, setC2Host] = React.useState('ws://localhost:3001');
  useTitle(`WebBait - ${t('titles.test_agent')}`);
  const [connected, setConnected] = React.useState(false);
  const [cmds, setCmds] = useState<{ cmd: string, cmdId: string, options: boolean }[]>([]);
  const handleConnectDisconnect = async () => {
    if (clientWebsocketService && connected) {
      clientWebsocketService.disconnect();
      clientWebsocketService.off('connect');
      clientWebsocketService.off('disconnect');
      clientWebsocketService.off('cmd');
      setConnected(false);
    } else {
      console.log('connecting');
      await connectClientWebsocket();
      if (clientWebsocketService) {
        clientWebsocketService.on("connect", () => {
          setConnected(true);
        });
        clientWebsocketService.on("disconnect", () => {
          setConnected(false);
        });
        clientWebsocketService.on("cmd", (cmd: { cmd: string, cmdId: string, data?: any }) => {
          const cmdWithOptions = {
            ...cmd,
            options: true,
          }
          setCmds(cmds => _.uniqBy([...cmds, cmdWithOptions], 'cmdId'));
        });
      }
    }
  }
  const columns: GridColDef[] = [
    { field: "cmdId", headerName: "Command ID", width: 400 },
    { field: "cmd", headerName: "Command", flex: 1 },
    {
      field: "options", headerName: "", width: 65, hideSortIcons: true, disableColumnMenu: true, renderCell: (params) => (
        <RowOptionsCell
          getCmd={cmdId => _.find(cmds, { cmdId })}
          deleteCmd={cmdId => setCmds(cmds => cmds.filter(cmd => cmd.cmdId !== cmdId))}
          params={params}
          clickedOnViewSubject={clickedOnViewSubject} />
      )
    },
  ];
  const clickedOnViewSubject = new Subject<boolean>();
  const [pageSize, setPageSize] = useState(15);
  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, height: '90vh' }} onClick={() => clickedOnViewSubject.next(true)}>
      <Grid container direction='column' spacing={2} sx={{ height: '100%' }}>
        <Grid item>
          <Stack direction='row' spacing={2} justifyContent='space-between'>
            <TextField value={c2Host} label={t('inputs.c2host')} onChange={e => setC2Host(e.currentTarget ? e.currentTarget.value : '')} fullWidth />
            <Button variant='contained' onClick={handleConnectDisconnect}>{connected ? 'disconnect' : 'connect'}</Button>
          </Stack>
        </Grid>
        <Grid item sx={{ flexGrow: 1 }}>
          <DataGrid
            columns={columns}
            rows={cmds}
            checkboxSelection
            getRowId={(row) => row.cmdId}
            onCellClick={(__, e) => { e.defaultMuiPrevented = true; }}
            pageSize={pageSize}
            onPageSizeChange={(pageSize) => setPageSize(pageSize)}
            rowsPerPageOptions={[5, 10, 15, 20, 25]} />
        </Grid>
      </Grid>
    </Paper>
  )
}
