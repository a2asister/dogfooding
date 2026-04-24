// @ts-nocheck
import Mock from 'mockjs'
import type { User, Role, OperationLog, Flight, Passenger, Baggage, Resource, SecurityCheck, HiddenDanger, EmergencyPlan, EmergencyIncident, Equipment, MaintenanceRecord, FaultReport, Complaint } from '@/types'

const Random = Mock.Random

const roles: Role[] = [
  {
    id: '1',
    name: '超级管理员',
    code: 'super_admin',
    description: '系统最高权限，可管理所有模块',
    permissions: [
      'dashboard',
      'flight',
      'passenger',
      'baggage',
      'resource',
      'security',
      'equipment',
      'data',
      'system_users',
      'system_roles',
      'system_logs',
    ],
    createdAt: '2024-01-01',
    status: 'active',
  },
  {
    id: '2',
    name: '航班管理员',
    code: 'flight_manager',
    description: '负责航班数据管理和调度',
    permissions: ['dashboard', 'flight', 'resource', 'passenger', 'baggage'],
    createdAt: '2024-01-02',
    status: 'active',
  },
  {
    id: '3',
    name: '旅客服务专员',
    code: 'passenger_staff',
    description: '负责旅客服务和投诉处理',
    permissions: ['dashboard', 'passenger', 'baggage'],
    createdAt: '2024-01-03',
    status: 'active',
  },
  {
    id: '4',
    name: '安防管理员',
    code: 'security_manager',
    description: '负责安防监控和应急管理',
    permissions: ['dashboard', 'security'],
    createdAt: '2024-01-04',
    status: 'active',
  },
  {
    id: '5',
    name: '设备运维员',
    code: 'equipment_tech',
    description: '负责设备维护和故障处理',
    permissions: ['dashboard', 'equipment'],
    createdAt: '2024-01-05',
    status: 'active',
  },
]

const users: User[] = [
  {
    id: '1',
    username: 'admin',
    name: '张管理',
    role: '超级管理员',
    roleId: '1',
    department: '信息技术部',
    email: 'admin@airport.com',
    phone: '13800138001',
    status: 'active',
    createdAt: '2024-01-01',
    lastLogin: '2024-04-24 10:30:00',
  },
  {
    id: '2',
    username: 'flight01',
    name: '李航班',
    role: '航班管理员',
    roleId: '2',
    department: '运行控制中心',
    email: 'flight@airport.com',
    phone: '13800138002',
    status: 'active',
    createdAt: '2024-01-02',
    lastLogin: '2024-04-24 09:15:00',
  },
  {
    id: '3',
    username: 'passenger01',
    name: '王服务',
    role: '旅客服务专员',
    roleId: '3',
    department: '旅客服务部',
    email: 'service@airport.com',
    phone: '13800138003',
    status: 'active',
    createdAt: '2024-01-03',
    lastLogin: '2024-04-24 08:45:00',
  },
  {
    id: '4',
    username: 'security01',
    name: '赵安全',
    role: '安防管理员',
    roleId: '4',
    department: '安全保卫部',
    email: 'security@airport.com',
    phone: '13800138004',
    status: 'active',
    createdAt: '2024-01-04',
    lastLogin: '2024-04-24 07:30:00',
  },
  {
    id: '5',
    username: 'tech01',
    name: '钱技术',
    role: '设备运维员',
    roleId: '5',
    department: '设备运维部',
    email: 'tech@airport.com',
    phone: '13800138005',
    status: 'active',
    createdAt: '2024-01-05',
    lastLogin: '2024-04-24 09:00:00',
  },
]

const airlines = ['国航', '东航', '南航', '海航', '厦航', '川航', '深航', '山航']
const aircraftTypes = ['Boeing 737-800', 'Boeing 787-9', 'Airbus A320neo', 'Airbus A350-900', 'Boeing 777-300ER']
const airports = ['北京首都', '北京大兴', '上海浦东', '上海虹桥', '广州白云', '深圳宝安', '成都天府', '杭州萧山', '西安咸阳', '重庆江北']
const statuses: Flight['status'][] = ['scheduled', 'delayed', 'cancelled', 'diverted', 'boarding', 'departed', 'arrived']

const generateFlights = (count: number): Flight[] => {
  const flights: Flight[] = []
  for (let i = 0; i < count; i++) {
    const airline = Random.pick(airlines)
    const flightNo = `${airline.charAt(0)}${Random.integer(1000, 9999)}`
    const isDeparture = Random.boolean()
    const scheduledDate = Random.date('yyyy-MM-dd')
    const scheduledTime = Random.time('HH:mm')
    const duration = Random.integer(60, 240)
    
    flights.push({
      id: `F${String(i + 1).padStart(6, '0')}`,
      flightNo,
      airline,
      aircraftType: Random.pick(aircraftTypes),
      registration: `B-${Random.integer(1000, 9999)}`,
      departureAirport: isDeparture ? '上海浦东' : Random.pick(airports.filter(a => a !== '上海浦东')),
      arrivalAirport: isDeparture ? Random.pick(airports.filter(a => a !== '上海浦东')) : '上海浦东',
      scheduledDeparture: `${scheduledDate} ${scheduledTime}`,
      scheduledArrival: `${scheduledDate} ${addMinutes(scheduledTime, duration)}`,
      actualDeparture: Random.boolean(0.7) ? `${scheduledDate} ${addMinutes(scheduledTime, Random.integer(-10, 30))}` : null,
      actualArrival: null,
      estimatedDeparture: `${scheduledDate} ${addMinutes(scheduledTime, Random.integer(0, 120))}`,
      estimatedArrival: `${scheduledDate} ${addMinutes(scheduledTime, duration + Random.integer(0, 120))}`,
      status: Random.pick(statuses),
      gate: `G${Random.integer(1, 50)}`,
      stand: `S${Random.integer(1, 80)}`,
      terminal: `T${Random.integer(1, 3)}`,
      passengerCount: Random.integer(100, 350),
      isArchive: false,
      createdAt: Random.date('yyyy-MM-dd HH:mm:ss'),
      updatedAt: Random.date('yyyy-MM-dd HH:mm:ss'),
    })
  }
  return flights
}

const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

const generatePassengers = (count: number): Passenger[] => {
  const passengers: Passenger[] = []
  const chineseNames = ['张伟', '王伟', '李娜', '刘洋', '陈静', '杨帆', '赵敏', '黄磊', '周涛', '吴鹏']
  const seatClasses: Passenger['seatClass'][] = ['economy', 'business', 'first']
  const checkInStatuses: Passenger['checkInStatus'][] = ['pending', 'checked', 'boarded']
  const specialServices = ['轮椅服务', '无陪老人', '无陪儿童', '餐食特殊要求', '担架旅客']
  
  for (let i = 0; i < count; i++) {
    passengers.push({
      id: `P${String(i + 1).padStart(8, '0')}`,
      name: Random.pick(chineseNames) + Random.integer(1, 100),
      idCard: `${Random.integer(110000, 650000)}${Random.date('yyyyMMdd')}${Random.integer(1000, 9999)}`,
      passport: `E${Random.string('number', 8)}`,
      phone: `1${Random.integer(3, 9)}${Random.string('number', 9)}`,
      email: Random.email(),
      nationality: '中国',
      gender: Random.pick(['male', 'female']),
      birthDate: Random.date('yyyy-MM-dd', '2005-01-01', '1960-01-01'),
      flightId: `F${String(Random.integer(1, 100)).padStart(6, '0')}`,
      flightNo: `${Random.pick(airlines).charAt(0)}${Random.integer(1000, 9999)}`,
      seatNo: `${Random.integer(1, 35)}${Random.pick(['A', 'B', 'C', 'D', 'E', 'F'])}`,
      seatClass: Random.pick(seatClasses),
      checkInStatus: Random.pick(checkInStatuses),
      boardingStatus: Random.boolean(0.6),
      boardingTime: Random.boolean(0.6) ? Random.date('yyyy-MM-dd HH:mm:ss') : null,
      specialService: Random.boolean(0.1) ? [Random.pick(specialServices)] : [],
      createdAt: Random.date('yyyy-MM-dd HH:mm:ss'),
    })
  }
  return passengers
}

const generateBaggage = (count: number): Baggage[] => {
  const baggage: Baggage[] = []
  const statuses: Baggage['status'][] = ['check-in', 'loaded', 'unloaded', 'transit', 'delivered', 'lost', 'damaged']
  const locations = ['值机柜台', '安检通道', '行李分拣', '行李车', '飞机货舱', '行李提取']
  
  for (let i = 0; i < count; i++) {
    const historyCount = Random.integer(2, 8)
    const history: Baggage['history'] = []
    for (let j = 0; j < historyCount; j++) {
      history.push({
        id: `BH${i + 1}-${j + 1}`,
        location: locations[j % locations.length],
        action: Random.pick(['扫描', '装车', '装机', '卸机', '分拣', '提取', '异常']),
        operator: `员工${Random.integer(1001, 9999)}`,
        timestamp: Random.date('yyyy-MM-dd HH:mm:ss'),
        note: '',
      })
    }
    
    baggage.push({
      id: `B${String(i + 1).padStart(10, '0')}`,
      tagNo: `PVG${Random.string('number', 8)}`,
      passengerId: `P${String(Random.integer(1, 200)).padStart(8, '0')}`,
      passengerName: Random.cname(),
      flightId: `F${String(Random.integer(1, 100)).padStart(6, '0')}`,
      flightNo: `${Random.pick(airlines).charAt(0)}${Random.integer(1000, 9999)}`,
      weight: Random.float(5, 32, 1, 1),
      type: Random.pick(['checked', 'carry-on']),
      status: Random.pick(statuses),
      currentLocation: Random.pick(locations),
      history,
      createdAt: Random.date('yyyy-MM-dd HH:mm:ss'),
      updatedAt: Random.date('yyyy-MM-dd HH:mm:ss'),
    })
  }
  return baggage
}

const generateResources = (): Resource[] => {
  const resources: Resource[] = []
  const types: Resource['type'][] = ['gate', 'stand', 'bridge']
  const terminals = ['T1', 'T2', 'T3']
  
  types.forEach((type) => {
    const count = type === 'gate' ? 50 : type === 'stand' ? 80 : 30
    for (let i = 0; i < count; i++) {
      const statusOptions: Resource['status'][] = ['available', 'occupied', 'maintenance', 'reserved']
      resources.push({
        id: `${type.toUpperCase()}${String(i + 1).padStart(3, '0')}`,
        type,
        code: `${type === 'gate' ? 'G' : type === 'stand' ? 'S' : 'B'}${i + 1}`,
        name: `${type === 'gate' ? '登机口' : type === 'stand' ? '停机位' : '廊桥'} ${i + 1}`,
        terminal: Random.pick(terminals),
        status: Random.pick(statusOptions),
        currentFlight: Random.boolean(0.4) ? `F${String(Random.integer(1, 100)).padStart(6, '0')}` : null,
        currentFlightNo: Random.boolean(0.4) ? `${Random.pick(airlines).charAt(0)}${Random.integer(1000, 9999)}` : null,
        nextFlight: Random.boolean(0.3) ? `F${String(Random.integer(1, 100)).padStart(6, '0')}` : null,
        nextFlightNo: Random.boolean(0.3) ? `${Random.pick(airlines).charAt(0)}${Random.integer(1000, 9999)}` : null,
        capacity: Random.integer(100, 400),
        equipment: type === 'gate' ? ['显示屏', '广播系统', '登机桥接口'] : 
                   type === 'stand' ? ['地勤服务', '电源接口', '空调接口'] : 
                   ['移动平台', '空调系统', '电源系统'],
        lastMaintenance: Random.date('yyyy-MM-dd'),
        nextMaintenance: Random.date('yyyy-MM-dd', '2024-12-31', '2024-05-01'),
      })
    }
  })
  return resources
}

const generateOperationLogs = (count: number): OperationLog[] => {
  const logs: OperationLog[] = []
  const modules = ['航班管理', '旅客服务', '行李管理', '资源调度', '安防应急', '设备运维', '系统管理', '数据报表']
  const actions = ['新增', '修改', '删除', '查询', '导出', '导入', '审核', '发布', '归档', '触发']
  const userNames = users.map(u => u.name)
  
  for (let i = 0; i < count; i++) {
    const user = Random.pick(userNames)
    const module = Random.pick(modules)
    const action = Random.pick(actions)
    
    logs.push({
      id: `LOG${String(i + 1).padStart(10, '0')}`,
      userId: String(Random.integer(1, 5)),
      username: user,
      action,
      module,
      description: `${user} 在 ${module} 模块执行了 ${action} 操作`,
      ip: `192.168.${Random.integer(1, 255)}.${Random.integer(1, 255)}`,
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss', '2024-04-24 23:59:59', '2024-01-01 00:00:00'),
      details: {
        requestId: `REQ${Random.string('number', 8)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        responseTime: Random.integer(10, 500),
      },
    })
  }
  return logs
}

const generateSecurityChecks = (count: number): SecurityCheck[] => {
  const checks: SecurityCheck[] = []
  const areas = ['T1航站楼', 'T2航站楼', 'T3航站楼', '停机坪A区', '停机坪B区', '货运区', '办公楼', '停车场']
  const items = ['消防设备', '监控系统', '门禁系统', '应急通道', '安全标识', '防爆设施', '照明系统']
  const statuses: SecurityCheck['status'][] = ['pending', 'in-progress', 'completed', 'failed']
  const inspectors = ['张安全', '李保卫', '王巡查', '赵督查']
  
  for (let i = 0; i < count; i++) {
    checks.push({
      id: `SC${String(i + 1).padStart(8, '0')}`,
      area: Random.pick(areas),
      checkItem: Random.pick(items),
      inspector: Random.pick(inspectors),
      status: Random.pick(statuses),
      startTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      endTime: Random.boolean(0.7) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      findings: Random.boolean(0.3) ? ['发现灭火器压力不足', '应急灯故障'] : [],
      photos: [],
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
    })
  }
  return checks
}

const generateHiddenDangers = (count: number): HiddenDanger[] => {
  const dangers: HiddenDanger[] = []
  const titles = ['T2航站楼消防通道堵塞', 'T1卫生间照明故障', '停机坪围栏破损', '值机柜台显示屏故障', '扶梯异响']
  const levels: HiddenDanger['level'][] = ['low', 'medium', 'high', 'critical']
  const areas = ['T1航站楼', 'T2航站楼', 'T3航站楼', '停机坪', '停车场', '货运区']
  const statuses: HiddenDanger['status'][] = ['reported', 'assigned', 'processing', 'verified', 'closed']
  const handlers = ['赵安全', '钱运维', '孙维修', '周负责']
  
  for (let i = 0; i < count; i++) {
    dangers.push({
      id: `HD${String(i + 1).padStart(8, '0')}`,
      title: Random.pick(titles),
      description: '经检查发现存在安全隐患，需要立即处理。具体情况如下：检查发现设备存在异常，需要进行维修或更换。',
      level: Random.pick(levels),
      area: Random.pick(areas),
      reporter: `员工${Random.integer(1001, 9999)}`,
      reporterPhone: `1${Random.integer(3, 9)}${Random.string('number', 9)}`,
      status: Random.pick(statuses),
      assignee: Random.boolean(0.8) ? Random.pick(handlers) : null,
      handler: Random.boolean(0.6) ? Random.pick(handlers) : null,
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      assignedAt: Random.boolean(0.8) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      closedAt: Random.boolean(0.5) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      photos: [],
      comments: Random.boolean(0.4) ? [
        {
          id: `C${i}-1`,
          user: Random.pick(handlers),
          content: '已收到通知，正在处理中。',
          createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        },
      ] : [],
    })
  }
  return dangers
}

const generateEmergencyPlans = (): EmergencyPlan[] => {
  return [
    {
      id: 'EP001',
      name: '火灾应急预案',
      type: 'fire',
      level: 'level1',
      description: '机场内发生火灾时的应急处置方案',
      triggerConditions: ['烟雾报警器触发', '手动报警', '视频监控发现火情'],
      responseTeams: ['消防应急队', '医疗救护队', '疏散引导组', '现场指挥组'],
      contactList: [
        { name: '消防指挥', role: '消防队长', phone: '119' },
        { name: '医疗急救', role: '急救中心', phone: '120' },
        { name: '应急指挥', role: '运行总监', phone: '13800138000' },
      ],
      procedures: [
        '发现火情立即报警',
        '启动消防系统',
        '组织人员疏散',
        '医疗救护准备',
        '现场封锁警戒',
        '事故调查总结',
      ],
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-03-15',
    },
    {
      id: 'EP002',
      name: '突发医疗事件应急预案',
      type: 'medical',
      level: 'level2',
      description: '旅客或工作人员突发疾病时的应急处置',
      triggerConditions: ['旅客突发疾病', '工作人员晕倒', '意外伤害'],
      responseTeams: ['医疗救护队', '现场协调组'],
      contactList: [
        { name: '急救中心', role: '医疗', phone: '120' },
        { name: '机场医疗', role: '值班医生', phone: '13800138001' },
      ],
      procedures: [
        '立即拨打急救电话',
        '现场初步急救',
        '安抚患者情绪',
        '联系家属',
        '做好记录',
      ],
      isActive: true,
      createdAt: '2024-01-02',
      updatedAt: '2024-02-20',
    },
    {
      id: 'EP003',
      name: '恐怖袭击应急预案',
      type: 'security',
      level: 'level1',
      description: '应对恐怖袭击等严重安全事件',
      triggerConditions: ['发现可疑物品', '收到恐吓信息', '发现可疑人员'],
      responseTeams: ['安全保卫部', '防爆组', '疏散组', '协调组'],
      contactList: [
        { name: '公安局', role: '报警', phone: '110' },
        { name: '反恐办', role: '反恐指挥', phone: '13800138002' },
      ],
      procedures: [
        '立即报警',
        '现场封锁',
        '人员疏散',
        '配合警方',
        '信息上报',
      ],
      isActive: true,
      createdAt: '2024-01-03',
      updatedAt: '2024-03-01',
    },
  ]
}

const generateEmergencyIncidents = (count: number): EmergencyIncident[] => {
  const incidents: EmergencyIncident[] = []
  const plans = generateEmergencyPlans()
  const locations = ['T1航站楼出发厅', 'T2航站楼到达厅', 'T3航站楼安检区', '停机坪A区', '停车场']
  const statuses: EmergencyIncident['status'][] = ['triggered', 'handling', 'resolved', 'closed']
  const commanders = ['张指挥', '李总监', '王经理']
  const teams = ['消防应急队', '医疗救护队', '安全保卫部', '疏散引导组']
  
  for (let i = 0; i < count; i++) {
    const plan = Random.pick(plans)
    incidents.push({
      id: `EI${String(i + 1).padStart(8, '0')}`,
      title: `${plan.name} - ${Random.pick(locations)}`,
      planId: plan.id,
      planName: plan.name,
      location: Random.pick(locations),
      description: '根据应急预案，启动应急响应。现场情况正在核实中，相关人员已赶赴现场。',
      level: plan.level,
      status: Random.pick(statuses),
      triggerTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      resolvedTime: Random.boolean(0.6) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      closedTime: Random.boolean(0.4) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      commander: Random.pick(commanders),
      teams: Random.shuffle(teams).slice(0, Random.integer(2, 4)),
      updates: [
        {
          id: `U${i}-1`,
          user: Random.pick(commanders),
          content: '已收到报警信息，正在核实情况。',
          createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        },
      ],
      attachments: [],
    })
  }
  return incidents
}

const generateEquipment = (count: number): Equipment[] => {
  const equipment: Equipment[] = []
  const categories = ['电梯', '扶梯', '空调系统', '行李分拣机', '安检设备', '登机桥', '照明系统', '消防设备', '监控设备', '广播系统']
  const brands = ['奥的斯', '日立', '三菱', '西门子', '施耐德', '霍尼韦尔', '海康威视', '大华']
  const models = ['Model-X1', 'Model-X2', 'Pro-2024', 'Standard-V3', 'Elite-Series']
  const statuses: Equipment['status'][] = ['normal', 'maintenance', 'fault', 'scrapped']
  const locations = ['T1航站楼', 'T2航站楼', 'T3航站楼', '停机坪', '货运区', '办公楼']
  const persons = ['钱技术', '孙维修', '李工程师', '王师傅']
  
  for (let i = 0; i < count; i++) {
    const category = Random.pick(categories)
    equipment.push({
      id: `EQ${String(i + 1).padStart(8, '0')}`,
      code: `${category.charAt(0)}${String(i + 1).padStart(6, '0')}`,
      name: `${category} ${i + 1}号`,
      category,
      brand: Random.pick(brands),
      model: Random.pick(models),
      serialNumber: `SN${Random.string('alphanumeric', 12).toUpperCase()}`,
      purchaseDate: Random.date('yyyy-MM-dd', '2023-12-31', '2018-01-01'),
      warrantyExpiry: Random.date('yyyy-MM-dd', '2026-12-31', '2024-06-01'),
      status: Random.pick(statuses),
      location: Random.pick(locations),
      responsiblePerson: Random.pick(persons),
      lastMaintenanceDate: Random.date('yyyy-MM-dd'),
      nextMaintenanceDate: Random.date('yyyy-MM-dd', '2024-12-31', '2024-05-01'),
      maintenanceCycle: Random.integer(30, 180),
      faultCount: Random.integer(0, 15),
      createdAt: Random.date('yyyy-MM-dd HH:mm:ss'),
    })
  }
  return equipment
}

const generateMaintenanceRecords = (count: number): MaintenanceRecord[] => {
  const records: MaintenanceRecord[] = []
  const types: MaintenanceRecord['type'][] = ['preventive', 'corrective', 'emergency']
  const statuses: MaintenanceRecord['status'][] = ['scheduled', 'in-progress', 'completed', 'cancelled']
  const operators = ['钱技术', '孙维修', '李工程师', '王师傅']
  const materials = ['润滑油', '密封圈', '轴承', '滤芯', '灯泡', '保险丝']
  
  for (let i = 0; i < count; i++) {
    records.push({
      id: `MR${String(i + 1).padStart(8, '0')}`,
      equipmentId: `EQ${String(Random.integer(1, 100)).padStart(8, '0')}`,
      equipmentName: `设备 ${Random.integer(1, 100)}`,
      type: Random.pick(types),
      status: Random.pick(statuses),
      scheduledTime: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      startTime: Random.boolean(0.8) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      endTime: Random.boolean(0.6) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      operator: Random.pick(operators),
      description: '定期维护保养，检查设备运行状态，更换易损件，确保设备正常运行。',
      materials: Random.boolean(0.7) ? [
        { name: Random.pick(materials), quantity: Random.integer(1, 10), unit: '个' },
        { name: Random.pick(materials), quantity: Random.integer(1, 5), unit: '套' },
      ] : [],
      cost: Random.float(100, 5000, 2, 2),
      notes: Random.boolean(0.3) ? '设备运行良好，无异常情况。' : '',
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
    })
  }
  return records
}

const generateFaultReports = (count: number): FaultReport[] => {
  const reports: FaultReport[] = []
  const titles = ['电梯故障停运', '显示屏黑屏', '空调制冷异常', '行李分拣机卡滞', '安检门报警异常', '广播系统杂音']
  const severities: FaultReport['severity'][] = ['low', 'medium', 'high', 'critical']
  const statuses: FaultReport['status'][] = ['reported', 'assigned', 'repairing', 'verified', 'closed']
  const reporters = ['张员工', '李员工', '王员工', '赵员工']
  const assignees = ['钱技术', '孙维修', '李工程师', '王师傅']
  
  for (let i = 0; i < count; i++) {
    reports.push({
      id: `FR${String(i + 1).padStart(8, '0')}`,
      equipmentId: `EQ${String(Random.integer(1, 100)).padStart(8, '0')}`,
      equipmentName: `设备 ${Random.integer(1, 100)}`,
      reporter: Random.pick(reporters),
      reporterPhone: `1${Random.integer(3, 9)}${Random.string('number', 9)}`,
      faultDescription: Random.pick(titles),
      severity: Random.pick(severities),
      status: Random.pick(statuses),
      assignee: Random.boolean(0.8) ? Random.pick(assignees) : null,
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      assignedAt: Random.boolean(0.8) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      closedAt: Random.boolean(0.5) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      photos: [],
      repairDetails: Random.boolean(0.6) ? '已更换故障部件，设备恢复正常运行。' : '',
      repairCost: Random.boolean(0.5) ? Random.float(500, 10000, 2, 2) : 0,
    })
  }
  return reports
}

const generateComplaints = (count: number): Complaint[] => {
  const complaints: Complaint[] = []
  const types: Complaint['type'][] = ['service', 'luggage', 'facility', 'staff', 'other']
  const statuses: Complaint['status'][] = ['pending', 'assigned', 'processing', 'resolved', 'closed']
  const assignees = ['王服务', '张专员', '李客服']
  const contents = [
    '值机排队时间太长',
    '行李提取等待时间过长',
    '卫生间卫生状况差',
    '服务人员态度不好',
    '航班延误未及时通知',
    '座椅损坏未及时维修',
  ]
  
  for (let i = 0; i < count; i++) {
    complaints.push({
      id: `CP${String(i + 1).padStart(8, '0')}`,
      passengerName: Random.cname(),
      passengerPhone: `1${Random.integer(3, 9)}${Random.string('number', 9)}`,
      flightNo: `${Random.pick(airlines).charAt(0)}${Random.integer(1000, 9999)}`,
      type: Random.pick(types),
      status: Random.pick(statuses),
      content: Random.pick(contents),
      assignee: Random.boolean(0.7) ? Random.pick(assignees) : null,
      response: Random.boolean(0.6) ? '感谢您的反馈，我们已记录并将尽快处理。' : '',
      createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      resolvedAt: Random.boolean(0.5) ? Random.datetime('yyyy-MM-dd HH:mm:ss') : null,
      satisfactionScore: Random.boolean(0.4) ? Random.integer(1, 5) : null,
    })
  }
  return complaints
}

const mockData = {
  users,
  roles,
  flights: generateFlights(100),
  passengers: generatePassengers(200),
  baggage: generateBaggage(300),
  resources: generateResources(),
  operationLogs: generateOperationLogs(500),
  securityChecks: generateSecurityChecks(50),
  hiddenDangers: generateHiddenDangers(30),
  emergencyPlans: generateEmergencyPlans(),
  emergencyIncidents: generateEmergencyIncidents(10),
  equipment: generateEquipment(100),
  maintenanceRecords: generateMaintenanceRecords(80),
  faultReports: generateFaultReports(40),
  complaints: generateComplaints(60),
}

Mock.setup({
  timeout: '200-600',
})

Mock.mock('/api/auth/login', 'post', (options: { body: string }) => {
  const { username, password } = JSON.parse(options.body)
  
  const user = users.find(u => u.username === username)
  
  if (user && password === '123456') {
    const role = roles.find(r => r.id === user.roleId)
    return {
      code: 200,
      data: {
        user,
        token: `token_${Date.now()}_${Random.string('alphanumeric', 32)}`,
        permissions: role?.permissions || [],
      },
      message: '登录成功',
    }
  }
  
  return {
    code: 401,
    message: '用户名或密码错误',
  }
})

Mock.mock('/api/auth/me', 'get', () => {
  return {
    code: 200,
    data: users[0],
    message: 'success',
  }
})

Mock.mock(/\/api\/users(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: users,
      total: users.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock('/api/users', 'post', (options: { body: string }) => {
  const newUser: User = {
    ...JSON.parse(options.body),
    id: String(users.length + 1),
    createdAt: new Date().toISOString(),
    lastLogin: '',
  }
  users.push(newUser)
  return {
    code: 200,
    data: newUser,
    message: '创建成功',
  }
})

Mock.mock(/\/api\/users\/\d+$/, 'put', (options: { url: string; body: string }) => {
  const id = options.url.split('/').pop()
  const index = users.findIndex(u => u.id === id)
  if (index > -1) {
    users[index] = { ...users[index], ...JSON.parse(options.body) }
    return {
      code: 200,
      data: users[index],
      message: '更新成功',
    }
  }
  return {
    code: 404,
    message: '用户不存在',
  }
})

Mock.mock(/\/api\/users\/\d+$/, 'delete', (options: { url: string }) => {
  const id = options.url.split('/').pop()
  const index = users.findIndex(u => u.id === id)
  if (index > -1) {
    users.splice(index, 1)
    return {
      code: 200,
      message: '删除成功',
    }
  }
  return {
    code: 404,
    message: '用户不存在',
  }
})

Mock.mock(/\/api\/roles(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: roles,
      total: roles.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/operation-logs(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.operationLogs,
      total: mockData.operationLogs.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/flights(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.flights,
      total: mockData.flights.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/flights\/\w+$/, 'get', (options: { url: string }) => {
  const id = options.url.split('/').pop()
  const flight = mockData.flights.find(f => f.id === id)
  if (flight) {
    return {
      code: 200,
      data: flight,
      message: 'success',
    }
  }
  return {
    code: 404,
    message: '航班不存在',
  }
})

Mock.mock(/\/api\/passengers(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.passengers,
      total: mockData.passengers.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/baggage(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.baggage,
      total: mockData.baggage.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/baggage\/\w+$/, 'get', (options: { url: string }) => {
  const id = options.url.split('/').pop()
  const baggage = mockData.baggage.find(b => b.id === id)
  if (baggage) {
    return {
      code: 200,
      data: baggage,
      message: 'success',
    }
  }
  return {
    code: 404,
    message: '行李不存在',
  }
})

Mock.mock(/\/api\/resources(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.resources,
      total: mockData.resources.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/security-checks(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.securityChecks,
      total: mockData.securityChecks.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/hidden-dangers(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.hiddenDangers,
      total: mockData.hiddenDangers.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/emergency-plans(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.emergencyPlans,
      total: mockData.emergencyPlans.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/emergency-incidents(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.emergencyIncidents,
      total: mockData.emergencyIncidents.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/equipment(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.equipment,
      total: mockData.equipment.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/maintenance-records(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.maintenanceRecords,
      total: mockData.maintenanceRecords.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/fault-reports(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.faultReports,
      total: mockData.faultReports.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock(/\/api\/complaints(\?.*)?$/, 'get', () => {
  return {
    code: 200,
    data: {
      list: mockData.complaints,
      total: mockData.complaints.length,
      page: 1,
      pageSize: 10,
    },
    message: 'success',
  }
})

Mock.mock('/api/statistics', 'get', () => {
  const totalFlights = mockData.flights.length
  const onTimeFlights = mockData.flights.filter(f => f.status === 'scheduled' || f.status === 'departed' || f.status === 'arrived').length
  const delayedFlights = mockData.flights.filter(f => f.status === 'delayed').length
  const cancelledFlights = mockData.flights.filter(f => f.status === 'cancelled').length
  
  const totalPassengers = mockData.passengers.length
  const checkedPassengers = mockData.passengers.filter(p => p.checkInStatus !== 'pending').length
  
  const totalBaggage = mockData.baggage.length
  const abnormalBaggage = mockData.baggage.filter(b => b.status === 'lost' || b.status === 'damaged').length
  
  const gateResources = mockData.resources.filter(r => r.type === 'gate')
  const standResources = mockData.resources.filter(r => r.type === 'stand')
  const bridgeResources = mockData.resources.filter(r => r.type === 'bridge')
  
  const securityIncidents = mockData.hiddenDangers.filter(d => d.level === 'critical' || d.level === 'high').length
  const equipmentFaults = mockData.faultReports.filter(f => f.status !== 'closed').length
  const activeEmergencies = mockData.emergencyIncidents.filter(e => e.status === 'triggered' || e.status === 'handling').length
  
  return {
    code: 200,
    data: {
      totalFlights,
      onTimeFlights,
      delayedFlights,
      cancelledFlights,
      totalPassengers,
      checkedPassengers,
      totalBaggage,
      abnormalBaggage,
      resourceUtilization: {
        gate: Math.round((gateResources.filter(r => r.status === 'occupied').length / gateResources.length) * 100),
        stand: Math.round((standResources.filter(r => r.status === 'occupied').length / standResources.length) * 100),
        bridge: Math.round((bridgeResources.filter(r => r.status === 'occupied').length / bridgeResources.length) * 100),
      },
      securityIncidents,
      equipmentFaults,
      activeEmergencies,
    },
    message: 'success',
  }
})

export default mockData
