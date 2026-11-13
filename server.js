import "dotenv/config"
import app from "./src/app.js";

// Render / other hosts assign the port through $PORT
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`server running on port ${PORT}`);
})
