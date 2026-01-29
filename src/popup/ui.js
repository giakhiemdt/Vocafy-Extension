const getDisplayName = (user) => user?.displayName || user?.email || "bạn";

export const createUI = ({
  loginBtn,
  signOutBtn,
  statusEl,
  tokenEl,
  marketingEl,
  greetingEl,
}) => {
  const setStatus = (message, type) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove("error", "ok");
    if (type) statusEl.classList.add(type);
  };

  const setToken = (token) => {
    if (!tokenEl) return;
    tokenEl.textContent = token ? `ID Token: ${token}` : "";
  };

  const setGreeting = (user) => {
    if (!greetingEl) return;
    if (!user) {
      greetingEl.textContent = "";
      greetingEl.hidden = true;
      return;
    }
    greetingEl.textContent = `Xin chào, ${getDisplayName(user)}`;
    greetingEl.hidden = false;
  };

  const updateAuthUi = (user) => {
    if (signOutBtn) signOutBtn.hidden = !user;
    if (loginBtn) loginBtn.hidden = !!user;
    if (marketingEl) marketingEl.hidden = !!user;
  };

  const setAuthState = (user) => {
    document.body.classList.remove("auth-loading", "auth-in", "auth-out");
    document.body.classList.add(user ? "auth-in" : "auth-out");
    updateAuthUi(user);
    setGreeting(user);
  };

  return {
    setStatus,
    setToken,
    setAuthState,
  };
};
