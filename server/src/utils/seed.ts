import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { initDB, getDB } from '../models/database';

const departments = ['计算机学院', '电子信息学院', '机械工程学院', '经济管理学院', '外国语学院', '数学与统计学院'];
const majors = ['计算机科学与技术', '软件工程', '人工智能', '电子信息工程', '通信工程', '机械设计制造', '自动化', '会计学', '金融学', '英语'];
const courseNames = [
  '高等数学', '大学英语', '线性代数', '概率论与数理统计', '计算机组成原理',
  '数据结构与算法', '操作系统', '计算机网络', '数据库系统原理', '软件工程',
  '人工智能导论', '机器学习', '深度学习', '大数据技术', '云计算原理',
  'Java程序设计', 'Python程序设计', 'Web前端开发', '移动应用开发', '软件测试',
  '微观经济学', '宏观经济学', '管理学原理', '市场营销', '会计学基础',
  '大学物理', '电路分析', '模拟电子技术', '数字电子技术', '信号与系统'
];
const teachers = ['张教授', '李教授', '王教授', '刘教授', '陈教授', '杨教授', '赵教授', '黄教授', '周教授', '吴教授'];
const buildings = ['教学楼A', '教学楼B', '教学楼C', '实验楼A', '实验楼B', '图书馆', '计算机中心'];
const newsCategories = ['校园新闻', '学术动态', '通知公告', '招生信息', '就业信息'];
const newsTitles = [
  '我校2024年招生工作圆满结束', '我校举办第十届科技创新大赛', '教育部专家莅临我校考察指导',
  '我校学子在全国竞赛中荣获一等奖', '新图书馆正式投入使用', '校园文化艺术节盛大开幕',
  '我校与知名企业签署合作协议', '学术交流会议顺利召开', '优秀毕业生经验分享会成功举办',
  '新学期开学典礼隆重举行'
];

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平', '刚'];

function randomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return firstName + lastName;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  return '13' + randomInt(100000000, 999999999).toString();
}

function randomEmail(studentId: string): string {
  return `${studentId}@university.edu.cn`;
}

export async function seedDatabase(): Promise<void> {
  const db = initDB();
  const hashedPassword = await bcrypt.hash('123456', 10);

  console.log('开始生成模拟数据...');

  db.exec('DELETE FROM login_records');
  db.exec('DELETE FROM evaluations');
  db.exec('DELETE FROM messages');
  db.exec('DELETE FROM news');
  db.exec('DELETE FROM selections');
  db.exec('DELETE FROM grades');
  db.exec('DELETE FROM schedules');
  db.exec('DELETE FROM courses');
  db.exec('DELETE FROM users');

  const insertUser = db.prepare(`
    INSERT INTO users (student_id, name, password, role, department, major, class, phone, email, gender, birth_date, enrollment_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const users: { id: number; studentId: string; name: string }[] = [];

  const mainStudent = {
    studentId: '2024001001',
    name: '张三',
    gender: '男',
    department: '计算机学院',
    major: '软件工程',
    class: '软工2024-1班',
    birthDate: '2002-05-15',
    enrollmentDate: '2024-09-01',
    phone: '13800138000',
    email: '2024001001@university.edu.cn',
  };

  const mainResult = insertUser.run(
    mainStudent.studentId,
    mainStudent.name,
    hashedPassword,
    'student',
    mainStudent.department,
    mainStudent.major,
    mainStudent.class,
    mainStudent.phone,
    mainStudent.email,
    mainStudent.gender,
    mainStudent.birthDate,
    mainStudent.enrollmentDate
  );
  users.push({ id: mainResult.lastInsertRowid as number, studentId: mainStudent.studentId, name: mainStudent.name });

  for (let i = 1; i <= 50; i++) {
    const studentId = `2024001${(1001 + i).toString().padStart(4, '0')}`;
    const name = randomName();
    const department = randomItem(departments);
    const major = randomItem(majors);
    const classNo = randomInt(1, 4);
    const result = insertUser.run(
      studentId,
      name,
      hashedPassword,
      'student',
      department,
      major,
      `${major.slice(0, 4)}2024-${classNo}班`,
      randomPhone(),
      randomEmail(studentId),
      randomItem(['男', '女']),
      `2002-${randomInt(1, 12)}-${randomInt(1, 28)}`,
      '2024-09-01'
    );
    users.push({ id: result.lastInsertRowid as number, studentId, name });
  }

  console.log(`已生成 ${users.length} 个用户`);

  const insertCourse = db.prepare(`
    INSERT INTO courses (name, teacher, credit, capacity, enrolled, description, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const courses: { id: number; name: string; teacher: string; credit: number }[] = [];

  courseNames.forEach((courseName, index) => {
    const credit = randomInt(2, 5);
    const capacity = randomInt(50, 120);
    const enrolled = randomInt(30, capacity);
    const result = insertCourse.run(
      courseName,
      randomItem(teachers),
      credit,
      capacity,
      enrolled,
      `${courseName}是本专业的核心课程，主要介绍${courseName}的基本概念、原理和应用。`,
      '2024-2025学年第一学期'
    );
    courses.push({ id: result.lastInsertRowid as number, name: courseName, teacher: '', credit });
  });

  console.log(`已生成 ${courses.length} 门课程`);

  const mainUserId = users[0].id;
  const insertSchedule = db.prepare(`
    INSERT INTO schedules (user_id, course_id, week_day, start_period, end_period, location)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertGrade = db.prepare(`
    INSERT INTO grades (user_id, course_id, course_name, score, grade_point, semester)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertSelection = db.prepare(`
    INSERT INTO selections (user_id, course_id, status)
    VALUES (?, ?, 1)
  `);

  const insertEvaluation = db.prepare(`
    INSERT INTO evaluations (user_id, course_id, course_name, teacher_name, submitted)
    VALUES (?, ?, ?, ?, 0)
  `);

  const selectedCourses = courses.slice(0, 12);
  const weekSchedule = [
    { weekDay: 1, periods: [[1, 2], [3, 4], [5, 6]] },
    { weekDay: 2, periods: [[1, 2], [5, 6], [7, 8]] },
    { weekDay: 3, periods: [[1, 2], [3, 4], [7, 8]] },
    { weekDay: 4, periods: [[3, 4], [5, 6], [7, 8]] },
    { weekDay: 5, periods: [[1, 2], [3, 4], [5, 6]] },
  ];

  let courseIdx = 0;
  weekSchedule.forEach((day) => {
    day.periods.forEach((period) => {
      if (courseIdx < selectedCourses.length) {
        const course = selectedCourses[courseIdx];
        insertSchedule.run(
          mainUserId,
          course.id,
          day.weekDay,
          period[0],
          period[1],
          `${randomItem(buildings)}${randomInt(101, 509)}`
        );
        insertSelection.run(mainUserId, course.id);
        courseIdx++;
      }
    });
  });

  console.log(`已生成 ${courseIdx} 条课表记录`);

  const pastCourses = courses.slice(12, 20);
  pastCourses.forEach((course) => {
    const score = randomInt(60, 100);
    let gradePoint = 0;
    if (score >= 90) gradePoint = 4.0;
    else if (score >= 85) gradePoint = 3.7;
    else if (score >= 82) gradePoint = 3.3;
    else if (score >= 78) gradePoint = 3.0;
    else if (score >= 75) gradePoint = 2.7;
    else if (score >= 72) gradePoint = 2.3;
    else if (score >= 68) gradePoint = 2.0;
    else if (score >= 64) gradePoint = 1.5;
    else if (score >= 60) gradePoint = 1.0;

    insertGrade.run(mainUserId, course.id, course.name, score, gradePoint, '2023-2024学年第二学期');
  });

  console.log(`已生成 ${pastCourses.length} 条成绩记录`);

  selectedCourses.slice(0, 8).forEach((course) => {
    insertEvaluation.run(mainUserId, course.id, course.name, randomItem(teachers));
  });

  console.log(`已生成 8 条待评教记录`);

  const insertNews = db.prepare(`
    INSERT INTO news (title, content, category, author, views, publish_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 30; i++) {
    const category = randomItem(newsCategories);
    const title = randomItem(newsTitles) + (i > 10 ? `（第${i}期）` : '');
    const content = `
      <p>近日，${title}。</p>
      <p>本次活动吸引了全校师生的广泛参与，取得了圆满成功。活动期间，同学们积极参与，展现了良好的精神风貌。</p>
      <p>学校领导表示，将继续举办更多类似的活动，丰富同学们的课余生活，促进学生全面发展。</p>
      <p>据悉，本次活动共有超过1000名师生参与，收到了良好的效果。</p>
    `;
    insertNews.run(
      title,
      content,
      category,
      randomItem(['宣传部', '教务处', '学生处', '团委', '新闻中心']),
      randomInt(100, 5000),
      `2024-${randomInt(9, 12)}-${randomInt(1, 30).toString().padStart(2, '0')} ${randomInt(8, 18).toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}:00`
    );
  }

  console.log('已生成 30 条新闻');

  const insertMessage = db.prepare(`
    INSERT INTO messages (user_id, title, content, type, is_read)
    VALUES (?, ?, ?, ?, ?)
  `);

  const messageTitles = [
    { title: '关于2024-2025学年第一学期选课的通知', type: 'system' },
    { title: '图书馆延长开放时间的通知', type: 'system' },
    { title: '校园一卡通系统升级维护通知', type: 'system' },
    { title: '你的课程成绩已更新', type: 'personal' },
    { title: '请及时完成课程评教', type: 'personal' },
    { title: '奖学金申请开始了', type: 'system' },
    { title: '运动会报名通知', type: 'system' },
    { title: '你的选课申请已通过', type: 'personal' },
    { title: '宿舍安全检查通知', type: 'system' },
    { title: '寒假离校注意事项', type: 'system' },
  ];

  messageTitles.forEach((msg, idx) => {
    insertMessage.run(
      mainUserId,
      msg.title,
      `尊敬的同学：\n\n${msg.title}，请及时登录系统查看详情。如有疑问，请联系教务处。\n\n教务处\n2024年${idx + 9}月`,
      msg.type,
      idx < 3 ? 0 : 1
    );
  });

  console.log('已生成 10 条消息');

  const insertLoginRecord = db.prepare(`
    INSERT INTO login_records (user_id, ip_address, user_agent, login_time)
    VALUES (?, ?, ?, ?)
  `);

  for (let i = 0; i < 15; i++) {
    insertLoginRecord.run(
      mainUserId,
      `${randomInt(192, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      `2024-${randomInt(9, 12)}-${randomInt(1, 30).toString().padStart(2, '0')} ${randomInt(6, 22).toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}:00`
    );
  }

  console.log('已生成 15 条登录记录');

  console.log('模拟数据生成完成！');
  console.log('测试账号：2024001001 / 123456');
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}
