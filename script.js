const ELECTRICS_GAME = {
    currentLevel: 0,
    isPowered: false,
    placedComponents: {},
    gameState: 'playing',
    totalStars: 0,
    attemptCount: 0,

    levels: [
        {
            id: 1,
            name: '简单电路',
            description: '将开关放在靠近电源的位置，电阻放在靠近灯泡的位置',
            requiredComponents: ['switch', 'resistor_100'],
            correctConfig: {
                slot1: 'switch',
                slot2: 'resistor_100'
            },
            knowledge: '电路通路是指电流可以完整循环的电路，此时用电器可以正常工作。开关应放在电源输出端控制整个电路。',
            encouragement: '太棒了！你成功完成了第一个电路！记住：开关应该放在电源附近来控制电路通断。',
            components: {
                powerSource: { x: 50, y: 120 },
                bulb: { x: 520, y: 120 },
                slots: [
                    { id: 'slot1', x: 200, y: 135, width: 100, height: 50, label: '位置 1' },
                    { id: 'slot2', x: 360, y: 135, width: 100, height: 50, label: '位置 2' }
                ],
                wires: {
                    forward: [
                        { x: 130, y: 150, width: 70, height: 4, type: 'horizontal' },
                        { x: 300, y: 150, width: 60, height: 4, type: 'horizontal' },
                        { x: 460, y: 150, width: 60, height: 4, type: 'horizontal' }
                    ],
                    return: [
                        { x: 130, y: 150, width: 4, height: 120, type: 'vertical' },
                        { x: 130, y: 270, width: 450, height: 4, type: 'horizontal' },
                        { x: 580, y: 150, width: 4, height: 124, type: 'vertical' }
                    ]
                }
            }
        },
        {
            id: 2,
            name: '串联电阻电路',
            description: '开关控制电路，电阻必须按从小到大顺序排列',
            requiredComponents: ['switch', 'resistor_100', 'resistor_200'],
            correctConfig: {
                slot1: 'switch',
                slot2: 'resistor_100',
                slot3: 'resistor_200'
            },
            knowledge: '电阻串联时，总电阻等于各电阻之和。电流从电源正极流出，依次经过开关、小电阻、大电阻，最后到达灯泡。',
            encouragement: '完美！你掌握了串联电路的知识！电阻应按从小到大顺序排列，确保电流稳定流动。',
            components: {
                powerSource: { x: 30, y: 100 },
                bulb: { x: 580, y: 100 },
                slots: [
                    { id: 'slot1', x: 160, y: 115, width: 100, height: 50, label: '位置 1' },
                    { id: 'slot2', x: 290, y: 115, width: 100, height: 50, label: '位置 2' },
                    { id: 'slot3', x: 420, y: 115, width: 100, height: 50, label: '位置 3' }
                ],
                wires: {
                    forward: [
                        { x: 110, y: 130, width: 50, height: 4, type: 'horizontal' },
                        { x: 260, y: 130, width: 30, height: 4, type: 'horizontal' },
                        { x: 390, y: 130, width: 30, height: 4, type: 'horizontal' },
                        { x: 520, y: 130, width: 60, height: 4, type: 'horizontal' }
                    ],
                    return: [
                        { x: 110, y: 130, width: 4, height: 140, type: 'vertical' },
                        { x: 110, y: 270, width: 520, height: 4, type: 'horizontal' },
                        { x: 630, y: 130, width: 4, height: 144, type: 'vertical' }
                    ]
                }
            }
        },
        {
            id: 3,
            name: '复杂控制电路',
            description: '开关必须在最前面，然后按电阻值从小到大排列',
            requiredComponents: ['switch', 'resistor_100', 'resistor_500'],
            correctConfig: {
                slot1: 'switch',
                slot2: 'resistor_100',
                slot3: 'resistor_500'
            },
            knowledge: '在复杂电路中，开关必须放在电源输出端第一个位置，这样才能安全地控制整个电路的通断。电阻值从小到大排列可以保护电路元件。',
            encouragement: '太厉害了！你已经是电路小专家了！记住：开关在前，电阻按值从小到大排列是安全电路的标准设计。',
            components: {
                powerSource: { x: 50, y: 40 },
                bulb: { x: 480, y: 260 },
                slots: [
                    { id: 'slot1', x: 180, y: 55, width: 100, height: 50, label: '位置 1' },
                    { id: 'slot2', x: 180, y: 140, width: 100, height: 50, label: '位置 2' },
                    { id: 'slot3', x: 180, y: 225, width: 100, height: 50, label: '位置 3' }
                ],
                wires: {
                    forward: [
                        { x: 130, y: 70, width: 50, height: 4, type: 'horizontal' },
                        { x: 280, y: 70, width: 4, height: 70, type: 'vertical' },
                        { x: 280, y: 155, width: 50, height: 4, type: 'horizontal' },
                        { x: 280, y: 170, width: 4, height: 55, type: 'vertical' },
                        { x: 280, y: 240, width: 200, height: 4, type: 'horizontal' }
                    ],
                    return: [
                        { x: 130, y: 70, width: 4, height: 210, type: 'vertical' },
                        { x: 130, y: 280, width: 350, height: 4, type: 'horizontal' },
                        { x: 480, y: 70, width: 4, height: 214, type: 'vertical' }
                    ]
                }
            }
        }
    ],

    availableComponents: [
        { id: 'switch', name: '单控开关', icon: '🔌', type: 'switch' },
        { id: 'resistor_100', name: '100Ω 电阻', icon: '⚡', type: 'resistor', value: 100 },
        { id: 'resistor_200', name: '200Ω 电阻', icon: '⚡', type: 'resistor', value: 200 },
        { id: 'resistor_500', name: '500Ω 电阻', icon: '⚡', type: 'resistor', value: 500 }
    ],

    init: function() {
        this.loadLevel(this.currentLevel);
        this.bindEvents();
    },

    loadLevel: function(levelIndex) {
        if (levelIndex >= this.levels.length) {
            this.showGameComplete();
            return;
        }

        this.currentLevel = levelIndex;
        this.isPowered = false;
        this.placedComponents = {};
        this.gameState = 'playing';
        this.attemptCount = 0;

        const level = this.levels[levelIndex];
        
        document.getElementById('current-level').textContent = `第 ${level.id} 关`;
        document.getElementById('hint-area').querySelector('p').textContent = 
            level.description;

        this.renderCircuitBoard();
        this.renderComponentsList();
        this.updateStarsDisplay();
        
        const toggleBtn = document.getElementById('toggle-switch');
        toggleBtn.disabled = true;
        toggleBtn.textContent = '🔌 合闸通电';

        this.hideModal('success-modal');
        this.hideModal('error-modal');

        const nextBtn = document.getElementById('next-level-btn');
        nextBtn.style.display = 'inline-block';
    },

    renderCircuitBoard: function() {
        const board = document.getElementById('circuit-board');
        board.innerHTML = '';

        const level = this.levels[this.currentLevel];
        const components = level.components;

        const returnLabel = document.createElement('div');
        returnLabel.className = 'circuit-path-label';
        returnLabel.style.left = '250px';
        returnLabel.style.bottom = '20px';
        returnLabel.textContent = '← 电流返回路径 (负极)';
        returnLabel.style.color = '#999';
        returnLabel.style.fontSize = '0.8rem';
        returnLabel.style.position = 'absolute';
        board.appendChild(returnLabel);

        const forwardLabel = document.createElement('div');
        forwardLabel.className = 'circuit-path-label';
        forwardLabel.style.left = '250px';
        forwardLabel.style.top = '10px';
        forwardLabel.textContent = '→ 电流正向路径 (正极)';
        forwardLabel.style.color = '#667eea';
        forwardLabel.style.fontSize = '0.8rem';
        forwardLabel.style.position = 'absolute';
        board.appendChild(forwardLabel);

        if (components.wires && components.wires.return) {
            components.wires.return.forEach((wire, index) => {
                const wireEl = this.createWire(wire, 'return-' + index, false);
                board.appendChild(wireEl);
            });
        }

        if (components.wires && components.wires.forward) {
            components.wires.forward.forEach((wire, index) => {
                const wireEl = this.createWire(wire, 'forward-' + index, true);
                board.appendChild(wireEl);
            });
        }

        const arrow1 = this.createArrow(340, 145, 'right');
        board.appendChild(arrow1);

        const arrow2 = this.createArrow(140, 190, 'down');
        board.appendChild(arrow2);

        const powerSource = this.createPowerSource(components.powerSource);
        board.appendChild(powerSource);

        const bulb = this.createBulb(components.bulb);
        board.appendChild(bulb);

        components.slots.forEach((slot, index) => {
            const slotEl = this.createSlot(slot, index + 1);
            board.appendChild(slotEl);
        });
    },

    createArrow: function(x, y, direction) {
        const div = document.createElement('div');
        div.className = 'current-arrow';
        div.style.left = x + 'px';
        div.style.top = y + 'px';
        div.style.position = 'absolute';
        div.style.color = '#667eea';
        div.style.fontSize = '1rem';
        div.style.opacity = '0.6';
        div.style.zIndex = '2';
        
        if (direction === 'right') {
            div.textContent = '→';
        } else if (direction === 'down') {
            div.textContent = '↓';
        } else if (direction === 'left') {
            div.textContent = '←';
        } else if (direction === 'up') {
            div.textContent = '↑';
        }
        
        return div;
    },

    createPowerSource: function(pos) {
        const div = document.createElement('div');
        div.className = 'circuit-component power-source';
        div.style.left = pos.x + 'px';
        div.style.top = pos.y + 'px';
        div.innerHTML = `
            <span class="voltage">3V</span>
            <span style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:0.7rem;color:#ff6b6b;">+</span>
            <span style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:0.7rem;color:#4d96ff;">-</span>
            <span style="font-size:0.7rem;color:#fff;margin-top:2px;display:block;">电源</span>
        `;
        return div;
    },

    createBulb: function(pos) {
        const div = document.createElement('div');
        div.className = 'circuit-component bulb-base';
        div.id = 'main-bulb';
        div.style.left = pos.x + 'px';
        div.style.top = pos.y + 'px';
        div.innerHTML = `
            <div class="bulb-glass"></div>
            <div class="bulb-filament"></div>
            <div class="bulb-socket"></div>
            <div class="bulb-connectors">
                <div class="bulb-connector"></div>
                <div class="bulb-connector"></div>
            </div>
            <span style="position:absolute;bottom:-25px;left:50%;transform:translateX(-50%);font-size:0.7rem;color:#666;">灯泡</span>
        `;
        return div;
    },

    createWire: function(wire, id, isForward) {
        const div = document.createElement('div');
        div.className = `wire ${wire.type === 'horizontal' ? 'wire-horizontal' : 'wire-vertical'} ${isForward ? 'wire-forward' : 'wire-return'}`;
        div.id = `wire-${id}`;
        div.dataset.wireId = id;
        div.dataset.isForward = isForward;
        div.style.left = wire.x + 'px';
        div.style.top = wire.y + 'px';
        div.style.width = wire.width + 'px';
        div.style.height = wire.height + 'px';
        return div;
    },

    createSlot: function(slot, index) {
        const div = document.createElement('div');
        div.className = 'slot';
        div.id = slot.id;
        div.style.left = slot.x + 'px';
        div.style.top = slot.y + 'px';
        div.style.width = slot.width + 'px';
        div.style.height = slot.height + 'px';
        
        const label = document.createElement('span');
        label.className = 'slot-label';
        label.innerHTML = `<span style="font-weight:bold;color:#667eea;">${slot.label}</span><br><span style="font-size:0.7rem;">放置元件</span>`;
        div.appendChild(label);

        return div;
    },

    renderComponentsList: function() {
        const list = document.getElementById('components-list');
        list.innerHTML = '';

        const level = this.levels[this.currentLevel];
        const requiredIds = level.requiredComponents;

        this.availableComponents.forEach(component => {
            if (requiredIds.includes(component.id)) {
                const isPlaced = this.placedComponents[component.id];
                const compEl = this.createDraggableComponent(component, isPlaced);
                list.appendChild(compEl);
            }
        });
    },

    createDraggableComponent: function(component, isPlaced) {
        const div = document.createElement('div');
        div.className = `draggable-component ${isPlaced ? 'disabled' : ''}`;
        div.id = `comp-${component.id}`;
        div.dataset.componentId = component.id;
        div.dataset.componentType = component.type;

        let visualHtml = '';
        if (component.type === 'resistor') {
            visualHtml = `
                <div class="component-icon">${component.icon}</div>
                <div class="resistor-visual"></div>
                <div class="resistance-value">${component.value}Ω</div>
            `;
        } else if (component.type === 'switch') {
            visualHtml = `
                <div class="component-icon">${component.icon}</div>
                <div class="switch-visual">
                    <div class="switch-base"></div>
                    <div class="switch-lever">
                        <div class="switch-contact"></div>
                    </div>
                </div>
            `;
        }

        div.innerHTML = visualHtml + `<div class="component-name">${component.name}</div>`;

        if (!isPlaced) {
            this.makeDraggable(div, component);
        }

        return div;
    },

    makeDraggable: function(element, component) {
        let isDragging = false;
        let offsetX, offsetY;
        let ghostElement = null;
        let startPos = { x: 0, y: 0 };

        const startDrag = (e) => {
            if (element.classList.contains('disabled')) return;
            if (this.isPowered) return;
            
            e.preventDefault();
            isDragging = true;
            
            const rect = element.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
            startPos = { x: rect.left, y: rect.top };

            ghostElement = element.cloneNode(true);
            ghostElement.className = 'dragging-component draggable-component';
            ghostElement.style.width = rect.width + 'px';
            document.body.appendChild(ghostElement);

            updateGhostPosition(clientX, clientY);
            element.style.opacity = '0.5';
        };

        const updateGhostPosition = (clientX, clientY) => {
            if (ghostElement) {
                ghostElement.style.left = clientX + 'px';
                ghostElement.style.top = clientY + 'px';
            }
        };

        const drag = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            updateGhostPosition(clientX, clientY);
            this.checkSlotHover(clientX, clientY);
        };

        const endDrag = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            
            const slot = this.findMatchingSlot(clientX, clientY, component);
            
            if (slot) {
                this.placeComponent(component, slot);
            } else {
                this.animateRebound(element, startPos);
            }

            if (ghostElement) {
                ghostElement.remove();
                ghostElement = null;
            }
            element.style.opacity = '1';
            
            this.clearSlotHighlights();
        };

        element.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        element.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
    },

    checkSlotHover: function(clientX, clientY) {
        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            const rect = slot.getBoundingClientRect();
            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {
                if (!slot.classList.contains('filled')) {
                    slot.classList.add('highlighted');
                }
            } else {
                slot.classList.remove('highlighted');
            }
        });
    },

    clearSlotHighlights: function() {
        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.classList.remove('highlighted');
        });
    },

    findMatchingSlot: function(clientX, clientY, component) {
        const slots = document.querySelectorAll('.slot:not(.filled)');
        
        for (let slot of slots) {
            const rect = slot.getBoundingClientRect();
            
            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {
                return slot;
            }
        }
        return null;
    },

    placeComponent: function(component, slot) {
        const existingComponent = Object.entries(this.placedComponents).find(
            ([_, data]) => data && data.slotId === slot.id
        );
        
        if (existingComponent) {
            delete this.placedComponents[existingComponent[0]];
            const oldPlacedEl = document.querySelector(`.placed-component[data-slot-id="${slot.id}"]`);
            if (oldPlacedEl) oldPlacedEl.remove();
        }

        this.placedComponents[component.id] = {
            slotId: slot.id,
            component: component
        };

        slot.classList.add('filled');
        slot.classList.remove('highlighted');
        const label = slot.querySelector('.slot-label');
        if (label) {
            label.innerHTML = `<span style="font-weight:bold;color:#4caf50;">✓ 已放置</span>`;
        }

        const placedEl = document.createElement('div');
        placedEl.className = 'placed-component';
        placedEl.dataset.componentId = component.id;
        placedEl.dataset.slotId = slot.id;

        const slotRect = slot.getBoundingClientRect();
        const boardRect = document.getElementById('circuit-board').getBoundingClientRect();
        
        if (component.type === 'resistor') {
            placedEl.innerHTML = `
                <div class="resistor-visual"></div>
                <div class="resistance-value">${component.value}Ω</div>
            `;
        } else if (component.type === 'switch') {
            placedEl.innerHTML = `
                <div class="switch-visual">
                    <div class="switch-base"></div>
                    <div class="switch-lever">
                        <div class="switch-contact"></div>
                    </div>
                </div>
            `;
            placedEl.id = 'placed-switch';
        }

        placedEl.style.left = (slotRect.left - boardRect.left + 10) + 'px';
        placedEl.style.top = (slotRect.top - boardRect.top + 5) + 'px';

        document.getElementById('circuit-board').appendChild(placedEl);

        this.renderComponentsList();
        this.checkLevelComplete();
    },

    animateRebound: function(element, startPos) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translate(0, 0)';
        setTimeout(() => {
            element.style.transition = '';
        }, 300);
    },

    checkLevelComplete: function() {
        const level = this.levels[this.currentLevel];
        const required = level.requiredComponents;
        
        const allPlaced = required.every(compId => 
            this.placedComponents[compId] !== undefined
        );

        const toggleBtn = document.getElementById('toggle-switch');
        if (allPlaced) {
            toggleBtn.disabled = false;
            document.getElementById('hint-area').querySelector('p').textContent = 
                '所有元件已放置！点击"合闸通电"测试电路是否正确连接！';
        } else {
            toggleBtn.disabled = true;
            const remaining = required.filter(id => !this.placedComponents[id]);
            document.getElementById('hint-area').querySelector('p').textContent = 
                `还需要放置 ${remaining.length} 个元件...`;
        }
    },

    togglePower: function() {
        if (this.isPowered) {
            this.powerOff();
        } else {
            this.powerOn();
        }
    },

    powerOn: function() {
        const level = this.levels[this.currentLevel];
        const required = level.requiredComponents;
        
        const allPlaced = required.every(compId => 
            this.placedComponents[compId] !== undefined
        );

        if (!allPlaced) {
            this.showError('电路连接不全，请确保所有元件都已放置！');
            return;
        }

        const validation = this.validateCircuit();
        
        if (!validation.valid) {
            this.attemptCount++;
            this.showError(validation.message);
            return;
        }

        this.animateSwitchClose();

        setTimeout(() => {
            this.isPowered = true;
            
            this.animateCurrentFlow();
            
            setTimeout(() => {
                this.animateBulbLight();
                
                setTimeout(() => {
                    this.showSuccess();
                }, 1000);
            }, 800);
        }, 300);

        const toggleBtn = document.getElementById('toggle-switch');
        toggleBtn.textContent = '⚡ 断电';
    },

    validateCircuit: function() {
        const level = this.levels[this.currentLevel];
        const correctConfig = level.correctConfig;
        
        const slotComponents = {};
        
        Object.entries(this.placedComponents).forEach(([compId, data]) => {
            if (data && data.slotId) {
                slotComponents[data.slotId] = compId;
            }
        });

        const slotIds = Object.keys(correctConfig).sort();
        
        for (let slotId of slotIds) {
            const expectedComponent = correctConfig[slotId];
            const actualComponent = slotComponents[slotId];
            
            if (!actualComponent) {
                return {
                    valid: false,
                    message: `元件位置不完整，请确保所有插槽都已放置元件。`
                };
            }

            if (actualComponent !== expectedComponent) {
                const expectedComp = this.availableComponents.find(c => c.id === expectedComponent);
                const actualComp = this.availableComponents.find(c => c.id === actualComponent);
                
                const slotIndex = slotId.replace('slot', '');
                let hint = '';
                
                if (expectedComponent === 'switch') {
                    hint = `提示：开关应该放在位置 ${slotIndex}（靠近电源的第一个位置）来控制整个电路。电流从电源正极出发，首先经过开关。`;
                } else if (actualComponent === 'switch') {
                    hint = `提示：开关不应该放在位置 ${slotIndex}，它应该放在靠近电源的第一个位置（位置 1）。`;
                } else {
                    const expectedValue = expectedComp?.value || '';
                    const actualValue = actualComp?.value || '';
                    hint = `提示：位置 ${slotIndex} 应该放置 ${expectedValue}Ω 电阻，而不是 ${actualValue}Ω 电阻。电流从电源出发，应依次经过小电阻再到大电阻，这样可以保护电路。`;
                }

                return {
                    valid: false,
                    message: `电路连接错误！${hint}`
                };
            }
        }

        const hasSwitch = Object.values(slotComponents).includes('switch');
        if (!hasSwitch) {
            return {
                valid: false,
                message: '缺少开关元件！开关是控制电路通断的必要元件，请放置开关。'
            };
        }

        return { valid: true };
    },

    powerOff: function() {
        this.isPowered = false;
        
        const bulb = document.getElementById('main-bulb');
        if (bulb) {
            bulb.querySelector('.bulb-glass').classList.remove('lit');
            bulb.querySelector('.bulb-filament').classList.remove('lit');
        }

        const wires = document.querySelectorAll('.wire');
        wires.forEach(wire => wire.classList.remove('powered'));

        const currentDots = document.querySelectorAll('.current-dot');
        currentDots.forEach(dot => dot.remove());

        const toggleBtn = document.getElementById('toggle-switch');
        toggleBtn.textContent = '🔌 合闸通电';
    },

    animateSwitchClose: function() {
        const switchEl = document.querySelector('#placed-switch .switch-lever');
        if (switchEl) {
            switchEl.classList.add('closed');
            switchEl.parentElement.classList.add('switch-animation');
            
            setTimeout(() => {
                switchEl.parentElement.classList.remove('switch-animation');
            }, 300);
        }
    },

    animateCurrentFlow: function() {
        const forwardWires = document.querySelectorAll('.wire-forward');
        forwardWires.forEach((wire, index) => {
            setTimeout(() => {
                wire.classList.add('powered');
            }, index * 200);
        });

        const returnWires = document.querySelectorAll('.wire-return');
        setTimeout(() => {
            returnWires.forEach((wire, index) => {
                setTimeout(() => {
                    wire.classList.add('powered');
                }, index * 150);
            });
        }, forwardWires.length * 200 + 200);

        this.createCurrentParticles();
    },

    createCurrentParticles: function() {
        const board = document.getElementById('circuit-board');
        const level = this.levels[this.currentLevel];
        const wires = [];
        
        if (level.components.wires && level.components.wires.forward) {
            wires.push(...level.components.wires.forward);
        }

        wires.forEach((wire, index) => {
            setTimeout(() => {
                const dot = document.createElement('div');
                dot.className = 'current-dot';
                dot.style.left = wire.x + 'px';
                dot.style.top = (wire.y - 2) + 'px';
                board.appendChild(dot);

                const duration = 1200;
                const startTime = Date.now();
                
                const animateDot = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    if (wire.type === 'horizontal') {
                        dot.style.left = (wire.x + wire.width * progress) + 'px';
                    } else {
                        dot.style.top = (wire.y - 2 + wire.height * progress) + 'px';
                    }

                    if (progress < 1 && this.isPowered) {
                        requestAnimationFrame(animateDot);
                    } else {
                        dot.remove();
                    }
                };

                animateDot();
            }, index * 200);
        });
    },

    animateBulbLight: function() {
        const bulb = document.getElementById('main-bulb');
        if (bulb) {
            bulb.querySelector('.bulb-glass').classList.add('lit');
            bulb.querySelector('.bulb-filament').classList.add('lit');
        }
    },

    showSuccess: function() {
        const level = this.levels[this.currentLevel];
        
        document.getElementById('encouragement-text').textContent = level.encouragement;
        document.getElementById('knowledge-content').textContent = level.knowledge;
        
        const starsEarned = this.attemptCount === 0 ? 3 : (this.attemptCount <= 2 ? 2 : 1);
        this.totalStars += starsEarned;
        this.updateStarsDisplay();

        this.showModal('success-modal');
    },

    showError: function(message) {
        document.getElementById('error-message').textContent = message;
        this.showModal('error-modal');
    },

    showGameComplete: function() {
        document.getElementById('encouragement-text').textContent = 
            `恭喜你完成了所有关卡！你总共获得了 ${this.totalStars} 颗星星！`;
        document.getElementById('knowledge-content').textContent = 
            '电路知识是电子工程的基础。记住：电流从电源正极流出，经过开关、电阻、用电器（灯泡），最后回到电源负极，形成完整的闭合回路。';
        
        this.showModal('success-modal');
        
        const nextBtn = document.getElementById('next-level-btn');
        nextBtn.style.display = 'none';
    },

    showModal: function(modalId) {
        document.getElementById(modalId).classList.add('active');
    },

    hideModal: function(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    updateStarsDisplay: function() {
        const starsDisplay = document.querySelector('.stars-display');
        const stars = starsDisplay.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            if (index < Math.min(this.totalStars, 3)) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    },

    resetLevel: function() {
        this.powerOff();
        this.placedComponents = {};
        this.attemptCount = 0;
        
        const placedComponents = document.querySelectorAll('.placed-component');
        placedComponents.forEach(comp => comp.remove());

        const slots = document.querySelectorAll('.slot');
        slots.forEach((slot, index) => {
            slot.classList.remove('filled');
            const label = slot.querySelector('.slot-label');
            if (label) {
                const position = index + 1;
                label.innerHTML = `<span style="font-weight:bold;color:#667eea;">位置 ${position}</span><br><span style="font-size:0.7rem;">放置元件</span>`;
            }
        });

        const switchEl = document.querySelector('#placed-switch .switch-lever');
        if (switchEl) {
            switchEl.classList.remove('closed');
        }

        this.renderComponentsList();
        this.checkLevelComplete();

        const level = this.levels[this.currentLevel];
        document.getElementById('hint-area').querySelector('p').textContent = 
            level.description;
    },

    bindEvents: function() {
        const toggleBtn = document.getElementById('toggle-switch');
        toggleBtn.addEventListener('click', () => this.togglePower());

        const resetBtn = document.getElementById('reset-level');
        resetBtn.addEventListener('click', () => this.resetLevel());

        const nextBtn = document.getElementById('next-level-btn');
        nextBtn.addEventListener('click', () => {
            this.hideModal('success-modal');
            this.loadLevel(this.currentLevel + 1);
        });

        const replayBtn = document.getElementById('replay-btn');
        replayBtn.addEventListener('click', () => {
            this.hideModal('success-modal');
            this.resetLevel();
        });

        const closeErrorBtn = document.getElementById('close-error-btn');
        closeErrorBtn.addEventListener('click', () => {
            this.hideModal('error-modal');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !toggleBtn.disabled) {
                this.togglePower();
            }
            if (e.key === 'r' || e.key === 'R') {
                this.resetLevel();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    ELECTRICS_GAME.init();
});
