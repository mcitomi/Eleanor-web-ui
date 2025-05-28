import { serve } from "bun";
import { join } from "node:path";

import { port } from "../config.json";

import index from "./index.html";

import { initEngineForUser, engines, stopEngineForUser } from "./modules/chessEngine.ts";   // Function imports
import "./modules/chessEngine.ts";  // Starts the engine

const server = serve({
    port: port,
    idleTimeout: 90,
    routes: {
        // Serve index.html for all unmatched routes.
        "/*": index,
        "/ico": {
            GET: async (r) => {
                return new Response(Bun.file(join(import.meta.dir, "images", "icon.png")), {
                    headers: {
                        "Content-Type": "image/x-png",
                    }
                });
            }
        },
        "/api/kill": {
            DELETE: async (req) => {
                try {
                    const body = await req.json() as { uuid: string; };
                    stopEngineForUser(body.uuid);
                    return Response.json({ "message": "Engine session stopped!" });

                } catch (error) {
                    const { message } = error as Error;
                    return Response.json({ "message": message }, { status: 500 });
                }
            }
        },
        "/api/step": {
            POST: async (req) => {
                try {
                    const body = await req.json() as { fen: string; uuid: string; };

                    if (!body.fen || !body.uuid) {
                        throw new Error("Invalid user");
                    }

                    const engine = initEngineForUser(body.uuid);
                    engine.setPosition(body.fen);

                    const step = await engine.move();
                    const eid = engine.engineId;

                    return Response.json({ step, eid });
                } catch (error) {
                    const { message } = error as Error;
                    return Response.json({ "message": message }, { status: 500 });
                }
            }
        },
        "/api/resetgame": {
            POST: async (req) => {
                try {
                    const body = await req.json() as { uuid: string; };
                    const engine = initEngineForUser(body.uuid);
                    engine.newGame();

                    const eid = engine.engineId;

                    return Response.json({ "message": "New game started", eid });
                } catch (error) {
                    const { message } = error as Error;
                    return Response.json({ "message": message }, { status: 500 });
                }
            }
        },
        "/api/getrandomuuid": {
            GET: async (req) => {
                try {
                    const uuid = Bun.randomUUIDv7("base64");

                    return Response.json({ "message": "UUID generated!", uuid });
                } catch (error) {
                    const { message } = error as Error;
                    return Response.json({ "message": message }, { status: 500 });
                }
            }
        },
        "/api/check/eid": {
            POST: async (req) => {
                try {
                    const body = await req.json() as { eid: string; uuid: string; };

                    const session = engines.get(body.uuid);

                    if (session?.engineId != body.eid) {
                        return Response.json({ "message": "Your session is expired!" }, { status: 401 });
                    }

                    return Response.json({ "message": "Your eid is ok!" });
                } catch (error) {
                    const { message } = error as Error;
                    return Response.json({ "message": message }, { status: 500 });
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
