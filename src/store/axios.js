import axios from "axios";
import videojs from "video.js";
import store from "@/store";

const API_URL = "/proxy/https://f1tv.formula1.com/";

const options = { baseURL: API_URL };

options.baseURL = API_URL;

videojs.Vhs.xhr.beforeRequest = options => {
  options.headers = {
    ...options.headers
  };
  return options;
};

const http = axios.create(options);

const production = process.env.VUE_APP_NODE_ENV === "production";

http.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    if (err.response) {
      return Promise.reject(err.response);
    } else if (err.request && !production) {
      console.error(err.request);
    } else {
      console.error("Error", err);
    }

    if (!production) {
      console.error(err.config);
    }

    return Promise.reject(err);
  }
);

http.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    const originalRequest = err.config;

    if (err.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        return http(originalRequest);
      } else {
        store.commit("logout");
      }
    }

    return Promise.reject(err.data);
  }
);

export default http;