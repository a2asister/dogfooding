import Router from 'koa-router';
import XLSX from 'xlsx';
import db from '../db';
import { success, error, PaginationResult } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/employees' });

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, departmentId, position, status } = ctx.query as any;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (keyword) {
    where += ' AND (COALESCE(e.real_name, e.name) LIKE ? OR e.employee_no LIKE ? OR e.work_email LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }
  if (departmentId) {
    where += ' AND e.department_id = ?';
    params.push(departmentId);
  }
  if (position) {
    where += ' AND e.position LIKE ?';
    params.push(`%${position}%`);
  }
  if (status !== undefined) {
    where += ' AND e.status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM employees e ${where}`).get(...params) as { count: number };
  
  const employees = db.prepare(`
    SELECT e.*, COALESCE(e.real_name, e.name) as real_name, d.name as department_name, u.username as username
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN users u ON e.user_id = u.id
    ${where}
    ORDER BY e.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: employees.map(e => ({
      id: e.id,
      userId: e.user_id,
      username: e.username,
      employeeNo: e.employee_no,
      realName: e.real_name,
      gender: e.gender,
      birthDate: e.birth_date,
      entryDate: e.entry_date,
      departmentId: e.department_id,
      departmentName: e.department_name,
      position: e.position,
      positionLevel: e.position_level,
      workPhone: e.work_phone,
      workEmail: e.work_email,
      status: e.status,
      createdAt: e.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/all', async (ctx) => {
  const employees = db.prepare(`
    SELECT e.id, e.real_name, e.employee_no, e.department_id, d.name as department_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.status = 1
    ORDER BY e.real_name
  `).all() as any[];

  ctx.body = success(employees.map(e => ({
    id: e.id,
    realName: e.real_name,
    employeeNo: e.employee_no,
    departmentId: e.department_id,
    departmentName: e.department_name,
  })));
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const emp = db.prepare(`
    SELECT e.*, d.name as department_name, u.username as username
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN users u ON e.user_id = u.id
    WHERE e.id = ?
  `).get(id) as any;

  if (!emp) {
    ctx.body = error('员工不存在');
    return;
  }

  ctx.body = success({
    id: emp.id,
    userId: emp.user_id,
    username: emp.username,
    employeeNo: emp.employee_no,
    realName: emp.real_name,
    gender: emp.gender,
    birthDate: emp.birth_date,
    entryDate: emp.entry_date,
    departmentId: emp.department_id,
    departmentName: emp.department_name,
    position: emp.position,
    positionLevel: emp.position_level,
    workPhone: emp.work_phone,
    workEmail: emp.work_email,
    idCard: emp.id_card,
    address: emp.address,
    emergencyContact: emp.emergency_contact,
    emergencyPhone: emp.emergency_phone,
    status: emp.status,
  });
});

router.post('/', async (ctx) => {
  const {
    userId, employeeNo, realName, gender, birthDate, entryDate,
    departmentId, position, positionLevel, workPhone, workEmail,
    idCard, address, emergencyContact, emergencyPhone
  } = ctx.request.body as any;

  if (employeeNo) {
    const exists = db.prepare('SELECT id FROM employees WHERE employee_no = ?').get(employeeNo);
    if (exists) {
      ctx.body = error('员工编号已存在');
      return;
    }
  }

  if (userId) {
    const userExists = db.prepare('SELECT id FROM employees WHERE user_id = ?').get(userId);
    if (userExists) {
      ctx.body = error('该用户已关联其他员工');
      return;
    }
  }

  const result = db.prepare(`
    INSERT INTO employees (user_id, employee_no, name, real_name, gender, birth_date, entry_date, department_id, position, position_level, work_phone, work_email, id_card, address, emergency_contact, emergency_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, employeeNo, realName, realName, gender, birthDate, entryDate, departmentId, position, positionLevel, workPhone, workEmail, idCard, address, emergencyContact, emergencyPhone);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建员工',
    module: '员工管理',
    details: `创建员工 ${realName}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: result.lastInsertRowid }, '创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const {
    userId, employeeNo, realName, gender, birthDate, entryDate,
    departmentId, position, positionLevel, workPhone, workEmail,
    idCard, address, emergencyContact, emergencyPhone, status
  } = ctx.request.body as any;

  const emp = db.prepare('SELECT id FROM employees WHERE id = ?').get(id);
  if (!emp) {
    ctx.body = error('员工不存在');
    return;
  }

  db.prepare(`
    UPDATE employees SET 
      user_id = ?, employee_no = ?, name = ?, real_name = ?, gender = ?, birth_date = ?, 
      entry_date = ?, department_id = ?, position = ?, position_level = ?, 
      work_phone = ?, work_email = ?, id_card = ?, address = ?, 
      emergency_contact = ?, emergency_phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(userId, employeeNo, realName, realName, gender, birthDate, entryDate, departmentId, position, positionLevel, workPhone, workEmail, idCard, address, emergencyContact, emergencyPhone, status, id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '更新员工',
    module: '员工管理',
    details: `更新员工 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '更新成功');
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  db.prepare('DELETE FROM employees WHERE id = ?').run(id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '删除员工',
    module: '员工管理',
    details: `删除员工 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '删除成功');
});

router.post('/import', async (ctx) => {
  const { file } = ctx.request.body as any;
  
  try {
    const workbook = XLSX.read(file, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName as string];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    const insertStmt = db.prepare(`
      INSERT INTO employees (employee_no, name, real_name, gender, birth_date, entry_date, department_id, position, work_phone, work_email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const tx = db.transaction((items: any[]) => {
      for (const item of items) {
        const realName = item.realName || item['姓名'];
        insertStmt.run(
          item.employeeNo || item['员工编号'],
          realName,
          realName,
          item.gender || item['性别'],
          item.birthDate || item['出生日期'],
          item.entryDate || item['入职日期'],
          item.departmentId || item['部门ID'],
          item.position || item['岗位'],
          item.workPhone || item['工作电话'],
          item.workEmail || item['工作邮箱']
        );
      }
    });

    tx(data);

    logOperation({
      userId: ctx.user?.userId,
      username: ctx.user?.username,
      operation: '批量导入员工',
      module: '员工管理',
      details: `批量导入 ${data.length} 条员工数据`,
      ipAddress: ctx.ip,
    });

    ctx.body = success({ count: data.length }, '导入成功');
  } catch (err) {
    ctx.body = error('导入失败: ' + (err as Error).message);
  }
});

router.get('/export/template', async (ctx) => {
  const data = [{
    '员工编号': 'EMP001',
    '姓名': '张三',
    '性别': '男',
    '出生日期': '1990-01-01',
    '入职日期': '2020-01-01',
    '部门ID': 1,
    '岗位': '开发工程师',
    '工作电话': '13800138000',
    '工作邮箱': 'zhangsan@company.com'
  }];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '员工导入模板');
  const buffer = XLSX.write(workbook, { type: 'base64' });

  ctx.body = success({ template: buffer });
});

router.get('/export', async (ctx) => {
  const employees = db.prepare(`
    SELECT e.*, d.name as department_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY e.created_at DESC
  `).all() as any[];

  const data = employees.map(e => ({
    '员工编号': e.employee_no,
    '姓名': e.real_name,
    '性别': e.gender,
    '出生日期': e.birth_date,
    '入职日期': e.entry_date,
    '部门': e.department_name,
    '岗位': e.position,
    '职级': e.position_level,
    '工作电话': e.work_phone,
    '工作邮箱': e.work_email,
    '状态': e.status === 1 ? '在职' : '离职'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '员工数据');
  const buffer = XLSX.write(workbook, { type: 'base64' });

  ctx.body = success({ file: buffer });
});

export default router;
