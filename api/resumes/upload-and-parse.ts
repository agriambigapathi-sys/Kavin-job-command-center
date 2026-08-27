import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed. Please use POST.`,
    });
  }

  try {
    const { fileName, fileType, fileBase64, textContent } = req.body || {};

    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Filename is required.',
      });
    }

    let extractedText = '';

    // 1. Extract raw text from file
    if (textContent && typeof textContent === 'string' && textContent.trim().length > 0) {
      extractedText = textContent.trim();
    } else if (fileBase64 && typeof fileBase64 === 'string') {
      try {
        const buffer = Buffer.from(fileBase64, 'base64');
        const lowerName = fileName.toLowerCase();

        if (lowerName.endsWith('.pdf') || fileType === 'pdf' || fileType === 'application/pdf') {
          const pdfData = await pdfParse(buffer);
          extractedText = (pdfData.text || '').trim();
        } else if (
          lowerName.endsWith('.docx') ||
          lowerName.endsWith('.doc') ||
          fileType === 'docx' ||
          fileType.includes('word') ||
          fileType.includes('officedocument')
        ) {
          const mammothResult = await mammoth.extractRawText({ buffer });
          extractedText = (mammothResult.value || '').trim();
        } else {
          // Plain text / markdown / tex decoding
          extractedText = buffer.toString('utf-8').trim();
        }
      } catch (extractErr: any) {
        console.error('File extraction error:', extractErr);
        return res.status(400).json({
          success: false,
          error: `Failed to extract text from ${fileName}. The file may be corrupted, encrypted, or in an unsupported format.`,
        });
      }
    }

    if (!extractedText || extractedText.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'File contains no readable text or is empty. Please select a valid resume document.',
        extractedText: '',
      });
    }

    // 2. Structured AI Parsing using Gemini AI Client
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: false,
        parsingStatus: 'raw_only',
        extractedText,
        error: 'Gemini AI API service is not configured on the server. Raw extracted text is preserved.',
        parsedData: null,
      });
    }

    const parsePrompt = `You are a zero-hallucination Technical Resume Parser.
Your sole job is to extract authentic facts from the candidate's resume text into structured JSON.

CRITICAL ZERO-HALLUCINATION & NO-DEFAULT DIRECTIVES:
1. NEVER invent, fabricate, or assume any facts, job titles, companies, dates, locations, skills, metrics, degrees, or contact details.
2. If a field or section is missing from the resume text (e.g. no GitHub link, no phone number, no awards, no certifications), set that property to null or [].
3. NEVER insert default placeholder text such as "Senior Software Engineer", "Enterprise Solutions", "San Francisco, CA", "2022 - Present", or generic bullet points.
4. Extract only facts explicitly present in the document.

Return ONLY a valid JSON object matching this exact schema:
{
  "personalInfo": {
    "fullName": "<candidate full name or null>",
    "email": "<email address or null>",
    "phone": "<phone number or null>",
    "location": "<city/state/location or null>",
    "linkedin": "<linkedin URL or null>",
    "github": "<github URL or null>",
    "portfolio": "<portfolio URL or null>"
  },
  "professionalInfo": {
    "summary": "<professional summary statement or null>",
    "skills": {
      "technicalSkills": ["<technical skill 1>", "<technical skill 2>"],
      "softSkills": ["<soft skill 1>"]
    },
    "workExperience": [
      {
        "company": "<company name or null>",
        "jobTitle": "<role / job title or null>",
        "location": "<location or null>",
        "employmentDates": "<dates or null>",
        "responsibilities": ["<responsibility 1>", "<responsibility 2>"],
        "achievements": ["<achievement 1>"]
      }
    ],
    "projects": [
      {
        "title": "<project name or null>",
        "description": "<project summary or null>",
        "technologies": ["<tech 1>", "<tech 2>"],
        "link": "<project link or null>"
      }
    ],
    "education": [
      {
        "institution": "<school / university name or null>",
        "degree": "<degree or null>",
        "field": "<field of study or null>",
        "dates": "<dates or null>"
      }
    ],
    "certifications": ["<certification 1>"],
    "awards": ["<award 1>"],
    "languages": ["<language 1>"]
  }
}

Resume Document Content:
"""
${extractedText.slice(0, 32000)}
"""`;

    // 18-second timeout for AI parse
    const geminiCall = ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: parsePrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutCall = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI resume parsing timed out after 18 seconds')), 18000)
    );

    const response = (await Promise.race([geminiCall, timeoutCall])) as any;
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(response.text || '{}');
    } catch {
      throw new Error('Failed to parse AI JSON response.');
    }

    return res.status(200).json({
      success: true,
      parsingStatus: 'completed',
      extractedText,
      parsedData,
    });
  } catch (err: any) {
    console.error('Resume upload & parse error:', err);
    return res.status(500).json({
      success: false,
      parsingStatus: 'failed',
      error: err.message || 'Failed to parse resume.',
      extractedText: req.body?.textContent || '',
    });
  }
}
