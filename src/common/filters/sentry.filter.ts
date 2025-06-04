import { type ArgumentsHost, Catch } from '@nestjs/common';
import { captureException } from '@sentry/nestjs';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';

@Catch()
export class SentryFilter extends SentryGlobalFilter {
  public catch(exception: unknown, host: ArgumentsHost) {
    captureException(exception);
    return super.catch(exception, host);
  }
}
