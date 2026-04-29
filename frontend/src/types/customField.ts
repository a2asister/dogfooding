export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'date' 
  | 'datetime' 
  | 'user' 
  | 'users' 
  | 'version' 
  | 'versions' 
  | 'module' 
  | 'modules' 
  | 'checkbox' 
  | 'radio' 
  | 'url' 
  | 'attachment'
  | 'labels'
  | 'cascading'

export interface FieldOption {
  id: string
  value: string
  label: string
  color?: string
  disabled?: boolean
  children?: FieldOption[]
}

export interface FieldValidator {
  type: 'required' | 'min' | 'max' | 'min_length' | 'max_length' | 'pattern' | 'custom'
  value?: unknown
  message?: string
}

export interface FieldConfiguration {
  defaultValue?: unknown
  placeholder?: string
  helpText?: string
  options?: FieldOption[]
  validators?: FieldValidator[]
  isMultiple?: boolean
  dateFormat?: string
  numberFormat?: string
  minValue?: number
  maxValue?: number
  minLength?: number
  maxLength?: number
  allowCustomValues?: boolean
  cascadingLevels?: number
}

export interface CustomField {
  id: string
  projectId: string
  name: string
  key: string
  description?: string
  fieldType: FieldType
  configuration: FieldConfiguration
  isRequired: boolean
  isSearchable: boolean
  isSortable: boolean
  isActive: boolean
  applicableIssueTypeIds: string[]
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface CustomFieldCreateInput {
  name: string
  key: string
  description?: string
  fieldType: FieldType
  configuration?: FieldConfiguration
  isRequired?: boolean
  isSearchable?: boolean
  isSortable?: boolean
  applicableIssueTypeIds?: string[]
}

export interface CustomFieldValue {
  fieldId: string
  value: unknown
}

export interface FieldConfigSchema {
  type: FieldType
  label: string
  icon: string
  supportsMultiple: boolean
  supportsRequired: boolean
  supportsSearch: boolean
  supportsSort: boolean
  requiresOptions: boolean
}

export const FIELD_TYPE_SCHEMAS: FieldConfigSchema[] = [
  { type: 'text', label: '单行文本', icon: 'FontSizeOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: false },
  { type: 'textarea', label: '多行文本', icon: 'AlignLeftOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: false, requiresOptions: false },
  { type: 'number', label: '数字', icon: 'NumberOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: false },
  { type: 'select', label: '单选下拉', icon: 'DownOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: true },
  { type: 'multiselect', label: '多选下拉', icon: 'CheckSquareOutlined', supportsMultiple: true, supportsRequired: true, supportsSearch: true, supportsSort: false, requiresOptions: true },
  { type: 'radio', label: '单选框', icon: 'DotChartOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: true },
  { type: 'checkbox', label: '多选框', icon: 'CheckSquareOutlined', supportsMultiple: true, supportsRequired: true, supportsSearch: true, supportsSort: false, requiresOptions: true },
  { type: 'date', label: '日期', icon: 'CalendarOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: false },
  { type: 'datetime', label: '日期时间', icon: 'ClockCircleOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: false },
  { type: 'user', label: '用户选择', icon: 'UserOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: false },
  { type: 'users', label: '多用户选择', icon: 'TeamOutlined', supportsMultiple: true, supportsRequired: true, supportsSearch: true, supportsSort: false, requiresOptions: false },
  { type: 'version', label: '版本', icon: 'TagOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: false },
  { type: 'versions', label: '多版本', icon: 'TagsOutlined', supportsMultiple: true, supportsRequired: true, supportsSearch: true, supportsSort: false, requiresOptions: false },
  { type: 'module', label: '模块', icon: 'AppstoreOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: false },
  { type: 'modules', label: '多模块', icon: 'AppstoreOutlined', supportsMultiple: true, supportsRequired: true, supportsSearch: true, supportsSort: false, requiresOptions: false },
  { type: 'url', label: 'URL链接', icon: 'LinkOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: false },
  { type: 'attachment', label: '附件', icon: 'PaperClipOutlined', supportsMultiple: true, supportsRequired: false, supportsSearch: false, supportsSort: false, requiresOptions: false },
  { type: 'labels', label: '标签', icon: 'TagOutlined', supportsMultiple: true, supportsRequired: false, supportsSearch: true, supportsSort: false, requiresOptions: false },
  { type: 'cascading', label: '级联选择', icon: 'ApartmentOutlined', supportsMultiple: false, supportsRequired: true, supportsSearch: true, supportsSort: true, requiresOptions: true },
]
