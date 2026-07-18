import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  CheckCircle2,
  Command,
  Database,
  FileText,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Documents } from "./features/documents/Documents";
import { Chat } from "./features/chat/Chat";
import { Analytics } from "./features/analytics/Analytics";
import { Admin } from "./features/admin/Admin";
import { VectorIndex } from "./features/vector-index/VectorIndex";
import { SettingsPage } from "./features/settings/SettingsPage";
import { Support } from "./features/support/Support";
import { AuthPage } from "./features/auth/AuthPage";
import type { AuthResponse } from "./api/types";
import { apiBaseURL } from "./api/client";
import {
  clearReadNotifications,
  deleteNotification,
  listNotifications,
  markNotificationRead,
  type NotificationRecord,
} from "./api/notifications";

type View = "dashboard" | "documents" | "chat" | "analytics" | "admin" | "vector-index" | "settings" | "support";
type ThemeMode = "day" | "night";

const primaryNav = [
  { id: "dashboard" as const, label: "Dashboard", icon: Activity },
  { id: "documents" as const, label: "Documents", icon: FileText },
  { id: "chat" as const, label: "Chat", icon: MessageSquare },
];

const manageNav = [
  { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { id: "admin" as const, label: "Admin", icon: Users },
];

const globalSearchItems = [
  { label: "Upload a document", detail: "Open ingestion workbench", view: "documents" as const, type: "Document" },
  { label: "Ask policy questions", detail: "Open grounded chat", view: "chat" as const, type: "Assistant" },
  { label: "Review citation coverage", detail: "Open analytics", view: "analytics" as const, type: "Analytics" },
  { label: "Manage users and roles", detail: "Open admin control plane", view: "admin" as const, type: "Admin" },
  { label: "Check vector index", detail: "Open pgvector status", view: "vector-index" as const, type: "Resource" },
  { label: "Open support desk", detail: "Tickets and escalation", view: "support" as const, type: "Support" },
];

const fallbackNotifications: NotificationRecord[] = [
  {
    id: "fallback-citation-coverage",
    title: "Citation coverage healthy",
    detail: "96% cited answer coverage across 4 spaces",
    level: "Ready",
    category: "Quality",
    created_at: new Date().toISOString(),
    read: false,
    action_view: "analytics",
  },
  {
    id: "fallback-retention-review",
    title: "Retention review pending",
    detail: "Vendor Contract Template review due soon",
    level: "Watch",
    category: "Governance",
    created_at: new Date().toISOString(),
    read: false,
    action_view: "documents",
  },
  {
    id: "fallback-role-sync",
    title: "Role sync available",
    detail: "Admin roles can be refreshed from workspace policy",
    level: "Action",
    category: "Admin",
    created_at: new Date().toISOString(),
    read: false,
    action_view: "admin",
  },
];

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return window.localStorage.getItem("citeiq.theme") === "night" ? "night" : "day";
  });
  const closeTimers = useRef<Record<string, number | undefined>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebarUserMenu, setShowSidebarUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>(readStoredNotifications);
  const [notificationStreamStatus, setNotificationStreamStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [auth, setAuth] = useState<AuthResponse | null>(() => {
    const raw = window.localStorage.getItem("citeiq.auth");
    return raw ? JSON.parse(raw) as AuthResponse : null;
  });
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("citeiq.theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("citeiq.notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!auth) {
      return;
    }

    let cancelled = false;
    listNotifications()
      .then((items) => {
        if (!cancelled) {
          setNotifications((current) => mergeNotifications(items, current));
        }
      })
      .catch(() => setNotificationStreamStatus("offline"));

    const source = new EventSource(`${apiBaseURL}/notifications/stream`);
    source.onopen = () => setNotificationStreamStatus("live");
    source.addEventListener("notification", (event) => {
      const incoming = JSON.parse(event.data) as NotificationRecord;
      setNotifications((current) => mergeNotifications([incoming], current).slice(0, 12));
    });
    source.onerror = () => setNotificationStreamStatus("offline");

    return () => {
      cancelled = true;
      source.close();
    };
  }, [auth]);

  function handleAuthenticated(nextAuth: AuthResponse) {
    window.localStorage.setItem("citeiq.auth", JSON.stringify(nextAuth));
    setAuth(nextAuth);
    setView("dashboard");
  }

  function logout() {
    window.localStorage.removeItem("citeiq.auth");
    setAuth(null);
  }

  const filteredSearchItems = globalSearchItems.filter((item) =>
    [item.label, item.detail, item.type].join(" ").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function openView(nextView: View) {
    setView(nextView);
    setShowSearch(false);
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowSidebarUserMenu(false);
  }

  function removeNotification(notificationId: string) {
    setNotifications((current) => current.filter((item) => item.id !== notificationId));
    deleteNotification(notificationId).catch(() => undefined);
  }

  function markRead(notificationId: string) {
    setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, read: true } : item));
    markNotificationRead(notificationId).catch(() => undefined);
  }

  function clearRead() {
    setNotifications((current) => current.filter((item) => !item.read));
    clearReadNotifications().catch(() => undefined);
  }

  function openNotification(item: NotificationRecord) {
    const nextView = isView(item.action_view) ? item.action_view : null;
    removeNotification(item.id);
    if (nextView) {
      openView(nextView);
    }
  }

  function toggleTheme() {
    setTheme((current) => current === "day" ? "night" : "day");
  }

  function cancelDelayedClose(key: string) {
    const timer = closeTimers.current[key];
    if (timer) {
      window.clearTimeout(timer);
      closeTimers.current[key] = undefined;
    }
  }

  function closeLater(key: string, close: () => void) {
    cancelDelayedClose(key);
    closeTimers.current[key] = window.setTimeout(close, 5000);
  }

  if (!auth) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <FileText className="brand-doc" size={24} />
            <span>IQ</span>
          </div>
          <div>
            <strong>CiteIQ</strong>
            <span>Enterprise RAG Intelligence</span>
          </div>
        </div>
        <div className="workspace-meta">
          <span>Production</span>
          <small>4 spaces indexed</small>
        </div>
        <nav className="sidebar-nav" aria-label="Product navigation">
          <div className="nav-section">
            <span className="nav-section-title">Workspace</span>
            {primaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="nav-section">
            <span className="nav-section-title">Operate</span>
            {manageNav.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="nav-section">
            <span className="nav-section-title">Resources</span>
            <button className={view === "vector-index" ? "active" : ""} onClick={() => setView("vector-index")}>
              <Database size={18} />
              <span>Vector index</span>
              <small>pgvector</small>
            </button>
            <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>
        </nav>
        <div className="sidebar-card">
          <div>
            <span className="sidebar-card-label">Index health</span>
            <strong>96% cited coverage</strong>
          </div>
          <div className="usage-meter"><span /></div>
          <small>4 document spaces ready</small>
        </div>
        <button className="upload-shortcut" onClick={() => setView("documents")}>
          <Upload size={18} />
          Upload document
        </button>
        <div className="sidebar-footer">
          <button className={view === "support" ? "active" : ""} title="Support" onClick={() => setView("support")}>
            <LifeBuoy size={17} />
            Support
          </button>
          <button title="Logout" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
          <div
            className="sidebar-profile-wrap"
            onMouseEnter={() => cancelDelayedClose("sidebar-user")}
            onMouseLeave={() => closeLater("sidebar-user", () => setShowSidebarUserMenu(false))}
          >
            <button className="profile-chip profile-chip-button" type="button" onClick={() => setShowSidebarUserMenu((current) => !current)}>
              <span>{initials(auth.user.name)}</span>
              <div>
                <strong>{auth.user.name}</strong>
                <small>{auth.user.roles[0]?.replace("_", " ") ?? "User"}</small>
              </div>
              <ChevronDown size={15} />
            </button>
            {showSidebarUserMenu && (
              <div className="sidebar-profile-menu">
                <div className="sidebar-profile-head">
                  <span>{initials(auth.user.name)}</span>
                  <div>
                    <strong>{auth.user.name}</strong>
                    <small>{auth.user.email}</small>
                  </div>
                </div>
                <button type="button" onClick={() => openView("admin")}><UserRound size={16} /> Profile and roles</button>
                <button type="button" onClick={() => openView("settings")}><Settings size={16} /> Workspace settings</button>
                <button type="button" onClick={() => openView("admin")}><ShieldCheck size={16} /> Security controls</button>
                <button type="button" onClick={toggleTheme}>{theme === "day" ? <Moon size={16} /> : <Sun size={16} />} {theme === "day" ? "Night mode" : "Day mode"}</button>
                <button type="button" onClick={logout}><LogOut size={16} /> Logout</button>
              </div>
            )}
            </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">CiteIQ Workspace · Production</span>
            <h1>{viewLabel(view)}</h1>
            <p>Secure document search, grounded answers, and citations for enterprise teams.</p>
          </div>
          <div className="top-actions">
            <div
              className="command-search-wrap"
              onMouseEnter={() => cancelDelayedClose("search")}
              onMouseLeave={() => closeLater("search", () => setShowSearch(false))}
            >
              <label className="global-search command-search">
                <Search size={17} />
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search docs, chats, users, settings"
                />
                <span><Command size={13} /> K</span>
              </label>
              {showSearch && (
                <div className="top-popover search-popover">
                  <div className="popover-heading">
                    <strong>Command search</strong>
                    <small>{filteredSearchItems.length} results</small>
                  </div>
                  {filteredSearchItems.map((item) => (
                    <button key={item.label} type="button" onClick={() => openView(item.view)}>
                      <span>{item.label}</span>
                      <small>{item.type} · {item.detail}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div
              className="top-menu-wrap"
              onMouseEnter={() => cancelDelayedClose("notifications")}
              onMouseLeave={() => closeLater("notifications", () => setShowNotifications(false))}
            >
              <button className="icon-button theme-toggle-button" title={theme === "day" ? "Switch to night mode" : "Switch to day mode"} onClick={toggleTheme}>
                {theme === "day" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
            <div
              className="top-menu-wrap"
              onMouseEnter={() => cancelDelayedClose("notifications")}
              onMouseLeave={() => closeLater("notifications", () => setShowNotifications(false))}
            >
              <button className="icon-button notification-button" title="Notifications" onClick={() => setShowNotifications((current) => !current)}>
                <Bell size={18} />
                {unreadCount > 0 && <span>{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="top-popover notification-popover">
                  <div className="popover-heading">
                    <div>
                      <strong>Notifications</strong>
                      <small className={`stream-status ${notificationStreamStatus}`}>{notificationStreamStatus === "live" ? "Live stream active" : notificationStreamStatus === "connecting" ? "Connecting" : "Offline fallback"}</small>
                    </div>
                    <button className="popover-link-button" type="button" onClick={clearRead} disabled={!notifications.some((item) => item.read)}>
                      Clear read
                    </button>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <article key={item.id} className={`notification-item ${item.read ? "read" : "unread"} ${item.level.toLowerCase()}`}>
                        <button className="notification-main" type="button" onClick={() => openNotification(item)}>
                          <span className="notification-level">{item.level}</span>
                          <strong>{item.title}</strong>
                          <small>{item.category} · {relativeTime(item.created_at)}</small>
                          <p>{item.detail}</p>
                        </button>
                        <div className="notification-actions">
                          <button type="button" onClick={() => markRead(item.id)} disabled={item.read} title="Mark read">
                            <CheckCircle2 size={15} />
                            Read
                          </button>
                          <button type="button" onClick={() => removeNotification(item.id)} title="Dismiss">
                            <X size={15} />
                            Dismiss
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-popover-state">
                      <Trash2 size={24} />
                      <strong>All caught up</strong>
                      <small>No unread notifications. New live alerts will appear here automatically.</small>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div
              className="top-menu-wrap"
              onMouseEnter={() => cancelDelayedClose("top-user")}
              onMouseLeave={() => closeLater("top-user", () => setShowUserMenu(false))}
            >
              <button className="user-menu-button" type="button" onClick={() => setShowUserMenu((current) => !current)}>
                <span>{initials(auth.user.name)}</span>
                <div>
                  <strong>{auth.user.email}</strong>
                  <small>{auth.user.organisation}</small>
                </div>
                <ChevronDown size={16} />
              </button>
              {showUserMenu && (
                <div className="top-popover user-popover">
                  <div className="user-menu-head">
                    <span>{initials(auth.user.name)}</span>
                    <div>
                      <strong>{auth.user.name}</strong>
                      <small>{auth.user.roles.join(" · ")}</small>
                    </div>
                  </div>
                  <button type="button" onClick={() => openView("admin")}><UserRound size={16} /> Profile and roles</button>
                  <button type="button" onClick={() => openView("settings")}><Settings size={16} /> Workspace settings</button>
                  <button type="button" onClick={() => openView("admin")}><ShieldCheck size={16} /> Security controls</button>
                  <button type="button" onClick={toggleTheme}>{theme === "day" ? <Moon size={16} /> : <Sun size={16} />} {theme === "day" ? "Night mode" : "Day mode"}</button>
                  <button type="button" onClick={logout}><LogOut size={16} /> Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        {view === "dashboard" && <Dashboard onOpenChat={() => setView("chat")} />}
        {view === "documents" && <Documents />}
        {view === "chat" && <Chat />}
        {view === "analytics" && <Analytics />}
        {view === "admin" && <Admin />}
        {view === "vector-index" && <VectorIndex />}
        {view === "settings" && <SettingsPage />}
        {view === "support" && <Support />}
      </main>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CI";
}

function viewLabel(view: View) {
  return {
    dashboard: "Dashboard",
    documents: "Documents",
    chat: "Ask documents",
    analytics: "Analytics",
    admin: "Admin",
    "vector-index": "Vector index",
    settings: "Settings",
    support: "Support",
  }[view];
}

function readStoredNotifications() {
  const raw = window.localStorage.getItem("citeiq.notifications");
  if (!raw) {
    return fallbackNotifications;
  }
  try {
    const parsed = JSON.parse(raw) as NotificationRecord[];
    return parsed.length > 0 ? parsed : fallbackNotifications;
  } catch {
    return fallbackNotifications;
  }
}

function mergeNotifications(incoming: NotificationRecord[], current: NotificationRecord[]) {
  const byId = new Map<string, NotificationRecord>();
  [...incoming, ...current].forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values()).sort((first, second) => {
    return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
  });
}

function relativeTime(value: string) {
  const createdAt = new Date(value).getTime();
  if (Number.isNaN(createdAt)) {
    return "just now";
  }
  const diffSeconds = Math.max(1, Math.floor((Date.now() - createdAt) / 1000));
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${Math.floor(diffHours / 24)}d ago`;
}

function isView(value: string | null | undefined): value is View {
  return Boolean(value && ["dashboard", "documents", "chat", "analytics", "admin", "vector-index", "settings", "support"].includes(value));
}
