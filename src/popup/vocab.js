import { loadVocabularies, saveVocabDraft } from "./storage.js";

const requiredMessage = "Vui lòng nhập đầy đủ các trường bắt buộc.";

const normalize = (value) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
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
  sort_order: null,
});

const renderList = (listEl, emptyEl, payload) => {
  if (!listEl || !emptyEl) return;
  const items = payload?.result?.content || [];
  listEl.innerHTML = "";
  if (!items.length) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  items.forEach((item) => {
    const term = item.terms?.[0]?.text_value || "—";
    const meaning = item.meanings?.[0]?.meaning_text || "Chưa có nghĩa";
    const language = item.terms?.[0]?.language_code || "";
    const wrapper = document.createElement("div");
    wrapper.className = "vocab-item";
    wrapper.innerHTML = `
      <div class="vocab-term">${term}</div>
      <div class="vocab-meta">${language} · ${meaning}</div>
    `;
    listEl.appendChild(wrapper);
  });
};

export const initVocabList = async ({ listEl, emptyEl }) => {
  if (!listEl || !emptyEl) return;
  const cached = await loadVocabularies();
  renderList(listEl, emptyEl, cached);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.vocabularies) {
      renderList(listEl, emptyEl, changes.vocabularies.newValue);
    }
  });
};

export const initVocabForm = ({
  formEl,
  toggleBtn,
  closeBtn,
  listEl,
  emptyEl,
  status,
}) => {
  if (!formEl || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    formEl.removeAttribute("hidden");
    if (listEl) listEl.hidden = true;
    if (emptyEl) emptyEl.hidden = true;
    toggleBtn.hidden = true;
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (listEl && emptyEl) {
        emptyEl.hidden = listEl.children.length > 0;
      }
      formEl.setAttribute("hidden", "true");
      if (listEl) listEl.hidden = false;
      toggleBtn.hidden = false;
    });
  }

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
      sort_order: null,
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
