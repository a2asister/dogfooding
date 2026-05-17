import bcrypt from 'bcryptjs';

export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码需要包含至少一个大写字母' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码需要包含至少一个小写字母' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码需要包含至少一个数字' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: '密码需要包含至少一个特殊字符(!@#$%^&*等)' };
  }

  return { valid: true, message: '密码强度符合要求' };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
