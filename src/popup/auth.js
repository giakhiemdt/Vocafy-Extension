import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth/web-extension";

import { exchangeFirebaseToken, fetchMyVocabularies } from "./api.js";
import { decodeJwtPayload } from "./jwt.js";
import {
  clearAuthStorage,
  loadAccessToken,
  loadAuthToken,
  loadAuthUser,
  saveAccessClaims,
  saveAuthToken,
  saveTokens,
  saveUser,
  saveVocabularies,
} from "./storage.js";

const getChromeAuthToken = () =>
  new Promise((resolve, reject) => {
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

export const initAuth = async ({ auth, ui, loginBtn, signOutBtn }) => {
  const provider = new GoogleAuthProvider();
  let cachedToken = await loadAuthToken();

  const clearCachedToken = async () => {
    if (!cachedToken) return;
    chrome.identity.removeCachedAuthToken({ token: cachedToken }, () => {
      cachedToken = null;
    });
  };

  const applyAccessPayload = async (payload) => {
    const accessToken = payload?.result?.accessToken;
    const refreshToken = payload?.result?.refreshToken;
    await saveTokens(accessToken, refreshToken);
    const claims = decodeJwtPayload(accessToken);
    await saveAccessClaims(claims);
    return accessToken;
  };

  const syncVocabularies = async (accessToken) => {
    if (!accessToken) return;
    const vocabPayload = await fetchMyVocabularies(accessToken, 0, 10);
    await saveVocabularies(vocabPayload);
  };

  const cachedUser = await loadAuthUser();
  ui.setAuthState(cachedUser);
  if (cachedUser) {
    const cachedAccessToken = await loadAccessToken();
    await syncVocabularies(cachedAccessToken);
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      try {
        ui.setStatus("Đang đăng nhập với Google...", null);
        const accessToken = await getChromeAuthToken();
        cachedToken = accessToken;
        await saveAuthToken(accessToken);
        const credential = GoogleAuthProvider.credential(null, accessToken);
        const result = await signInWithCredential(auth, credential);
        const idToken = await result.user.getIdToken();
        const exchangePayload = await exchangeFirebaseToken(idToken);
        const backendAccessToken = await applyAccessPayload(exchangePayload);
        await syncVocabularies(backendAccessToken);
        await saveUser(result.user);
        ui.setStatus("", null);
        ui.setAuthState(result.user);
      } catch (error) {
        const code = error?.code || "";
        const messageMap = {
          "auth/popup-closed-by-user": "Bạn đã đóng cửa sổ đăng nhập.",
          "auth/cancelled-popup-request": "Đang có phiên đăng nhập khác.",
          "auth/network-request-failed": "Lỗi mạng. Vui lòng thử lại.",
          "auth/unauthorized-domain": "Domain chưa được cho phép trong Firebase.",
          "auth/invalid-credential": "Token không hợp lệ. Vui lòng thử lại.",
        };
        ui.setStatus(
          messageMap[code] || "Đăng nhập thất bại. Vui lòng thử lại.",
          "error"
        );
        console.error("Firebase Google login error:", error);
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        await clearCachedToken();
        await clearAuthStorage();
        ui.setToken("");
        ui.setAuthState(null);
        ui.setStatus("Đã đăng xuất.", null);
      } catch (error) {
        ui.setStatus("Không thể đăng xuất. Vui lòng thử lại.", "error");
        console.error("Firebase sign out error:", error);
      }
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      ui.setStatus("", null);
      ui.setToken("");
      ui.setAuthState(null);
      return;
    }
    ui.setAuthState(user);
    await saveUser(user);
    const idToken = await user.getIdToken();
    try {
      const exchangePayload = await exchangeFirebaseToken(idToken);
      const backendAccessToken = await applyAccessPayload(exchangePayload);
      await syncVocabularies(backendAccessToken);
      ui.setStatus("", null);
    } catch (error) {
      console.error("Firebase token exchange error:", error);
      ui.setStatus("Không thể xác thực với server.", "error");
    }
  });
};
