# Fund4Edu

**Live Site:** https://fund4edu.netlify.app/

Fund4Edu is a crowdfunding platform that connects students in need with donors who believe in the power of education. Students can request financial assistance for their education, admins verify the requests, and donors can contribute directly to approved students.

## About the Project

Education is expensive, and many talented students drop out simply because they cannot afford fees, books, or other academic resources. Fund4Edu bridges that gap by providing a transparent platform where:

- Students submit a college-approved fund request with supporting documents.
- Admins review and verify every request before it goes live for funding.
- Donors browse verified requests, contribute, and track their donation history.
- Progress bars show how much of each student's goal has been funded.

## How It Works

### Student Workflow
1. Sign up / log in as a student.
2. Submit a college-approved fund request (file upload, max 400 KB).
3. Wait for admin verification (status: `Pending` → `Approved` / `Rejected`).
4. Re-submit with corrections if the request is rejected.
5. Track funding progress and contributions on the student dashboard.

### Donor Workflow
1. Sign up / log in as a donor.
2. Browse approved student requests.
3. Contribute to a student and upload the payment screenshot.
4. View all past contributions in the donation history.

### Admin Workflow
1. Log in with an admin account.
2. Review pending student requests and approve or reject them (with a reason).
3. Monitor donations, students, and overall activity from the admin dashboard.

## Tech Stack

- **Frontend:** React 19, React Router, CSS Modules, Bootstrap, React Icons
- **Backend / Database:** Firebase Authentication, Cloud Firestore, Firebase Storage
- **Testing:** React Testing Library, Jest
- **Build Tool:** Create React App (`react-scripts`)
- **Deployment:** Netlify (live site), Firebase config for backend services

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
git clone https://github.com/imeshagupta/fund4edu.git
cd fund4edu
npm install
```

### Environment Variables

Create a `.env` file in the project root with your Firebase web app config:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

You can find these values in Firebase Console → Project settings → General → Your apps → Web app.

### Run Locally

```bash
npm start
```

Open http://localhost:3000 in your browser.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Runs the app in development mode |
| `npm run build` | Creates an optimized production build |
| `npm test` | Runs the test suite |
| `npm run eject` | Ejects Create React App config (one-way operation) |

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Reusable UI components (Header, Hero, Login, etc.)
├── context/         # Auth context provider
├── pages/           # Student, Donor, and Admin dashboards
├── services/        # Firebase initialization
├── styles/          # CSS modules
├── App.js           # Routes
└── index.js         # App entry point
```

## User Roles

| Role | Dashboard | Access |
| --- | --- | --- |
| Student | `/student-dashboard` | Submit and track funding requests |
| Donor | `/donor-dashboard` | Browse students and make donations |
| Admin | `/admin-dashboard` | Verify requests and monitor donations |

Admin access is controlled by `role: "admin"` and `isAdmin: true` on the user's Firestore document.

## Deployment

The live application is hosted at **https://fund4edu.netlify.app/**.

For production builds:

```bash
npm run build
```

The `build` folder contains the optimized static files ready to be deployed to Netlify or any static hosting provider.
