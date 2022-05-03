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
          socket.on('enableMic', (peerId: string, deviceId: string) => {
            this.subject.next({ type: 'enableMic', id: peerId, deviceId });
          });
          socket.on('disableMic', (peerId: string) => {
            this.subject.next({ type: 'disableMic', id: peerId });
          });
          socket.on('changeMic', (peerId: string, deviceId: string) => {
            this.subject.next({ type: 'changeMic', id: peerId, deviceId });
          });
          socket.on('enableWebcam', (peerId: string, deviceId: string) => {
            this.subject.next({ type: 'enableWebcam', id: peerId, deviceId });
          });
          socket.on('disableWebcam', (peerId: string) => {
            this.subject.next({ type: 'disableWebcam', id: peerId });
          });
          socket.on('changeWebcam', (peerId: string, deviceId: string) => {
            this.subject.next({ type: 'changeWebcam', id: peerId, deviceId });
          });
          socket.on('startScreenShare', (peerId: string) => {
            this.subject.next({ type: 'startScreenShare', id: peerId });
          });
          socket.on('stopScreenShare', (peerId: string) => {
            this.subject.next({ type: 'stopScreenShare', id: peerId });
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
          if (this.peerId) this.subject.next({ type: 'peerJoined', id: this.peerId, props: { mic: false, webcam: false, screen: false } });
          const subscription = this.subject.subscribe({
            next: subject => {
              if (this.peer?.id !== subject.id) return;
              switch (subject.type) {
                case 'requestPeerDevices':
                  socket.emit('devicesRequest');
                  break;
                case 'enableMic':
                  socket.emit('enableMic', subject.deviceId);
                  break;
                case 'disableMic':
                  socket.emit('disableMic');
                  break;
                case 'changeMic':
                  socket.emit('changeMic', subject.deviceId);
                  break;
                case 'enableWebcam':
                  socket.emit('enableWebcam', subject.deviceId);
                  break;
                case 'disableWebcam':
                  socket.emit('disableWebcam');
                  break;
                case 'changeWebcam':
                  socket.emit('changeWebcam', subject.deviceId);
                  break;
                case 'startScreenShare':
                  socket.emit('startScreenShare');
                  break;
                case 'stopScreenShare':
                  socket.emit('stopScreenShare');
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
      const peers: { id: string, props: { mic: boolean, webcam: boolean, screen: boolean } }[] = [];
      this.room.peers.forEach((peer) => {
        peers.push({ id: peer.id, props: { mic: peer.producers.has('mic'), webcam: peer.producers.has('webcam'), screen: peer.producers.has('screen') } });
      });
      this.socket.emit('peers', peers);
      peers.forEach(peer => {
        this.socket.emit('peerDevices', peer.id, this.peers.getPeerDevices(this.room, peer.id));
      });
    }
  }
  @ws.subscribe('mediaDevices')
  async handleMediaDevices(mediaDevices: MediaDeviceInfo[]) {
    this.peer.mediaDevices = mediaDevices;
    this.peers.setPeerDevices(this.room, this.peer.id, mediaDevices);
    this.subject.next({ type: 'peerDevices', id: this.peer.id, devices: mediaDevices });
  }

  @ws.subscribe('createWebRtcTransport')
  async handleCreateWebRtcTransport(sctpCapabilities: SctpCapabilities) {
    this.peer.sctpCapabilities = sctpCapabilities;
    const sendTransport = await this.webRtcTransport.createPeerWebRtcTransport(this.room.router, this.peer, 'SEND');
    const receiveTransport = await this.webRtcTransport.createPeerWebRtcTransport(this.room.router, this.peer, 'RECEIVE');
    this.socket.emit('webRtcTransportCreated', this.webRtcTransport.webRtcTransportToOptions(sendTransport), 'SEND');
    this.socket.emit('webRtcTransportCreated', this.webRtcTransport.webRtcTransportToOptions(receiveTransport), 'RECEIVE');
  }

  @ws.subscribe('connectWebRtcTransport')
  async handleConnectWebRtcTransport({ type, dtlsParameters }: { type: MediasoupTransportType, dtlsParameters: DtlsParameters }) {
    const transport = this.peer.transports.get(type);
    if (!transport) return;
    try {
      await transport.connect({ dtlsParameters });
    } catch (_) { }
  }

  @ws.subscribe('produce')
  async handleProduce({ id, kind, rtpParameters, type }: { id: string, kind: MediaKind, rtpParameters: RtpParameters, type: MediasoupProducerType }) {
    const transport = this.peer.transports.get('SEND');
    if (!transport) return;
    if (this.peer.producers.has(type)) return;
    console.log({ kind, rtpParameters });
    const producer = await transport.produce({ kind, rtpParameters });
    producer.on('transportclose', () => {
      this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), webcam: this.peer.producers.has('webcam'), screen: this.peer.producers.has('screen') } });
    });
    this.peer.producers.set(type, producer);
    this.socket.emit(`producerCreated:${id}:${type}`, producer.id);
    this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), webcam: this.peer.producers.has('webcam'), screen: this.peer.producers.has('screen') } });
  }

  @ws.subscribe('consume')
  async handleConsume({ peerId, type }: { peerId: string, type: MediasoupProducerType }) {
    const peer = this.peers.getRoomPeer(this.room, peerId);
    if (!peer) return;
    const producer = peer.producers.get(type);
    if (!producer) return;
    const consumer = await this.consumers.createPeerConsumer(this.room, peer, type, this.peer);
    if (!consumer) return;
    consumer.consumer.on('producerclose', () => {
      peer.producers.delete(type);
      this.subject.next({ type: 'peerUpdated', id: peer.id, props: { mic: peer.producers.has('mic'), webcam: peer.producers.has('webcam'), screen: peer.producers.has('screen') } });
    });
    this.socket.emit(`consumerCreated:${peerId}:${type}`, {
      id: consumer.consumer.id,
      rtpParameters: consumer.consumer.rtpParameters,
      producerId: producer.id,
      kind: consumer.consumer.kind,
    });
    this.socket.once(`consumerReceived:${peerId}:${type}:${consumer.consumer.id}`, () => consumer.consumer.resume());
  }

  @ws.subscribe('micDisabled')
  async handleMicDisabled() {
    const producer = this.peer.producers.get('mic');
    if (!producer) return;
    this.peer.producers.delete('mic');
    this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), webcam: this.peer.producers.has('webcam'), screen: this.peer.producers.has('screen') } });
  }

  @ws.subscribe('webcamDisabled')
  async handleWebcamDisabled() {
    const producer = this.peer.producers.get('webcam');
    if (!producer) return;
    this.peer.producers.delete('webcam');
    this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), webcam: this.peer.producers.has('webcam'), screen: this.peer.producers.has('screen') } });
  }

  @ws.subscribe('screenShareStopped')
  async handleScreenShareStopped() {
    const producer = this.peer.producers.get('screen');
    if (!producer) return;
    this.peer.producers.delete('screen');
    this.subject.next({ type: 'peerUpdated', id: this.peer.id, props: { mic: this.peer.producers.has('mic'), webcam: this.peer.producers.has('webcam'), screen: this.peer.producers.has('screen') } });
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
