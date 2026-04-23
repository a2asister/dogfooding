import { SimulationScene } from './modules/simulationScene.js';
import { SimulationState } from './modules/simulationState.js';
import { UIController } from './modules/uiController.js';
import { KnowledgeSystem } from './modules/knowledgeSystem.js';

class ThunderstormSimulator {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.simulationState = new SimulationState();
        this.simulationScene = new SimulationScene(this.container, this.simulationState);
        this.uiController = new UIController(this.simulationState, this.simulationScene);
        this.knowledgeSystem = new KnowledgeSystem(this.simulationState);
        
        this.isRunning = false;
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.simulationScene.init();
        this.knowledgeSystem.init();
        console.log('雷雨形成模拟程序初始化完成');
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        
        this.simulationState.on('stateChange', (state) => {
            this.uiController.updateUI(state);
            this.knowledgeSystem.checkKnowledgePoints(state);
        });
        
        this.simulationState.on('dataUpdate', (data) => {
            this.uiController.updateDataPanel(data);
        });
        
        this.simulationState.on('reset', () => {
            this.simulationScene.reset();
            this.knowledgeSystem.reset();
        });
    }
    
    onResize() {
        this.simulationScene.onResize();
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (this.simulationState.isPlaying) {
            const scaledDelta = deltaTime * this.simulationState.speed;
            this.simulationScene.update(scaledDelta);
            this.simulationState.update(scaledDelta);
        }
        
        this.simulationScene.render();
    }
    
    togglePlay() {
        this.simulationState.togglePlay();
        this.start();
    }
    
    replay() {
        this.simulationState.reset();
        this.simulationScene.reset();
        this.knowledgeSystem.reset();
    }
    
    takeScreenshot() {
        return this.simulationScene.takeScreenshot();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const simulator = new ThunderstormSimulator();
    simulator.start();
});
