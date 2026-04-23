class EarthquakeSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.isPlaying = false;
        this.animationId = null;
        this.startTime = 0;
        this.pausedTime = 0;
        
        this.defaultParams = {
            magnitude: 5.0,
            depth: 30,
            terrain: 'plain'
        };
        
        this.params = { ...this.defaultParams };
        
        this.earthLayers = [
            { name: '地壳', depth: 35, color: '#8B7355', thickness: 50 },
            { name: '上地幔', depth: 660, color: '#CD853F', thickness: 70 },
            { name: '下地幔', depth: 2891, color: '#DAA520', thickness: 90 },
            { name: '外核', depth: 5150, color: '#FFD700', thickness: 70 },
            { name: '内核', depth: 6371, color: '#FFA500', thickness: 50 }
        ];
        
        this.pWaves = [];
        this.sWaves = [];
        this.groundShake = { x: 0, y: 0, intensity: 0 };
        this.damageLevel = 0;
        
        this.isoseismalLines = [];
        this.buildings = [];
        this.particles = [];
        
        this.performance = {
            fps: 60,
            lastFrameTime: 0,
            frameCount: 0,
            lastFpsUpdate: 0
        };
        
        this.buildingSeed = 12345;
        
        this.init();
    }
    
    seededRandom() {
        this.buildingSeed = (this.buildingSeed * 9301 + 49297) % 233280;
        return this.buildingSeed / 233280;
    }
    
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.updateUI();
        this.updateDataPanel();
        this.generateBuildings();
        this.updateIsoseismalLines(0);
        this.render();
    }
    
    resizeCanvas() {
        const displayWidth = this.canvas.offsetWidth;
        const displayHeight = this.canvas.offsetHeight;
        
        if (displayWidth === 0 || displayHeight === 0) {
            setTimeout(() => this.resizeCanvas(), 50);
            return;
        }
        
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        
        this.centerX = this.canvas.width / 2;
        this.surfaceY = this.canvas.height * 0.35;
        this.hypocenterDepth = this.surfaceY + (this.params.depth / 700) * (this.canvas.height * 0.55);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.generateBuildings();
            this.updateIsoseismalLines(0);
            if (!this.isPlaying) this.render();
        });
        
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('resetDefaultsBtn').addEventListener('click', () => this.resetDefaults());
        
        const magnitudeSlider = document.getElementById('magnitudeSlider');
        magnitudeSlider.addEventListener('input', (e) => {
            this.params.magnitude = parseFloat(e.target.value);
            this.onParameterChange();
        });
        
        const depthSlider = document.getElementById('depthSlider');
        depthSlider.addEventListener('input', (e) => {
            this.params.depth = parseInt(e.target.value);
            this.hypocenterDepth = this.surfaceY + (this.params.depth / 700) * (this.canvas.height * 0.55);
            this.onParameterChange();
        });
        
        const terrainSelect = document.getElementById('terrainSelect');
        terrainSelect.addEventListener('change', (e) => {
            this.params.terrain = e.target.value;
            this.generateBuildings();
            this.onParameterChange();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        
        document.querySelectorAll('.education-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showEducationModal(e.target.dataset.type);
            });
        });
        
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('educationModal').addEventListener('click', (e) => {
            if (e.target.id === 'educationModal') this.closeModal();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }
    
    onParameterChange() {
        this.updateUI();
        this.updateDataPanel();
        this.updateIsoseismalLines(0);
        if (!this.isPlaying) {
            this.render();
        }
    }
    
    updateUI() {
        document.getElementById('magnitudeSlider').value = this.params.magnitude;
        document.getElementById('magnitudeValue').textContent = this.params.magnitude.toFixed(1);
        document.getElementById('depthSlider').value = this.params.depth;
        document.getElementById('depthValue').textContent = this.params.depth;
        document.getElementById('terrainSelect').value = this.params.terrain;
    }
    
    updateDataPanel() {
        document.getElementById('dataMagnitude').textContent = this.params.magnitude.toFixed(1);
        document.getElementById('dataDepth').textContent = this.params.depth;
        
        let earthquakeType = '';
        if (this.params.depth <= 70) {
            earthquakeType = '浅源地震';
        } else if (this.params.depth <= 300) {
            earthquakeType = '中源地震';
        } else {
            earthquakeType = '深源地震';
        }
        document.getElementById('earthquakeType').textContent = earthquakeType;
        
        document.getElementById('currentStatus').textContent = this.isPlaying ? '模拟中' : '待机';
        
        this.updateDamageInfo();
    }
    
    updateDamageInfo() {
        const magnitude = this.params.magnitude;
        let damageText = '';
        
        if (magnitude < 2.0) {
            damageText = '微震：仪器可测，人无感觉，无破坏';
        } else if (magnitude < 3.0) {
            damageText = '小震：少数敏感人可察觉，无破坏';
        } else if (magnitude < 4.0) {
            damageText = '弱震：多数人有感，门窗轻微响动，无破坏';
        } else if (magnitude < 5.0) {
            damageText = '中强震：室内物品掉落，墙体可能出现细裂纹，轻微破坏';
        } else if (magnitude < 6.0) {
            damageText = '强震：墙壁开裂，部分老旧建筑受损，可能有人员受伤';
        } else if (magnitude < 7.0) {
            damageText = '大地震：大量建筑受损，部分倒塌，地面可能出现裂缝，需紧急救援';
        } else if (magnitude < 8.0) {
            damageText = '巨大地震：严重破坏，大量建筑倒塌，地面变形，生命线工程中断，重大伤亡';
        } else {
            damageText = '特大地震：毁灭性破坏，几乎所有建筑倒塌，地形巨变，海啸风险极高，全球性影响';
        }
        
        document.getElementById('damageInfo').innerHTML = `<p><strong>${magnitude.toFixed(1)}级地震</strong>：${damageText}</p>`;
    }
    
    generateBuildings() {
        this.buildings = [];
        this.buildingSeed = 12345;
        
        const buildingCount = this.params.terrain === 'city' ? 18 : (this.params.terrain === 'mountain' ? 6 : 12);
        
        for (let i = 0; i < buildingCount; i++) {
            const x = 80 + (this.canvas.width - 160) * (i + 1) / (buildingCount + 1);
            let height, width;
            
            if (this.params.terrain === 'city') {
                height = 60 + this.seededRandom() * 140;
                width = 35 + this.seededRandom() * 35;
            } else if (this.params.terrain === 'mountain') {
                height = 25 + this.seededRandom() * 35;
                width = 45 + this.seededRandom() * 25;
            } else {
                height = 35 + this.seededRandom() * 55;
                width = 45 + this.seededRandom() * 35;
            }
            
            this.buildings.push({
                x: x,
                baseY: this.surfaceY,
                width: width,
                height: height,
                damage: 0,
                shake: 0,
                originalHeight: height,
                tilt: 0
            });
        }
    }
    
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        
        if (this.pausedTime === 0) {
            this.startTime = performance.now();
            this.pWaves = [];
            this.sWaves = [];
            this.particles = [];
        } else {
            this.startTime = performance.now() - (this.pausedTime - this.startTime);
        }
        
        this.updateDataPanel();
        this.animate();
    }
    
    pause() {
        this.isPlaying = false;
        this.pausedTime = performance.now();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.updateDataPanel();
    }
    
    reset() {
        this.isPlaying = false;
        this.pausedTime = 0;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.pWaves = [];
        this.sWaves = [];
        this.particles = [];
        this.groundShake = { x: 0, y: 0, intensity: 0 };
        this.damageLevel = 0;
        
        this.buildings.forEach(b => {
            b.damage = 0;
            b.shake = 0;
            b.height = b.originalHeight;
            b.tilt = 0;
        });
        
        this.performance.frameCount = 0;
        this.updateDataPanel();
        this.updateIsoseismalLines(0);
        this.render();
    }
    
    resetDefaults() {
        this.params = { ...this.defaultParams };
        this.hypocenterDepth = this.surfaceY + (this.params.depth / 700) * (this.canvas.height * 0.55);
        this.generateBuildings();
        this.updateUI();
        this.updateDataPanel();
        this.reset();
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('全屏请求失败:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    showHelp() {
        this.showEducationModal('basic');
    }
    
    showEducationModal(type) {
        const modal = document.getElementById('educationModal');
        const title = document.getElementById('modalTitle');
        const content = document.getElementById('modalContent');
        
        const contentData = {
            basic: {
                title: '地震基础概念',
                content: `
                    <h4>什么是地震？</h4>
                    <p>地震是地球内部能量突然释放造成的地表震动。当地下岩石承受的应力超过其强度时，会发生断裂或滑动，产生地震波，引起地面震动。</p>
                    
                    <h4>地震波类型</h4>
                    <p><strong>P波（纵波）：</strong>传播速度最快，约5-7 km/s，可在固体、液体中传播，引起地表上下震动。</p>
                    <p><strong>S波（横波）：</strong>传播速度较慢，约3-4 km/s，只能在固体中传播，引起地表水平晃动，破坏性更大。</p>
                    
                    <h4>震级与烈度</h4>
                    <p><strong>震级：</strong>衡量地震释放能量大小的指标，每增加1级，能量约增加32倍。</p>
                    <p><strong>烈度：</strong>衡量地震对地表影响程度的指标，受震级、震源深度、距离等因素影响。</p>
                    
                    <h4>震源深度</h4>
                    <p><strong>浅源地震：</strong>震源深度≤70km，破坏性最大</p>
                    <p><strong>中源地震：</strong>震源深度71-300km</p>
                    <p><strong>深源地震：</strong>震源深度>300km，通常破坏性较小</p>
                `
            },
            indoor: {
                title: '室内应急避险',
                content: `
                    <h4>地震发生时（室内）</h4>
                    <ol>
                        <li><strong>保持冷静，不要惊慌</strong></li>
                        <li><strong>就近躲避：</strong>蹲或趴在坚固的家具旁边，或躲在墙角，保护好头部</li>
                        <li><strong>远离危险区域：</strong>窗户、厨房、阳台、楼梯间、电梯</li>
                        <li><strong>如果在高楼：</strong>不要跳楼，不要使用电梯</li>
                        <li><strong>如果在平房：</strong>可快速跑到室外开阔地带</li>
                    </ol>
                    
                    <h4>地震结束后</h4>
                    <ol>
                        <li>关闭燃气、电源、水源</li>
                        <li>检查房屋是否有损坏，如墙体开裂、天花板松动等</li>
                        <li>如房屋受损严重，应立即撤离</li>
                        <li>远离可能倒塌的建筑物、广告牌、电线杆</li>
                        <li>注意余震，余震可能造成更大破坏</li>
                    </ol>
                    
                    <h4>应急物品准备</h4>
                    <p>建议在家中常备：饮用水、干粮、手电筒、收音机、急救包、常用药品、重要证件复印件等。</p>
                `
            },
            outdoor: {
                title: '室外应急避险',
                content: `
                    <h4>地震发生时（室外）</h4>
                    <ol>
                        <li><strong>保持冷静，观察周围环境</strong></li>
                        <li><strong>远离危险建筑：</strong>高大建筑物、广告牌、霓虹灯架、变压器、电线杆等</li>
                        <li><strong>寻找开阔地带：</strong>广场、公园、操场等空旷区域</li>
                        <li><strong>如果在车内：</strong>立即停车，选择开阔安全的地点，不要在桥下、高楼旁停车</li>
                        <li><strong>如果在山区：</strong>注意滑坡、滚石、泥石流，远离山崖陡坡</li>
                    </ol>
                    
                    <h4>特殊情况处理</h4>
                    <h5>在商场、影院等公共场所</h5>
                    <p>就地蹲下或趴在椅子旁边，注意避开吊灯、电扇等悬挂物，地震过后听从工作人员指挥有序撤离。</p>
                    
                    <h5>在地铁、火车上</h5>
                    <p>抓住扶手，避免摔倒，待地震过后按照工作人员指引有序撤离。</p>
                    
                    <h5>遇到海啸</h5>
                    <p>如在海边，发现海面异常下降或听到海啸警报，应立即向高处撤离，远离海岸线。</p>
                    
                    <h4>地震后注意事项</h4>
                    <p>• 远离危楼、废墟</p>
                    <p>• 不盲目返回室内</p>
                    <p>• 关注官方发布的地震信息</p>
                    <p>• 保持通讯畅通</p>
                    <p>• 参与自救互救时注意安全</p>
                `
            }
        };
        
        const data = contentData[type] || contentData.basic;
        title.textContent = data.title;
        content.innerHTML = data.content;
        
        modal.classList.remove('hidden');
    }
    
    closeModal() {
        const modal = document.getElementById('educationModal');
        modal.classList.add('hidden');
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        const currentTime = performance.now();
        const elapsed = (currentTime - this.startTime) / 1000;
        
        this.updatePerformance(currentTime);
        this.updateWaves(elapsed);
        this.updateGroundShake(elapsed);
        this.updateBuildings();
        this.updateParticles();
        this.updateIsoseismalLines(elapsed);
        
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updatePerformance(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime - this.performance.lastFpsUpdate >= 1000) {
            this.performance.fps = Math.round(
                (this.performance.frameCount * 1000) / (currentTime - this.performance.lastFpsUpdate)
            );
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;
            
            document.getElementById('fpsValue').textContent = this.performance.fps;
        }
    }
    
    updateWaves(elapsed) {
        const waveSpeed = 100 + this.params.magnitude * 40;
        
        const pWaveSpeed = waveSpeed;
        const sWaveSpeed = waveSpeed * 0.55;
        
        if (elapsed < 15) {
            if (this.pWaves.length === 0 || elapsed - (this.pWaves[this.pWaves.length - 1]?.createdAt || 0) > 0.05) {
                this.pWaves.push({
                    radius: elapsed * pWaveSpeed,
                    opacity: 0.8,
                    createdAt: elapsed
                });
                
                this.sWaves.push({
                    radius: elapsed * sWaveSpeed,
                    opacity: 0.8,
                    createdAt: elapsed
                });
            }
        }
        
        this.pWaves.forEach(wave => {
            const age = elapsed - wave.createdAt;
            wave.opacity = Math.max(0, 0.8 - age / 8);
        });
        
        this.sWaves.forEach(wave => {
            const age = elapsed - wave.createdAt;
            wave.opacity = Math.max(0, 0.8 - age / 10);
        });
        
        this.pWaves = this.pWaves.filter(w => w.opacity > 0.01);
        this.sWaves = this.sWaves.filter(w => w.opacity > 0.01);
    }
    
    updateGroundShake(elapsed) {
        const shakeIntensity = Math.pow(10, this.params.magnitude - 5) * 0.15;
        const duration = 3 + this.params.magnitude * 1.5;
        
        if (elapsed < duration) {
            const decay = 1 - elapsed / duration;
            this.groundShake.intensity = shakeIntensity * decay;
            
            const frequency = 8 + this.params.magnitude * 2;
            const phase = elapsed * frequency * Math.PI * 2;
            
            this.groundShake.x = Math.sin(phase) * this.groundShake.intensity * 15;
            this.groundShake.y = Math.sin(phase * 0.7 + 1) * this.groundShake.intensity * 8;
        } else {
            this.groundShake = { x: 0, y: 0, intensity: 0 };
        }
    }
    
    updateBuildings() {
        const damageRate = this.params.magnitude / 9;
        const depthFactor = Math.max(0, 1 - this.params.depth / 700);
        const totalDamageRate = damageRate * depthFactor * this.groundShake.intensity * 0.3;
        
        this.buildings.forEach(building => {
            const distanceFactor = 1 - Math.abs(building.x - this.centerX) / (this.canvas.width * 0.6);
            const effectiveDistanceFactor = Math.max(0.2, distanceFactor);
            
            const shakeAmplitude = this.groundShake.x * (0.5 + Math.random() * 0.5) * (1 + building.originalHeight / 200);
            building.shake = shakeAmplitude;
            
            building.tilt = shakeAmplitude * 0.003 * (1 + building.originalHeight / 150);
            
            building.damage += totalDamageRate * effectiveDistanceFactor * 0.008;
            building.damage = Math.min(1, building.damage);
            
            if (building.damage > 0.7) {
                building.height = building.originalHeight * (1 - (building.damage - 0.7) * 2);
            }
        });
    }
    
    updateParticles() {
        if (this.groundShake.intensity > 0.1 && Math.random() < 0.3) {
            const particleX = this.centerX + (Math.random() - 0.5) * 200;
            this.particles.push({
                x: particleX,
                y: this.surfaceY,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 5 - 2,
                life: 1,
                size: Math.random() * 4 + 2
            });
        }
        
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15;
            p.life -= 0.02;
        });
        
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    updateIsoseismalLines(elapsed) {
        const maxRadius = 300 + this.params.magnitude * 60;
        
        this.isoseismalLines = [
            { radius: maxRadius * 0.15, intensity: 9, color: 'rgba(220, 38, 38, 0.7)', label: '烈度IX' },
            { radius: maxRadius * 0.3, intensity: 8, color: 'rgba(245, 101, 101, 0.6)', label: '烈度VIII' },
            { radius: maxRadius * 0.45, intensity: 7, color: 'rgba(251, 146, 60, 0.5)', label: '烈度VII' },
            { radius: maxRadius * 0.6, intensity: 6, color: 'rgba(251, 191, 36, 0.4)', label: '烈度VI' },
            { radius: maxRadius * 0.8, intensity: 5, color: 'rgba(72, 187, 120, 0.3)', label: '烈度V' },
            { radius: maxRadius, intensity: 4, color: 'rgba(66, 153, 225, 0.2)', label: '烈度IV' }
        ];
    }
    
    render() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        this.drawSky();
        
        if (this.params.terrain === 'mountain') {
            this.drawBackgroundMountains();
        }
        
        this.drawIsoseismalLines();
        
        ctx.save();
        ctx.translate(this.groundShake.x * 0.2, this.groundShake.y * 0.2);
        
        this.drawTerrainSurface();
        
        ctx.restore();
        
        this.drawBuildings();
        this.drawWaves();
        this.drawMarkers();
        this.drawEarthLayers();
        this.drawParticles();
        
        this.drawWaveLegend();
    }
    
    drawSky() {
        const ctx = this.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.surfaceY);
        
        if (this.params.terrain === 'mountain') {
            gradient.addColorStop(0, '#4a6fa5');
            gradient.addColorStop(0.5, '#7aa3c8');
            gradient.addColorStop(1, '#b8d4e8');
        } else {
            gradient.addColorStop(0, '#6bb3f5');
            gradient.addColorStop(0.7, '#a8d8ff');
            gradient.addColorStop(1, '#e0f4ff');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.surfaceY + 20);
        
        this.drawClouds();
    }
    
    drawClouds() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        const clouds = [
            { x: 100, y: 60, size: 40 },
            { x: 300, y: 80, size: 50 },
            { x: 500, y: 50, size: 35 },
            { x: 700, y: 90, size: 45 }
        ];
        
        clouds.forEach(cloud => {
            if (cloud.x > this.canvas.width * 0.1 && cloud.x < this.canvas.width * 0.9) {
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.1, cloud.size * 0.4, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.size * 0.4, cloud.y + cloud.size * 0.1, cloud.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    drawBackgroundMountains() {
        const ctx = this.ctx;
        
        ctx.fillStyle = 'rgba(90, 130, 180, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, this.surfaceY);
        
        for (let x = 0; x <= this.canvas.width; x += 60) {
            const y = this.surfaceY - this.getMountainHeight(x, 150, 0.015);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(this.canvas.width, this.surfaceY);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(70, 110, 140, 0.5)';
        ctx.beginPath();
        ctx.moveTo(0, this.surfaceY);
        
        for (let x = 0; x <= this.canvas.width; x += 40) {
            const y = this.surfaceY - this.getMountainHeight(x + 100, 100, 0.02);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(this.canvas.width, this.surfaceY);
        ctx.closePath();
        ctx.fill();
    }
    
    getMountainHeight(x, maxHeight, frequency) {
        const wave1 = Math.sin(x * frequency) * maxHeight * 0.6;
        const wave2 = Math.sin(x * frequency * 2.5) * maxHeight * 0.3;
        const wave3 = Math.sin(x * frequency * 0.5) * maxHeight * 0.4;
        return Math.abs(wave1 + wave2 + wave3);
    }
    
    drawTerrainSurface() {
        const ctx = this.ctx;
        
        if (this.params.terrain === 'mountain') {
            this.drawMountainTerrain();
        } else if (this.params.terrain === 'city') {
            this.drawCityTerrain();
        } else {
            this.drawPlainTerrain();
        }
    }
    
    drawPlainTerrain() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#4a7c23';
        ctx.fillRect(0, this.surfaceY, this.canvas.width, 25);
        
        ctx.strokeStyle = '#3d6620';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, this.surfaceY);
            ctx.lineTo(x + 10, this.surfaceY - 5);
            ctx.stroke();
        }
        
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, this.surfaceY + 25, this.canvas.width, this.canvas.height - this.surfaceY - 25);
    }
    
    drawMountainTerrain() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.moveTo(0, this.surfaceY);
        
        for (let x = 0; x <= this.canvas.width; x += 30) {
            const y = this.surfaceY - this.getMountainHeight(x, 60, 0.025);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(this.canvas.width, this.surfaceY);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#6a4f42';
        for (let x = 100; x < this.canvas.width; x += 250) {
            const peakY = this.surfaceY - this.getMountainHeight(x, 60, 0.025);
            if (peakY < this.surfaceY - 30) {
                ctx.fillStyle = '#e8e8e8';
                ctx.beginPath();
                ctx.moveTo(x - 20, peakY + 20);
                ctx.lineTo(x, peakY);
                ctx.lineTo(x + 20, peakY + 20);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, this.surfaceY, this.canvas.width, this.canvas.height - this.surfaceY);
    }
    
    drawCityTerrain() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#505050';
        ctx.fillRect(0, this.surfaceY, this.canvas.width, 8);
        
        ctx.fillStyle = '#606060';
        ctx.fillRect(0, this.surfaceY + 8, this.canvas.width, 12);
        
        ctx.fillStyle = '#f0e68c';
        for (let x = 50; x < this.canvas.width; x += 80) {
            ctx.fillRect(x, this.surfaceY + 12, 40, 3);
        }
        
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, this.surfaceY + 20, this.canvas.width, this.canvas.height - this.surfaceY - 20);
    }
    
    drawEarthLayers() {
        const ctx = this.ctx;
        const centerX = this.centerX;
        
        const layerStartY = this.surfaceY + 30;
        const availableHeight = this.canvas.height - layerStartY - 20;
        
        let currentY = layerStartY;
        
        this.earthLayers.forEach((layer, index) => {
            const layerHeight = layer.thickness * (availableHeight / 330);
            
            const gradient = ctx.createLinearGradient(0, currentY, 0, currentY + layerHeight);
            gradient.addColorStop(0, layer.color);
            gradient.addColorStop(1, this.darkenColor(layer.color, 0.35));
            
            ctx.fillStyle = gradient;
            ctx.fillRect(centerX - 180, currentY, 360, layerHeight);
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(centerX - 180, currentY, 360, layerHeight);
            
            if (index < this.earthLayers.length - 1) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 3]);
                ctx.beginPath();
                ctx.moveTo(centerX - 180, currentY + layerHeight);
                ctx.lineTo(centerX + 180, currentY + layerHeight);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(layer.name, centerX + 195, currentY + layerHeight / 2 + 4);
            
            ctx.font = '10px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(`深度: ${layer.depth}km`, centerX + 195, currentY + layerHeight / 2 + 18);
            
            currentY += layerHeight;
        });
        
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, this.surfaceY);
        ctx.lineTo(centerX, layerStartY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgb(${Math.floor(r * (1 - factor))}, ${Math.floor(g * (1 - factor))}, ${Math.floor(b * (1 - factor))})`;
    }
    
    drawIsoseismalLines() {
        const ctx = this.ctx;
        const centerX = this.centerX;
        const epicenterY = this.surfaceY;
        
        this.isoseismalLines.forEach((line, index) => {
            ctx.strokeStyle = line.color;
            ctx.lineWidth = index < 3 ? 3 : 2;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.ellipse(centerX, epicenterY, line.radius, line.radius * 0.25, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            if (index % 2 === 0 && this.isPlaying) {
                const labelX = centerX + line.radius + 15;
                if (labelX < this.canvas.width - 60) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText(line.label, labelX, epicenterY + 4);
                }
            }
        });
    }
    
    drawWaves() {
        const ctx = this.ctx;
        const hypocenterX = this.centerX;
        const hypocenterY = this.hypocenterDepth;
        
        this.sWaves.forEach(wave => {
            if (wave.opacity <= 0.01) return;
            
            ctx.save();
            ctx.translate(hypocenterX, hypocenterY);
            
            ctx.strokeStyle = `rgba(237, 137, 54, ${wave.opacity * 0.7})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 6]);
            ctx.beginPath();
            ctx.arc(0, 0, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.restore();
        });
        
        this.pWaves.forEach(wave => {
            if (wave.opacity <= 0.01) return;
            
            ctx.save();
            ctx.translate(hypocenterX, hypocenterY);
            
            ctx.strokeStyle = `rgba(66, 153, 225, ${wave.opacity * 0.8})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        });
    }
    
    drawWaveLegend() {
        const ctx = this.ctx;
        const legendX = 20;
        const legendY = this.surfaceY - 60;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(legendX - 5, legendY - 10, 120, 45);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX - 5, legendY - 10, 120, 45);
        
        ctx.fillStyle = '#4299e1';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('P波 (纵波)', legendX, legendY + 5);
        
        ctx.fillStyle = '#ed8936';
        ctx.fillText('S波 (横波)', legendX, legendY + 25);
        
        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(95, legendY - 3);
        ctx.lineTo(110, legendY - 3);
        ctx.stroke();
        
        ctx.strokeStyle = '#ed8936';
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(95, legendY + 17);
        ctx.lineTo(110, legendY + 17);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawMarkers() {
        const ctx = this.ctx;
        const centerX = this.centerX;
        const epicenterY = this.surfaceY;
        const hypocenterY = this.hypocenterDepth;
        
        ctx.save();
        ctx.translate(this.groundShake.x * 0.3, 0);
        
        ctx.fillStyle = '#e53e3e';
        ctx.beginPath();
        ctx.moveTo(centerX, epicenterY - 25);
        ctx.lineTo(centerX - 10, epicenterY - 50);
        ctx.lineTo(centerX, epicenterY - 45);
        ctx.lineTo(centerX + 10, epicenterY - 50);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#e53e3e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, epicenterY, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX, epicenterY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.isPlaying) {
            const pulseRadius = 10 + Math.sin(performance.now() / 150) * 5;
            ctx.strokeStyle = 'rgba(229, 62, 62, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, epicenterY, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.strokeStyle = 'rgba(229, 62, 62, 0.6)';
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, epicenterY);
        ctx.lineTo(centerX, hypocenterY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.strokeStyle = 'rgba(229, 62, 62, 0.3)';
        ctx.setLineDash([3, 6]);
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = epicenterY + (hypocenterY - epicenterY) * (i + 1) / 6;
            ctx.beginPath();
            ctx.moveTo(centerX - 15, y);
            ctx.lineTo(centerX + 15, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.arc(centerX, hypocenterY, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#dd6b20';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        if (this.isPlaying) {
            const innerGlow = 15 + Math.sin(performance.now() / 200) * 3;
            ctx.beginPath();
            ctx.arc(centerX, hypocenterY, innerGlow, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const pulseRings = [20, 25, 30];
            pulseRings.forEach((r, i) => {
                const phase = (performance.now() / 300 + i) % 3;
                const opacity = phase < 1 ? phase : (phase < 2 ? 2 - phase : 0);
                if (opacity > 0) {
                    ctx.beginPath();
                    ctx.arc(centerX, hypocenterY, r + phase * 10, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(221, 107, 32, ${opacity * 0.4})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        }
        
        ctx.fillStyle = '#e53e3e';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('震中', centerX + 25, epicenterY - 35);
        
        ctx.font = '11px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillText('(地面正上方)', centerX + 25, epicenterY - 20);
        
        ctx.fillStyle = '#dd6b20';
        ctx.font = 'bold 13px Arial';
        ctx.fillText('震源', centerX + 25, hypocenterY + 5);
        
        ctx.font = '11px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillText(`(深度: ${this.params.depth}km)`, centerX + 25, hypocenterY + 20);
        
        ctx.restore();
    }
    
    drawBuildings() {
        const ctx = this.ctx;
        const shakeX = this.groundShake.x;
        
        ctx.save();
        ctx.translate(shakeX * 0.3, 0);
        
        this.buildings.forEach((building, index) => {
            ctx.save();
            
            const buildingShake = building.shake;
            const tiltAngle = building.tilt;
            
            ctx.translate(building.x, building.baseY);
            ctx.rotate(tiltAngle);
            
            const damageFactor = 1 - building.damage;
            
            if (this.params.terrain === 'city') {
                this.drawModernBuilding(building, damageFactor);
            } else {
                this.drawHouse(building, damageFactor);
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }
    
    drawModernBuilding(building, damageFactor) {
        const ctx = this.ctx;
        const halfWidth = building.width / 2;
        const height = building.originalHeight * Math.max(0.1, damageFactor);
        
        if (height <= 5) return;
        
        const gradient = ctx.createLinearGradient(-halfWidth, 0, halfWidth, 0);
        gradient.addColorStop(0, '#4a5568');
        gradient.addColorStop(0.3, '#718096');
        gradient.addColorStop(0.7, '#718096');
        gradient.addColorStop(1, '#4a5568');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-halfWidth, -height, building.width, height);
        
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfWidth, -height, building.width, height);
        
        const windowRows = Math.max(2, Math.floor(height / 28));
        const windowCols = Math.max(1, Math.floor(building.width / 16));
        
        for (let row = 1; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const windowX = -halfWidth + 6 + col * 16;
                const windowY = -height + 10 + row * 28;
                
                if (windowY < -height + 8) continue;
                
                const windowState = (row + col) % 3;
                if (damageFactor > 0.3 || windowState !== 0) {
                    const lightOn = Math.random() < 0.6;
                    ctx.fillStyle = lightOn ? '#ffeaa7' : '#74b9ff';
                    ctx.fillRect(windowX, windowY, 12, 18);
                    
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(windowX, windowY, 12, 18);
                }
            }
        }
        
        if (damageFactor < 0.7) {
            this.drawBuildingDamage(building, height, damageFactor);
        }
        
        if (damageFactor < 0.3 && this.isPlaying) {
            this.drawDebris(building, height);
        }
    }
    
    drawHouse(building, damageFactor) {
        const ctx = this.ctx;
        const halfWidth = building.width / 2;
        const wallHeight = building.originalHeight * 0.65 * Math.max(0.1, damageFactor);
        
        if (wallHeight <= 5) return;
        
        ctx.fillStyle = '#f5deb3';
        ctx.fillRect(-halfWidth, -wallHeight, building.width, wallHeight);
        
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfWidth, -wallHeight, building.width, wallHeight);
        
        if (damageFactor > 0.4) {
            const roofHeight = building.originalHeight * 0.35 * damageFactor;
            ctx.fillStyle = '#a0522d';
            ctx.beginPath();
            ctx.moveTo(-halfWidth - 8, -wallHeight);
            ctx.lineTo(0, -wallHeight - roofHeight);
            ctx.lineTo(halfWidth + 8, -wallHeight);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        const doorWidth = building.width * 0.25;
        const doorHeight = wallHeight * 0.45;
        ctx.fillStyle = '#654321';
        ctx.fillRect(-doorWidth / 2, -doorHeight, doorWidth, doorHeight);
        
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(doorWidth / 2 - 6, -doorHeight / 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(halfWidth * 0.35, -wallHeight * 0.55, 14, 18);
        ctx.fillRect(-halfWidth * 0.35 - 14, -wallHeight * 0.55, 14, 18);
        
        if (damageFactor < 0.6) {
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-halfWidth * 0.2, -wallHeight * 0.3);
            ctx.lineTo(0, -wallHeight * 0.6);
            ctx.lineTo(halfWidth * 0.2, -wallHeight * 0.25);
            ctx.stroke();
        }
    }
    
    drawBuildingDamage(building, height, damageFactor) {
        const ctx = this.ctx;
        const halfWidth = building.width / 2;
        
        ctx.strokeStyle = 'rgba(45, 55, 72, 0.8)';
        ctx.lineWidth = 3;
        
        if (damageFactor < 0.5) {
            ctx.beginPath();
            ctx.moveTo(-halfWidth * 0.4, -height * 0.2);
            ctx.lineTo(-halfWidth * 0.1, -height * 0.5);
            ctx.lineTo(halfWidth * 0.2, -height * 0.1);
            ctx.stroke();
        }
        
        if (damageFactor < 0.35) {
            ctx.beginPath();
            ctx.moveTo(halfWidth * 0.3, -height * 0.7);
            ctx.lineTo(0, -height * 0.4);
            ctx.lineTo(-halfWidth * 0.2, -height * 0.3);
            ctx.stroke();
        }
        
        if (damageFactor < 0.25) {
            ctx.fillStyle = 'rgba(74, 85, 104, 0.7)';
            ctx.beginPath();
            ctx.moveTo(-halfWidth, -height * 0.8);
            ctx.lineTo(-halfWidth * 0.5, -height);
            ctx.lineTo(0, -height * 0.9);
            ctx.lineTo(-halfWidth * 0.3, -height * 0.75);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    drawDebris(building, height) {
        const ctx = this.ctx;
        const halfWidth = building.width / 2;
        
        ctx.fillStyle = 'rgba(74, 85, 104, 0.6)';
        
        for (let i = 0; i < 3; i++) {
            const debrisX = -halfWidth + Math.random() * building.width;
            const debrisY = Math.random() * 30;
            const debrisSize = 5 + Math.random() * 10;
            
            ctx.fillRect(debrisX, debrisY, debrisSize, debrisSize * 0.6);
        }
    }
    
    drawParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach(p => {
            ctx.fillStyle = `rgba(139, 115, 85, ${p.life})`;
            ctx.beginPath();
            ctx.arc(p.x + this.groundShake.x * 0.1, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

window.addEventListener('load', () => {
    console.log('window.onload 触发，等待布局完成...');
    
    const initSimulation = () => {
        const startTime = performance.now();
        
        window.earthquakeSim = new EarthquakeSimulation();
        
        const loadTime = performance.now() - startTime;
        console.log(`地震模拟系统启动时间: ${loadTime.toFixed(2)}ms`);
        
        if (loadTime > 3000) {
            console.warn('启动时间超过3秒目标');
        }
    };
    
    if (document.readyState === 'complete') {
        requestAnimationFrame(() => {
            requestAnimationFrame(initSimulation);
        });
    } else {
        initSimulation();
    }
});
