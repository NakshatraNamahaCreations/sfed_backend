import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";

let configured = false;

// true only when real Cloudinary keys are in .env (not blank / "placeholder")
export const hasCloudinary = () =>
    ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every((k) => {
        const v = (process.env[k] || "").trim();
        return v && !/placeholder|your_|xxx/i.test(v);
    });

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

export const getCloudinary = () => {
    if (!configured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        configured = true;
    }
    return cloudinary
}

// Removes an uploaded file wherever it lives. Never throws — a failed cleanup
// must not fail the admin's save.
//   local:...  -> seeded photo in the website's /public folder (left alone)
//   disk:...   -> file in backend/uploads (Cloudinary not configured)
//   other      -> Cloudinary public id
export const destroyMedia = async (publicId) => {
    if (!publicId || typeof publicId !== "string") return;
    try {
        if (publicId.startsWith("local:")) return;
        if (publicId.startsWith("disk:")) {
            const file = path.resolve(UPLOAD_DIR, publicId.slice(5));
            if (file.startsWith(UPLOAD_DIR)) await fs.unlink(file);
            return;
        }
        if (hasCloudinary()) await getCloudinary().uploader.destroy(publicId);
    } catch (err) {
        console.warn("media cleanup skipped:", publicId, err.message);
    }
};

// services call cloudinary.uploader.destroy(id); route that through destroyMedia
export default { uploader: { destroy: destroyMedia } }
