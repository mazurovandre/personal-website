import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { contactRequestSchema } from '@portfolio/contracts';
import type { Request } from 'express';
import { ContactService } from './contact.service.js';
import { RateLimitGuard } from './rate-limit.guard.js';

@Controller('contact')
@UseGuards(RateLimitGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() body: unknown, @Req() request: Request) {
    const parsed = contactRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Please check the submitted fields.');
    }

    await this.contactService.send(parsed.data, request.ip ?? 'unknown');
    return { ok: true };
  }
}

