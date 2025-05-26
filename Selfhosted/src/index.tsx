import { serve } from "bun";

import { port } from "../config.json";

import index from "./index.html";

import { move, setPosition } from "./modules/chessEngine.ts";   // Function imports
import "./modules/chessEngine.ts";  // Starts the engine

const server = serve({
    port: port,
    routes: {
        // Serve index.html for all unmatched routes.
        "/*": index,

        "/api/hello": {
            async GET(req) {
                return Response.json({
                    message: "Hello, world!",
                    method: "GET",
                });
            },
            async PUT(req) {
                return Response.json({
                    message: "Hello, world!",
                    method: "PUT",
                });
            },
        },

        "/api/hello/:name": async req => {
            const name = req.params.name;
            return Response.json({
                message: `Hello, ${name}!`,
            });
        },

        "/api/step": {
            POST: async (req) => {
                try {
                    const body = await req.json() as { fen: string; };
                
                    setPosition(body.fen);

                    const step = await move();
                    
                    return Response.json({ step });
                } catch (error) {
                    const { message } = error as Error;
                    return Response.json({ "message": message });
                }
            }
        }
    },

    development: process.env.NODE_ENV !== "production" && {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
    },
});

console.log(`🚀 Server running at ${server.url}`);
