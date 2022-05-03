import _ from "lodash";
import { Producer, RtpCapabilities, SctpCapabilities, WebRtcTransport } from "mediasoup/node/lib/types";
import { MediasoupProducerType } from "./transport.rooms";
import { MediasoupRoom } from "../rooms.mediasoup";
import { MediasoupConsumer } from "./consumer.rooms";

export type MediaDeviceInfo = {
  deviceId: string
  groupId: string
  kind: "videoinput" | "audioinput" | "audiooutput"
  label: string
}

export type MediasoupTransportType = "SEND" | "RECEIVE";

export type MediasoupPeer = {
  id: string;
  rtpCapabilities: RtpCapabilities;
  mediaDevices: MediaDeviceInfo[];
  sctpCapabilities?: SctpCapabilities;
  transports: Map<MediasoupTransportType, WebRtcTransport>;
  producers: Map<MediasoupProducerType, Producer>;
  consumers: Map<string, MediasoupConsumer>;
}

export class MediasoupPeers {
  getRoomPeer = (room: MediasoupRoom, peerId: string) => room.peers.get(peerId);

  getRoomPeers = (room: MediasoupRoom) => room.peers;

  createRoomPeer = (room: MediasoupRoom, peerId: string, rtpCapabilities: RtpCapabilities) => {
    const peer = {
      id: peerId,
      rtpCapabilities,
      transports: new Map<MediasoupTransportType, WebRtcTransport>(),
      producers: new Map<MediasoupProducerType, Producer>(),
      consumers: new Map<string, MediasoupConsumer>(),
      mediaDevices: []
    }
    room.peers.set(peerId, peer);
    return peer;
  }

  deleteRoomPeer = (room: MediasoupRoom, peer: MediasoupPeer) => {
    peer.consumers.forEach(consumer => consumer.consumer.close());
    peer.transports.forEach(transport => transport.close());
    peer.producers.forEach(producer => producer.close());
    return room.peers.delete(peer.id);
  }

  getPeerDevices = (room: MediasoupRoom, peerId: string) => {
    const peer = this.getRoomPeer(room, peerId);
    if (!peer) return [];
    return peer.mediaDevices;
  }

  setPeerDevices = (room: MediasoupRoom, peerId: string, mediaDevices: MediaDeviceInfo[]) => {
    const peer = this.getRoomPeer(room, peerId);
    if (!peer) return;
    peer.mediaDevices = mediaDevices;
  }
}
