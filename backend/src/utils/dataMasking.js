const SENSITIVE_FIELDS = [
  'password', 'pwd', 'secret', 'token', 'authorization',
  'creditCard', 'cardNumber', 'bankCard',
  'phone', 'mobile', 'telephone',
  'email', 'mail',
  'idCard', 'identityCard', 'idNumber',
  'address', 'location', 'ip', 'ipAddress'
];

const SENSITIVE_PATTERNS = {
  phone: /1[3-9]\d{9}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  idCard: /\d{17}[\dXx]|\d{15}/g,
  bankCard: /\d{16,19}/g
};

function maskPhone(phone) {
  if (!phone) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskEmail(email) {
  if (!email) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `*@${domain}`;
  }
  return `${name.substring(0, 2)}***@${domain}`;
}

function maskIdCard(idCard) {
  if (!idCard) return idCard;
  if (idCard.length === 18) {
    return `${idCard.substring(0, 6)}********${idCard.substring(14)}`;
  }
  if (idCard.length === 15) {
    return `${idCard.substring(0, 6)}*****${idCard.substring(11)}`;
  }
  return idCard;
}

function maskBankCard(cardNumber) {
  if (!cardNumber) return cardNumber;
  if (cardNumber.length >= 16) {
    return `${cardNumber.substring(0, 4)}************${cardNumber.substring(cardNumber.length - 4)}`;
  }
  return cardNumber;
}

function maskValue(value, key) {
  if (typeof value !== 'string') return value;
  
  const keyLower = key?.toLowerCase() || '';
  
  if (SENSITIVE_FIELDS.some(field => keyLower.includes(field.toLowerCase()))) {
    return '******';
  }
  
  if (SENSITIVE_PATTERNS.phone.test(value)) {
    return maskPhone(value);
  }
  
  if (SENSITIVE_PATTERNS.email.test(value)) {
    return maskEmail(value);
  }
  
  if (SENSITIVE_PATTERNS.idCard.test(value)) {
    return maskIdCard(value);
  }
  
  if (SENSITIVE_PATTERNS.bankCard.test(value)) {
    return maskBankCard(value);
  }
  
  return value;
}

function maskData(data, key = null) {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'string') {
    return maskValue(data, key);
  }
  
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => maskData(item, key));
  }
  
  if (typeof data === 'object') {
    const masked = {};
    for (const [k, v] of Object.entries(data)) {
      masked[k] = maskData(v, k);
    }
    return masked;
  }
  
  return data;
}

module.exports = {
  maskData,
  maskPhone,
  maskEmail,
  maskIdCard,
  maskBankCard,
  SENSITIVE_FIELDS
};
