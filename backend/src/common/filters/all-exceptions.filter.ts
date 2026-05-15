import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message;
      errorCode = (exceptionResponse as any).errorCode || 'HTTP_ERROR';
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = '数据库操作失败';
      errorCode = 'DATABASE_ERROR';
      this.logger.error(`数据库错误: ${exception.message}`, exception.stack);
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`未处理的异常: ${exception.message}`, exception.stack);
    }

    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      canRepair: this.canRepair(errorCode),
    });
  }

  private canRepair(errorCode: string): boolean {
    return ['DATABASE_ERROR', 'VALIDATION_ERROR', 'DATA_CONSISTENCY_ERROR'].includes(errorCode);
  }
}
