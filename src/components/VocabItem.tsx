import React from "react";
import { VocabItem as VocabItemType } from "../types";

type Props = {
  item: VocabItemType;
  onClick: (item: VocabItemType) => void;
};

export const VocabItem: React.FC<Props> = ({ item, onClick }) => {
  const hasMeaning = Boolean(item.meaning);
  return (
    <div
      className={`list-item ${hasMeaning ? "" : "list-item--dim"}`}
      onClick={() => onClick(item)}
    >
      <div className="list-title">{item.term}</div>
      <div className="list-meta">
        {item.language} · {item.meaning || "chưa có nghĩa"}
      </div>
    </div>
  );
};
