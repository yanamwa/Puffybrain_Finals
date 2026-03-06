import { useEffect } from "react";
import styles from "./aboutus.module.css";

export default function AboutUs() {

useEffect(() => {
  const cards = document.querySelectorAll(`.${styles["card-container"]}`);

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

          {/* NAVBAR */}
          <div className={styles.navbar}>
            <div className={styles.logo}>
              <img src="/images/logo1.png" alt="Logo" />
            </div>

            <ul className={styles["nav-links"]}>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contactus">Contact Us</a></li>
            </ul>

            <div className={styles["nav-actions"]}>
              <a
                href="/signup"
                className={styles["start-btn"]}
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                Start Learning
              </a>
            </div>
          </div>

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
                  PuffyBrain is an smart and easy-to-use app made to help you learn in a fun way.
                  <br />
                  We create unique quizzes that make learning easier, more enjoyable, and personalized.
                  <br />
                  Our goal is to help you grow your knowledge every day while having fun at the same time.
                  <br /><br />
                  With PuffyBrain, learning feels light, simple, and exciting — just like a brain full of fluffy ideas!
                </p>
              </div>
            </div>
          </section>

        </section>
      </div>

      <div className={styles.cloudContainer}>
        <img src="../images/clouds sa landing page.png" className={styles.cloudImg} alt="Clouds" />
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
            textAlign: "center"
          }}
        >
          Meet our developers
        </h2>

        <div className={styles["dev-grid"]}>

          <div className={styles["card-container"]}>
            <div className={styles.photo}>
              <img src="/images/Diana-Icon.png" alt="Diana"/>
              <div className={styles.barcode}></div>
            </div>
            <div className={styles["id-details"]}>
              <h3>Student ID Card</h3>
              <p className={styles.info}><b>Name:</b> Diana Mae Tampo-og</p>
              <p className={styles.info}><b>Role:</b> UI/UX Designer | Fullstack Developer</p>
              <p className={styles.info}><b>Signature:</b> <span className={styles.signature}>Diana M.</span></p>
            </div>
          </div>

        <div className={styles["card-container"]}>
            <div className={styles.photo}>
              <img src="/images/anika.png" alt="Anika"/>
              <div className={styles.barcode}></div>
            </div>
            <div className={styles["id-details"]}>
              <h3>Student ID Card</h3>
              <p className={styles.info}><b>Name:</b> Anika Danielle Benetua</p>
              <p className={styles.info}><b>Role:</b> Fullstack Developer</p>
              <p className={styles.info}><b>Signature:</b> <span className={styles.signature}>Anika D.</span></p>
            </div>
          </div>

         <div className={styles["card-container"]}>
            <div className={styles.photo}>
              <img src="/images/anika.png" alt="Belle"/>
              <div className={styles.barcode}></div>
            </div>
            <div className={styles["id-details"]}>
              <h3>Student ID Card</h3>
              <p className={styles.info}><b>Name:</b> Tonne LaBelle Sapanghila</p>
              <p className={styles.info}><b>Role:</b> Frontend Developer</p>
              <p className={styles.info}><b>Signature:</b> <span className={styles.signature}>Belle S.</span></p>
            </div>
          </div>


          <div className={styles["card-container"]}>
            <div className={styles.photo}>
              <img src="/images/pink.png" alt="Pink"/>
              <div className={styles.barcode}></div>
            </div>
            <div className={styles["id-details"]}>
              <h3>Student ID Card</h3>
              <p className={styles.info}><b>Name:</b> Kizzy Pink Cortez</p>
              <p className={styles.info}><b>Role:</b> Frontend Developer</p>
              <p className={styles.info}><b>Signature:</b> <span className={styles.signature}>Kizzy C.</span></p>
            </div>
          </div>

        </div>


        {/* SECOND SECTION */}
        <h2
          className={styles["section-title2"]}
          style={{
            marginTop: "120px",
            fontWeight: "normal",
            color: "var(--font-color)",
            fontSize: "50px",
            textAlign: "center"
          }}
        >
          Meet the previous developers
        </h2>

        <div className={styles["dev-grid-2"]}>

          {[
            ["Diana-Icon.png","Diana Mae","UI/UX Designer | Frontend Developer","Diana M."],
            ["Railee-Icon.png","Railee Babiano","Frontend Developer","Railee B."],
            ["Mj-Icon.png","Marjess Villamor","Frontend Developer","Marjess V."],
            ["Patrick-Icon.png","Patrick Joseph Ibañez","Frontend Developer","Patrick I."],
            ["Andrie-Icon.png","Andrei Kurt Mangco","Frontend Developer","Andrei M."],
            ["Jeann-Icon.png","Jeann Desalit","Frontend Developer","Jeann D."],
            ["shaina.png","Shaina May Yusores","Frontend Developer","Shaina Y."]
          ].map((dev,index)=>(
            <div key={index} className={`${styles["card-container"]} ${styles.show}`}>
              <div className={styles.photo}>
                <img src={`/images/${dev[0]}`} alt={dev[1]} />
                <div className={styles.barcode}></div>
              </div>
              <div className={styles["id-details"]}>
                <h3>Student ID Card</h3>
                <p className={styles.info}><b>Name:</b> {dev[1]}</p>
                <p className={styles.info}><b>Role:</b> {dev[2]}</p>
                <p className={styles.info}><b>Signature:</b> <span className={styles.signature}>{dev[3]}</span></p>
              </div>
            </div>
          ))}

        </div>

      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles["footer-menu"]}>
          <a href="/about">About Us</a>
          <a href="/toc">Terms and Conditions</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/contactus">Contact Us</a>
        </div>

        <div className={styles["social-icons"]}>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
          <a href="puffybrain@gmail.com"><i className="fas fa-envelope"></i></a>
        </div>
      </footer>

      <div className={styles["sub-footer"]}>
        <p>© 2025 – PuffyBrain All Rights Reserved</p>
      </div>

    </>
  );
}