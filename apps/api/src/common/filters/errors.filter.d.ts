import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class ErrorsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
