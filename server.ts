import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/extract-label', async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const prompt = `
        You are a clinical pharmacist assistant. Extract the medication details from this image.
        Return ONLY a JSON object with the following structure, and nothing else:
        {
          "drug_name": "Generic name of the drug",
          "brand_name": "Brand name if visible, else empty string",
          "dosage": "e.g., 500mg",
          "frequency": "e.g., Twice daily, 1 tablet",
          "item_type": "prescription" | "otc" | "supplement" | "vitamin"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
          ]
        },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (!text) throw new Error('No text returned from Gemini');
      
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error('OCR Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/analyze-interactions', async (req, res) => {
    try {
      const { drugA, drugB, existingData } = req.body;
      
      const prompt = `
        Sen klinik eczacisin. Su ilac cifti icin analiz yap:
        Ilac A: ${drugA}, Ilac B: ${drugB}
        Bilinen veri: ${existingData || 'Yok'}

        Sadece su JSON formatinda don:
        {
          "severity": "none|minor|moderate|major|contraindicated",
          "mechanism": "max 30 kelime",
          "plain_explanation": "jargonsuz, max 50 kelime",
          "symptoms_to_watch": "max 30 kelime",
          "timing_advice": "ornek: 2 saat arayla al, ya da null",
          "food_interaction": "ornek: greyfurt ile alma, ya da null"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (!text) throw new Error('No text returned from Gemini');
      
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error('Analysis Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
