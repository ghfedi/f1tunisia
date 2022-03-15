import axios from "axios";
import videojs from "video.js";
import store from "@/store";

const CORS_PROXY = "";
const API_URL = "https://f1tv.formula1.com";

const options = { baseURL: API_URL };

if (process.env.VUE_APP_NETLIFY) {
  const keyHeaders = {
    "x-cors-grida-api-key": process.env.VUE_APP_API_KEY
  };

  options.baseURL = CORS_PROXY + API_URL;
  options.headers = {
    common: { ...keyHeaders }
  };

  videojs.Vhs.xhr.beforeRequest = options => {
    options.headers = {
      ...keyHeaders,
      ...options.headers
    };

    return options;
  };
} else if (!process.env.IS_ELECTRON) {
  options.baseURL = "/proxy/" + API_URL;
}

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