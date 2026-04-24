/**
 * 景区智慧管理动态大屏 - ECharts 图表初始化
 */

const ChartsManager = {
    charts: {},
    
    // 图表主题配置
    theme: {
        backgroundColor: 'transparent',
        textStyle: {
            color: '#aabbcc',
            fontSize: 12
        }
    },
    
    // 初始化所有图表
    init: function() {
        console.log('初始化图表...');
        
        // 客流管理模块图表
        this.initAgeChart();
        this.initGenderChart();
        this.initTransportChart();
        this.initSourceMapChart();
        
        // 设备运维模块图表
        this.initWorkorderChart();
        
        // 安全防控模块图表
        this.initHeatmapChart();
        this.initAreaFlowChart();
        
        // 环境监测模块图表
        this.initEnvTrendChart();
        
        // 营收统计模块图表
        this.initRevenueChart();
        this.initRevenuePieChart();
        
        // 人员调度模块图表
        this.initStaffChart();
        
        // 窗口大小变化时重绘图表
        window.addEventListener('resize', this.resizeAll.bind(this));
    },
    
    // 年龄分布图表
    initAgeChart: function() {
        const chartDom = document.getElementById('ageChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.ageChart = chart;
        
        const data = MOCK_DATA.passenger.ageDistribution;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '55%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#0a1628',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    color: '#aabbcc',
                    fontSize: 10
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 12,
                        fontWeight: 'bold'
                    }
                },
                data: data.map((item, index) => ({
                    name: item.name,
                    value: item.value,
                    itemStyle: {
                        color: CONFIG.colors.chart.series[index % CONFIG.colors.chart.series.length]
                    }
                }))
            }]
        };
        
        chart.setOption(option);
    },
    
    // 性别分布图表
    initGenderChart: function() {
        const chartDom = document.getElementById('genderChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.genderChart = chart;
        
        const data = MOCK_DATA.passenger.genderDistribution;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                }
            },
            series: [{
                type: 'pie',
                radius: ['50%', '80%'],
                center: ['50%', '55%'],
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#0a1628',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'center',
                    formatter: function(params) {
                        if (params.dataIndex === 0) {
                            return params.percent + '%';
                        }
                        return '';
                    },
                    color: '#0066ff',
                    fontSize: 24,
                    fontWeight: 'bold'
                },
                emphasis: {
                    scale: true,
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 102, 255, 0.5)'
                    }
                },
                data: [
                    { name: '男性', value: 52, itemStyle: { color: '#0066ff' } },
                    { name: '女性', value: 48, itemStyle: { color: '#ff66cc' } }
                ]
            }]
        };
        
        chart.setOption(option);
    },
    
    // 出行方式图表
    initTransportChart: function() {
        const chartDom = document.getElementById('transportChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.transportChart = chart;
        
        const data = MOCK_DATA.passenger.transportMode;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#667788',
                    fontSize: 10
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: data.map(item => item.name),
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#aabbcc',
                    fontSize: 11
                }
            },
            series: [{
                type: 'bar',
                barWidth: '60%',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: 'rgba(0, 102, 255, 0.8)' },
                        { offset: 1, color: 'rgba(0, 102, 255, 0.2)' }
                    ]),
                    borderRadius: [0, 4, 4, 0]
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#0066ff',
                    fontSize: 11,
                    formatter: '{c}%'
                },
                data: data.map((item, index) => ({
                    value: item.value,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: CONFIG.colors.chart.series[index % CONFIG.colors.chart.series.length] },
                            { offset: 1, color: 'rgba(0, 102, 255, 0.1)' }
                        ])
                    }
                }))
            }]
        };
        
        chart.setOption(option);
    },
    
    // 客流来源地图表
    initSourceMapChart: function() {
        const chartDom = document.getElementById('sourceMap');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.sourceMapChart = chart;
        
        const data = MOCK_DATA.passenger.sourceMap;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                },
                formatter: '{b}: {c}人 ({d}%)'
            },
            series: [{
                type: 'pie',
                radius: ['30%', '65%'],
                center: ['50%', '50%'],
                roseType: 'radius',
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#0a1628',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    color: '#aabbcc',
                    fontSize: 10,
                    formatter: '{b}\n{d}%'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 102, 255, 0.5)'
                    }
                },
                data: data.map((item, index) => ({
                    name: item.name,
                    value: item.value,
                    itemStyle: {
                        color: CONFIG.colors.chart.series[index % CONFIG.colors.chart.series.length]
                    }
                }))
            }]
        };
        
        chart.setOption(option);
    },
    
    // 维护工单图表
    initWorkorderChart: function() {
        const chartDom = document.getElementById('workorderChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.workorderChart = chart;
        
        const data = MOCK_DATA.equipment.workorders.trend;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '55%'],
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#0a1628',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    color: '#aabbcc',
                    fontSize: 10
                },
                data: [
                    { name: '待处理', value: 8, itemStyle: { color: '#ff6600' } },
                    { name: '处理中', value: 5, itemStyle: { color: '#0066ff' } },
                    { name: '已完成', value: 12, itemStyle: { color: '#00cc88' } }
                ]
            }]
        };
        
        chart.setOption(option);
    },
    
    // 热力图（简化版，使用条形图模拟）
    initHeatmapChart: function() {
        const chartDom = document.getElementById('heatmapChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.heatmapChart = chart;
        
        const areaFlow = MOCK_DATA.passenger.areaFlow;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                },
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                show: true,
                top: 5,
                textStyle: {
                    color: '#aabbcc',
                    fontSize: 10
                },
                data: ['当前客流', '承载上限']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: areaFlow.map(item => item.area),
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#aabbcc',
                    fontSize: 10,
                    rotate: 30
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#667788',
                    fontSize: 10
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            series: [
                {
                    name: '当前客流',
                    type: 'bar',
                    barWidth: '35%',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 102, 255, 0.9)' },
                            { offset: 1, color: 'rgba(0, 102, 255, 0.3)' }
                        ]),
                        borderRadius: [4, 4, 0, 0]
                    },
                    data: areaFlow.map(item => {
                        const ratio = item.current / item.capacity;
                        let color;
                        if (ratio > 0.8) {
                            color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(255, 51, 51, 0.9)' },
                                { offset: 1, color: 'rgba(255, 51, 51, 0.3)' }
                            ]);
                        } else if (ratio > 0.6) {
                            color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(255, 170, 0, 0.9)' },
                                { offset: 1, color: 'rgba(255, 170, 0, 0.3)' }
                            ]);
                        } else {
                            color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(0, 102, 255, 0.9)' },
                                { offset: 1, color: 'rgba(0, 102, 255, 0.3)' }
                            ]);
                        }
                        return {
                            value: item.current,
                            itemStyle: { color: color }
                        };
                    })
                },
                {
                    name: '承载上限',
                    type: 'bar',
                    barWidth: '35%',
                    itemStyle: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: [4, 4, 0, 0]
                    },
                    data: areaFlow.map(item => item.capacity)
                }
            ]
        };
        
        chart.setOption(option);
    },
    
    // 区域客流趋势图
    initAreaFlowChart: function() {
        const chartDom = document.getElementById('areaFlowChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.areaFlowChart = chart;
        
        const hourlyTrend = MOCK_DATA.passenger.hourlyTrend;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                }
            },
            legend: {
                show: true,
                top: 5,
                textStyle: {
                    color: '#aabbcc',
                    fontSize: 10
                },
                data: ['今日', '昨日']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: hourlyTrend.hours,
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#aabbcc',
                    fontSize: 10
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#667788',
                    fontSize: 10
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            series: [
                {
                    name: '今日',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        color: '#0066ff',
                        width: 2
                    },
                    itemStyle: {
                        color: '#0066ff'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 102, 255, 0.3)' },
                            { offset: 1, color: 'rgba(0, 102, 255, 0.05)' }
                        ])
                    },
                    data: hourlyTrend.visitors
                },
                {
                    name: '昨日',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 4,
                    lineStyle: {
                        color: 'rgba(0, 204, 136, 0.5)',
                        width: 1,
                        type: 'dashed'
                    },
                    itemStyle: {
                        color: 'rgba(0, 204, 136, 0.5)'
                    },
                    data: hourlyTrend.yesterday
                }
            ]
        };
        
        chart.setOption(option);
    },
    
    // 环境趋势图
    initEnvTrendChart: function() {
        const chartDom = document.getElementById('envTrendChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.envTrendChart = chart;
        
        const hourlyTrend = MOCK_DATA.environment.hourlyTrend;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                }
            },
            legend: {
                show: true,
                top: 5,
                textStyle: {
                    color: '#aabbcc',
                    fontSize: 10
                },
                data: ['温度(°C)', '湿度(%)']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: hourlyTrend.hours,
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#aabbcc',
                    fontSize: 10
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '温度',
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    axisLabel: {
                        color: '#667788',
                        fontSize: 10,
                        formatter: '{value}°C'
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                {
                    type: 'value',
                    name: '湿度',
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    axisLabel: {
                        color: '#667788',
                        fontSize: 10,
                        formatter: '{value}%'
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: '温度(°C)',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    lineStyle: {
                        color: '#ff6600',
                        width: 2
                    },
                    itemStyle: {
                        color: '#ff6600'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 102, 0, 0.2)' },
                            { offset: 1, color: 'rgba(255, 102, 0, 0.02)' }
                        ])
                    },
                    data: hourlyTrend.temperature
                },
                {
                    name: '湿度(%)',
                    type: 'line',
                    yAxisIndex: 1,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    lineStyle: {
                        color: '#00cc88',
                        width: 2
                    },
                    itemStyle: {
                        color: '#00cc88'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 204, 136, 0.2)' },
                            { offset: 1, color: 'rgba(0, 204, 136, 0.02)' }
                        ])
                    },
                    data: hourlyTrend.humidity
                }
            ]
        };
        
        chart.setOption(option);
    },
    
    // 营收趋势图
    initRevenueChart: function() {
        const chartDom = document.getElementById('revenueChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.revenueChart = chart;
        
        const weeklyTrend = MOCK_DATA.revenue.weeklyTrend;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                },
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                show: true,
                top: 5,
                textStyle: {
                    color: '#aabbcc',
                    fontSize: 10
                },
                data: ['营收(万)', '客流(千)']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: weeklyTrend.dates,
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#aabbcc',
                    fontSize: 10
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '营收',
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    axisLabel: {
                        color: '#667788',
                        fontSize: 10,
                        formatter: function(value) {
                            return (value / 10000).toFixed(0) + '万';
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                {
                    type: 'value',
                    name: '客流',
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    axisLabel: {
                        color: '#667788',
                        fontSize: 10,
                        formatter: function(value) {
                            return (value / 1000).toFixed(1) + '千';
                        }
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            series: [
                {
                    name: '营收(万)',
                    type: 'bar',
                    barWidth: '40%',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 102, 255, 0.9)' },
                            { offset: 1, color: 'rgba(0, 102, 255, 0.3)' }
                        ]),
                        borderRadius: [4, 4, 0, 0]
                    },
                    data: weeklyTrend.revenue
                },
                {
                    name: '客流(千)',
                    type: 'line',
                    yAxisIndex: 1,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 5,
                    lineStyle: {
                        color: '#00cc88',
                        width: 2
                    },
                    itemStyle: {
                        color: '#00cc88'
                    },
                    data: weeklyTrend.visitors
                }
            ]
        };
        
        chart.setOption(option);
    },
    
    // 营收占比饼图
    initRevenuePieChart: function() {
        const chartDom = document.getElementById('revenuePieChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.revenuePieChart = chart;
        
        const categoryRatio = MOCK_DATA.revenue.categoryRatio;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                },
                formatter: '{b}: {c}%'
            },
            series: [{
                type: 'pie',
                radius: ['35%', '65%'],
                center: ['50%', '55%'],
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#0a1628',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    color: '#aabbcc',
                    fontSize: 10,
                    formatter: '{b}\n{c}%'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 12,
                        fontWeight: 'bold'
                    }
                },
                data: [
                    { name: '门票', value: 71, itemStyle: { color: '#0066ff' } },
                    { name: '餐饮', value: 17.2, itemStyle: { color: '#ff6600' } },
                    { name: '文创', value: 8.6, itemStyle: { color: '#00cc88' } },
                    { name: '租赁', value: 3.2, itemStyle: { color: '#ff66cc' } }
                ]
            }]
        };
        
        chart.setOption(option);
    },
    
    // 人员分布图
    initStaffChart: function() {
        const chartDom = document.getElementById('staffChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        this.charts.staffChart = chart;
        
        const distribution = MOCK_DATA.staff.distribution;
        
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15, 30, 60, 0.9)',
                borderColor: 'rgba(0, 102, 255, 0.3)',
                textStyle: {
                    color: '#ffffff'
                },
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                show: true,
                top: 5,
                textStyle: {
                    color: '#aabbcc',
                    fontSize: 10
                },
                data: ['安保', '保洁', '客服']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: distribution.areas,
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#aabbcc',
                    fontSize: 9,
                    rotate: 30
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                axisLabel: {
                    color: '#667788',
                    fontSize: 10
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            series: [
                {
                    name: '安保',
                    type: 'bar',
                    stack: 'staff',
                    itemStyle: {
                        color: '#0066ff',
                        borderRadius: [0, 0, 0, 0]
                    },
                    data: distribution.security
                },
                {
                    name: '保洁',
                    type: 'bar',
                    stack: 'staff',
                    itemStyle: {
                        color: '#00cc88'
                    },
                    data: distribution.cleaner
                },
                {
                    name: '客服',
                    type: 'bar',
                    stack: 'staff',
                    itemStyle: {
                        color: '#ff66cc',
                        borderRadius: [4, 4, 0, 0]
                    },
                    data: distribution.service
                }
            ]
        };
        
        chart.setOption(option);
    },
    
    // 调整所有图表大小
    resizeAll: function() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].resize();
            }
        });
    },
    
    // 刷新指定图表
    refreshChart: function(chartName, newData) {
        if (this.charts[chartName]) {
            this.charts[chartName].setOption({
                series: [{
                    data: newData
                }]
            });
        }
    },
    
    // 销毁所有图表
    dispose: function() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].dispose();
                this.charts[key] = null;
            }
        });
    }
};

// 页面加载完成后初始化图表
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        ChartsManager.init();
    });
} else {
    ChartsManager.init();
}
