import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import styles from "./UserProfile.module.css";

function UserProfile() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [user, setUser] = useState({
    username: "",
    year_level: "",
    school: "",
    signature: "",
  });

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setMyDecks(data.decks || []);
      } else {
        setMyDecks([]);
      }
    } catch (err) {
      console.error("Failed to fetch user decks:", err);
      setMyDecks([]);
    }
  };

  const fetchAddedCourses = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getMyCourses.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setCourses(data.courses || []);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Fetch courses error:", err);
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
          username: data.user?.username || data.username || "",
          year_level: data.user?.year_level || data.year_level || "",
          school:
            data.user?.school ||
            data.school ||
            "Cavite State University Imus Campus",
          signature:
            data.user?.signature ||
            data.signature ||
            data.user?.username ||
            data.username ||
            "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) navigate("/login");
  };

  useEffect(() => {
    fetchUserDecks();
    fetchAddedCourses();
    fetchUser();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.dropdownBtn}, .${styles.dropdownContent}`
      );

      if (!insideDropdown) {
        setDropdownOpen(false);
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
                  <i className="bx bx-book"></i>
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
                  <i className="bx bx-folder"></i>
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
                    <li key={deck.id} className={styles.sidebarListItem}>
                      <Link to={`/deck/${deck.id}`} className={styles.menuItem}>
                        <i className="bx bx-book"></i>
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
                        <i className="bx bx-book"></i>
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
                placeholder="Search your decks"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="bx bx-search" />
            </form>

            <div className={styles.profileWrapper}>
              <div className={styles.dpContainer}>
                <img
                  src="/images/temporary profile.jpg"
                  alt="Profile"
                  className={styles.profilePic}
                />
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
                    setDropdownOpen(!dropdownOpen);
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
                  <img
                    src="/images/temporary profile.jpg"
                    alt="Profile"
                    className={styles.idPhoto}
                  />
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
                      {user.username || "meiko"}
                    </span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Year:</span>
                    <span className={styles.profileValue}>
                      {user.year_level || "2nd Year"}
                    </span>
                  </div>

                  <div
                    className={`${styles.profileField} ${styles.profileFieldWide}`}
                  >
                    <span className={styles.profileLabel}>School:</span>
                    <span className={styles.profileValue}>
                      {user.school || "Cavite State University Imus Campus"}
                    </span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>Signature:</span>
                    <span className={styles.signatureText}>
                      {user.signature || user.username || "Meiko"}
                    </span>
                  </div>

                  <div className={styles.profileButtonWrap}>
                    <button
                      className={styles.editBtn}
                      onClick={() => navigate("/edit-profile")}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.decksSection}>
              <h2>My Decks</h2>

              <div className={styles.decksGrid}>
                {myDecks.length === 0 ? (
                  <p className={styles.emptyText}>Don’t have decks yet</p>
                ) : (
                  myDecks.map((deck, index) => (
                    <Link
                      key={deck.id}
                      to={`/deck/${deck.id}`}
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
            </div>

            <div className={styles.archiveSection}>
                <h2>Archive</h2>

                <div className={styles.decksGrid}>
                  {myDecks.length === 0 ? (
                    <p className={styles.emptyText}>No archived decks yet</p>
                  ) : (
                    myDecks.map((deck, index) => (
                      <Link
                        key={`archive-${deck.id}`}
                        to={`/deck/${deck.id}`}
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
              </div>

          </main>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;