import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="container">
          <h1>画面を読み込めませんでした</h1>
          <p>
            通信やアプリの更新の影響で表示に失敗しました。保存済みの記録は削除していません。
          </p>
          <button className="primary" onClick={() => window.location.reload()}>
            再読み込み
          </button>
        </main>
      );
    return this.props.children;
  }
}
