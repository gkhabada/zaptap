import Axios from "axios";
import { user, updateToken } from "../helpers/authorization";

const instance = type => {
  const { token } = user;
  const dev = process.env.PROD_ENV === "development";
  let burl;
  if(dev){
    burl = 'https://api.dev.zaptap.ru/';
  } else {
    burl = 'https://api.zaptap.ru/';
  }

  return Axios.create({
    baseURL: burl,
    headers: {
      "x-zaptap-api-token": "Bearer " + token,
      "Content-Type": type
    },
    responseType: "json"
  });
};

/** @param {String} url */
export const post = async (url, body) => {
  const { expires_in, refresh } = user;
  const fiveDays = 432000000;

  if (expires_in - Date.now() < fiveDays) {
    await updateToken();
  }
  return instance("application/json").post(url, body || {});
};

export const upload = (url, body) => {
  return instance("multipart/form-data").post(url, body);
};

export default Axios;
