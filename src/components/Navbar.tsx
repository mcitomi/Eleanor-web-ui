import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

import "../styles/navbar.css";

export default ({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) => {
    return (
        <Navbar expand="lg" bg={darkMode ? "dark" : "white"} data-bs-theme={darkMode ? "dark" : "white"} className="bg-body-tertiary" id="navbar">
            <Container>
                <Navbar.Brand as={Link} to="/"><img src="/ico" alt="Icon" width="40px" className="mx-1" /> <span><span className="h3">Eleanor</span> <small style={{ fontSize: "10px" }}>v.0.2.8.0.</small></span></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/about">About</Nav.Link>

                    </Nav>
                    <div className="d-flex align-items-center">
                        <Button variant={darkMode ? "outline-light" : "outline-dark"} onClick={toggleDarkMode}>
                            {darkMode ? "Light Mode" : "Dark Mode"}
                        </Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}