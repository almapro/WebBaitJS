import { inject } from '@loopback/core';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';
import { DtlsParameters, MediaKind, RtpCapabilities, RtpParameters, SctpCapabilities } from "mediasoup/node/lib/types";
import { ws } from '../decorators';
import { MediaDeviceInfo, MediasoupBindings, MediasoupConsumers, MediasoupJWT, MediasoupPeer, MediasoupPeers, MediasoupProducerType, MediasoupRoom, MediasoupRooms, MediasoupSubjects, MediasoupTransportType, MediasoupWebRtcTransport, MediasoupWorkers } from '../mediasoup';
import { Subject } from 'rxjs';

@ws('/webrtc')
export class WebRtcWebSocketController {
  private room: MediasoupRoom;
  private peer: MediasoupPeer;
  private peerId: string | undefined = undefined;
  private admin = false
  constructor(
    @ws.socket()
    private socket: Socket,
    @inject(MediasoupBindings.workers)
    private workers: MediasoupWorkers,
    @inject(MediasoupBindings.rooms)
    private rooms: MediasoupRooms,
    @inject(MediasoupBindings.peers)
    private peers: MediasoupPeers,
    @inject(MediasoupBindings.consumers)
    private consumers: MediasoupConsumers,
    @inject(MediasoupBindings.webRtcTransport)
    private webRtcTransport: MediasoupWebRtcTransport,
    @inject(MediasoupBindings.jwt)
    private jwt: MediasoupJWT,
    @inject(MediasoupBindings.subject)
    private subject: Subject<MediasoupSubjects>,
  ) { }

  /**
   * The method is invoked when a client connects to the server
   * @param socket
   */
  @ws.connect()
  async connect(socket: Socket) {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decodedToken = await this.jwt.verifyToken(token);
        const foundRoom = this.rooms.get(decodedToken.roomId);
        if (foundRoom) this.room = foundRoom;
        else this.room = await this.rooms.create(decodedToken.roomId, await this.workers.get());
        if (decodedToken.peerId) {
          this.peerId = decodedToken.peerId;
          if (this.room.peers.has(decodedToken.peerId)) {
            socket.emit('error', 'peer already exists');
            socket.disconnect();
            return;
          }
        }
        socket.emit('routerRtpCapabilities', this.room.router.rtpCapabilities);
        if (decodedToken.admin) {
          this.admin = true;
          socket.on('requestPeerDevices', (peerId: string) => {
            this.subject.next({ type: 'requestPeerDevices', id: peerId });
          });
          socket.on('enableMic', (peerId: string, deviceId: string, callback: ((error?: string) => void)) => {
            this.subject.next({ type: 'enableMic', id: peerId, deviceId, callback });
          });
          socket.on('disableMic', (peerId: string, callback: ((error?: string) => void)) => {
            this.subject.next({ type: 'disableMic', id: peerId, callback });
          });
          socket.on('changeMic', (peerId: string, deviceId: string, callback: ((error?: string) => void)) => {
            this.subject.next({ type: 'changeMic', id: peerId, deviceId, callback });
          });
          socket.on('enableWebcam', (peerId: string, deviceId: string, callback: ((error?: string) => void)) => {
            this.subject.next({ type: 'enableWebcam', id: peerId, deviceId, callback });
          });
          socket.on('disableWebcam', (peerId: string, callback: ((error?: string) => void)) => {
            this.subject.next({ type: 'disableWebcam', id: peerId, callback });
          });
          socket.on('changeWebcam', (peerId: string, deviceId: string, callback: ((error?: string) => void)) => {
            this.subject.next({ type: 'changeWebcam', id: peerId, deviceId, callback });
          });
          socket.on('startScreenShare', (peerId: string, callback: ((error?: string) => void)) => {
            this.subject.next({ type: 'startScreenShare', id: peerId, callback });
          });
          socket.on('stopScreenShare', (peerId: string, callback: ((error?: string) => void)) => {
            this.subject.next({ type: 'stopScreenShare', id: peerId, callback });
          });
          const subscription = this.subject.subscribe({
            next: subject => {
              if (this.peer?.id === subject.id) return;
              switch (subject.type) {
                case 'peerJoined':
                  socket.emit('peerJoined', subject.id, subject.props);
                  break;
                case 'peerLeft':
                  socket.emit('peerLeft', subject.id);
                  break;
                case 'peerUpdated':
                  socket.emit('peerUpdated', subject.id, subject.props);
                  break;
                case 'peerDevices':
                  socket.emit('peerDevices', subject.id, subject.devices);
                  break;
              }
            }
          });
          socket.once('disconnect', () => {
            subscription.unsubscribe();
          });
        } else {
          if (this.peerId) {
            const id = this.peerId;
            this.subject.next({ type: 'peerJoined', id, props: { mic: false, micDeviceId: '', webcam: false, webcamDeviceId: '', screen: false } });
          }
          const subscription = this.subject.subscribe({
            next: subject => {
              if (this.peer?.id !== subject.id) return;
              switch (subject.type) {
                case 'requestPeerDevices':
                  socket.emit('devicesRequest');
                  break;
                case 'enableMic':
                  socket.timeout(5000).emit('enableMic', subject.deviceId, (err: any, error?: string) => {
                    this.peer.micDeviceId = subject.deviceId;
                    if (err || error) subject.callback(err || error);
                    else subject.callback();
                  });
                  break;
                case 'disableMic':
                  socket.timeout(5000).emit('disableMic', (err: any, error?: string) => {
                    if (err || error) subject.callback(err || error);
                    else subject.callback();
                  });
                  break;
                case 'changeMic':
                  socket.timeout(5000).emit('changeMic', subject.deviceId, (err: any, error?: string) => {
                    this.peer.micDeviceId = subject.deviceId;
                    if (err || error) subject.callback(err || error);
                    else subject.callback();
                  });
                  break;
                case 'enableWebcam':
                  socket.timeout(5000).emit('enableWebcam', subject.deviceId, (err: any, error?: string) => {
                    this.peer.webcamDeviceId = subject.deviceId;
                    if (err || error) subject.callback(err || error);
                    else subject.callback();
                  });
                  break;
                case 'disableWebcam':
                  socket.timeout(5000).emit('disableWebcam', (err: any, error?: string) => {
                    if (err || error) subject.callback(err || error);
                    else subject.callback();
                  });
                  break;
                case 'changeWebcam':
                  socket.timeout(5000).emit('changeWebcam', subject.deviceId, (err: any, error?: string) => {
                    this.peer.webcamDeviceId = subject.deviceId;
                    if (err || error) subject.callback(err || error);
                    else subject.callback();
                  });
                  break;
                case 'startScreenShare':
                  socket.timeout(5000).emit('startScreenShare', (err: any, error?: string) => {
                    if (err || error) subject.callback(err || error);
                    else subject.callback();
                  });
                  break;
                case 'stopScreenShare':
                  socket.timeout(5000).emit('stopScreenShare', (err: any, error?: string) => {
                    if (err || error) subject.callback(err || error);
                    else subject.callback();
                  });
                  break;
              }
            }
          });
          socket.once('disconnect', () => {
            subscription.unsubscribe();
          });
        }
      } catch (e) {
        console.log(e);
        socket.emit('error', 'Invalid token');
        socket.disconnect();
      }
    } else {
      socket.emit('error', 'Missing token');
      socket.disconnect();
    }
  }

  @ws.subscribe('deviceRtpCapabilities')
  async handleDeviceRtpCapabilities(rtpCapabilities: RtpCapabilities) {
    this.peer = this.peers.createRoomPeer(this.room, this.peerId || v4(), rtpCapabilities);
    this.peerId = this.peer.id;
    this.socket.emit('peerCreated', this.peer.id);
    if (this.admin) {
      const peers: { id: string, props: { mic: boolean, micDeviceId: string, webcam: boolean, webcamDeviceId: string, screen: boolean } }[] = [];
      this.room.peers.forEach((peer) => {
        const { micDeviceId, webcamDeviceId } = peer;
        peers.push({ id: peer.id, props: { mic: peer.producers.has('mic'), micDeviceId, webcam: peer.producers.has('webcam'), webcamDeviceId, screen: peer.producers.has('screen') } });
      });
      this.socket.emit('peers', peers);
      peers.forEach(peer => {
        this.socket.emit('peerDevices', peer.id, this.peers.getPeerDevices(this.room, peer.id));
      });
    }
  }
  @ws.subscribe('mediaDevices')
  async handleMediaDevices(mediaDevices: MediaDeviceInfo[]) {
    if (!this.peer) return;
    this.peer.mediaDevices = mediaDevices;
    this.peers.setPeerDevices(this.room, this.peer.id, mediaDevices);
    this.subject.next({ type: 'peerDevices', id: this.peer.id, devices: mediaDevices });
  }

  @ws.subscribe('createWebRtcTransport')
  async handleCreateWebRtcTransport(sctpCapabilities: SctpCapabilities) {
    if (!this.peer) return;
    this.peer.sctpCapabilities = sctpCapabilities;
    const sendTransport = await this.webRtcTransport.createPeerWebRtcTransport(this.room.router, this.peer, 'SEND');
    const receiveTransport = await this.webRtcTransport.createPeerWebRtcTransport(this.room.router, this.peer, 'RECEIVE');
    this.socket.emit('webRtcTransportCreated', this.webRtcTransport.webRtcTransportToOptions(sendTransport), 'SEND');
    this.socket.emit('webRtcTransportCreated', this.webRtcTransport.webRtcTransportToOptions(receiveTransport), 'RECEIVE');
  }

  @ws.subscribe('connectWebRtcTransport')
  async handleConnectWebRtcTransport({ type, dtlsParameters }: { type: MediasoupTransportType, dtlsParameters: DtlsParameters }) {
    if (!this.peer) return;
    const transport = this.peer.transports.get(type);
    if (!transport) return;
    try {
      await transport.connect({ dtlsParameters });
    } catch (_) { }
  }

  @ws.subscribe('produce')
  async handleProduce({ id, kind, rtpParameters, type }: { id: string, kind: MediaKind, rtpParameters: RtpParameters, type: MediasoupProducerType }) {
    try {
      const transport = this.peer.transports.get('SEND');
      if (!transport) return;
      if (this.peer.producers.has(type)) return;
      const producer = await transport.produce({ kind, rtpParameters });
      producer.on('transportclose', () => {
        const { micDeviceId, webcamDeviceId } = this.peer;
        this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), micDeviceId, webcam: this.peer.producers.has('webcam'), webcamDeviceId, screen: this.peer.producers.has('screen') } });
      });
      this.peer.producers.set(type, producer);
      this.socket.emit(`producerCreated:${id}:${type}`, producer.id);
      const { micDeviceId, webcamDeviceId } = this.peer;
      this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), micDeviceId, webcam: this.peer.producers.has('webcam'), webcamDeviceId, screen: this.peer.producers.has('screen') } });
    } catch (_) { }
  }

  @ws.subscribe('consume')
  async handleConsume({ peerId, type }: { peerId: string, type: MediasoupProducerType }) {
    try {
      const peer = this.peers.getRoomPeer(this.room, peerId);
      if (!peer) return;
      const producer = peer.producers.get(type);
      if (!producer) return;
      const consumer = await this.consumers.createPeerConsumer(this.room, peer, type, this.peer);
      if (!consumer) return;
      consumer.consumer.on('producerclose', () => {
        peer.producers.delete(type);
        const { micDeviceId, webcamDeviceId } = peer;
        this.subject.next({ type: 'peerUpdated', id: peer.id, props: { mic: peer.producers.has('mic'), micDeviceId, webcam: peer.producers.has('webcam'), webcamDeviceId, screen: peer.producers.has('screen') } });
      });
      this.socket.emit(`consumerCreated:${peerId}:${type}`, {
        id: consumer.consumer.id,
        rtpParameters: consumer.consumer.rtpParameters,
        producerId: producer.id,
        kind: consumer.consumer.kind,
      });
      this.socket.once(`consumerReceived:${peerId}:${type}:${consumer.consumer.id}`, () => consumer.consumer.resume());
    } catch (_) { }
  }

  @ws.subscribe('micDisabled')
  async handleMicDisabled() {
    const producer = this.peer.producers.get('mic');
    if (!producer) return;
    producer.close();
    this.peer.producers.delete('mic');
    this.peer.micDeviceId = '';
    const { micDeviceId, webcamDeviceId } = this.peer;
    this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: false, micDeviceId, webcam: this.peer.producers.has('webcam'), webcamDeviceId, screen: this.peer.producers.has('screen') } });
  }

  @ws.subscribe('webcamDisabled')
  async handleWebcamDisabled() {
    const producer = this.peer.producers.get('webcam');
    if (!producer) return;
    producer.close();
    this.peer.producers.delete('webcam');
    this.peer.webcamDeviceId = '';
    const { micDeviceId, webcamDeviceId } = this.peer;
    this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), micDeviceId, webcam: false, webcamDeviceId, screen: this.peer.producers.has('screen') } });
  }

  @ws.subscribe('screenShareStopped')
  async handleScreenShareStopped() {
    const producer = this.peer.producers.get('screen');
    if (!producer) return;
    producer.close();
    this.peer.producers.delete('screen');
    const { micDeviceId, webcamDeviceId } = this.peer;
    this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), micDeviceId, webcam: this.peer.producers.has('webcam'), webcamDeviceId, screen: false } });
  }

  /**
   * The method is invoked when a client disconnects from the server
   * @param socket
   */
  @ws.disconnect()
  async disconnect() {
    console.log('Client disconnected: %s', this.socket.id);
    if (this.peer) {
      this.peers.deleteRoomPeer(this.room, this.peer);
      this.subject.next({ type: 'peerLeft', id: this.peer.id });
    }
  }
}
