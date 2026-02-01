export type VocabItem = {
  id: number | string;
  term: string;
  language: string;
  meaning: string | null;
  example?: string | null;
  note?: string | null;
};

export type VocabQuickPayload = {
  term: string;
  language_code: "EN" | "JA" | "VI" | "ZH";
  script_type: "LATIN" | "KANJI" | "KANA" | "ROMAJI" | "IPA" | "PINYIN";
  meaning_text: string | null;
  part_of_speech:
    | "NOUN"
    | "VERB"
    | "ADJ"
    | "ADV"
    | "PRON"
    | "PREP"
    | "CONJ"
    | "INTERJ"
    | "OTHER"
    | null;
  example_sentence: string | null;
  example_translation: string | null;
  note: string | null;
  sort_order: number | null;
};

export type VocabQuickEditPayload = {
  meaning?: string | null;
  example?: string | null;
  note?: string | null;
};
