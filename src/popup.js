import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension";

import { initAuth } from "./popup/auth.js";
import { initTheme } from "./popup/theme.js";
import { createUI } from "./popup/ui.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginBtn = document.getElementById("google-login");
const signOutBtn = document.getElementById("sign-out");
const statusEl = document.getElementById("status");
const tokenEl = document.getElementById("token");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const marketingEl = document.getElementById("marketing");
const greetingEl = document.getElementById("greeting");

const ui = createUI({
  loginBtn,
  signOutBtn,
  statusEl,
  tokenEl,
  marketingEl,
  greetingEl,
});

initTheme(themeToggle, themeIcon);
initAuth({ auth, ui, loginBtn, signOutBtn });
