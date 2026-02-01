import React from "react";

type Props = {
  onLogout: () => void;
};

export const Header: React.FC<Props> = ({ onLogout }) => {
  return (
    <header className="header">
      <div className="brand">
        <img src="icons/logoFull.png" alt="Vocafy" />
      </div>
      <div className="header-actions">
        <button className="icon-button" type="button" aria-label="Đồng bộ">
          <span>⟳</span>
        </button>
        <button className="icon-button" type="button" aria-label="Cài đặt">
          <span>⚙</span>
        </button>
        <button className="icon-button logout" type="button" aria-label="Đăng xuất" onClick={onLogout}>
          <span className="logout-icon" aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
};
