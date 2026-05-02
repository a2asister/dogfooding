export const initialLeftCode = `// 版本 1.0.0
function calculateTotal(items) {
  let total = 0;
  
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  
  // 添加税费
  total = total * 1.1;
  
  return total;
}

const shoppingCart = [
  { name: "笔记本电脑", price: 8999, quantity: 1 },
  { name: "鼠标", price: 199, quantity: 2 },
  { name: "键盘", price: 399, quantity: 1 }
];

console.log("总价:", calculateTotal(shoppingCart));`;

export const initialRightCode = `// 版本 1.1.0
function calculateTotal(items, taxRate = 0.1) {
  if (!Array.isArray(items)) {
    throw new Error("items 必须是数组");
  }

  let total = 0;
  let discount = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    total += item.price * item.quantity;
    
    // 批量购买折扣
    if (item.quantity >= 3) {
      discount += item.price * item.quantity * 0.1;
    }
  }
  
  // 应用折扣
  total -= discount;
  
  // 添加税费
  total = total * (1 + taxRate);
  
  // 四舍五入到两位小数
  return Math.round(total * 100) / 100;
}

const shoppingCart = [
  { name: "笔记本电脑", price: 8999, quantity: 1 },
  { name: "鼠标", price: 199, quantity: 3 },
  { name: "键盘", price: 399, quantity: 1 },
  { name: "显示器", price: 2999, quantity: 1 }
];

try {
  console.log("总价:", calculateTotal(shoppingCart));
} catch (error) {
  console.error("计算错误:", error.message);
}`;
