import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import type { State } from "./types";
import { repository } from "./services/storage";
type DemoContext = {
  state: State;
  busy: boolean;
  mutate: (change: (s: State) => void, message?: string) => Promise<boolean>;
  perform: (
    operation: () => Promise<State>,
    message?: string,
  ) => Promise<boolean>;
  notify: (message: string) => void;
};
const Context = createContext<DemoContext | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State | null>(null);
  const [fatal, setFatal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const pending = useRef(false);
  const revision = useRef(0);
  useEffect(() => {
    let live = true;
    const refresh = async () => {
      const rev = ++revision.current;
      try {
        const next = await repository.read();
        if (live && rev === revision.current) setState(next);
      } catch {
        if (live) setFatal(true);
      }
    };
    void refresh();
    window.addEventListener("kamigami-changed", refresh);
    return () => {
      live = false;
      window.removeEventListener("kamigami-changed", refresh);
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 7000);
    return () => clearTimeout(timer);
  }, [message]);
  const perform = async (operation: () => Promise<State>, success?: string) => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    try {
      const next = await operation();
      revision.current++;
      setState(next);
      if (success) setMessage(success);
      return true;
    } catch (error) {
      setMessage(
        error instanceof DOMException && error.name === "QuotaExceededError"
          ? "保存容量が不足しています。入力はそのままです。不要な写真を整理して再度保存してください。"
          : error instanceof Error
            ? error.message
            : "保存できませんでした。入力内容を保持しています。",
      );
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  if (fatal)
    return (
      <main className="container">
        <h1>端末内の保存を利用できません</h1>
        <p>
          ブラウザの保存設定を確認して再読み込みしてください。既存データはリセットしません。
        </p>
        <button onClick={() => location.reload()}>再読み込み</button>
      </main>
    );
  if (!state)
    return (
      <div className="loading">
        神々の系譜
        <br />
        <small>あなたの一冊を開いています…</small>
      </div>
    );
  return (
    <Context.Provider
      value={{
        state,
        busy,
        perform,
        mutate: (change, msg) => perform(() => repository.update(change), msg),
        notify: setMessage,
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          <span>{message}</span>
          <button aria-label="お知らせを閉じる" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export const useDemo = () => {
  const value = useContext(Context);
  if (!value) throw Error("Provider missing");
  return value;
};
