import React, { useEffect, useMemo, useState } from "react";
import { VocabQuickPayload } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: VocabQuickPayload) => Promise<void>;
};

export const AddVocabModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [isDetail, setIsDetail] = useState(false);
  const canSave = useMemo(() => term.trim().length > 0, [term]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      const input = document.getElementById("quick-term") as HTMLInputElement | null;
      input?.focus();
    }, 0);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: VocabQuickPayload = {
      term: term.trim(),
      meaning: meaning.trim() ? meaning.trim() : null,
      source: "extension",
    };
    await onSave(payload);
    setTerm("");
    setMeaning("");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Lưu nhanh từ vựng</div>
          <button className="secondary-btn" type="button" onClick={onClose}>
            Đóng
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="quick-term">Từ vựng</label>
            <input
              id="quick-term"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Ví dụ: disconnect"
            />
          </div>
          <div className="field">
            <label htmlFor="quick-meaning">Nghĩa (tuỳ chọn)</label>
            <input
              id="quick-meaning"
              value={meaning}
              onChange={(event) => setMeaning(event.target.value)}
              placeholder="Ví dụ: ngắt kết nối"
            />
          </div>

          {isDetail && (
            <div className="field">
              <label>Chi tiết</label>
              <div className="list-meta">
                Quick mode chỉ yêu cầu từ vựng và nghĩa. Chi tiết sẽ chỉnh trong Web/App.
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="primary-btn" type="submit" disabled={!canSave}>
              Lưu nhanh
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={() => setIsDetail((prev) => !prev)}
            >
              Chi tiết {isDetail ? "▴" : "▾"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
