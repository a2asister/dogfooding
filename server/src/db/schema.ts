import db from './index';

export function initDatabase() {
  const rolesTableInfo = db.prepare("PRAGMA table_info(roles)").all() as any[];
  const hasSortOrder = rolesTableInfo.some((col: any) => col.name === 'sort_order');
  if (!hasSortOrder) {
    db.exec('ALTER TABLE roles ADD COLUMN sort_order INTEGER DEFAULT 0');
  }

  const deptTableInfo = db.prepare("PRAGMA table_info(departments)").all() as any[];
  const hasDeptCode = deptTableInfo.some((col: any) => col.name === 'code');
  if (!hasDeptCode) {
    db.exec('ALTER TABLE departments ADD COLUMN code TEXT');
  }
  const hasDeptSortOrder = deptTableInfo.some((col: any) => col.name === 'sort_order');
  if (!hasDeptSortOrder) {
    db.exec('ALTER TABLE departments ADD COLUMN sort_order INTEGER DEFAULT 0');
  }
  const hasDeptDescription = deptTableInfo.some((col: any) => col.name === 'description');
  if (!hasDeptDescription) {
    db.exec('ALTER TABLE departments ADD COLUMN description TEXT');
  }

  const empTableInfo = db.prepare("PRAGMA table_info(employees)").all() as any[];
  const hasEmpUserId = empTableInfo.some((col: any) => col.name === 'user_id');
  if (!hasEmpUserId) {
    db.exec('ALTER TABLE employees ADD COLUMN user_id INTEGER');
  }
  const hasEmpRealName = empTableInfo.some((col: any) => col.name === 'real_name');
  if (!hasEmpRealName) {
    db.exec('ALTER TABLE employees ADD COLUMN real_name TEXT');
  }
  const hasEmpBirthDate = empTableInfo.some((col: any) => col.name === 'birth_date');
  if (!hasEmpBirthDate) {
    db.exec('ALTER TABLE employees ADD COLUMN birth_date DATE');
  }
  const hasEmpPosition = empTableInfo.some((col: any) => col.name === 'position');
  if (!hasEmpPosition) {
    db.exec('ALTER TABLE employees ADD COLUMN position TEXT');
  }
  const hasEmpPositionLevel = empTableInfo.some((col: any) => col.name === 'position_level');
  if (!hasEmpPositionLevel) {
    db.exec('ALTER TABLE employees ADD COLUMN position_level TEXT');
  }
  const hasEmpWorkPhone = empTableInfo.some((col: any) => col.name === 'work_phone');
  if (!hasEmpWorkPhone) {
    db.exec('ALTER TABLE employees ADD COLUMN work_phone TEXT');
  }
  const hasEmpWorkEmail = empTableInfo.some((col: any) => col.name === 'work_email');
  if (!hasEmpWorkEmail) {
    db.exec('ALTER TABLE employees ADD COLUMN work_email TEXT');
  }
  const hasEmpIdCard = empTableInfo.some((col: any) => col.name === 'id_card');
  if (!hasEmpIdCard) {
    db.exec('ALTER TABLE employees ADD COLUMN id_card TEXT');
  }
  const hasEmpAddress = empTableInfo.some((col: any) => col.name === 'address');
  if (!hasEmpAddress) {
    db.exec('ALTER TABLE employees ADD COLUMN address TEXT');
  }
  const hasEmpEmergencyContact = empTableInfo.some((col: any) => col.name === 'emergency_contact');
  if (!hasEmpEmergencyContact) {
    db.exec('ALTER TABLE employees ADD COLUMN emergency_contact TEXT');
  }
  const hasEmpEmergencyPhone = empTableInfo.some((col: any) => col.name === 'emergency_phone');
  if (!hasEmpEmergencyPhone) {
    db.exec('ALTER TABLE employees ADD COLUMN emergency_phone TEXT');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      real_name TEXT,
      email TEXT,
      phone TEXT,
      avatar TEXT,
      role_id INTEGER,
      department_id INTEGER,
      position TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT,
      is_system INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      parent_id INTEGER DEFAULT 0,
      leader_id INTEGER,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      employee_no TEXT UNIQUE,
      real_name TEXT NOT NULL,
      gender TEXT,
      birth_date DATE,
      entry_date DATE,
      department_id INTEGER,
      position TEXT,
      position_level TEXT,
      work_phone TEXT,
      work_email TEXT,
      id_card TEXT,
      address TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS indicator_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      parent_id INTEGER DEFAULT 0,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT,
      category_id INTEGER,
      type TEXT NOT NULL,
      description TEXT,
      measurement_unit TEXT,
      calculation_formula TEXT,
      scoring_criteria TEXT,
      target_value REAL,
      weight REAL,
      is_standard INTEGER DEFAULT 0,
      applicable_positions TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessment_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      template_type TEXT,
      cycle_type TEXT,
      cycle_year INTEGER,
      cycle_month INTEGER,
      start_date DATE,
      end_date DATE,
      self_assessment_start DATE,
      self_assessment_end DATE,
      superior_assessment_start DATE,
      superior_assessment_end DATE,
      review_start DATE,
      review_end DATE,
      result_publication_date DATE,
      status TEXT DEFAULT 'draft',
      creator_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessment_plan_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      assessor_id INTEGER,
      reviewer_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(plan_id, employee_id)
    );

    CREATE TABLE IF NOT EXISTS assessment_schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      applicable_positions TEXT,
      weight_config TEXT,
      scoring_rules TEXT,
      bonus_rules TEXT,
      penalty_rules TEXT,
      status TEXT DEFAULT 'draft',
      creator_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scheme_indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scheme_id INTEGER NOT NULL,
      indicator_id INTEGER NOT NULL,
      weight REAL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS personal_kpis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      scheme_id INTEGER,
      indicators_config TEXT,
      status TEXT DEFAULT 'draft',
      period_locked INTEGER DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessment_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kpi_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      self_score REAL,
      self_assessment TEXT,
      evidence_url TEXT,
      superior_score REAL,
      superior_comments TEXT,
      reviewer_score REAL,
      reviewer_comments TEXT,
      final_score REAL,
      grade TEXT,
      total_bonus REAL,
      total_penalty REAL,
      status TEXT DEFAULT 'pending',
      is_appealed INTEGER DEFAULT 0,
      appeal_reason TEXT,
      appeal_result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS performance_grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade TEXT NOT NULL,
      name TEXT NOT NULL,
      min_score REAL NOT NULL,
      max_score REAL NOT NULL,
      description TEXT,
      color TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      operation TEXT NOT NULL,
      module TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      type TEXT,
      related_id INTEGER,
      related_type TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE NOT NULL,
      config_value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessment_workflow (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kpi_id INTEGER NOT NULL,
      operator_id INTEGER,
      action TEXT NOT NULL,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const countRoles = db.prepare('SELECT COUNT(*) as count FROM roles').get() as { count: number };
  if (countRoles.count === 0) {
    const insertRole = db.prepare(`
      INSERT INTO roles (name, code, description, permissions, is_system, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertRole.run('超级管理员', 'super_admin', '拥有所有系统权限', JSON.stringify(['*']), 1, 1);
    insertRole.run('部门经理', 'dept_manager', '部门管理权限', JSON.stringify(['department:*', 'employee:*', 'kpi:*']), 1, 1);
    insertRole.run('普通员工', 'employee', '员工基础权限', JSON.stringify(['kpi:view', 'kpi:submit']), 1, 1);
    insertRole.run('HR专员', 'hr', '人力资源管理权限', JSON.stringify(['employee:*', 'department:*']), 1, 1);
  }

  const countGrades = db.prepare('SELECT COUNT(*) as count FROM performance_grades').get() as { count: number };
  if (countGrades.count === 0) {
    const insertGrade = db.prepare(`
      INSERT INTO performance_grades (grade, name, min_score, max_score, description, color, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertGrade.run('S', '卓越', 95, 100, '远超预期', '#ff4d4f', 1);
    insertGrade.run('A', '优秀', 85, 94.99, '超出预期', '#fa8c16', 2);
    insertGrade.run('B', '良好', 75, 84.99, '符合预期', '#52c41a', 3);
    insertGrade.run('C', '合格', 60, 74.99, '基本符合预期', '#1890ff', 4);
    insertGrade.run('D', '待改进', 0, 59.99, '低于预期', '#8c8c8c', 5);
  }

  const addColumnIfNotExists = (tableName: string, columnName: string, columnDefinition: string): void => {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
    const columnExists = columns.some(col => col.name === columnName);
    if (!columnExists) {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`).run();
      console.log(`已添加列: ${tableName}.${columnName}`);
    }
  };

  addColumnIfNotExists('users', 'real_name', 'TEXT');
  addColumnIfNotExists('users', 'email', 'TEXT');
  addColumnIfNotExists('users', 'phone', 'TEXT');
  addColumnIfNotExists('users', 'avatar', 'TEXT');
  addColumnIfNotExists('users', 'role_id', 'INTEGER');
  addColumnIfNotExists('users', 'department_id', 'INTEGER');
  addColumnIfNotExists('users', 'position', 'TEXT');
  addColumnIfNotExists('users', 'status', 'INTEGER DEFAULT 1');

  addColumnIfNotExists('roles', 'permissions', 'TEXT');
  addColumnIfNotExists('roles', 'status', 'INTEGER DEFAULT 1');
  addColumnIfNotExists('roles', 'updated_at', 'DATETIME');

  addColumnIfNotExists('departments', 'status', 'INTEGER DEFAULT 1');
  addColumnIfNotExists('departments', 'updated_at', 'DATETIME');

  addColumnIfNotExists('employees', 'status', 'INTEGER DEFAULT 1');
  addColumnIfNotExists('employees', 'updated_at', 'DATETIME');

  addColumnIfNotExists('indicators', 'status', 'INTEGER DEFAULT 1');
  addColumnIfNotExists('indicators', 'updated_at', 'DATETIME');

  addColumnIfNotExists('indicator_categories', 'status', 'INTEGER DEFAULT 1');
  addColumnIfNotExists('indicator_categories', 'updated_at', 'DATETIME');

  addColumnIfNotExists('operation_logs', 'username', 'TEXT');
  addColumnIfNotExists('operation_logs', 'operation', 'TEXT');

  const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;
  if (!adminUser) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, password, real_name, email, role_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin', hash, '系统管理员', 'admin@kpi.com', 1, 1);
  } else {
    const updates = [];
    const values = [];
    if (!adminUser.real_name) {
      updates.push('real_name = ?');
      values.push('系统管理员');
    }
    if (!adminUser.email) {
      updates.push('email = ?');
      values.push('admin@kpi.com');
    }
    if (!adminUser.role_id) {
      updates.push('role_id = ?');
      values.push(1);
    }
    if (adminUser.status !== 1) {
      updates.push('status = ?');
      values.push(1);
    }
    if (updates.length > 0) {
      values.push('admin');
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE username = ?`).run(...values);
      console.log('已修复admin用户字段');
    }
  }

  const countConfigs = db.prepare('SELECT COUNT(*) as count FROM system_configs').get() as { count: number };
  if (countConfigs.count === 0) {
    const insertConfig = db.prepare(`
      INSERT INTO system_configs (config_key, config_value, description)
      VALUES (?, ?, ?)
    `);
    insertConfig.run('assessment.cycle.default', 'QUARTERLY', '默认考核周期');
    insertConfig.run('assessment.workflow.levels', '2', '审批层级');
    insertConfig.run('notification.email.enabled', 'false', '邮件通知开关');
    insertConfig.run('data.backup.auto', 'true', '自动备份开关');
    insertConfig.run('data.backup.interval', '7', '自动备份间隔(天)');
  }
}
