// After any successful admin change to the catalogue (products, photos,
// categories, banners) tell the storefront to drop its cache, so the change
// shows on the website straight away instead of after the 60s refresh.
const STORE = (process.env.STORE_URL || "http://localhost:3001").replace(/\/+$/, "");
const SECRET = process.env.REVALIDATE_SECRET || "";

let timer = null;
const ping = () => {
    clearTimeout(timer); // bulk edits -> one refresh
    timer = setTimeout(async () => {
        try {
            const res = await fetch(`${STORE}/api/revalidate`, {
                method: "POST",
                headers: { "x-revalidate-secret": SECRET },
                signal: AbortSignal.timeout(5000),
            });
            if (!res.ok) console.warn("storefront refresh failed:", res.status);
        } catch (err) {
            console.warn("storefront refresh unreachable:", err.message);
        }
    }, 300);
};

export default function storefrontSync(req, res, next) {
    if (req.method === "GET" || req.method === "OPTIONS") return next();
    res.on("finish", () => {
        if (res.statusCode < 400) ping();
    });
    next();
}
