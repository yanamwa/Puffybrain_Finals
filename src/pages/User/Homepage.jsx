import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "./Homepage.module.css";
import Calendar from "./Calendar";
import TodoList from "./TodoList";

function Homepage() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deckVisibility, setDeckVisibility] = useState("private");

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0; // change later if you have real data

  const [user, setUser] = useState({
    username: "",
    year_level: "",
  });

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) navigate("/login");
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

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  useEffect(() => {
    fetchUserDecks();
    fetchUser();
    fetchCourses();
  }, []);

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

    try {
      const formData = new FormData();
      formData.append("title", deckTitle);
      formData.append("description", deckDescription);
      formData.append("visibility", deckVisibility);

      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Deck Created 🎉",
          text: "Your deck has been created successfully.",
          confirmButtonColor: "#7b5cff",
        });

        setShowPopup(false);
        setDeckTitle("");
        setDeckDescription("");
        setDeckVisibility("private");
        fetchUserDecks();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Failed to create deck.",
        });
      }
    } catch (err) {
      console.error("Error creating deck:", err);

      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong.",
      });
    }
  };

useEffect(() => {
  const handler = (e) => {
    const inside = e.target.closest(`.${styles.notificationWrapper}`);

    if (!inside) {
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
        <header className={styles.header}>
          <form className={styles.searchBar} onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Search your deck title" />
            <i className="bx bx-search"></i>
          </form>

          <div className={styles.notificationWrapper}>
  <button
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

        <main className={styles.mainContent}>
          <div className={styles.centerBox}>
            <h1>Hello, {user.username}!</h1>
            <p>What are we going to study?</p>
            <img className={styles.sideImage} src="/images/2.png" alt="Big" />
          </div>

          <div className={styles.progress}>
            <h3>Continue Progress</h3>

            <div className={styles.decksArea}>
              <div className={styles.decksGrid}>
                {courses.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>No courses yet</p>
                ) : (
                  courses.slice(0, 3).map((course, index) => {
                    const rawProgress = course.progress ?? course.completion;

                    const progress =
                      rawProgress !== undefined && rawProgress !== null
                        ? Number(rawProgress)
                        : 0;

                    const safeProgress = Math.max(0, Math.min(progress, 100));

                    const radius = 18;
                    const circumference = 2 * Math.PI * radius;
                    const dashOffset =
                      circumference - (safeProgress / 100) * circumference;

                    return (
                      <article
                        key={course.id}
                        className={styles.deckCard}
                        onClick={() => openCourse(course.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className={`${styles.cardTop} ${
                            styles[`cardTopColor${(index % 3) + 1}`]
                          }`}
                        ></div>

                        <div className={styles.cardBody}>
                          <p className={styles.deckTitle}>
                            {course.title || "Untitled Course"}
                          </p>

                          <div className={styles.courseProgressWrap}>
                            <div className={styles.courseProgressRing}>
                              <svg
                                viewBox="0 0 48 48"
                                className={styles.courseProgressSvg}
                              >
                                <circle
                                  className={styles.courseProgressBg}
                                  cx="24"
                                  cy="24"
                                  r={radius}
                                />
                                <circle
                                  className={styles.courseProgressValue}
                                  cx="24"
                                  cy="24"
                                  r={radius}
                                  strokeDasharray={circumference}
                                  strokeDashoffset={dashOffset}
                                />
                              </svg>
                            </div>

                            <span className={styles.courseProgressText}>
                              {safeProgress}% Complete
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className={styles.deckProgress}>
            <div className={styles.sectionHeader}>
              <h3>My Decks</h3>

              <div className={styles.sectionButtons}>
                <button
                  className={styles.btnAdd}
                  onClick={() => setShowPopup(true)}
                >
                  Add Deck
                </button>

                <button
                  className={styles.btnShow}
                  onClick={() => navigate("/Mydecks")}
                >
                  Show All
                </button>
              </div>
            </div>

            <div className={styles.myDecksArea}>
              <div className={styles.myDecksGrid}>
                {myDecks.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>Don’t have decks yet</p>
                ) : (
                  myDecks.map((deck, index) => (
                    <Link
                      key={deck.id}
                      to={`/deck/${deck.id}`}
                      className={styles.deckLink}
                    >
                      <article className={styles.deckCard}>
                        <div
                          className={`${styles.cardTop} ${
                            styles[`cardTopColor${(index % 3) + 1}`]
                          }`}
                        ></div>

                        <div className={styles.cardBody}>
                          <p className={styles.deckTitle}>{deck.title}</p>
                          <span className={styles.deckCount}>
                            {deck.card_count ?? 0} cards
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        {showPopup && (
          <div
            className={styles.popupOverlay}
            onClick={() => setShowPopup(false)}
          >
            <div
              className={styles.popupContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <form
                className={styles.subtitleForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddDeck();
                }}
              >
                <div className={styles.popupHeaderBar}>
                  <h2 className={styles.popupHeaderTitle}>Create New Deck</h2>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Deck Title</label>
                  <input
                    type="text"
                    className={styles.newdecktitle}
                    placeholder="Enter your deck name"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Description</label>
                  <input
                    type="text"
                    className={styles.newdecktitle}
                    placeholder="Optional description"
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Visibility</label>

                  <div className={styles.radioGroup}>
                    <label className={styles.pubpriv}>
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={deckVisibility === "public"}
                        onChange={() => setDeckVisibility("public")}
                      />
                      Public
                    </label>

                    <label className={styles.pubpriv}>
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={deckVisibility === "private"}
                        onChange={() => setDeckVisibility("private")}
                      />
                      Private
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Deck Color</label>

                  <div className={styles.colorOptions}>
                    <input
                      className={styles.colorOption1}
                      type="radio"
                      name="deckcolor"
                      value="#C8BBD0"
                    />
                    <input
                      className={styles.colorOption2}
                      type="radio"
                      name="deckcolor"
                      value="#E0BBD4"
                    />
                    <input
                      className={styles.colorOption3}
                      type="radio"
                      name="deckcolor"
                      value="#C3C7F3"
                    />
                    <input
                      className={styles.colorOption4}
                      type="radio"
                      name="deckcolor"
                      value="#90F897"
                    />
                    <input
                      className={styles.colorOption5}
                      type="radio"
                      name="deckcolor"
                      value="#CF8686"
                    />
                    <input
                      className={styles.colorOption6}
                      type="radio"
                      name="deckcolor"
                      value="#EECB99"
                    />
                  </div>
                </div>

                <div className={styles.popupDivider}></div>

                <div className={styles.startsaveContainer}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className={styles.popaddBtn}>
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <aside className={styles.rightSidebar}>
        <div className={styles.profileSection}>
          <div className={styles.profileAvatar}></div>
          <h3 className={styles.profileName}>{user.username}</h3>
          <p className={styles.profileRole}>
            {user.year_level || "Rather not say"}
          </p>
          <Link to="/user-profile" className={styles.profileBtn}>
            Profile
          </Link>
        </div>

        <Calendar />
        <TodoList />

        <Link
          to="/edit-profile"
          className={styles.settingsFooter}
        >
          ⚙ Settings
        </Link>
      </aside>
    </div>
  );
}

export default Homepage;