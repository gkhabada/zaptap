import Axios from "axios";
import {post} from '../api/request';
import Cookies from 'js-cookie';

export const user = {
  data: null,
  token: null,
  refresh: null,
  expires_in: null,
  is_buyer: null,
  is_seller: null,
  rolesLoaded: false,
};

export const dev = process.env.PROD_ENV === "development";

export const isLocalhost = location.href.indexOf('localhost') !== -1;

export const redirectIfUnauthorized = () => {
  const isAuthorized = !!user.token;
  console.log(user.token);
  console.log(isAuthorized);
  if(!isAuthorized && !isLocalhost) {
    return 'redirect';
    // let dev = (location.href.indexOf('dev') !== -1) ? 'dev.' : '';
    // location.href = '//' + dev + 'zaptap.ru';
  }
};

const instance = token => {
  return Axios.create({
    baseURL: `https://api.${dev ? "dev." : ""}zaptap.ru/`,
    headers: {
      "x-zaptap-api-token": "Bearer " + token,
      "Content-Type": "application/json"
    },
    responseType: "json"
  });
};

const storage = {
  getItem(name) {
    return Cookies.get(name);
  },
  setItem(name, value) {
    // фикс для работы на локалхосте
    let localhost = location.href.indexOf('localhost') !== -1;
    let domain = localhost ? '' : `.${process.env.PROD_ENV === "development" ? "dev." : ""}zaptap.ru`;

    Cookies.set(name, value, {expires: 31, path: '', domain: domain });
  },
  removeItem(name) {
    this.setItem(name, '');
  },
};

const init = function() {
  user.token = storage.getItem("Authorization") || null;
  user.refresh = storage.getItem("refresh") || null;
  user.expires_in = +storage.getItem("expires_in") || null;
  user.is_buyer = localStorage.getItem("is_buyer") === 'true';
  user.is_seller = localStorage.getItem("is_seller") === 'true';
  user.rolesLoaded = localStorage.getItem("rolesLoaded") === 'true';
};

function setToken(t) {
  const { token, refresh, expires_in } = t || {};
  if (token) {
    user.token = token;
    user.refresh = refresh;
    user.expires_in = expires_in;
    storage.setItem("Authorization", token);
    storage.setItem("refresh", refresh);
    storage.setItem("expires_in", expires_in);
  } else {
    user.token = null;
    user.refresh = null;
    user.expires_in = null;
    user.data = null;
    storage.removeItem("Authorization");
    storage.removeItem("refresh");
    storage.removeItem("expires_in");
  }
}

export async function updateToken() {
  return await login({ token: user.token });
}

function processUserData(data) {

  const { user: userData, refresh_token, expires_in, token: tokenData } = data;
  user.data = userData;
  localStorage.setItem('user', JSON.stringify(userData));
  setToken({
    refresh: refresh_token,
    expires_in,
    token: tokenData
  });
}

export async function register(credentials) {
  const { email, password } = credentials || {};
  const req = instance(user.token);
  if (email && password) {
    const { err } = await req
      .post("/user/register", { email, password })
      .then(() => ({ err: null }))
      .catch(err => ({ err }));
    if (err) throw err;
    return err;
  } else {
    throw new Error();
  }
}

export async function userRoles() {
  let { data } = await post("/user/get-roles")
    .catch(err => ({ data: null }));

  if(data) {
    user.is_buyer = data.is_buyer;
    user.is_seller = data.is_seller;
    user.rolesLoaded = true;

    localStorage.setItem("is_buyer", data.is_buyer);
    localStorage.setItem("is_seller", data.is_seller);
    localStorage.setItem("rolesLoaded", 'true');
  }
}

export async function login(credentials, customToken) {
  const { email, password } = credentials || {};
  const req = instance(customToken || user.token);
  if (email && password) {
    const { data } = await req
      .post("/user/auth-email", { email, password })
      .catch(err => ({ data: null }));
    if (!data) {
      logout();
      throw new Error();
    }
    processUserData(data);

    await userRoles();

    return data.user;
  } else if (credentials.refresh && (customToken || user.token)) {
    const { data } = await req
      .post("/user/auth-token", {
        refresh_token: credentials.refresh
      })
      .catch(err => {
        console.log(err);
        return { data: null };
      });
    if (!data) return logout();
    processUserData(data);

    await userRoles();

    return data.user;
  } else {
    logout();
  }
}

export async function logout() {
  setToken(null);
  storage.removeItem('Authorization');
  storage.removeItem('refresh');
  storage.removeItem('expires_in');
  Object.keys(localStorage).forEach(k => localStorage.removeItem(k));
  return user;
}

init();
