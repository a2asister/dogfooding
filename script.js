// WebRTC P2P 文件传输 - 核心逻辑实现

// ============================================
// 1. 全局变量和配置
// ============================================

// WebRTC 配置，使用公共的 STUN 服务器进行 NAT 穿透
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
    ]
};

// 文件传输配置
const fileTransferConfig = {
    chunkSize: 16 * 1024,  // 每个数据块的大小：16KB
    maxRetries: 3,         // 最大重试次数
    retryDelay: 1000       // 重试延迟（毫秒）
};

// 全局变量
let peerConnection = null;        // WebRTC 对等连接
let dataChannel = null;           // 数据通道
let localSignalingData = null;    // 本地信令数据
let isInitiator = false;          // 是否为发起方
let selectedFiles = [];           // 已选择的文件列表
let currentTransfer = null;       // 当前传输状态
let transferHistory = [];         // 传输历史
let reconnectAttempts = 0;        // 重连尝试次数
let maxReconnectAttempts = 5;     // 最大重连次数

// ============================================
// 2. DOM 元素引用
// ============================================

const dom = {
    // 连接状态
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    
    // 房间管理
    roomId: document.getElementById('roomId'),
    generateRoomBtn: document.getElementById('generateRoomBtn'),
    copyRoomBtn: document.getElementById('copyRoomBtn'),
    joinRoomId: document.getElementById('joinRoomId'),
    joinRoomBtn: document.getElementById('joinRoomBtn'),
    
    // 信令交换
    signalingSection: document.getElementById('signalingSection'),
    mySignaling: document.getElementById('mySignaling'),
    copySignalingBtn: document.getElementById('copySignalingBtn'),
    remoteSignaling: document.getElementById('remoteSignaling'),
    submitSignalingBtn: document.getElementById('submitSignalingBtn'),
    
    // 区域显示控制
    connectionSection: document.getElementById('connectionSection'),
    transferSection: document.getElementById('transferSection'),
    
    // 文件选择
    fileDropArea: document.getElementById('fileDropArea'),
    fileInput: document.getElementById('fileInput'),
    selectFilesBtn: document.getElementById('selectFilesBtn'),
    selectedFiles: document.getElementById('selectedFiles'),
    selectedFilesCount: document.getElementById('selectedFilesCount'),
    selectedFilesList: document.getElementById('selectedFilesList'),
    sendFilesBtn: document.getElementById('sendFilesBtn'),
    clearFilesBtn: document.getElementById('clearFilesBtn'),
    
    // 传输进度
    transferProgressSection: document.getElementById('transferProgressSection'),
    transferFilename: document.getElementById('transferFilename'),
    transferStatus: document.getElementById('transferStatus'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    transferredSize: document.getElementById('transferredSize'),
    totalSize: document.getElementById('totalSize'),
    transferSpeed: document.getElementById('transferSpeed'),
    remainingTime: document.getElementById('remainingTime'),
    
    // 传输历史
    transferHistorySection: document.getElementById('transferHistorySection'),
    transferHistoryList: document.getElementById('transferHistoryList'),
    
    // 错误处理
    errorSection: document.getElementById('errorSection'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn')
};

// ============================================
// 3. 工具函数
// ============================================

/**
 * 生成唯一的房间 ID
 * @returns {string} 房间 ID
 */
function generateRoomId() {
    return 'room_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化传输速度
 * @param {number} bytesPerSecond - 每秒字节数
 * @returns {string} 格式化后的传输速度
 */
function formatTransferSpeed(bytesPerSecond) {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化剩余时间
 * @param {number} seconds - 剩余秒数
 * @returns {string} 格式化后的剩余时间
 */
function formatRemainingTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '计算中';
    if (seconds < 60) return Math.ceil(seconds) + ' 秒';
    if (seconds < 3600) return Math.ceil(seconds / 60) + ' 分钟';
    return Math.ceil(seconds / 3600) + ' 小时';
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 * @param {boolean} showRetry - 是否显示重试按钮
 */
function showError(message, showRetry = false) {
    dom.errorMessage.textContent = message;
    dom.errorSection.style.display = 'block';
    dom.retryBtn.style.display = showRetry ? 'inline-block' : 'none';
}

/**
 * 隐藏错误信息
 */
function hideError() {
    dom.errorSection.style.display = 'none';
}

/**
 * 更新连接状态显示
 * @param {string} status - 连接状态 (disconnected, connecting, connected)
 * @param {string} text - 状态文本
 */
function updateConnectionStatus(status, text) {
    // 移除所有状态类
    dom.statusDot.classList.remove('connected', 'connecting');
    
    // 添加相应状态类
    switch (status) {
        case 'connected':
            dom.statusDot.classList.add('connected');
            break;
        case 'connecting':
            dom.statusDot.classList.add('connecting');
            break;
        case 'disconnected':
        default:
            // 默认状态（红色）
            break;
    }
    
    // 更新状态文本
    dom.statusText.textContent = text;
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('复制到剪贴板失败:', err);
        return false;
    }
}

// ============================================
// 4. WebRTC 连接管理
// ============================================

/**
 * 初始化 WebRTC 连接
 */
function initPeerConnection() {
    // 如果已有连接，先关闭
    if (peerConnection) {
        closePeerConnection();
    }
    
    // 创建新的 RTCPeerConnection
    peerConnection = new RTCPeerConnection(rtcConfig);
    
    // 设置 ICE 候选者事件处理
    peerConnection.onicecandidate = handleIceCandidate;
    
    // 设置连接状态变化事件处理
    peerConnection.onconnectionstatechange = handleConnectionStateChange;
    
    // 设置 ICE 连接状态变化事件处理
    peerConnection.oniceconnectionstatechange = handleIceConnectionStateChange;
    
    // 设置数据通道事件处理（仅当接收方时）
    peerConnection.ondatachannel = handleDataChannel;
    
    console.log('WebRTC 连接初始化完成');
}

/**
 * 关闭 WebRTC 连接
 */
function closePeerConnection() {
    if (dataChannel) {
        dataChannel.close();
        dataChannel = null;
    }
    
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    updateConnectionStatus('disconnected', '未连接');
    console.log('WebRTC 连接已关闭');
}

/**
 * 处理 ICE 候选者
 * @param {RTCPeerConnectionIceEvent} event - ICE 候选者事件
 */
function handleIceCandidate(event) {
    // 当所有 ICE 候选者收集完成时
    if (event.candidate === null) {
        console.log('ICE 候选者收集完成');
        // 更新本地信令数据，包含完整的 SDP 和所有 ICE 候选者
        if (peerConnection && peerConnection.localDescription) {
            localSignalingData = {
                type: peerConnection.localDescription.type,
                sdp: peerConnection.localDescription.sdp
            };
            updateMySignalingDisplay();
        }
    }
}

/**
 * 处理连接状态变化
 */
function handleConnectionStateChange() {
    if (!peerConnection) return;
    
    const state = peerConnection.connectionState;
    console.log('连接状态变化:', state);
    
    switch (state) {
        case 'connecting':
            updateConnectionStatus('connecting', '连接中...');
            break;
        case 'connected':
            updateConnectionStatus('connected', '已连接');
            // 连接成功，重置重连计数
            reconnectAttempts = 0;
            // 显示文件传输区域
            showTransferSection();
            break;
        case 'disconnected':
            updateConnectionStatus('disconnected', '连接断开');
            // 尝试自动重连
            attemptReconnect();
            break;
        case 'failed':
            updateConnectionStatus('disconnected', '连接失败');
            showError('连接失败，请检查网络后重试', true);
            break;
        case 'closed':
            updateConnectionStatus('disconnected', '连接已关闭');
            break;
    }
}

/**
 * 处理 ICE 连接状态变化
 */
function handleIceConnectionStateChange() {
    if (!peerConnection) return;
    
    const state = peerConnection.iceConnectionState;
    console.log('ICE 连接状态变化:', state);
    
    // 可以在这里添加额外的状态处理逻辑
}

/**
 * 处理远程数据通道
 * @param {RTCDataChannelEvent} event - 数据通道事件
 */
function handleDataChannel(event) {
    console.log('收到远程数据通道:', event.channel.label);
    
    // 保存数据通道引用
    dataChannel = event.channel;
    
    // 设置数据通道事件处理
    setupDataChannelHandlers();
}

/**
 * 设置数据通道事件处理
 */
function setupDataChannelHandlers() {
    if (!dataChannel) return;
    
    // 数据通道打开事件
    dataChannel.onopen = () => {
        console.log('数据通道已打开');
        updateConnectionStatus('connected', '已连接');
    };
    
    // 数据通道关闭事件
    dataChannel.onclose = () => {
        console.log('数据通道已关闭');
        updateConnectionStatus('disconnected', '连接断开');
    };
    
    // 数据通道错误事件
    dataChannel.onerror = (error) => {
        console.error('数据通道错误:', error);
    };
    
    // 数据通道消息接收事件
    dataChannel.onmessage = handleDataChannelMessage;
}

/**
 * 处理数据通道消息
 * @param {MessageEvent} event - 消息事件
 */
function handleDataChannelMessage(event) {
    // 如果是字符串类型的消息
    if (typeof event.data === 'string') {
        handleTextMessage(event.data);
    }
    // 如果是二进制类型的消息（文件数据）
    else if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
        handleBinaryMessage(event.data);
    }
}

// ============================================
// 5. 信令交换逻辑
// ============================================

/**
 * 创建房间（作为发起方）
 */
async function createRoom() {
    try {
        // 生成房间 ID
        const roomId = generateRoomId();
        dom.roomId.value = roomId;
        dom.copyRoomBtn.disabled = false;
        
        // 标记为发起方
        isInitiator = true;
        
        // 初始化 WebRTC 连接
        initPeerConnection();
        
        // 创建数据通道（发起方创建）
        dataChannel = peerConnection.createDataChannel('fileTransfer', {
            ordered: true,  // 保证消息顺序
            maxRetransmits: fileTransferConfig.maxRetries  // 最大重传次数
        });
        
        // 设置数据通道事件处理
        setupDataChannelHandlers();
        
        // 创建 offer SDP
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // 显示信令交换区域
        dom.signalingSection.style.display = 'block';
        
        // 更新连接状态
        updateConnectionStatus('connecting', '等待对方加入...');
        
        console.log('房间创建成功，等待对方加入');
    } catch (error) {
        console.error('创建房间失败:', error);
        showError('创建房间失败: ' + error.message);
    }
}

/**
 * 加入房间（作为接收方）
 */
async function joinRoom() {
    const remoteSignalingText = dom.joinRoomId.value.trim();
    
    if (!remoteSignalingText) {
        showError('请输入房间 ID 或粘贴对方的信令信息');
        return;
    }
    
    try {
        // 尝试解析信令数据
        let remoteSignalingData = null;
        
        try {
            // 尝试解析为 JSON（如果是完整的信令数据）
            remoteSignalingData = JSON.parse(remoteSignalingText);
        } catch (e) {
            // 如果解析失败，可能只是房间 ID，需要显示信令交换区域
            // 这里简化处理：直接显示信令交换区域，让用户手动交换信令
            dom.signalingSection.style.display = 'block';
            dom.joinRoomId.value = '';
            return;
        }
        
        // 如果成功解析到信令数据，直接使用
        if (remoteSignalingData && remoteSignalingData.type) {
            await handleRemoteSignaling(remoteSignalingData);
        }
    } catch (error) {
        console.error('加入房间失败:', error);
        showError('加入房间失败: ' + error.message);
    }
}

/**
 * 更新本地信令显示
 */
function updateMySignalingDisplay() {
    if (localSignalingData) {
        dom.mySignaling.value = JSON.stringify(localSignalingData);
        dom.copySignalingBtn.disabled = false;
    }
}

/**
 * 处理远程信令数据
 * @param {object} signalingData - 远程信令数据
 */
async function handleRemoteSignaling(signalingData) {
    try {
        // 如果还没有初始化连接，先初始化
        if (!peerConnection) {
            isInitiator = false;
            initPeerConnection();
        }
        
        // 根据信令类型处理
        if (signalingData.type === 'offer') {
            // 收到 offer，设置远程描述并创建 answer
            await peerConnection.setRemoteDescription(new RTCSessionDescription(signalingData));
            
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            // 更新本地信令数据
            localSignalingData = {
                type: answer.type,
                sdp: answer.sdp
            };
            updateMySignalingDisplay();
            
            // 更新连接状态
            updateConnectionStatus('connecting', '连接中...');
            
            console.log('已处理 offer，生成 answer');
        } else if (signalingData.type === 'answer') {
            // 收到 answer，设置远程描述
            await peerConnection.setRemoteDescription(new RTCSessionDescription(signalingData));
            
            console.log('已处理 answer，等待连接建立');
        } else {
            throw new Error('未知的信令类型: ' + signalingData.type);
        }
        
        // 清空远程信令输入
        dom.remoteSignaling.value = '';
        
    } catch (error) {
        console.error('处理远程信令失败:', error);
        showError('处理远程信令失败: ' + error.message);
    }
}

/**
 * 提交远程信令
 */
function submitRemoteSignaling() {
    const signalingText = dom.remoteSignaling.value.trim();
    
    if (!signalingText) {
        showError('请粘贴对方的信令信息');
        return;
    }
    
    try {
        const signalingData = JSON.parse(signalingText);
        handleRemoteSignaling(signalingData);
    } catch (error) {
        showError('信令格式错误，请检查后重试');
        console.error('解析信令失败:', error);
    }
}

// ============================================
// 6. 文件选择和管理
// ============================================

/**
 * 处理文件选择
 * @param {FileList} files - 选择的文件列表
 */
function handleFileSelection(files) {
    if (!files || files.length === 0) return;
    
    // 添加到已选择文件列表
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // 检查是否已存在同名文件
        const existingIndex = selectedFiles.findIndex(f => f.name === file.name && f.size === file.size);
        if (existingIndex === -1) {
            selectedFiles.push(file);
        }
    }
    
    // 更新 UI
    updateSelectedFilesUI();
    
    // 隐藏错误信息
    hideError();
}

/**
 * 更新已选择文件 UI
 */
function updateSelectedFilesUI() {
    if (selectedFiles.length === 0) {
        dom.selectedFiles.style.display = 'none';
        return;
    }
    
    // 显示已选择文件区域
    dom.selectedFiles.style.display = 'block';
    
    // 更新文件数量
    dom.selectedFilesCount.textContent = selectedFiles.length;
    
    // 清空文件列表
    dom.selectedFilesList.innerHTML = '';
    
    // 添加每个文件到列表
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-item-name">${file.name}</span>
            <span class="file-item-size">${formatFileSize(file.size)}</span>
            <button class="file-item-remove" data-index="${index}">移除</button>
        `;
        
        // 添加移除按钮点击事件
        const removeBtn = fileItem.querySelector('.file-item-remove');
        removeBtn.addEventListener('click', () => {
            removeFile(index);
        });
        
        dom.selectedFilesList.appendChild(fileItem);
    });
}

/**
 * 移除指定索引的文件
 * @param {number} index - 文件索引
 */
function removeFile(index) {
    if (index >= 0 && index < selectedFiles.length) {
        selectedFiles.splice(index, 1);
        updateSelectedFilesUI();
    }
}

/**
 * 清空所有已选择的文件
 */
function clearSelectedFiles() {
    selectedFiles = [];
    updateSelectedFilesUI();
}

// ============================================
// 7. 文件传输逻辑
// ============================================

/**
 * 发送文件列表
 */
async function sendFiles() {
    if (selectedFiles.length === 0) {
        showError('请先选择要发送的文件');
        return;
    }
    
    if (!dataChannel || dataChannel.readyState !== 'open') {
        showError('连接未建立，请先确保双方已连接');
        return;
    }
    
    try {
        // 显示传输进度区域
        dom.transferProgressSection.style.display = 'block';
        
        // 依次发送每个文件
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            await sendSingleFile(file);
        }
        
        // 所有文件发送完成
        showError('所有文件发送完成！', false);
        
    } catch (error) {
        console.error('发送文件失败:', error);
        showError('发送文件失败: ' + error.message);
    }
}

/**
 * 发送单个文件
 * @param {File} file - 要发送的文件
 */
async function sendSingleFile(file) {
    return new Promise((resolve, reject) => {
        // 初始化传输状态
        currentTransfer = {
            file: file,
            filename: file.name,
            filesize: file.size,
            type: 'send',
            status: 'preparing',
            chunkIndex: 0,
            totalChunks: Math.ceil(file.size / fileTransferConfig.chunkSize),
            bytesSent: 0,
            startTime: Date.now(),
            lastUpdateTime: Date.now(),
            lastBytesSent: 0
        };
        
        // 更新传输 UI
        updateTransferUI();
        
        // 第一步：发送文件元数据
        const fileInfo = {
            type: 'file-info',
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
            totalChunks: currentTransfer.totalChunks
        };
        
        dataChannel.send(JSON.stringify(fileInfo));
        console.log('已发送文件信息:', fileInfo);
        
        // 第二步：准备文件读取器
        const fileReader = new FileReader();
        let currentChunk = 0;
        
        // 文件读取完成事件
        fileReader.onload = (event) => {
            if (currentTransfer.status === 'cancelled') {
                reject(new Error('传输已取消'));
                return;
            }
            
            // 发送数据块
            const chunk = event.target.result;
            dataChannel.send(chunk);
            
            // 更新传输状态
            currentTransfer.chunkIndex = currentChunk;
            currentTransfer.bytesSent += chunk.byteLength;
            currentChunk++;
            
            // 更新 UI
            updateTransferUI();
            
            // 检查是否还有更多数据块
            if (currentChunk < currentTransfer.totalChunks) {
                // 读取下一个数据块
                readNextChunk();
            } else {
                // 所有数据块发送完成，发送结束信号
                const endSignal = {
                    type: 'file-end',
                    filename: file.name,
                    filesize: file.size
                };
                dataChannel.send(JSON.stringify(endSignal));
                
                // 更新传输状态
                currentTransfer.status = 'completed';
                updateTransferUI();
                
                // 添加到传输历史
                addToTransferHistory(currentTransfer);
                
                console.log('文件发送完成:', file.name);
                resolve();
            }
        };
        
        // 文件读取错误事件
        fileReader.onerror = () => {
            currentTransfer.status = 'error';
            updateTransferUI();
            addToTransferHistory(currentTransfer);
            reject(new Error('读取文件失败'));
        };
        
        // 读取下一个数据块的函数
        function readNextChunk() {
            const start = currentChunk * fileTransferConfig.chunkSize;
            const end = Math.min(start + fileTransferConfig.chunkSize, file.size);
            const chunk = file.slice(start, end);
            fileReader.readAsArrayBuffer(chunk);
        }
        
        // 开始读取第一个数据块
        readNextChunk();
    });
}

/**
 * 处理文本消息
 * @param {string} message - 文本消息
 */
function handleTextMessage(message) {
    try {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'file-info':
                // 收到文件信息，准备接收文件
                handleFileInfo(data);
                break;
            case 'file-end':
                // 收到文件结束信号，完成文件接收
                handleFileEnd(data);
                break;
            default:
                console.log('收到未知类型的消息:', data);
        }
    } catch (error) {
        console.error('解析文本消息失败:', error);
    }
}

/**
 * 处理文件信息（接收方）
 * @param {object} fileInfo - 文件信息
 */
function handleFileInfo(fileInfo) {
    console.log('收到文件信息:', fileInfo);
    
    // 初始化接收状态
    currentTransfer = {
        filename: fileInfo.filename,
        filesize: fileInfo.filesize,
        filetype: fileInfo.filetype,
        type: 'receive',
        status: 'receiving',
        chunkIndex: 0,
        totalChunks: fileInfo.totalChunks,
        bytesReceived: 0,
        chunks: [],
        startTime: Date.now(),
        lastUpdateTime: Date.now(),
        lastBytesReceived: 0
    };
    
    // 显示传输进度区域
    dom.transferProgressSection.style.display = 'block';
    
    // 更新 UI
    updateTransferUI();
}

/**
 * 处理二进制消息（接收方）
 * @param {ArrayBuffer|Blob} data - 二进制数据
 */
function handleBinaryMessage(data) {
    if (!currentTransfer || currentTransfer.status !== 'receiving') {
        console.log('收到未预期的二进制数据');
        return;
    }
    
    // 转换为 ArrayBuffer
    const arrayBuffer = data instanceof ArrayBuffer ? data : new Blob([data]).arrayBuffer();
    
    // 处理 ArrayBuffer
    if (arrayBuffer instanceof ArrayBuffer) {
        processReceivedChunk(arrayBuffer);
    } else {
        // 如果是 Promise，等待解析
        arrayBuffer.then(buffer => processReceivedChunk(buffer));
    }
}

/**
 * 处理接收到的数据块
 * @param {ArrayBuffer} buffer - 数据块
 */
function processReceivedChunk(buffer) {
    // 添加到数据块列表
    currentTransfer.chunks.push(buffer);
    currentTransfer.bytesReceived += buffer.byteLength;
    currentTransfer.chunkIndex++;
    
    // 更新 UI
    updateTransferUI();
}

/**
 * 处理文件结束信号（接收方）
 * @param {object} fileEnd - 文件结束信息
 */
function handleFileEnd(fileEnd) {
    console.log('收到文件结束信号:', fileEnd);
    
    if (!currentTransfer) {
        console.error('没有正在进行的传输');
        return;
    }
    
    try {
        // 合并所有数据块
        const blob = new Blob(currentTransfer.chunks, { type: currentTransfer.filetype });
        
        // 创建下载链接
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = currentTransfer.filename;
        
        // 触发下载
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // 释放 URL
        URL.revokeObjectURL(downloadUrl);
        
        // 更新传输状态
        currentTransfer.status = 'completed';
        updateTransferUI();
        
        // 添加到传输历史
        addToTransferHistory(currentTransfer);
        
        console.log('文件接收完成:', currentTransfer.filename);
        
    } catch (error) {
        console.error('处理接收文件失败:', error);
        currentTransfer.status = 'error';
        updateTransferUI();
        addToTransferHistory(currentTransfer);
    }
}

/**
 * 更新传输 UI
 */
function updateTransferUI() {
    if (!currentTransfer) return;
    
    // 更新文件名
    dom.transferFilename.textContent = currentTransfer.filename;
    
    // 更新状态
    let statusClass = '';
    let statusText = '';
    
    switch (currentTransfer.status) {
        case 'preparing':
            statusClass = 'preparing';
            statusText = '准备中';
            break;
        case 'receiving':
        case 'sending':
            statusClass = 'transferring';
            statusText = currentTransfer.type === 'send' ? '发送中' : '接收中';
            break;
        case 'completed':
            statusClass = 'completed';
            statusText = '完成';
            break;
        case 'error':
            statusClass = 'error';
            statusText = '失败';
            break;
    }
    
    dom.transferStatus.className = 'transfer-status ' + statusClass;
    dom.transferStatus.textContent = statusText;
    
    // 计算进度
    const bytesTransferred = currentTransfer.type === 'send' 
        ? currentTransfer.bytesSent 
        : currentTransfer.bytesReceived;
    
    const progress = currentTransfer.filesize > 0 
        ? (bytesTransferred / currentTransfer.filesize) * 100 
        : 0;
    
    // 更新进度条
    dom.progressFill.style.width = progress + '%';
    dom.progressText.textContent = Math.round(progress) + '%';
    
    // 更新详细信息
    dom.transferredSize.textContent = formatFileSize(bytesTransferred);
    dom.totalSize.textContent = formatFileSize(currentTransfer.filesize);
    
    // 计算传输速度和剩余时间
    const now = Date.now();
    const timeDiff = (now - currentTransfer.lastUpdateTime) / 1000; // 秒
    
    if (timeDiff >= 1) { // 每秒更新一次
        const bytesDiff = bytesTransferred - (currentTransfer.type === 'send' 
            ? currentTransfer.lastBytesSent 
            : currentTransfer.lastBytesReceived);
        
        const speed = bytesDiff / timeDiff;
        const remainingBytes = currentTransfer.filesize - bytesTransferred;
        const remainingSeconds = speed > 0 ? remainingBytes / speed : Infinity;
        
        // 更新 UI
        dom.transferSpeed.textContent = formatTransferSpeed(speed);
        dom.remainingTime.textContent = formatRemainingTime(remainingSeconds);
        
        // 更新上次统计信息
        currentTransfer.lastUpdateTime = now;
        if (currentTransfer.type === 'send') {
            currentTransfer.lastBytesSent = bytesTransferred;
        } else {
            currentTransfer.lastBytesReceived = bytesTransferred;
        }
    }
}

// ============================================
// 8. 传输历史管理
// ============================================

/**
 * 添加到传输历史
 * @param {object} transfer - 传输信息
 */
function addToTransferHistory(transfer) {
    // 复制传输信息，避免引用问题
    const historyItem = {
        ...transfer,
        timestamp: Date.now()
    };
    
    // 添加到历史列表
    transferHistory.unshift(historyItem);
    
    // 限制历史记录数量
    if (transferHistory.length > 50) {
        transferHistory = transferHistory.slice(0, 50);
    }
    
    // 更新 UI
    updateTransferHistoryUI();
}

/**
 * 更新传输历史 UI
 */
function updateTransferHistoryUI() {
    if (transferHistory.length === 0) {
        dom.transferHistorySection.style.display = 'none';
        return;
    }
    
    // 显示传输历史区域
    dom.transferHistorySection.style.display = 'block';
    
    // 清空历史列表
    dom.transferHistoryList.innerHTML = '';
    
    // 添加每个历史项
    transferHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // 状态类和文本
        let statusClass = '';
        let statusText = '';
        
        if (item.type === 'send') {
            statusClass = 'sent';
            statusText = '已发送';
        } else if (item.type === 'receive') {
            statusClass = 'received';
            statusText = '已接收';
        }
        
        if (item.status === 'error') {
            statusClass = 'failed';
            statusText = '失败';
        }
        
        // 格式化时间
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString('zh-CN');
        
        historyItem.innerHTML = `
            <div class="history-item-info">
                <div class="history-item-name">${item.filename}</div>
                <div class="history-item-details">
                    ${formatFileSize(item.filesize)} · ${timeStr}
                </div>
            </div>
            <span class="history-item-status ${statusClass}">${statusText}</span>
        `;
        
        dom.transferHistoryList.appendChild(historyItem);
    });
}

// ============================================
// 9. 自动重连逻辑
// ============================================

/**
 * 尝试自动重连
 */
function attemptReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('已达到最大重连次数，停止重连');
        showError('连接断开，已尝试多次重连失败，请手动重试', true);
        return;
    }
    
    reconnectAttempts++;
    console.log(`尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})...`);
    
    // 延迟后尝试重连
    setTimeout(() => {
        if (isInitiator) {
            // 作为发起方，重新创建连接
            createRoom();
        } else {
            // 作为接收方，等待对方重新发起
            updateConnectionStatus('connecting', `重连中 (${reconnectAttempts}/${maxReconnectAttempts})...`);
            // 这里简化处理：接收方需要对方重新发起连接
            // 实际应用中可能需要更复杂的重连机制
        }
    }, fileTransferConfig.retryDelay);
}

// ============================================
// 10. UI 交互事件绑定
// ============================================

/**
 * 绑定所有 UI 事件
 */
function bindEvents() {
    // 房间管理事件
    dom.generateRoomBtn.addEventListener('click', createRoom);
    dom.copyRoomBtn.addEventListener('click', async () => {
        const roomId = dom.roomId.value;
        if (roomId) {
            const success = await copyToClipboard(roomId);
            if (success) {
                dom.copyRoomBtn.textContent = '已复制';
                setTimeout(() => {
                    dom.copyRoomBtn.textContent = '复制';
                }, 2000);
            }
        }
    });
    dom.joinRoomBtn.addEventListener('click', joinRoom);
    
    // 信令交换事件
    dom.copySignalingBtn.addEventListener('click', async () => {
        const signaling = dom.mySignaling.value;
        if (signaling) {
            const success = await copyToClipboard(signaling);
            if (success) {
                dom.copySignalingBtn.textContent = '已复制';
                setTimeout(() => {
                    dom.copySignalingBtn.textContent = '复制';
                }, 2000);
            }
        }
    });
    dom.submitSignalingBtn.addEventListener('click', submitRemoteSignaling);
    
    // 文件选择事件
    dom.fileInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files);
    });
    dom.selectFilesBtn.addEventListener('click', () => {
        dom.fileInput.click();
    });
    
    // 拖拽事件
    dom.fileDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dom.fileDropArea.classList.add('dragover');
    });
    dom.fileDropArea.addEventListener('dragleave', () => {
        dom.fileDropArea.classList.remove('dragover');
    });
    dom.fileDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dom.fileDropArea.classList.remove('dragover');
        handleFileSelection(e.dataTransfer.files);
    });
    
    // 文件管理事件
    dom.sendFilesBtn.addEventListener('click', sendFiles);
    dom.clearFilesBtn.addEventListener('click', clearSelectedFiles);
    
    // 错误处理事件
    dom.retryBtn.addEventListener('click', () => {
        hideError();
        // 重置重连计数
        reconnectAttempts = 0;
        // 尝试重新连接
        if (isInitiator) {
            createRoom();
        } else {
            // 接收方需要重新初始化
            initPeerConnection();
        }
    });
}

// ============================================
// 11. 页面初始化
// ============================================

/**
 * 显示文件传输区域
 */
function showTransferSection() {
    dom.connectionSection.style.display = 'none';
    dom.transferSection.style.display = 'block';
    hideError();
}

/**
 * 页面初始化
 */
function init() {
    console.log('WebRTC P2P 文件传输应用初始化');
    
    // 绑定所有事件
    bindEvents();
    
    // 初始化连接状态
    updateConnectionStatus('disconnected', '未连接');
    
    // 检查 URL 参数（如果有的话）
    // 这里可以添加从 URL 参数获取房间 ID 的逻辑
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
