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
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deckVisibility, setDeckVisibility] = useState("private");
  const [deckColor, setDeckColor] = useState("#C3C7F3");

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationCount = 0;

  const [searchQuery, setSearchQuery] = useState("");

  const [user, setUser] = useState({
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const deckColors = [
    "#C8BBD0",
    "#E0BBD4",
    "#C3C7F3",
    "#90F897",
    "#CF8686",
    "#EECB99",
  ];

  const filteredDecks = myDecks.filter((deck) =>
    deck.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const foundDeck = myDecks.find((deck) =>
      deck.title?.toLowerCase().includes(q)
    );

    const foundCourse = courses.find((course) =>
      course.title?.toLowerCase().includes(q)
    );

    if (foundDeck) {
      navigate(`/deck/${foundDeck.id}`);
      return;
    }

    if (foundCourse) {
      navigate(`/learning/${foundCourse.id}`);
      return;
    }

    Swal.fire({
      icon: "info",
      title: "No results found",
      text: "No deck or course matches your search.",
      confirmButtonColor: "#7b5cff",
    });
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

  const fetchUserDecks = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/userDecks.php", {
        credentials: "include",
      });

      const data = await res.json();
      setMyDecks(data.success ? data.decks || [] : []);
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

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost/puffybrain/getMyCourses.php", {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
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

  useEffect(() => {
    const handler = (e) => {
      const inside = e.target.closest(
        `.${styles.notificationWrapper}, .${styles.cardDropdown}, .${styles.cardMenu}`
      );

      if (!inside) {
        setNotificationOpen(false);
        setDropdownOpen(null);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
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
      formData.append("deck_color", deckColor);

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
        setDeckColor("#C3C7F3");
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

  const handleDeleteDeck = async (deckId) => {
    const result = await Swal.fire({
      title: "Archive deck?",
      text: "This deck will be removed from your list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive it",
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
        body: JSON.stringify({ deck_id: deckId }),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Archived",
          text: "Deck archived successfully.",
          confirmButtonColor: "#7b5cff",
        });

        setDropdownOpen(null);
        fetchUserDecks();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.message || "Could not archive deck.",
        });
      }
    } catch (err) {
      console.error("Archive deck error:", err);

      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong while archiving.",
      });
    }
  };

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
                  <li className={styles.sidebarEmptyText}>Don't have decks yet</li>
                ) : (
                  myDecks.slice(0, 3).map((deck) => (
                    <li key={deck.id} className={styles.sidebarListItem}>
                      <Link to={`/deck/${deck.id}`} className={styles.menuItem}>
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
          </div>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.header}>
          <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search your deck or course title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button type="submit" className={styles.searchBtn}>
              <i className="bx bx-search"></i>
            </button>
          </form>

          <div className={styles.notificationWrapper}>
            <button
              className={styles.notificationBtn}
              onClick={(e) => {
                e.stopPropagation();
                setNotificationOpen((prev) => !prev);
                setDropdownOpen(null);
              }}
            >
              <i className="bx bx-bell"></i>

              {notificationCount > 0 && (
                <span className={styles.notificationBadge}>{notificationCount}</span>
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
                {filteredCourses.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>
                    {searchQuery ? "No matching courses found" : "No courses yet"}
                  </p>
                ) : (
                  filteredCourses.slice(0, 3).map((course, index) => {
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
                        />

                        <div className={styles.cardBody}>
                          <p className={styles.deckTitle}>
                            {course.title || "Untitled Course"}
                          </p>

                          <div className={styles.courseProgressWrap}>
                            <div className={styles.courseProgressRing}>
                              <svg viewBox="0 0 48 48" className={styles.courseProgressSvg}>
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
                <button className={styles.btnAdd} onClick={() => setShowPopup(true)}>
                  Add Deck
                </button>

                <button className={styles.btnShow} onClick={() => navigate("/Mydecks")}>
                  Show All
                </button>
              </div>
            </div>

            <div className={styles.myDecksArea}>
              <div className={styles.myDecksGrid}>
                {filteredDecks.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>
                    {searchQuery ? "No matching decks found" : "Don’t have decks yet"}
                  </p>
                ) : (
                  filteredDecks.slice(0, 4).map((deck) => {
                    const deckColorValue = deck.deck_color || "#C3C7F3";

                    return (
                      <Link
                        key={deck.id}
                        to={`/deck/${deck.id}`}
                        className={styles.deckLink}
                      >
                        <article className={styles.deckCard}>
                          <div
                            className={styles.cardTop}
                            style={{ backgroundColor: deckColorValue }}
                          >
                            <div
                              className={styles.cardOverlay}
                              style={{ backgroundColor: deckColorValue }}
                            />

                            <button
                              type="button"
                              className={styles.cardMenu}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setNotificationOpen(false);
                                setDropdownOpen((prev) =>
                                  prev === deck.id ? null : deck.id
                                );
                              }}
                            >
                              <i className="bx bx-dots-vertical-rounded"></i>
                            </button>

                            {dropdownOpen === deck.id && (
                              <div
                                className={styles.cardDropdown}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    console.log("Edit", deck.id);
                                    setDropdownOpen(null);
                                  }}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    console.log("Duplicate", deck.id);
                                    setDropdownOpen(null);
                                  }}
                                >
                                  Duplicate
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteDeck(deck.id)}
                                >
                                  Archive
                                </button>
                              </div>
                            )}
                          </div>

                          <div className={styles.cardBody}>
                            <p className={styles.deckTitle}>{deck.title}</p>
                            <span className={styles.deckCount}>
                              {deck.card_count ?? 0} cards
                            </span>
                          </div>
                        </article>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>

        {showPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupContainer}>
              <div className={styles.popupHeaderBar}>
                <h2 className={styles.popupHeaderTitle}>Create New Deck</h2>
              </div>

              <div className={styles.subtitleForm}>
                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Deck Title</label>
                  <input
                    type="text"
                    placeholder="Enter your deck name"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    className={styles.newdecktitle}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Description</label>
                  <input
                    type="text"
                    placeholder="Optional description"
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    className={styles.newdecktitle}
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
                        onChange={(e) => setDeckVisibility(e.target.value)}
                      />
                      Public
                    </label>

                    <label className={styles.pubpriv}>
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={deckVisibility === "private"}
                        onChange={(e) => setDeckVisibility(e.target.value)}
                      />
                      Private
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Deck Color</label>

                  <div className={styles.colorOptions}>
                    {deckColors.map((color) => (
                      <div
                        key={color}
                        className={`${styles.colorCircle} ${
                          deckColor === color ? styles.selected : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setDeckColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.popupDivider}></div>

                <div className={styles.startsaveContainer}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>

                  <button className={styles.popaddBtn} onClick={handleAddDeck}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className={styles.rightSidebar}>
        <div className={styles.profileSection}>
          <div className={styles.profileAvatar}>
            <img
              src={user.profile_image || "/images/temporary profile.jpg"}
              alt="Profile"
              className={styles.profileAvatarImg}
            />
          </div>

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

        <div className={styles.settingsContainer}>
          <Link to="/edit-profile" className={styles.settingsFooter}>
            <i className="bx bx-cog"></i>
            <span>Settings</span>
          </Link>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <i className="bx bx-log-out"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export default Homepage;