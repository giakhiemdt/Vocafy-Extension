export const getLocal = (keys: string[]) => chrome.storage.local.get(keys);
export const setLocal = (data: Record<string, unknown>) => chrome.storage.local.set(data);
export const removeLocal = (keys: string[]) => chrome.storage.local.remove(keys);

export const loadAccessToken = async () => (await getLocal(["accessToken"])).accessToken as
  | string
  | null;

export const loadTheme = async () =>
  ((await getLocal(["theme"])).theme as "light" | "dark" | undefined) || null;

export const saveTheme = (theme: "light" | "dark") => setLocal({ theme });

export const saveTokens = (accessToken: string, refreshToken?: string) =>
  setLocal({ accessToken, refreshToken: refreshToken || "" });

export const clearAuthStorage = () =>
  removeLocal(["accessToken", "refreshToken", "authUser", "accessClaims"]);
