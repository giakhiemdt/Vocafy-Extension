import React from "react";
import { VocabItem as VocabItemType } from "../types";
import { VocabItem } from "./VocabItem";

type Props = {
  items: VocabItemType[];
  onItemClick: (item: VocabItemType) => void;
  onLoadMore: () => void;
  showLoadMore: boolean;
};

export const VocabList: React.FC<Props> = ({ items, onItemClick, onLoadMore, showLoadMore }) => {
  return (
    <div className="list">
      {items.map((item) => (
        <VocabItem key={item.id} item={item} onClick={onItemClick} />
      ))}
      {showLoadMore && (
        <button className="load-more" type="button" onClick={onLoadMore}>
          Tải thêm
        </button>
      )}
    </div>
  );
};
