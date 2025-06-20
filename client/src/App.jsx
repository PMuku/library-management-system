// src/App.jsx
import { useState, useEffect } from "react";
import LoginComponent from "./components/LoginComponent";
import UserDashboard from "./components/UserDashboard";
import LibrarianDashboard from "./components/LibrarianDashboard";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        let userRole = '';
        if (accessToken) {
        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            userRole = payload.role;
        } catch (e) {
            userRole = '';
        }
        }
        
        setIsLoggedIn(!!accessToken);
        setRole(userRole || ''); 
    }, []);

  const dashboards = {
    'admin': <AdminDashboard setIsLoggedIn={setIsLoggedIn} />,
    'librarian': <LibrarianDashboard setIsLoggedIn={setIsLoggedIn} />,
    'user': <UserDashboard setIsLoggedIn={setIsLoggedIn} />
  };

  return (
    <>
      {isLoggedIn ? (
        dashboards[role]
      ) : (
        <LoginComponent setIsLoggedIn={setIsLoggedIn} setRole={setRole} />
      )}
    </>
  );
}
