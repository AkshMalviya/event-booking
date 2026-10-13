import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // If it's a plain object that looks like an RPC error from a microservice
        if (err && !(err instanceof Error) && err.message) {
          // Convert it into a proper NestJS HttpException so GraphQL handles it cleanly
          return throwError(
            () => new HttpException(err.message, err.statusCode || 500),
          );
        }
        
        // Otherwise, rethrow the original error
        return throwError(() => err);
      }),
    );
  }
}
