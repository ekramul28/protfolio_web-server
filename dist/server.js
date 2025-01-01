"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const imageUp_1 = require("./utils/imageUp");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON
app.use(express_1.default.json());
console.log(process.env.MONGODB_URI);
// MongoDB connection
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));
// Define Mongoose schemas and models
const skillSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true },
});
const Skill = mongoose_1.default.model("Skill", skillSchema);
const projectSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    techStack: [String],
    githubLink: String,
    liveDemo: String,
    imageUrl: String, // To store the uploaded image URL
});
const Project = mongoose_1.default.model("Project", projectSchema);
const blogSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    imageUrl: String, // To store the uploaded image URL
});
const Blog = mongoose_1.default.model("Blog", blogSchema);
// Skills
app.post("/skills", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skill = new Skill(req.body);
        const savedSkill = yield skill.save();
        res.status(201).json(savedSkill);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
app.get("/skills", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skills = yield Skill.find();
        res.json(skills);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Create a project
app.post("/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { image } = _a, projectData = __rest(_a, ["image"]);
        let imageUrl = "";
        if (image) {
            imageUrl = yield (0, imageUp_1.uploadImageToImageBB)(image); // Upload image and get URL
        }
        const project = new Project(Object.assign(Object.assign({}, projectData), { imageUrl }));
        const savedProject = yield project.save();
        res.status(201).json(savedProject);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Get all projects
app.get("/projects", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield Project.find();
        res.json(projects);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Create a blog
app.post("/blogs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _b = req.body, { image } = _b, blogData = __rest(_b, ["image"]);
        let imageUrl = "";
        if (image) {
            imageUrl = yield (0, imageUp_1.uploadImageToImageBB)(image); // Upload image and get URL
        }
        const blog = new Blog(Object.assign(Object.assign({}, blogData), { imageUrl }));
        const savedBlog = yield blog.save();
        res.status(201).json(savedBlog);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Get all blogs
app.get("/blogs", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield Blog.find();
        res.json(blogs);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Example route
app.get("/", (req, res) => {
    res.send("Hello, World! This is a simple Express server.");
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
