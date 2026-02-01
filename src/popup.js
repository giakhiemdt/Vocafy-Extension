import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension";

import { initAuth } from "./popup/auth.js";
import { initTheme } from "./popup/theme.js";
import { createUI } from "./popup/ui.js";
import { initVocabForm, initVocabList } from "./popup/vocab.js";

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
const vocabSection = document.getElementById("vocab-section");
const vocabForm = document.getElementById("vocab-form");
const vocabToggle = document.getElementById("add-vocab-toggle");
const vocabList = document.getElementById("vocab-list");
const vocabEmpty = document.getElementById("vocab-empty");
const vocabClose = document.getElementById("close-vocab-form");

const ui = createUI({
  loginBtn,
  signOutBtn,
  statusEl,
  tokenEl,
  marketingEl,
  greetingEl,
  vocabSection,
});

initTheme(themeToggle, themeIcon);
initAuth({ auth, ui, loginBtn, signOutBtn });
initVocabList({ listEl: vocabList, emptyEl: vocabEmpty });
initVocabForm({
  formEl: vocabForm,
  toggleBtn: vocabToggle,
  closeBtn: vocabClose,
  listEl: vocabList,
  emptyEl: vocabEmpty,
  status: ui,
});
