import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Home,
  Compass,
  BookOpen,
  Flag,
  User,
  Flower2,
  ArrowUpRight,
} from "lucide-react";
import { DemoProvider, useDemo } from "./context";
import { balance } from "./services/domain";
import {
  HomePage,
  SearchPage,
  ShrinePage,
  GodPage,
  GodIndex,
} from "./pages/Core";
import { BookPage, PhotoForm, PhotoDetail } from "./pages/Photos";
import {
  MissionsPage,
  RewardsPage,
  EventsPage,
  EventDetail,
  PointsPage,
  TicketsPage,
} from "./pages/Activity";
import { ProfilePage, AddressPage, CommunityPage } from "./pages/Personal";
import { Back, PageTitle } from "./components/Primitives";
const AdminPage = lazy(() => import("./pages/Admin"));
const tabs = [
  ["/", "ホーム", Home],
  ["/search", "探す", Compass],
  ["/book", "御朱印帳", BookOpen],
  ["/missions", "ミッション", Flag],
  ["/profile", "マイページ", User],
] as const;
const positions = new Map<string, number>();
function Shell() {
  const { state } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const currentKey = useRef(location.key);
  const [update, setUpdate] = useState(false);
  useLayoutEffect(() => {
    const target = positions.get(location.key) || 0;
    currentKey.current = location.key;
    window.scrollTo(0, target);
  }, [location.key]);
  useEffect(() => {
    history.scrollRestoration = "manual";
    const save = () => positions.set(currentKey.current, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    // Capture before routing changes the document height and clamps scrollY.
    document.addEventListener("click", save, true);
    return () => {
      window.removeEventListener("scroll", save);
      document.removeEventListener("click", save, true);
    };
  }, []);
  useEffect(() => {
    let live = true;
    const base = __APP_VERSION__;
    const check = async () => {
      try {
        const r = await fetch("/version.json", { cache: "no-store" });
        if (r.ok) {
          const { version } = await r.json();
          if (base && base !== version && live) setUpdate(true);
        }
      } catch {
        /* offline: keep application */
      }
    };
    void check();
    const id = setInterval(check, 60000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);
  const primary = tabs.some(([path]) => path === location.pathname);
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          <img src="/icon.svg" alt="" />
          <span>
            神々の系譜<small>KAMIGAMI NO KEIFU</small>
          </span>
        </Link>
        <div className="header-right">
          <span className="demo-pill">体験デモ</span>
          <Link to="/points" className="point-link">
            <Flower2 size={17} />
            <strong>{balance(state)}</strong>
            <span>徳</span>
          </Link>
        </div>
      </header>
      {update && (
        <div className="update-banner">
          新しい版があります。編集中の内容を保存してから更新してください。
          <button onClick={() => locationReload()}>更新する</button>
        </div>
      )}
      <main className="container" id="main">
        {!primary && (
          <Back
            onBack={() => {
              if (window.history.state?.idx > 0) navigate(-1);
              else navigate("/");
            }}
          />
        )}
        <Suspense fallback={<p>画面を開いています…</p>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/shrines/:id" element={<ShrinePage />} />
            <Route path="/gods" element={<GodIndex />} />
            <Route path="/gods/:id" element={<GodPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/photos/new" element={<PhotoForm />} />
            <Route path="/photos/:id/edit" element={<PhotoForm />} />
            <Route path="/photos/:id" element={<PhotoDetail />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/points" element={<PointsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/addresses" element={<AddressPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="*"
              element={
                <>
                  <PageTitle title="ページが見つかりません" />
                  <Link to="/">
                    ホームへ戻る <ArrowUpRight size={15} />
                  </Link>
                </>
              }
            />
          </Routes>
        </Suspense>
        <footer className="page-footer">
          日々の参拝を、あなたの一冊に。
          <br />
          <span>端末内保存の体験デモ · 神々の系譜</span>
        </footer>
      </main>
      <nav className="bottom-nav" aria-label="メインメニュー">
        {tabs.map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
function locationReload() {
  window.location.reload();
}
export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <Shell />
      </DemoProvider>
    </BrowserRouter>
  );
}
