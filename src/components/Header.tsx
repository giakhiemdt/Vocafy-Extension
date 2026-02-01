import React from "react";

type Props = {
  onLogout: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export const Header: React.FC<Props> = ({ onLogout, theme, onToggleTheme }) => {
  return (
    <header className="header">
      <div className="brand">
        <img src="icons/logoFull.png" alt="Vocafy" />
      </div>
      <div className="header-actions">
        <button
          className="icon-button theme"
          type="button"
          aria-label="Đổi giao diện"
          onClick={onToggleTheme}
        >
          <span
            className={`theme-icon ${theme === "dark" ? "moon" : "sun"}`}
            aria-hidden="true"
          ></span>
        </button>
        <button
          className="icon-button logout"
          type="button"
          aria-label="Đăng xuất"
          onClick={onLogout}
        >
          <span className="logout-icon" aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
};
