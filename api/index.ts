export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    message: 'Kavin Job Command Center API is running',
    timestamp: new Date().toISOString(),
  });
}
