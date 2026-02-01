import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth/web-extension";

import { exchangeFirebaseToken } from "./api";
import { clearAuthStorage, loadAccessToken, saveTokens } from "./storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const getChromeAuthToken = () =>
  new Promise<string>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(
          new Error(chrome.runtime.lastError?.message || "Không lấy được token.")
        );
        return;
      }
      resolve(token);
    });
  });

export const ensureAccessToken = async () => {
  const cached = await loadAccessToken();
  if (cached) return cached;

  const accessToken = await getChromeAuthToken();
  const credential = GoogleAuthProvider.credential(null, accessToken);
  const result = await signInWithCredential(auth, credential);
  const idToken = await result.user.getIdToken();
  const exchangePayload = await exchangeFirebaseToken(idToken);
  await saveTokens(exchangePayload.result.accessToken, exchangePayload.result.refreshToken);
  return exchangePayload.result.accessToken;
};

export const forceLogout = async () => {
  await clearAuthStorage();
};
