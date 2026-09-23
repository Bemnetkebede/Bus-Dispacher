import { Injectable, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js'; // Adjust path if your PrismaService is elsewhere
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async initializePayment(routeId: string, userEmail: string, firstName: string, lastName: string) {
    // 1. Fetch the strict, admin-defined price for this route
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route) {
      throw new BadRequestException('This route is currently unavailable');
    }

    const txRef = `TX-${uuidv4()}`;
    const amountStr = route.cost.toString(); 

    // 2. Lock the transaction in the database as PENDING
    await this.prisma.booking.create({
      data: {
        txRef,
        routeId: route.id,
        amountPaid: route.cost,
        userEmail,
        paymentStatus: 'pending',
      },
    });
    
    // 3. Prepare the Chapa Initialize payload
    const payload = {
      amount: amountStr,
      currency: 'ETB',
      email: userEmail,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/chapa`, // Webhook endpoint
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,    // Browser redirect
    };

    // 4. Send the request to Chapa
    try {
      const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status !== 'success') {
        throw new InternalServerErrorException('Payment gateway initialization failed');
      }

      // Return the secure checkout link to the client
      return { checkoutUrl: data.data.checkout_url };
    } catch (error) {
      throw new InternalServerErrorException('Failed to communicate with Chapa');
    }
  }
  /**
   * Validates the cryptographic signature and updates the DB if successful
   */
  async handleChapaWebhook(signature: string, rawBody: string) {
    const secret = process.env.CHAPA_WEBHOOK_SECRET!;

    // 1. Verify the HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    // 2. The payload is safe to parse
    const event = JSON.parse(rawBody);

    // 3. Mark the payment as SUCCESS in the database
    if (event.event === 'charge.success' || event.status === 'success') {
      await this.prisma.booking.update({
        where: { txRef: event.tx_ref },
        data: { paymentStatus: 'success' },
      });
      console.log(`[Chapa Webhook] Payment confirmed for TxRef: ${event.tx_ref}`);
    }

    return { message: 'Webhook processed successfully' };
  }
}