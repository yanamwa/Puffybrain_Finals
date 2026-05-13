import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import styles from "./Mydecks.module.css";

export default function Mydecks() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);

  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [deckTitle, setDeckTitle] = useState("");
  const [deckDesc, setDeckDesc] = useState("");
  const [visibility, setVisibility] = useState("");
  const [deckColor, setDeckColor] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

  const [decks, setDecks] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notificationCount = notifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const [user, setUser] = useState({
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const resetAddForm = () => {
    setDeckTitle("");
    setDeckDesc("");
    setVisibility("");
    setDeckColor("");
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#7b5cff",
    }).then((result) => {
      if (result.isConfirmed) navigate("/login");
    });
  };

  const normalizeDeck = (deck) => {
    const visibilityValue = deck.visibility || "private";

    return {
      id: deck.id || deck.deck_id,
      title: deck.title || "",
      description: deck.description || "",
      cards: Number(deck.card_count || deck.cards || 0),
      type: visibilityValue === "public" ? "shared" : "private",
      visibility: visibilityValue,
      deckColor: deck.deck_color || deck.deckColor || "#c9cdfa",
    };
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        const rawDecks = data.decks || [];
        setMyDecks(rawDecks);
        setDecks(rawDecks.map(normalizeDeck));
      } else {
        setDecks([]);
        setMyDecks([]);
      }
    } catch (err) {
      console.error("fetchUserDecks error:", err);
      setDecks([]);
      setMyDecks([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getMyCourses.php", {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("fetchCourses error:", err);
      setCourses([]);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser({
          username: data.user?.username || "",
          year_level: data.user?.year_level || "",
          profile_image:
            data.user?.profile_image || "/images/temporary profile.jpg",
        });
      }
    } catch (err) {
      console.error("fetchUser error:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        "http://localhost/puffybrain/getUserNotifications.php",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
      setNotifications([]);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const res = await fetch(
        "http://localhost/puffybrain/markNotificationsAsRead.php",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            status: "read",
          }))
        );
      }
    } catch (err) {
      console.error("Mark notifications as read error:", err);
    }
  };

  useEffect(() => {
    fetchUserDecks();
    fetchCourses();
    fetchUser();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.deckMenu}, .${styles.deckMenuBtn}, .${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}, .${styles.customDropdown}, .${styles.searchBar}`
      );

      if (!insideDropdown) {
        setDropdownOpen(null);
        setProfileDropdownOpen(false);
        setNotificationOpen(false);
        setOpenFilterDropdown(null);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const filteredDecks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return decks.filter((deck) => {
      const matchesSearch =
        !q ||
        deck.title.toLowerCase().includes(q) ||
        deck.description.toLowerCase().includes(q) ||
        deck.visibility.toLowerCase().includes(q) ||
        deck.type.toLowerCase().includes(q) ||
        String(deck.cards).includes(q);

      const matchesFilter = !selectedFilter || deck.type === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [decks, search, selectedFilter]);

  const openDeck = (deckId) => {
    navigate(`/deck/${deckId}`);
  };

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const handleAddDeck = async () => {
    if (!deckTitle.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing title",
        text: "Please enter a deck title.",
        confirmButtonColor: "#7b5cff",
      });
      return;
    }

    if (!visibility) {
      Swal.fire({
        icon: "warning",
        title: "Missing visibility",
        text: "Please choose Public or Private.",
        confirmButtonColor: "#7b5cff",
      });
      return;
    }

    if (!deckColor) {
      Swal.fire({
        icon: "warning",
        title: "Missing color",
        text: "Please choose a deck color.",
        confirmButtonColor: "#7b5cff",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", deckTitle.trim());
      formData.append("description", deckDesc.trim());
      formData.append("visibility", visibility);
      formData.append("deck_color", deckColor);

      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setAddPopupOpen(false);

        Swal.fire({
          title: "Deck Added!",
          text: "Your new deck has been successfully added.",
          imageUrl: "/images/success.png",
          imageWidth: 170,
          imageHeight: 170,
          timer: 1100,
          showConfirmButton: false,
        });

        resetAddForm();
        fetchUserDecks();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to create deck.",
        });
      }
    } catch (err) {
      console.error("handleAddDeck error:", err);

      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong.",
      });
    }
  };

  const handleEditDeck = async (deck) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Deck",
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Deck title" value="${deck.title}">
        <textarea id="swal-desc" class="swal2-textarea" placeholder="Deck description">${deck.description || ""}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#7b5cff",
      preConfirm: () => {
        return {
          title: document.getElementById("swal-title").value,
          description: document.getElementById("swal-desc").value,
        };
      },
    });

    if (!formValues) return;

    try {
      const formData = new FormData();
      formData.append("deckId", deck.id);
      formData.append("title", formValues.title);
      formData.append("description", formValues.description);

      const res = await fetch("http://localhost/puffybrain/updateDeck.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        fetchUserDecks();

        Swal.fire({
          icon: "success",
          title: "Deck updated!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update failed",
          text: data.message || "Something went wrong.",
        });
      }
    } catch (err) {
      console.error("handleEditDeck error:", err);
    }
  };

  const handleDuplicateDeck = async (deck) => {
    try {
      const formData = new FormData();
      formData.append("title", `${deck.title} (Copy)`);
      formData.append("description", deck.description || "");
      formData.append("visibility", deck.visibility || "private");
      formData.append("deck_color", deck.deckColor || "#c9cdfa");

      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        fetchUserDecks();

        Swal.fire({
          icon: "success",
          title: "Deck duplicated!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Duplicate failed",
          text: data.message || "Something went wrong.",
        });
      }
    } catch (err) {
      console.error("handleDuplicateDeck error:", err);
    }
  };

  const handleArchiveDeck = async (deck) => {
    const result = await Swal.fire({
      title: "Archive this deck?",
      text: "You can restore it later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Archive",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#7b5cff",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("http://localhost/puffybrain/archiveDeck.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deck_id: deck.id }),
      });

      const data = await res.json();

      if (data.success) {
        setDecks((prev) => prev.filter((d) => d.id !== deck.id));
        setMyDecks((prev) =>
          prev.filter((d) => Number(d.id || d.deck_id) !== Number(deck.id))
        );

        Swal.fire({
          icon: "success",
          title: "Archived!",
          text: "The deck was archived.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Archive failed",
          text: data.message || "Something went wrong",
        });
      }
    } catch (err) {
      console.error("Archive error:", err);
    }
  };

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <div>
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
          <p className={styles.myDecksTitle}>Menu</p>

          <nav className={styles.menu}>
            <ul className={styles.sidebarList}>
              <li className={styles.sidebarListItem}>
                <NavLink
                  to="/homepage"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-home"></i>
                  <span className={styles.menuText}>Home</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink
                  to="/Mydecks"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-collection"></i>
                  <span className={styles.menuText}>Decks</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink
                  to="/mycourse"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-book-open"></i>
                  <span className={styles.menuText}>My Course</span>
                </NavLink>
              </li>

              <li className={styles.sidebarListItem}>
                <NavLink
                  to="/public-decks"
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <i className="bx bx-world"></i>
                  <span className={styles.menuText}>Public Decks</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className={styles.divider}></div>

          <div className={styles.myDecksNav}>
            <div className={styles.sectionBlock}>
              <p className={styles.sectionTitle}>My Decks</p>

              <ul className={styles.sectionList}>
                {myDecks.length === 0 ? (
                  <li className={styles.sidebarEmptyText}>
                    Don't have decks yet
                  </li>
                ) : (
                  myDecks.slice(0, 3).map((deck) => (
                    <li
                      key={deck.id || deck.deck_id}
                      className={styles.sidebarListItem}
                    >
                      <Link
                        to={`/deck/${deck.id || deck.deck_id}`}
                        className={styles.menuItem}
                      >
                        <i className="bx bx-collection"></i>
                        <span className={styles.menuText}>{deck.title}</span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className={styles.sectionBlock}>
              <div className={styles.sectionDivider}></div>
              <p className={styles.sectionTitle}>My Courses</p>

              <ul className={styles.sectionList}>
                {courses.length === 0 ? (
                  <li className={styles.sidebarEmptyText}>
                    No courses added yet
                  </li>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <li key={course.id} className={styles.sidebarListItem}>
                      <button
                        type="button"
                        onClick={() => openCourse(course.id)}
                        className={styles.menuItem}
                      >
                        <i className="bx bx-book-open"></i>
                        <span className={styles.menuText}>{course.title}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <div className={styles.headerContainer}>
            <form
              className={styles.searchBar}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search by title, description, public, private..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className={styles.searchBtn}
                >
                  <i className="bx bx-x"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Search"
                  className={styles.searchBtn}
                >
                  <i className="bx bx-search"></i>
                </button>
              )}
            </form>

            <div className={styles.profileWrapper}>
              <div className={styles.notificationWrapper}>
                <button
                  type="button"
                  className={styles.notificationBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationOpen((prev) => !prev);
                    setProfileDropdownOpen(false);
                    setDropdownOpen(null);
                    setOpenFilterDropdown(null);
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
                        onClick={markNotificationsAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.notification_id}
                        className={styles.notificationItem}
                      >
                        <div className={styles.notificationTop}>
                          <h5>{notif.title}</h5>

                          <span className={styles.notificationRole}>
                            {notif.target_role}
                          </span>
                        </div>

                        <p>{notif.message}</p>

                        <small className={styles.notificationDate}>
                          {new Date(notif.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyNotification}>
                      <img
                        src="/images/NoNotifcation.png"
                        alt="No notifications"
                        className={styles.emptyNotificationImg}
                      />

                      <p>You don’t have any new notifications</p>
                    </div>
                  )}
                </div>
              </div>

              <Link to="/user-profile" className={styles.profileLink}>
                <div className={styles.dpContainer}>
                  <img
                    src={user.profile_image || "/images/temporary profile.jpg"}
                    alt="Profile"
                    className={styles.profilePic}
                  />
                </div>

                <div className={styles.userInfo}>
                  <p>{user.username}</p>
                </div>
              </Link>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setOpenFilterDropdown(null);
                  }}
                >
                  <i className="bx bx-chevron-down" />
                </button>

                <div
                  className={`${styles.dropdownContent} ${
                    profileDropdownOpen ? styles.show : ""
                  }`}
                >
                  <NavLink to="/edit-profile">
                    <i className="bx bx-cog" />
                    <span>Settings</span>
                  </NavLink>

                  <NavLink to="/faq">
                    <i className="bx bx-help-circle" />
                    <span>FAQs</span>
                  </NavLink>

                  <button type="button" onClick={handleLogout}>
                    <i className="bx bx-log-out" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main className={styles.main}>
            <div className={styles.panel}>
              <div className={styles.purpleStrip} />

              <div className={styles.panelHeader}>
                <h1>My Decks</h1>

                <button
                  className={styles.addBtn}
                  type="button"
                  onClick={() => setAddPopupOpen(true)}
                >
                  Add New Decks
                </button>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.purpleStrip} />

              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <div className={styles.customDropdown}>
                    <button
                      type="button"
                      className={styles.customDropdownBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(null);
                        setOpenFilterDropdown(
                          openFilterDropdown === "deckType" ? null : "deckType"
                        );
                      }}
                    >
                      <i className="bx bx-user"></i>
                      <span>
                        {selectedFilter === ""
                          ? "All"
                          : selectedFilter === "private"
                          ? "Private"
                          : "Shared"}
                      </span>
                      <i className="bx bx-chevron-down"></i>
                    </button>

                    {openFilterDropdown === "deckType" && (
                      <div className={styles.customDropdownMenu}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFilter("");
                            setOpenFilterDropdown(null);
                          }}
                        >
                          All
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFilter("private");
                            setOpenFilterDropdown(null);
                          }}
                        >
                          Private
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFilter("shared");
                            setOpenFilterDropdown(null);
                          }}
                        >
                          Shared
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.fullDivider}></div>

              <div className={styles.deckArea}>
                {decks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <img
                      src="/images/cute1.png"
                      alt="No decks"
                      className={styles.emptyImg}
                    />
                    <p className={styles.emptyText}>
                      You haven’t created any decks yet.
                    </p>
                  </div>
                ) : filteredDecks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <img
                      src="/images/cute1.png"
                      alt="No results"
                      className={styles.emptyImg}
                    />
                    <p className={styles.emptyText}>
                      No decks found for “{search}”.
                    </p>
                  </div>
                ) : (
                  filteredDecks.map((d) => (
                    <article key={d.id} className={styles.deckCard}>
                      <div
                        className={styles.deckCardInner}
                        onClick={() => openDeck(d.id)}
                      >
                        <div
                          className={styles.deckTop}
                          style={{
                            backgroundColor: d.deckColor || "#c9cdfa",
                          }}
                        >
                          <button
                            type="button"
                            className={styles.deckMenuBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilterDropdown(null);
                              setDropdownOpen((prev) =>
                                prev === d.id ? null : d.id
                              );
                            }}
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </button>

                          {dropdownOpen === d.id && (
                            <div
                              className={styles.deckMenu}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  handleEditDeck(d);
                                  setDropdownOpen(null);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handleDuplicateDeck(d);
                                  setDropdownOpen(null);
                                }}
                              >
                                Duplicate
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handleArchiveDeck(d);
                                  setDropdownOpen(null);
                                }}
                              >
                                Archive
                              </button>
                            </div>
                          )}
                        </div>

                        <div className={styles.deckBody}>
                          <h4>{d.title}</h4>
                          <span>{d.cards} cards</span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </main>

          {addPopupOpen && (
            <div
              className={styles.overlay}
              onClick={() => {
                setAddPopupOpen(false);
                resetAddForm();
              }}
            >
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className={styles.modalTitle}>Add Decks</h2>

                <label className={styles.label}>Deck Title</label>
                <input
                  className={styles.input}
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  placeholder="Enter your deck name"
                />

                <label className={styles.label}>Description</label>
                <input
                  className={styles.input}
                  value={deckDesc}
                  onChange={(e) => setDeckDesc(e.target.value)}
                  placeholder="Optional"
                />

                <label className={styles.label}>Visibility</label>
                <div className={styles.radioRow}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                    />
                    Public
                  </label>

                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "private"}
                      onChange={() => setVisibility("private")}
                    />
                    Private
                  </label>
                </div>

                <label className={styles.label}>Choose Deck Color</label>
                <div className={styles.colorRow}>
                  {[
                    "#D7C9F7",
                    "#B8F2D9",
                    "#FFB7A5",
                    "#B5A9FF",
                    "#9EE7DD",
                    "#F4A7C1",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={styles.colorDot}
                      style={{
                        backgroundColor: c,
                        outline: deckColor === c ? "3px solid #111" : "none",
                      }}
                      onClick={() => setDeckColor(c)}
                    />
                  ))}
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setAddPopupOpen(false);
                      resetAddForm();
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={handleAddDeck}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}