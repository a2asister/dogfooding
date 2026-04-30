CREATE DATABASE IF NOT EXISTS hotel_ordering DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hotel_ordering;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  room_number VARCHAR(20),
  role ENUM('guest', 'staff', 'admin') NOT NULL DEFAULT 'guest',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  sort INT NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_sort (sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(1000),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10, 2),
  image VARCHAR(500),
  category_id INT,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'special', 'combo') NOT NULL DEFAULT 'special',
  stock INT NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT '份',
  is_recommend TINYINT(1) NOT NULL DEFAULT 0,
  sort INT NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_category_id (category_id),
  INDEX idx_meal_type (meal_type),
  INDEX idx_status (status),
  INDEX idx_recommend (is_recommend),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  status ENUM('pending', 'paid', 'preparing', 'delivering', 'completed', 'cancelled', 'after_sale') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_type ENUM('room', 'pickup') NOT NULL DEFAULT 'room',
  room_number VARCHAR(20),
  scheduled_time VARCHAR(20),
  remark VARCHAR(500),
  paid_at TIMESTAMP NULL,
  prepared_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS operation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INT NOT NULL,
  details VARCHAR(1000),
  ip VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (name, description, sort) VALUES
('中式料理', '传统中式美食', 1),
('日式料理', '精选日式料理', 2),
('西式料理', '精致西式餐点', 3),
('特色菜品', '酒店特色推荐', 4);

INSERT INTO users (username, password, name, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', 'admin', 'active'),
('staff', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '工作人员', 'staff', 'active'),
('guest', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张三', 'guest', 'active');

INSERT INTO products (name, description, price, original_price, image, category_id, meal_type, stock, unit, is_recommend, sort) VALUES
('招牌红烧肉套餐', '精选五花肉，慢炖两小时，入口即化', 68, 88, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20braised%20pork%20belly%20set%20meal%20with%20rice%20and%20vegetables%20in%20hotel%20restaurant&image_size=square', 1, 'combo', 50, '份', 1, 1),
('广式早茶套餐', '包含虾饺、烧卖、凤爪、肠粉等经典点心', 88, NULL, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20dim%20sum%20breakfast%20set%20with%20various%20steamed%20buns%20and%20tea&image_size=square', 1, 'breakfast', 30, '份', 1, 2),
('日式鳗鱼饭', '进口鳗鱼，现烤现卖，搭配秘制酱汁', 98, NULL, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20unagi%20don%20grilled%20eel%20rice%20bowl%20with%20sauce&image_size=square', 2, 'lunch', 20, '份', 1, 3),
('黑椒牛排套餐', '澳洲进口牛排，搭配黑椒酱汁', 168, 198, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20pepper%20steak%20set%20meal%20with%20vegetables%20and%20potatoes&image_size=square', 3, 'dinner', 15, '份', 0, 4),
('佛跳墙', '山珍海味，慢炖8小时', 298, NULL, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20Buddha%20Jumps%20Over%20the%20Wall%20soup%20deluxe%20seafood%20dish&image_size=square', 4, 'special', 5, '份', 1, 5),
('海鲜炒饭', '新鲜虾仁、鱿鱼、蟹肉棒炒饭', 48, NULL, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seafood%20fried%20rice%20with%20shrimp%20squid%20and%20crab%20meat&image_size=square', 1, 'lunch', 40, '份', 0, 6),
('意大利面', '经典番茄肉酱意面', 58, NULL, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Italian%20spaghetti%20with%20tomato%20meat%20sauce&image_size=square', 3, 'dinner', 35, '份', 0, 7),
('三文鱼刺身', '新鲜三文鱼，口感鲜美', 128, NULL, 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20salmon%20sashimi%20platter%20with%20wasabi%20and%20soy%20sauce&image_size=square', 2, 'dinner', 10, '份', 0, 8);
