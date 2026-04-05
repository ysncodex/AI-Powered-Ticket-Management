# 🚀 React Modular Dashboard Kit

A production-ready, modular React.js dashboard template. Built for scalability with a clean architecture, separating UI components, pages, and logic.

## ✨ Key Features

- **🛡️ Authentication System:** Built-in `AuthContext` with Login/Signup pages.
- **🔒 Protected Routes:** specialized Guard components that prevent unauthorized access.
- **🎨 Modular UI Kit:** Reusable, clean components (Modals, Inputs, Cards) in `src/components/ui`.
- **📱 Responsive Layout:** Sidebar drawer and mobile-friendly navigation.
- **⚡ "Cleanful" Architecture:** Service layer pattern for API calls and separated concerns.

## 🛠 Tech Stack

- **Core:** React 18 + Vite
- **Styling:** Tailwind CSS + clsx
- **Icons:** Lucide React
- **Routing:** React Router DOM v6
- **State Management:** React Context API

## 📂 Project Structure

```bash
src/
├── components/
│   ├── auth/         # ProtectedRoute Guard
│   ├── layout/       # Sidebar, Header, MainLayout
│   └── ui/           # Reusable UI (Buttons, Inputs, Modals)
├── context/          # Global State (AuthContext)
├── pages/
│   ├── auth/         # SignIn, SignUp
│   ├── DashboardHome.jsx
│   ├── Orders.jsx
│   ├── Customers.jsx
│   └── ...
├── services/         # API Service Layer (Axios setup)
└── App.jsx           # Main Router & Providers
```
