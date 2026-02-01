export const getLocal = (keys) => chrome.storage.local.get(keys);
export const setLocal = (data) => chrome.storage.local.set(data);
export const removeLocal = (keys) => chrome.storage.local.remove(keys);

export const loadAuthUser = async () => (await getLocal(["authUser"])).authUser || null;
export const loadAuthToken = async () => (await getLocal(["authToken"])).authToken || null;
export const loadAccessToken = async () =>
  (await getLocal(["accessToken"])).accessToken || null;

export const saveAuthToken = (token) => setLocal({ authToken: token });

export const saveTokens = (accessToken, refreshToken) =>
  setLocal({
    accessToken,
    refreshToken: refreshToken || "",
  });

export const saveAccessClaims = (claims) =>
  claims ? setLocal({ accessClaims: claims }) : Promise.resolve();

export const saveUser = async (user) => {
  if (!user) return;
  await setLocal({
    authUser: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    },
  });
};

export const clearAuthStorage = () =>
  removeLocal([
    "authUser",
    "authToken",
    "accessToken",
    "refreshToken",
    "accessClaims",
    "vocabularies",
  ]);

export const saveVocabularies = (payload) =>
  payload ? setLocal({ vocabularies: payload }) : Promise.resolve();
