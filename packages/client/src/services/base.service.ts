import { Count, Filter, FilterExcludingWhere, Where } from "@loopback/repository";
import Axios, { AxiosInstance } from "axios";
import _ from 'lodash';

export const APIClient = Axios.create({
  baseURL: process.env.REACT_APP_API_BASE ? process.env.REACT_APP_API_BASE : 'http://localhost:3001'
});

export class ServiceBase<T extends {}, I> {
  constructor(
    public readonly uri: string,
    public readonly client: AxiosInstance = APIClient
  ) {
    this.client.interceptors.request.use(config => {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json'
      };
      config.headers.Authorization = localStorage.getItem('WEBBAIT_TOKEN') ? `Bearer ${localStorage.getItem('WEBBAIT_TOKEN')}` : '';
      return config;
    });
  }
  parseURI = (pathParams?: { [key: string]: I }) => {
    if (pathParams) {
      let newUri = this.uri;
      const matches = this.uri.matchAll(/(\{([0-9a-zA-Z.-_]*)\})/g);
      while (true) {
        const match = matches.next();
        if (match.done) break;
        newUri = _.replace(newUri, match.value[0], pathParams[match.value[2]] as any);
      };
      return newUri;
    }
    return this.uri;
  }
  create = async (data: T, pathParams?: { [key: string]: I }) => {
    return this.client.post<T>(this.parseURI(pathParams), data);
  }
  fetch = async (id: I, filter?: FilterExcludingWhere<T>, pathParams?: { [key: string]: I }) => {
    return this.client.get<T>(`${this.parseURI(pathParams)}/${id}?filter=${JSON.stringify(filter ? filter : {})}`)
  }
  fetchAll = async (filter?: Filter<T>, pathParams?: { [key: string]: I }) => {
    return this.client.get<T[]>(`${this.parseURI(pathParams)}?filter=${JSON.stringify(filter ? filter : {})}`);
  }
  delete = async (id: I, pathParams?: { [key: string]: I }) => {
    return this.client.delete<void>(`${this.parseURI(pathParams)}/${id}`);
  }
  bulkDelete = async (where?: Where<T>, pathParams?: { [key: string]: I }) => {
    return this.client.delete<Count>(`${this.parseURI(pathParams)}?where=${JSON.stringify(where ? where : {})}`);
  }
  update = async (id: I, data: T, pathParams?: { [key: string]: I }) => {
    return this.client.patch<T>(`${this.parseURI(pathParams)}/${id}`, data);
  }
  bulkUpdate = async (data: T, where?: Where<T>, pathParams?: { [key: string]: I }) => {
    return this.client.patch<Count>(`${this.parseURI(pathParams)}?where=${JSON.stringify(where ? where : {})}`, data);
  }
}
