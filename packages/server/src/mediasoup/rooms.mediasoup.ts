import _ from "lodash";
import { Router, Worker, RtpCodecCapability } from "mediasoup/node/lib/types";
import { MediasoupPeer } from "./rooms";

export const MediasoupRouterMediaCodec: RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters:
    {
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/VP9',
    clockRate: 90000,
    parameters:
    {
      'profile-id': 2,
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters:
    {
      'packetization-mode': 1,
      'profile-level-id': '4d0032',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters:
    {
      'packetization-mode': 1,
      'profile-level-id': '42e01f',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000
    }
  }
]

export type MediasoupRoom = {
  peers: Map<string, MediasoupPeer>;
  worker: Worker;
  router: Router;
}

export class MediasoupRooms {
  private _rooms: Map<string, MediasoupRoom> = new Map();

  create = async (id: string, worker: Worker) => {
    const router = await worker.createRouter({ mediaCodecs: MediasoupRouterMediaCodec });
    const room: MediasoupRoom = {
      worker,
      router,
      peers: new Map(),
    }
    this._rooms.set(id, room);
    return room;
  }

  get = (id: string) => this._rooms.get(id);

  destroy = (id: string) => this._rooms.delete(id);
}

