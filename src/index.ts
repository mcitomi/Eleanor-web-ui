import { serve } from "bun";
import { join } from "node:path";

import { port } from "../config.json";

import index from "./index.html";

import { initEngineForUser, engines, stopEngineForUser, broadcastMetaInfos } from "./modules/chessEngine.ts";   // Function imports
import "./modules/chessEngine.ts";  // Starts the engine

const server = serve({
    port: port,
    idleTimeout: 90,
    routes: {
        // Serve index.html for all unmatched routes.
        "/": index,
        "/about": index,
        "/404": index,

        "/ico": {
            GET: async (r) => {
                return new Response(await Bun.file(join(import.meta.dir, "images", "icon.png")).arrayBuffer(), {
                    headers: {
                        "Content-Type": "image/png",
                        "Cache-Control": "public, max-age=86400"
                    }
                });
            }
        },
        "/audio/:id": {
            GET: async (r: Bun.BunRequest<"/audio/:id">) => {
                try {
                    const type = r.params.id;

                    let file: Bun.BunFile | undefined;

                    switch (type) {
                        case "normal":
                            file = Bun.file(join(import.meta.dir, "audio", "normal.mp3"));
                            break;

                        case "capture":
                            file = Bun.file(join(import.meta.dir, "audio", "capture.mp3"));
                            break;

                        case "notify":
                            file = Bun.file(join(import.meta.dir, "audio", "notify.mp3"));
                            break;

                        case "illegal":
                            file = Bun.file(join(import.meta.dir, "audio", "illegal.mp3"));
                            break;

                        default:
                            break;
                    }

                    if (file) {
                        return new Response(await file.arrayBuffer(), {
                            headers: {
                                "Content-Type": "audio/mpeg",
                                "Cache-Control": "public, max-age=86400"
                            }
                        });
                    } else {
                        return Response.json({ "message": "Audio not found" }, { status: 404 });
                    }

                } catch (error) {
                    const { message } = error as Error;
                    return Response.json({ "message": message }, { status: 500 });
                }
            }
        },
        "/api/kill": {
            DELETE: async (req: Bun.BunRequest<"/api/kill">) => {
                try {
                    const body = await req.json() as { uuid: string; };

                    if (!body.uuid) {
                        throw new Error("Invalid user request");
                    }

                    stopEngineForUser(body.uuid);
                    return Response.json({ "message": "Engine session stopped!" });

                } catch (error) {
                    const { message } = error as Error;
                    return Response.json({ "message": message }, { status: 500 });
                }
            }
        },
        "/api/step": {
            POST: async (req: Bun.BunRequest<"/api/step">) => {
                try {
                    const body = await req.json() as { fen: string; uuid: string; };

                    if (!body.fen || !body.uuid) {
                        throw new Error("Invalid user request");
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
            POST: async (req: Bun.BunRequest<"/api/resetgame">) => {
                try {
                    const body = await req.json() as { uuid: string; };

                    if (!body.uuid) {
                        throw new Error("Invalid user request");
                    }

                    stopEngineForUser(body.uuid);

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
            GET: async (req: Bun.BunRequest<"/api/getrandomuuid">) => {
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
            POST: async (req: Bun.BunRequest<"/api/check/eid">) => {
                try {
                    const body = await req.json() as { eid: string; uuid: string; };

                    if (!body.eid || !body.uuid) {
                        throw new Error("Invalid user request");
                    }

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

    fetch(request, server) {
        if (new URL(request.url).pathname == "/console") {
            const success = server.upgrade(request);
            if (success) {
                return;
            }
        }
        return Response.redirect("/404", 302);
    },

    websocket: {
        async message(ws, message) {
            try {
                const body = JSON.parse(message.toString()) as { uuid: string | undefined; type: string; };

                if (body.uuid && body.type == "console") {
                    const engine = initEngineForUser(body.uuid);

                    engine.ws = ws;

                    broadcastMetaInfos(engine);
                }
            } catch (error) {
                const { message } = error as Error;
                ws.send(JSON.stringify({ "type": "console", "text": message }))
            }
        },
        open(ws) {
            ws.send(JSON.stringify({ "type": "console", "text": "WS connection opened" }));
        },
    },

    development: process.env.NODE_ENV !== "production" && {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
    },
});

console.log(`🚀 Server running at ${server.url}`);
