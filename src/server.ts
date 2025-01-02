import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadImageToImageBB } from "./utils/imageUp";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "*",
      "https://ekramul-protfolio.vercel.app",
    ],
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define Mongoose schemas and models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Define Mongoose schemas and models
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
});
const Skill = mongoose.model("Skill", skillSchema);

const skillSchemaLevel2 = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
});
const SkillLevel2 = mongoose.model("SkillLevel2", skillSchemaLevel2);

const projectSchema = new mongoose.Schema({
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

const Project = mongoose.model("Project", projectSchema);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  image: { type: String, required: true },
});
const Blog = mongoose.model("Blog", blogSchema);

// Register API

app.post("/register", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save the user
    const user = new User({ email, password: hashedPassword });
    const savedUser = await user.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: savedUser });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login API
app.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Skills
app.post("/skills", async (req: Request, res: Response) => {
  try {
    const skill = new Skill(req.body);
    const savedSkill = await skill.save();
    res.status(201).json(savedSkill);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/level", async (req: Request, res: Response) => {
  try {
    const skill = new SkillLevel2(req.body);
    const savedSkill = await skill.save();
    res.status(201).json(savedSkill);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/skills", async (req: any, res: any) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/skills/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedSkill = await Skill.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation is run on the updated fields
    });

    if (!updatedSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(updatedSkill);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/skills/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deletedSkill = await Skill.findByIdAndDelete(id);

    if (!deletedSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json({ message: "Skill deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/level", async (req: Request, res: Response) => {
  try {
    const skills2 = await SkillLevel2.find();
    res.json(skills2);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

app.put("/level/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedSkill = await SkillLevel2.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation is run on the updated fields
    });

    if (!updatedSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(updatedSkill);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/level/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const deletedSkill = await SkillLevel2.findByIdAndDelete(id);

    if (!deletedSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json({ message: "Skill deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a project
app.post("/projects", async (req: Request, res: Response) => {
  try {
    const project = new Project(req.body);

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all projects
app.get("/projects", async (req: Request, res: Response) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/projects/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params; // Extract the project ID from the request parameters
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/projects/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params; // Extract the project ID from the request parameters
    const updatedData = req.body; // Get updated project data from the request body

    const updatedProject = await Project.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Validate the updated fields
    });

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/projects/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params; // Extract the project ID from the request parameters
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a blog
app.post("/blogs", async (req: Request, res: Response) => {
  try {
    const blog = new Blog(req.body);
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all blogs
app.get("/blogs", async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/blogs/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params; // Extract the blog ID from the request parameters
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/blogs/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params; // Extract the blog ID from the request parameters
    const updatedData = req.body; // Get updated blog data from the request body

    const updatedBlog = await Blog.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Validate the updated fields
    });

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(updatedBlog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/blogs/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params; // Extract the blog ID from the request parameters
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
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
  console.log(`Server is running ${PORT}`);
});
