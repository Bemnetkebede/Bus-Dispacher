import { Controller, Post, Body, Headers, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'; 
import { RolesGuard } from '../auth/roles.guard.js';    
import { Roles } from '../auth/roles.decorator.js';      
import { Role } from '@prisma/client';
import type { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 🔒 Locked down: Only Admins and Dispatchers can initiate a checkout
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Post('checkout')
  async checkout(@Body() body: { routeId: string; userEmail: string; firstName: string; lastName: string }) {
    return this.paymentService.initializePayment(
      body.routeId,
      body.userEmail,
      body.firstName,
      body.lastName,
    );
  }

  // 🔓 Public: NO GUARDS HERE! Chapa must be able to reach this from the outside.
  // Security is handled by the x-chapa-signature validation inside your service.
  @Post('webhook/chapa')
  async chapaWebhook(
    @Headers('x-chapa-signature') signature: string, 
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const rawBody = JSON.stringify(req.body); 

    try {
      const result = await this.paymentService.handleChapaWebhook(signature, rawBody);
      return res.status(HttpStatus.OK).json(result); 
    } catch (error) {
      return res.status(HttpStatus.FORBIDDEN).json({ error: 'Webhook processing failed' });
    }
  }
}