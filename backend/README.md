# Legalink Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in this directory with:
   ```env
   MONGO_URI=mongodb+srv://aartikuushwaha:4N1PwiV6yKQTS8IO@cluster0.ciuwilu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
   *(Replace with your own MongoDB Atlas URI for production use.)*
3. Start the server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000` by default.

## API Endpoints

- `GET /api/blogs` - List all blogs
- `GET /api/blogs/:id` - Get a single blog
- `POST /api/blogs` - Create a new blog
- `PUT /api/blogs/:id` - Update a blog
- `DELETE /api/blogs/:id` - Delete a blog 