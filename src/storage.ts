export const getLocal = (keys: string[]) => chrome.storage.local.get(keys);
export const setLocal = (data: Record<string, unknown>) => chrome.storage.local.set(data);
export const removeLocal = (keys: string[]) => chrome.storage.local.remove(keys);

export const loadAccessToken = async () => (await getLocal(["accessToken"])).accessToken as
  | string
  | null;

export const saveTokens = (accessToken: string, refreshToken?: string) =>
  setLocal({ accessToken, refreshToken: refreshToken || "" });

export const clearAuthStorage = () =>
  removeLocal(["accessToken", "refreshToken", "authUser", "accessClaims"]);
