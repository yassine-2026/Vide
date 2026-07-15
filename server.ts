import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit to fit in Render Free
});

let groqClient: Groq | null = null;
const getGroq = () => {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
};

// Helper: Extract frames from video in a memory-efficient way
const extractFrames = (inputPath: string, outputFolder: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-threads 1', // Limit CPU and RAM usage for free tier
        '-preset ultrafast', // Faster extraction
        '-q:v 5' // Lower quality to save memory in Node and Groq API
      ])
      .on("end", () => {
        const files = fs
          .readdirSync(outputFolder)
          .filter((f) => f.endsWith(".jpg"))
          .map((f) => path.join(outputFolder, f));
        resolve(files);
      })
      .on("error", (err) => {
        console.error("FFmpeg Error:", err);
        reject(err);
      })
      .screenshots({
        timestamps: ['20%', '40%', '60%', '80%'], // 4 evenly spaced keyframes
        folder: outputFolder,
        size: "854x480", // 480p to save memory
        filename: "frame-%i.jpg",
      });
  });
};

const uploadMiddleware = upload.single("video");

app.post("/api/analyze", (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "File exceeds the 100MB limit." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: "Failed to process upload." });
    }
    next();
  });
}, async (req, res) => {
  const videoUrl = req.body.url;
  const file = req.file;

  if (!videoUrl && !file) {
    return res.status(400).json({ error: "Please provide a video file or URL." });
  }

  let videoPath = file ? file.path : videoUrl;
  let tempFolder = "";

  try {
    // Ensure Groq is initialized (will throw if key missing)
    getGroq();

    // Setup temp folder for frames
    tempFolder = path.join(uploadDir, `frames_${Date.now()}`);
    fs.mkdirSync(tempFolder, { recursive: true });

    // Extract 4 frames memory-efficiently
    const framePaths = await extractFrames(videoPath, tempFolder);

    // Convert frames to base64
    const base64Frames = framePaths.map((fp) => {
      const data = fs.readFileSync(fp);
      return `data:image/jpeg;base64,${data.toString("base64")}`;
    });

    // Clean up temporary files early to free up disk and RAM
    if (tempFolder && fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, { recursive: true, force: true });
      tempFolder = "";
    }
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Prepare Groq Request
    const messages: any[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are an expert app and website identifier with advanced OCR capabilities. 
I am providing you with 4 frames extracted from a video showing a user interacting with an app or website.
Analyze all visual text (using OCR), logos, icons, colors, UI layout, and overall design.
Identify the application or website.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "success": boolean, // false if confidence < 70
  "confidence": number, // 0-100
  "appName": string,
  "description": string, // brief description of what the app does
  "type": string, // e.g. "Social Media", "Productivity", "IDE"
  "platforms": {
    "website": boolean,
    "android": boolean,
    "iphone": boolean,
    "windows": boolean,
    "mac": boolean,
    "linux": boolean
  },
  "officialLink": string | null,
  "storeLinks": {
    "googlePlay": string | null,
    "appStore": string | null
  },
  "usageSteps": string[], // Step-by-step of what the user is doing in the video (e.g. "1. Open app", "2. Click upload")
  "pricing": {
    "model": "Free" | "Paid" | "Freemium" | "Open Source" | "Trial",
    "limitations": string // Short explanation of limits
  },
  "alternatives": [
    { "appName": string, "confidence": number } // Provide top 3-5 if confidence < 70
  ]
}`,
          },
          ...base64Frames.map((url) => ({
            type: "image_url",
            image_url: { url },
          })),
        ],
      },
    ];

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_VISION_MODEL || "llama-3.2-90b-vision-preview",
      messages,
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content || "";
    
    // Attempt to extract JSON from response
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const result = JSON.parse(jsonStr);
    res.json({ result });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze video." });
  } finally {
    // Cleanup
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    if (tempFolder && fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, { recursive: true, force: true });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
