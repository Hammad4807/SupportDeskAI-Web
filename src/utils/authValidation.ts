// Same password rules as the API (RegisterRequestValidator + the Identity options in AuthRegistration.cs).
// Returns the first problem, or undefined when the password is fine.
export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 100) return 'Password must not exceed 100 characters.'
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return 'Password needs an uppercase letter, a lowercase letter and a digit.'
  }
  return undefined
}
