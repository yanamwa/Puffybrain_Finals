import { Link, NavLink } from "react-router-dom";
import styles from "./UserHeader.module.css";

export default function UserHeader({
  isCollapsed,
  searchQuery = "",
  setSearchQuery,
  handleSearchSubmit,
  notificationOpen,
  setNotificationOpen,
  setDropdownOpen,
  notificationCount = 0,
  notifications = [],
  markNotificationsAsRead,
  user,
  profileDropdownOpen,
  setProfileDropdownOpen,
  handleLogout,
  hideProfile = false,
}) {
  return (
    <header
      className={`${styles.header} ${
        isCollapsed ? styles.collapsedHeader : ""
      }`}
    >
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

      <div className={styles.profileWrapper}>
        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className={styles.notificationBtn}
            onClick={(e) => {
              e.stopPropagation();
              setNotificationOpen((prev) => !prev);
              setProfileDropdownOpen?.(false);
              setDropdownOpen?.(null);
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
                    {notif.created_at
                      ? new Date(notif.created_at).toLocaleString()
                      : ""}
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

        {!hideProfile && (
          <>
            <Link to="/user-profile" className={styles.profileLink}>
              <div className={styles.dpContainer}>
                <img
                  src={user?.profile_image || "/images/temporary profile.jpg"}
                  alt="Profile"
                  className={styles.profilePic}
                  onError={(e) => {
                    e.currentTarget.src = "/images/temporary profile.jpg";
                  }}
                />
              </div>

              <div className={styles.userInfo}>
                <p>{user?.username || "User"}</p>
              </div>
            </Link>

            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropdownBtn}
                onClick={(e) => {
                e.stopPropagation();

                setTimeout(() => {
                  setProfileDropdownOpen((prev) => !prev);
                  setNotificationOpen(false);
                  setDropdownOpen?.(null);
                }, 0);
              }}
              >
                <i className="bx bx-chevron-down"></i>
              </button>

              <div
                className={`${styles.dropdownContent} ${
                  profileDropdownOpen ? styles.show : ""
                }`}
              >
                <NavLink to="/edit-profile">
                  <i className="bx bx-cog"></i>
                  <span>Settings</span>
                </NavLink>

                <NavLink to="/faq">
                  <i className="bx bx-help-circle"></i>
                  <span>FAQs</span>
                </NavLink>

                <button type="button" onClick={handleLogout}>
                  <i className="bx bx-log-out"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}