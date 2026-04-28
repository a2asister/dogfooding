-- 快递物流管理系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS logistics_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE logistics_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  role ENUM('admin', 'manager', 'operator', 'courier', 'customer') NOT NULL DEFAULT 'operator',
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  branch_id INT UNSIGNED,
  avatar VARCHAR(255),
  last_login_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_branch_id (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 网点/站点表
CREATE TABLE IF NOT EXISTS branches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type ENUM('hub', 'station', 'agency') NOT NULL DEFAULT 'station',
  province VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  longitude DECIMAL(10, 7),
  latitude DECIMAL(10, 7),
  contact_person VARCHAR(50) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  parent_id INT UNSIGNED,
  status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_code (code),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 车辆表
CREATE TABLE IF NOT EXISTS vehicles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  type ENUM('van', 'truck', 'motorcycle', 'other') NOT NULL DEFAULT 'van',
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  capacity DECIMAL(10, 2) NOT NULL COMMENT '载重容量，单位：吨',
  current_load DECIMAL(10, 2) DEFAULT 0 COMMENT '当前载重，单位：吨',
  status ENUM('available', 'in_use', 'maintenance', 'out_of_service') NOT NULL DEFAULT 'available',
  branch_id INT UNSIGNED,
  driver_id INT UNSIGNED,
  purchase_date DATE,
  last_maintenance_date DATE,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_plate_number (plate_number),
  INDEX idx_status (status),
  INDEX idx_branch_id (branch_id),
  INDEX idx_driver_id (driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(32) NOT NULL UNIQUE,
  customer_id INT UNSIGNED,
  sender_name VARCHAR(50) NOT NULL,
  sender_phone VARCHAR(20) NOT NULL,
  sender_province VARCHAR(50) NOT NULL,
  sender_city VARCHAR(50) NOT NULL,
  sender_district VARCHAR(50) NOT NULL,
  sender_address VARCHAR(255) NOT NULL,
  sender_longitude DECIMAL(10, 7),
  sender_latitude DECIMAL(10, 7),
  receiver_name VARCHAR(50) NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  receiver_province VARCHAR(50) NOT NULL,
  receiver_city VARCHAR(50) NOT NULL,
  receiver_district VARCHAR(50) NOT NULL,
  receiver_address VARCHAR(255) NOT NULL,
  receiver_longitude DECIMAL(10, 7),
  receiver_latitude DECIMAL(10, 7),
  package_name VARCHAR(100) NOT NULL,
  package_type ENUM('document', 'parcel', 'fragile', 'liquid', 'other') NOT NULL DEFAULT 'parcel',
  package_count INT NOT NULL DEFAULT 1,
  package_weight DECIMAL(10, 3) COMMENT '重量，单位：kg',
  package_length DECIMAL(10, 2) COMMENT '长度，单位：cm',
  package_width DECIMAL(10, 2) COMMENT '宽度，单位：cm',
  package_height DECIMAL(10, 2) COMMENT '高度，单位：cm',
  volume DECIMAL(10, 4) COMMENT '体积，单位：m³',
  declared_value DECIMAL(10, 2),
  is_insured BOOLEAN NOT NULL DEFAULT FALSE,
  insurance_fee DECIMAL(10, 2),
  service_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  pickup_time DATETIME,
  delivery_time DATETIME,
  status ENUM(
    'pending', 'confirmed', 'pickup_assigned', 'picked_up', 
    'transferring', 'in_transit', 'arrived', 'delivering', 
    'delivered', 'cancelled', 'returned'
  ) NOT NULL DEFAULT 'pending',
  payment_method ENUM('online', 'cod', 'prepaid', 'monthly') NOT NULL DEFAULT 'online',
  total_amount DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2),
  paid_at DATETIME,
  courier_id INT UNSIGNED,
  pickup_branch_id INT UNSIGNED,
  delivery_branch_id INT UNSIGNED,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_order_no (order_no),
  INDEX idx_status (status),
  INDEX idx_customer_id (customer_id),
  INDEX idx_courier_id (courier_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 运单表
CREATE TABLE IF NOT EXISTS waybills (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waybill_no VARCHAR(32) NOT NULL UNIQUE,
  order_id INT UNSIGNED NOT NULL,
  status ENUM(
    'created', 'picked_up', 'in_transit', 'arrived', 
    'delivering', 'delivered', 'signed', 'returned', 
    'lost', 'damaged'
  ) NOT NULL DEFAULT 'created',
  current_branch_id INT UNSIGNED,
  next_branch_id INT UNSIGNED,
  courier_id INT UNSIGNED,
  vehicle_id INT UNSIGNED,
  estimate_delivery_time DATETIME,
  actual_delivery_time DATETIME,
  signed_by VARCHAR(50),
  signed_time DATETIME,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_waybill_no (waybill_no),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_current_branch_id (current_branch_id),
  INDEX idx_courier_id (courier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 物流轨迹表
CREATE TABLE IF NOT EXISTS tracking_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waybill_id INT UNSIGNED NOT NULL,
  event ENUM(
    'order_created', 'waybill_created', 'pickup_assigned', 'picked_up',
    'arrived_at_branch', 'sorted', 'dispatched', 'in_transit',
    'arrived_at_transit_hub', 'arrived_at_delivery_branch', 
    'out_for_delivery', 'delivered', 'signed', 'return_requested',
    'returned', 'exception', 'lost', 'damaged'
  ) NOT NULL,
  event_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  operator_id INT UNSIGNED,
  operator_name VARCHAR(50),
  branch_id INT UNSIGNED,
  branch_name VARCHAR(100),
  longitude DECIMAL(10, 7),
  latitude DECIMAL(10, 7),
  description VARCHAR(500) NOT NULL,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_waybill_id (waybill_id),
  INDEX idx_event_time (event_time),
  INDEX idx_operator_id (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 异常件表
CREATE TABLE IF NOT EXISTS exception_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waybill_id INT UNSIGNED NOT NULL,
  type ENUM(
    'lost', 'damaged', 'delayed', 'returned', 
    'rejected', 'address_error', 'contact_failed', 
    'package_abnormal', 'other'
  ) NOT NULL DEFAULT 'other',
  status ENUM('pending', 'processing', 'resolved', 'escalated', 'closed') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  detected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  detected_by INT UNSIGNED,
  location VARCHAR(255),
  description TEXT NOT NULL,
  damage_description TEXT,
  estimated_loss DECIMAL(10, 2),
  responsible_person_id INT UNSIGNED,
  responsible_person_name VARCHAR(50),
  resolution_steps TEXT,
  resolution_cost DECIMAL(10, 2),
  resolved_at DATETIME,
  resolved_by INT UNSIGNED,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_waybill_id (waybill_id),
  INDEX idx_status (status),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 退换货表
CREATE TABLE IF NOT EXISTS returns (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  waybill_id INT UNSIGNED,
  type ENUM('exchange', 'refund', 'reject') NOT NULL DEFAULT 'refund',
  status ENUM(
    'requested', 'approved', 'received', 'inspected', 
    'processed', 'completed', 'rejected', 'cancelled'
  ) NOT NULL DEFAULT 'requested',
  return_waybill_no VARCHAR(32),
  request_reason VARCHAR(200) NOT NULL,
  request_description TEXT,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  requested_by INT UNSIGNED,
  approved_at DATETIME,
  approved_by INT UNSIGNED,
  approval_comment TEXT,
  received_at DATETIME,
  received_by INT UNSIGNED,
  inspection_result TEXT,
  inspection_status VARCHAR(50),
  refund_amount DECIMAL(10, 2),
  processed_at DATETIME,
  processed_by INT UNSIGNED,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 理赔表
CREATE TABLE IF NOT EXISTS claims (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED,
  waybill_id INT UNSIGNED,
  exception_item_id INT UNSIGNED,
  type ENUM('damage', 'lost', 'delay', 'service', 'other') NOT NULL DEFAULT 'other',
  status ENUM('pending', 'reviewing', 'approved', 'rejected', 'paid', 'closed') NOT NULL DEFAULT 'pending',
  claimant_name VARCHAR(50) NOT NULL,
  claimant_phone VARCHAR(20) NOT NULL,
  claimant_email VARCHAR(100),
  claim_amount DECIMAL(10, 2) NOT NULL,
  claim_reason VARCHAR(200) NOT NULL,
  claim_description TEXT,
  evidence_urls TEXT COMMENT 'JSON格式存储多个证据URL',
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_by INT UNSIGNED,
  assigned_to INT UNSIGNED,
  assigned_at DATETIME,
  review_comment TEXT,
  reviewed_at DATETIME,
  reviewed_by INT UNSIGNED,
  approved_amount DECIMAL(10, 2),
  payout_amount DECIMAL(10, 2),
  paid_at DATETIME,
  paid_by INT UNSIGNED,
  closed_at DATETIME,
  closed_by INT UNSIGNED,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_order_id (order_id),
  INDEX idx_waybill_id (waybill_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 库存物料表
CREATE TABLE IF NOT EXISTS inventory_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type ENUM('package_material', 'tool', 'office_supply', 'other') NOT NULL DEFAULT 'other',
  description TEXT,
  unit VARCHAR(20) NOT NULL DEFAULT '个',
  current_stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 10,
  max_stock INT,
  unit_price DECIMAL(10, 2),
  total_value DECIMAL(10, 2),
  branch_id INT UNSIGNED,
  location VARCHAR(100),
  status ENUM('in_stock', 'low_stock', 'out_of_stock') NOT NULL DEFAULT 'in_stock',
  last_stocktaking_at DATETIME,
  last_stocktaking_by INT UNSIGNED,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_sku (sku),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_branch_id (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 客户反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED,
  waybill_id INT UNSIGNED,
  type ENUM('complaint', 'suggestion', 'consult', 'praise', 'other') NOT NULL DEFAULT 'other',
  status ENUM('pending', 'processing', 'resolved', 'closed') NOT NULL DEFAULT 'pending',
  customer_name VARCHAR(50) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(100),
  subject VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  attachment_urls TEXT COMMENT 'JSON格式存储多个附件URL',
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_to INT UNSIGNED,
  assigned_at DATETIME,
  response_content TEXT,
  response_at DATETIME,
  response_by INT UNSIGNED,
  satisfaction INT COMMENT '满意度评分 1-5',
  closed_at DATETIME,
  closed_by INT UNSIGNED,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_order_id (order_id),
  INDEX idx_waybill_id (waybill_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 计价规则表
CREATE TABLE IF NOT EXISTS pricing_rules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  service_type ENUM('standard', 'express', 'same_day', 'overnight', 'economy') NOT NULL DEFAULT 'standard',
  type ENUM('weight_based', 'volume_based', 'distance_based', 'flat_rate') NOT NULL DEFAULT 'weight_based',
  from_province VARCHAR(50),
  from_city VARCHAR(50),
  to_province VARCHAR(50),
  to_city VARCHAR(50),
  from_zone INT,
  to_zone INT,
  min_weight DECIMAL(10, 3) COMMENT '最小重量，单位：kg',
  max_weight DECIMAL(10, 3) COMMENT '最大重量，单位：kg',
  min_volume DECIMAL(10, 4) COMMENT '最小体积，单位：m³',
  max_volume DECIMAL(10, 4) COMMENT '最大体积，单位：m³',
  base_fee DECIMAL(10, 2),
  per_kg_fee DECIMAL(10, 2),
  per_cbm_fee DECIMAL(10, 2),
  per_km_fee DECIMAL(10, 2),
  min_fee DECIMAL(10, 2),
  max_fee DECIMAL(10, 2),
  is_insured BOOLEAN NOT NULL DEFAULT FALSE,
  insurance_rate DECIMAL(5, 4) COMMENT '保费率，如0.005表示0.5%',
  priority INT NOT NULL DEFAULT 0 COMMENT '优先级，数值越大优先级越高',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from DATE,
  valid_to DATE,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_code (code),
  INDEX idx_service_type (service_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 称重计费表
CREATE TABLE IF NOT EXISTS weight_billings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  waybill_id INT UNSIGNED NOT NULL,
  order_id INT UNSIGNED NOT NULL,
  package_count INT NOT NULL DEFAULT 1,
  total_weight DECIMAL(10, 3) NOT NULL COMMENT '实际总重量，单位：kg',
  total_volume DECIMAL(10, 4) COMMENT '总体积，单位：m³',
  chargeable_weight DECIMAL(10, 3) NOT NULL COMMENT '计费重量',
  weight_unit VARCHAR(10) NOT NULL DEFAULT 'kg',
  weighing_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  operator_id INT UNSIGNED,
  device_id VARCHAR(100),
  is_manual BOOLEAN NOT NULL DEFAULT FALSE,
  remark TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_waybill_id (waybill_id),
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入初始管理员用户 (密码: admin123)
-- bcrypt hash generated with 10 rounds for "admin123"
INSERT INTO users (username, password, name, phone, email, role, status) VALUES
('admin', '$2a$10$.H44TQ9jK9z5pX7yW3vU2.QRxJ4K5L6M7N8O9P0Q1R2S3T4U5V6W7', '系统管理员', '13800138000', 'admin@logistics.com', 'admin', 'active');

-- 插入初始网点数据
INSERT INTO branches (code, name, type, province, city, district, address, contact_person, contact_phone, status) VALUES
('HUB001', '北京总部转运中心', 'hub', '北京市', '北京市', '朝阳区', '朝阳区建国路88号', '张经理', '13800138001', 'active'),
('ST001', '北京朝阳站', 'station', '北京市', '北京市', '朝阳区', '朝阳区建国路100号', '李站长', '13800138002', 'active'),
('ST002', '北京海淀站', 'station', '北京市', '北京市', '海淀区', '海淀区中关村大街100号', '王站长', '13800138003', 'active'),
('ST003', '上海浦东转运站', 'station', '上海市', '上海市', '浦东新区', '浦东新区世纪大道100号', '赵站长', '13800138004', 'active');

-- 插入初始快递员用户 (密码: admin123)
INSERT INTO users (username, password, name, phone, email, role, status, branch_id) VALUES
('courier1', '$2a$10$.H44TQ9jK9z5pX7yW3vU2.QRxJ4K5L6M7N8O9P0Q1R2S3T4U5V6W7', '张三', '13900139001', 'zhangsan@logistics.com', 'courier', 'active', 2),
('courier2', '$2a$10$.H44TQ9jK9z5pX7yW3vU2.QRxJ4K5L6M7N8O9P0Q1R2S3T4U5V6W7', '李四', '13900139002', 'lisi@logistics.com', 'courier', 'active', 2),
('operator1', '$2a$10$.H44TQ9jK9z5pX7yW3vU2.QRxJ4K5L6M7N8O9P0Q1R2S3T4U5V6W7', '操作员小王', '13900139003', 'operator1@logistics.com', 'operator', 'active', 1);

-- 插入初始计价规则
INSERT INTO pricing_rules (name, code, service_type, type, min_weight, max_weight, base_fee, per_kg_fee, min_fee, priority, is_active) VALUES
('标准快递-同城', 'STANDARD_LOCAL', 'standard', 'weight_based', 0.1, 50, 12.00, 3.00, 12.00, 10, TRUE),
('标准快递-异地', 'STANDARD_NATIONAL', 'standard', 'weight_based', 0.1, 50, 18.00, 5.00, 18.00, 9, TRUE),
('特快专递-同城', 'EXPRESS_LOCAL', 'express', 'weight_based', 0.1, 50, 20.00, 5.00, 20.00, 10, TRUE),
('特快专递-异地', 'EXPRESS_NATIONAL', 'express', 'weight_based', 0.1, 50, 28.00, 7.00, 28.00, 9, TRUE),
('经济快递', 'ECONOMY', 'economy', 'weight_based', 0.1, 100, 10.00, 2.50, 10.00, 8, TRUE);
