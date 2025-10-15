import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
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
export declare class ResponseTransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>>;
}
