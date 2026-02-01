import React from "react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export const QuickAddButton: React.FC<Props> = ({ onClick, disabled }) => {
  return (
    <button className="primary-btn" type="button" onClick={onClick} disabled={disabled}>
      + Thêm từ vựng
    </button>
  );
};
