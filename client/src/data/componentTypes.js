export const componentTypes = [
  {
    group: '基础组件',
    items: [
      {
        type: 'input',
        label: '单行文本',
        icon: 'Edit',
        defaultConfig: {
          type: 'input',
          label: '单行文本',
          placeholder: '请输入',
          defaultValue: ''
        }
      },
      {
        type: 'textarea',
        label: '多行文本',
        icon: 'Document',
        defaultConfig: {
          type: 'textarea',
          label: '多行文本',
          placeholder: '请输入',
          defaultValue: '',
          props: {
            rows: 4
          }
        }
      },
      {
        type: 'inputNumber',
        label: '数字输入',
        icon: 'Coin',
        defaultConfig: {
          type: 'inputNumber',
          label: '数字输入',
          defaultValue: null,
          props: {
            min: null,
            max: null,
            step: 1
          }
        }
      },
      {
        type: 'select',
        label: '下拉选择',
        icon: 'ArrowDown',
        defaultConfig: {
          type: 'select',
          label: '下拉选择',
          placeholder: '请选择',
          defaultValue: '',
          options: [
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' }
          ]
        }
      },
      {
        type: 'radio',
        label: '单选框',
        icon: 'CircleCheckFilled',
        defaultConfig: {
          type: 'radio',
          label: '单选框',
          defaultValue: '',
          options: [
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' }
          ]
        }
      },
      {
        type: 'checkbox',
        label: '多选框',
        icon: 'CircleCheck',
        defaultConfig: {
          type: 'checkbox',
          label: '多选框',
          defaultValue: [],
          options: [
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' }
          ]
        }
      },
      {
        type: 'switch',
        label: '开关',
        icon: 'Switch',
        defaultConfig: {
          type: 'switch',
          label: '开关',
          defaultValue: false
        }
      },
      {
        type: 'slider',
        label: '滑块',
        icon: 'Minus',
        defaultConfig: {
          type: 'slider',
          label: '滑块',
          defaultValue: 0,
          props: {
            min: 0,
            max: 100,
            step: 1
          }
        }
      }
    ]
  },
  {
    group: '日期时间',
    items: [
      {
        type: 'date',
        label: '日期选择',
        icon: 'Calendar',
        defaultConfig: {
          type: 'date',
          label: '日期选择',
          placeholder: '请选择日期',
          defaultValue: '',
          props: {
            format: 'YYYY-MM-DD'
          }
        }
      },
      {
        type: 'time',
        label: '时间选择',
        icon: 'Timer',
        defaultConfig: {
          type: 'time',
          label: '时间选择',
          placeholder: '请选择时间',
          defaultValue: '',
          props: {
            format: 'HH:mm:ss'
          }
        }
      },
      {
        type: 'dateTime',
        label: '日期时间',
        icon: 'Clock',
        defaultConfig: {
          type: 'dateTime',
          label: '日期时间',
          placeholder: '请选择日期时间',
          defaultValue: '',
          props: {
            format: 'YYYY-MM-DD HH:mm:ss'
          }
        }
      },
      {
        type: 'dateRange',
        label: '日期范围',
        icon: 'Calendar',
        defaultConfig: {
          type: 'dateRange',
          label: '日期范围',
          placeholder: ['开始日期', '结束日期'],
          defaultValue: [],
          props: {
            format: 'YYYY-MM-DD'
          }
        }
      }
    ]
  },
  {
    group: '高级组件',
    items: [
      {
        type: 'rate',
        label: '评分',
        icon: 'Star',
        defaultConfig: {
          type: 'rate',
          label: '评分',
          defaultValue: 0,
          props: {
            max: 5
          }
        }
      },
      {
        type: 'color',
        label: '颜色选择',
        icon: 'Operation',
        defaultConfig: {
          type: 'color',
          label: '颜色选择',
          defaultValue: ''
        }
      },
      {
        type: 'upload',
        label: '文件上传',
        icon: 'UploadFilled',
        defaultConfig: {
          type: 'upload',
          label: '文件上传',
          defaultValue: [],
          props: {
            multiple: true,
            limit: 5,
            accept: ''
          }
        }
      },
      {
        type: 'image',
        label: '图片上传',
        icon: 'Picture',
        defaultConfig: {
          type: 'image',
          label: '图片上传',
          defaultValue: [],
          props: {
            multiple: true,
            limit: 9
          }
        }
      }
    ]
  },
  {
    group: '数据联动',
    items: [
      {
        type: 'cascade',
        label: '级联选择',
        icon: 'Share',
        defaultConfig: {
          type: 'cascade',
          label: '级联选择',
          placeholder: '请选择',
          defaultValue: [],
          options: [],
          cascadeConfig: {
            level: 2,
            dependency: []
          }
        }
      },
      {
        type: 'subForm',
        label: '子表单',
        icon: 'FolderOpened',
        defaultConfig: {
          type: 'subForm',
          label: '子表单',
          defaultValue: [],
          subForm: {
            minRows: 0,
            maxRows: 10,
            fields: []
          }
        }
      },
      {
        type: 'relatedForm',
        label: '关联表单',
        icon: 'Link',
        defaultConfig: {
          type: 'relatedForm',
          label: '关联表单',
          placeholder: '请选择关联数据',
          defaultValue: '',
          relatedForm: {
            formId: '',
            displayField: '',
            valueField: '',
            queryField: ''
          }
        }
      }
    ]
  },
  {
    group: '布局组件',
    items: [
      {
        type: 'divider',
        label: '分割线',
        icon: 'Minus',
        defaultConfig: {
          type: 'divider',
          label: '分割线',
          props: {
            contentPosition: 'center'
          }
        }
      }
    ]
  }
]

export const getDefaultField = (type) => {
  for (const group of componentTypes) {
    const item = group.items.find(i => i.type === type)
    if (item) {
      return JSON.parse(JSON.stringify(item.defaultConfig))
    }
  }
  return null
}

export const getComponentInfo = (type) => {
  for (const group of componentTypes) {
    const item = group.items.find(i => i.type === type)
    if (item) {
      return item
    }
  }
  return null
}
