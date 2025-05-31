import { useRef, useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Move, type Square } from "chess.js";
import { Button } from "react-bootstrap";

import "../styles/board.css";

export default function Board() {
    const savedFen = localStorage.getItem("fen");
    const initialFen = savedFen || new Chess().fen();

    const controllerRef = useRef<AbortController | null>(null);

    const gameRef = useRef(new Chess(initialFen));
    const [fen, setFen] = useState(initialFen);

    const [showOverlay, setShowOverlay] = useState(true);
    const [overlayText, setoverlayText] = useState("Eleanor is a chess engine written in C++");

    const [highlightSquares, setHighlightSquares] = useState({});
    const [lastSteps, setLastSteps] = useState({});
    const [selected, setSelected] = useState("");

    useEffect(() => {
        localStorage.setItem("fen", fen);
    }, [fen]);

    async function checkSession() {
        try {
            const response = await fetch(`${window.location.origin}/api/check/eid`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "eid": localStorage.getItem("eid"),
                    "uuid": localStorage.getItem("uuid")
                })
            });

            const body = await response.json();
            if (!response.ok) {
                setShowOverlay(true);
                console.log("Unable to check session");
            } else {
                console.log(body.message);
                setShowOverlay(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (gameRef.current.turn() === "b") {
            engineMove(gameRef.current.fen());
        }
    }, [fen]);

    async function resetGame(engineStarts: boolean) {
        try {
            localStorage.removeItem("fen");

            let newGameFen = new Chess().fen();

            if(engineStarts) {
                newGameFen = newGameFen.replace("w", "b");
            }

            gameRef.current = new Chess(newGameFen);
            setFen(newGameFen);

            controllerRef.current?.abort("Game reseted");

            document.getElementById("board")!.classList.remove("danger");

            document.getElementById("thinking")?.style && (document.getElementById("thinking")!.style.visibility = "hidden");

            setLastSteps({});
            setHighlightSquares({});
            setSelected("");

            const response = await fetch(`${window.location.origin}/api/resetgame`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "uuid": localStorage.getItem("uuid")
                })
            });

            const body = await response.json();
            if (!response.ok) {
                setShowOverlay(true);
                setoverlayText(body.message);
                console.log(body.message);
            } else {
                localStorage.setItem("eid", body.eid);
                console.log(body.message);
                setShowOverlay(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function gameCheck() {
        if (gameRef.current.turn() == "w" && gameRef.current.inCheck()) {
            document.getElementById("board")!.classList.add("danger");
        } else {
            document.getElementById("board")!.classList.remove("danger");
        }

        if (gameRef.current.isGameOver()) {
            if (gameRef.current.isCheckmate()) {
                setoverlayText("Checkmate!");
            } else if (gameRef.current.isStalemate()) {
                setoverlayText("Stalemate! Draw");
            } else if (gameRef.current.isDraw()) {
                setoverlayText("Draw");
            } else {
                setoverlayText("The game ended for some other reason.");
            }
            setShowOverlay(true);

            try {
                const response = await fetch(`${window.location.origin}/api/kill`, {
                    method: "delete",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "uuid": localStorage.getItem("uuid")
                    })
                });

                if (!response.ok) {
                    console.log(response);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    function showStepOptions(piece: string, square: Square) {
        if (!piece.startsWith("w")) {
            return false;
        }

        const moves = gameRef.current.moves({ square: square, verbose: true });

        const highlights: Record<string, React.CSSProperties> = {};

        moves.forEach((move) => {
            highlights[move.to] = {
                background: "radial-gradient(circle, #fffa8b 36%, transparent 40%)",
                borderRadius: "50%",
                zIndex: "4"
            };
        });

        setHighlightSquares(highlights);
    }

    async function engineMove(fen: string) {
        const timeoutId = setTimeout(() => {
            controllerRef.current?.abort("Engine not responded");
        }, 90000);

        try {
            document.getElementById("thinking")?.style && (document.getElementById("thinking")!.style.visibility = "visible");

            if (gameRef.current.turn() != "b") {
                throw new Error("Board logic error");
            }

            const controller = new AbortController();
            controllerRef.current = controller;

            const response = await fetch(`${window.location.origin}/api/step`, {
                method: "post",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "fen": fen,
                    "uuid": localStorage.getItem("uuid")
                })
            });

            const body = await response.json();

            document.getElementById("thinking")?.style && (document.getElementById("thinking")!.style.visibility = "hidden");

            if (!response.ok) {
                setShowOverlay(true);
                setoverlayText("Your session is expired! (due 10 min inactivity)");
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
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function makeAMove(move: any) {
        const result = gameRef.current.move(move);
        if (result) {
            setFen(gameRef.current.fen());

            const steps: Record<string, React.CSSProperties> = {};
            const step = move as Move;

            steps[step.from] = {
                background: "radial-gradient(circle,rgb(90, 90, 90) 36%, transparent 55%)",
                borderRadius: "40%",
            }

            steps[step.to] = {
                background: "radial-gradient(circle, rgb(90, 90, 90) 36%, transparent 55%)",
                borderRadius: "40%",
            }

            setLastSteps(steps);
            gameCheck();
        }
        return result;
    }

    function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
        try {
            if (!piece.startsWith("w")) {
                return false;
            }

            const move = makeAMove({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q", // promotion logika kell majd
            });

            if (move === null) return false;
            // engineMove(move.after);

            return true;
        } catch (error) {
            console.log(error);

            return false;
        }
    }

    function stepByClick(square: string) {
        const moves = gameRef.current.moves({ square: selected as Square, verbose: true });

        if (!moves.some(x => x.to == square)) {
            return;
        }

        if (selected && selected != square) {
            setHighlightSquares({});

            const move = makeAMove({
                from: selected,
                to: square,
                promotion: "q", // promotion logika kell majd
            });

            setSelected("");

            if (move === null) return false;
            // engineMove(move.after);
        }
    }

    return (
        <>
            {showOverlay && (
                <div className="overlay">
                    <Button variant="light" size="lg" className="my-3" onClick={() => resetGame(false)}>Start Game</Button>
                    <Button variant="outline-light" size="sm" onClick={() => resetGame(true)}><b>Start Game</b> and Eleanor starts the round</Button>
                    <br />
                    <h5>{overlayText}</h5>
                </div>
            )}
            <div>
                <small className="thinking text-center my-3" id="thinking">Eleanor is thinking...</small>

                <div style={{ display: "flex", justifyContent: "center" }}>

                    <div className="board-wrapper">
                        <div className="my-3" id="board">
                            <Chessboard
                                position={fen}
                                onSquareClick={stepByClick}
                                onPieceDrop={onDrop}
                                onPieceDragBegin={showStepOptions}
                                onPieceClick={(p, s) => { showStepOptions(p, s), setSelected(s) }}
                                onPieceDragEnd={() => setHighlightSquares({})}
                                autoPromoteToQueen={true}
                                customSquareStyles={{ ...lastSteps, ...highlightSquares }}
                            />
                        </div>
                    </div>
                </div>
                <Button size="sm" variant="danger" className="m-3" onClick={() => resetGame(false)}>Reset game</Button>
                <Button size="sm" variant="outline-danger" className="m-3" onClick={() => resetGame(true)}><b>Game resets</b> and Eleanor starts the round</Button>
            </div>
        </>
    );
}
