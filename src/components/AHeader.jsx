import { useState } from "react";
import { Search } from "lucide-react";
import styles from "./AHeaderSidebar.module.css";

export default function AHeader({
  searchQuery,
  setSearchQuery,
  notificationOpen,
  setNotificationOpen,
  bellNotifications,
  handleMarkAllAsRead,
  admin,
  adminImage,
}) {
  const unreadNotifications = bellNotifications.filter(
    (notif) => notif.status === "unread"
  );

  const notificationCount = unreadNotifications.length;

  return (
    <header className={styles.headerContainer}>
      <div className={styles.searchBar}>
        <Search size={19} />

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.headerRight}>
        <div className={styles.notificationWrapper}>
          <button
            type="button"
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
            <div className={styles.notificationHeader}>
              <h4>Notifications</h4>

              {notificationCount > 0 && (
                <button
                  type="button"
                  className={styles.markReadBtn}
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {bellNotifications.length > 0 ? (
              bellNotifications.slice(0, 5).map((item) => (
                <div
                  key={item.notification_id || item.id}
                  className={styles.notificationItem}
                >
                  <div className={styles.notificationTop}>
                    <h5>{item.title || "No title"}</h5>

                    <span className={styles.notificationRole}>
                      {item.recipient_type || "all"}
                    </span>
                  </div>

                  <p className={styles.notificationMessage}>
                    {item.message || "No message"}
                  </p>

                  <p className={styles.notificationCreator}>
                    Posted by {item.created_by || "Admin"}
                  </p>

                  <small className={styles.notificationDate}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "No date"}
                  </small>
                </div>
              ))
            ) : (
              <div className={styles.emptyNotification}>
                <p>You don’t have any new notifications</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.adminHeaderProfile}>
       <img
  src={adminImage || "/images/temporary profile.jpg"}
  alt="Admin"
  className={styles.adminHeaderImg}
  onError={(e) => {
    e.currentTarget.src = "/images/temporary profile.jpg";
  }}
/>
<span className={styles.adminHeaderName}>
  {admin.full_name || admin.FullName || admin.username || "Admin"}
</span>
        </div>
      </div>
    </header>
  );
}