// src/App.jsx
import { useState, useEffect } from "react";
import LoginComponent from "./components/LoginComponent";
import UserDashboard from "./components/UserDashboard";
import LibrarianDashboard from "./components/LibrarianDashboard";
import AdminDashboard from "./components/AdminDashboard";
import fetchWithAuth from "./utils/fetchWithAuth"; // <- Ensure this exists
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
    const [role, setRole] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Call a lightweight protected endpoint (adjust as needed)
                const res = await fetchWithAuth("/api/books?isDeleted=false");

                if (!res.ok) throw new Error("Invalid access token");

                const token = localStorage.getItem("access_token");
                const payload = JSON.parse(atob(token.split(".")[1]));
                setRole(payload.role);
                setIsLoggedIn(true);
            } catch (err) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                setIsLoggedIn(false);
                setRole("");
            }
        };

        checkAuth();
    }, []);

    const dashboards = {
        admin: <AdminDashboard setIsLoggedIn={setIsLoggedIn} />,
        librarian: <LibrarianDashboard setIsLoggedIn={setIsLoggedIn} setRole={setRole} />,
        user: <UserDashboard setIsLoggedIn={setIsLoggedIn} setRole={setRole} />,
    };

    if (isLoggedIn === null) {
        return <p className="text-center mt-10">Checking login status...</p>;
    }

    return (
        <>
            <ThemeToggle />
            {isLoggedIn ? (
                dashboards[role] || <p>Invalid role</p>
            ) : (
                <LoginComponent setIsLoggedIn={setIsLoggedIn} setRole={setRole} />
            )}
        </>
    );
}
