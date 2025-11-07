import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export const RegexPatterns = {
  // Only alphabets (A–Z, a–z) and spaces
  alphabetsWithSpace: /^[A-Za-z ]+$/,
  // Only alphabets (no spaces)
  alphabetsOnly: /^[A-Za-z]+$/,
  // Name validation (alphabets, single spaces, max one space between words)
  name: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
  // Numbers only
  numbersOnly: /^[0-9]+$/,
  // Mobile number (10 digits)
  mobileNumber: /^[0-9]{10}$/,
  // Email
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
  // Password (Min 8 chars, at least 1 letter, 1 number, 1 special char)
  password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
  // Decimal number (e.g. 10, 10.5, 0.99)
  decimalNumber: /^\d+(\.\d{1,2})?$/,
  // Alphanumeric only
  alphaNumeric: /^[A-Za-z0-9]+$/,
  // Alphanumeric with space
  alphaNumericWithSpace: /^[A-Za-z0-9 ]+$/,
  // Pin code / ZIP code (6 digits)
  pinCode: /^[0-9]{6}$/,
  // URL
  url: /^(https?:\/\/)?([\w\-])+\.{1}[a-zA-Z]{2,}([\/\w\-.]*)*\/?$/,
  // Date (YYYY-MM-DD)
  date: /^\d{4}-\d{2}-\d{2}$/,
  // Time (HH:mm, 24-hour format)
  time: /^([01]\d|2[0-3]):([0-5]\d)$/,
  // Username (alphanumeric, underscores, 3–20 chars)
  username: /^[a-zA-Z0-9_]{3,20}$/,
  // Amount (no negative, up to 2 decimals)
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
};

export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dob = control.value;
    if (!dob) return null; 
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return { minAge: { requiredAge: minAge, actualAge: null } }; // invalid date
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < minAge
      ? { minAge: { requiredAge: minAge, actualAge: age } }
      : null;
  };
}