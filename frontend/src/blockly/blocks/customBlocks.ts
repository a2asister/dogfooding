import * as Blockly from 'blockly';

export const initCustomBlocks = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'print_text',
      message0: '说出 %1',
      args0: [
        {
          type: 'input_value',
          name: 'TEXT',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#5C6BC0',
      tooltip: '输出文字到屏幕',
      helpUrl: '',
    },
    {
      type: 'ask_question',
      message0: '询问并等待 %1',
      args0: [
        {
          type: 'input_value',
          name: 'QUESTION',
        },
      ],
      output: 'String',
      colour: '#5C6BC0',
      tooltip: '弹出输入框让用户输入内容',
      helpUrl: '',
    },
    {
      type: 'set_variable',
      message0: '设置 %1 为 %2',
      args0: [
        {
          type: 'field_input',
          name: 'VAR_NAME',
          text: '变量名',
        },
        {
          type: 'input_value',
          name: 'VALUE',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#FF8C00',
      tooltip: '创建或修改变量',
      helpUrl: '',
    },
    {
      type: 'get_variable',
      message0: '获取 %1',
      args0: [
        {
          type: 'field_input',
          name: 'VAR_NAME',
          text: '变量名',
        },
      ],
      output: null,
      colour: '#FF8C00',
      tooltip: '获取变量的值',
      helpUrl: '',
    },
    {
      type: 'repeat_times',
      message0: '重复 %1 次',
      args0: [
        {
          type: 'field_number',
          name: 'TIMES',
          value: 10,
          min: 1,
        },
      ],
      message1: '%1',
      args1: [
        {
          type: 'input_statement',
          name: 'DO',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#00A65A',
      tooltip: '重复执行指定次数',
      helpUrl: '',
    },
    {
      type: 'if_condition',
      message0: '如果 %1 那么',
      args0: [
        {
          type: 'input_value',
          name: 'CONDITION',
          check: 'Boolean',
        },
      ],
      message1: '%1',
      args1: [
        {
          type: 'input_statement',
          name: 'DO',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#D147BD',
      tooltip: '条件判断',
      helpUrl: '',
    },
    {
      type: 'if_else_condition',
      message0: '如果 %1 那么',
      args0: [
        {
          type: 'input_value',
          name: 'CONDITION',
          check: 'Boolean',
        },
      ],
      message1: '%1',
      args1: [
        {
          type: 'input_statement',
          name: 'DO',
        },
      ],
      message2: '否则 %1',
      args2: [
        {
          type: 'input_statement',
          name: 'ELSE',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#D147BD',
      tooltip: '条件判断，否则执行其他操作',
      helpUrl: '',
    },
    {
      type: 'compare_equals',
      message0: '%1 = %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
        },
        {
          type: 'input_value',
          name: 'B',
        },
      ],
      output: 'Boolean',
      colour: '#4C97FF',
      tooltip: '判断两个值是否相等',
      helpUrl: '',
    },
    {
      type: 'compare_greater',
      message0: '%1 > %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
        },
        {
          type: 'input_value',
          name: 'B',
        },
      ],
      output: 'Boolean',
      colour: '#4C97FF',
      tooltip: '判断左边是否大于右边',
      helpUrl: '',
    },
    {
      type: 'compare_less',
      message0: '%1 < %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
        },
        {
          type: 'input_value',
          name: 'B',
        },
      ],
      output: 'Boolean',
      colour: '#4C97FF',
      tooltip: '判断左边是否小于右边',
      helpUrl: '',
    },
    {
      type: 'logic_and',
      message0: '%1 并且 %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
          check: 'Boolean',
        },
        {
          type: 'input_value',
          name: 'B',
          check: 'Boolean',
        },
      ],
      output: 'Boolean',
      colour: '#4C97FF',
      tooltip: '逻辑与',
      helpUrl: '',
    },
    {
      type: 'logic_or',
      message0: '%1 或者 %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
          check: 'Boolean',
        },
        {
          type: 'input_value',
          name: 'B',
          check: 'Boolean',
        },
      ],
      output: 'Boolean',
      colour: '#4C97FF',
      tooltip: '逻辑或',
      helpUrl: '',
    },
    {
      type: 'logic_not',
      message0: '不成立 %1',
      args0: [
        {
          type: 'input_value',
          name: 'BOOL',
          check: 'Boolean',
        },
      ],
      output: 'Boolean',
      colour: '#4C97FF',
      tooltip: '逻辑非',
      helpUrl: '',
    },
    {
      type: 'math_number',
      message0: '%1',
      args0: [
        {
          type: 'field_number',
          name: 'NUM',
          value: 0,
        },
      ],
      output: 'Number',
      colour: '#FF6680',
      tooltip: '数字',
      helpUrl: '',
    },
    {
      type: 'math_add',
      message0: '%1 + %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
          check: 'Number',
        },
        {
          type: 'input_value',
          name: 'B',
          check: 'Number',
        },
      ],
      output: 'Number',
      colour: '#FF6680',
      tooltip: '加法',
      helpUrl: '',
    },
    {
      type: 'math_subtract',
      message0: '%1 - %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
          check: 'Number',
        },
        {
          type: 'input_value',
          name: 'B',
          check: 'Number',
        },
      ],
      output: 'Number',
      colour: '#FF6680',
      tooltip: '减法',
      helpUrl: '',
    },
    {
      type: 'math_multiply',
      message0: '%1 × %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
          check: 'Number',
        },
        {
          type: 'input_value',
          name: 'B',
          check: 'Number',
        },
      ],
      output: 'Number',
      colour: '#FF6680',
      tooltip: '乘法',
      helpUrl: '',
    },
    {
      type: 'math_divide',
      message0: '%1 ÷ %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
          check: 'Number',
        },
        {
          type: 'input_value',
          name: 'B',
          check: 'Number',
        },
      ],
      output: 'Number',
      colour: '#FF6680',
      tooltip: '除法',
      helpUrl: '',
    },
    {
      type: 'math_modulo',
      message0: '%1 取余 %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
          check: 'Number',
        },
        {
          type: 'input_value',
          name: 'B',
          check: 'Number',
        },
      ],
      output: 'Number',
      colour: '#FF6680',
      tooltip: '取余数',
      helpUrl: '',
    },
    {
      type: 'text_join',
     message0: '连接 %1 %2',
      args0: [
        {
          type: 'input_value',
          name: 'A',
        },
        {
          type: 'input_value',
          name: 'B',
        },
      ],
      output: 'String',
      colour: '#5C6BC0',
      tooltip: '连接两个文本',
      helpUrl: '',
    },
    {
      type: 'text_length',
      message0: '长度 %1',
      args0: [
        {
          type: 'input_value',
          name: 'VALUE',
        },
      ],
      output: 'Number',
      colour: '#5C6BC0',
      tooltip: '获取文本长度',
      helpUrl: '',
    },
    {
      type: 'wait_seconds',
      message0: '等待 %1 秒',
      args0: [
        {
          type: 'field_number',
          name: 'SECONDS',
          value: 1,
          min: 0,
          precision: 0.1,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#3366CC',
      tooltip: '等待指定秒数',
      helpUrl: '',
    },
    {
      type: 'turtle_move',
      message0: '向前移动 %1 步',
      args0: [
        {
          type: 'field_number',
          name: 'STEPS',
          value: 100,
          min: 1,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#00A65A',
      tooltip: '让小海龟向前移动',
      helpUrl: '',
    },
    {
      type: 'turtle_turn',
      message0: '向%1转 %2 度',
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIRECTION',
          options: [
            ['左', 'left'],
            ['右', 'right'],
          ],
        },
        {
          type: 'field_number',
          name: 'ANGLE',
          value: 90,
          min: 0,
          max: 360,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#00A65A',
      tooltip: '让小海龟转向',
      helpUrl: '',
    },
    {
      type: 'turtle_pen',
      message0: '抬笔/落笔: %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'STATE',
          options: [
            ['落笔', 'down'],
            ['抬笔', 'up'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#00A65A',
      tooltip: '控制画笔状态',
      helpUrl: '',
    },
    {
      type: 'turtle_color',
      message0: '设置画笔颜色为 %1',
      args0: [
        {
          type: 'field_colour',
          name: 'COLOR',
          colour: '#ff0000',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#00A65A',
      tooltip: '设置画笔颜色',
      helpUrl: '',
    },
    {
      type: 'turtle_reset',
      message0: '清除画布',
      previousStatement: null,
      nextStatement: null,
      colour: '#00A65A',
      tooltip: '清除画布并重置小海龟位置',
      helpUrl: '',
    },
  ]);
};
