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
  callback: (error?: string) => void
} | {
  type: 'disableMic'
  id: string
  callback: (error?: string) => void
} | {
  type: 'changeMic'
  id: string
  deviceId: string
  callback: (error?: string) => void
} | {
  type: 'enableWebcam'
  id: string
  deviceId: string
  callback: (error?: string) => void
} | {
  type: 'disableWebcam'
  id: string
  callback: (error?: string) => void
} | {
  type: 'changeWebcam'
  id: string
  deviceId: string
  callback: (error?: string) => void
} | {
  type: 'startScreenShare'
  id: string
  callback: (error?: string) => void
} | {
  type: 'stopScreenShare'
  id: string
  callback: (error?: string) => void
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
