// server/socket-server/src/middleware/auth.ts - Authentication middleware

import type { Socket } from 'socket.io';
import PocketBase from 'pocketbase';

// Use your ngrok URL or local IP for PocketBase
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'https://tick-dynamic-trout.ngrok-free.app';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      username: string;
      displayName: string;
      email: string;
    };
    currentRoom?: string;
  };
}

export async function authMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify token with PocketBase
    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(token, null);

    // Validate token by attempting to get current user
    try {
      const authData = await pb.collection('users').authRefresh();

      socket.data.user = {
        id: authData.record.id,
        username: authData.record.username,
        displayName: authData.record.displayName || authData.record.username,
        email: authData.record.email,
      };

      next();
    } catch (error) {
      return next(new Error('Invalid or expired token'));
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return next(new Error('Authentication failed'));
  }
}

// Rate limiter middleware
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 10, windowMs = 5000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  check(userId: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(userId);

    if (!entry || now > entry.resetTime) {
      this.limits.set(userId, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [userId, entry] of this.limits) {
      if (now > entry.resetTime) {
        this.limits.delete(userId);
      }
    }
  }
}

export const rateLimiter = new RateLimiter(10, 5000);

