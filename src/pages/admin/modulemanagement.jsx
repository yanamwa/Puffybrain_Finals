import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  Search,
  User,
  ChevronDown,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2";

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
          answer: String(x.answer ?? x.a ?? "").trim(),
        }))
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
      icon: <Users size={20} />,
    },
    {
      label: "Decks Management",
      path: "/admin/decks",
      icon: <BookOpen size={20} />,
    },
    {
      label: "Modes Management",
      path: "/admin/modes",
      icon: <BookOpen size={20} />,
    },
  ];

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [rowsToShow, setRowsToShow] = useState(10);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [textViewOpen, setTextViewOpen] = useState(false);
  const [textViewTitle, setTextViewTitle] = useState("");
  const [textViewContent, setTextViewContent] = useState("");

  const dropdownRef = useRef(null);
  const fetchedOnce = useRef(false);

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

  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
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

  const shownModules = useMemo(
    () => filteredModules.slice(0, rowsToShow),
    [filteredModules, rowsToShow]
  );

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
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/images/logo1.png" alt="Logo" />
        </div>

        <div className={styles.menuLabel}>Menu</div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.menuItem} ${isActive ? styles.active : ""}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} type="button">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <header className={styles.headerContainer}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <div className={styles.profileIcon}>
            <User size={20} />
          </div>
          <span className={styles.profileName}>@admin</span>

          <button
            className={styles.dropdownBtn}
            onClick={() => setDropdownOpen((v) => !v)}
            type="button"
          >
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownContent}>
              <button className={styles.dropdownItem} type="button">
                <Settings size={16} /> Settings
              </button>
              <button className={styles.dropdownItem} type="button">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
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
                    <td>{mod.id}</td>
                    <td>{mod.title}</td>
                    <td>{mod.date}</td>
                    <td>
                      <span
                        className={
                          mod.status === "active"
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        ● {mod.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionEdit}
                        onClick={() => openEdit(mod)}
                      >
                        ✎ <span>edit</span>
                      </button>

                      <button
                        className={styles.actionDelete}
                        type="button"
                        onClick={() => openDelete(mod)}
                      >
                        🗑 <span>delete</span>
                      </button>

                      <button
                        className={styles.actionView}
                        type="button"
                        onClick={() => openView(mod)}
                      >
                        👁 <span>view</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className={styles.paginationWrapper}>
            <div className={styles.paginationCenter}>
              <button className={styles.navBtn} type="button">
                {"<"}
              </button>

              <button
                className={`${styles.pageBtn} ${styles.pageActive}`}
                type="button"
              >
                1
              </button>
              <button className={styles.pageBtn} type="button">
                2
              </button>
              <button className={styles.pageBtn} type="button">
                3
              </button>

              <span className={styles.dots}>...</span>

              <button className={styles.pageBtn} type="button">
                10
              </button>

              <button className={styles.navBtn} type="button">
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

                  <div className={styles.mmGroup}>
                    <div className={styles.mmLabel}>Subject</div>
                    <div className={styles.mmValue}>
                      {selectedModule.subject?.trim()
                        ? selectedModule.subject
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
                          openTextView("Lessons", selectedModule.lessonContent)
                        }
                      >
                        View
                      </button>
                    </div>

                    <div className={styles.mmValue}>
                      {getPreviewText(selectedModule.lessonContent)}
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