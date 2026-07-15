import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { appsDatabase } from "./src/data/appsDatabase.js";

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

// Global error handler for JSON parsing and other middleware errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, error: "Invalid JSON payload" });
  }
  next(err);
});

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
    let timeoutId = setTimeout(() => {
      reject(new Error("FFmpeg extraction timed out."));
    }, 60000);

    ffmpeg(inputPath)
      .outputOptions([
        '-threads 1', // Limit CPU and RAM usage for free tier
        '-preset ultrafast', // Faster extraction
        '-q:v 5' // Lower quality to save memory in Node and Groq API
      ])
      .on("end", () => {
        clearTimeout(timeoutId);
        const files = fs
          .readdirSync(outputFolder)
          .filter((f) => f.endsWith(".jpg"))
          .map((f) => path.join(outputFolder, f));
        
        // Remove duplicates by size difference (zero RAM approach)
        const uniqueFrames: string[] = [];
        let lastSize = -1;
        for (const fp of files) {
          const size = fs.statSync(fp).size;
          if (lastSize === -1 || Math.abs(size - lastSize) / lastSize > 0.05) {
            uniqueFrames.push(fp);
            lastSize = size;
          } else {
            fs.unlinkSync(fp); // delete duplicate
          }
        }
        
        // Keep max 5 frames to avoid large payloads
        const finalFrames = uniqueFrames.slice(0, 5);
        
        // Clean up any frames beyond the top 5
        uniqueFrames.slice(5).forEach(fp => {
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        });
        
        resolve(finalFrames);
      })
      .on("error", (err) => {
        clearTimeout(timeoutId);
        console.error("FFmpeg Error:", err);
        reject(err);
      })
      .screenshots({
        timestamps: ['10%', '30%', '50%', '70%', '90%'], // 5 evenly spaced keyframes
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
        return res.status(400).json({ success: false, error: "File exceeds the 100MB limit." });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, error: "Failed to process upload." });
    }
    next();
  });
}, async (req, res) => {
  const videoUrl = req.body.url;
  const file = req.file;

  if (!videoUrl && !file) {
    return res.status(400).json({ success: false, error: "Please provide a video file or URL." });
  }

  let videoPath = file ? file.path : videoUrl;
  let tempFolder = "";

  try {
    getGroq();

    tempFolder = path.join(uploadDir, `frames_${Date.now()}`);
    fs.mkdirSync(tempFolder, { recursive: true });

    const framePaths = await extractFrames(videoPath, tempFolder);

    const base64Frames = framePaths.map((fp) => {
      const data = fs.readFileSync(fp);
      return `data:image/jpeg;base64,${data.toString("base64")}`;
    });

    if (tempFolder && fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, { recursive: true, force: true });
      tempFolder = "";
    }
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    const groq = getGroq();
    
    // Step 1: Vision Extraction
    const visionMessages: any[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract visual information from these application/website screenshots.
Analyze carefully and return ONLY a JSON object matching this schema:
{
  "extractedText": ["word1", "phrase2", ...],
  "logos": ["logo description 1", ...],
  "uiElements": ["sidebar", "navbar", "settings icon", ...]
}
Include any recognizable words, brands, menus, or distinct UI layouts.
Perform OCR on all visible text, specifically supporting English, Arabic, French, and other languages.`
          },
          ...base64Frames.map((url) => ({ type: "image_url", image_url: { url } })),
        ],
      },
    ];

    const visionCompletion = await groq.chat.completions.create({
      model: process.env.GROQ_VISION_MODEL || "llama-3.2-90b-vision-preview",
      messages: visionMessages,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const visionContent = visionCompletion.choices[0]?.message?.content || "{}";
    const extractedData = JSON.parse(visionContent);

    // Step 2: Database Search
    const searchTerms = [
      ...(extractedData.extractedText || []),
      ...(extractedData.logos || [])
    ].map((t: string) => t.toLowerCase());

    const dbMatches = appsDatabase.filter(app => {
      const appNameLower = app.name.toLowerCase();
      if (searchTerms.some(term => term.includes(appNameLower) || appNameLower.includes(term))) {
        return true;
      }
      return app.keywords.some(kw => searchTerms.some(term => term.includes(kw)));
    });

    // Step 3: Reasoning
    const reasoningMessages: any[] = [
      {
        role: "system",
        content: `You are an expert app identification system.
Your job is to identify an application based on extracted visual evidence and database matches.
You must NOT guess blindly. If confidence is low, set success to false.
Return ONLY valid JSON matching this exact schema:
{
  "success": boolean,
  "confidence": number, // 0-100
  "appName": string,
  "description": string,
  "type": string,
  "platforms": { "website": boolean, "android": boolean, "iphone": boolean, "windows": boolean, "mac": boolean, "linux": boolean },
  "officialLink": string | null,
  "storeLinks": { "googlePlay": string | null, "appStore": string | null },
  "usageSteps": string[],
  "pricing": { "model": "Free" | "Paid" | "Freemium" | "Open Source" | "Trial", "limitations": string },
  "evidence": { "detectedText": string[], "detectedLogos": string[], "uiElements": string[] },
  "alternatives": [{ "appName": string, "confidence": number }]
}`
      },
      {
        role: "user",
        content: `Evidence from video frames:
Extracted Text: ${JSON.stringify(extractedData.extractedText)}
Logos: ${JSON.stringify(extractedData.logos)}
UI Elements: ${JSON.stringify(extractedData.uiElements)}

Database Matches found:
${JSON.stringify(dbMatches)}

Based strictly on this evidence, identify the app.`
      }
    ];

    const reasoningCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: reasoningMessages,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const finalContent = reasoningCompletion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(finalContent);

    // Fallback message handling if needed by frontend
    if (!result.success) {
       // Just return the result, frontend handles success: false
    }

    res.json({ success: true, result });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to analyze video." });
  } finally {
    try {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      if (tempFolder && fs.existsSync(tempFolder)) {
        fs.rmSync(tempFolder, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.error("Cleanup Error:", cleanupErr);
    }
  }
});

// Catch-all error handler for API routes
app.use("/api/*", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({ success: false, error: "Internal server error." });
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
