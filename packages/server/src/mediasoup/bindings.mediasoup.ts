import { BindingKey } from "@loopback/core";
import { Subject } from "rxjs";
import { MediasoupJWT } from "./jwt.mediasoup";
import { MediaDeviceInfo, MediasoupConsumers, MediasoupPeers, MediasoupWebRtcTransport } from "./rooms";
import { MediasoupRooms } from "./rooms.mediasoup";
import { MediasoupWorkers } from "./workers.mediasoup";

export type MediasoupPeerProps = {
  mic: boolean
  micDeviceId: string
  webcam: boolean
  webcamDeviceId: string
  screen: boolean
}

export type MediasoupSubjects = {
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
  type: 'requestPeerDevices',
  id: string
} | {
  type: 'peerDevices',
  id: string
  devices: MediaDeviceInfo[]
} | {
  type: 'enableMic'
  id: string
  deviceId: string
} | {
  type: 'disableMic'
  id: string
} | {
  type: 'changeMic'
  id: string
  deviceId: string
} | {
  type: 'enableWebcam'
  id: string
  deviceId: string
} | {
  type: 'disableWebcam'
  id: string
} | {
  type: 'changeWebcam'
  id: string
  deviceId: string
} | {
  type: 'startScreenShare'
  id: string
} | {
  type: 'stopScreenShare'
  id: string
}

export const MediasoupBindings = {
  workers: BindingKey.create<MediasoupWorkers>('mediasoup.workers'),
  rooms: BindingKey.create<MediasoupRooms>('mediasoup.rooms'),
  peers: BindingKey.create<MediasoupPeers>('mediasoup.peers'),
  consumers: BindingKey.create<MediasoupConsumers>('mediasoup.consumers'),
  webRtcTransport: BindingKey.create<MediasoupWebRtcTransport>('mediasoup.webrtc.transport'),
  jwt: BindingKey.create<MediasoupJWT>('mediasoup.jwt'),
  subject: BindingKey.create<Subject<MediasoupSubjects>>('mediasoup.subject'),
}
