export function generateMockData(count: number, min: number = 0, max: number = 100): any[] {
  const categories = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const names = ['产品A', '产品B', '产品C', '产品D', '产品E'];

  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      name: categories[i % categories.length],
      value: Math.floor(Math.random() * (max - min + 1)) + min,
      type: names[i % names.length],
    });
  }
  return data;
}

export function generatePieData(count: number): any[] {
  const names = ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎', '社交媒体'];
  const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];

  const data = [];
  let remaining = 100;

  for (let i = 0; i < count; i++) {
    if (i === count - 1) {
      data.push({
        name: names[i % names.length],
        value: remaining,
        itemStyle: { color: colors[i % colors.length] },
      });
    } else {
      const value = Math.floor(Math.random() * (remaining / (count - i)));
      remaining -= value;
      data.push({
        name: names[i % names.length],
        value: value || Math.floor(Math.random() * 20) + 5,
        itemStyle: { color: colors[i % colors.length] },
      });
    }
  }
  return data;
}

export function generateMapData(): any[] {
  const provinces = [
    '北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川', '湖北', '湖南',
    '福建', '安徽', '河北', '陕西', '江西', '重庆', '辽宁', '云南', '广西', '山西',
    '贵州', '黑龙江', '吉林', '甘肃', '内蒙古', '新疆', '海南', '宁夏', '青海', '西藏',
    '天津', '香港', '澳门', '台湾'
  ];

  return provinces.map((name) => ({
    name,
    value: Math.floor(Math.random() * 1000) + 100,
  }));
}
