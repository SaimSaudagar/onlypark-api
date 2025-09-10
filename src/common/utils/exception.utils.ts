import { ErrorCode } from '../exceptions/error-code';
import { NestCustomException } from '../exceptions/custom.exception';

export class ExceptionUtils {
  static handleNestException(errors) {
    if (errors.length > 0) {
      // Get the first error object
      const error = errors[0];
      const { property, constraints, context } =
        this.findFirstConstraint(error);

      if (!constraints) return null;

      // Get the first constraint key and message
      const constraintKeys = Object.keys(constraints);
      if (constraintKeys.length === 0) return null;
      const firstConstraintKey = constraintKeys[0];
      const constraintMessage = constraints[firstConstraintKey];

      // If the error object has a context object, it means that the error was thrown by the application by manually passing the error code and data from dto class
      if (context) {
        const contextkeys = Object.keys(context);
        const contextKey = contextkeys[0];
        if (context[contextKey]['errorCode']) {
          const { code, data } = context[contextKey]['errorCode'] as {
            code: string;
            data: object;
          };
          throw new NestCustomException(code, data, constraintMessage);
        }
      }
      // If the error object does not have a context object, it means that the error was thrown by the class-validator library
      const nestError = Object.values(ErrorCode).find(
        (code) =>
          code.key.toLocaleLowerCase() ===
          firstConstraintKey.toLocaleLowerCase(),
      );
      throw new NestCustomException(
        nestError?.code || ErrorCode.NOT_SPECIFIED.key,
        { propertyName: property },
        constraintMessage,
      );
    }
  }

  // Recursive function to find the first constraint in the error object
  private static findFirstConstraint(
    error,
    propertyPath = '',
  ): {
    property: string;
    constraints: Record<string, string>;
    context?: object;
  } {
    if (error.constraints) {
      return {
        property: propertyPath
          ? `${propertyPath}.${error.property}`
          : error.property,
        constraints: error.constraints,
        context: error.contexts,
      };
    }
    // If the error object has children, recursively call the function to find the first constraint
    if (error.children && error.children.length > 0) {
      for (const child of error.children) {
        const result = this.findFirstConstraint(
          child,
          propertyPath ? `${propertyPath}.${error.property}` : error.property,
        );
        if (result.constraints) {
          return result;
        }
      }
    }

    return { property: '', constraints: null, context: null };
  }
}

