import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
} from "firebase/auth/web-extension";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

console.log("Popup script loaded");

const loginBtn = document.getElementById("google-login");
const signOutBtn = document.getElementById("sign-out");
const statusEl = document.getElementById("status");
const tokenEl = document.getElementById("token");
const themeToggle = document.getElementById("theme-toggle");
let cachedToken = null;

chrome.storage.local.get(["authToken"]).then((result) => {
  cachedToken = result.authToken || null;
});

const getPreferredTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const updateThemeToggleLabel = (theme) => {
  if (!themeToggle) return;
  themeToggle.textContent = theme === "dark" ? "🌙" : "☀";
};

const applyTheme = async (theme, persist = true) => {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeToggleLabel(theme);
  if (persist) {
    await chrome.storage.local.set({ theme });
  }
};

chrome.storage.local.get(["theme"]).then((result) => {
  const theme = result.theme || getPreferredTheme();
  applyTheme(theme, false);
});

if (themeToggle) {
  themeToggle.addEventListener("click", async () => {
    const current =
      document.documentElement.getAttribute("data-theme") || getPreferredTheme();
    const next = current === "dark" ? "light" : "dark";
    await applyTheme(next, true);
  });
}

const setStatus = (message, type) => {
  statusEl.textContent = message;
  statusEl.classList.remove("error", "ok");
  if (type) statusEl.classList.add(type);
};

const setToken = (token) => {
  if (!tokenEl) return;
  tokenEl.textContent = token ? `ID Token: ${token}` : "";
};

const exchangeFirebaseToken = async (idToken) => {
  const response = await fetch("https://vocafy.milize-lena.space/api/auth/firebase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: idToken,
      fcm_token: null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Auth API failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  if (!payload?.success || !payload?.result?.accessToken) {
    throw new Error("Auth API response invalid.");
  }

  await chrome.storage.local.set({
    accessToken: payload.result.accessToken,
    refreshToken: payload.result.refreshToken || "",
  });

  return payload;
};

const saveUser = async (user) => {
  if (!user) {
    await chrome.storage.local.remove([
      "authUser",
      "authToken",
      "accessToken",
      "refreshToken",
    ]);
    setToken("");
    return;
  }
  await chrome.storage.local.set({
    authUser: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    },
  });
};

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

const clearCachedToken = async () => {
  if (!cachedToken) return;
  chrome.identity.removeCachedAuthToken({ token: cachedToken }, () => {
    cachedToken = null;
  });
};

loginBtn.addEventListener("click", async () => {
  try {
    setStatus("Đang đăng nhập với Google...", null);
    const accessToken = await getChromeAuthToken();
    cachedToken = accessToken;
    await chrome.storage.local.set({ authToken: accessToken });
    const credential = GoogleAuthProvider.credential(null, accessToken);
    const result = await signInWithCredential(auth, credential);
    const idToken = await result.user.getIdToken();
    await exchangeFirebaseToken(idToken);
    setStatus(`Xin chào, ${result.user.displayName || result.user.email}!`, "ok");
    await saveUser(result.user);
  } catch (error) {
    const code = error?.code || "";
    const messageMap = {
      "auth/popup-closed-by-user": "Bạn đã đóng cửa sổ đăng nhập.",
      "auth/cancelled-popup-request": "Đang có phiên đăng nhập khác.",
      "auth/network-request-failed": "Lỗi mạng. Vui lòng thử lại.",
      "auth/unauthorized-domain": "Domain chưa được cho phép trong Firebase.",
      "auth/invalid-credential": "Token không hợp lệ. Vui lòng thử lại.",
    };
    setStatus(
      messageMap[code] || "Đăng nhập thất bại. Vui lòng thử lại.",
      "error"
    );
    console.error("Firebase Google login error:", error);
  }
});

signOutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    await clearCachedToken();
    await saveUser(null);
    setStatus("Đã đăng xuất.", null);
  } catch (error) {
    setStatus("Không thể đăng xuất. Vui lòng thử lại.", "error");
    console.error("Firebase sign out error:", error);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    setStatus("Chưa đăng nhập.", null);
    setToken("");
    return;
  }
  await saveUser(user);
  const idToken = await user.getIdToken();
  try {
    await exchangeFirebaseToken(idToken);
    setStatus(`Xin chào, ${user.displayName || user.email}!`, "ok");
  } catch (error) {
    console.error("Firebase token exchange error:", error);
    setStatus("Không thể xác thực với server.", "error");
  }
});
