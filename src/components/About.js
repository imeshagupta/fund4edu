import { Link } from "react-router-dom";
import styles from "../styles/About.module.css";

const About = () => {
  return (
    <div className={styles.aboutContainer} id="about-fund4edu">
      <h2>About Fund4Edu</h2>
      <div className={styles.row}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🎓</div>
          <h3>Empowering Students</h3>
          <p>
            We provide financial assistance to students who need support to
            continue their education. Every donation helps change a life.
          </p>
          <Link to="/signup" className={styles.iconLink}>
            Apply for Funding →
          </Link>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>🤝</div>
          <h3>Connect with Donors</h3>
          <p>
            Our platform bridges the gap between students in need and generous
            donors who believe in the power of education.
          </p>
          <Link to="/signup" className={styles.iconLink}>
            Become a Donor →
          </Link>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔍</div>
          <h3>Verified Assistance</h3>
          <p>
            We ensure that every funding request is verified, so donors can
            confidently support genuine students in need.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
