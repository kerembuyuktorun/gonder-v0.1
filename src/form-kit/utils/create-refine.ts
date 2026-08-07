/**
 * Cross-Field Validation Utilities
 * 
 * Create refinement functions for common cross-field validations.
 */

/**
 * Refinement configuration for cross-field validation
 */
export interface RefinementConfig {
  validate: (data: Record<string, unknown>) => boolean
  message: string
  path?: string[]
}

export interface FormKitRefinementMessages {
  passwordsDontMatch: string
  endDateMustBeAfterStart: string
  fieldRequired: (field: string) => string
  passwordMustContain: (requirements: string[]) => string
  passwordRequirementMinLength: (count: number) => string
  passwordRequirementUppercase: string
  passwordRequirementLowercase: string
  passwordRequirementNumber: string
  passwordRequirementSpecialCharacter: string
}

export const DEFAULT_FORM_KIT_REFINEMENT_MESSAGES: FormKitRefinementMessages = {
  passwordsDontMatch: "Passwords don't match",
  endDateMustBeAfterStart: 'End date must be after start date',
  fieldRequired: (field) => `${field} is required`,
  passwordMustContain: (requirements) => `Password must include ${requirements.join(', ')}`,
  passwordRequirementMinLength: (count) => `at least ${count} characters`,
  passwordRequirementUppercase: 'at least one uppercase letter',
  passwordRequirementLowercase: 'at least one lowercase letter',
  passwordRequirementNumber: 'at least one number',
  passwordRequirementSpecialCharacter: 'at least one special character',
}

/**
 * Create a password confirmation refinement
 * 
 * Validates that two password fields match.
 * 
 * @param passwordField - Name of the password field
 * @param confirmField - Name of the confirmation field
 * @param message - Error message (optional)
 * @returns Refinement configuration
 * 
 * @example
 * ```ts
 * const schema = buildSchema(fields)
 * const refinement = createPasswordConfirmRefine('password', 'confirmPassword')
 * const enhancedSchema = addRefinements(schema, [refinement])
 * ```
 */
export function createPasswordConfirmRefine(
  passwordField: string = 'password',
  confirmField: string = 'confirmPassword',
  message: string = DEFAULT_FORM_KIT_REFINEMENT_MESSAGES.passwordsDontMatch
): RefinementConfig {
  return {
    validate: (data) => {
      const confirmValue = data[confirmField]
      if (!confirmValue) return true // Skip if confirm field is empty
      return data[passwordField] === confirmValue
    },
    message,
    path: [confirmField],
  }
}

/**
 * Password strength requirements
 */
export interface PasswordStrengthConfig {
  /** Minimum password length */
  minLength?: number
  /** Require at least one uppercase letter */
  requireUppercase?: boolean
  /** Require at least one lowercase letter */
  requireLowercase?: boolean
  /** Require at least one number */
  requireNumber?: boolean
  /** Require at least one special character */
  requireSpecialChar?: boolean
  /** Custom regex pattern */
  customPattern?: RegExp
  /** Custom error message */
  customMessage?: string
}

/**
 * Create password strength refinement
 * 
 * Validates password against strength requirements.
 * 
 * @param config - Password strength configuration
 * @param passwordField - Name of the password field (default: 'password')
 * @returns Refinement configuration
 * 
 * @example
 * ```ts
 * const refinement = createPasswordStrengthRefine({
 *   minLength: 8,
 *   requireUppercase: true,
 *   requireNumber: true,
 *   requireSpecialChar: true,
 * })
 * ```
 */
export function createPasswordStrengthRefine(
  config: PasswordStrengthConfig = {},
  passwordField: string = 'password',
  messages: FormKitRefinementMessages = DEFAULT_FORM_KIT_REFINEMENT_MESSAGES
): RefinementConfig {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = false,
    customPattern,
    customMessage,
  } = config

  return {
    validate: (data) => {
      const password = data[passwordField]
      if (typeof password !== 'string' || password.length === 0) {
        return true // Skip if password is empty (handled by required validation)
      }

      // Min length
      if (password.length < minLength) return false

      // Uppercase
      if (requireUppercase && !/[A-Z]/.test(password)) return false

      // Lowercase
      if (requireLowercase && !/[a-z]/.test(password)) return false

      // Number
      if (requireNumber && !/[0-9]/.test(password)) return false

      // Special character
      if (requireSpecialChar && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false

      // Custom pattern
      if (customPattern && !customPattern.test(password)) return false

      return true
    },
    message:
      customMessage ||
      buildPasswordStrengthMessage({
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumber,
        requireSpecialChar,
      }, messages),
    path: [passwordField],
  }
}

/**
 * Build a user-friendly password strength message
 */
function buildPasswordStrengthMessage(
  config: PasswordStrengthConfig,
  messages: FormKitRefinementMessages
): string {
  const requirements: string[] = []

  if (config.minLength) {
    requirements.push(messages.passwordRequirementMinLength(config.minLength))
  }
  if (config.requireUppercase) {
    requirements.push(messages.passwordRequirementUppercase)
  }
  if (config.requireLowercase) {
    requirements.push(messages.passwordRequirementLowercase)
  }
  if (config.requireNumber) {
    requirements.push(messages.passwordRequirementNumber)
  }
  if (config.requireSpecialChar) {
    requirements.push(messages.passwordRequirementSpecialCharacter)
  }

  return messages.passwordMustContain(requirements)
}

/**
 * Create a date range refinement
 * 
 * Validates that a start date is before an end date.
 * 
 * @param startField - Name of the start date field
 * @param endField - Name of the end date field
 * @param message - Error message (optional)
 * @returns Refinement configuration
 * 
 * @example
 * ```ts
 * const refinement = createDateRangeRefine('startDate', 'endDate')
 * ```
 */
export function createDateRangeRefine(
  startField: string,
  endField: string,
  message: string = DEFAULT_FORM_KIT_REFINEMENT_MESSAGES.endDateMustBeAfterStart
): RefinementConfig {
  const toDateInput = (value: unknown): string | number | Date | null => {
    if (value instanceof Date || typeof value === 'string' || typeof value === 'number') {
      return value
    }

    return null
  }

  return {
    validate: (data) => {
      const start = data[startField]
      const end = data[endField]

      if (!start || !end) return true // Skip if either date is missing

      const startInput = toDateInput(start)
      const endInput = toDateInput(end)

      if (!startInput || !endInput) return true

      const startDate = startInput instanceof Date ? startInput : new Date(startInput)
      const endDate = endInput instanceof Date ? endInput : new Date(endInput)

      return startDate < endDate
    },
    message,
    path: [endField],
  }
}

/**
 * Create a conditional required refinement
 * 
 * Makes a field required based on another field's value.
 * 
 * @param field - Name of the field to make required
 * @param condition - Function that returns true if field should be required
 * @param message - Error message (optional)
 * @returns Refinement configuration
 * 
 * @example
 * ```ts
 * // Make "otherReason" required when "reason" is "other"
 * const refinement = createConditionalRequiredRefine(
 *   'otherReason',
 *   (data) => data.reason === 'other',
 *   'Lütfen diğer nedeni belirtiniz'
 * )
 * ```
 */
export function createConditionalRequiredRefine(
  field: string,
  condition: (data: Record<string, unknown>) => boolean,
  message: string = DEFAULT_FORM_KIT_REFINEMENT_MESSAGES.fieldRequired(field)
): RefinementConfig {
  return {
    validate: (data) => {
      if (!condition(data)) return true // Field not required
      
      const value = data[field]
      
      // Check if value exists and is not empty
      if (value === undefined || value === null || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      
      return true
    },
    message,
    path: [field],
  }
}

/**
 * Create a custom field comparison refinement
 * 
 * Validates two fields against each other with a custom comparison.
 * 
 * @param field1 - First field name
 * @param field2 - Second field name
 * @param comparison - Comparison function
 * @param message - Error message
 * @param errorPath - Which field to show error on (default: field2)
 * @returns Refinement configuration
 * 
 * @example
 * ```ts
 * // Ensure "newPassword" is different from "currentPassword"
 * const refinement = createFieldComparisonRefine(
 *   'currentPassword',
 *   'newPassword',
 *   (current, newPwd) => current !== newPwd,
 *   'Yeni şifre mevcut şifreden farklı olmalıdır',
 *   'newPassword'
 * )
 * ```
 */
export function createFieldComparisonRefine(
  field1: string,
  field2: string,
  comparison: (value1: unknown, value2: unknown) => boolean,
  message: string,
  errorPath: string = field2
): RefinementConfig {
  return {
    validate: (data) => {
      const value1 = data[field1]
      const value2 = data[field2]
      
      // Skip if either value is missing
      if (value1 === undefined || value2 === undefined) return true
      
      return comparison(value1, value2)
    },
    message,
    path: [errorPath],
  }
}

/**
 * Convenience function to get all password refinements
 * 
 * Returns commonly used password refinements (strength + confirm).
 * 
 * @param strengthConfig - Password strength configuration
 * @param passwordField - Name of the password field
 * @param confirmField - Name of the confirmation field
 * @returns Array of refinement configurations
 * 
 * @example
 * ```ts
 * const refinements = getPasswordRefinements({
 *   minLength: 8,
 *   requireUppercase: true,
 *   requireNumber: true,
 * })
 * const schema = addRefinements(buildSchema(fields), refinements)
 * ```
 */
export function getPasswordRefinements(
  strengthConfig?: PasswordStrengthConfig,
  passwordField: string = 'password',
  confirmField: string = 'confirmPassword'
): RefinementConfig[] {
  return [
    createPasswordStrengthRefine(strengthConfig, passwordField),
    createPasswordConfirmRefine(passwordField, confirmField),
  ]
}
