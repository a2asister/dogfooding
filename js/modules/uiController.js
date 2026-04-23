import { SimulationStages } from './simulationState.js';

export class UIController {
    constructor(simulationState, simulationScene) {
        this.simulationState = simulationState;
        this.simulationScene = simulationScene;
        
        this.elements = {};
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
    }
    
    cacheElements() {
        this.elements = {
            playBtn: document.getElementById('play-btn'),
            playIcon: document.getElementById('play-icon'),
            replayBtn: document.getElementById('replay-btn'),
            speedSlider: document.getElementById('speed-slider'),
            speedValue: document.getElementById('speed-value'),
            
            moistureSlider: document.getElementById('moisture-slider'),
            moistureValue: document.getElementById('moisture-value'),
            updraftSlider: document.getElementById('updraft-slider'),
            updraftValue: document.getElementById('updraft-value'),
            tempdiffSlider: document.getElementById('tempdiff-slider'),
            tempdiffValue: document.getElementById('tempdiff-value'),
            
            viewOverview: document.getElementById('view-overview'),
            viewClose: document.getElementById('view-close'),
            viewInside: document.getElementById('view-inside'),
            
            showKnowledge: document.getElementById('show-knowledge'),
            showData: document.getElementById('show-data'),
            showParticles: document.getElementById('show-particles'),
            
            screenshotBtn: document.getElementById('screenshot-btn'),
            
            togglePanel: document.getElementById('toggle-panel'),
            toggleData: document.getElementById('toggle-data'),
            showControlPanel: document.getElementById('show-control-panel'),
            showDataPanel: document.getElementById('show-data-panel'),
            controlPanel: document.getElementById('control-panel'),
            dataPanel: document.getElementById('data-panel'),
            
            helpBtn: document.getElementById('help-btn'),
            closeHelp: document.getElementById('close-help'),
            helpModal: document.getElementById('help-modal'),
            
            stageValue: document.getElementById('stage-value'),
            cloudThickness: document.getElementById('cloud-thickness'),
            cloudDensity: document.getElementById('cloud-density'),
            positiveCharge: document.getElementById('positive-charge'),
            negativeCharge: document.getElementById('negative-charge'),
            chargeSeparation: document.getElementById('charge-separation'),
            lightningVoltage: document.getElementById('lightning-voltage'),
            lightningCurrent: document.getElementById('lightning-current'),
            thunderIntensity: document.getElementById('thunder-intensity'),
            simulationTime: document.getElementById('simulation-time'),
            
            statusText: document.getElementById('status-text')
        };
    }
    
    bindEvents() {
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.replayBtn.addEventListener('click', () => this.replay());
        this.elements.speedSlider.addEventListener('input', (e) => this.changeSpeed(e.target.value));
        
        this.elements.moistureSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.simulationState.setMoisture(value);
            this.elements.moistureValue.textContent = `${value}%`;
        });
        
        this.elements.updraftSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.simulationState.setUpdraftStrength(value);
            this.elements.updraftValue.textContent = `${value}级`;
        });
        
        this.elements.tempdiffSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.simulationState.setTemperatureDifference(value);
            this.elements.tempdiffValue.textContent = `${value}°C`;
        });
        
        this.elements.viewOverview.addEventListener('click', () => this.setView('overview'));
        this.elements.viewClose.addEventListener('click', () => this.setView('close'));
        this.elements.viewInside.addEventListener('click', () => this.setView('inside'));
        
        this.elements.showKnowledge.addEventListener('change', (e) => {
            this.simulationState.showKnowledge = e.target.checked;
        });
        
        this.elements.showData.addEventListener('change', (e) => {
            this.simulationState.showData = e.target.checked;
            this.toggleDataPanelVisibility(e.target.checked);
        });
        
        this.elements.showParticles.addEventListener('change', (e) => {
            this.simulationState.showParticles = e.target.checked;
        });
        
        this.elements.screenshotBtn.addEventListener('click', () => this.takeScreenshot());
        
        this.elements.togglePanel.addEventListener('click', () => this.toggleControlPanel());
        this.elements.toggleData.addEventListener('click', () => this.toggleDataPanel());
        this.elements.showControlPanel.addEventListener('click', () => this.showControlPanel());
        this.elements.showDataPanel.addEventListener('click', () => this.showDataPanel());
        
        this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        this.elements.closeHelp.addEventListener('click', () => this.hideHelp());
        
        this.elements.helpModal.addEventListener('click', (e) => {
            if (e.target === this.elements.helpModal) {
                this.hideHelp();
            }
        });
        
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    togglePlay() {
        this.simulationState.togglePlay();
        this.updatePlayButton();
    }
    
    replay() {
        this.simulationState.reset();
        this.simulationScene.reset();
        this.updatePlayButton();
        this.updateStatus('已重置 - 点击播放开始模拟');
    }
    
    changeSpeed(value) {
        const speed = parseFloat(value);
        this.simulationState.setSpeed(speed);
        this.elements.speedValue.textContent = `${speed}x`;
    }
    
    setView(viewType) {
        this.simulationScene.setView(viewType);
        
        [this.elements.viewOverview, this.elements.viewClose, this.elements.viewInside].forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch (viewType) {
            case 'overview':
                this.elements.viewOverview.classList.add('active');
                break;
            case 'close':
                this.elements.viewClose.classList.add('active');
                break;
            case 'inside':
                this.elements.viewInside.classList.add('active');
                break;
        }
    }
    
    takeScreenshot() {
        this.simulationScene.takeScreenshot();
        this.updateStatus('截图已保存');
        
        setTimeout(() => {
            this.updateStatus('就绪 - 点击播放开始模拟');
        }, 2000);
    }
    
    toggleControlPanel() {
        this.elements.controlPanel.classList.toggle('hidden');
    }
    
    toggleDataPanel() {
        this.elements.dataPanel.classList.toggle('hidden');
    }
    
    showControlPanel() {
        this.elements.controlPanel.classList.remove('hidden');
    }
    
    showDataPanel() {
        this.elements.dataPanel.classList.remove('hidden');
    }
    
    toggleDataPanelVisibility(show) {
        if (show) {
            this.elements.dataPanel.classList.remove('hidden');
        }
    }
    
    showHelp() {
        this.elements.helpModal.classList.remove('hidden');
    }
    
    hideHelp() {
        this.elements.helpModal.classList.add('hidden');
    }
    
    handleKeydown(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'KeyR':
                this.replay();
                break;
            case 'Escape':
                this.hideHelp();
                break;
        }
    }
    
    updatePlayButton() {
        if (this.simulationState.isPlaying) {
            this.elements.playIcon.textContent = '⏸';
            this.elements.playBtn.classList.add('active');
            this.updateStatus('正在模拟进行中...');
        } else {
            this.elements.playIcon.textContent = '▶';
            this.elements.playBtn.classList.remove('active');
            this.updateStatus('已暂停 - 点击播放继续');
        }
    }
    
    updateUI(state) {
        if (state.isPlaying !== undefined) {
            this.updatePlayButton();
        }
    }
    
    updateDataPanel(data) {
        if (!this.simulationState.showData) return;
        
        this.elements.stageValue.textContent = data.stage;
        this.elements.cloudThickness.textContent = data.cloudThickness;
        this.elements.cloudDensity.textContent = data.cloudDensity;
        this.elements.positiveCharge.textContent = data.positiveCharge;
        this.elements.negativeCharge.textContent = data.negativeCharge;
        this.elements.chargeSeparation.textContent = data.chargeSeparation;
        this.elements.lightningVoltage.textContent = data.lightningVoltage;
        this.elements.lightningCurrent.textContent = data.lightningCurrent;
        this.elements.thunderIntensity.textContent = data.thunderIntensity;
        this.elements.simulationTime.textContent = data.simulationTime;
    }
    
    updateStatus(text) {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = text;
        }
    }
    
    getStageDescription(stage) {
        const descriptions = {
            [SimulationStages.IDLE]: '准备开始模拟',
            [SimulationStages.MOISTURE_RISING]: '水汽正在上升',
            [SimulationStages.CLOUD_FORMING]: '乌云正在形成',
            [SimulationStages.CHARGE_SEPARATION]: '电荷正在分离',
            [SimulationStages.LIGHTNING]: '闪电放电中',
            [SimulationStages.THUNDER]: '雷声传播中',
            [SimulationStages.COMPLETED]: '模拟已完成'
        };
        return descriptions[stage] || '未知状态';
    }
}
