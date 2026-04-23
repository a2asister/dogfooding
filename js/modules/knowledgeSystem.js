import { SimulationStages } from './simulationState.js';

export class KnowledgeSystem {
    constructor(simulationState) {
        this.simulationState = simulationState;
        this.container = document.getElementById('knowledge-container');
        this.activeTooltips = [];
        this.maxVisibleTooltips = 2;
        
        this.knowledgePoints = this.defineKnowledgePoints();
    }
    
    init() {
        console.log('知识点系统初始化完成');
    }
    
    defineKnowledgePoints() {
        return [
            {
                id: 'moisture_rising',
                stage: SimulationStages.MOISTURE_RISING,
                triggerProgress: 0.2,
                title: '🌡️ 水汽上升',
                content: '当地面温度较高时，地表水蒸发形成水汽。热空气比冷空气轻，因此水汽会随着上升气流向高空移动。'
            },
            {
                id: 'cooling_condensation',
                stage: SimulationStages.MOISTURE_RISING,
                triggerProgress: 0.7,
                title: '❄️ 冷却凝结',
                content: '随着高度增加，气温逐渐降低（每升高1000米约降低6.5°C）。水汽遇冷凝结成微小的水滴或冰晶，这就是云形成的开始。'
            },
            {
                id: 'cloud_forming',
                stage: SimulationStages.CLOUD_FORMING,
                triggerProgress: 0.3,
                title: '☁️ 乌云形成',
                content: '当大量水滴和冰晶聚集在一起时，就形成了云。积雨云（雷雨云）通常非常厚实，可达数千米厚，因为密度大而呈现深灰色。'
            },
            {
                id: 'cloud_thickness',
                stage: SimulationStages.CLOUD_FORMING,
                triggerProgress: 0.8,
                title: '📏 云的厚度',
                content: '典型的积雨云厚度可达2000-8000米。云越厚，光线越难穿透，因此看起来越暗。乌云通常预示着强烈的天气活动。'
            },
            {
                id: 'collision_friction',
                stage: SimulationStages.CHARGE_SEPARATION,
                triggerProgress: 0.2,
                title: '⚡ 碰撞与摩擦',
                content: '在上升气流的作用下，云内部的水滴和冰晶不断运动、碰撞和摩擦。较重的冰晶（带负电）下落，较轻的水滴碎片（带正电）上升。'
            },
            {
                id: 'charge_separation',
                stage: SimulationStages.CHARGE_SEPARATION,
                triggerProgress: 0.5,
                title: '🔋 电荷分离',
                content: '碰撞摩擦导致电荷分离：正电荷聚集在云的上部（温度较低处），负电荷聚集在云的下部。地面因此感应出正电荷。'
            },
            {
                id: 'electric_field',
                stage: SimulationStages.CHARGE_SEPARATION,
                triggerProgress: 0.9,
                title: '⚡ 电场强度',
                content: '当电荷分离达到一定程度，云内部和云与地面之间的电场强度可达每米数百万伏特。这个电场足够强大，可以击穿空气。'
            },
            {
                id: 'lightning_formation',
                stage: SimulationStages.LIGHTNING,
                triggerProgress: 0.1,
                title: '🌩️ 闪电形成',
                content: '当电场强度超过空气的绝缘能力时，空气被电离形成导电通道。电荷沿着这条通道快速流动，产生强烈的光和热，这就是闪电。'
            },
            {
                id: 'lightning_voltage',
                stage: SimulationStages.LIGHTNING,
                triggerProgress: 0.5,
                title: '⚡ 闪电的能量',
                content: '一次闪电的电压可达100-1000兆伏，电流可达2-20万安培。闪电通道的温度可达30000°C，比太阳表面温度还要高5倍！'
            },
            {
                id: 'thunder_formation',
                stage: SimulationStages.THUNDER,
                triggerProgress: 0.1,
                title: '🔊 雷声产生',
                content: '闪电瞬间加热周围的空气，使其温度急剧升高并迅速膨胀，随后又快速冷却收缩。这种剧烈的膨胀和收缩产生了冲击波，最终形成我们听到的雷声。'
            },
            {
                id: 'speed_difference',
                stage: SimulationStages.THUNDER,
                triggerProgress: 0.5,
                title: '⏱️ 光与声的速度差',
                content: '光速约为每秒30万公里（几乎瞬间到达），而声速约为每秒340米。通过计算看到闪电和听到雷声的时间差，可以估算闪电距离：每3秒约等于1公里。'
            }
        ];
    }
    
    checkKnowledgePoints(state) {
        if (!this.simulationState.showKnowledge) {
            this.clearAllTooltips();
            return;
        }
        
        const currentStage = state.currentStage;
        const progress = state.stageProgress;
        
        this.knowledgePoints.forEach(point => {
            if (point.stage === currentStage && 
                progress >= point.triggerProgress && 
                !this.simulationState.isKnowledgeTriggered(point.id)) {
                
                this.simulationState.markKnowledgeTriggered(point.id);
                this.showTooltip(point);
            }
        });
    }
    
    showTooltip(point) {
        if (this.activeTooltips.length >= this.maxVisibleTooltips) {
            this.removeOldestTooltip();
        }
        
        const tooltip = this.createTooltipElement(point);
        this.container.appendChild(tooltip);
        this.activeTooltips.push({
            id: point.id,
            element: tooltip,
            createdAt: Date.now()
        });
        
        setTimeout(() => {
            this.removeTooltip(point.id);
        }, 8000);
    }
    
    createTooltipElement(point) {
        const tooltip = document.createElement('div');
        tooltip.className = 'knowledge-tooltip';
        tooltip.dataset.id = point.id;
        
        tooltip.innerHTML = `
            <div class="knowledge-header">
                <span class="knowledge-title">${point.title}</span>
                <button class="knowledge-close" data-id="${point.id}">×</button>
            </div>
            <div class="knowledge-content">${point.content}</div>
        `;
        
        const closeBtn = tooltip.querySelector('.knowledge-close');
        closeBtn.addEventListener('click', () => {
            this.removeTooltip(point.id);
        });
        
        return tooltip;
    }
    
    removeTooltip(id) {
        const index = this.activeTooltips.findIndex(t => t.id === id);
        if (index !== -1) {
            const tooltip = this.activeTooltips[index];
            if (tooltip.element && tooltip.element.parentNode) {
                tooltip.element.style.animation = 'none';
                tooltip.element.style.opacity = '0';
                tooltip.element.style.transform = 'translateY(20px)';
                tooltip.element.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    if (tooltip.element.parentNode) {
                        tooltip.element.parentNode.removeChild(tooltip.element);
                    }
                }, 300);
            }
            this.activeTooltips.splice(index, 1);
        }
    }
    
    removeOldestTooltip() {
        if (this.activeTooltips.length > 0) {
            const oldest = this.activeTooltips[0];
            this.removeTooltip(oldest.id);
        }
    }
    
    clearAllTooltips() {
        while (this.activeTooltips.length > 0) {
            this.removeOldestTooltip();
        }
    }
    
    reset() {
        this.clearAllTooltips();
        console.log('知识点系统已重置');
    }
}
