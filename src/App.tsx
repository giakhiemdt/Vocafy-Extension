import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { QuickAddButton } from "./components/QuickAddButton";
import { AddVocabModal } from "./components/AddVocabModal";
import { VocabList } from "./components/VocabList";
import { QuickEditModal } from "./components/QuickEditModal";
import { createQuickVocabulary, fetchRecentVocabularies, updateQuickVocabulary } from "./api";
import { ensureAccessToken, forceLogout } from "./auth";
import { VocabItem, VocabQuickPayload, VocabQuickEditPayload } from "./types";
import { loadAccessToken } from "./storage";

const mapRecent = (raw: any[]): VocabItem[] =>
  raw.map((item, idx) => ({
    id: item.id ?? idx,
    term: item.term ?? item.terms?.[0]?.text_value ?? "",
    language: item.language ?? item.terms?.[0]?.language_code ?? "EN",
    meaning: item.meaning ?? item.meanings?.[0]?.meaning_text ?? null,
    example: item.example ?? null,
    note: item.note ?? null,
  }));

export const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [items, setItems] = useState<VocabItem[]>([]);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<VocabItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((message: string, type?: "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const loadRecent = useCallback(
    async (token: string, newLimit = limit) => {
      try {
        const payload = await fetchRecentVocabularies(token, newLimit);
        const content = payload?.result?.content || payload?.content || [];
        setItems(mapRecent(content));
      } catch (error: any) {
        if (error?.code === "INVALID_TOKEN") {
          await forceLogout();
          setAccessToken(null);
          setItems([]);
          showToast("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", "error");
        }
      }
    },
    [limit, showToast]
  );

  useEffect(() => {
    const init = async () => {
      const cached = await loadAccessToken();
      if (cached) {
        setAccessToken(cached);
        await loadRecent(cached, limit);
      }
      setLoading(false);
    };
    void init();
  }, [limit, loadRecent]);

  const handleQuickAdd = async () => {
    try {
      const token = await ensureAccessToken();
      setAccessToken(token);
      setModalOpen(true);
    } catch (error) {
      showToast("Không thể đăng nhập.", "error");
    }
  };

  const handleSaveQuick = async (payload: VocabQuickPayload) => {
    if (!accessToken) return;
    await createQuickVocabulary(accessToken, payload);
    showToast("Đã lưu");
    setModalOpen(false);
    await loadRecent(accessToken, limit);
  };

  const handleItemClick = (item: VocabItem) => {
    setEditItem(item);
  };

  const handleQuickEditSave = async (id: string | number, payload: VocabQuickEditPayload) => {
    if (!accessToken) return;
    await updateQuickVocabulary(accessToken, id, payload);
    setItems((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...payload } : entry))
    );
    showToast("Đã lưu");
    setEditItem(null);
  };

  const handleLoadMore = async () => {
    if (!accessToken) return;
    const nextLimit = limit + 20;
    setLimit(nextLimit);
    await loadRecent(accessToken, nextLimit);
  };

  const showEmpty = !loading && items.length === 0;
  const showLoadMore = items.length >= limit && !!accessToken;

  const handleLogout = async () => {
    await forceLogout();
    setAccessToken(null);
    setItems([]);
    showToast("Đã đăng xuất");
  };

  return (
    <div className="app">
      <Header onLogout={handleLogout} />

      <section className="section quick-action">
        <QuickAddButton onClick={handleQuickAdd} disabled={loading} />
      </section>

      <section className="section">
        {showEmpty ? (
          <div className="empty">
            <div>Chưa có từ vựng. Hãy lưu nhanh từ mới khi bạn đang làm việc.</div>
          </div>
        ) : (
          <VocabList
            items={items}
            onItemClick={handleItemClick}
            onLoadMore={handleLoadMore}
            showLoadMore={showLoadMore}
          />
        )}
      </section>

      <AddVocabModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveQuick}
      />

      <QuickEditModal
        open={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleQuickEditSave}
      />

      {toast && <div className={`toast ${toast.type || ""}`}>{toast.message}</div>}
    </div>
  );
};
