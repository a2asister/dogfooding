import { db } from '@/db'
import { generateId, now, addDays, subtractDays } from '@/utils'
import type { 
  User, Project, IssueTypeConfig, Issue, 
  Workflow, WorkflowStatus, WorkflowTransition,
  CustomField, Sprint, Version, Module, Tag,
  Permission, Role, ProjectMember
} from '@/types'
import { SYSTEM_PERMISSIONS, SYSTEM_ROLES } from '@/types/permission'

const MOCK_USERS: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { username: 'admin', email: 'admin@example.com', displayName: '管理员', roleId: '', isActive: true, password: 'admin123' },
  { username: 'zhangsan', email: 'zhangsan@example.com', displayName: '张三', roleId: '', isActive: true, password: '123456' },
  { username: 'lisi', email: 'lisi@example.com', displayName: '李四', roleId: '', isActive: true, password: '123456' },
  { username: 'wangwu', email: 'wangwu@example.com', displayName: '王五', roleId: '', isActive: true, password: '123456' },
  { username: 'zhaoliu', email: 'zhaoliu@example.com', displayName: '赵六', roleId: '', isActive: true, password: '123456' },
]

const MOCK_PROJECTS: Omit<Project, 'id' | 'ownerId' | 'defaultIssueTypeId' | 'defaultWorkflowId' | 'createdAt' | 'updatedAt'>[] = [
  { name: '电商平台项目', key: 'EP', description: '企业级电商平台开发项目', icon: 'ShoppingCartOutlined', leadId: '', isPublic: false, category: 'software' },
  { name: 'CRM客户关系系统', key: 'CRM', description: '客户关系管理系统', icon: 'UserOutlined', leadId: '', isPublic: false, category: 'software' },
  { name: '数据分析平台', key: 'ADP', description: '企业数据分析与可视化平台', icon: 'BarChartOutlined', leadId: '', isPublic: true, category: 'software' },
]

const ISSUE_TYPE_TEMPLATES: Omit<IssueTypeConfig, 'id' | 'projectId' | 'workflowId' | 'sortOrder' | 'createdAt' | 'updatedAt'>[] = [
  { name: '需求', type: 'requirement', icon: 'BulbOutlined', color: '#1890ff', description: '产品需求或功能需求', isSystem: true, isActive: true },
  { name: '用户故事', type: 'story', icon: 'UserOutlined', color: '#52c41a', description: '从用户角度描述的功能需求', isSystem: true, isActive: true },
  { name: '任务', type: 'task', icon: 'FileTextOutlined', color: '#722ed1', description: '开发或执行任务', isSystem: true, isActive: true },
  { name: '子任务', type: 'subtask', icon: 'SnippetsOutlined', color: '#13c2c2', description: '较大任务的子任务', isSystem: true, isActive: true },
  { name: '缺陷', type: 'bug', icon: 'BugOutlined', color: '#f5222d', description: '系统或功能缺陷', isSystem: true, isActive: true },
  { name: '测试用例', type: 'testcase', icon: 'FileSearchOutlined', color: '#faad14', description: '测试执行用例', isSystem: true, isActive: true },
  { name: '风险', type: 'risk', icon: 'WarningOutlined', color: '#fa8c16', description: '项目风险或问题', isSystem: true, isActive: true },
  { name: '史诗', type: 'epic', icon: 'FireOutlined', color: '#eb2f96', description: '大型功能集合', isSystem: true, isActive: true },
]

const DEFAULT_WORKFLOW_STATUSES: Omit<WorkflowStatus, 'id' | 'workflowId' | 'sortOrder' | 'createdAt' | 'updatedAt'>[] = [
  { name: '待办', category: 'todo', color: '#bfbfbf', description: '新建或未开始的事项', isInitial: true, isTerminal: false },
  { name: '进行中', category: 'in_progress', color: '#1890ff', description: '正在开发或处理中', isInitial: false, isTerminal: false },
  { name: '审核中', category: 'in_progress', color: '#722ed1', description: '等待代码审核或验收', isInitial: false, isTerminal: false },
  { name: '已完成', category: 'done', color: '#52c41a', description: '已完成开发和验收', isInitial: false, isTerminal: true },
  { name: '已关闭', category: 'done', color: '#8c8c8c', description: '已关闭的事项', isInitial: false, isTerminal: true },
  { name: '已阻塞', category: 'todo', color: '#f5222d', description: '被阻塞的事项', isInitial: false, isTerminal: false },
  { name: '重新打开', category: 'todo', color: '#fa8c16', description: '已完成后重新打开', isInitial: false, isTerminal: false },
]

export const initializeDatabase = async (): Promise<void> => {
  const hasData = await db.users.count()
  
  if (hasData > 0) {
    console.log('Database already initialized, skipping...')
    return
  }

  const currentTime = now()
  
  try {
    const permissions: Permission[] = SYSTEM_PERMISSIONS.map(p => ({
      ...p,
      id: generateId(),
      createdAt: currentTime,
      updatedAt: currentTime,
    }))
    await db.permissions.bulkAdd(permissions)
    
    const users: User[] = MOCK_USERS.map(u => ({
      ...u,
      id: generateId(),
      createdAt: currentTime,
      updatedAt: currentTime,
    }))
    await db.users.bulkAdd(users)
    
    const projects: Project[] = MOCK_PROJECTS.map(p => ({
      ...p,
      id: generateId(),
      ownerId: users[0].id,
      leadId: users[1].id,
      defaultIssueTypeId: '',
      defaultWorkflowId: '',
      createdAt: currentTime,
      updatedAt: currentTime,
    }))
    await db.projects.bulkAdd(projects)
      
      const allRoles: Role[] = []
      const allProjectMembers: ProjectMember[] = []
      const allIssueTypes: IssueTypeConfig[] = []
      const allWorkflows: Workflow[] = []
      const allWorkflowStatuses: WorkflowStatus[] = []
      const allWorkflowTransitions: WorkflowTransition[] = []
      const allCustomFields: CustomField[] = []
      const allSprints: Sprint[] = []
      const allVersions: Version[] = []
      const allModules: Module[] = []
      const allTags: Tag[] = []
      
      for (const project of projects) {
        const projectRoles: Role[] = SYSTEM_ROLES.map(r => ({
          ...r,
          id: generateId(),
          projectId: project.id,
          permissionIds: permissions.map(p => p.id),
          createdAt: currentTime,
          updatedAt: currentTime,
        }))
        allRoles.push(...projectRoles)
        
        const projectMembers: ProjectMember[] = users.slice(0, 4).map((u, idx) => ({
          id: generateId(),
          projectId: project.id,
          userId: u.id,
          roleId: projectRoles[idx % projectRoles.length].id,
          isActive: true,
          joinedAt: currentTime,
        }))
        allProjectMembers.push(...projectMembers)
        
        const workflow: Workflow = {
          id: generateId(),
          projectId: project.id,
          name: '默认工作流',
          description: '系统默认工作流',
          isSystem: true,
          isActive: true,
          issueTypeIds: [],
          initialStatusId: '',
          createdAt: currentTime,
          updatedAt: currentTime,
        }
        allWorkflows.push(workflow)
        
        const workflowStatuses: WorkflowStatus[] = DEFAULT_WORKFLOW_STATUSES.map((s, idx) => ({
          ...s,
          id: generateId(),
          workflowId: workflow.id,
          sortOrder: idx + 1,
          createdAt: currentTime,
          updatedAt: currentTime,
        }))
        allWorkflowStatuses.push(...workflowStatuses)
        workflow.initialStatusId = workflowStatuses[0].id
        
        const transitions: WorkflowTransition[] = []
        const todoStatus = workflowStatuses.find(s => s.name === '待办')!
        const inProgressStatus = workflowStatuses.find(s => s.name === '进行中')!
        const reviewStatus = workflowStatuses.find(s => s.name === '审核中')!
        const doneStatus = workflowStatuses.find(s => s.name === '已完成')!
        const closedStatus = workflowStatuses.find(s => s.name === '已关闭')!
        const blockedStatus = workflowStatuses.find(s => s.name === '已阻塞')!
        const reopenedStatus = workflowStatuses.find(s => s.name === '重新打开')!
        
        const transitionTemplates = [
          { from: todoStatus, to: inProgressStatus, name: '开始处理' },
          { from: inProgressStatus, to: reviewStatus, name: '提交审核' },
          { from: reviewStatus, to: doneStatus, name: '审核通过' },
          { from: reviewStatus, to: inProgressStatus, name: '需修改' },
          { from: inProgressStatus, to: doneStatus, name: '完成' },
          { from: doneStatus, to: closedStatus, name: '关闭' },
          { from: todoStatus, to: blockedStatus, name: '标记阻塞' },
          { from: inProgressStatus, to: blockedStatus, name: '标记阻塞' },
          { from: blockedStatus, to: todoStatus, name: '解除阻塞' },
          { from: blockedStatus, to: inProgressStatus, name: '解除阻塞开始处理' },
          { from: doneStatus, to: reopenedStatus, name: '重新打开' },
          { from: closedStatus, to: reopenedStatus, name: '重新打开' },
          { from: reopenedStatus, to: inProgressStatus, name: '开始处理' },
        ]
        
        transitionTemplates.forEach((t, idx) => {
          transitions.push({
            id: generateId(),
            workflowId: workflow.id,
            fromStatusId: t.from.id,
            toStatusId: t.to.id,
            name: t.name,
            isAutomatic: false,
            sortOrder: idx + 1,
            createdAt: currentTime,
            updatedAt: currentTime,
          })
        })
        allWorkflowTransitions.push(...transitions)
        
        const issueTypes: IssueTypeConfig[] = ISSUE_TYPE_TEMPLATES.map((t, idx) => ({
          ...t,
          id: generateId(),
          projectId: project.id,
          workflowId: workflow.id,
          sortOrder: idx + 1,
          createdAt: currentTime,
          updatedAt: currentTime,
        }))
        allIssueTypes.push(...issueTypes)
        workflow.issueTypeIds = issueTypes.map(it => it.id)
        
        project.defaultIssueTypeId = issueTypes[0].id
        project.defaultWorkflowId = workflow.id
        
        const customFields: CustomField[] = [
          {
            id: generateId(),
            projectId: project.id,
            name: '故事点',
            key: 'story_points',
            description: '敏捷开发中的故事点估算',
            fieldType: 'number',
            configuration: { minValue: 0, maxValue: 100 },
            isRequired: false,
            isSearchable: true,
            isSortable: true,
            isActive: true,
            applicableIssueTypeIds: issueTypes.filter(it => ['story', 'task', 'bug'].includes(it.type)).map(it => it.id),
            sortOrder: 1,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '严重程度',
            key: 'severity',
            description: '缺陷的严重程度',
            fieldType: 'select',
            configuration: {
              options: [
                { id: generateId(), value: 'blocker', label: '阻塞', color: '#f5222d' },
                { id: generateId(), value: 'critical', label: '严重', color: '#fa8c16' },
                { id: generateId(), value: 'major', label: '主要', color: '#faad14' },
                { id: generateId(), value: 'minor', label: '次要', color: '#1890ff' },
                { id: generateId(), value: 'trivial', label: '轻微', color: '#8c8c8c' },
              ],
            },
            isRequired: false,
            isSearchable: true,
            isSortable: true,
            isActive: true,
            applicableIssueTypeIds: issueTypes.filter(it => it.type === 'bug').map(it => it.id),
            sortOrder: 2,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '环境',
            key: 'environment',
            description: '缺陷复现的环境',
            fieldType: 'multiselect',
            configuration: {
              options: [
                { id: generateId(), value: 'dev', label: '开发环境' },
                { id: generateId(), value: 'test', label: '测试环境' },
                { id: generateId(), value: 'staging', label: '预发布环境' },
                { id: generateId(), value: 'prod', label: '生产环境' },
              ],
            },
            isRequired: false,
            isSearchable: true,
            isSortable: false,
            isActive: true,
            applicableIssueTypeIds: issueTypes.filter(it => it.type === 'bug').map(it => it.id),
            sortOrder: 3,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '验收标准',
            key: 'acceptance_criteria',
            description: '需求或用户故事的验收标准',
            fieldType: 'textarea',
            configuration: { placeholder: '请输入验收标准...' },
            isRequired: false,
            isSearchable: true,
            isSortable: false,
            isActive: true,
            applicableIssueTypeIds: issueTypes.filter(it => ['requirement', 'story'].includes(it.type)).map(it => it.id),
            sortOrder: 4,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '预计完成日期',
            key: 'expected_completion_date',
            description: '事项预计完成的日期',
            fieldType: 'date',
            configuration: {},
            isRequired: false,
            isSearchable: true,
            isSortable: true,
            isActive: true,
            applicableIssueTypeIds: issueTypes.map(it => it.id),
            sortOrder: 5,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        ]
        allCustomFields.push(...customFields)
        
        const sprints: Sprint[] = [
          {
            id: generateId(),
            projectId: project.id,
            name: 'Sprint 1',
            goal: '完成用户登录和注册功能',
            status: 'completed',
            startDate: subtractDays(currentTime, 21),
            endDate: subtractDays(currentTime, 7),
            completedDate: subtractDays(currentTime, 7),
            sortOrder: 1,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: 'Sprint 2',
            goal: '完成商品展示和购物车功能',
            status: 'active',
            startDate: subtractDays(currentTime, 6),
            endDate: addDays(currentTime, 7),
            sortOrder: 2,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: 'Sprint 3',
            goal: '待规划',
            status: 'future',
            sortOrder: 3,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        ]
        allSprints.push(...sprints)
        
        const versions: Version[] = [
          {
            id: generateId(),
            projectId: project.id,
            name: 'v1.0.0',
            description: '第一个正式版本',
            status: 'released',
            startDate: subtractDays(currentTime, 60),
            releaseDate: subtractDays(currentTime, 30),
            isReleased: true,
            archived: false,
            sortOrder: 1,
            createdAt: currentTime,
            updatedAt: currentTime,
            releasedAt: subtractDays(currentTime, 30),
          },
          {
            id: generateId(),
            projectId: project.id,
            name: 'v1.1.0',
            description: '功能增强版本',
            status: 'unreleased',
            startDate: subtractDays(currentTime, 15),
            releaseDate: addDays(currentTime, 15),
            isReleased: false,
            archived: false,
            sortOrder: 2,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: 'v2.0.0',
            description: '重大版本更新',
            status: 'unreleased',
            releaseDate: addDays(currentTime, 60),
            isReleased: false,
            archived: false,
            sortOrder: 3,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        ]
        allVersions.push(...versions)
        
        const modules: Module[] = [
          {
            id: generateId(),
            projectId: project.id,
            name: '用户中心',
            key: 'user_center',
            description: '用户相关功能模块',
            icon: 'UserOutlined',
            color: '#1890ff',
            leadId: users[1].id,
            isActive: true,
            sortOrder: 1,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '商品管理',
            key: 'product_management',
            description: '商品相关功能模块',
            icon: 'ShoppingOutlined',
            color: '#52c41a',
            leadId: users[2].id,
            isActive: true,
            sortOrder: 2,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '订单系统',
            key: 'order_system',
            description: '订单相关功能模块',
            icon: 'FileTextOutlined',
            color: '#722ed1',
            leadId: users[3].id,
            isActive: true,
            sortOrder: 3,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '支付系统',
            key: 'payment_system',
            description: '支付相关功能模块',
            icon: 'CreditCardOutlined',
            color: '#faad14',
            isActive: true,
            sortOrder: 4,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        ]
        allModules.push(...modules)
        
        const tags: Tag[] = [
          {
            id: generateId(),
            projectId: project.id,
            name: '紧急',
            color: '#f5222d',
            isSystem: false,
            usageCount: 0,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '前端',
            color: '#1890ff',
            isSystem: false,
            usageCount: 0,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '后端',
            color: '#52c41a',
            isSystem: false,
            usageCount: 0,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '优化',
            color: '#722ed1',
            isSystem: false,
            usageCount: 0,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '重构',
            color: '#fa8c16',
            isSystem: false,
            usageCount: 0,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          {
            id: generateId(),
            projectId: project.id,
            name: '技术债务',
            color: '#13c2c2',
            isSystem: false,
            usageCount: 0,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        ]
        allTags.push(...tags)
      }
      
      await db.roles.bulkAdd(allRoles)
      await db.projectMembers.bulkAdd(allProjectMembers)
      await db.workflows.bulkAdd(allWorkflows)
      await db.workflowStatuses.bulkAdd(allWorkflowStatuses)
      await db.workflowTransitions.bulkAdd(allWorkflowTransitions)
      await db.issueTypes.bulkAdd(allIssueTypes)
      await db.customFields.bulkAdd(allCustomFields)
      await db.sprints.bulkAdd(allSprints)
      await db.versions.bulkAdd(allVersions)
      await db.modules.bulkAdd(allModules)
      await db.tags.bulkAdd(allTags)
      
      await db.projects.bulkPut(projects)
      
      const allIssues: Issue[] = []
      let issueCounter = 1
      
      for (const project of projects) {
        const projectIssueTypes = allIssueTypes.filter(it => it.projectId === project.id)
        const projectUsers = users.slice(0, 4)
        const projectSprints = allSprints.filter(s => s.projectId === project.id)
        const projectModules = allModules.filter(m => m.projectId === project.id)
        const projectTags = allTags.filter(t => t.projectId === project.id)
        const projectVersions = allVersions.filter(v => v.projectId === project.id)
        
        const issueTemplates = [
          { type: 'epic', summary: '用户认证系统重构', description: '重构现有的用户认证系统，支持OAuth2.0和多因素认证', assigneeIdx: 1, sprintIdx: 1, moduleIdx: 0, status: 'in_progress' },
          { type: 'story', summary: '用户登录功能优化', description: '优化登录体验，支持记住密码、快速登录等功能', assigneeIdx: 1, sprintIdx: 1, moduleIdx: 0, status: 'in_progress', parentIdx: 0 },
          { type: 'story', summary: '注册流程完善', description: '完善用户注册流程，支持手机号、邮箱注册', assigneeIdx: 2, sprintIdx: 1, moduleIdx: 0, status: 'todo', parentIdx: 0 },
          { type: 'task', summary: '前端登录页面重构', description: '使用React组件库重构登录页面UI', assigneeIdx: 1, sprintIdx: 1, moduleIdx: 0, status: 'done', parentIdx: 1 },
          { type: 'task', summary: '后端登录接口优化', description: '优化登录接口性能，添加限流保护', assigneeIdx: 2, sprintIdx: 1, moduleIdx: 0, status: 'in_progress', parentIdx: 1 },
          { type: 'bug', summary: '登录密码错误次数限制失效', description: '用户尝试登录时，密码错误次数超过限制后仍可继续尝试', assigneeIdx: 2, sprintIdx: 1, moduleIdx: 0, status: 'in_progress' },
          { type: 'story', summary: '商品列表页优化', description: '优化商品列表的展示和筛选功能', assigneeIdx: 3, sprintIdx: 1, moduleIdx: 1, status: 'todo' },
          { type: 'story', summary: '购物车功能完善', description: '完善购物车的添加、删除、数量修改等功能', assigneeIdx: 3, sprintIdx: 1, moduleIdx: 1, status: 'in_progress' },
          { type: 'task', summary: '商品搜索功能实现', description: '实现基于Elasticsearch的商品全文搜索', assigneeIdx: 2, sprintIdx: 0, moduleIdx: 1, status: 'done' },
          { type: 'task', summary: '商品详情页性能优化', description: '优化商品详情页的加载速度和渲染性能', assigneeIdx: 1, sprintIdx: 0, moduleIdx: 1, status: 'done' },
          { type: 'bug', summary: '商品价格显示不正确', description: '在某些情况下，商品价格显示为0', assigneeIdx: 3, sprintIdx: 1, moduleIdx: 1, status: 'review' },
          { type: 'bug', summary: '购物车数量添加异常', description: '连续点击添加按钮时，数量增加超过预期', assigneeIdx: 3, sprintIdx: 1, moduleIdx: 1, status: 'todo' },
          { type: 'requirement', summary: '订单管理系统', description: '完整的订单管理功能，包括创建、查询、修改、取消等', assigneeIdx: 3, sprintIdx: 2, moduleIdx: 2, status: 'todo' },
          { type: 'story', summary: '订单创建流程', description: '实现订单创建的完整流程', assigneeIdx: 3, sprintIdx: 2, moduleIdx: 2, status: 'todo' },
          { type: 'story', summary: '订单状态追踪', description: '实现订单状态的实时追踪和展示', assigneeIdx: 2, sprintIdx: 2, moduleIdx: 2, status: 'todo' },
          { type: 'risk', summary: '支付接口稳定性风险', description: '第三方支付接口可能存在不稳定的情况，需要考虑降级方案', assigneeIdx: 0, sprintIdx: 2, moduleIdx: 3, status: 'todo' },
          { type: 'testcase', summary: '登录功能测试用例', description: '覆盖正常登录、异常登录、边界情况等测试场景', assigneeIdx: 0, sprintIdx: 1, moduleIdx: 0, status: 'done' },
          { type: 'testcase', summary: '商品搜索测试用例', description: '覆盖关键词搜索、筛选条件、排序等测试场景', assigneeIdx: 0, sprintIdx: 0, moduleIdx: 1, status: 'done' },
        ]
        
        const issueMap = new Map<number, string>()
        
        for (let i = 0; i < issueTemplates.length; i++) {
          const template = issueTemplates[i]
          const issueType = projectIssueTypes.find(it => it.type === template.type) || projectIssueTypes[0]
          const assignee = template.assigneeIdx !== undefined ? projectUsers[template.assigneeIdx] : undefined
          const sprint = template.sprintIdx !== undefined ? projectSprints[template.sprintIdx] : undefined
          const module = template.moduleIdx !== undefined ? projectModules[template.moduleIdx] : undefined
          
          let parentId: string | undefined
          if (template.parentIdx !== undefined) {
            parentId = issueMap.get(template.parentIdx)
          }
          
          const issue: Issue = {
            id: generateId(),
            projectId: project.id,
            issueTypeId: issueType.id,
            issueKey: `${project.key}-${issueCounter++}`,
            summary: template.summary,
            description: template.description,
            reporterId: users[0].id,
            assigneeId: assignee?.id,
            priority: ['high', 'medium', 'low'][i % 3] as 'high' | 'medium' | 'low',
            status: (template.status || 'todo') as Issue['status'],
            originalEstimate: (i + 1) * 60,
            remainingEstimate: template.status === 'done' ? 0 : (i + 1) * 30,
            timeSpent: template.status === 'done' ? (i + 1) * 60 : (i + 1) * 20,
            dueDate: addDays(currentTime, 7 + i),
            startDate: template.status !== 'todo' ? subtractDays(currentTime, 5 + i) : undefined,
            resolutionDate: template.status === 'done' ? subtractDays(currentTime, i) : undefined,
            sprintId: sprint?.id,
            versionIds: i % 3 === 0 ? [projectVersions[0].id] : undefined,
            fixVersionIds: i % 2 === 0 ? [projectVersions[1].id] : undefined,
            moduleIds: module ? [module.id] : undefined,
            tagIds: i % 2 === 0 ? projectTags.slice(0, 2).map(t => t.id) : undefined,
            parentId,
            customFields: {
              story_points: (i % 8) + 1,
              severity: template.type === 'bug' ? ['blocker', 'critical', 'major', 'minor'][i % 4] : undefined,
            },
            position: i,
            createdAt: subtractDays(currentTime, 10 + i),
            updatedAt: currentTime,
          }
          
          allIssues.push(issue)
          issueMap.set(i, issue.id)
        }
      }
      
      await db.issues.bulkAdd(allIssues)
      
      users.forEach(u => {
        const role = allRoles.find(r => r.name === '项目管理员')
        if (role) {
          u.roleId = role.id
        }
      })
      await db.users.bulkPut(users)
      
      console.log('Database initialized successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

export default initializeDatabase
