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
  meaning?: string | null;
  source: "extension";
};

export type VocabQuickEditPayload = {
  meaning?: string | null;
  example?: string | null;
  note?: string | null;
};
