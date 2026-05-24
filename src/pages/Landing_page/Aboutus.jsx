import { useEffect } from "react";
import styles from "./aboutus.module.css";
import LandingNavbar from "../../components/LandingNavbar";
import LandingFooter from "../../components/LandingFooter";

export default function AboutUs() {
  useEffect(() => {
    const cards = document.querySelectorAll(
      `.${styles["card-container"]}`
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.show);
          } else {
            entry.target.classList.remove(styles.show);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={styles.wrapper}>
        <section className={styles.container}>
          <div className={styles.background}></div>
          <LandingNavbar />

          {/* HERO */}
          <section className={styles.hero}>
            <div className={styles["about-container"]}>
              <div className={styles["about-img-wrapper"]}>
                <img
                  className={styles["about-img"]}
                  src="/images/about us iamge.png"
                  alt="Cute mascot image"
                  style={{ marginTop: "220px" }}
                />
              </div>

              <div className={styles["about-text"]}>
                <h1>About Us</h1>
                <p>
                  PuffyBrain is a smart and easy-to-use app made
                  to help you learn in a fun way.
                  <br />
                  We create unique quizzes that make learning
                  easier, more enjoyable, and personalized.
                  <br />
                  Our goal is to help you grow your knowledge
                  every day while having fun at the same time.
                  <br />
                  <br />
                  With PuffyBrain, learning feels light, simple,
                  and exciting just like a brain full of fluffy
                  ideas!
                </p>
              </div>
            </div>
          </section>
        </section>
      </div>

      <div className={styles.cloudContainer}>
        <img
          src="/images/clouds sa landing page.png"
          className={styles.cloudImg}
          alt="Clouds"
        />
      </div>

      <div className={styles.cloudBottomFade}></div>

      {/* DEVELOPERS */}
      <section className={styles.features}>
        <h2
          className={styles["section-title"]}
          style={{
            marginTop: "120px",
            fontWeight: "normal",
            color: "var(--font-color)",
            fontSize: "50px",
            textAlign: "center",
          }}
        >
          Meet our developers
        </h2>

        <div className={styles["dev-grid"]}>
          {/* DIANA */}
          <div className={styles["card-container"]}>
            <div className={styles.photo}>
              <img
                src="/images/Diana-Icon.png"
                alt="Diana"
              />
              <div className={styles.barcode}></div>
            </div>

            <div className={styles["id-details"]}>
              <h3>Student ID Card</h3>
              <p className={styles.info}>
                <b>Name:</b> Diana Mae Tampo-og
              </p>
              <p className={styles.info}>
                <b>Role:</b> UI/UX Designer | Fullstack
                Developer
              </p>
              <p className={styles.info}>
                <b>Signature:</b>
                <span className={styles.signature}>
                  Diana M.
                </span>
              </p>
            </div>
          </div>

          {/* ANIKA */}
          <div className={styles["card-container"]}>
            <div className={styles.photo}>
              <img src="/images/anika.png" alt="Anika" />
              <div className={styles.barcode}></div>
            </div>

            <div className={styles["id-details"]}>
              <h3>Student ID Card</h3>
              <p className={styles.info}>
                <b>Name:</b> Anika Danielle Benetua
              </p>
              <p className={styles.info}>
                <b>Role:</b> Fullstack Developer
              </p>
              <p className={styles.info}>
                <b>Signature:</b>
                <span className={styles.signature}>
                  Anika D.
                </span>
              </p>
            </div>
          </div>

          {/* BELLE */}
          <div className={styles["card-container"]}>
            <div className={styles.photo}>
              <img src="/images/belle.png" alt="Belle" />
              <div className={styles.barcode}></div>
            </div>

            <div className={styles["id-details"]}>
              <h3>Student ID Card</h3>
              <p className={styles.info}>
                <b>Name:</b> Tonne LaBelle Sapanghila
              </p>
              <p className={styles.info}>
                <b>Role:</b> Frontend Developer
              </p>
              <p className={styles.info}>
                <b>Signature:</b>
                <span className={styles.signature}>
                  Belle S.
                </span>
              </p>
            </div>
          </div>

          {/* PINK */}
          <div className={styles["card-container"]}>
            <div className={styles.photo}>
              <img src="/images/pink.png" alt="Pink" />
              <div className={styles.barcode}></div>
            </div>

            <div className={styles["id-details"]}>
              <h3>Student ID Card</h3>
              <p className={styles.info}>
                <b>Name:</b> Kizzy Pink Cortez
              </p>
              <p className={styles.info}>
                <b>Role:</b> Frontend Developer
              </p>
              <p className={styles.info}>
                <b>Signature:</b>
                <span className={styles.signature}>
                  Kizzy C.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
     <LandingFooter />

    </>
  );
}