import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "boxicons/css/boxicons.min.css";
import { API_BASE } from "../../config.js";
import styles from "./Mycourse.module.css";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";

export default function MyCourse() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [myDecks, setMyDecks] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notificationCount = notifications.filter(
    (notif) => notif.status === "unread"
  ).length;

  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("");

  const [user, setUser] = useState({
    username: "",
    year_level: "",
    profile_image: "/images/temporary profile.jpg",
  });

  const fetchAddedCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/getMyCourses.php`, {
        credentials: "include",
      });

      const data = await res.json();
      setCourses(data.success ? data.courses || [] : []);
    } catch (err) {
      console.error("Fetch courses error:", err);
      setCourses([]);
    }
  };

  const fetchUserDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/userDecks.php`, {
        credentials: "include",
      });

      const data = await res.json();
      setMyDecks(data.success ? data.decks || [] : []);
    } catch (err) {
      console.error("Fetch decks error:", err);
      setMyDecks([]);
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
      console.error("Fetch user error:", err);
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
    fetchAddedCourses();
    fetchUserDecks();
    fetchUser();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const insideDropdown = e.target.closest(
        `.${styles.dropdownBtn}, .${styles.dropdownContent}, .${styles.notificationWrapper}, .${styles.customDropdown}, .${styles.searchBar}`
      );

      if (!insideDropdown) {
        setProfileDropdownOpen(false);
        setNotificationOpen(false);
        setOpenFilterDropdown(null);
      }
    };

    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const getCourseVisibility = (course) => {
    return (
      course.visibility ||
      course.course_visibility ||
      course.status ||
      "private"
    ).toLowerCase();
  };

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();

    return courses.filter((course) => {
      const visibility = getCourseVisibility(course);
      const progress = course.progress ?? course.completion ?? 0;

      const searchableText = [
        course.title,
        course.description,
        course.subject,
        course.category,
        course.learning_objectives,
        visibility,
        progress,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || searchableText.includes(q);

      const matchesFilter =
        !selectedFilter ||
        (selectedFilter === "private" && visibility === "private") ||
        (selectedFilter === "shared" &&
          (visibility === "public" || visibility === "shared"));

      return matchesSearch && matchesFilter;
    });
  }, [courses, search, selectedFilter]);

  const openCourse = (courseId) => {
    navigate(`/learning/${courseId}`);
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

 return (
  <div
    className={`${styles.container} ${
      isCollapsed ? styles.sidebarCollapsed : ""
    }`}
  >
    <UserSidebar
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      myDecks={myDecks}
      courses={courses}
      openCourse={openCourse}
      getDeckId={(deck) => deck?.deck_id || deck?.id || deck?.DeckID || ""}
    />

<div className={styles.mainArea}>
  <div className={styles.gridContainer}>
    <UserHeader
      isCollapsed={isCollapsed}
      searchQuery={search}
      setSearchQuery={setSearch}
      handleSearchSubmit={(e) => e.preventDefault()}
      notificationOpen={notificationOpen}
      setNotificationOpen={setNotificationOpen}
      setDropdownOpen={setOpenFilterDropdown}
      notificationCount={notificationCount}
      notifications={notifications}
      markNotificationsAsRead={markNotificationsAsRead}
      user={user}
      profileDropdownOpen={profileDropdownOpen}
      setProfileDropdownOpen={setProfileDropdownOpen}
      handleLogout={handleLogout}
    />
          <main className={styles.main}>
            <div className={styles.panel}>
              <div className={styles.purpleStrip}></div>

              <div className={styles.panelHeader}>
                <h1>My Courses</h1>

                <div className={styles.filterGroup}>
                  <div className={styles.customDropdown}>
                    <button
                      type="button"
                      className={styles.customDropdownBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileDropdownOpen(false);
                        setNotificationOpen(false);
                        setOpenFilterDropdown(
                          openFilterDropdown === "courseType"
                            ? null
                            : "courseType"
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

                    {openFilterDropdown === "courseType" && (
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

              <div className={styles.headerDivider}></div>

              <div className={styles.deckArea}>
                {courses.length === 0 ? (
                  <div className={styles.emptyState}>
                    <img
                      src="/images/cute1.png"
                      alt="No courses"
                      className={styles.emptyImg}
                    />

                    <p className={styles.emptyText}>
                      You haven't added any courses yet.
                    </p>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className={styles.emptyState}>
                    <img
                      src="/images/cute1.png"
                      alt="No courses"
                      className={styles.emptyImg}
                    />

                    <p className={styles.emptyText}>
                      No courses found for “{search}”.
                    </p>
                  </div>
                ) : (
                  filteredCourses.map((course, index) => {
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

                    const colorClass =
                      index % 3 === 0
                        ? styles.blue
                        : index % 3 === 1
                        ? styles.pink
                        : styles.violet;

                    return (
                      <article
                        key={course.id}
                        className={`${styles.deckCard} ${colorClass}`}
                        onClick={() => openCourse(course.id)}
                      >
                        <div className={styles.deckTop}></div>

                        <div className={styles.deckBody}>
                          <p className={styles.courseLabel}>COURSE</p>
                          <h4>{course.title || "Untitled Course"}</h4>

                          <div className={styles.progressWrap}>
                            <div className={styles.progressRing}>
                              <svg
                                viewBox="0 0 48 48"
                                className={styles.progressSvg}
                              >
                                <circle
                                  className={styles.progressBg}
                                  cx="24"
                                  cy="24"
                                  r={radius}
                                />
                                <circle
                                  className={styles.progressValue}
                                  cx="24"
                                  cy="24"
                                  r={radius}
                                  strokeDasharray={circumference}
                                  strokeDashoffset={dashOffset}
                                />
                              </svg>
                            </div>

                            <span className={styles.progressText}>
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
          </main>
        </div>
      </div>
    </div>
  );
}