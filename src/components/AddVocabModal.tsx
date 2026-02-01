import React, { useEffect, useMemo, useState } from "react";
import { VocabQuickPayload } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: VocabQuickPayload) => Promise<void>;
};

export const AddVocabModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [term, setTerm] = useState("");
  const [languageCode, setLanguageCode] = useState<
    "EN" | "JA" | "VI" | "ZH"
  >("EN");
  const [scriptType, setScriptType] = useState<
    "LATIN" | "KANJI" | "KANA" | "ROMAJI" | "IPA" | "PINYIN"
  >("LATIN");
  const [meaningText, setMeaningText] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState<
    | "NOUN"
    | "VERB"
    | "ADJ"
    | "ADV"
    | "PRON"
    | "PREP"
    | "CONJ"
    | "INTERJ"
    | "OTHER"
    | ""
  >("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [note, setNote] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isDetail, setIsDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    if (!term.trim()) {
      setError("Vui lòng nhập từ vựng.");
      return;
    }
    if (!languageCode || !scriptType) {
      setError("Vui lòng chọn đủ ngôn ngữ và hệ chữ.");
      return;
    }
    if (meaningText.trim() && !partOfSpeech) {
      setError("Nếu có nghĩa thì phải chọn loại từ.");
      return;
    }
    const sortValue = sortOrder.trim() ? Number(sortOrder) : null;
    if (sortOrder.trim() && Number.isNaN(sortValue)) {
      setError("Thứ tự phải là số.");
      return;
    }
    const payload: VocabQuickPayload = {
      term: term.trim(),
      language_code: languageCode,
      script_type: scriptType,
      meaning_text: meaningText.trim() ? meaningText.trim() : null,
      part_of_speech: partOfSpeech || null,
      example_sentence: exampleSentence.trim() ? exampleSentence.trim() : null,
      example_translation: exampleTranslation.trim()
        ? exampleTranslation.trim()
        : null,
      note: note.trim() ? note.trim() : null,
      sort_order: sortValue === null ? null : sortValue,
    };
    await onSave(payload);
    setTerm("");
    setMeaningText("");
    setPartOfSpeech("");
    setExampleSentence("");
    setExampleTranslation("");
    setNote("");
    setSortOrder("");
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
            <label htmlFor="language_code">Ngôn ngữ</label>
            <select
              id="language_code"
              value={languageCode}
              onChange={(event) =>
                setLanguageCode(event.target.value as "EN" | "JA" | "VI" | "ZH")
              }
            >
              <option value="EN">EN</option>
              <option value="JA">JA</option>
              <option value="VI">VI</option>
              <option value="ZH">ZH</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="script_type">Hệ chữ</label>
            <select
              id="script_type"
              value={scriptType}
              onChange={(event) =>
                setScriptType(
                  event.target.value as
                    | "LATIN"
                    | "KANJI"
                    | "KANA"
                    | "ROMAJI"
                    | "IPA"
                    | "PINYIN"
                )
              }
            >
              <option value="LATIN">LATIN</option>
              <option value="KANJI">KANJI</option>
              <option value="KANA">KANA</option>
              <option value="ROMAJI">ROMAJI</option>
              <option value="IPA">IPA</option>
              <option value="PINYIN">PINYIN</option>
            </select>
          </div>

          {isDetail && (
            <>
              <div className="field">
                <label htmlFor="meaning_text">Nghĩa</label>
                <input
                  id="meaning_text"
                  value={meaningText}
                  onChange={(event) => setMeaningText(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="part_of_speech">Loại từ</label>
                <select
                  id="part_of_speech"
                  value={partOfSpeech}
                  onChange={(event) =>
                    setPartOfSpeech(
                      event.target.value as
                        | "NOUN"
                        | "VERB"
                        | "ADJ"
                        | "ADV"
                        | "PRON"
                        | "PREP"
                        | "CONJ"
                        | "INTERJ"
                        | "OTHER"
                        | ""
                    )
                  }
                >
                  <option value="">Chọn</option>
                  <option value="NOUN">NOUN</option>
                  <option value="VERB">VERB</option>
                  <option value="ADJ">ADJ</option>
                  <option value="ADV">ADV</option>
                  <option value="PRON">PRON</option>
                  <option value="PREP">PREP</option>
                  <option value="CONJ">CONJ</option>
                  <option value="INTERJ">INTERJ</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="example_sentence">Ví dụ</label>
                <input
                  id="example_sentence"
                  value={exampleSentence}
                  onChange={(event) => setExampleSentence(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="example_translation">Dịch ví dụ</label>
                <input
                  id="example_translation"
                  value={exampleTranslation}
                  onChange={(event) => setExampleTranslation(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="note">Ghi chú</label>
                <input
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="sort_order">Thứ tự</label>
                <input
                  id="sort_order"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  inputMode="numeric"
                />
              </div>
            </>
          )}

          {error && <div className="list-meta">{error}</div>}

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
