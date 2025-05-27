import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar.tsx";

import Home from "./pages/Home.tsx";

import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
    const [logged, setLogged] = useState(false);

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
    return (
        <BrowserRouter>
            <Navbar logged={logged} setLogged={setLogged} />
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
    )
}