export const SimulationStages = {
    IDLE: 'idle',
    MOISTURE_RISING: 'moisture_rising',
    CLOUD_FORMING: 'cloud_forming',
    CHARGE_SEPARATION: 'charge_separation',
    LIGHTNING: 'lightning',
    THUNDER: 'thunder',
    COMPLETED: 'completed'
};

export class SimulationState {
    constructor() {
        this.listeners = {};
        
        this.isPlaying = false;
        this.speed = 1.0;
        this.simulationTime = 0;
        
        this.currentStage = SimulationStages.IDLE;
        this.stageProgress = 0;
        
        this.moisture = 60;
        this.updraftStrength = 5;
        this.temperatureDifference = 12;
        
        this.cloudThickness = 0;
        this.cloudDensity = 0;
        this.cloudParticles = [];
        
        this.positiveChargeDensity = 0;
        this.negativeChargeDensity = 0;
        this.chargeSeparation = 0;
        
        this.lightningVoltage = 0;
        this.lightningCurrent = 0;
        this.isLightningActive = false;
        
        this.thunderIntensity = 0;
        this.isThunderActive = false;
        
        this.showKnowledge = true;
        this.showData = true;
        this.showParticles = true;
        
        this.triggeredKnowledge = new Set();
    }
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    togglePlay() {
        if (this.currentStage === SimulationStages.COMPLETED) {
            this.softReset();
            this.isPlaying = true;
        } else {
            this.isPlaying = !this.isPlaying;
        }
        this.emit('stateChange', this.getState());
    }
    
    softReset() {
        this.simulationTime = 0;
        this.currentStage = SimulationStages.IDLE;
        this.stageProgress = 0;
        
        this.cloudThickness = 0;
        this.cloudDensity = 0;
        this.positiveChargeDensity = 0;
        this.negativeChargeDensity = 0;
        this.chargeSeparation = 0;
        this.lightningVoltage = 0;
        this.lightningCurrent = 0;
        this.thunderIntensity = 0;
        this.isLightningActive = false;
        this.isThunderActive = false;
        
        this.triggeredKnowledge.clear();
        
        this.emit('reset', null);
    }
    
    setSpeed(speed) {
        this.speed = speed;
        this.emit('stateChange', this.getState());
    }
    
    setMoisture(value) {
        this.moisture = value;
        this.emit('dataUpdate', this.getData());
    }
    
    setUpdraftStrength(value) {
        this.updraftStrength = value;
        this.emit('dataUpdate', this.getData());
    }
    
    setTemperatureDifference(value) {
        this.temperatureDifference = value;
        this.emit('dataUpdate', this.getData());
    }
    
    update(deltaTime) {
        if (!this.isPlaying) return;
        
        this.simulationTime += deltaTime;
        this.updateStage(deltaTime);
        this.updatePhysics(deltaTime);
        
        this.emit('stateChange', this.getState());
        this.emit('dataUpdate', this.getData());
    }
    
    updateStage(deltaTime) {
        const stageDurations = this.calculateStageDurations();
        
        switch (this.currentStage) {
            case SimulationStages.IDLE:
                if (this.isPlaying) {
                    this.currentStage = SimulationStages.MOISTURE_RISING;
                    this.stageProgress = 0;
                }
                break;
                
            case SimulationStages.MOISTURE_RISING:
                this.stageProgress += deltaTime / stageDurations.moistureRising;
                if (this.stageProgress >= 1) {
                    this.currentStage = SimulationStages.CLOUD_FORMING;
                    this.stageProgress = 0;
                }
                break;
                
            case SimulationStages.CLOUD_FORMING:
                this.stageProgress += deltaTime / stageDurations.cloudForming;
                if (this.stageProgress >= 1) {
                    this.currentStage = SimulationStages.CHARGE_SEPARATION;
                    this.stageProgress = 0;
                }
                break;
                
            case SimulationStages.CHARGE_SEPARATION:
                this.stageProgress += deltaTime / stageDurations.chargeSeparation;
                if (this.stageProgress >= 1) {
                    this.currentStage = SimulationStages.LIGHTNING;
                    this.stageProgress = 0;
                }
                break;
                
            case SimulationStages.LIGHTNING:
                this.stageProgress += deltaTime / stageDurations.lightning;
                this.isLightningActive = this.stageProgress < 0.8;
                if (this.stageProgress >= 1) {
                    this.currentStage = SimulationStages.THUNDER;
                    this.stageProgress = 0;
                    this.isLightningActive = false;
                }
                break;
                
            case SimulationStages.THUNDER:
                this.stageProgress += deltaTime / stageDurations.thunder;
                this.isThunderActive = this.stageProgress < 0.9;
                if (this.stageProgress >= 1) {
                    if (this.shouldRepeat()) {
                        this.currentStage = SimulationStages.MOISTURE_RISING;
                        this.stageProgress = 0;
                        this.isThunderActive = false;
                    } else {
                        this.currentStage = SimulationStages.COMPLETED;
                        this.isPlaying = false;
                    }
                }
                break;
                
            case SimulationStages.COMPLETED:
                this.isPlaying = false;
                break;
        }
    }
    
    calculateStageDurations() {
        const baseTime = 3;
        const moistureFactor = this.moisture / 60;
        const updraftFactor = this.updraftStrength / 5;
        
        return {
            moistureRising: baseTime * 0.8 / moistureFactor,
            cloudForming: baseTime * 1.2 / (moistureFactor * updraftFactor),
            chargeSeparation: baseTime * 1.5 / updraftFactor,
            lightning: baseTime * 0.3,
            thunder: baseTime * 0.5
        };
    }
    
    updatePhysics(deltaTime) {
        const moistureFactor = this.moisture / 100;
        const updraftFactor = this.updraftStrength / 10;
        const tempFactor = this.temperatureDifference / 20;
        
        switch (this.currentStage) {
            case SimulationStages.MOISTURE_RISING:
                this.cloudDensity = this.stageProgress * 30 * moistureFactor;
                this.cloudThickness = this.stageProgress * 500 * moistureFactor;
                break;
                
            case SimulationStages.CLOUD_FORMING:
                this.cloudDensity = 30 + this.stageProgress * 50 * moistureFactor;
                this.cloudThickness = 500 + this.stageProgress * 1500 * moistureFactor;
                break;
                
            case SimulationStages.CHARGE_SEPARATION:
                const chargeRate = this.stageProgress * updraftFactor * tempFactor;
                this.positiveChargeDensity = chargeRate * 0.8;
                this.negativeChargeDensity = chargeRate * 1.2;
                this.chargeSeparation = this.stageProgress * 100;
                break;
                
            case SimulationStages.LIGHTNING:
                if (this.stageProgress < 0.1) {
                    this.lightningVoltage = 100 + Math.random() * 100;
                    this.lightningCurrent = 20 + Math.random() * 30;
                }
                break;
                
            case SimulationStages.THUNDER:
                if (this.stageProgress < 0.1) {
                    this.thunderIntensity = 100 + Math.random() * 20;
                } else {
                    this.thunderIntensity = (1 - this.stageProgress) * 120;
                }
                break;
        }
    }
    
    shouldRepeat() {
        return false;
    }
    
    getState() {
        return {
            isPlaying: this.isPlaying,
            speed: this.speed,
            currentStage: this.currentStage,
            stageProgress: this.stageProgress,
            showKnowledge: this.showKnowledge,
            showData: this.showData,
            showParticles: this.showParticles
        };
    }
    
    getData() {
        return {
            simulationTime: this.simulationTime.toFixed(1),
            stage: this.getStageName(),
            cloudThickness: Math.round(this.cloudThickness),
            cloudDensity: Math.round(this.cloudDensity),
            positiveCharge: this.positiveChargeDensity.toFixed(2),
            negativeCharge: this.negativeChargeDensity.toFixed(2),
            chargeSeparation: Math.round(this.chargeSeparation),
            lightningVoltage: Math.round(this.lightningVoltage),
            lightningCurrent: Math.round(this.lightningCurrent),
            thunderIntensity: Math.round(this.thunderIntensity),
            moisture: this.moisture,
            updraftStrength: this.updraftStrength,
            temperatureDifference: this.temperatureDifference
        };
    }
    
    getStageName() {
        const stageNames = {
            [SimulationStages.IDLE]: '准备中',
            [SimulationStages.MOISTURE_RISING]: '水汽上升',
            [SimulationStages.CLOUD_FORMING]: '乌云形成',
            [SimulationStages.CHARGE_SEPARATION]: '电荷分离',
            [SimulationStages.LIGHTNING]: '闪电放电',
            [SimulationStages.THUNDER]: '雷声传播',
            [SimulationStages.COMPLETED]: '已完成'
        };
        return stageNames[this.currentStage] || '未知';
    }
    
    markKnowledgeTriggered(id) {
        this.triggeredKnowledge.add(id);
    }
    
    isKnowledgeTriggered(id) {
        return this.triggeredKnowledge.has(id);
    }
    
    reset() {
        this.isPlaying = false;
        this.simulationTime = 0;
        this.currentStage = SimulationStages.IDLE;
        this.stageProgress = 0;
        
        this.cloudThickness = 0;
        this.cloudDensity = 0;
        this.positiveChargeDensity = 0;
        this.negativeChargeDensity = 0;
        this.chargeSeparation = 0;
        this.lightningVoltage = 0;
        this.lightningCurrent = 0;
        this.thunderIntensity = 0;
        this.isLightningActive = false;
        this.isThunderActive = false;
        
        this.triggeredKnowledge.clear();
        
        this.emit('stateChange', this.getState());
        this.emit('dataUpdate', this.getData());
    }
}
