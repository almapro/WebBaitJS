import _ from "lodash";
import { Worker } from "mediasoup/node/lib/types";
import os from 'os';
import * as mediasoup from "mediasoup";

export class MediasoupWorkers {
  private _workers: Worker[] = [];
  init = async () => {
    if (MediasoupWorkers.length > 0) return;
    await Promise.all(_.keys(os.cpus()).map(async () => {
      const worker = await mediasoup.createWorker({
        logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
      });
      this._workers.push(worker);
    }));
  }

  get = async () => {
    await this.init();
    const workerObject = this._workers[Math.floor(Math.random() * this._workers.length)];
    return workerObject;
  }
}
