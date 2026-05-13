import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import styles from "./UserProfile.module.css";

function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [archivedDecks, setArchivedDecks] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeDeckTab, setActiveDeckTab] = useState("decks");
  const [archivedDropdownOpen, setArchivedDropdownOpen] = useState(null);

  const notificationCount = notifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const [user, setUser] = useState({
    id: "",
    username: "",
    year_level: "",
    school: "",
    signature: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const filterDecks = (decks) => {
    const q = search.trim().toLowerCase();
    if (!q) return decks;

    return decks.filter((deck) => {
      const searchableText = [
        deck.title,
        deck.description,
        deck.visibility,
        deck.card_count,
        deck.cards,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(q);
    });
  };

  const filteredDecks = useMemo(() => filterDecks(myDecks), [myDecks, search]);
  const filteredArchivedDecks = useMemo(
    () => filterDecks(archivedDecks),
    [archivedDecks, search]
  );

  const fetchUserDecks = async (profileId) => {
    if (!profileId) return;

    try {
      const res = await fetch(
        `http://localhost/puffybrain/getUserDecksById.php?user_id=${profileId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      setMyDecks(data.success ? data.decks || [] : []);
    } catch (err) {
      console.error("Failed to fetch user decks:", err);
      setMyDecks([]);
    }
  };

  const fetchArchivedDecks = async (profileId) => {
    if (!profileId) return;

    try {
      const res = await fetch(
        `http://localhost/puffybrain/getArchivedDecks.php?user_id=${profileId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      setArchivedDecks(data.success ? data.decks || [] : []);
    } catch (err) {
      console.error("Failed to fetch archived decks:", err);
      setArchivedDecks([]);
    }
  };

  const fetchAddedCourses = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getMyCourses.php", {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("Fetch courses error:", err);
      setCourses([]);
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

  const fetchUser = async () => {
    try {
      const currentRes = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });

      const currentData = await currentRes.json();

      if (!currentData.success) {
        navigate("/login");
        return;
      }

      const loggedUser = currentData.user;
      const loggedUserId = loggedUser.id || loggedUser.user_id;
      const profileId = userId || loggedUserId;

      const profileRes = await fetch(
        `http://localhost/puffybrain/getUserProfile.php?id=${profileId}`,
        { credentials: "include" }
      );

      const profileData = await profileRes.json();

      if (!profileData.success) {
        console.error(profileData.message || "Profile not found");
        return;
      }

      const profileUser = profileData.user;
      const profileUserId = profileUser.id || profileUser.user_id;

      setUser({
        id: profileUserId,
        username: profileUser.username || "",
        year_level: profileUser.year_level || "",
        school: profileUser.school || "",
        signature: profileUser.signature || profileUser.username || "",
        profile_image:
          profileUser.profile_image || "/images/temporary profile.jpg",
      });

      setIsOwnProfile(String(loggedUserId) === String(profileUserId));

      fetchUserDecks(profileUserId);
      fetchArchivedDecks(profileUserId);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleRestore = async (deckId) => {
    try {
      const res = await fetch("http://localhost/puffybrain/restoreDeck.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deck_id: deckId }),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Restored!", "Deck has been restored.", "success");
        fetchArchivedDecks(user.id);
        fetchUserDecks(user.id);
      } else {
        Swal.fire("Error", data.message || "Failed to restore", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error", "error");
    }
  };

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
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
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  useEffect(() => {
    fetchUser();
    fetchAddedCourses();
    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}, .${styles.deckMenuWrapper}, .${styles.searchBar}`
      );

      if (!insideDropdown) {
        setDropdownOpen(false);
        setArchivedDropdownOpen(null);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <div
      className={`${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        <div>
          <div
            className={styles.sidebarToggle}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="bx bx-sidebar"></i>
          </div>

          <div className={styles.logo}>
            <img className={styles.logoExpanded} src="/images/logo1.png" alt="Logo" />
            <img className={styles.logoCollapsed} src="/images/logo_solo.png" alt="Logo" />
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
                  <i className="bx bx-book"></i>
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
              <p className={styles.sectionTitle}>
                {isOwnProfile ? "My Decks" : `${user.username || "User"}'s Decks`}
              </p>

              <ul className={styles.sectionList}>
                {myDecks.length === 0 ? (
                  <li className={styles.sidebarEmptyText}>No decks available</li>
                ) : (
                  myDecks.slice(0, 3).map((deck) => (
                    <li key={deck.id || deck.deck_id} className={styles.sidebarListItem}>
                      <Link
                        to={`/deck/${deck.id || deck.deck_id}`}
                        className={styles.menuItem}
                      >
                        <i className="bx bx-book"></i>
                        <span className={styles.menuText}>{deck.title}</span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {isOwnProfile && (
              <div className={styles.sectionBlock}>
                <div className={styles.sectionDivider}></div>
                <p className={styles.sectionTitle}>My Courses</p>

                <ul className={styles.sectionList}>
                  {courses.length === 0 ? (
                    <li className={styles.sidebarEmptyText}>No courses added yet</li>
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
            )}
          </div>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <div className={styles.gridContainer}>
          <div className={styles.headerContainer}>
            <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder={
                  activeDeckTab === "archive"
                    ? "Search archived decks"
                    : "Search decks"
                }
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
                    setDropdownOpen(false);
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

              <div className={styles.dpContainer}>
                <img src={user.profile_image} alt="Profile" className={styles.profilePic} />
              </div>

              <div className={styles.userInfo}>
                <p>{user.username || "User"}</p>
              </div>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                    setNotificationOpen(false);
                  }}
                >
                  <i className="bx bx-chevron-down" />
                </button>

                <div
                  className={`${styles.dropdownContent} ${
                    dropdownOpen ? styles.show : ""
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
            <div className={styles.profileCard}>
              <div className={styles.idPhotoBox}>
                <div className={styles.idPhotoFrame}>
                  <img src={user.profile_image} alt="Profile" className={styles.idPhoto} />
                </div>
                <div className={styles.idBarcode}></div>
              </div>

              <div className={styles.profileCardInner}>
                <div className={styles.profileCardTop}>
                  <h1 className={styles.profileTitle}>Student ID Card</h1>
                  <button className={styles.shareBtn} type="button">
                    <i className="bx bx-share-alt"></i>
                  </button>
                </div>

                <div className={styles.profileDivider}></div>

                <div className={styles.profileInfoGrid}>
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Username:</span>
                    <span className={styles.profileValue}>
                      {user.username || "User"}
                    </span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Year:</span>
                    <span className={styles.profileValue}>
                      {user.year_level || "Not set"}
                    </span>
                  </div>

                  <div className={`${styles.profileField} ${styles.profileFieldWide}`}>
                    <span className={styles.profileLabel}>School:</span>
                    <span className={styles.profileValue}>
                      {user.school || "Not set"}
                    </span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Signature:</span>
                    <span className={styles.signatureText}>
                      {user.signature || user.username || "User"}
                    </span>
                  </div>

                  <div className={styles.profileButtonWrap}>
                    {isOwnProfile ? (
                      <button
                        className={styles.editBtn}
                        onClick={() => navigate("/edit-profile")}
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button className={styles.editBtn} type="button" disabled>
                        Visiting Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.deckTabsSection}>
              <div className={styles.deckTabsHeader}>
                <button
                  type="button"
                  className={
                    activeDeckTab === "decks" ? styles.activeTab : styles.tabBtn
                  }
                  onClick={() => setActiveDeckTab("decks")}
                >
                  {isOwnProfile ? "My Decks" : `${user.username || "User"}'s Decks`}
                </button>

                {isOwnProfile && (
                  <>
                    <span className={styles.tabDivider}></span>

                    <button
                      type="button"
                      className={
                        activeDeckTab === "archive"
                          ? styles.activeTab
                          : styles.tabBtn
                      }
                      onClick={() => setActiveDeckTab("archive")}
                    >
                      Archive
                    </button>
                  </>
                )}
              </div>

              {activeDeckTab === "decks" && (
                <div className={styles.decksGrid}>
                  {myDecks.length === 0 ? (
                    <p className={styles.emptyText}>No decks available</p>
                  ) : filteredDecks.length === 0 ? (
                    <p className={styles.emptyText}>
                      No decks found for “{search}”.
                    </p>
                  ) : (
                    filteredDecks.map((deck, index) => (
                      <Link
                        key={deck.id || deck.deck_id}
                        to={`/deck/${deck.id || deck.deck_id}`}
                        className={styles.deckBox}
                      >
                        <div
                          className={`${styles.deckPreview} ${
                            index % 4 === 0
                              ? styles.previewBlue
                              : index % 4 === 1
                              ? styles.previewPink
                              : index % 4 === 2
                              ? styles.previewViolet
                              : styles.previewRed
                          }`}
                        ></div>

                        <div className={styles.deckText}>
                          <strong>{deck.title}</strong>
                          <p>{deck.card_count ?? 0} cards</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeDeckTab === "archive" && (
                <div className={styles.decksGrid}>
                  {archivedDecks.length === 0 ? (
                    <p className={styles.emptyText}>No archived decks yet</p>
                  ) : filteredArchivedDecks.length === 0 ? (
                    <p className={styles.emptyText}>
                      No archived decks found for “{search}”.
                    </p>
                  ) : (
                    filteredArchivedDecks.map((deck, index) => (
                      <div key={deck.id || deck.deck_id} className={styles.deckBox}>
                        <div className={styles.deckMenuWrapper}>
                          <button
                            type="button"
                            className={styles.deckMenuBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setArchivedDropdownOpen(
                                archivedDropdownOpen === deck.id ? null : deck.id
                              );
                            }}
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </button>

                          {archivedDropdownOpen === deck.id && (
                            <div className={styles.deckDropdown}>
                              <button
                                type="button"
                                onClick={() => {
                                  handleRestore(deck.id);
                                  setArchivedDropdownOpen(null);
                                }}
                              >
                                Restore
                              </button>
                            </div>
                          )}
                        </div>

                        <div
                          className={`${styles.deckPreview} ${
                            index % 4 === 0
                              ? styles.previewBlue
                              : index % 4 === 1
                              ? styles.previewPink
                              : index % 4 === 2
                              ? styles.previewViolet
                              : styles.previewRed
                          }`}
                        ></div>

                        <div className={styles.deckText}>
                          <strong>{deck.title}</strong>
                          <p>{deck.card_count ?? 0} cards</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;