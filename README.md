# Tutor Finder

## Project Overview

Tutor Finder is an online platform designed to bridge the gap between high school students seeking personalized academic support and qualified tutors available for one-on-one sessions. The platform addresses common issues such as high tutoring costs, difficulty in finding the right tutor, and scheduling conflicts by providing an efficient and user-friendly solution. Key functionalities include tutor registration, student profile creation, and session booking.

## Features Summary

### Administrator (Admin) Features
- **Admin Login:** Secure login to access the admin dashboard.
- **User Management:** View and manage the list of registered tutors and clients.

### Tutor Features
- **Tutor Profile:** Create and update a profile showcasing your qualifications, experience, and subjects.
- **Session Management:** View and manage your scheduled tutoring sessions.

### Client Features
- **Client Profile:** Create and update your profile with personal and academic details.
- **Tutor Discovery:** Browse and search for available tutors.
- **Session Booking:** Book tutoring sessions based on subject and availability.

## Project Structure

The project is divided into two main parts: **Backend** and **Frontend**.

### Backend
- **Technologies Used:** Node.js, Express, MongoDB, JWT (JSON Web Tokens) for authentication.
- **Folder Structure:**
  - `config/` - Contains configuration files (e.g., database connection).
  - `controllers/` - Houses the API logic for authentication, tutor, client, admin, and session management.
  - `models/` - Defines Mongoose schemas and models.
  - `routes/` - Contains API route definitions for auth, admin, tutor, client, and session endpoints.
  - `middleware/` - Includes custom middleware (e.g., JWT verification).
- **Key API Routes:**
  - **Authentication:**  
    - `POST /api/auth/register`  
    - `POST /api/auth/login`
  - **Admin:**  
    - `POST /api/admin/login`  
    - `GET /api/admin/tutors`  
    - `GET /api/admin/clients`
  - **Tutor:**  
    - `POST /api/tutor/profile`  
    - `GET /api/tutor/profile/:userId`  
    - `GET /api/tutor/profile-all` (for listing all tutors)
  - **Client:**  
    - `POST /api/client/profile`  
    - `GET /api/client/profile/:userId`
  - **Sessions:**  
    - `POST /api/sessions`

### Frontend
- **Technologies Used:** React, Axios, React Router.
- **Folder Structure:**
  - `src/` - Main source directory.
    - `components/` - Contains reusable components (e.g., Navbar).
    - `context/` - Provides global state management (e.g., authentication).
    - `pages/` - Contains page components such as HomePage, LoginPage, RegisterPage, AdminDashboard, TutorDashboard, and ClientDashboard.
    - `api/` - Axios instance configuration for backend communication.
    - `styles/` (or a single CSS file) - Global styles for the application.
- **Key Components and Pages:**
  - **Navbar:** Displays the application logo (clickable to return to home) and shows login/logout controls along with the logged-in user’s name.
  - **HomePage:** The landing page featuring an overview of Tutor Finder, a login form, and a sign-up option.
  - **LoginPage & RegisterPage:** Dedicated pages for user authentication.
  - **Dashboard Pages:** Separate dashboards for Admin, Tutor, and Client roles, each showing relevant information and functionalities.

---

Feel free to customize and expand this README to meet your project's needs. Happy coding!
