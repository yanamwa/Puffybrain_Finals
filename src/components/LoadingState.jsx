import styles from "./LoadingState.module.css";

function LoadingState({ label = "Loading", fullPage = true }) {
  return (
    <div className={fullPage ? styles.loadingPage : styles.loadingInline}>
      <div className={styles.loadingCard}>
        <img
          src="/images/Loading.png"
          alt="Loading"
          className={styles.loadingImage}
        />
        <p className={styles.loadingText}>
          {label}
          <span></span>
        </p>
      </div>
    </div>
  );
}

export default LoadingState;
