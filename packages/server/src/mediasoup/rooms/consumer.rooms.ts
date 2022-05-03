import _ from "lodash";
import { Consumer, ConsumerType, RtpParameters } from "mediasoup/node/lib/types";
import { MediasoupRoom } from "../rooms.mediasoup";
import { MediasoupPeer } from "./peers.rooms";
import { MediasoupProducerType } from "./transport.rooms";

export type MediasoupConsumer = {
  id: string;
  consumer: Consumer;
  consumerParameters: {
    producerId: string;
    id: string;
    kind: string;
    rtpParameters: RtpParameters;
    type: ConsumerType;
    producerPaused: boolean;
  }
}

export class MediasoupConsumers {
  getPeerConsumer = (peer: MediasoupPeer, consumerId: string) => peer.consumers.get(consumerId);

  getPeerConsumers = (peer: MediasoupPeer) => peer.consumers;

  createPeerConsumer = async (room: MediasoupRoom, peer: MediasoupPeer, type: MediasoupProducerType, consumer: MediasoupPeer) => {
    const transport = consumer.transports.get('RECEIVE');
    if (!transport) return undefined;
    const producer = peer.producers.get(type);
    if (!producer) return undefined;
    if (!room.router.canConsume({ producerId: producer.id, rtpCapabilities: consumer.rtpCapabilities })) return;
    const transportConsumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities: consumer.rtpCapabilities,
      paused: true,
    });
    const consumerObj: MediasoupConsumer = {
      id: consumer.id,
      consumer: transportConsumer,
      consumerParameters: {
        producerId: producer.id,
        id: transportConsumer.id,
        kind: transportConsumer.kind,
        rtpParameters: transportConsumer.rtpParameters,
        type: transportConsumer.type,
        producerPaused: transportConsumer.producerPaused,
      },
    }
    peer.consumers.set(`${consumer.id}:${type}`, consumerObj);
    return consumerObj;
  }

  removePeerConsumer = (peer: MediasoupPeer, consumer: MediasoupPeer, type: MediasoupProducerType) => {
    peer.consumers.get(`${consumer.id}:${type}`)?.consumer.close();
    return peer.consumers.delete(`${consumer.id}${type}`);
  }
}
