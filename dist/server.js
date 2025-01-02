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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "*",
        "https://ekramul-protfolio.vercel.app",
    ],
}));
// MongoDB connection
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));
// Define Mongoose schemas and models
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose_1.default.model("User", userSchema);
// Define Mongoose schemas and models
const skillSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true },
});
const Skill = mongoose_1.default.model("Skill", skillSchema);
const skillSchemaLevel2 = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true },
});
const SkillLevel2 = mongoose_1.default.model("SkillLevel2", skillSchemaLevel2);
const projectSchema = new mongoose_1.default.Schema({
    projectName: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    frontendTechnologies: { type: [String], default: [] }, // Array of strings for frontend tech
    backendTechnologies: { type: [String], default: [] }, // Array of strings for backend tech
    images: { type: [String], default: [] }, // Array of image URLs
    links: {
        githubFrontend: { type: String, required: false },
        githubBackend: { type: String, required: false },
        liveDemo: { type: String, required: false },
        watchVideo: { type: String, required: false },
    },
});
const Project = mongoose_1.default.model("Project", projectSchema);
const blogSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
    image: { type: String, required: true },
});
const Blog = mongoose_1.default.model("Blog", blogSchema);
// Register API
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if email already exists
        const existingUser = yield User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already exists" });
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Save the user
        const user = new User({ email, password: hashedPassword });
        const savedUser = yield user.save();
        res
            .status(201)
            .json({ message: "User registered successfully", user: savedUser });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
// Login API
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = yield User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Compare passwords
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(200).json({ message: "Login successful", token });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}));
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
app.post("/level", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skill = new SkillLevel2(req.body);
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
app.put("/skills/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedSkill = yield Skill.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation is run on the updated fields
        });
        if (!updatedSkill) {
            return res.status(404).json({ error: "Skill not found" });
        }
        res.json(updatedSkill);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.delete("/skills/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedSkill = yield Skill.findByIdAndDelete(id);
        if (!deletedSkill) {
            return res.status(404).json({ error: "Skill not found" });
        }
        res.json({ message: "Skill deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.get("/level", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skills2 = yield SkillLevel2.find();
        res.json(skills2);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
}));
app.put("/level/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedSkill = yield SkillLevel2.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation is run on the updated fields
        });
        if (!updatedSkill) {
            return res.status(404).json({ error: "Skill not found" });
        }
        res.json(updatedSkill);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.delete("/level/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedSkill = yield SkillLevel2.findByIdAndDelete(id);
        if (!deletedSkill) {
            return res.status(404).json({ error: "Skill not found" });
        }
        res.json({ message: "Skill deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Create a project
app.post("/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const project = new Project(req.body);
        const savedProject = yield project.save();
        res.status(201).json(savedProject);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Get all projects
app.get("/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield Project.find();
        res.json(projects);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.get("/projects/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Extract the project ID from the request parameters
        const project = yield Project.findById(id);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json(project);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.put("/projects/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Extract the project ID from the request parameters
        const updatedData = req.body; // Get updated project data from the request body
        const updatedProject = yield Project.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Validate the updated fields
        });
        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json(updatedProject);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.delete("/projects/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Extract the project ID from the request parameters
        const deletedProject = yield Project.findByIdAndDelete(id);
        if (!deletedProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json({ message: "Project deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Create a blog
app.post("/blogs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = new Blog(req.body);
        const savedBlog = yield blog.save();
        res.status(201).json(savedBlog);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
}));
// Get all blogs
app.get("/blogs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield Blog.find();
        res.json(blogs);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.get("/blogs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Extract the blog ID from the request parameters
        const blog = yield Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.json(blog);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.put("/blogs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Extract the blog ID from the request parameters
        const updatedData = req.body; // Get updated blog data from the request body
        const updatedBlog = yield Blog.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Validate the updated fields
        });
        if (!updatedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.json(updatedBlog);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
app.delete("/blogs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Extract the blog ID from the request parameters
        const deletedBlog = yield Blog.findByIdAndDelete(id);
        if (!deletedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.json({ message: "Blog deleted successfully" });
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
    console.log(`Server is running ${PORT}`);
});
