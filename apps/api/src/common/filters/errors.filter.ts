import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors || [];
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errors = [{ message: 'An unexpected error occurred' }];
    }

    const errorResponse = {
      success: false,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        tenantId: request['tenantId'],
        userId: request['userId'],
        path: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'],
      },
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }
}