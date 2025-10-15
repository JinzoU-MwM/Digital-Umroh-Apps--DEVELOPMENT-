import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let errors: any[] = [];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || exception.message;

      // Handle validation errors
      if (status === HttpStatus.BAD_REQUEST && Array.isArray((exceptionResponse as any).message)) {
        errors = (exceptionResponse as any).message.map((msg: string) => ({ message: msg }));
        message = 'Validation failed';
      } else {
        errors = (exceptionResponse as any).errors || [];
      }
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

    // Log HTTP errors (except 4xx client errors which are expected)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}