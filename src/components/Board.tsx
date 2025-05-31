import { useRef, useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
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

    const [orientation, setOrientation] = useState<BoardOrientation>("white");

    const moveSoundRef = useRef(new Audio("/audio/normal"));
    const capSoundRef = useRef(new Audio("/audio/capture"));
    const notifySoundRef = useRef(new Audio("/audio/notify"));
    const illegalSoundRef = useRef(new Audio("/audio/illegal"));

    useEffect(() => {
        localStorage.setItem("fen", fen);
    }, [fen]);

    function playNotifySound() {
        function play() {
            notifySoundRef.current.currentTime = 0;
            notifySoundRef.current.play().catch(() => { });
        }

        play();
        setTimeout(play, 600);
    }

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
        if (gameRef.current.turn() === (orientation == "white" ? "b" : "w")) {
            engineMove(gameRef.current.fen());
        }
    }, [fen]);

    async function resetGame() {
        try {
            localStorage.removeItem("fen");

            let newGameFen = new Chess().fen();

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
        if (gameRef.current.turn() == orientation[0] && gameRef.current.inCheck()) {
            document.getElementById("board")!.classList.add("danger");
            playNotifySound()
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
        if (!piece.startsWith(orientation[0])) {
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

            if (result.captured) {
                capSoundRef.current.currentTime = 0;
                capSoundRef.current.play().catch(() => { });
            } else {
                moveSoundRef.current.currentTime = 0;
                moveSoundRef.current.play().catch(() => { });
            }

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
            if (!piece.startsWith(orientation[0])) {
                return false;
            }

            const move = makeAMove({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q", // promotion logika kell majd
            });

            if (move === null) return false;
            return true;

        } catch (error) {
            illegalSoundRef.current.currentTime = 0;
            illegalSoundRef.current.play().catch(() => { });
            console.log(error);
            return false;
        }
    }

    function stepByClick(square: string, piece: string | undefined) {
        try {
            const moves = gameRef.current.moves({ square: selected as Square, verbose: true });

            if (!moves.some(x => x.to == square)) {
                throw new Error("Invalid step");
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
            }
        } catch (error) {
            console.log(error);
            
            if (selected && !piece || piece && piece[0] !== orientation[0]) {
                illegalSoundRef.current.currentTime = 0;
                illegalSoundRef.current.play().catch(() => { });
            }
        }
    }

    return (
        <>
            {showOverlay && (
                <div className="overlay">
                    <Button variant="light" size="lg" className="my-3" onClick={() => { resetGame(), setOrientation("white") }}>Join on White site</Button>
                    <h1> - - New Game - -</h1>
                    <Button variant="dark" size="lg" className="my-3" onClick={() => { resetGame(), setOrientation("black") }}>Join on Black site</Button>
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
                                boardOrientation={orientation}
                            />
                        </div>
                    </div>
                </div>
                <Button size="sm" variant="light" className="m-3" onClick={() => { resetGame(), setOrientation("white") }}>Reset Game<br/><small>Play on white side</small></Button>
                <Button size="sm" variant="dark" className="m-3" onClick={() => { resetGame(), setOrientation("black") }}>Reset Game<br/><small>Play on black side</small></Button>
            </div>
        </>
    );
}
