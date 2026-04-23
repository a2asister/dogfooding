class DataDisplay {
    constructor(app) {
        this.app = app;
        this.totalEnergy = 0;
        this.lastUpdateTime = Date.now();
        this.updateInterval = CONFIG.ui.updateInterval;
        
        this.init();
    }
    
    init() {
        this.elements = {
            windSpeed: document.getElementById('current-wind-speed'),
            turbineSpeed: document.getElementById('turbine-speed'),
            powerOutput: document.getElementById('power-output'),
            totalEnergy: document.getElementById('total-energy'),
            gearboxSpeed: document.getElementById('gearbox-speed'),
            generatorStatus: document.getElementById('generator-status')
        };
    }
    
    update(data) {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;
        
        const windData = Utils.getWindSpeedData(data.windLevel);
        this.elements.windSpeed.textContent = `${Utils.formatNumber(windData.speed, 1)} m/s`;
        
        const turbineRPM = data.turbineRPM || 0;
        this.elements.turbineSpeed.textContent = `${Utils.formatNumber(turbineRPM, 1)} rpm`;
        
        const powerMW = windData.power * (turbineRPM / windData.rpm);
        this.elements.powerOutput.textContent = `${Utils.formatNumber(powerMW, 2)} MW`;
        
        if (data.isPlaying && turbineRPM > 0) {
            this.totalEnergy += (powerMW * 1000) * deltaTime / 3600;
        }
        this.elements.totalEnergy.textContent = `${Utils.formatNumber(this.totalEnergy, 2)} kWh`;
        
        const gearboxRPM = turbineRPM * CONFIG.turbine.gearRatio;
        this.elements.gearboxSpeed.textContent = `${Utils.formatNumber(gearboxRPM, 0)} rpm`;
        
        if (data.isPlaying && turbineRPM > 0.5) {
            this.elements.generatorStatus.textContent = '运行中';
            this.elements.generatorStatus.className = 'status-running';
        } else if (!data.isPlaying) {
            this.elements.generatorStatus.textContent = '已暂停';
            this.elements.generatorStatus.className = 'status-paused';
        } else {
            this.elements.generatorStatus.textContent = '待机中';
            this.elements.generatorStatus.className = 'status-paused';
        }
    }
    
    reset() {
        this.totalEnergy = 0;
        this.lastUpdateTime = Date.now();
        
        this.elements.windSpeed.textContent = '10.8 m/s';
        this.elements.turbineSpeed.textContent = '0.0 rpm';
        this.elements.powerOutput.textContent = '0.00 MW';
        this.elements.totalEnergy.textContent = '0.00 kWh';
        this.elements.gearboxSpeed.textContent = '0 rpm';
        this.elements.generatorStatus.textContent = '运行中';
        this.elements.generatorStatus.className = 'status-running';
    }
    
    getTotalEnergy() {
        return this.totalEnergy;
    }
}
