import { Link } from "react-router-dom";
import styles from "../styles/Hero.module.css";
import heroImage from "../assets/education-fund-6303217.webp"; // Ensure the path is correct

const Hero = () => {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <div className={styles.imageContainer}>
          <img
            src={heroImage}
            className={styles.heroImage}
            alt="Fund4Edu - Empowering Education"
            loading="lazy"
          />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.heroTitle}>
            Empowering Students Through Education Funding
          </h1>
          <p className={styles.heroDescription}>
            Fund4Edu is a platform that connects students in need with donors
            who believe in the power of education. Support a student's journey
            today and make a lasting impact.
          </p>
          <div className={styles.buttonGroup}>
            <Link to="/signup">
              <button className={styles.primaryButton}>
                Apply for Funding
              </button>
            </Link>
            <Link to="/signup">
              <button className={styles.secondaryButton}>Become a Donor</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
