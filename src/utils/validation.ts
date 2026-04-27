import { CellValidation, CellType } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateCellValue(
  value: unknown,
  cellType: CellType,
  validation?: CellValidation
): ValidationResult {
  if (validation?.required) {
    const isEmpty = value === null || value === undefined || value === '' || 
                   (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
      return {
        isValid: false,
        errorMessage: validation.errorMessage || '此字段为必填项'
      };
    }
  }

  if (value === null || value === undefined || value === '') {
    return { isValid: true };
  }

  switch (cellType) {
    case 'number': {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return {
          isValid: false,
          errorMessage: validation?.errorMessage || '请输入有效的数字'
        };
      }
      if (validation?.minValue !== undefined && numValue < validation.minValue) {
        return {
          isValid: false,
          errorMessage: `数值不能小于 ${validation.minValue}`
        };
      }
      if (validation?.maxValue !== undefined && numValue > validation.maxValue) {
        return {
          isValid: false,
          errorMessage: `数值不能大于 ${validation.maxValue}`
        };
      }
      break;
    }

    case 'text': {
      const strValue = String(value);
      if (validation?.minLength !== undefined && strValue.length < validation.minLength) {
        return {
          isValid: false,
          errorMessage: `字符长度不能小于 ${validation.minLength}`
        };
      }
      if (validation?.maxLength !== undefined && strValue.length > validation.maxLength) {
        return {
          isValid: false,
          errorMessage: `字符长度不能大于 ${validation.maxLength}`
        };
      }
      if (validation?.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(strValue)) {
          return {
            isValid: false,
            errorMessage: validation.errorMessage || '格式不正确'
          };
        }
      }
      break;
    }

    case 'date': {
      const dateValue = new Date(String(value));
      if (isNaN(dateValue.getTime())) {
        return {
          isValid: false,
          errorMessage: validation?.errorMessage || '请输入有效的日期'
        };
      }
      break;
    }

    case 'dropdown': {
      break;
    }
  }

  return { isValid: true };
}
