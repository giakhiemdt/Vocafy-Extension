import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="brand">
        <img src="icons/logoFull.png" alt="Vocafy" />
        <span>Vocafy</span>
      </div>
      <div className="header-actions">
        <button className="icon-button" type="button" aria-label="Đồng bộ">
          <span>⟳</span>
        </button>
        <button className="icon-button" type="button" aria-label="Cài đặt">
          <span>⚙</span>
        </button>
      </div>
    </header>
  );
};
