import { Container } from "react-bootstrap";

import Board from "../components/Board.tsx";

export default () => {
    return (
        <Container className="mx-auto text-center">
            <span><span className="h1">Eleanor</span></span>
            <Board />
        </Container>
    )
}