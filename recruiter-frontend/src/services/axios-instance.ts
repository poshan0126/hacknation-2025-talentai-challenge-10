import axios, { AxiosInstance } from 'axios';

export const BASE = 'http://localhost:8000/';
export const baseURL = BASE + 'api/';
export const WS_URL = BASE + 'ws/';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
});

export default axiosInstance;
