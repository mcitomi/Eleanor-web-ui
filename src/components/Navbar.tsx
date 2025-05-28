import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

import "../styles/navbar.css";

export default () => {
    const [darkMode, setDarkMode] = useState(() => { return localStorage.getItem("darkmode") === "true" });

    function toggleDarkMode() {
        setDarkMode(!darkMode);

        localStorage.setItem("darkmode", `${!darkMode}`);
    }

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    return (
        <Navbar expand="lg" className="bg-body-tertiary" id="navbar">
            <Container>
                <Navbar.Brand as={Link} to="/"><img src="/ico" alt="Icon" width="40px" className="mx-1" /> <span><span className="h3">Eleanor</span> <span>web ui</span> <small style={{ fontSize: "10px" }}>v.0.2.3.</small></span></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/about">About</Nav.Link>

                    </Nav>
                    <div className="d-flex align-items-center">
                        <Button variant={darkMode ? "dark" : "outline-dark"} onClick={toggleDarkMode}>
                            {darkMode ? "Light Mode" : "Dark Mode"}
                        </Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}