import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Types, Document } from 'mongoose';

@Injectable()
export class MongooseSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(res => this.serialize(res)));
  }

  private serialize(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // If it's a Mongoose document, call toJSON()
    if (obj instanceof Document) {
      const json = obj.toJSON({ virtuals: true, versionKey: false });
      if (json._id) {
        json.id = json._id.toString();
        delete json._id;
      }
      return this.serialize(json);
    }

    // If it's an ObjectId, convert to string
    if (obj instanceof Types.ObjectId) {
      return obj.toString();
    }

    // If it's an array, map over it
    if (Array.isArray(obj)) {
      return obj.map(item => this.serialize(item));
    }

    // If it's a plain object, recursively serialize its properties
    if (typeof obj === 'object' && obj.constructor === Object) {
      const result: any = {};
      for (const key in obj) {
        if (key === '_id') {
          result['id'] = this.serialize(obj[key]);
        } else {
          result[key] = this.serialize(obj[key]);
        }
      }
      return result;
    }

    return obj;
  }
}
