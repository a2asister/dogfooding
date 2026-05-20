import { javascriptGenerator } from 'blockly/javascript';
import * as Blockly from 'blockly';

export const initJavascriptGenerator = () => {
  javascriptGenerator.forBlock['print_text'] = function(block: Blockly.Block) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_NONE) || '""';
    return `console.log(${text});\n`;
  };

  javascriptGenerator.forBlock['ask_question'] = function(block: Blockly.Block) {
    const question = javascriptGenerator.valueToCode(block, 'QUESTION', javascriptGenerator.ORDER_NONE) || '""';
    return [`prompt(${question})`, javascriptGenerator.ORDER_FUNCTION_CALL];
  };

  javascriptGenerator.forBlock['set_variable'] = function(block: Blockly.Block) {
    const varName = block.getFieldValue('VAR_NAME');
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ASSIGNMENT) || 'null';
    return `let ${varName} = ${value};\n`;
  };

  javascriptGenerator.forBlock['get_variable'] = function(block: Blockly.Block) {
    const varName = block.getFieldValue('VAR_NAME');
    return [varName, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['repeat_times'] = function(block: Blockly.Block) {
    const times = block.getFieldValue('TIMES');
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    return `for (let i = 0; i < ${times}; i++) {\n${branch}}\n`;
  };

  javascriptGenerator.forBlock['if_condition'] = function(block: Blockly.Block) {
    const condition = javascriptGenerator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_NONE) || 'false';
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    return `if (${condition}) {\n${branch}}\n`;
  };

  javascriptGenerator.forBlock['if_else_condition'] = function(block: Blockly.Block) {
    const condition = javascriptGenerator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_NONE) || 'false';
    const branch = javascriptGenerator.statementToCode(block, 'DO');
    const elseBranch = javascriptGenerator.statementToCode(block, 'ELSE');
    return `if (${condition}) {\n${branch}} else {\n${elseBranch}}\n`;
  };

  javascriptGenerator.forBlock['compare_equals'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_EQUALITY) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_EQUALITY) || '0';
    return [`${a} === ${b}`, javascriptGenerator.ORDER_EQUALITY];
  };

  javascriptGenerator.forBlock['compare_greater'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_RELATIONAL) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_RELATIONAL) || '0';
    return [`${a} > ${b}`, javascriptGenerator.ORDER_RELATIONAL];
  };

  javascriptGenerator.forBlock['compare_less'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_RELATIONAL) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_RELATIONAL) || '0';
    return [`${a} < ${b}`, javascriptGenerator.ORDER_RELATIONAL];
  };

  javascriptGenerator.forBlock['logic_and'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_LOGICAL_AND) || 'false';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_LOGICAL_AND) || 'false';
    return [`${a} && ${b}`, javascriptGenerator.ORDER_LOGICAL_AND];
  };

  javascriptGenerator.forBlock['logic_or'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_LOGICAL_OR) || 'false';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_LOGICAL_OR) || 'false';
    return [`${a} || ${b}`, javascriptGenerator.ORDER_LOGICAL_OR];
  };

  javascriptGenerator.forBlock['logic_not'] = function(block: Blockly.Block) {
    const bool = javascriptGenerator.valueToCode(block, 'BOOL', javascriptGenerator.ORDER_LOGICAL_NOT) || 'false';
    return [`!${bool}`, javascriptGenerator.ORDER_LOGICAL_NOT];
  };

  javascriptGenerator.forBlock['math_number'] = function(block: Blockly.Block) {
    const num = block.getFieldValue('NUM');
    return [String(num), javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator.forBlock['math_add'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_ADDITION) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_ADDITION) || '0';
    return [`${a} + ${b}`, javascriptGenerator.ORDER_ADDITION];
  };

  javascriptGenerator.forBlock['math_subtract'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_SUBTRACTION) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_SUBTRACTION) || '0';
    return [`${a} - ${b}`, javascriptGenerator.ORDER_SUBTRACTION];
  };

  javascriptGenerator.forBlock['math_multiply'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_MULTIPLICATION) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_MULTIPLICATION) || '0';
    return [`${a} * ${b}`, javascriptGenerator.ORDER_MULTIPLICATION];
  };

  javascriptGenerator.forBlock['math_divide'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_DIVISION) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_DIVISION) || '1';
    return [`${a} / ${b}`, javascriptGenerator.ORDER_DIVISION];
  };

  javascriptGenerator.forBlock['math_modulo'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_MODULUS) || '0';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_MODULUS) || '1';
    return [`${a} % ${b}`, javascriptGenerator.ORDER_MODULUS];
  };

  javascriptGenerator.forBlock['text_join'] = function(block: Blockly.Block) {
    const a = javascriptGenerator.valueToCode(block, 'A', javascriptGenerator.ORDER_ADDITION) || '""';
    const b = javascriptGenerator.valueToCode(block, 'B', javascriptGenerator.ORDER_ADDITION) || '""';
    return [`${a} + ${b}`, javascriptGenerator.ORDER_ADDITION];
  };

  javascriptGenerator.forBlock['text_length'] = function(block: Blockly.Block) {
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_FUNCTION_CALL) || '""';
    return [`${value}.length`, javascriptGenerator.ORDER_MEMBER];
  };

  javascriptGenerator.forBlock['wait_seconds'] = function(block: Blockly.Block) {
    const seconds = block.getFieldValue('SECONDS');
    return `await new Promise(resolve => setTimeout(resolve, ${seconds * 1000}));\n`;
  };

  javascriptGenerator.forBlock['turtle_move'] = function(block: Blockly.Block) {
    const steps = block.getFieldValue('STEPS');
    return `__turtle__.move(${steps});\n`;
  };

  javascriptGenerator.forBlock['turtle_turn'] = function(block: Blockly.Block) {
    const direction = block.getFieldValue('DIRECTION');
    const angle = block.getFieldValue('ANGLE');
    return `__turtle__.turn('${direction}', ${angle});\n`;
  };

  javascriptGenerator.forBlock['turtle_pen'] = function(block: Blockly.Block) {
    const state = block.getFieldValue('STATE');
    return `__turtle__.pen('${state}');\n`;
  };

  javascriptGenerator.forBlock['turtle_color'] = function(block: Blockly.Block) {
    const color = block.getFieldValue('COLOR');
    return `__turtle__.setColor('${color}');\n`;
  };

  javascriptGenerator.forBlock['turtle_reset'] = function() {
    return `__turtle__.reset();\n`;
  };
};
