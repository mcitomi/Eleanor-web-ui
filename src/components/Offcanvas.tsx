import { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

import "../styles/console.css";

export default function OffCanvasExample({ resetCount }: { resetCount: number; }) {
    const [messages, setMessages] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [show, setShow] = useState(false);

    const cmdRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    useEffect(() => {
        const socket = new WebSocket('wss://eleanor.altersrac.hu/console'); // Cloudflare only works with / full strict ssl. 

        socket.onopen = () => {
            const uuid = localStorage.getItem("uuid");
            socket.send(JSON.stringify({ type: "console", uuid }));
        };

        socket.onmessage = (event) => {
            const wsmsg = JSON.parse(event.data);
            if (wsmsg.type === "console") {
                setMessages(prev => [...prev, wsmsg.text]);
            }
        };

        return () => socket.close();
    }, [resetCount]);

    const handleClose = () => setShow(false);
    const toggleShow = () => setShow((s) => !s);

    return (
        <>
            <Button variant="warning" onClick={toggleShow} className="me-2 m-3">
                Console
            </Button>
            <Offcanvas show={show} onHide={handleClose} scroll={true} backdrop={false}>
                <Offcanvas.Header closeButton className='c-head'>
                    <Offcanvas.Title>Engine Console</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className='console'>
                    <div id="cmd" ref={cmdRef}>
                        {
                            messages.map((msg, i) => (
                                <p key={i}>{msg}</p>
                            ))
                        }
                        <div ref={bottomRef} />
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}
