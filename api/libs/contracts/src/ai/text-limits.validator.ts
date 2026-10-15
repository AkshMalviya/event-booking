import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsMaxLines(
  maxLines: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMaxLines',
      target: object.constructor,
      propertyName,
      constraints: [maxLines],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return true;
          const lines = value.split(/\r\n|\r|\n/);
          return lines.length <= args.constraints[0];
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} cannot exceed ${args.constraints[0]} lines`;
        },
      },
    });
  };
}

export function IsMaxWords(
  maxWords: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMaxWords',
      target: object.constructor,
      propertyName,
      constraints: [maxWords],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return true;
          const words = value.trim().split(/\s+/).filter(Boolean);
          return words.length <= args.constraints[0];
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} cannot exceed ${args.constraints[0]} words`;
        },
      },
    });
  };
}
