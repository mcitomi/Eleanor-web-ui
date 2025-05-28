import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar.tsx";

import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";

import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/darkmode.css";
import "./styles/main.css";

export default function App() {
    if (!localStorage.getItem("uuid")) {
        async function fetchNewUuid() {
            try {
                const response = await fetch(`${window.location.origin}/api/getrandomuuid`);

                const body = await response.json();
                if (!response.ok) {
                    console.log(body.message);
                } else {
                    console.log(body.message);
                    localStorage.setItem("uuid", body.uuid)
                }
            } catch (error) {
                console.log(error);
                console.log("Failed to fetch uuid");
            }
        }
        fetchNewUuid();
    }

    const [darkMode, setDarkMode] = useState(() => { return localStorage.getItem("darkmode") === "true" });

    function toggleDarkMode() {
        setDarkMode(!darkMode);

        localStorage.setItem("darkmode", `${!darkMode}`);
    }

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("white-mode");
        } else {
            document.body.classList.add("white-mode");
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    return (
        <BrowserRouter>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About darkMode={darkMode} />} />
            </Routes>
        </BrowserRouter>
    )
}