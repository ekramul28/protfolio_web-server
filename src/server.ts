import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { uploadImageToImageBB } from "./utils/imageUp";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

console.log(process.env.MONGODB_URI);
// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define Mongoose schemas and models
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
});
const Skill = mongoose.model("Skill", skillSchema);

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [String],
  githubLink: String,
  liveDemo: String,
  imageUrl: String, // To store the uploaded image URL
});
const Project = mongoose.model("Project", projectSchema);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  imageUrl: String, // To store the uploaded image URL
});
const Blog = mongoose.model("Blog", blogSchema);

// Create a project
app.post("/projects", async (req: Request, res: Response) => {
  try {
    const { image, ...projectData } = req.body;

    let imageUrl = "";
    if (image) {
      imageUrl = await uploadImageToImageBB(image); // Upload image and get URL
    }

    const project = new Project({ ...projectData, imageUrl });
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all projects
app.get("/projects", async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a blog
app.post("/blogs", async (req: Request, res: Response) => {
  try {
    const { image, ...blogData } = req.body;

    let imageUrl = "";
    if (image) {
      imageUrl = await uploadImageToImageBB(image); // Upload image and get URL
    }

    const blog = new Blog({ ...blogData, imageUrl });
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all blogs
app.get("/blogs", async (_req: Request, res: Response) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Example route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World! This is a simple Express server.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
