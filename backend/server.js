const express = require("express");
const multer = require("multer");
const cors = require("cors");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { translateMultipleTexts } = require('./services/translationService');

const app = express();
app.use(cors());

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyDhyuXj2KLCclCsN_-yDr0NuOOLIRQQnls");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Function to call Gemini API
async function callGeminiAPI(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Analyze this document and provide a structured analysis with all sections marked clearly:

SUMMARY:
Brief overview of the document (2-3 sentences)

KEY POINTS:
1.
2.
3.

LEGAL ACTS AND CLAUSES:
1. [Act/Clause Name]:
   Definition: [Brief definition]
   Application: [How it applies to this document]
2. [Act/Clause Name]:
   Definition: [Brief definition]
   Application: [How it applies to this document]

LEGAL IMPLICATIONS:
1.
2.
3.

RECOMMENDATIONS:
1.
2.
3.

Content: ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Endpoint to handle file uploads
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let extractedText = "";

    if (fileType === "application/pdf") {
      // Extract text from PDF
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (fileType.startsWith("image/")) {
      // Extract text from image using Tesseract.js
      const result = await Tesseract.recognize(filePath, "eng");
      extractedText = result.data.text;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Call the AI API
    const aiResponse = await callGeminiAPI(extractedText);

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    res.json({ text: extractedText, aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process file" });
  }
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { texts, targetLang } = req.body;
    const translations = await translateMultipleTexts(texts, targetLang);
    res.json({ translations });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
