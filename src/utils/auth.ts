export const validatePasswordRules = (password: string) => {
  return {
    length: password.length >= 8 && password.length <= 16,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]=+~`]/.test(password),
  };
};
