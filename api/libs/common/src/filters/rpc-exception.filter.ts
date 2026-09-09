import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception && typeof exception === 'object') {
      const possibleStatus =
        exception.statusCode ||
        exception.status ||
        (exception.error && exception.error.statusCode);

      if (typeof possibleStatus === 'number') {
        status = possibleStatus;
      } else {
        status = HttpStatus.BAD_REQUEST;
      }

      message =
        exception.message ||
        exception.response ||
        exception.error ||
        exception;
    } else if (typeof exception === 'string') {
      status = HttpStatus.BAD_REQUEST;
      message = exception;
    }

    if (typeof message === 'object' && message !== null) {
      response.status(status).json(message);
    } else {
      response.status(status).json({
        statusCode: status,
        message,
      });
    }
  }
}
