class Controls {
    constructor(app) {
        this.app = app;
        this.isPlaying = true;
        this.windLevel = CONFIG.windSpeed.defaultLevel;
        this.turbineType = 'horizontal';
        this.sceneType = 'land';
        
        this.init();
    }
    
    init() {
        this.bindPlayControls();
        this.bindWindSpeedControl();
        this.bindTurbineTypeControl();
        this.bindSceneControl();
        this.bindTopControls();
        this.bindHelpModal();
    }
    
    bindPlayControls() {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        playBtn.addEventListener('click', () => {
            this.setPlaying(true);
            this.app.setPlaying(true);
            
            playBtn.classList.add('active');
            pauseBtn.classList.remove('active');
        });
        
        pauseBtn.addEventListener('click', () => {
            this.setPlaying(false);
            this.app.setPlaying(false);
            
            pauseBtn.classList.add('active');
            playBtn.classList.remove('active');
        });
        
        resetBtn.addEventListener('click', () => {
            this.app.reset();
            this.resetUI();
        });
    }
    
    bindWindSpeedControl() {
        const windSlider = document.getElementById('wind-speed');
        const windValue = document.getElementById('wind-speed-value');
        
        windSlider.addEventListener('input', (e) => {
            this.windLevel = parseInt(e.target.value);
            const windData = Utils.getWindSpeedData(this.windLevel);
            windValue.textContent = `${this.windLevel}级 (${windData.name})`;
            this.app.setWindLevel(this.windLevel);
        });
    }
    
    bindTurbineTypeControl() {
        const horizontalBtn = document.getElementById('horizontal-type');
        const verticalBtn = document.getElementById('vertical-type');
        
        horizontalBtn.addEventListener('click', () => {
            if (this.turbineType !== 'horizontal') {
                this.turbineType = 'horizontal';
                this.app.switchTurbineType('horizontal');
                
                horizontalBtn.classList.add('active');
                verticalBtn.classList.remove('active');
            }
        });
        
        verticalBtn.addEventListener('click', () => {
            if (this.turbineType !== 'vertical') {
                this.turbineType = 'vertical';
                this.app.switchTurbineType('vertical');
                
                verticalBtn.classList.add('active');
                horizontalBtn.classList.remove('active');
            }
        });
    }
    
    bindSceneControl() {
        const landBtn = document.getElementById('land-scene');
        const seaBtn = document.getElementById('sea-scene');
        
        landBtn.addEventListener('click', () => {
            if (this.sceneType !== 'land') {
                this.sceneType = 'land';
                this.app.switchScene('land');
                
                landBtn.classList.add('active');
                seaBtn.classList.remove('active');
            }
        });
        
        seaBtn.addEventListener('click', () => {
            if (this.sceneType !== 'sea') {
                this.sceneType = 'sea';
                this.app.switchScene('sea');
                
                seaBtn.classList.add('active');
                landBtn.classList.remove('active');
            }
        });
    }
    
    bindTopControls() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                fullscreenBtn.textContent = '⛶ 退出全屏';
            } else {
                fullscreenBtn.textContent = '⛶ 全屏';
            }
        });
    }
    
    bindHelpModal() {
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        const closeBtn = helpModal.querySelector('.close-btn');
        const tabBtns = helpModal.querySelectorAll('.tab-btn');
        const tabContents = helpModal.querySelectorAll('.tab-content');
        
        helpBtn.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
        });
        
        closeBtn.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });
        
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(`tab-${tabName}`).classList.add('active');
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
                helpModal.classList.add('hidden');
            }
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('全屏请求失败:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    setPlaying(playing) {
        this.isPlaying = playing;
    }
    
    getWindLevel() {
        return this.windLevel;
    }
    
    getTurbineType() {
        return this.turbineType;
    }
    
    getSceneType() {
        return this.sceneType;
    }
    
    resetUI() {
        this.windLevel = CONFIG.windSpeed.defaultLevel;
        const windSlider = document.getElementById('wind-speed');
        const windValue = document.getElementById('wind-speed-value');
        windSlider.value = this.windLevel;
        const windData = Utils.getWindSpeedData(this.windLevel);
        windValue.textContent = `${this.windLevel}级 (${windData.name})`;
        
        this.setPlaying(true);
        document.getElementById('play-btn').classList.add('active');
        document.getElementById('pause-btn').classList.remove('active');
        
        if (this.turbineType !== 'horizontal') {
            this.turbineType = 'horizontal';
            document.getElementById('horizontal-type').classList.add('active');
            document.getElementById('vertical-type').classList.remove('active');
        }
        
        if (this.sceneType !== 'land') {
            this.sceneType = 'land';
            document.getElementById('land-scene').classList.add('active');
            document.getElementById('sea-scene').classList.remove('active');
        }
    }
}
