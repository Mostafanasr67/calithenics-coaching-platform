# Calisthenics Coaching Platform

A full-stack web application designed to help calisthenics coaches manage clients, create personalized training plans, and monitor workout progress.

## 📌 Overview

The Calisthenics Coaching Platform provides a centralized system for managing coaching operations and tracking client performance.

The application includes separate experiences for coaches and clients. Coaches can manage their clients and training plans, while clients can access their workouts, record their performance, and track their progress.

This project was developed to strengthen my skills in full-stack web development, REST APIs, authentication, database design, and React application architecture.

## 🚀 Features

### 🔐 Authentication

* User login and registration
* JWT-based authentication
* Protected application routes

### 👨‍🏫 Coach Features

* Create, edit, and delete client profiles
* View and manage the client roster
* Track client information and training goals
* Create and manage training plans
* Organize plans into training days and exercises
* Monitor client workout progress

### 🏋️ Client Features

* View personal profile information
* Access assigned training plans
* Browse training days and exercises
* Start and complete workout sessions
* Track exercise performance
* Record sets, repetitions, and weights
* Monitor workout and plan progress

### 📊 Workout Tracking

* Weekly workout organization
* Workout-session tracking
* Exercise completion tracking
* Performance logging
* Progress monitoring across training weeks

## 🛠️ Technologies Used

### Frontend

* React
* React Router
* Tailwind CSS
* JavaScript
* Fetch API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Tokens (JWT)

## 🏗️ Project Structure

```text
project/
├── frontend/
│   └── React application
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── server configuration
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/calisthenics-coaching-platform.git
cd calisthenics-coaching-platform
```

### 2. Install frontend dependencies

```bash
cd Front End
npm install
```

### 3. Install backend dependencies

```bash
cd ../Back End
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend directory and add the required environment variables.

Example:

```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit your `.env` file to GitHub.

### 5. Run the application

Start the backend and frontend using the appropriate commands configured in their respective `package.json` files.

## 🎯 Learning Objectives

Through this project, I practiced:

* Building a full-stack application from scratch
* Designing RESTful APIs
* Working with MongoDB and Mongoose
* Implementing JWT authentication
* Managing application state in React
* Using React Router for navigation
* Creating reusable React components
* Structuring backend routes and controllers
* Designing relationships between database models
* Tracking user activity and workout progress

## 🔮 Future Improvements

Potential future improvements include:

* Online messaging between coaches and clients
* Notifications and reminders
* Advanced progress analytics
* Workout history visualizations
* Deployment and production optimization
* Support for multiple coaches

## 👨‍💻 Author

**Mostafa Nasr**

Computer Engineering graduate and calisthenics coach interested in full-stack web development and building practical software solutions.

## 📄 License

This project is intended for educational and portfolio purposes.
