import { useRef, useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { Button } from "react-bootstrap";

import "../styles/board.css";

export default function Board() {
    const savedFen = localStorage.getItem("fen");
    const initialFen = savedFen || new Chess().fen();

    const gameRef = useRef(new Chess(initialFen));
    const [fen, setFen] = useState(initialFen);

    useEffect(() => {
        localStorage.setItem("fen", fen);
    }, [fen]);

    function resetGame() {
        localStorage.removeItem("fen");
        setFen(new Chess().fen());
        gameRef.current.reset();
    }

    async function engineMove(fen: string) {
        try {
            console.log(fen);

            const response = await fetch(`${window.location.origin}/api/step`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "fen": fen
                })
            });

            const body = await response.json();
            if (!response.ok) {
                console.log(response);
                return;
            }

            console.log(body);

            const game = gameRef.current;
            const possibleMoves = game.moves();

            if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return;

            makeAMove({
                from: body.step.from,
                to: body.step.to,
                promotion: "q",
            });

        } catch (error) {
            console.log(error);
        }
    }

    function makeAMove(move: any) {
        const result = gameRef.current.move(move);
        if (result) {
            setFen(gameRef.current.fen()); // csak ha sikeres lépés, frissítjük az állást
        }
        return result;
    }

    function onDrop(sourceSquare: string, targetSquare: string) {
        try {
            const move = makeAMove({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
            });

            if (move === null) return false;
            engineMove(move.after);

            return true;
        } catch (error) {
            console.log(error);

            return false;
        }
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="my-3" style={{ width: "90%", maxWidth: "600px" }}>
                    <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        autoPromoteToQueen={true}
                    />
                </div>
            </div>
            <Button size="sm" onClick={resetGame}>Reset game</Button>
        </>
    );


}
