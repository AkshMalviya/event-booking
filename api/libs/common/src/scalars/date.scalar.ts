import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'DateTime custom scalar type';

  parseValue(value: unknown): Date {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value);
    }
    throw new Error('Invalid type for DateTime parsing');
  }

  serialize(value: unknown): string {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value).toISOString();
    }
    throw new Error('Invalid type for DateTime serialization');
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('Invalid AST node for DateTime parsing');
  }
}
