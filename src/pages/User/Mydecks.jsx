import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";
import styles from "./Mydecks.module.css";

function MyDecks() {
  const navigate = useNavigate();

  const swalStyle = {
    popup: styles.swalPopup,
    title: styles.swalTitle,
    htmlContainer: styles.swalText,
    confirmButton: styles.swalConfirmBtn,
    cancelButton: styles.swalCancelBtn,
    actions: styles.swalActions,
    icon: styles.swalIcon,
  };

  const styledSwal = (config = {}) => {
    return Swal.fire({
      buttonsStyling: false,
      confirmButtonText: "Okay",
      customClass: swalStyle,
      ...config,
    });
  };

  const styledConfirmSwal = (config = {}) => {
    return Swal.fire({
      buttonsStyling: false,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      customClass: swalStyle,
      ...config,
    });
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [openFilterDropdown, setOpenFilterDropdown] = useState(null);

    const [addPopupOpen, setAddPopupOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const [deckTitle, setDeckTitle] = useState("");
    const [deckDesc, setDeckDesc] = useState("");
    const [deckCategory, setDeckCategory] = useState("Reviewer");
    const [customCategory, setCustomCategory] = useState("");
    const [visibility, setVisibility] = useState("");
    const [deckColor, setDeckColor] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [decks, setDecks] = useState([]);
    const [myDecks, setMyDecks] = useState([]);
    const [courses, setCourses] = useState([]);

    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const notificationCount = notifications.filter(
      (notif) => notif.status === "unread"
    ).length;

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

    const [user, setUser] = useState({
      username: "",
      year_level: "",
      profile_image: "/images/temporary profile.jpg",
    });

    const resetAddForm = () => {
      setDeckTitle("");
      setDeckDesc("");
      setDeckCategory("Reviewer");
      setCustomCategory("");
      setVisibility("");
      setDeckColor("");
    };

    const handleLogout = () => {
  Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#8d6cab",
    cancelButtonColor: "#b0b0b0",
    confirmButtonText: "Yes, Logout",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    customClass: {
      popup: styles.logoutPopup,
      title: styles.logoutTitle,
      htmlContainer: styles.logoutText,
      confirmButton: styles.logoutConfirm,
      cancelButton: styles.logoutCancel,
    },
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/logout.php`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout API error:", err);
    }

    localStorage.removeItem("username");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_id");
    localStorage.removeItem("profile_image");

    sessionStorage.clear();

    navigate("/login", { replace: true });
  });
};

    const normalizeDeck = (deck) => {
    const visibilityValue = deck.visibility || "private";

    return {
      id: deck.deck_id || deck.id,
      title: deck.title || "",
      description: deck.description || "",
      category: deck.category || "Reviewer",
      cards: Number(deck.card_count || deck.cards || 0),
      type: visibilityValue === "public" ? "shared" : "private",
      visibility: visibilityValue,
      source: deck.deck_source || "created",
      deckColor: deck.deck_color || deck.deckColor || "#c9cdfa",
    };
  };

    const fetchUserDecks = async () => {
      try {
        const res = await fetch(`${API_BASE}/userDecks.php`, {
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
        const res = await fetch(`${API_BASE}/getMyCourses.php`, {
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
        const res = await fetch(`${API_BASE}/getUser.php`, {
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
          `${API_BASE}/getUserNotifications.php`,
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
          `${API_BASE}/markNotificationsAsRead.php`,
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
          deck.category.toLowerCase().includes(q) ||
          deck.visibility.toLowerCase().includes(q) ||
          deck.type.toLowerCase().includes(q) ||
          String(deck.cards).includes(q);

          const visibility = String(deck.visibility || "").trim().toLowerCase();
            const source = String(deck.source || "").trim().toLowerCase();
            const type = String(deck.type || "").trim().toLowerCase();

            const matchesFilter =
              selectedFilter === ""
                ? true
                : selectedFilter === "private"
                ? source === "created" && visibility === "private"
                : selectedFilter === "public"
                ? source === "created" && visibility === "public"
                : selectedFilter === "shared"
                ? source === "created" && (visibility === "shared" || type === "shared")
                : selectedFilter === "mydecks"
                ? source === "created"
                : selectedFilter === "publicdecks"
                ? source === "saved_public"
                : true;

        const matchesCategory =
          !selectedCategory || deck.category === selectedCategory;

        return matchesSearch && matchesFilter && matchesCategory;
      });
    }, [decks, search, selectedFilter, selectedCategory]);

    const openDeck = (deckId) => {
      navigate(`/deck/${deckId}`);
    };

    const openCourse = (courseId) => {
      navigate(`/learning/${courseId}`);
    };

    const handleAddDeck = async () => {
      if (!deckTitle.trim()) {
        styledSwal({
          icon: "warning",
          title: "Missing title",
          text: "Please enter a deck title.",
        });
        return;
      }

      const finalCategory =
        deckCategory === "Others" ? customCategory.trim() : deckCategory;

      if (!finalCategory) {
        styledSwal({
          icon: "warning",
          title: "Missing category",
          text: "Please enter a category.",
        });
        return;
      }

      if (!/^[A-Za-z0-9 ]+$/.test(finalCategory)) {
        styledSwal({
          icon: "warning",
          title: "Invalid category",
          text: "Only letters and numbers are allowed.",
        });
        return;
      }

      if (!visibility) {
        styledSwal({
          icon: "warning",
          title: "Missing visibility",
          text: "Please choose Public or Private.",
        });
        return;
      }

      if (!deckColor) {
        styledSwal({
          icon: "warning",
          title: "Missing color",
          text: "Please choose a deck color.",
        });
        return;
      }

      try {
        const formData = new FormData();

        formData.append("title", deckTitle.trim());
        formData.append("description", deckDesc.trim());
        formData.append("category", finalCategory);
        formData.append("visibility", visibility);
        formData.append("deck_color", deckColor);

        const res = await fetch(`${API_BASE}/userDecks.php`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          setAddPopupOpen(false);

          styledSwal({
            title: "Deck Added!",
            text: "Your new deck has been successfully added.",
            imageUrl: "/images/success.png",
            imageWidth: 170,
            imageHeight: 170,
            timer: 1200,
            showConfirmButton: false,
          });

          resetAddForm();
          fetchUserDecks();
        } else {
          styledSwal({
            icon: "error",
            title: "Failed",
            text: data.message || "Failed to create deck.",
          });
        }
      } catch (err) {
        console.error("handleAddDeck error:", err);

        styledSwal({
          icon: "error",
          title: "Server Error",
          text: "Something went wrong.",
        });
      }
    };

    const handleEditDeck = async (deck) => {
      const deckId = deck.deck_id || deck.id;

      if (!deckId) {
        styledSwal({
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
    <div class="${styles.editDeckBody}">
            <label class="${styles.editDeckLabel}">Deck Title</label>
            <input
              id="swal-title"
              class="${styles.editDeckInput}"
              placeholder="Enter your deck name"
              value="${deck.title || ""}"
            />

            <label class="${styles.editDeckLabel}">Description</label>
            <textarea
              id="swal-desc"
              class="${styles.editDeckTextarea}"
              placeholder="Optional"
            >${deck.description || ""}</textarea>

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
                  ${deck.visibility === "public" ? "checked" : ""}
                />
                Public
              </label>

              <label>
                <input
                  type="radio"
                  name="swal-visibility"
                  value="private"
                  ${deck.visibility !== "public" ? "checked" : ""}
                />
                Private
              </label>
            </div>

            <label class="${styles.editDeckLabel}">Choose Deck Color</label>
            <div class="${styles.editDeckColorRow}">
              ${["#D7C9F7", "#B8F2D9", "#FFB7A5", "#B5A9FF", "#9EE7DD", "#F4A7C1"]
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

            <input
              id="swal-color"
              type="hidden"
              value="${deck.deck_color || deck.deckColor || "#c9cdfa"}"
            />
          </div>
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

          styledSwal({
            icon: "success",
            title: "Deck updated!",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          styledSwal({
            icon: "error",
            title: "Update failed",
            text: data.message || "Something went wrong.",
          });
        }
      } catch (err) {
        console.error("handleEditDeck error:", err);

        styledSwal({
          icon: "error",
          title: "Server Error",
          text: "Something went wrong while updating the deck.",
        });
      }
    };

    const handleDuplicateDeck = async (deck) => {
      try {
        const formData = new FormData();

        formData.append("title", `${deck.title} (Copy)`);
        formData.append("description", deck.description || "");
        formData.append("category", deck.category || "Reviewer");
        formData.append("visibility", deck.visibility || "private");
        formData.append("deck_color", deck.deckColor || "#c9cdfa");

        const res = await fetch(`${API_BASE}/userDecks.php`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          await fetchUserDecks();

          styledSwal({
            icon: "success",
            title: "Deck duplicated!",
            text: "Only the deck was copied. Cards were not copied.",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          styledSwal({
            icon: "error",
            title: "Duplicate failed",
            text: data.message || "Something went wrong.",
          });
        }
      } catch (err) {
        console.error("handleDuplicateDeck error:", err);

        styledSwal({
          icon: "error",
          title: "Server Error",
          text: "Something went wrong.",
        });
      }
    };

    const handleArchiveDeck = async (deck) => {
      const result = await styledConfirmSwal({
        title: "Archive this deck?",
        text: "You can restore it later.",
        icon: "warning",
        confirmButtonText: "Archive",
      });

      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`${API_BASE}/archiveDeck.php`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deck_id: deck.deck_id || deck.id,
          }),
        });

        const data = await res.json();

        if (data.success) {
          const archivedDeckId = deck.deck_id || deck.id;

          setDecks((prev) =>
            prev.filter((d) => Number(d.id) !== Number(archivedDeckId))
          );

          setMyDecks((prev) =>
            prev.filter(
              (d) => Number(d.deck_id || d.id) !== Number(archivedDeckId)
            )
          );

          styledSwal({
            icon: "success",
            title: "Archived!",
            text: "The deck was archived.",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          styledSwal({
            icon: "error",
            title: "Archive failed",
            text: data.message || "Something went wrong.",
          });
        }
      } catch (err) {
        console.error("Archive error:", err);

        styledSwal({
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
                  placeholder="Search by title, category, public, private..."
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
                              : selectedFilter === "public"
                              ? "Public"
                              : selectedFilter === "shared"
                              ? "Shared"
                              : selectedFilter === "mydecks"
                              ? "My Decks"
                              : selectedFilter === "publicdecks"
                              ? "Public Decks"
                              : "All"}
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
      setSelectedFilter("public");
      setOpenFilterDropdown(null);
    }}
  >
    Public
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

  <button
    type="button"
    onClick={() => {
      setSelectedFilter("mydecks");
      setOpenFilterDropdown(null);
    }}
  >
    My Decks
  </button>

  <button
    type="button"
    onClick={() => {
      setSelectedFilter("publicdecks");
      setOpenFilterDropdown(null);
    }}
  >
    Public Decks
  </button>
</div>
                      )}
                    </div>

                    <div className={styles.customDropdown}>
                      <button
                        type="button"
                        className={styles.customDropdownBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(null);
                          setOpenFilterDropdown(
                            openFilterDropdown === "category" ? null : "category"
                          );
                        }}
                      >
                        <i className="bx bx-book"></i>
                        <span>{selectedCategory || "Categories"}</span>
                        <i className="bx bx-chevron-down"></i>
                      </button>

                      {openFilterDropdown === "category" && (
                        <div className={styles.customDropdownMenu}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory("");
                              setOpenFilterDropdown(null);
                            }}
                          >
                            All Categories
                          </button>

                          {categories
                            .filter((cat) => cat !== "Others")
                            .map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setOpenFilterDropdown(null);
                                }}
                              >
                                {cat}
                              </button>
                            ))}
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
                 {d.source === "created" && (
                        <>
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
                        </>
                      )}
                          </div>

                          <div className={styles.deckBody}>
                            <h4>{d.title}</h4>

                            <p className={styles.deckCategoryText}>
                              <i className="bx bxs-book"></i>
                              <span>{d.category || "Reviewer"}</span>
                            </p>

                            <span className={styles.cardCount}>
                              {d.cards} cards
                            </span>
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

                  <label className={styles.label}>Category</label>
                  <select
                    className={styles.selectInput}
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
      className={`${styles.input} ${styles.customCategoryInput}`}
      placeholder="Type category"
      value={customCategory}
      maxLength={30}
      onChange={(e) => {
        const cleanValue = e.target.value.replace(/[^A-Za-z0-9 ]/g, "");
        setCustomCategory(cleanValue);
      }}
    />
  )}

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
  
  export default MyDecks;
