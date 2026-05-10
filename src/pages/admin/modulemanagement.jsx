import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  LibraryBig,
  Gamepad2,
  LogOut,
  Search,
  User,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import styles from "./modulemanage.module.css";

function formatToday() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function parseDeckCards(raw) {
  if (!raw) return [];

  const text = String(raw).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed
        .map((x, i) => ({
          id: i + 1,
          question: String(x.question ?? x.q ?? "").trim(),
          answer: String(x.correct_answer ?? x.correctAnswer ?? x.answer ?? x.a ?? "").trim(),        }))
        .filter((c) => c.question || c.answer);
    }
  } catch {}

  const blocks = text
    .split(/\n\s*\n+/g)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length) {
    return blocks.map((block, idx) => {
      const lines = block.split("\n").filter(Boolean);

      return {
        id: idx + 1,
        question: lines[0] || "",
        answer: lines.slice(1).join("\n"),
      };
    });
  }

  const lines = text.split("\n").filter(Boolean);
  const cards = [];

  for (let i = 0; i < lines.length; i += 2) {
    cards.push({
      id: cards.length + 1,
      question: lines[i] || "",
      answer: lines[i + 1] || "",
    });
  }

  return cards;
}

export default function ModuleManagement() {
  const navigate = useNavigate();
  const API_URL = "http://localhost/puffybrain/adminLearningModule.php";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0;

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [rowsToShow, setRowsToShow] = useState(10);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [textViewOpen, setTextViewOpen] = useState(false);
  const [textViewTitle, setTextViewTitle] = useState("");
  const [textViewContent, setTextViewContent] = useState("");



  const fetchedOnce = useRef(false);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      label: "Module Management",
      path: "/admin/modules",
      icon: <Layers size={20} />,
    },
    {
      label: "Decks Management",
      path: "/admin/decks",
      icon: <LibraryBig size={20} />,
    },
    {
      label: "Modes Management",
      path: "/admin/modes",
      icon: <Gamepad2 size={20} />,
    },
  ];

  const handleLogout = (e) => {
    e.preventDefault();

    localStorage.clear();
    sessionStorage.clear();

    window.location.href = "/admin/login";
  };

  const openTextView = (title, content) => {
    setTextViewTitle(title);
    setTextViewContent(content || "—");
    setTextViewOpen(true);
  };

  const closeTextView = () => {
    setTextViewOpen(false);
    setTextViewTitle("");
    setTextViewContent("");
  };

  const getPreviewText = (text, max = 140) => {
    const clean = String(text || "").trim();
    if (!clean) return "—";
    return clean.length > max ? `${clean.slice(0, max)}...` : clean;
  };

  const fetchModules = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (data?.success && Array.isArray(data.modules)) {
        setModules(
          data.modules.map((m) => ({
            id: m.id,
            title: m.title,
            date: m.created_at ?? formatToday(),
            status: String(m.status || "").toLowerCase(),
            module_description: m.description ?? "",
            subject: m.subject ?? "",
            learningObjectives: m.learning_objectives ?? "",
            lessonContent: m.lesson_content ?? "",
            quizModule: m.quiz_contents ?? "",
          }))
        );
      } else {
        setModules([]);
      }
    } catch (err) {
      console.error(err);
      setModules([]);

      await Swal.fire({
        icon: "error",
        title: "Load Failed",
        text: "Could not fetch modules.",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (mod) => {
    if (!mod?.id) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          id: mod.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchModules();

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Module has been deleted.",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: data.message || "Delete failed.",
        });
      }
    } catch (err) {
      console.error(err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error deleting module.",
      });
    }
  };

  const openDelete = (mod) => {
    setDeleteTarget(mod);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget?.id) return;

    await confirmDelete(deleteTarget);
    closeDelete();
  };

  useEffect(() => {
    if (fetchedOnce.current) return;

    fetchedOnce.current = true;
    fetchModules();
  }, []);

  const filteredModules = useMemo(
    () =>
      modules.filter((m) =>
        String(m.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [modules, searchQuery]
  );

  const totalPages = Math.ceil(filteredModules.length / rowsToShow);
  const [currentPage, setCurrentPage] = useState(1);

  const shownModules = useMemo(() => {
  const start = (currentPage - 1) * rowsToShow;
  const end = start + rowsToShow;

  return filteredModules.slice(start, end);
}, [filteredModules, currentPage, rowsToShow]);

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedId) || null,
    [modules, selectedId]
  );

  const selectedCards = useMemo(
    () => (selectedModule ? parseDeckCards(selectedModule.quizModule) : []),
    [selectedModule]
  );

  const openView = (mod) => {
    setSelectedId(mod.id);
    setViewOpen(true);
  };

  const closeView = () => {
    setViewOpen(false);
    setSelectedId(null);
  };

  const openAdd = () => {
    navigate("/admin/modules/new");
  };

  const openEdit = (mod) => {
    navigate(`/admin/modules/edit/${mod.id}`);
  };

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.sidebarTop}>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img
              className={styles.logoExpanded}
              src="/images/logo1.png"
              alt="Logo"
            />

            <img
              className={styles.logoCollapsed}
              src="/images/logo_solo.png"
              alt="Logo"
            />
          </div>

          <div className={styles.divider}></div>

          <p className={styles.menuLabel}>Menu</p>

          <nav className={styles.menu}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuItem} ${isActive ? styles.active : ""}`
                }
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuText}>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.divider}></div>

          <p className={styles.menuLabel}>Others</p>

          <nav className={styles.menu}>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}>
                <User size={20} />
              </span>
              <span className={styles.menuText}>Profile</span>
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}>
                <Settings size={20} />
              </span>
              <span className={styles.menuText}>Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.divider}></div>

          <NavLink to="/" onClick={handleLogout} className={styles.menuItem}>
            <span className={styles.menuIcon}>
              <LogOut size={20} />
            </span>
            <span className={styles.menuText}>Logout</span>
          </NavLink>
        </div>
      </aside>

      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={19} />

          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className={styles.notificationBtn}
            onClick={(e) => {
              e.stopPropagation();
              setNotificationOpen((prev) => !prev);
            }}
          >
            <i className="bx bx-bell"></i>

            {notificationCount > 0 && (
              <span className={styles.notificationBadge}>
                {notificationCount}
              </span>
            )}
          </button>

          <div
            className={`${styles.notificationDropdown} ${
              notificationOpen ? styles.show : ""
            }`}
          >
            <h4>Notifications</h4>

            <div className={styles.emptyNotification}>
              <p>You don’t have any new notifications</p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Module Management</h1>

          <button type="button" className={styles.addBtn} onClick={openAdd}>
            + Add new module
          </button>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Module ID</th>
                <th>Module Title</th>
                <th>Date created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Loading modules...
                  </td>
                </tr>
              ) : shownModules.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No modules found.
                  </td>
                </tr>
              ) : (
                shownModules.map((mod) => (
                  <tr key={mod.id}>
                  <td>
                    {`MOD${String(mod.date)
                      .replace(/[-/: ]/g, "")
                      .slice(2, 10)}${String(mod.id).padStart(3, "0")}`}
                  </td>   
                 <td>{mod.title}</td>
                    <td>{mod.date}</td>
                    <td>
                  <span 
                      className={
                        mod.status === "publish"
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      ● {mod.status === "publish" ? "Publish" : "Draft"}
                    </span>
                    </td>

                    <td className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionEdit}
                        onClick={() => openEdit(mod)}
                      >
                      <i className='bx bx-pencil'></i>
                      <span>Edit</span>                  
                      </button>

                      <button
                        type="button"
                        className={styles.actionDelete}
                        onClick={() => openDelete(mod)}
                      >
                    <i className='bx bx-trash'></i>
                    <span>Delete</span>   
                   </button>

                      <button
                        type="button"
                        className={styles.actionView}
                        onClick={() => openView(mod)}
                      >
                    <i className='bx bx-show'></i>
                    <span>View</span>   
                   </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className={styles.paginationWrapper}>
            <div className={styles.paginationCenter}>
                <button
                  className={styles.navBtn}
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  {"<"}
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${
                        currentPage === page ? styles.pageActive : ""
                      }`}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  className={styles.navBtn}
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  {">"}
                </button>
              </div>

            <div className={styles.rowsControl}>
              <span>Show</span>

              <select
                value={rowsToShow}
                onChange={(e) => setRowsToShow(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span>Row</span>
            </div>
          </div>
        </div>
      </main>

      {viewOpen && selectedModule && (
        <div className={styles.mmOverlay} onClick={closeView}>
          <div className={styles.mmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mmHeader}>
              <h2 className={styles.mmTitle}>Module Details:</h2>

              <button
                type="button"
                className={styles.mmHeaderEdit}
                onClick={() => openEdit(selectedModule)}
              >
                Edit
              </button>

              <button
                type="button"
                className={styles.mmClose}
                onClick={closeView}
              >
                ✕
              </button>
            </div>

            <div className={styles.mmBody}>
              <div className={styles.mmDetails}>
                <div className={styles.mmCol}>
                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabel}>Module Title</div>
                    <div className={styles.mmValue}>
                      {selectedModule.title || "—"}
                    </div>
                  </div>

                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabel}>Module Description</div>
                    <div className={styles.mmValue}>
                      {selectedModule.module_description?.trim()
                        ? selectedModule.module_description
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className={styles.mmCol}>
                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabelRow}>
                      <div className={styles.mmLabel}>Learning Objectives</div>

                      <button
                        type="button"
                        className={styles.mmViewBtn}
                        onClick={() =>
                          openTextView(
                            "Learning Objectives",
                            selectedModule.learningObjectives
                          )
                        }
                      >
                        View
                      </button>
                    </div>

                    <div className={styles.mmValue}>
                      {getPreviewText(selectedModule.learningObjectives)}
                    </div>
                  </div>

                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabelRow}>
                      <div className={styles.mmLabel}>Lessons</div>

                      <button
                        type="button"
                        className={styles.mmViewBtn}
                        onClick={() =>
                        openTextView(
                          "Lessons",
                          (() => {
                            try {
                              const parsed = JSON.parse(selectedModule.lessonContent);

                              if (Array.isArray(parsed)) {
                                return parsed
                                  .map((page) => page.content || "")
                                  .join("\n\n");
                              }
                            } catch {}

                            return selectedModule.lessonContent;
                          })()
                        )                        }
                      >
                        View
                      </button>
                    </div>

              <div className={styles.mmValue}>
                  {(() => {
                    try {
                      const parsed = JSON.parse(selectedModule.lessonContent);

                      if (Array.isArray(parsed)) {
                        return getPreviewText(
                          parsed
                            .map((page) => page.content || "")
                            .join(" ")
                        );
                      }
                    } catch {}

                    return getPreviewText(selectedModule.lessonContent);
                  })()}
                </div>
                  </div>
                </div>
              </div>

              <div className={styles.mmDecksTitle}>Module decks</div>

              {selectedCards.length > 0 ? (
                selectedCards.map((c) => (
                  <div key={c.id} className={styles.mmCard}>
                    <div className={styles.mmQ}>{c.question || "—"}</div>
                    <div className={styles.mmA}>{c.answer || "—"}</div>
                  </div>
                ))
              ) : (
                <div className={styles.mmCard}>
                  <div className={styles.mmQ}>No decks yet</div>
                  <div className={styles.mmA}>—</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {textViewOpen && (
        <div className={styles.popupOverlay} onClick={closeTextView}>
          <div
            className={styles.textViewModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.popupHeader}>
              <h2 className={styles.popupTitle}>{textViewTitle}</h2>

              <button
                type="button"
                className={styles.popupClose}
                onClick={closeTextView}
              >
                ✕
              </button>
            </div>

            <div className={styles.textViewBody}>{textViewContent}</div>
          </div>
        </div>
      )}

      {deleteOpen && deleteTarget && (
        <div className={styles.popupOverlay} onClick={closeDelete}>
          <div
            className={styles.popupDeleteModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.popupHeader}>
              <h2 className={styles.popupTitle}>Delete Module</h2>

              <button
                type="button"
                className={styles.popupClose}
                onClick={closeDelete}
              >
                ✕
              </button>
            </div>

            <div className={styles.popupBody}>
              <p className={styles.popupDeleteText}>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.title}</strong>?
              </p>

              <p className={styles.popupDeleteText}>
                Description: {deleteTarget.module_description || "—"}
              </p>

              <p className={styles.popupDeleteText}>
                This action cannot be undone.
              </p>

              <div className={styles.popupActions}>
                <button
                  className={styles.popupCancelBtn}
                  type="button"
                  onClick={closeDelete}
                >
                  Cancel
                </button>

                <button
                  className={styles.popupDeleteBtn}
                  type="button"
                  onClick={handleDeleteConfirmed}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}