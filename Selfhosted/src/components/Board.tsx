import { useRef, useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { Button } from "react-bootstrap";

import "../styles/board.css";

export default function Board() {
    const savedFen = localStorage.getItem("fen");
    const initialFen = savedFen || new Chess().fen();

    const gameRef = useRef(new Chess(initialFen));
    const [fen, setFen] = useState(initialFen);

    const [highlightSquares, setHighlightSquares] = useState({});

    useEffect(() => {
        localStorage.setItem("fen", fen);
    }, [fen]);

    async function resetGame() {
        try {
            localStorage.removeItem("fen");
            setFen(new Chess().fen());
            gameRef.current.reset();
            document.getElementsByTagName("body")[0].classList.remove("danger");

            const response = await fetch(`${window.location.origin}/api/resetgame`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                console.log("Unable to reset game");
            } else {
                const body = await response.json();
                console.log(body.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function gameCheck() {
        if (gameRef.current.turn() == "w" && gameRef.current.inCheck()) {
            document.getElementsByTagName("body")[0].classList.add("danger");
        } else {
            document.getElementsByTagName("body")[0].classList.remove("danger");
        }

        if (gameRef.current.isGameOver()) {
            if (gameRef.current.isCheckmate()) {
                console.log("Sakkmatt! A játék véget ért.");
            } else if (gameRef.current.isStalemate()) {
                console.log("Patt! Döntetlen.");
            } else if (gameRef.current.isDraw()) {
                console.log("Döntetlen (pl. háromszori ismétlés, 50 lépés szabály stb.)");
            } else {
                console.log("Valamilyen más okból ért véget a játék.");
            }
        }
    }

    function showStepOptions(_: any, square: Square) {
        const moves = gameRef.current.moves({ square: square, verbose: true });

        const highlights: Record<string, React.CSSProperties> = {};

        moves.forEach((move) => {
            highlights[move.to] = {
                background: "radial-gradient(circle, #fffa8b 36%, transparent 40%)",
                borderRadius: "50%",
            };
        });

        setHighlightSquares(highlights);
    }

    async function engineMove(fen: string) {
        try {
            console.log(fen);

            document.getElementById("thinking")?.style && (document.getElementById("thinking")!.style.visibility = "visible");

            const response = await fetch(`${window.location.origin}/api/step`, {
                method: "post",
                signal: AbortSignal.timeout(90000),
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "fen": fen
                })
            });

            const body = await response.json();

            document.getElementById("thinking")?.style && (document.getElementById("thinking")!.style.visibility = "hidden");

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
            gameCheck();
        }
        return result;
    }

    function onDrop(sourceSquare: string, targetSquare: string) {
        try {
            const move = makeAMove({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q", // promotion logika kell majd
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
            <div>
                <small className="thinking text-center my-3" id="thinking">Eleanor is thinking...</small>

                <div style={{ display: "flex", justifyContent: "center" }}>

                    <div className="my-3" style={{ width: "90%", maxWidth: "600px" }}>
                        <Chessboard
                            position={fen}
                            onPieceDrop={onDrop}
                            onPieceDragBegin={showStepOptions}
                            onPieceDragEnd={() => setHighlightSquares({})}
                            autoPromoteToQueen={true}
                            customSquareStyles={highlightSquares}
                        />
                    </div>
                </div>
                <Button size="sm" onClick={resetGame}>Reset game</Button>
            </div>
        </>
    );
}
