const BASE_URL = "https://vocafy.milize-lena.space/api";

export const exchangeFirebaseToken = async (idToken: string) => {
  const response = await fetch(`${BASE_URL}/auth/firebase`, {
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

  return payload as {
    result: { accessToken: string; refreshToken?: string };
  };
};

export const fetchRecentVocabularies = async (
  accessToken: string,
  page = 0,
  size = 10
) => {
  const response = await fetch(
    `${BASE_URL}/vocabularies/me?page=${page}&size=${size}`,
    {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    }
  );

  if (response.status === 401) {
    const errorText = await response.text();
    const error = new Error(`Recent vocab unauthorized: ${errorText}`);
    (error as Error & { code?: string }).code = "INVALID_TOKEN";
    throw error;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Recent vocab failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const createQuickVocabulary = async (accessToken: string, payload: unknown) => {
  const response = await fetch(`${BASE_URL}/vocabularies/quick`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    const errorText = await response.text();
    const error = new Error(`Quick vocab unauthorized: ${errorText}`);
    (error as Error & { code?: string }).code = "INVALID_TOKEN";
    throw error;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Quick vocab failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const updateQuickVocabulary = async (
  _accessToken: string,
  _id: string | number,
  _payload: unknown
) => {
  return Promise.resolve({ success: true });
};
