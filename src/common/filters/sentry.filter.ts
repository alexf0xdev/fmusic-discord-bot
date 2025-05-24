import { type ArgumentsHost, Catch } from '@nestjs/common';
import { captureException } from '@sentry/nestjs';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { NecordArgumentsHost } from 'necord';

@Catch()
export class SentryFilter extends SentryGlobalFilter {
  public catch(exception: unknown, host: ArgumentsHost) {
    const necordArgumentsHost = NecordArgumentsHost.create(host);
    const type = necordArgumentsHost.getType();

    if (type !== 'necord') {
      return super.catch(exception, host);
    }

    captureException(exception);
    throw exception;
  }
}
