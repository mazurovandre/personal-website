import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';

type Counter = { count: number; resetAt: number };

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly counters = new Map<string, Counter>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.ip ?? 'unknown';
    const now = Date.now();
    const windowMs = positiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000);
    const max = positiveNumber(process.env.RATE_LIMIT_MAX, 5);
    const current = this.counters.get(key);

    if (!current || current.resetAt <= now) {
      this.counters.set(key, { count: 1, resetAt: now + windowMs });
      this.prune(now);
      return true;
    }

    current.count += 1;
    if (current.count > max) {
      throw new HttpException('Too many messages. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }

  private prune(now: number) {
    if (this.counters.size < 1_000) return;
    for (const [key, counter] of this.counters) {
      if (counter.resetAt <= now) this.counters.delete(key);
    }
  }
}

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

