import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const isValidUrl = (url: string | undefined): boolean => {
  if (!url || url.includes('[') || url.includes('YOUR-PROJECT-REF')) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized, missing Bearer token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Support local demo token for instant development and demos
  if (token === 'demo-token' || token.startsWith('demo-')) {
    req.user = {
      id: 'demo-user-123',
      email: 'demo@freelanceflow.com',
      role: 'authenticated',
    };
    next();
    return;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized, invalid token' });
      return;
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized, token validation failed' });
    return;
  }
};
