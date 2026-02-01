import React, { useEffect, useState } from "react";
import { VocabItem, VocabQuickEditPayload } from "../types";

type Props = {
  open: boolean;
  item: VocabItem | null;
  onClose: () => void;
  onSave: (id: string | number, payload: VocabQuickEditPayload) => Promise<void>;
};

export const QuickEditModal: React.FC<Props> = ({ open, item, onClose, onSave }) => {
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!item) return;
    setMeaning(item.meaning || "");
    setExample(item.example || "");
    setNote(item.note || "");
  }, [item]);

  if (!open || !item) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave(item.id, {
      meaning: meaning.trim() || null,
      example: example.trim() || null,
      note: note.trim() || null,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Chỉnh nhanh</div>
          <button className="secondary-btn" type="button" onClick={onClose}>
            Đóng
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nghĩa</label>
            <input value={meaning} onChange={(event) => setMeaning(event.target.value)} />
          </div>
          <div className="field">
            <label>Ví dụ</label>
            <textarea
              rows={2}
              value={example}
              onChange={(event) => setExample(event.target.value)}
            />
          </div>
          <div className="field">
            <label>Ghi chú</label>
            <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="primary-btn" type="submit">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
