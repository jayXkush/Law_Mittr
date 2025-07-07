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

## Deployment on Render

### Backend Setup
1. Go to your backend service on Render.
2. Set the following environment variables:
   - `MONGO_URI` = your MongoDB connection string
   - `FRONTEND_URL` = your deployed frontend URL (e.g., https://your-frontend.onrender.com)
   - (Optional) `NODE_ENV` = production
3. Deploy the backend.

### Frontend Setup
1. Go to your frontend service on Render.
2. Set the following environment variable:
   - `REACT_APP_API_URL` = your deployed backend URL (e.g., https://your-backend.onrender.com)
3. Deploy the frontend.

### Notes
- Make sure the URLs match your actual deployed Render URLs.
- The backend CORS and frontend API calls are now dynamic and will work in both local and production environments.
- If you change environment variables, redeploy the affected service. 