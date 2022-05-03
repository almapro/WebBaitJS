import { Router, WebRtcTransport, WebRtcTransportOptions } from "mediasoup/node/lib/types";
import { MediasoupPeer, MediasoupTransportType } from "./peers.rooms";

export type MediasoupProducerType = 'mic' | 'webcam' | 'screen';

export const MediasoupWebRtcTransportOptions: WebRtcTransportOptions = {
  listenIps: [
    {
      ip: process.env.MEDIASOUP_LISTEN_IP || "127.0.0.1",
      announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
    },
  ],
  initialAvailableOutgoingBitrate: 1000000,
  maxSctpMessageSize: 262144,
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
}

export const MediasoupWebRtcTransportExtraOptions = {
  minimumAvailableOutgoingBitrate: 600000,
  maxIncomingBitrate: 1500000,
}

export class MediasoupWebRtcTransport {
  webRtcTransportToOptions = ({
    id,
    iceParameters,
    iceCandidates,
    dtlsParameters,
    sctpParameters,
  }: WebRtcTransport) => ({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters });

  createPeerWebRtcTransport = async (
    router: Router,
    peer: MediasoupPeer,
    type: MediasoupTransportType,
  ) => {
    if (peer.transports.has(type)) return peer.transports.get(type) as WebRtcTransport;
    const transport = await router.createWebRtcTransport({
      ...MediasoupWebRtcTransportOptions,
      enableSctp: Boolean(peer.sctpCapabilities),
      numSctpStreams: (peer.sctpCapabilities || {}).numStreams,
    });
    await transport.setMaxIncomingBitrate(MediasoupWebRtcTransportExtraOptions.maxIncomingBitrate);
    peer.transports.set(type, transport);
    return transport;
  }
}
