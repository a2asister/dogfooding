export interface User {
  id: string
  username: string
  name: string
  role: string
  roleId: string
  department: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin: string
}

export interface Role {
  id: string
  name: string
  code: string
  description: string
  permissions: string[]
  createdAt: string
  status: 'active' | 'inactive'
}

export interface OperationLog {
  id: string
  userId: string
  username: string
  action: string
  module: string
  description: string
  ip: string
  createdAt: string
  details: Record<string, unknown>
}

export interface Flight {
  id: string
  flightNo: string
  airline: string
  aircraftType: string
  registration: string
  departureAirport: string
  arrivalAirport: string
  scheduledDeparture: string
  scheduledArrival: string
  actualDeparture: string | null
  actualArrival: string | null
  estimatedDeparture: string
  estimatedArrival: string
  status: 'scheduled' | 'delayed' | 'cancelled' | 'diverted' | 'boarding' | 'departed' | 'arrived'
  gate: string
  stand: string
  terminal: string
  passengerCount: number
  isArchive: boolean
  createdAt: string
  updatedAt: string
}

export interface Passenger {
  id: string
  name: string
  idCard: string
  passport: string
  phone: string
  email: string
  nationality: string
  gender: 'male' | 'female'
  birthDate: string
  flightId: string
  flightNo: string
  seatNo: string
  seatClass: 'economy' | 'business' | 'first'
  checkInStatus: 'pending' | 'checked' | 'boarded'
  boardingStatus: boolean
  boardingTime: string | null
  specialService: string[]
  createdAt: string
}

export interface Baggage {
  id: string
  tagNo: string
  passengerId: string
  passengerName: string
  flightId: string
  flightNo: string
  weight: number
  type: 'checked' | 'carry-on'
  status: 'check-in' | 'loaded' | 'unloaded' | 'transit' | 'delivered' | 'lost' | 'damaged'
  currentLocation: string
  history: BaggageHistory[]
  createdAt: string
  updatedAt: string
}

export interface BaggageHistory {
  id: string
  location: string
  action: string
  operator: string
  timestamp: string
  note: string
}

export interface Resource {
  id: string
  type: 'gate' | 'stand' | 'bridge'
  code: string
  name: string
  terminal: string
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  currentFlight: string | null
  currentFlightNo: string | null
  nextFlight: string | null
  nextFlightNo: string | null
  capacity: number
  equipment: string[]
  lastMaintenance: string
  nextMaintenance: string
}

export interface Schedule {
  id: string
  resourceId: string
  resourceCode: string
  flightId: string
  flightNo: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  operator: string
  notes: string
}

export interface SecurityCheck {
  id: string
  area: string
  checkItem: string
  inspector: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  startTime: string
  endTime: string | null
  findings: string[]
  photos: string[]
  createdAt: string
}

export interface HiddenDanger {
  id: string
  title: string
  description: string
  level: 'low' | 'medium' | 'high' | 'critical'
  area: string
  reporter: string
  reporterPhone: string
  status: 'reported' | 'assigned' | 'processing' | 'verified' | 'closed'
  assignee: string | null
  handler: string | null
  createdAt: string
  assignedAt: string | null
  closedAt: string | null
  photos: string[]
  comments: {
    id: string
    user: string
    content: string
    createdAt: string
  }[]
}

export interface EmergencyPlan {
  id: string
  name: string
  type: 'fire' | 'medical' | 'security' | 'natural' | 'other'
  level: 'level1' | 'level2' | 'level3' | 'level4'
  description: string
  triggerConditions: string[]
  responseTeams: string[]
  contactList: {
    name: string
    role: string
    phone: string
  }[]
  procedures: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmergencyIncident {
  id: string
  title: string
  planId: string
  planName: string
  location: string
  description: string
  level: 'level1' | 'level2' | 'level3' | 'level4'
  status: 'triggered' | 'handling' | 'resolved' | 'closed'
  triggerTime: string
  resolvedTime: string | null
  closedTime: string | null
  commander: string
  teams: string[]
  updates: {
    id: string
    user: string
    content: string
    createdAt: string
  }[]
  attachments: string[]
}

export interface Equipment {
  id: string
  code: string
  name: string
  category: string
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  warrantyExpiry: string
  status: 'normal' | 'maintenance' | 'fault' | 'scrapped'
  location: string
  responsiblePerson: string
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  maintenanceCycle: number
  faultCount: number
  createdAt: string
}

export interface MaintenanceRecord {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'preventive' | 'corrective' | 'emergency'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  scheduledTime: string
  startTime: string | null
  endTime: string | null
  operator: string
  description: string
  materials: {
    name: string
    quantity: number
    unit: string
  }[]
  cost: number
  notes: string
  createdAt: string
}

export interface FaultReport {
  id: string
  equipmentId: string
  equipmentName: string
  reporter: string
  reporterPhone: string
  faultDescription: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'reported' | 'assigned' | 'repairing' | 'verified' | 'closed'
  assignee: string | null
  createdAt: string
  assignedAt: string | null
  closedAt: string | null
  photos: string[]
  repairDetails: string
  repairCost: number
}

export interface Statistics {
  totalFlights: number
  onTimeFlights: number
  delayedFlights: number
  cancelledFlights: number
  totalPassengers: number
  checkedPassengers: number
  totalBaggage: number
  abnormalBaggage: number
  resourceUtilization: {
    gate: number
    stand: number
    bridge: number
  }
  securityIncidents: number
  equipmentFaults: number
  activeEmergencies: number
}

export interface Complaint {
  id: string
  passengerName: string
  passengerPhone: string
  flightNo: string
  type: 'service' | 'luggage' | 'facility' | 'staff' | 'other'
  status: 'pending' | 'assigned' | 'processing' | 'resolved' | 'closed'
  content: string
  assignee: string | null
  response: string
  createdAt: string
  resolvedAt: string | null
  satisfactionScore: number | null
}
