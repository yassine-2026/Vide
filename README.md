# Video App Finder

An intelligent full-stack application that analyzes uploaded videos (or video links) to identify the app or website being demonstrated. It extracts frames using `ffmpeg` and utilizes the **Groq Vision API** to intelligently guess the application, its platforms, pricing, and provide step-by-step usage instructions.

## Features
- **Video Analysis**: Upload an MP4/WebM or provide a direct video URL.
- **Groq AI Integration**: Leverages powerful multimodal models to extract logos, app names, and features.
- **Bilingual**: Full support for English and Arabic (RTL).
- **Theming**: Dark and Light mode options.
- **Production Ready**: Fully prepared for deployment on Render.

## Setup & Deployment on Render

This project is configured to run out-of-the-box on [Render](https://render.com).

### Method 1: Blueprint (render.yaml)
1. Push this repository to GitHub.
2. In the Render Dashboard, go to **Blueprints** -> **New Blueprint Instance**.
3. Connect your repository. Render will automatically read `render.yaml` and configure the web service.
4. Add your `GROQ_API_KEY` to the Environment Variables in the Render dashboard.

### Method 2: Manual Web Service
1. Create a new **Web Service** on Render.
2. Connect your repository.
3. Environment: `Node`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run start`
6. Add Environment Variable: `GROQ_API_KEY`

## Local Development

1. Create a `.env` file and add your `GROQ_API_KEY`:
   ```bash
   GROQ_API_KEY=gsk_your_key_here
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Tech Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, fluent-ffmpeg
- AI: Groq SDK (Vision)
