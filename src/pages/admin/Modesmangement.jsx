import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./mode.module.css";
import "boxicons/css/boxicons.min.css";

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
  Database,
} from "lucide-react";

import Swal from "sweetalert2";

export default function ModeManagement() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modes, setModes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [bellNotifications, setBellNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsToShow, setRowsToShow] = useState(10);

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Module Management", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Decks Management", path: "/admin/decks", icon: <LibraryBig size={20} /> },
    { label: "Modes Management", path: "/admin/modes", icon: <Gamepad2 size={20} /> },
    { label: "Notification Management", path: "/admin/notifications", icon: <i className="bx bx-bell"></i> },
    { label: "Backup & Restore", path: "/admin/backup-restore", icon: <Database size={20} /> },
  ];

  const getModeId = (mode) => {
    return mode.id ?? mode.mode_id ?? mode.ModeID ?? mode.quiz_mode_id ?? "";
  };

  const safeJsonParse = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: text || "Invalid server response" };
    }
  };

  const [admin, setAdmin] = useState({
  username: "Admin",
  full_name: "",
  email: "",
  role: "",
  profile_image: "/images/temporary profile.jpg",
});

  const swalClasses = {
    popup: styles.swalPopup,
    title: styles.swalTitle,
    htmlContainer: styles.swalHtml,
    actions: styles.swalActions,
    confirmButton: styles.swalConfirmBtn,
    cancelButton: styles.swalCancelBtn,
  };

  const fetchBellNotifications = async () => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "{}");

      const res = await fetch(
        `http://localhost/puffybrain/getAdminNotifications.php?admin_id=${admin.id}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (data.success) {
        setBellNotifications(data.notifications || []);
      } else {
        setBellNotifications([]);
      }
    } catch (err) {
      console.error("Bell notification fetch error:", err);
      setBellNotifications([]);
    }
  };

  const fetchAdmin = async () => {
  try {
    const res = await fetch(
      "http://localhost/puffybrain/getAdminProfile.php",
      {
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!data.success) {
      console.error(data.message || "Admin not found");
      return;
    }

    setAdmin({
      username: data.admin?.username || "Admin",
      full_name: data.admin?.full_name || "",
      email: data.admin?.email || "",
      role: data.admin?.role || "Administrator",
      profile_image:
        data.admin?.profile_image || "/images/temporary profile.jpg",
    });
  } catch (err) {
    console.error("Fetch admin error:", err);
  }
};

  const fetchModes = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getModes.php");
      const text = await res.text();
      const data = safeJsonParse(text);

      if (data.success) {
        setModes(data.modes || []);
      } else {
        Swal.fire("Error", data.message || "Failed to load modes", "error");
      }
    } catch {
      Swal.fire("Error", "Failed to load modes", "error");
    }
  };

  useEffect(() => {
    fetchAdmin();
    fetchModes();
    fetchBellNotifications();

    const handler = (e) => {
      const insideDropdown = e.target.closest(`.${styles.notificationWrapper}`);

      if (!insideDropdown) {
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();

    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    const adminId = admin.id;

    if (!adminId) {
      Swal.fire("Error", "Admin ID not found. Please log in again.", "error");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/puffybrain/markAdminNotificationsRead.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_id: adminId }),
        }
      );

      const data = await res.json();

      if (data.success) {
        await fetchBellNotifications();
        setNotificationOpen(true);
      } else {
        Swal.fire("Error", data.message || "Failed to mark as read.", "error");
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
      Swal.fire("Server Error", "Failed to mark as read.", "error");
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/admin/login";
  };

  const handleAddMode = async () => {
    const result = await Swal.fire({
      title: "Add New Mode",
      customClass: swalClasses,
      buttonsStyling: false,
      html: `
        <input id="modeTitle" class="${styles.swalInput}" placeholder="Mode title">
        <textarea id="modeDescription" class="${styles.swalTextarea}" placeholder="Mode description"></textarea>
        <input id="modeRoute" class="${styles.swalInput}" placeholder="Route example: /flashcard">
        <input id="modeImage" type="file" class="${styles.swalFile}" accept="image/*">
        <p class="${styles.swalText}">You can leave the image empty.</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Save Mode",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const title = document.getElementById("modeTitle").value.trim();
        const description = document.getElementById("modeDescription").value.trim();
        const route = document.getElementById("modeRoute").value.trim();
        const image = document.getElementById("modeImage").files[0];

        if (!title || !description || !route) {
          Swal.showValidationMessage("Please fill out title, description, and route");
          return false;
        }

        return { title, description, route, image };
      },
    });

    if (!result.isConfirmed) return;

    try {
      const form = new FormData();
      form.append("title", result.value.title);
      form.append("description", result.value.description);
      form.append("route", result.value.route);

      if (result.value.image) {
        form.append("image", result.value.image);
      }

      const res = await fetch("http://localhost/puffybrain/addMode.php", {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      const data = safeJsonParse(text);

      if (data.success) {
        Swal.fire("Success", data.message || "Mode added successfully!", "success");
        fetchModes();
      } else {
        Swal.fire("Error", data.message || "Failed to add mode", "error");
      }
    } catch {
      Swal.fire("Error", "Server error while adding mode", "error");
    }
  };

  const handleViewMode = (mode) => {
    Swal.fire({
      title: "View Mode",
      customClass: {
        popup: styles.swalPopup,
        title: styles.swalTitle,
        htmlContainer: styles.swalHtml,
        actions: styles.swalActions,
        confirmButton: styles.swalConfirmBtn,
      },
      buttonsStyling: false,
      html: `
        <div class="${styles.viewModeBox}">
          ${
            mode.image
              ? `<img class="${styles.viewModeImage}" src="http://localhost/puffybrain/images/${mode.image}" alt="Mode image">`
              : `<div class="${styles.viewModeNoImage}">No image</div>`
          }

          <div class="${styles.viewModeItem}">
            <span>Title</span>
            <p>${mode.title || ""}</p>
          </div>

          <div class="${styles.viewModeItem}">
            <span>Description</span>
            <p>${mode.description || ""}</p>
          </div>

          <div class="${styles.viewModeItem}">
            <span>Route</span>
            <p>${mode.route || ""}</p>
          </div>
        </div>
      `,
      confirmButtonText: "Close",
    });
  };

  const handleEditMode = async (mode) => {
    const modeId = getModeId(mode);

    if (!modeId) {
      Swal.fire("Error", "Mode ID is missing.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Edit Mode",
      customClass: swalClasses,
      buttonsStyling: false,
      html: `
        <input id="modeTitle" class="${styles.swalInput}" placeholder="Mode title" value="${mode.title || ""}">
        <textarea id="modeDescription" class="${styles.swalTextarea}" placeholder="Mode description">${mode.description || ""}</textarea>
        <input id="modeRoute" class="${styles.swalInput}" placeholder="Route" value="${mode.route || ""}">
        <input id="modeImage" type="file" class="${styles.swalFile}" accept="image/*">
        <p class="${styles.swalText}">Leave image empty if you don't want to change it.</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Update Mode",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const title = document.getElementById("modeTitle").value.trim();
        const description = document.getElementById("modeDescription").value.trim();
        const route = document.getElementById("modeRoute").value.trim();
        const image = document.getElementById("modeImage").files[0];

        if (!title || !description || !route) {
          Swal.showValidationMessage("Please fill out all fields");
          return false;
        }

        return { id: modeId, title, description, route, image };
      },
    });

    if (!result.isConfirmed) return;

    try {
      const form = new FormData();
      form.append("id", result.value.id);
      form.append("title", result.value.title);
      form.append("description", result.value.description);
      form.append("route", result.value.route);

      if (result.value.image) {
        form.append("image", result.value.image);
      }

      const res = await fetch("http://localhost/puffybrain/updateMode.php", {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      const data = safeJsonParse(text);

      if (data.success) {
        Swal.fire("Success", data.message || "Mode updated successfully!", "success");
        fetchModes();
      } else {
        Swal.fire("Error", data.message || "Failed to update mode", "error");
      }
    } catch {
      Swal.fire("Error", "Server error while updating mode", "error");
    }
  };

  const deleteMode = async (id) => {
    if (!id) {
      Swal.fire("Error", "Mode ID is missing.", "error");
      return;
    }

    const confirm = await Swal.fire({
      title: "Delete Mode?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const form = new FormData();
      form.append("id", id);

      const res = await fetch("http://localhost/puffybrain/deleteMode.php", {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      const data = safeJsonParse(text);

      if (data.success) {
        Swal.fire("Deleted", data.message || "Mode deleted successfully!", "success");
        fetchModes();
      } else {
        Swal.fire("Error", data.message || "Failed to delete mode", "error");
      }
    } catch {
      Swal.fire("Error", "Server error while deleting mode", "error");
    }
  };

  const filteredModes = modes.filter((mode) => {
    const q = searchQuery.trim().toLowerCase();

    return (
      String(getModeId(mode)).toLowerCase().includes(q) ||
      String(mode.title || "").toLowerCase().includes(q) ||
      String(mode.description || "").toLowerCase().includes(q) ||
      String(mode.route || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredModes.length / rowsToShow);

  const shownModes = filteredModes.slice(
    (currentPage - 1) * rowsToShow,
    currentPage * rowsToShow
  );

  const unreadNotifications = bellNotifications.filter(
    (notif) => notif.status === "unread"
  );

  const notificationCount = unreadNotifications.length;

  return (
    <div className={styles.gridContainer}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarToggle} onClick={() => setIsCollapsed(!isCollapsed)}>
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img className={styles.logoExpanded} src="/images/logo1.png" alt="Logo" />
            <img className={styles.logoCollapsed} src="/images/logo_solo.png" alt="Logo" />
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
              <span className={styles.menuIcon}><User size={20} /></span>
              <span className={styles.menuText}>Profile</span>
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.menuIcon}><Settings size={20} /></span>
              <span className={styles.menuText}>Settings</span>
            </NavLink>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.divider}></div>

          <NavLink to="/" onClick={handleLogout} className={styles.menuItem}>
            <span className={styles.menuIcon}><LogOut size={20} /></span>
            <span className={styles.menuText}>Logout</span>
          </NavLink>
        </div>
      </aside>

       <header className={styles.headerContainer}>
  <div className={styles.searchBar}>
    <Search size={19} />
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  <div className={styles.headerRight}>
    
    {/* Notification */}
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
        <div className={styles.notificationHeader}>
          <h4>Notifications</h4>

          {notificationCount > 0 && (
            <button
              type="button"
              className={styles.markReadBtn}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {bellNotifications.length > 0 ? (
          bellNotifications.slice(0, 5).map((item) => (
            <div
              key={item.notification_id || item.id}
              className={styles.notificationItem}
            >
              <div className={styles.notificationTop}>
                <h5>{item.title || "No title"}</h5>
                <span className={styles.notificationRole}>
                  {item.recipient_type || "all"}
                </span>
              </div>

              <p className={styles.notificationMessage}>
                {item.message || "No message"}
              </p>

              <p className={styles.notificationCreator}>
                Posted by {item.created_by || "Admin"}
              </p>

              <small className={styles.notificationDate}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : "No date"}
              </small>
            </div>
          ))
        ) : (
          <div className={styles.emptyNotification}>
            <p>You don’t have any new notifications</p>
          </div>
        )}
      </div>
    </div>

    {/* Admin Profile */}
    <div className={styles.adminHeaderProfile}>
      <img
        src={admin.profile_image || "/images/temporary profile.jpg"}
        alt="Admin"
        className={styles.adminHeaderImg}
      />

      <span className={styles.adminHeaderName}>
        {admin.username || "Admin"}
      </span>
    </div>
  </div>
</header>

      <main className={styles.main}>
        <div className={styles.pageTop}>
          <div>
            <h1 className={styles.pageTitle}>Mode Management</h1>
            <p>Create and manage practice modes for PuffyBrain users.</p>
          </div>

          <button className={styles.addBtn} type="button" onClick={handleAddMode}>
            + Add New Mode
          </button>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>ID</div>
            <div>Title</div>
            <div>Description</div>
            <div>Route</div>
            <div>Action</div>
          </div>

          <div className={styles.tableContent}>
            {filteredModes.length === 0 ? (
              <div className={styles.message}>No modes found.</div>
            ) : (
              shownModes.map((mode) => {
                const modeId = getModeId(mode);

                return (
                  <div className={styles.row} key={modeId}>
             <div className={styles.modeId}>
  {`MD${
    mode.created_at
      ? `/${new Date(mode.created_at)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "")}`
      : ""
  }${
    (Number(modeId) * 37) % 900 + 100
  }${modeId}${
    (Number(modeId) * 53) % 900 + 100
  }`}
</div>
                 <div>{mode.title}</div>
                    <div className={styles.descCell}>{mode.description}</div>
                    <div>{mode.route}</div>

                    <div className={styles.actionButtons}>
                      <button className={styles.viewBtn} type="button" onClick={() => handleViewMode(mode)}>
                        View
                      </button>
                      <button className={styles.editBtn} type="button" onClick={() => handleEditMode(mode)}>
                        Edit
                      </button>
                      <button className={styles.deleteBtn} type="button" onClick={() => deleteMode(modeId)}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.paginationWrapper}>
            <div className={styles.paginationCenter}>
              <button
                className={styles.navBtn}
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                {"<"}
              </button>

              {Array.from({ length: totalPages || 1 }).map((_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ""}`}
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
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                {">"}
              </button>
            </div>

            <div className={styles.rowsControl}>
              <span>Show</span>

              <select
                value={rowsToShow}
                onChange={(e) => {
                  setRowsToShow(Number(e.target.value));
                  setCurrentPage(1);
                }}
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
    </div>
  );
}