
import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '../../lib/db/connect';
import Cors from 'cors';

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>

const cors = Cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

// Helper method to wait for a middleware to execute before continuing
export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const withDB = (handler: Handler) => async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Set CORS headers directly for preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,OPTIONS,PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.status(200).end();
      return;
    }
    
    await runCorsMiddleware(req, res);
    await connectDB();
    return handler(req, res);
  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }
  
  await runCorsMiddleware(req, res);
  return res;
}
