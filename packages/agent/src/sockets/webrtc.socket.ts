import { io, Socket } from "socket.io-client";
import { RtpCapabilities, Transport, Producer, TransportOptions, RtpEncodingParameters, MediaKind, RtpParameters, Consumer } from "mediasoup-client/lib/types";
import { Device } from "mediasoup-client";
import { Subject } from "rxjs";

export type MediasoupPeerProps = {
  mic: boolean
  webcam: boolean
  screen: boolean
}

export type WebRtcSubjects = {
  type: 'peerJoined'
  id: string
  props: MediasoupPeerProps
} | {
  type: 'peerLeft'
  id: string
} | {
  type: 'peerUpdated'
  id: string
  props: MediasoupPeerProps
} | {
  type: 'transportCreated'
  transportType: MediasoupTransportType
} | {
  type: 'connected'
} | {
  type: 'disconnected'
} | {
  type: 'peerDevices'
  id: string
  devices: MediaDeviceInfo[]
}

export type MediasoupTransportType = "SEND" | "RECEIVE";

export type MediasoupProducerType = 'mic' | 'webcam' | 'screen';

export class WebRtcWebsocket extends Subject<WebRtcSubjects> {
  readonly transports: Map<MediasoupTransportType, Transport> = new Map();
  readonly producers: Map<MediasoupProducerType, Producer> = new Map();
  private webcamOnProgress = false;
  private micOnProgress = false;
  private screenOnProgress = false;
  readonly consumers: Map<string, Consumer> = new Map();
  private peerId: string = '';
  private device: Device = new Device();
  readonly peers: Map<string, { mic: boolean, webcam: boolean, screen: boolean }> = new Map();
  private static _instance: WebRtcWebsocket | null = null;
  static getInstance = (
    token: string = '',
    socket: Socket = webRtcWebsocket,
  ) => {
    if (!this._instance) this._instance = new WebRtcWebsocket(token, socket);
    return this._instance;
  }

  private constructor(
    private token: string = '',
    readonly socket: Socket = webRtcWebsocket,
  ) {
    super();
    this.socket.on('error', this.handleError);
    this.socket.on('routerRtpCapabilities', this.handleRouterRtpCapabilities);
    this.socket.on('peers', this.handlePeers);
    this.socket.on('peerJoined', this.handlePeerJoined);
    this.socket.on('peerLeft', this.handlePeerLeft);
    this.socket.on('peerUpdated', this.handlePeerUpdated);
    this.socket.on('peerDevices', this.handlePeerDevices);
    this.socket.on('peerCreated', this.handlePeerCreated);
    this.socket.on('webRtcTransportCreated', this.handleWebRtcTransportCreated);
    this.socket.on('devicesRequest', this.handleDevicesRequest);
    this.socket.on('enableMic', this.enableMic);
    this.socket.on('disableMic', this.disableMic);
    this.socket.on('changeMic', this.changeMic);
    this.socket.on('enableWebcam', this.enableWebcam);
    this.socket.on('disableWebcam', this.disableWebcam);
    this.socket.on('changeWebcam', this.changeWebcam);
    this.socket.on('startScreenShare', this.startScreenShare);
    this.socket.on('stopScreenShare', this.stopScreenShare);
    this.socket.on('disconnect', () => this.next({ type: 'disconnected' }));
    this.socket.on('connect', () => this.next({ type: 'connected' }));
    this.socket.on('reconnect', () => this.next({ type: 'connected' }));
  }

  setToken = (token: string) => this.token = token;

  connect = async () => {
    this.close();
    this.socket.auth = { token: this.token };
    this.socket.connect();
  }

  close = () => {
    if (!this.connected()) return;
    this.transports.forEach(t => t.close());
    this.socket.disconnect();
  }

  connected = () => this.socket.connected;

  private handleError = (msg: string) => {
    switch (msg) {
      case 'peer already exists':
        console.log('Identity theft? 0.o');
        break;
      default:
        console.error(msg);
        break;
    }
  }

  private handleRouterRtpCapabilities = async (routerRtpCapabilities: RtpCapabilities) => {
    if (!this.device.loaded) await this.device.load({ routerRtpCapabilities });
    this.socket.emit('deviceRtpCapabilities', this.device.rtpCapabilities);
    this.socket.emit('mediaDevices', await navigator.mediaDevices.enumerateDevices());
  }

  private handlePeers = (peers: { id: string, props: MediasoupPeerProps }[]) => {
    peers.forEach(peer => {
      this.peers.set(peer.id, peer.props);
      this.next({ type: 'peerUpdated', id: peer.id, props: peer.props });
    });
  }

  private handlePeerJoined = (id: string, props: MediasoupPeerProps) => {
    this.peers.set(id, props);
    this.next({ type: 'peerJoined', id, props });
  }

  private handlePeerLeft = (id: string) => {
    this.peers.delete(id);
    this.next({ type: 'peerLeft', id });
  }

  private handlePeerUpdated = (id: string, props: MediasoupPeerProps) => {
    this.peers.set(id, props);
    this.next({ type: 'peerUpdated', id, props });
  }

  private handlePeerDevices = (id: string, devices: MediaDeviceInfo[]) => {
    this.next({ type: 'peerDevices', id, devices });
  }

  private handlePeerCreated = (peerId: string) => {
    this.peerId = peerId;
    this.socket.emit('createWebRtcTransport', { peerId: this.peerId, sctpCapabilities: this.device.sctpCapabilities });
  }

  private handleWebRtcTransportCreated = async (transportOptions: Pick<TransportOptions, 'id' | 'iceParameters' | 'iceCandidates' | 'dtlsParameters' | 'sctpParameters'>, type: MediasoupTransportType) => {
    let transport: Transport;
    if (type === 'SEND') transport = this.device.createSendTransport(transportOptions);
    else transport = this.device.createRecvTransport(transportOptions);
    transport.on('connect', ({ dtlsParameters }, callback) => {
      this.socket.emit('connectWebRtcTransport', { type, dtlsParameters });
      callback();
    });
    if (type === 'SEND') {
      transport.on('produce', async ({ kind, rtpParameters, appData }, callback) => {
        this.socket.emit('produce', { id: transportOptions.id, kind, rtpParameters, type: appData.type });
        this.socket.once(`producerCreated:${transportOptions.id}:${appData.type}`, (id: string) => {
          callback({ id });
        });
      });
    }
    this.transports.set(type, transport);
    this.next({ type: 'transportCreated', transportType: type });
  }

  private handleDevicesRequest = async () => {
    this.socket.emit('mediaDevices', await navigator.mediaDevices.enumerateDevices());
  }

  enableMic = async (deviceId: string, callback: ((error?: string) => void)) => {
    try {
      if (this.producers.has('mic') && !this.micOnProgress) return;
      this.micOnProgress = true;
      const transport = this.transports.get('SEND');
      if (!transport) return;
      if (!this.device.canProduce('audio')) return;
      const track = await navigator.mediaDevices.getUserMedia({ audio: { deviceId } }).then(stream => stream.getAudioTracks()[0]);
      if (this.producers.has('mic')) return;
      const producer = await transport.produce({ track, codecOptions: { opusStereo: true, opusDtx: true }, appData: { type: 'mic' } });
      producer.on('transportclose', this.disableMic);
      producer.on('trackended', this.disableMic);
      this.producers.set('mic', producer);
      callback();
    } catch (e: any) {
      callback(e.message);
    }
    this.micOnProgress = false;
  }

  disableMic = () => {
    const producer = this.producers.get('mic');
    if (!producer) return;
    producer.close();
    this.producers.delete('mic');
    this.socket.emit('micDisabled');
  }

  micMuted = () => {
    const micProducer = this.producers.get('mic');
    if (micProducer) return micProducer.paused;
    else return false;
  }

  changeMic = async (deviceId: string, callback: ((error?: string) => void)) => {
    try {
      const producer = this.producers.get('mic');
      if (!producer) return;
      if (!await navigator.mediaDevices.enumerateDevices().then(devices => devices.find(d => d.deviceId === deviceId))) return;
      const track = await navigator.mediaDevices.getUserMedia({ audio: { deviceId } }).then(stream => stream.getAudioTracks()[0]);
      producer.replaceTrack({ track });
      callback();
    } catch (e: any) {
      callback(e.message);
    }
  }

  toggleMuteMic = () => {
    const micProducer = this.producers.get('mic');
    if (micProducer) {
      if (micProducer.paused) micProducer.resume();
      else micProducer.pause();
    }
  }

  muteMic = () => {
    const micProducer = this.producers.get('mic');
    if (micProducer) {
      if (micProducer.paused) return;
      micProducer.pause();
    }
  }
  unmuteMic = () => {
    const micProducer = this.producers.get('mic');
    if (micProducer) {
      if (!micProducer.paused) return;
      micProducer.resume();
    }
  }

  enableWebcam = async (deviceId: string, callback: ((error?: string) => void)) => {
    try {
      if (this.producers.has('webcam') && !this.webcamOnProgress) return;
      this.webcamOnProgress = true;
      const transport = this.transports.get('SEND');
      if (!transport) return;
      if (!this.device.canProduce('video')) return;
      const track = await navigator.mediaDevices.getUserMedia({ video: { deviceId, width: { ideal: 1280 }, height: { ideal: 720 } } }).then(stream => stream.getVideoTracks()[0]);
      const codecs = this.device.rtpCapabilities.codecs || [];
      const codec = codecs.find(c => c.mimeType.toLowerCase() === 'video/h264') || codecs.find(c => c.mimeType.toLowerCase() === 'video/vp9') || codecs.find(c => c.mimeType.toLowerCase() === 'video/v8');
      let encodings: RtpEncodingParameters[] | undefined = undefined;
      if (codec && codec.mimeType.toLowerCase() === 'video/vp9') {
        encodings = [
          { scalabilityMode: 'S3T3_KEY' }
        ];
      } else {
        encodings = [
          { scaleResolutionDownBy: 4, maxBitrate: 500000 },
          { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
          { scaleResolutionDownBy: 1, maxBitrate: 5000000 }
        ];
      }
      const producer = await transport.produce({
        track,
        codecOptions: { videoGoogleStartBitrate: 1000 },
        encodings,
        codec,
        appData: { type: 'webcam' }
      });
      producer.on('transportclose', this.disableWebcam);
      producer.on('trackended', this.disableWebcam);
      this.producers.set('webcam', producer);
      callback();
    } catch (e: any) {
      callback(e.message);
    }
    this.webcamOnProgress = false;
  }

  disableWebcam = (callback: ((error?: string) => void)) => {
    try {
      const producer = this.producers.get('webcam');
      if (!producer) throw new Error('Webcam not enabled');
      this.producers.delete('webcam');
      producer.close();
      this.socket.emit('webcamDisabled');
      callback();
    } catch (e: any) {
      callback(e.message);
    }
  }

  changeWebcam = async (deviceId: string, callback: ((error?: string) => void)) => {
    try {
      const producer = this.producers.get('webcam');
      if (!producer) return;
      if (!await navigator.mediaDevices.enumerateDevices().then(devices => devices.find(d => d.deviceId === deviceId))) return;
      const track = await navigator.mediaDevices.getUserMedia({ video: { deviceId, width: { ideal: 1280 }, height: { ideal: 720 } } }).then(stream => stream.getVideoTracks()[0]);
      producer.replaceTrack({ track });
      callback();
    } catch (e: any) {
      callback(e.message);
    }
  }

  webcamPaused = () => {
    const webcamProducer = this.producers.get('webcam');
    if (webcamProducer) return webcamProducer.paused;
    else return false;
  }

  pauseWebcam = () => {
    const webcamProducer = this.producers.get('webcam');
    if (webcamProducer) {
      if (webcamProducer.paused) return;
      webcamProducer.pause();
    }
  }

  resumeWebcam = () => {
    const webcamProducer = this.producers.get('webcam');
    if (webcamProducer) {
      if (!webcamProducer.paused) return;
      webcamProducer.resume();
    }
  }

  startScreenShare = async (callback: ((error?: string) => void)) => {
    try {
      if (this.screenShared() || this.screenOnProgress) throw new Error('Screen share already started or in progress');
      this.screenOnProgress = true;
      const transport = this.transports.get('SEND');
      if (!transport) throw new Error('No transport available');
      if (!this.device.canProduce('video')) throw new Error('Cannot produce video');
      const track = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: {
          width: { max: 1920 },
          height: { max: 1080 },
          frameRate: { max: 30 },
          displaySurface: 'monitor',
          logicalSurface: true,
          cursor: true,
        } as any,
      }).then(stream => stream.getVideoTracks()[0]);
      const codecs = this.device.rtpCapabilities.codecs || [];
      const codec = codecs.find(c => c.mimeType.toLowerCase() === 'video/h264') || codecs.find(c => c.mimeType.toLowerCase() === 'video/vp9') || codecs.find(c => c.mimeType.toLowerCase() === 'video/v8');
      let encodings: RtpEncodingParameters[] | undefined = undefined;
      if (codec && codec.mimeType.toLowerCase() === 'video/vp9') {
        encodings = [
          { scalabilityMode: 'S3T3', dtx: true }
        ];
      } else {
        encodings = [
          { dtx: true, maxBitrate: 1500000 },
          { dtx: true, maxBitrate: 6000000 }
        ];
      }
      const producer = await transport.produce({
        track,
        codecOptions: { videoGoogleStartBitrate: 1000 },
        encodings,
        codec,
        appData: { type: 'screen' }
      });
      producer.on('transportclose', this.stopScreenShare);
      producer.on('trackended', this.stopScreenShare);
      this.producers.set('screen', producer);
      callback();
    } catch (e: any) {
      callback(e.message);
    }
    this.screenOnProgress = false;
  }

  stopScreenShare = (callback: ((error?: string) => void)) => {
    try {
      const producer = this.producers.get('screen');
      if (!producer) throw new Error('Screen not shared');
      producer.close();
      this.producers.delete('screen');
      this.socket.emit('screenShareStopped');
      callback();
    } catch (e: any) {
      callback(e.message);
    }
  }

  screenShared = () => {
    return this.producers.has('screen');
  }

  consume = (peerId: string, type: MediasoupProducerType, callback: (consumer: Consumer) => void) => {
    if (this.consumers.has(`${peerId}${type}`)) return;
    const transport = this.transports.get('RECEIVE');
    if (!transport) return;
    this.socket.emit('consume', { peerId, type });
    this.socket.once(`consumerCreated:${peerId}:${type}`, async ({ id, rtpParameters, producerId, kind, }: { id: string, rtpParameters: RtpParameters, producerId: string, kind: MediaKind, }) => {
      const consumer = await transport.consume({
        id,
        rtpParameters,
        producerId,
        kind,
      });
      consumer.on('trackended', () => this.stopConsuming(peerId, type));
      consumer.on('transportclose', () => this.stopConsuming(peerId, type));
      this.consumers.set(`${peerId}${type}`, consumer);
      this.socket.emit(`consumerReceived:${peerId}:${type}:${id}`);
      consumer.resume();
      callback(consumer);
    });
  }

  stopConsuming = (peerId: string, type: MediasoupProducerType) => {
    const consumer = this.consumers.get(`${peerId}${type}`);
    if (!consumer) return;
    consumer.close();
    this.consumers.delete(`${peerId}${type}`);
  }
}

export const webRtcWebsocket = io(
  `${process.env.REACT_APP_WS_URL ? process.env.REACT_APP_WS_URL : 'wss://localhost:3001'}/webrtc`,
  {
    transports: ['websocket'],
    autoConnect: false,
    reconnection: false,
  }
);
