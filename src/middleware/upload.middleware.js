import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { getCloudinary, hasCloudinary, UPLOAD_DIR } from "../config/cloudinary.js";

const ALLOWED = ["jpg", "jpeg", "png", "webp", "gif", "avif", "mp4", "mov", "webm"];
const LIMITS = { fileSize: 50 * 1024 * 1024 };

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (ALLOWED.includes(ext)) return cb(null, true);
    const err = new Error(`File type .${ext || "?"} is not allowed`);
    err.status = 400;
    cb(err);
};

// Public base for files saved on disk, e.g. http://localhost:5000
const publicBase = (req) =>
    (process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");

// Disk storage: used when Cloudinary keys are not set. Files are served from
// /uploads by app.js, and req.file(s) are rewritten to look like Cloudinary
// results (path = public URL, filename = "disk:<relative path>").
const createDiskUpload = (folder) => {
    const dir = path.join(UPLOAD_DIR, folder);
    fs.mkdirSync(dir, { recursive: true });

    const storage = multer.diskStorage({
        destination: dir,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`);
        },
    });
    const upload = multer({ storage, fileFilter, limits: LIMITS });

    const toPublic = (req, f) => {
        const rel = `${folder}/${f.filename}`;
        f.path = `${publicBase(req)}/uploads/${rel}`;
        f.filename = `disk:${rel}`;
    };
    const wrap = (mw) => (req, res, next) =>
        mw(req, res, (err) => {
            const files = [req.file, ...(Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat())].filter(Boolean);
            const saved = files.map((f) => f.path);
            // the save failed (validation, not found, …) -> don't leave the file behind
            res.on("finish", () => {
                if (res.statusCode >= 400) saved.forEach((p) => fs.promises.unlink(p).catch(() => {}));
            });
            if (err) return next(err);
            files.forEach((f) => toPublic(req, f));
            next();
        });

    return {
        single: (name) => wrap(upload.single(name)),
        fields: (spec) => wrap(upload.fields(spec)),
        array: (name, max) => wrap(upload.array(name, max)),
        none: () => upload.none(),
    };
};

const createCloudUpload = (folder) => {
    const storage = new CloudinaryStorage({
        cloudinary: getCloudinary(),
        params: { folder, resource_type: "auto", allowed_formats: ALLOWED },
    });
    return multer({ storage, fileFilter, limits: LIMITS });
};

const createUpload = (folder) => (hasCloudinary() ? createCloudUpload(folder) : createDiskUpload(folder));

export const categoryUpload = createUpload("sfed/category");

export const productUpload = createUpload("sfed/product");

export const BannerUpload = createUpload("sfed/banner");

export const UserUpload = createUpload("sfed/user");
