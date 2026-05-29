import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "./homepage.module.css";
import Calendar from "./Calendar";
import TodoList from "./TodoList";
import { API_BASE } from "../../config.js";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";

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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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

  const DECK_TITLE_LIMIT = 100;
  const DECK_DESCRIPTION_LIMIT = 300;

  const limitChars = (value, limit) => String(value || "").slice(0, limit);

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const hasRepeatedPattern = (value = "") => {
    const text = String(value).trim().toLowerCase();
    const compact = text.replace(/\s+/g, "");

    if (!compact) return false;

    if (/(.)\1{7,}/.test(compact)) return true;
    if (/(.{2,8})\1{3,}/.test(compact)) return true;

    const words = text.split(/\s+/).filter(Boolean);
    const repeatedWords = words.some((word, index) => {
      return (
        word.length > 2 &&
        words[index + 1] === word &&
        words[index + 2] === word
      );
    });

    if (repeatedWords) return true;

    if (compact.length >= 45 && !text.includes(" ")) {
      const vowels = (compact.match(/[aeiou]/g) || []).length;
      const vowelRatio = vowels / compact.length;
      const hasKeyboardRun =
        /(qwerty|asdf|zxcv|dfgh|jkl|wq|qw|zx|xz)/i.test(compact);

      if (vowelRatio < 0.22 || hasKeyboardRun) return true;
    }

    return false;
  };

  const showInvalidTextAlert = (fieldName) => {
    Swal.fire({
      icon: "warning",
      title: "Invalid Text",
      text: `${fieldName} contains repeated or random text. Please enter a clear ${fieldName.toLowerCase()}.`,
      confirmButtonColor: "#7b5cff",
    });
  };

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
    const cleanTitle = limitChars(deckTitle, DECK_TITLE_LIMIT).trim();
    const cleanDescription = limitChars(
      deckDescription,
      DECK_DESCRIPTION_LIMIT
    ).trim();

    if (!cleanTitle) {
      Swal.fire({
        icon: "warning",
        title: "Missing title",
        text: "Please enter a deck title.",
        confirmButtonColor: "#7b5cff",
      });
      return;
    }

    if (cleanTitle.length > DECK_TITLE_LIMIT) {
      Swal.fire({
        icon: "warning",
        title: "Title Too Long",
        text: `Deck title must not exceed ${DECK_TITLE_LIMIT} characters.`,
        confirmButtonColor: "#7b5cff",
      });
      return;
    }

    if (cleanDescription.length > DECK_DESCRIPTION_LIMIT) {
      Swal.fire({
        icon: "warning",
        title: "Description Too Long",
        text: `Description must not exceed ${DECK_DESCRIPTION_LIMIT} characters.`,
        confirmButtonColor: "#7b5cff",
      });
      return;
    }

    if (hasRepeatedPattern(cleanTitle)) {
      showInvalidTextAlert("Deck Title");
      return;
    }

    if (cleanDescription && hasRepeatedPattern(cleanDescription)) {
      showInvalidTextAlert("Description");
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

    if (hasRepeatedPattern(finalCategory)) {
      showInvalidTextAlert("Category");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", cleanTitle);
      formData.append("description", cleanDescription);
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

    const currentTitle = deck.title || "";
    const currentDescription = deck.description || "";
    const currentCategory = deck.category || "Reviewer";
    const currentVisibility = deck.visibility || "private";
    const currentColor = deck.deck_color || deck.deckColor || "#C3C7F3";

    const categoryOptions = categories
      .filter((cat) => cat !== "Others")
      .map(
        (cat) =>
          `<option value="${escapeHtml(cat)}" ${
            currentCategory === cat ? "selected" : ""
          }>${escapeHtml(cat)}</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      customClass: {
        popup: styles.editDeckPopup,
        htmlContainer: styles.editDeckHtml,
        actions: styles.editDeckActions,
        confirmButton: styles.editDeckSaveBtn,
        cancelButton: styles.editDeckCancelBtn,
      },
      buttonsStyling: false,
      html: `
        <div class="${styles.editDeckModal}">
          <div class="${styles.editDeckHeader}">
            <span>Edit Deck</span>
          </div>

          <div class="${styles.editDeckForm}">
            <label class="${styles.editDeckLabel}">Deck Title</label>
            <input
              id="swal-title"
              class="${styles.editDeckInput}"
              placeholder="Enter your deck name"
              maxlength="${DECK_TITLE_LIMIT}"
              value="${escapeHtml(currentTitle)}"
            />
            <small id="swal-title-count" class="${styles.charCounter}">
              ${currentTitle.length}/${DECK_TITLE_LIMIT} characters
            </small>

            <label class="${styles.editDeckLabel}">Description</label>
            <textarea
              id="swal-desc"
              class="${styles.editDeckTextarea}"
              placeholder="Optional"
              maxlength="${DECK_DESCRIPTION_LIMIT}"
            >${escapeHtml(currentDescription)}</textarea>
            <small id="swal-desc-count" class="${styles.charCounter}">
              ${currentDescription.length}/${DECK_DESCRIPTION_LIMIT} characters
            </small>

            <label class="${styles.editDeckLabel}">Category</label>
            <select id="swal-category" class="${styles.editDeckSelect}">
              ${categoryOptions}
            </select>

            <label class="${styles.editDeckLabel}">Visibility</label>
            <div class="${styles.editDeckRadioRow}">
              <label>
                <input
                  type="radio"
                  name="swal-visibility"
                  value="public"
                  ${currentVisibility === "public" ? "checked" : ""}
                />
                Public
              </label>

              <label>
                <input
                  type="radio"
                  name="swal-visibility"
                  value="private"
                  ${currentVisibility !== "public" ? "checked" : ""}
                />
                Private
              </label>
            </div>

            <label class="${styles.editDeckLabel}">Deck Color</label>
            <div class="${styles.editDeckColorRow}">
              ${deckColors
                .map(
                  (color) => `
                    <button
                      type="button"
                      class="${styles.editDeckColorDot}"
                      data-color="${color}"
                      style="background:${color}; ${
                    currentColor === color ? "outline: 3px solid #111;" : ""
                  }"
                    ></button>
                  `
                )
                .join("")}
            </div>

            <input id="swal-color" type="hidden" value="${currentColor}" />
          </div>
        </div>
      `,
      didOpen: () => {
        const titleInput = document.getElementById("swal-title");
        const descInput = document.getElementById("swal-desc");
        const titleCount = document.getElementById("swal-title-count");
        const descCount = document.getElementById("swal-desc-count");

        titleInput?.addEventListener("input", () => {
          titleCount.textContent = `${titleInput.value.length}/${DECK_TITLE_LIMIT} characters`;
        });

        descInput?.addEventListener("input", () => {
          descCount.textContent = `${descInput.value.length}/${DECK_DESCRIPTION_LIMIT} characters`;
        });

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
      reverseButtons: true,
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

        if (title.length > DECK_TITLE_LIMIT) {
          Swal.showValidationMessage(
            `Deck title must not exceed ${DECK_TITLE_LIMIT} characters.`
          );
          return false;
        }

        if (description.length > DECK_DESCRIPTION_LIMIT) {
          Swal.showValidationMessage(
            `Description must not exceed ${DECK_DESCRIPTION_LIMIT} characters.`
          );
          return false;
        }

        if (hasRepeatedPattern(title)) {
          Swal.showValidationMessage(
            "Deck title contains repeated or random text."
          );
          return false;
        }

        if (description && hasRepeatedPattern(description)) {
          Swal.showValidationMessage(
            "Description contains repeated or random text."
          );
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
      className={`homepage ${styles.container} ${
        isCollapsed ? styles.sidebarCollapsed : ""
      }`}
    >
      <UserSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        myDecks={myDecks}
        courses={courses}
        openCourse={openCourse}
        getDeckId={getDeckId}
      />

      <div className={styles.mainArea}>
        <UserHeader
          isCollapsed={isCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearchSubmit={handleSearchSubmit}
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          setDropdownOpen={setDropdownOpen}
          notificationCount={notificationCount}
          notifications={notifications}
          markNotificationsAsRead={markNotificationsAsRead}
          user={user}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          handleLogout={handleLogout}
          hideProfile={false}
        />

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
                    {searchQuery
                      ? "No matching courses found"
                      : "No courses yet"}
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
                    {searchQuery
                      ? "No matching decks found"
                      : "Don’t have decks yet"}
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
                    maxLength={DECK_TITLE_LIMIT}
                    onChange={(e) =>
                      setDeckTitle(limitChars(e.target.value, DECK_TITLE_LIMIT))
                    }
                    className={styles.newdecktitle}
                  />

                  <small
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#666",
                    }}
                  >
                    {deckTitle.length}/{DECK_TITLE_LIMIT} characters
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.deckinfo}>Description</label>

                  <input
                    type="text"
                    placeholder="Optional description"
                    value={deckDescription}
                    maxLength={DECK_DESCRIPTION_LIMIT}
                    onChange={(e) =>
                      setDeckDescription(
                        limitChars(e.target.value, DECK_DESCRIPTION_LIMIT)
                      )
                    }
                    className={styles.newdecktitle}
                  />

                  <small
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#666",
                    }}
                  >
                    {deckDescription.length}/{DECK_DESCRIPTION_LIMIT} characters
                  </small>
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