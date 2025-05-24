import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { BotModule } from './bot/bot.module';
import { SentryFilter } from './common/filters/sentry.filter';

@Module({
  imports: [ConfigModule.forRoot(), SentryModule.forRoot(), BotModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryFilter,
    },
  ],
})
export class AppModule {}
