import { Container, Col, Row, Card, Button } from "react-bootstrap";

export default ({ darkMode }: { darkMode: boolean; }) => {
    return (
        <Container className="mx-auto text-center">
            <h1 style={{marginTop: "10px"}}>About the Eleanor Project</h1>

            <Row className="mt-4">
                <Col className="d-flex justify-content-center align-items-center">
                    <Card bg={darkMode ? "dark" : "white"} text={darkMode ? "white" : "black"} style={{ width: '18rem', marginTop: "10%" }}>
                        <Card.Img variant="top" src="https://camo.githubusercontent.com/5b90a8f7710bcb14f0fab49cb276841c699a802d24e17a6833e176bbd302697e/68747470733a2f2f692e6962622e636f2f54315a5639774e2f39316465613335362d613732352d343566642d623761322d6364393261666464636261342d312e6a7067" />
                        <Card.Body>
                            <Card.Title>Eleanor chess engine</Card.Title>
                            <Card.Text style={{fontSize: "12px"}}>by: rektdie</Card.Text>
                            <Card.Text>
                                A fast, UCI-compatible chess engine written in modern C++ with NNUE evaluation. Designed for performance and extensibility.
                            </Card.Text>
                            <Button href="https://github.com/rektdie/Eleanor" target="_blank" variant={darkMode ? "light" : "dark"}>Go to GitHub</Button>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col className="d-flex justify-content-center align-items-center">
                    <Card bg={darkMode ? "dark" : "white"} text={darkMode ? "white" : "black"} style={{ width: '18rem', marginTop: "10%" }}>
                        <Card.Img variant="top" src="https://eleanor.mcitomi.hu/ico" />
                        <Card.Body>
                            <Card.Title>Eleanor WEB UI</Card.Title>
                            <Card.Text style={{fontSize: "12px"}}>by: mcitomi</Card.Text>
                            <Card.Text>
                                A lightweight web interface for the Eleanor chess engine, built with Bun, React, and TypeScript. Enables real-time play and API control.
                            </Card.Text>
                            <Button href="https://github.com/mcitomi/Eleanor-web-ui" target="_blank" variant={darkMode ? "light" : "dark"}>Go to GitHub</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
