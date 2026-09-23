import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { BusModule } from './bus/bus.module.js';
import { RouteModule } from './route/route.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from  './User/user.module.js'


const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeConfig =
  process.env.NESTJS_OBSERVE_APP_KEY && process.env.NESTJS_OBSERVE_APP_SECRET
    ? {
        appKey: process.env.NESTJS_OBSERVE_APP_KEY,
        appSecret: process.env.NESTJS_OBSERVE_APP_SECRET,
        serviceId: process.env.NESTJS_OBSERVE_SERVICE_ID ?? 'back-end',
      }
    : undefined;

@Module({
  imports: [
    PrismaModule,
    UserModule,
    BusModule,
    ...(observeConfig ? [ObserveModule.forRoot(observeConfig)] : []),
    RouteModule,
    PaymentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

export { ObserveInstrument };
