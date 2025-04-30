# Plantie House
Made by Danai A., Maximilian M. 

**Plantie House** is a modern online marketplace where users can browse and purchase a variety of indoor plants and accessories.

## 🌱 Features

- User registration & login with session and “remember me”
- Secure password hashing (bcrypt)
- Browse & filter products dynamically from the database
- Edit profile, address & payment info in a live dashboard
- Admin panel: manage products and users
- Responsive UI with dynamic navbar based on login status

## 🛠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Bootstrap
- **Backend:** Node.js, Express
- **Database:** SQLite (via `sqlite3`)
- **Other:** `http-server`, `nodemon`, `express-session`, `bcrypt`

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/plantie-house.git
cd plantie-house
```

### 2. Install required global packages
Make sure you have the following installed:
- Node.js and npm
- http-server (for the frontend)
- nodemon (for the backend)

You can install them globally using:

```bash
npm install -g http-server nodemon
```

### 3. Start the backend and front server

Use the following to start the backend server:

```bash
npm run dev
```

In order to start the frontend server, you have to change directory to "frontend" and use the code to start:

```bash
cd ../frontend
http-server -p 5500
```

## 📁 Project Structure

```bash
plantie-house/
├── backend/
│   ├── app.js
│   └── ... (other backend files)
├── frontend/
│   ├── index.html
│   └── ... (HTML/CSS/JS files)
├── README.md
├── package.json
└── node_modules
```
