import { Container } from "react-bootstrap";

import Board from "../components/Board.tsx";

export default () => {
    return (
        <Container className="mx-auto text-center">
            <h1 style={{marginTop: "10px"}}>Eleanor</h1>
            <Board />
        </Container>
    )
}