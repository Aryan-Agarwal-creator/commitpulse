/**
 * lib/graphql-query-validator.ts
 *
 * GraphQL query validation to prevent injection vulnerabilities.
 * Validates query strings before sending to prevent malicious input.
 */

export interface QueryValidationResult {
  valid: boolean;
  errors?: string[];
}

export function isValidGraphQLQuery(queryString: string): QueryValidationResult {
  if (!queryString || typeof queryString !== 'string') {
    return { valid: false, errors: ['Query must be a non-empty string'] };
  }

  // Check for obvious injection patterns
  const injectionPatterns = [
    /;\s*DROP/i,
    /;\s*DELETE/i,
    /;\s*TRUNCATE/i,
    /;\s*ALTER/i,
    /union\s+select/i,
    /exec\s*\(/i,
    /script\s*>/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(queryString)) {
      return { valid: false, errors: ['Query contains potentially malicious patterns'] };
    }
  }

  // Basic GraphQL query structure validation
  if (!queryString.includes('{') || !queryString.includes('}')) {
    return { valid: false, errors: ['Invalid GraphQL query structure'] };
  }

  try {
    // Validate JSON-like structure (GraphQL queries contain nested objects)
    const openBraces = (queryString.match(/{/g) || []).length;
    const closeBraces = (queryString.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      return { valid: false, errors: ['Mismatched braces in GraphQL query'] };
    }

    return { valid: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid GraphQL query';
    return { valid: false, errors: [message] };
  }
}

export function validateQueryBeforeSending(query: string): QueryValidationResult {
  return isValidGraphQLQuery(query);
}
