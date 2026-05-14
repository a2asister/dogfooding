export function createParticles(config, centerX, centerY) {
    const particles = [];
    const { fissionCount, shapeType, colors, speed, spreadRange, rotationSpeed } = config;
    for (let i = 0; i < fissionCount; i++) {
        const angle = (i / fissionCount) * Math.PI * 2;
        const distance = Math.random() * spreadRange * 0.3;
        const color = colors[i % colors.length];
        particles.push({
            id: i,
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            vx: Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
            vy: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
            size: 15 + Math.random() * 25,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: rotationSpeed * (Math.random() - 0.5) * 2,
            color,
            opacity: 0.9,
            shapeType,
            originX: centerX,
            originY: centerY,
            phase: 'spread',
            trail: [],
        });
    }
    return particles;
}
export function updateParticles(particles, config, canvasWidth, canvasHeight) {
    return particles.map((particle) => {
        const newParticle = { ...particle, trail: [...particle.trail] };
        if (config.trailEnabled) {
            newParticle.trail.push({ x: particle.x, y: particle.y });
            if (newParticle.trail.length > 20) {
                newParticle.trail.shift();
            }
        }
        newParticle.x += newParticle.vx;
        newParticle.y += newParticle.vy;
        newParticle.rotation += newParticle.rotationSpeed;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const distFromCenter = Math.sqrt(Math.pow(newParticle.x - centerX, 2) + Math.pow(newParticle.y - centerY, 2));
        if (newParticle.phase === 'spread' && distFromCenter > config.spreadRange) {
            if (config.bounceEnabled) {
                newParticle.phase = 'bounce';
                newParticle.vx *= -0.7;
                newParticle.vy *= -0.7;
            }
            else {
                newParticle.vx *= 0.95;
                newParticle.vy *= 0.95;
            }
        }
        if (newParticle.phase === 'bounce') {
            const dx = centerX - newParticle.x;
            const dy = centerY - newParticle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                newParticle.vx += (dx / dist) * config.speed * 0.05;
                newParticle.vy += (dy / dist) * config.speed * 0.05;
            }
            if (dist < 50) {
                newParticle.phase = 'stable';
            }
        }
        if (newParticle.phase === 'stable') {
            newParticle.vx *= 0.9;
            newParticle.vy *= 0.9;
        }
        if (config.gravityEnabled) {
            newParticle.vy += 0.1;
        }
        if (newParticle.x < 0 || newParticle.x > canvasWidth) {
            newParticle.vx *= -0.8;
            newParticle.x = Math.max(0, Math.min(canvasWidth, newParticle.x));
        }
        if (newParticle.y < 0 || newParticle.y > canvasHeight) {
            newParticle.vy *= -0.8;
            newParticle.y = Math.max(0, Math.min(canvasHeight, newParticle.y));
        }
        return newParticle;
    });
}
export function drawShape(ctx, shapeType, x, y, size, rotation, color, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    switch (shapeType) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'triangle':
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
                const px = Math.cos(angle) * (size / 2);
                const py = Math.sin(angle) * (size / 2);
                if (i === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'square':
            ctx.beginPath();
            ctx.rect(-size / 2, -size / 2, size, size);
            ctx.fill();
            ctx.stroke();
            break;
        case 'pentagon':
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                const px = Math.cos(angle) * (size / 2);
                const py = Math.sin(angle) * (size / 2);
                if (i === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'hexagon':
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const px = Math.cos(angle) * (size / 2);
                const py = Math.sin(angle) * (size / 2);
                if (i === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
    ctx.restore();
}
export function drawGradientBackground(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(0.5, '#1a1a3e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}
