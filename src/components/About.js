import styles from "../styles/About.module.css";
import { FaUserGraduate, FaChalkboardTeacher, FaBook } from "react-icons/fa";
import { FaUser, FaCheckCircle, FaHistory } from "react-icons/fa";

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <h2>About Fund4Edu</h2>
      <p className={styles.introText}>
        Welcome to <strong>Fund4Edu</strong> — a platform committed to making
        education accessible by offering funding and support to students who
        need it most. Our mission is to empower the future through knowledge and
        compassion.
      </p>
      {/* 
      <div className={styles.row}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <FaUserGraduate />
          </div>
          <h3>Student Support</h3>
          <p>
            We help students secure essential financial aid for academic
            resources, tuition fees, and learning tools to pursue uninterrupted
            education.
          </p>
          <Link to="/signup" className={styles.iconLink}>
            Apply for Funding
          </Link>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <FaChalkboardTeacher />
          </div>
          <h3>Connect with Donors</h3>
          <p>
            Donors can easily browse student profiles and choose who to support.
            Every contribution makes a difference in shaping a student’s future.
          </p>
          <Link to="/signup" className={styles.iconLink}>
            Become a Donor
          </Link>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <FaBook />
          </div>
          <h3>Verified Assistance</h3>
          <p>
            We ensure that all funding requests are thoroughly verified, giving
            donors confidence that their support is going to students who truly
            need it.
          </p>
        </div>
      </div> */}
      <div className={styles.roadmapContainer}>
        <h3 className={styles.roadmapTitle}>Fund4Edu Roadmap</h3>

        <div className={styles.roadmap}>
          <div className={styles.workflowColumn}>
            <h4>Student Workflow</h4>
            <div className={styles.roadmapStep}>
              <div className={styles.roadmapIcon}>
                <FaUserGraduate />
              </div>
              <h5>Step 1: Apply for Funding</h5>
              <p>
                Students can apply for financial assistance by submitting their
                details.
              </p>
            </div>

            <div className={styles.roadmapStep}>
              <div className={styles.roadmapIcon}>
                <FaBook />
              </div>
              <h5>Step 2: Verification</h5>
              <p>
                Requests are verified to ensure they are legitimate and meet
                requirements.
              </p>
            </div>

            <div className={styles.roadmapStep}>
              <div className={styles.roadmapIcon}>
                <FaChalkboardTeacher />
              </div>
              <h5>Step 3: Check Progress</h5>
              <p>
                Students can check the progress of their funding and
                contributions.
              </p>
            </div>
          </div>

          <div className={styles.workflowColumn}>
            <h4>Donor Workflow</h4>
            <div className={styles.roadmapStep}>
              <div className={styles.roadmapIcon}>
                <FaUser />
              </div>
              <h5>Step 1: Become a Donor</h5>
              <p>
                Donors sign up to become part of the platform and start
                supporting students.
              </p>
            </div>

            <div className={styles.roadmapStep}>
              <div className={styles.roadmapIcon}>
                <FaCheckCircle />
              </div>
              <h5>Step 2: Verification</h5>
              <p>
                Donor verification process ensures that only legitimate
                donations are made.
              </p>
            </div>

            <div className={styles.roadmapStep}>
              <div className={styles.roadmapIcon}>
                <FaHistory />
              </div>
              <h5>Step 3: Check History</h5>
              <p>
                Donors can view their donation history and track the funds
                they’ve contributed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerText}>
        <p>
          Every student deserves a chance to shine. If you or someone you know
          is in need of help,{" "}
          <strong className={styles.strongText}>Fund4Edu</strong> is here to
          support.
        </p>
      </div>
    </div>
  );
};

export default About;
