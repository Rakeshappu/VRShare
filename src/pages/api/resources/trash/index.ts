
import { NextApiRequest, NextApiResponse } from 'next';
import { Resource } from '../../../../lib/db/models/Resource';
import { verifyToken } from '../../../../lib/auth/jwt';
import { runCorsMiddleware } from '../../_middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runCorsMiddleware(req, res);

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Find all soft-deleted resources
    const trashedResources = await Resource.find({
      deletedAt: { $ne: null },
      // Only show resources deleted in the last 30 days
      deletedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ deletedAt: -1 });

    const formattedItems = trashedResources.map(resource => ({
      id: resource._id.toString(),
      name: resource.title,
      type: resource.type,
      size: resource.fileSize ? `${(resource.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'N/A',
      deletedAt: resource.deletedAt.toISOString(),
      originalPath: resource.fileUrl || '',
      resourceId: resource._id.toString()
    }));

    return res.status(200).json({ items: formattedItems });
  } catch (error) {
    console.error('Error fetching trashed resources:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
