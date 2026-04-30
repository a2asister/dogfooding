-- 游戏礼包中心数据库初始化脚本

-- 游戏分类表
CREATE TABLE IF NOT EXISTS game_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏分类表';

-- 礼包类型表
CREATE TABLE IF NOT EXISTS gift_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '类型名称',
    description TEXT COMMENT '类型描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='礼包类型表';

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) COMMENT '手机号',
    username VARCHAR(100) COMMENT '用户名',
    password VARCHAR(255) COMMENT '密码（加密）',
    email VARCHAR(200) COMMENT '邮箱',
    avatar VARCHAR(500) COMMENT '头像',
    is_verified TINYINT(1) DEFAULT 0 COMMENT '是否已验证',
    is_admin TINYINT(1) DEFAULT 0 COMMENT '是否管理员',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_phone (phone),
    UNIQUE KEY uk_username (username),
    INDEX idx_phone (phone),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 游戏表
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL COMMENT '游戏分类ID',
    name VARCHAR(200) NOT NULL COMMENT '游戏名称',
    icon VARCHAR(500) COMMENT '游戏图标URL',
    description TEXT COMMENT '游戏描述',
    publisher VARCHAR(200) COMMENT '开发商',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES game_categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游戏表';

-- 礼包表
CREATE TABLE IF NOT EXISTS gifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL COMMENT '游戏ID',
    type_id INT NOT NULL COMMENT '礼包类型ID',
    name VARCHAR(200) NOT NULL COMMENT '礼包名称',
    description TEXT COMMENT '礼包描述',
    icon VARCHAR(500) COMMENT '礼包图标',
    total_count INT NOT NULL DEFAULT 0 COMMENT '总数量',
    claimed_count INT NOT NULL DEFAULT 0 COMMENT '已领取数量',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    is_visible TINYINT(1) DEFAULT 1 COMMENT '是否可见',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES gift_types(id) ON DELETE CASCADE,
    INDEX idx_game (game_id),
    INDEX idx_type (type_id),
    INDEX idx_active (is_active),
    INDEX idx_time (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='礼包表';

-- 礼包码表
CREATE TABLE IF NOT EXISTS gift_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gift_id INT NOT NULL COMMENT '礼包ID',
    code VARCHAR(100) NOT NULL UNIQUE COMMENT '礼包码',
    is_claimed TINYINT(1) DEFAULT 0 COMMENT '是否已领取',
    claimed_by INT COMMENT '领取用户ID',
    claimed_at DATETIME COMMENT '领取时间',
    is_activated TINYINT(1) DEFAULT 0 COMMENT '是否已激活',
    activated_at DATETIME COMMENT '激活时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE,
    FOREIGN KEY (claimed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_gift (gift_id),
    INDEX idx_code (code),
    INDEX idx_claimed (is_claimed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='礼包码表';

-- 领取记录表
CREATE TABLE IF NOT EXISTS claim_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    gift_id INT NOT NULL COMMENT '礼包ID',
    gift_code_id BIGINT NOT NULL COMMENT '礼包码ID',
    code VARCHAR(100) NOT NULL COMMENT '礼包码',
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE CASCADE,
    FOREIGN KEY (gift_code_id) REFERENCES gift_codes(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_gift (gift_id),
    INDEX idx_time (claimed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='领取记录表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT COMMENT '操作用户ID',
    username VARCHAR(100) COMMENT '操作用户名',
    action VARCHAR(200) NOT NULL COMMENT '操作类型',
    module VARCHAR(100) COMMENT '模块',
    target_id INT COMMENT '操作目标ID',
    target_type VARCHAR(100) COMMENT '操作目标类型',
    old_value TEXT COMMENT '修改前值',
    new_value TEXT COMMENT '修改后值',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 请求日志表
CREATE TABLE IF NOT EXISTS request_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(100) COMMENT '请求ID',
    method VARCHAR(10) NOT NULL COMMENT '请求方法',
    path VARCHAR(500) NOT NULL COMMENT '请求路径',
    query_params TEXT COMMENT '查询参数',
    request_body TEXT COMMENT '请求体',
    status_code INT COMMENT '响应状态码',
    response_time INT COMMENT '响应时间(ms)',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    user_id INT COMMENT '用户ID',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_method (method),
    INDEX idx_path (path),
    INDEX idx_status (status_code),
    INDEX idx_time (created_at),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='请求日志表';

-- 错误日志表
CREATE TABLE IF NOT EXISTS error_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    level VARCHAR(20) NOT NULL DEFAULT 'error' COMMENT '日志级别',
    message TEXT NOT NULL COMMENT '错误信息',
    stack_trace TEXT COMMENT '堆栈信息',
    request_id VARCHAR(100) COMMENT '请求ID',
    request_path VARCHAR(500) COMMENT '请求路径',
    request_method VARCHAR(10) COMMENT '请求方法',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    user_id INT COMMENT '用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_time (created_at),
    INDEX idx_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='错误日志表';

-- 插入初始数据
-- 游戏分类
INSERT INTO game_categories (name, description, sort_order) VALUES 
('角色扮演', 'RPG类游戏', 1),
('动作冒险', '动作冒险类游戏', 2),
('策略战棋', '策略战棋类游戏', 3),
('休闲竞技', '休闲竞技类游戏', 4),
('卡牌游戏', '卡牌类游戏', 5);

-- 礼包类型
INSERT INTO gift_types (name, description, sort_order) VALUES 
('新手礼包', '新玩家专属礼包', 1),
('每日礼包', '每日可领取礼包', 2),
('周卡礼包', '周卡用户礼包', 3),
('月卡礼包', '月卡用户礼包', 4),
('节日礼包', '节日活动礼包', 5),
('限时礼包', '限时抢购礼包', 6);

-- 默认管理员用户 (密码: admin123456)
INSERT INTO users (username, password, is_verified, is_admin) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW', 1, 1);
