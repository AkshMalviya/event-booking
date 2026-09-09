import {
  ArgumentsHost,
  Catch,
  HttpException,
  RpcExceptionFilter,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class MicroserviceExceptionFilter implements RpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      return throwError(() =>
        typeof res === 'object'
          ? res
          : { statusCode: exception.getStatus(), message: res },
      );
    }

    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    return throwError(() => ({
      statusCode: 500,
      message: exception?.message || 'Internal server error',
    }));
  }
}
