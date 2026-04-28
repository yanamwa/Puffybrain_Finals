import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import styles from "./publicDeck.module.css";

function PublicDecks() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [publicDecks, setPublicDecks] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0; // change this later when you have real data

  const [user, setUser] = useState({
    username: "",
    year_level: "",
  });

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

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getUser.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

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
      console.error("Error fetching decks:", err);
      setMyDecks([]);
    }
  };

  const fetchCourses = async () => {
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
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getLessons.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setLessons(data);
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error("Lessons fetch error:", err);
      setLessons([]);
    }
  };

  const fetchPublicDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getPublicDecks.php", {
        credentials: "include",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setPublicDecks(data);
      } else if (data?.decks && Array.isArray(data.decks)) {
        setPublicDecks(data.decks);
      } else {
        setPublicDecks([]);
      }
    } catch (err) {
      console.error("Public decks error:", err);
      setPublicDecks([]);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUserDecks();
    fetchCourses();
    fetchLessons();
    fetchPublicDecks();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
  `.${styles.deckMenu}, .${styles.deckMenuBtn}, .${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}`
);

      if (!insideDropdown) {
        setDropdownOpen(null);
        setProfileDropdownOpen(false);
        setNotificationOpen(false);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  const handleAddCourse = async (lesson) => {
    const result = await Swal.fire({
      title: "Add Course?",
      text: `Add "${lesson.title}" to My Courses?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, add it",
      confirmButtonColor: "#7b5cff",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("http://localhost/puffybrain/addDeck.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `lesson_id=${lesson.id}`,
      });

      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Course added successfully",
          timer: 2000,
          showConfirmButton: true,
          confirmButtonColor: "#7b5cff",
        });

        await fetchCourses();
        navigate("/mycourse");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to add course",
        });
      }
    } catch (err) {
      console.error("Add course error:", err);

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the course",
      });
    }
  };

  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase();

    return lessons.filter((lesson) =>
      (lesson.title || "").toLowerCase().includes(q)
    );
  }, [lessons, search]);

  const filteredPublicDecks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return publicDecks.filter((deck) =>
      (deck.title || "").toLowerCase().includes(q)
    );
  }, [publicDecks, search]);

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
                placeholder="Search public decks"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="bx bx-search" />
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

              <div className={styles.dpContainer}>
                <img
                  src="/images/temporary profile.jpg"
                  alt="Profile"
                  className={styles.profilePic}
                />
              </div>

              <div className={styles.userInfo}>
                <p>{user.username}</p>
              </div>

              <div className={styles.dropdown}>
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
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

          <main className={styles.mainContent}>
            <section className={styles.courses}>
              <div className={styles.courseHead}></div>

              <div className={styles.innercourse}>
                <div className={styles.innerhead}>
                  <h1>All Courses</h1>
                </div>

                <div className={styles.lessons}>
                  {filteredLessons.length === 0 ? (
                    <p className={styles.emptyMain}>
                      {search ? "No courses match your search." : "No courses available."}
                    </p>
                  ) : (
                    filteredLessons.map((lesson) => (
                      <div className={styles.lessonBox} key={lesson.id}>
                        <div className={styles.lessonTop}></div>
                        <div className={styles.lessonPreview}></div>

                        <div className={styles.lessonContent}>
                          <div className={styles.lessonHeader}>
                            <h3 className={styles.lessonTitle}>
                              {lesson.title}
                            </h3>

                            <button
                              type="button"
                              className={styles.lessonAdd}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddCourse(lesson);
                              }}
                            >
                              <i className="bx bx-plus"></i>
                            </button>
                          </div>

                          <p className={styles.lessonDescription}>
                            {lesson.description || "No description available."}
                          </p>

                          <Link to={`/learning/${lesson.id}`}>
                            <button className={styles.lessonBtn}>
                              Start Learning
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className={styles.courses}>
              <div className={styles.courseHead}></div>

              <div className={styles.innercourse}>
                <div className={styles.innerhead}>
                  <h1>Public Decks</h1>
                </div>

                <div className={styles.deckGrid}>
                  {filteredPublicDecks.length === 0 ? (
                    <p className={styles.emptyMain}>
                      {search
                        ? "No public decks match your search."
                        : "No public decks available."}
                    </p>
                  ) : (
                    filteredPublicDecks.map((deck, index) => (
                      <div
                        className={styles.deckBox}
                        key={deck.id}
                        onClick={() => navigate(`/deck/${deck.id}`)}
                      >
                        <div
                          className={`${styles.deckHead} ${
                            styles[`deckColor${(index % 6) + 1}`]
                          }`}
                        ></div>

                        <div className={styles.deckContent}>
                          <h3 className={styles.deckTitle}>{deck.title}</h3>
                          <p className={styles.deckCount}>
                            {deck.description || "No description"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default PublicDecks;