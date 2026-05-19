-- 管理员账号初始化脚本
-- 密码使用 bcrypt 哈希，密码为 admin123456
INSERT OR IGNORE INTO users (phone, password, nickname, role, authStatus, realName)
VALUES (
  '13800000001',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '系统管理员',
  'admin',
  'verified',
  '管理员'
);

-- 运营人员账号初始化脚本
-- 密码使用 bcrypt 哈希，密码为 operator123
INSERT OR IGNORE INTO users (phone, password, nickname, role, authStatus, realName)
VALUES (
  '13800000002',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '运营人员',
  'operator',
  'verified',
  '运营'
);
