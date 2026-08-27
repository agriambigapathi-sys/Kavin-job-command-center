export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    path: req.query?.path || 'unknown',
    message: 'Kavin Job Command Center API route',
    timestamp: new Date().toISOString(),
  });
}
