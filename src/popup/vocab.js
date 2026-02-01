import { saveVocabDraft } from "./storage.js";

const requiredMessage = "Vui lòng nhập đầy đủ các trường bắt buộc.";

const normalize = (value) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const toNumberOrNull = (value) => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildPayload = (values) => ({
  term: values.term,
  language_code: values.language_code,
  script_type: values.script_type,
  meaning_text: values.meaning_text,
  part_of_speech: values.part_of_speech,
  example_sentence: values.example_sentence,
  example_translation: values.example_translation,
  note: values.note,
  sort_order: values.sort_order,
});

export const initVocabForm = ({ formEl, toggleBtn, status }) => {
  if (!formEl || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    if (formEl.hasAttribute("hidden")) {
      formEl.removeAttribute("hidden");
    }
  });

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const values = {
      term: normalize(formEl.term?.value || ""),
      language_code: normalize(formEl.language_code?.value || ""),
      script_type: normalize(formEl.script_type?.value || ""),
      meaning_text: normalize(formEl.meaning_text?.value || ""),
      part_of_speech: normalize(formEl.part_of_speech?.value || ""),
      example_sentence: normalize(formEl.example_sentence?.value || ""),
      example_translation: normalize(formEl.example_translation?.value || ""),
      note: normalize(formEl.note?.value || ""),
      sort_order: toNumberOrNull(formEl.sort_order?.value || ""),
    };

    if (!values.term || !values.language_code || !values.script_type) {
      status.setStatus(requiredMessage, "error");
      return;
    }

    if (values.meaning_text && !values.part_of_speech) {
      status.setStatus("Nếu có nghĩa thì phải chọn loại từ.", "error");
      return;
    }

    const payload = buildPayload(values);
    await saveVocabDraft(payload);
    status.setStatus("Đã lưu dữ liệu từ vựng để gửi.", "ok");
  });
};
