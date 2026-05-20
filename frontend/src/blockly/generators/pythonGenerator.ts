import { pythonGenerator } from 'blockly/python';
import * as Blockly from 'blockly';

export const initPythonGenerator = () => {
  pythonGenerator.forBlock['print_text'] = function(block: Blockly.Block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', pythonGenerator.ORDER_NONE) || '""';
    return `print(${text})\n`;
  };

  pythonGenerator.forBlock['ask_question'] = function(block: Blockly.Block) {
    const question = pythonGenerator.valueToCode(block, 'QUESTION', pythonGenerator.ORDER_NONE) || '""';
    return [`input(${question})`, pythonGenerator.ORDER_FUNCTION_CALL];
  };

  pythonGenerator.forBlock['set_variable'] = function(block: Blockly.Block) {
    const varName = block.getFieldValue('VAR_NAME');
    const value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ASSIGNMENT) || 'None';
    return `${varName} = ${value}\n`;
  };

  pythonGenerator.forBlock['get_variable'] = function(block: Blockly.Block) {
    const varName = block.getFieldValue('VAR_NAME');
    return [varName, pythonGenerator.ORDER_ATOMIC];
  };

  pythonGenerator.forBlock['repeat_times'] = function(block: Blockly.Block) {
    const times = block.getFieldValue('TIMES');
    const branch = pythonGenerator.statementToCode(block, 'DO');
    return `for _ in range(${times}):\n${branch}\n`;
  };

  pythonGenerator.forBlock['if_condition'] = function(block: Blockly.Block) {
    const condition = pythonGenerator.valueToCode(block, 'CONDITION', pythonGenerator.ORDER_NONE) || 'False';
    const branch = pythonGenerator.statementToCode(block, 'DO');
    return `if ${condition}:\n${branch}\n`;
  };

  pythonGenerator.forBlock['if_else_condition'] = function(block: Blockly.Block) {
    const condition = pythonGenerator.valueToCode(block, 'CONDITION', pythonGenerator.ORDER_NONE) || 'False';
    const branch = pythonGenerator.statementToCode(block, 'DO');
    const elseBranch = pythonGenerator.statementToCode(block, 'ELSE');
    return `if ${condition}:\n${branch}else:\n${elseBranch}\n`;
  };

  pythonGenerator.forBlock['compare_equals'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_EQUALITY) || '0';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_EQUALITY) || '0';
    return [`${a} == ${b}`, pythonGenerator.ORDER_EQUALITY];
  };

  pythonGenerator.forBlock['compare_greater'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_RELATIONAL) || '0';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_RELATIONAL) || '0';
    return [`${a} > ${b}`, pythonGenerator.ORDER_RELATIONAL];
  };

  pythonGenerator.forBlock['compare_less'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_RELATIONAL) || '0';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_RELATIONAL) || '0';
    return [`${a} < ${b}`, pythonGenerator.ORDER_RELATIONAL];
  };

  pythonGenerator.forBlock['logic_and'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_LOGICAL_AND) || 'False';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_LOGICAL_AND) || 'False';
    return [`${a} and ${b}`, pythonGenerator.ORDER_LOGICAL_AND];
  };

  pythonGenerator.forBlock['logic_or'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_LOGICAL_OR) || 'False';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_LOGICAL_OR) || 'False';
    return [`${a} or ${b}`, pythonGenerator.ORDER_LOGICAL_OR];
  };

  pythonGenerator.forBlock['logic_not'] = function(block: Blockly.Block) {
    const bool = pythonGenerator.valueToCode(block, 'BOOL', pythonGenerator.ORDER_LOGICAL_NOT) || 'False';
    return [`not ${bool}`, pythonGenerator.ORDER_LOGICAL_NOT];
  };

  pythonGenerator.forBlock['math_number'] = function(block: Blockly.Block) {
    const num = block.getFieldValue('NUM');
    return [String(num), pythonGenerator.ORDER_ATOMIC];
  };

  pythonGenerator.forBlock['math_add'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_ADDITIVE) || '0';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_ADDITIVE) || '0';
    return [`${a} + ${b}`, pythonGenerator.ORDER_ADDITIVE];
  };

  pythonGenerator.forBlock['math_subtract'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_ADDITIVE) || '0';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_ADDITIVE) || '0';
    return [`${a} - ${b}`, pythonGenerator.ORDER_ADDITIVE];
  };

  pythonGenerator.forBlock['math_multiply'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_MULTIPLICATIVE) || '0';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_MULTIPLICATIVE) || '0';
    return [`${a} * ${b}`, pythonGenerator.ORDER_MULTIPLICATIVE];
  };

  pythonGenerator.forBlock['math_divide'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_MULTIPLICATIVE) || '0';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_MULTIPLICATIVE) || '1';
    return [`${a} / ${b}`, pythonGenerator.ORDER_MULTIPLICATIVE];
  };

  pythonGenerator.forBlock['math_modulo'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_MULTIPLICATIVE) || '0';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_MULTIPLICATIVE) || '1';
    return [`${a} % ${b}`, pythonGenerator.ORDER_MULTIPLICATIVE];
  };

  pythonGenerator.forBlock['text_join'] = function(block: Blockly.Block) {
    const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_ADDITIVE) || '""';
    const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_ADDITIVE) || '""';
    return [`str(${a}) + str(${b})`, pythonGenerator.ORDER_ADDITIVE];
  };

  pythonGenerator.forBlock['text_length'] = function(block: Blockly.Block) {
    const value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_FUNCTION_CALL) || '""';
    return [`len(${value})`, pythonGenerator.ORDER_FUNCTION_CALL];
  };

  pythonGenerator.forBlock['wait_seconds'] = function(block: Blockly.Block) {
    const seconds = block.getFieldValue('SECONDS');
    pythonGenerator.definitions_['import_time'] = 'import time';
    return `time.sleep(${seconds})\n`;
  };

  pythonGenerator.forBlock['turtle_move'] = function(block: Blockly.Block) {
    const steps = block.getFieldValue('STEPS');
    pythonGenerator.definitions_['import_turtle'] = 'import turtle\n__turtle__ = turtle.Turtle()';
    return `__turtle__.forward(${steps})\n`;
  };

  pythonGenerator.forBlock['turtle_turn'] = function(block: Blockly.Block) {
    const direction = block.getFieldValue('DIRECTION');
    const angle = block.getFieldValue('ANGLE');
    pythonGenerator.definitions_['import_turtle'] = 'import turtle\n__turtle__ = turtle.Turtle()';
    if (direction === 'left') {
      return `__turtle__.left(${angle})\n`;
    } else {
      return `__turtle__.right(${angle})\n`;
    }
  };

  pythonGenerator.forBlock['turtle_pen'] = function(block: Blockly.Block) {
    const state = block.getFieldValue('STATE');
    pythonGenerator.definitions_['import_turtle'] = 'import turtle\n__turtle__ = turtle.Turtle()';
    if (state === 'down') {
      return `__turtle__.pendown()\n`;
    } else {
      return `__turtle__.penup()\n`;
    }
  };

  pythonGenerator.forBlock['turtle_color'] = function(block: Blockly.Block) {
    const color = block.getFieldValue('COLOR');
    pythonGenerator.definitions_['import_turtle'] = 'import turtle\n__turtle__ = turtle.Turtle()';
    return `__turtle__.pencolor('${color}')\n`;
  };

  pythonGenerator.forBlock['turtle_reset'] = function() {
    pythonGenerator.definitions_['import_turtle'] = 'import turtle\n__turtle__ = turtle.Turtle()';
    return `__turtle__.reset()\n`;
  };
};
