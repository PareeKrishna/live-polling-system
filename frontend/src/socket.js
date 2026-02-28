import { io } from "socket.io-client";

const URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:5000";
const socket = io(URL);
socket.on("connect", () => {
    console.log("✅ socket connected", socket.id)
})
export default socket;
