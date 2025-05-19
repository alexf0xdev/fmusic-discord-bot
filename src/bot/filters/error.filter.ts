import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  private logger = new Logger(ErrorFilter.name);

  async catch(exception: Error, host: ArgumentsHost) {
    this.logger.log(exception);
  }
}
