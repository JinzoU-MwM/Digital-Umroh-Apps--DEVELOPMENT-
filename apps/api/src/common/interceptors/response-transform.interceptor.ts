import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    tenantId?: string;
    userId?: string;
    requestId?: string;
  };
  errors?: any[];
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message: data?.message || 'Success',
        meta: {
          timestamp: new Date().toISOString(),
          tenantId: request['tenantId'],
          userId: request['userId'],
          requestId: request.headers['x-request-id'] || response.id,
        },
      })),
    );
  }
}