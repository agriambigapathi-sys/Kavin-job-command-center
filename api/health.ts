import type { Request, Response } from 'express';

export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    app: 'Kavin Job Command Center',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
}
