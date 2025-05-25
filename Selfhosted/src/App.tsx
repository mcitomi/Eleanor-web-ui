import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.tsx";

import BunPage from "./pages/BunPage.tsx";
import Home from "./pages/Home.tsx";

import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/start" element={<BunPage/>} />
                <Route path="/" element={<Home/>} />
            </Routes>
        </BrowserRouter>
    )
}