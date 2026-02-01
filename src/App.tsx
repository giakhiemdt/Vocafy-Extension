import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { QuickAddButton } from "./components/QuickAddButton";
import { AddVocabModal } from "./components/AddVocabModal";
import { VocabList } from "./components/VocabList";
import { QuickEditModal } from "./components/QuickEditModal";
import { createQuickVocabulary, fetchRecentVocabularies, updateQuickVocabulary } from "./api";
import { ensureAccessToken, forceLogout } from "./auth";
import { VocabItem, VocabQuickPayload, VocabQuickEditPayload } from "./types";
import { loadAccessToken, loadTheme, saveTheme } from "./storage";

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
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(4);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<VocabItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isLoggedIn = useMemo(() => Boolean(accessToken), [accessToken]);

  const showToast = useCallback((message: string, type?: "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const loadRecent = useCallback(
    async (token: string, newPage = page, newSize = size) => {
      try {
        const payload = await fetchRecentVocabularies(token, newPage, newSize);
        const content = payload?.result?.content || [];
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
    [page, size, showToast]
  );

  useEffect(() => {
    const init = async () => {
      const storedTheme = await loadTheme();
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      const resolvedTheme = storedTheme || (prefersDark ? "dark" : "light");
      setTheme(resolvedTheme);
      document.documentElement.setAttribute("data-theme", resolvedTheme);

      const cached = await loadAccessToken();
      if (cached) {
        setAccessToken(cached);
        await loadRecent(cached, page, size);
      }
      setLoading(false);
    };
    void init();
  }, [page, size, loadRecent]);

  const handleToggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    await saveTheme(next);
  };

  const handleQuickAdd = async () => {
    try {
      const token = await ensureAccessToken();
      setAccessToken(token);
      await loadRecent(token, page, size);
      setModalOpen(true);
    } catch (error) {
      showToast("Không thể đăng nhập.", "error");
    }
  };

  const handleSaveQuick = async (payload: VocabQuickPayload) => {
    if (!accessToken) return;
    try {
      const response = await createQuickVocabulary(accessToken, payload);
      if (response?.success) {
        showToast("Đã lưu");
        setModalOpen(false);
        await loadRecent(accessToken, page, size);
      } else {
        showToast("Lưu từ vựng thất bại.", "error");
      }
    } catch (error) {
      showToast("Lưu từ vựng thất bại.", "error");
    }
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
    const nextPage = page + 1;
    setPage(nextPage);
    await loadRecent(accessToken, nextPage, size);
  };

  const showEmpty = !loading && items.length === 0;
  const showLoadMore = items.length >= size && !!accessToken;

  const handleLogout = async () => {
    await forceLogout();
    setAccessToken(null);
    setItems([]);
    setModalOpen(false);
    setEditItem(null);
    showToast("Đã đăng xuất");
  };

  return (
    <div className="app">
      <Header
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        showLogout={isLoggedIn}
      />

      {isLoggedIn && (
        <section className="section quick-action">
          <QuickAddButton onClick={handleQuickAdd} disabled={loading} />
        </section>
      )}

      <section className={`section ${!isLoggedIn ? "no-card" : ""}`}>
        {!isLoggedIn ? (
          <div className="marketing">
            <div className="badge">AI-Powered Vocabulary Learning</div>
            <div className="hero-title">
              Học từ vựng <span className="accent">trực quan</span> và <br />
              <span className="accent-2 nowrap">đơn giản</span>
            </div>
            <div className="hero-desc">
              Trải nghiệm học nhanh với gợi ý thông minh và đồng bộ dữ liệu mọi lúc.
            </div>
            <button className="primary-btn" style={{marginTop: "80px"}} type="button" onClick={handleQuickAdd}>
              Bắt đầu miễn phí →
            </button>
            <div className="subtitle">Đăng nhập để đồng bộ từ vựng</div>
          </div>
        ) : showEmpty ? (
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
