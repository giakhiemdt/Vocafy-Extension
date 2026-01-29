export const exchangeFirebaseToken = async (idToken) => {
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

  return payload;
};
