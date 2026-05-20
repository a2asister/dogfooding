export const toolboxCategories = {
  beginner: [
    {
      kind: 'category',
      name: '📢 输出',
      colour: '#5C6BC0',
      contents: [
        { kind: 'block', type: 'print_text' },
        { kind: 'block', type: 'ask_question' },
      ],
    },
    {
      kind: 'category',
      name: '🔄 循环',
      colour: '#00A65A',
      contents: [
        { kind: 'block', type: 'repeat_times' },
      ],
    },
    {
      kind: 'category',
      name: '🔢 数字',
      colour: '#FF6680',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_add' },
        { kind: 'block', type: 'math_subtract' },
      ],
    },
    {
      kind: 'category',
      name: '⏱️ 控制',
      colour: '#3366CC',
      contents: [
        { kind: 'block', type: 'wait_seconds' },
      ],
    },
  ],
  basic: [
    {
      kind: 'category',
      name: '📢 输出',
      colour: '#5C6BC0',
      contents: [
        { kind: 'block', type: 'print_text' },
        { kind: 'block', type: 'ask_question' },
        { kind: 'block', type: 'text_join' },
        { kind: 'block', type: 'text_length' },
      ],
    },
    {
      kind: 'category',
      name: '📦 变量',
      colour: '#FF8C00',
      contents: [
        { kind: 'block', type: 'set_variable' },
        { kind: 'block', type: 'get_variable' },
      ],
    },
    {
      kind: 'category',
      name: '🔄 循环',
      colour: '#00A65A',
      contents: [
        { kind: 'block', type: 'repeat_times' },
      ],
    },
    {
      kind: 'category',
      name: '🔀 条件',
      colour: '#D147BD',
      contents: [
        { kind: 'block', type: 'if_condition' },
        { kind: 'block', type: 'if_else_condition' },
      ],
    },
    {
      kind: 'category',
      name: '🔢 运算',
      colour: '#FF6680',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_add' },
        { kind: 'block', type: 'math_subtract' },
        { kind: 'block', type: 'math_multiply' },
        { kind: 'block', type: 'math_divide' },
        { kind: 'block', type: 'math_modulo' },
      ],
    },
    {
      kind: 'category',
      name: '⚖️ 比较',
      colour: '#4C97FF',
      contents: [
        { kind: 'block', type: 'compare_equals' },
        { kind: 'block', type: 'compare_greater' },
        { kind: 'block', type: 'compare_less' },
      ],
    },
    {
      kind: 'category',
      name: '⏱️ 控制',
      colour: '#3366CC',
      contents: [
        { kind: 'block', type: 'wait_seconds' },
      ],
    },
  ],
  advanced: [
    {
      kind: 'category',
      name: '📢 输出',
      colour: '#5C6BC0',
      contents: [
        { kind: 'block', type: 'print_text' },
        { kind: 'block', type: 'ask_question' },
        { kind: 'block', type: 'text_join' },
        { kind: 'block', type: 'text_length' },
      ],
    },
    {
      kind: 'category',
      name: '📦 变量',
      colour: '#FF8C00',
      contents: [
        { kind: 'block', type: 'set_variable' },
        { kind: 'block', type: 'get_variable' },
      ],
    },
    {
      kind: 'category',
      name: '🔄 循环',
      colour: '#00A65A',
      contents: [
        { kind: 'block', type: 'repeat_times' },
      ],
    },
    {
      kind: 'category',
      name: '🔀 条件',
      colour: '#D147BD',
      contents: [
        { kind: 'block', type: 'if_condition' },
        { kind: 'block', type: 'if_else_condition' },
      ],
    },
    {
      kind: 'category',
      name: '🔢 运算',
      colour: '#FF6680',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_add' },
        { kind: 'block', type: 'math_subtract' },
        { kind: 'block', type: 'math_multiply' },
        { kind: 'block', type: 'math_divide' },
        { kind: 'block', type: 'math_modulo' },
      ],
    },
    {
      kind: 'category',
      name: '⚖️ 比较',
      colour: '#4C97FF',
      contents: [
        { kind: 'block', type: 'compare_equals' },
        { kind: 'block', type: 'compare_greater' },
        { kind: 'block', type: 'compare_less' },
        { kind: 'block', type: 'logic_and' },
        { kind: 'block', type: 'logic_or' },
        { kind: 'block', type: 'logic_not' },
      ],
    },
    {
      kind: 'category',
      name: '🐢 绘图',
      colour: '#00A65A',
      contents: [
        { kind: 'block', type: 'turtle_move' },
        { kind: 'block', type: 'turtle_turn' },
        { kind: 'block', type: 'turtle_pen' },
        { kind: 'block', type: 'turtle_color' },
        { kind: 'block', type: 'turtle_reset' },
      ],
    },
    {
      kind: 'category',
      name: '⏱️ 控制',
      colour: '#3366CC',
      contents: [
        { kind: 'block', type: 'wait_seconds' },
      ],
    },
  ],
};

export const getToolbox = (level: 'beginner' | 'basic' | 'advanced' = 'basic') => {
  return {
    kind: 'categoryToolbox',
    contents: toolboxCategories[level],
  };
};
