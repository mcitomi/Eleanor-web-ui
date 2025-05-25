import logo from "../images/logo.svg";
import reactLogo from "../images/react.svg";

import "../styles/bun.css";

import { APITester } from "../components/APITester";

export default function BunPage() {
    return (
        <div className="app">
            <div className="logo-container">
                <img src={logo} alt="Bun Logo" className="logo bun-logo" />
                <img src={reactLogo} alt="React Logo" className="logo react-logo" />
            </div>

            <h1>Bun + React</h1>
            <p>
                Edit <code>src/App.tsx</code> and save to test HMR
            </p>
            <APITester />
        </div>
    );
}