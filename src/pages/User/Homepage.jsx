import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "./homepage.module.css";
import Calendar from "./Calendar";
import TodoList from "./TodoList";
import { API_BASE } from "../../config.js";

function Homepage() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [myDecks, setMyDecks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deckCategory, setDeckCategory] = useState("Reviewer");
  const [customCategory, setCustomCategory] = useState("");
  const [deckVisibility, setDeckVisibility] = useState("private");
  const [deckColor, setDeckColor] = useState("#C3C7F3");

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [user, setUser] = useState({
    id: "",
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const categories = [
    "Reviewer",
    "Mathematics",
    "Science",
    "English",
    "Programming",
    "History",
    "Research",
    "Networking",
    "Database",
    "Web Development",
    "Cybersecurity",
    "Business",
    "Others",
  ];

  const deckColors = [
    "#C8BBD0",
    "#E0BBD4",
    "#C3C7F3",
    "#90F897",
    "#CF8686",
    "#EECB99",
  ];

  const notificationCount = notifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/temporary profile.jpg";

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const cleanPath = imagePath.replace(/^\/+/, "");
    return `https://puffybrain.fun/${cleanPath}`;
  };

  const getDeckId = (deck) => {
    return deck?.deck_id || deck?.id || deck?.DeckID || "";
  };

  const isDeckOwner = (deck) => {
    const source = String(deck?.deck_source || deck?.source || "").toLowerCase();

    if (source && source !== "created") {
      return false;
    }

    const ownerId =
      deck?.created_by ||
      deck?.creator_id ||
      deck?.user_id ||
      deck?.UserID ||
      deck?.owner_id;

    if (!ownerId) {
      return true;
    }

    return Number(ownerId) === Number(user.id);
  };

  const filteredDecks = myDecks.filter((deck) =>
    deck.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetDeckForm = () => {
    setDeckTitle("");
    setDeckDescription("");
    setDeckCategory("Reviewer");
    setCustomCategory("");
    setDeckVisibility("private");
    setDeckColor("#C3C7F3");
  };

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
      navigate(`/deck/${getDeckId(foundDeck)}`);
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

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        popup: styles.logoutSwalPopup,
        title: styles.logoutSwalTitle,
        htmlContainer: styles.logoutSwalText,
        actions: styles.logoutSwalActions,
        confirmButton: styles.logoutSwalConfirm,
        cancelButton: styles.logoutSwalCancel,
        icon: styles.logoutSwalIcon,
      },
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/logout.php`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.clear();
    sessionStorage.clear();

    window.location.replace("/login");
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/userDecks.php`, {
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
      const res = await fetch(`${API_BASE}/getUser.php`, {
        credentials: "include",
      });

      const text = await res.text();
      console.log("GET USER RAW:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("getUser.php did not return JSON");
        return;
      }

      if (data.success) {
        const loadedUser = data.user || data;

        setUser({
          id: loadedUser.id || loadedUser.user_id || "",
          username: loadedUser.username || "",
          year_level: loadedUser.year_level || "",
          profile_image: getImageUrl(loadedUser.profile_image),
        });

        if (loadedUser.id || loadedUser.user_id) {
          localStorage.setItem("user_id", loadedUser.id || loadedUser.user_id);
        }
      }
    } catch (err) {
      console.error("fetchUser error:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/getMyCourses.php`, {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/getUserNotifications.php`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setNotifications(data.success ? data.notifications || [] : []);
    } catch (err) {
      console.error("Notification fetch error:", err);
      setNotifications([]);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/markNotificationsAsRead.php`, {
        method: "POST",
        credentials: "include",
      });

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

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
  };

  useEffect(() => {
    fetchUserDecks();
    fetchUser();
    fetchCourses();
    fetchNotifications();
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

    const finalCategory =
      deckCategory === "Others" ? customCategory.trim() : deckCategory;

    if (!finalCategory) {
      Swal.fire({
        icon: "warning",
        title: "Missing category",
        text: "Please enter a category.",
        confirmButtonColor: "#7b5cff",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", deckTitle.trim());
      formData.append("description", deckDescription.trim());
      formData.append("category", finalCategory);
      formData.append("visibility", deckVisibility);
      formData.append("deck_color", deckColor);

      const res = await fetch(`${API_BASE}/userDecks.php`, {
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
        resetDeckForm();
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

  const handleEditDeck = async (deck) => {
    const deckId = getDeckId(deck);

    if (!deckId) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: "Missing deck ID.",
      });
      return;
    }

    const categoryOptions = categories
      .filter((cat) => cat !== "Others")
      .map(
        (cat) =>
          `<option value="${cat}" ${
            deck.category === cat ? "selected" : ""
          }>${cat}</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Edit Deck",
      customClass: {
        popup: styles.editDeckPopup,
        title: styles.editDeckTitle,
        htmlContainer: styles.editDeckHtml,
        actions: styles.editDeckActions,
        confirmButton: styles.editDeckSaveBtn,
        cancelButton: styles.editDeckCancelBtn,
      },
      buttonsStyling: false,
      html: `
        <div class="${styles.editDeckForm}">
          <label class="${styles.editDeckLabel}">Deck Title</label>
          <input id="swal-title" class="${styles.editDeckInput}" placeholder="Enter your deck name" value="${deck.title || ""}" />

          <label class="${styles.editDeckLabel}">Description</label>
          <textarea id="swal-desc" class="${styles.editDeckTextarea}" placeholder="Optional">${deck.description || ""}</textarea>

          <label class="${styles.editDeckLabel}">Category</label>
          <select id="swal-category" class="${styles.editDeckSelect}">
            ${categoryOptions}
          </select>

          <label class="${styles.editDeckLabel}">Visibility</label>
          <div class="${styles.editDeckRadioRow}">
            <label>
              <input type="radio" name="swal-visibility" value="public" ${deck.visibility === "public" ? "checked" : ""} />
              Public
            </label>

            <label>
              <input type="radio" name="swal-visibility" value="private" ${deck.visibility !== "public" ? "checked" : ""} />
              Private
            </label>
          </div>

          <label class="${styles.editDeckLabel}">Choose Deck Color</label>
          <div class="${styles.editDeckColorRow}">
            ${deckColors
              .map(
                (color) => `
                  <button
                    type="button"
                    class="${styles.editDeckColorDot}"
                    data-color="${color}"
                    style="background:${color}; ${
                      (deck.deck_color || deck.deckColor) === color
                        ? "outline: 3px solid #111;"
                        : ""
                    }"
                  ></button>
                `
              )
              .join("")}
          </div>

          <input id="swal-color" type="hidden" value="${deck.deck_color || deck.deckColor || "#c9cdfa"}" />
        </div>
      `,
      didOpen: () => {
        document
          .querySelectorAll(`.${styles.editDeckColorDot}`)
          .forEach((btn) => {
            btn.addEventListener("click", () => {
              document.getElementById("swal-color").value = btn.dataset.color;

              document
                .querySelectorAll(`.${styles.editDeckColorDot}`)
                .forEach((dot) => {
                  dot.style.outline = "none";
                });

              btn.style.outline = "3px solid #111";
            });
          });
      },
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const title = document.getElementById("swal-title").value.trim();
        const description = document.getElementById("swal-desc").value.trim();
        const category = document.getElementById("swal-category").value;
        const visibility = document.querySelector(
          'input[name="swal-visibility"]:checked'
        )?.value;
        const deckColor = document.getElementById("swal-color").value;

        if (!title) {
          Swal.showValidationMessage("Deck title is required.");
          return false;
        }

        return {
          title,
          description,
          category,
          visibility,
          deckColor,
        };
      },
    });

    if (!formValues) return;

    try {
      const formData = new FormData();

      formData.append("deckId", deckId);
      formData.append("deck_id", deckId);
      formData.append("title", formValues.title);
      formData.append("description", formValues.description);
      formData.append("category", formValues.category);
      formData.append("visibility", formValues.visibility);
      formData.append("deck_color", formValues.deckColor);

      const res = await fetch(`${API_BASE}/updateDeck.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        await fetchUserDecks();

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

      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong while updating the deck.",
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
      buttonsStyling: false,
      customClass: {
        popup: styles.swalPopup,
        title: styles.swalTitle,
        htmlContainer: styles.swalText,
        actions: styles.swalActions,
        confirmButton: styles.swalConfirm,
        cancelButton: styles.swalCancel,
        icon: styles.swalIcon,
      },
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/archiveDeck.php`, {
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
                  to="/mydecks"
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
                  myDecks.slice(0, 3).map((deck) => {
                    const deckId = getDeckId(deck);

                    return (
                      <li key={deckId} className={styles.sidebarListItem}>
                        <Link to={`/deck/${deckId}`} className={styles.menuItem}>
                          <i className="bx bx-collection"></i>
                          <span className={styles.menuText}>{deck.title}</span>
                        </Link>
                      </li>
                    );
                  })
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
                        {notif.target_role || notif.recipient_type || "user"}
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
        </header>

        <main className={styles.mainContent}>
          <div className={styles.centerBox}>
            <h1>Hello, {user.username || "User"}!</h1>
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
                  onClick={() => navigate("/mydecks")}
                >
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
                    const deckId = getDeckId(deck);
                    const deckColorValue = deck.deck_color || "#C3C7F3";
                    const canEdit = isDeckOwner(deck);

                    return (
                      <Link
                        key={deckId}
                        to={`/deck/${deckId}`}
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
                                  prev === deckId ? null : deckId
                                );
                              }}
                            >
                              <i className="bx bx-dots-vertical-rounded"></i>
                            </button>

                            {dropdownOpen === deckId && (
                              <div
                                className={styles.cardDropdown}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                {canEdit ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleEditDeck(deck);
                                        setDropdownOpen(null);
                                      }}
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        console.log("Duplicate", deckId);
                                        setDropdownOpen(null);
                                      }}
                                    >
                                      Duplicate
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDeck(deckId)}
                                    >
                                      Archive
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className={styles.notEditableBtn}
                                  >
                                    Not editable
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className={styles.cardBody}>
                            <p className={styles.deckTitle}>{deck.title}</p>

                            <p className={styles.deckCategoryText}>
                              <i className="bx bxs-book"></i>
                              <span>{deck.category || "Reviewer"}</span>
                            </p>

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
                  <label className={styles.deckinfo}>Category</label>

                  <select
                    className={styles.newdecktitle}
                    value={deckCategory}
                    onChange={(e) => {
                      setDeckCategory(e.target.value);

                      if (e.target.value !== "Others") {
                        setCustomCategory("");
                      }
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {deckCategory === "Others" && (
                    <input
                      type="text"
                      placeholder="Type category"
                      value={customCategory}
                      maxLength={30}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(
                          /[^A-Za-z0-9 ]/g,
                          ""
                        );
                        setCustomCategory(cleanValue);
                      }}
                      className={`${styles.newdecktitle} ${styles.customCategoryInput}`}
                    />
                  )}
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
                    onClick={() => {
                      setShowPopup(false);
                      resetDeckForm();
                    }}
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
              onError={(e) => {
                e.currentTarget.src = "/images/temporary profile.jpg";
              }}
            />
          </div>

          <h3 className={styles.profileName}>{user.username || "User"}</h3>

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