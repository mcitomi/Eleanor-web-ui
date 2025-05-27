import { Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";

import "../styles/navbar.css";

export default ({ logged, setLogged }: { logged: boolean; setLogged: (value: boolean) => void }) => {
    function handleLogout() {
        localStorage.removeItem("token");
        setLogged(false);
    }
    return (
        <Navbar expand="lg" className="bg-body-tertiary" id="navbar">
            <Container>
                <Navbar.Brand as={Link} to="/"><span><span className="h3">Eleanor</span> <span>web ui</span> <small style={{fontSize: "10px"}}>v.0.1.</small></span></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        {logged && <Nav.Link as={Link} to="/" onClick={handleLogout}>Logout</Nav.Link>}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}