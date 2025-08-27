require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
	origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
}));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
	.catch(err => {
		console.error("MongoDB connection failed:", err.message);
		process.exit(1);
	});

// Schema 
const PostSchema = new mongoose.Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	author: { type: String, default: "Anonymous" },
	createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

const ContactSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	subject: String,
	message: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', ContactSchema);



app.get('/api/posts', async (req, res) => {
	const posts = await Post.find().sort({ createdAt: -1 });
	res.json(posts);
});


app.post('/api/posts', async (req, res) => {
	try {
		const { title, content, author } = req.body;
		if (!title || !content) {
			return res.status(400).json({ message: "Title and content required" });
		}
		const post = new Post({ title, content, author });
		await post.save();
		res.status(201).json(post);
	} catch (err) {
		res.status(500).json({ message: "Failed to create post" });
	}
});


app.get('/api/posts/:id', async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ message: "Post not found" });
		res.json(post);
	} catch (err) {
		res.status(400).json({ message: "Invalid ID" });
	}
});

app.post('/api/contact', async (req, res) => {
	try {
		const { name, email, subject, message } = req.body;
		if (!name || !email || !message) {
			return res.status(400).json({ message: "Name, email and message are required" });
		}

		const contact = new Contact({ name, email, subject, message });
		await contact.save();

		res.status(201).json({ message: "Message received successfully!" });
	} catch (err) {
		res.status(500).json({ message: "Failed to send message" });
	}
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
