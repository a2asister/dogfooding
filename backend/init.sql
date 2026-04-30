-- 创建数据库
CREATE DATABASE IF NOT EXISTS grand_canal_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE grand_canal_monitoring;

-- 创建监测点表
CREATE TABLE IF NOT EXISTS monitoring_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '监测点名称',
  latitude DECIMAL(10, 7) NOT NULL COMMENT '纬度',
  longitude DECIMAL(10, 7) NOT NULL COMMENT '经度',
  status ENUM('normal', 'warning', 'danger') DEFAULT 'normal' COMMENT '状态',
  location VARCHAR(255) COMMENT '位置描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建水质数据表
CREATE TABLE IF NOT EXISTS water_quality_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  monitoring_point_id INT NOT NULL COMMENT '监测点ID',
  ph DECIMAL(4, 2) COMMENT 'pH值',
  temperature DECIMAL(5, 2) COMMENT '温度(°C)',
  turbidity DECIMAL(5, 2) COMMENT '浊度(NTU)',
  dissolved_oxygen DECIMAL(4, 2) COMMENT '溶解氧(mg/L)',
  conductivity DECIMAL(8, 2) COMMENT '电导率(μS/cm)',
  ammonia_nitrogen DECIMAL(6, 4) COMMENT '氨氮(mg/L)',
  total_phosphorus DECIMAL(6, 4) COMMENT '总磷(mg/L)',
  collected_at TIMESTAMP NOT NULL COMMENT '采集时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_monitoring_point (monitoring_point_id),
  INDEX idx_collected_at (collected_at),
  FOREIGN KEY (monitoring_point_id) REFERENCES monitoring_points(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建污染事件表
CREATE TABLE IF NOT EXISTS pollution_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  monitoring_point_id INT NOT NULL COMMENT '监测点ID',
  event_type ENUM('floating_trash', 'chemical_pollution', 'suspended_matter', 'algae_bloom', 'other') NOT NULL COMMENT '污染类型',
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL COMMENT '严重程度',
  description TEXT COMMENT '描述',
  detected_at TIMESTAMP NOT NULL COMMENT '检测时间',
  resolved_at TIMESTAMP NULL COMMENT '解决时间',
  status ENUM('pending', 'processing', 'resolved', 'closed') DEFAULT 'pending' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_monitoring_point (monitoring_point_id),
  INDEX idx_status (status),
  INDEX idx_detected_at (detected_at),
  FOREIGN KEY (monitoring_point_id) REFERENCES monitoring_points(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建预警记录表
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  monitoring_point_id INT NOT NULL COMMENT '监测点ID',
  pollution_event_id INT NULL COMMENT '污染事件ID',
  alert_type ENUM('info', 'warning', 'danger') NOT NULL COMMENT '预警类型',
  message TEXT NOT NULL COMMENT '预警消息',
  level ENUM('low', 'medium', 'high') NOT NULL COMMENT '优先级',
  is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  is_handled TINYINT(1) DEFAULT 0 COMMENT '是否已处理',
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '触发时间',
  handled_at TIMESTAMP NULL COMMENT '处理时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_monitoring_point (monitoring_point_id),
  INDEX idx_alert_type (alert_type),
  INDEX idx_is_handled (is_handled),
  INDEX idx_triggered_at (triggered_at),
  FOREIGN KEY (monitoring_point_id) REFERENCES monitoring_points(id) ON DELETE CASCADE,
  FOREIGN KEY (pollution_event_id) REFERENCES pollution_events(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level ENUM('error', 'warn', 'info', 'debug') NOT NULL COMMENT '日志级别',
  module VARCHAR(100) COMMENT '模块',
  message TEXT NOT NULL COMMENT '日志消息',
  context JSON COMMENT '上下文信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_level (level),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试数据
-- 监测点数据
INSERT INTO monitoring_points (name, latitude, longitude, status, location) VALUES
('北京通州监测点', 39.9042, 116.4074, 'normal', '北京市通州区运河沿岸'),
('天津武清监测点', 39.4000, 117.0000, 'warning', '天津市武清区运河段'),
('河北沧州监测点', 38.3000, 116.8300, 'normal', '河北省沧州市运河段'),
('山东德州监测点', 37.4500, 116.2900, 'danger', '山东省德州市运河段'),
('江苏淮安监测点', 33.5000, 119.0200, 'normal', '江苏省淮安市运河段'),
('浙江杭州监测点', 30.2500, 120.1500, 'normal', '浙江省杭州市运河段');

-- 水质数据示例
INSERT INTO water_quality_data (monitoring_point_id, ph, temperature, turbidity, dissolved_oxygen, conductivity, ammonia_nitrogen, total_phosphorus, collected_at) VALUES
(1, 7.2, 18.5, 3.2, 8.1, 450, 0.25, 0.05, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 7.1, 17.8, 5.8, 7.5, 520, 0.45, 0.08, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 7.3, 19.2, 2.9, 8.3, 420, 0.20, 0.04, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 6.8, 20.1, 12.5, 5.2, 680, 1.20, 0.15, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(5, 7.2, 20.8, 3.5, 8.0, 440, 0.28, 0.06, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(6, 7.1, 21.5, 2.8, 8.5, 410, 0.18, 0.03, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- 污染事件示例
INSERT INTO pollution_events (monitoring_point_id, event_type, severity, description, detected_at, status) VALUES
(4, 'floating_trash', 'high', '检测到大量漂浮垃圾，影响河道景观和水质', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'pending'),
(2, 'suspended_matter', 'medium', '浊度超标，可能存在悬浮物污染', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'processing');

-- 预警示例
INSERT INTO alerts (monitoring_point_id, pollution_event_id, alert_type, message, level, is_read, is_handled) VALUES
(4, 1, 'danger', '山东德州监测点检测到漂浮垃圾污染', 'high', 0, 0),
(2, 2, 'warning', '天津武清监测点水质浊度超标', 'medium', 0, 0),
(1, NULL, 'info', '北京通州监测点设备正常运行', 'low', 1, 1),
(5, NULL, 'warning', '江苏淮安监测点溶解氧略低', 'medium', 0, 0);
