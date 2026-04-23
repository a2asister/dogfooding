const CONFIG = {
    windSpeed: {
        levels: [
            { level: 1, speed: 0.5, name: '软风', rpm: 3, power: 0.05 },
            { level: 2, speed: 1.8, name: '轻风', rpm: 6, power: 0.15 },
            { level: 3, speed: 3.6, name: '微风', rpm: 10, power: 0.4 },
            { level: 4, speed: 6.0, name: '和风', rpm: 14, power: 0.8 },
            { level: 5, speed: 10.8, name: '劲风', rpm: 18, power: 2.5 },
            { level: 6, speed: 14.0, name: '强风', rpm: 22, power: 3.8 },
            { level: 7, speed: 17.0, name: '疾风', rpm: 26, power: 5.2 },
            { level: 8, speed: 20.8, name: '大风', rpm: 30, power: 6.8 },
            { level: 9, speed: 24.5, name: '烈风', rpm: 34, power: 8.5 },
            { level: 10, speed: 28.5, name: '狂风', rpm: 38, power: 10.2 },
            { level: 11, speed: 32.7, name: '暴风', rpm: 42, power: 12.0 },
            { level: 12, speed: 37.0, name: '飓风', rpm: 46, power: 15.0 }
        ],
        defaultLevel: 5
    },
    
    turbine: {
        gearRatio: 100,
        maxRPM: 50,
        colors: {
            tower: 0x8B8B8B,
            nacelle: 0xFFFFFF,
            blade: 0xE8E8E8,
            hub: 0x555555,
            gearbox: 0x4A4A4A,
            generator: 0x3A3A3A
        }
    },
    
    scene: {
        colors: {
            land: {
                ground: 0x7CB342,
                sky: 0x87CEEB,
                fog: 0xB0E0E6
            },
            sea: {
                water: 0x1E88E5,
                sky: 0x64B5F6,
                fog: 0x90CAF9
            }
        }
    },
    
    animation: {
        windParticles: {
            count: 200,
            speed: 0.3,
            area: { x: 100, y: 50, z: 100 }
        }
    },
    
    ui: {
        updateInterval: 100,
        tooltipDelay: 300
    }
};

const PART_DETAILS = {
    blade: {
        name: '叶片',
        description: `<p><strong>功能：</strong>捕捉风能，将风能转化为旋转机械能。</p>
        <p><strong>设计特点：</strong></p>
        <ul>
            <li>采用空气动力学翼型设计，类似飞机机翼</li>
            <li>通常由3片组成，形成最佳的风能捕获效率</li>
            <li>由高强度复合材料（如玻璃钢、碳纤维）制成</li>
            <li>长度通常为30-80米，大型风机可达100米以上</li>
        </ul>
        <p><strong>工作原理：</strong>当风吹过叶片时，叶片上下表面的压力差产生升力，推动叶片旋转。叶片的角度可以通过变桨系统调节，以适应不同风速。</p>`
    },
    hub: {
        name: '轮毂',
        description: `<p><strong>功能：</strong>连接叶片和主轴的核心部件，承受巨大的载荷。</p>
        <p><strong>设计特点：</strong></p>
        <ul>
            <li>由高强度铸钢制成，重量可达数十吨</li>
            <li>设计寿命通常为20年以上</li>
            <li>内置变桨驱动系统，可独立调节每个叶片的角度</li>
            <li>承受离心力、风力、重力等复杂载荷</li>
        </ul>
        <p><strong>重要性：</strong>轮毂是风机受力最复杂的部件之一，其设计直接影响风机的安全性和可靠性。</p>`
    },
    nacelle: {
        name: '机舱',
        description: `<p><strong>功能：</strong>容纳和保护传动系统、发电机等核心部件的外壳。</p>
        <p><strong>内部组件：</strong></p>
        <ul>
            <li>主轴和轴承系统</li>
            <li>齿轮箱（增速箱）</li>
            <li>发电机</li>
            <li>偏航驱动系统</li>
            <li>冷却系统</li>
            <li>控制系统和传感器</li>
        </ul>
        <p><strong>设计特点：</strong>采用流线型设计以减少风阻，同时具备防雨、防尘、防腐蚀功能，适应各种恶劣环境条件。</p>`
    },
    tower: {
        name: '塔架',
        description: `<p><strong>功能：</strong>支撑机舱和叶片，将风机提升到合适的高度。</p>
        <p><strong>设计特点：</strong></p>
        <ul>
            <li>通常由钢管分段焊接而成，呈锥形（下粗上细）</li>
            <li>高度通常为80-160米，根据风资源条件确定</li>
            <li>内置爬梯和平台，方便维护人员进入机舱</li>
            <li>底部通过法兰与基础连接</li>
            <li>表面涂有防腐涂层，设计寿命20年以上</li>
        </ul>
        <p><strong>高度选择：</strong>更高的塔架可以捕获更稳定、更强的风能，但成本也相应增加。需要根据当地风资源进行优化选择。</p>`
    },
    gearbox: {
        name: '齿轮箱',
        description: `<p><strong>功能：</strong>增速装置，将叶片的低转速转换为发电机所需的高转速。</p>
        <p><strong>工作原理：</strong></p>
        <ul>
            <li>输入转速：约10-20转/分钟（叶片转速）</li>
            <li>输出转速：约1000-1500转/分钟（发电机额定转速）</li>
            <li>增速比：约1:50到1:100</li>
        </ul>
        <p><strong>结构组成：</strong></p>
        <ul>
            <li>行星齿轮级：承载能力强，用于第一级增速</li>
            <li>平行轴齿轮级：效率高，用于后续增速</li>
            <li>润滑系统：强制润滑，确保齿轮和轴承可靠运行</li>
            <li>冷却系统：散发齿轮啮合产生的热量</li>
        </ul>
        <p><strong>重要性：</strong>齿轮箱是风机中故障率较高的部件之一，其可靠性直接影响风机的可用率。</p>`
    },
    generator: {
        name: '发电机',
        description: `<p><strong>功能：</strong>将机械能转化为电能。</p>
        <p><strong>常见类型：</strong></p>
        <h4>1. 双馈异步发电机（DFIG）</h4>
        <ul>
            <li>目前应用最广泛的类型</li>
            <li>转子通过变流器连接电网</li>
            <li>可在一定转速范围内变速运行</li>
            <li>变流器容量约为发电机容量的30%</li>
        </ul>
        <h4>2. 永磁同步发电机（PMSG）</h4>
        <ul>
            <li>效率更高，维护成本更低</li>
            <li>采用全功率变流器</li>
            <li>可实现无齿轮箱直驱设计</li>
            <li>是未来发展的主要方向</li>
        </ul>
        <p><strong>工作原理：</strong>根据电磁感应定律，导体在磁场中运动时会产生感应电动势。发电机的转子旋转时，定子绕组切割磁力线产生三相交流电。</p>`
    },
    foundation: {
        name: '基础',
        description: `<p><strong>功能：</strong>固定塔架，承受风机的全部载荷并传递到地基。</p>
        <p><strong>陆地基础类型：</strong></p>
        <ul>
            <li><strong>扩展基础：</strong>最常见的钢筋混凝土基础，通过扩大底部分散载荷</li>
            <li><strong>桩基础：</strong>适用于地质条件较差的场地，通过桩将载荷传递到深层坚实土层</li>
            <li><strong>岩石锚杆基础：</strong>适用于岩石地基，通过锚杆与岩石锚固</li>
        </ul>
        <p><strong>海上基础类型：</strong></p>
        <ul>
            <li><strong>单桩基础：</strong>适用于水深30米以内，是目前最主流的型式</li>
            <li><strong>导管架基础：</strong>适用于水深30-60米</li>
            <li><strong>高桩承台基础：</strong>适用于地质条件复杂的海域</li>
            <li><strong>漂浮式基础：</strong>适用于水深60米以上的深远海</li>
        </ul>
        <p><strong>设计要求：</strong>基础设计需要考虑风机运行20年以上的各种极端载荷工况，包括最大风速、地震、结冰等。</p>`
    }
};
