import { useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

import "../styles/board.css";

export default function Board() {
    const gameRef = useRef(new Chess());
    const [fen, setFen] = useState(gameRef.current.fen());

    try {
        function makeAMove(move: any) {
            const result = gameRef.current.move(move);
            if (result) {
                setFen(gameRef.current.fen()); // csak ha sikeres lépés, frissítjük az állást
            }
            return result;
        }

        function makeRandomMove() {
            const game = gameRef.current;
            const possibleMoves = game.moves();
            if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return;
            const randomIndex = Math.floor(Math.random() * possibleMoves.length);
            makeAMove(possibleMoves[randomIndex]);
        }

        function onDrop(sourceSquare: string, targetSquare: string) {
            const move = makeAMove({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
            });

            if (move === null) return false;
            makeRandomMove();
            // setTimeout(makeRandomMove, 200);
            return true;
        }
        
        return (
            <div style={{ width: "600px" }}>
                <Chessboard
                    position={fen}
                    onPieceDrop={onDrop}
                    autoPromoteToQueen={true}
                />
            </div>
        );

    } catch (error) {
        console.log(error);
    }
}
