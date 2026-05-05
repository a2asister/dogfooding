"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathPlanningService = void 0;
const common_1 = require("@nestjs/common");
const data_storage_service_1 = require("../data-storage/data-storage.service");
let PathPlanningService = class PathPlanningService {
    constructor(dataStorageService) {
        this.dataStorageService = dataStorageService;
    }
    planPath(start, end, additionalObstacles = []) {
        const mapGrid = this.dataStorageService.getMapGrid();
        const obstacles = this.dataStorageService.getObstacles();
        const allObstacles = new Set();
        obstacles.forEach(obs => {
            allObstacles.add(`${obs.position.x},${obs.position.y}`);
        });
        additionalObstacles.forEach(pos => {
            allObstacles.add(`${pos.x},${pos.y}`);
        });
        const openList = [];
        const closedList = new Set();
        const startNode = {
            position: start,
            g: 0,
            h: this.heuristic(start, end),
            f: this.heuristic(start, end),
            parent: null,
        };
        openList.push(startNode);
        while (openList.length > 0) {
            openList.sort((a, b) => a.f - b.f);
            const currentNode = openList.shift();
            if (!currentNode)
                continue;
            if (currentNode.position.x === end.x &&
                currentNode.position.y === end.y) {
                return {
                    path: this.reconstructPath(currentNode),
                    distance: currentNode.g,
                    found: true,
                };
            }
            closedList.add(`${currentNode.position.x},${currentNode.position.y}`);
            const neighbors = this.getNeighbors(currentNode.position, mapGrid.width, mapGrid.height, allObstacles);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (closedList.has(neighborKey))
                    continue;
                const g = currentNode.g + this.getDistance(currentNode.position, neighbor);
                const h = this.heuristic(neighbor, end);
                const f = g + h;
                const existingNode = openList.find(node => node.position.x === neighbor.x &&
                    node.position.y === neighbor.y);
                if (existingNode) {
                    if (g < existingNode.g) {
                        existingNode.g = g;
                        existingNode.f = f;
                        existingNode.parent = currentNode;
                    }
                }
                else {
                    openList.push({
                        position: neighbor,
                        g,
                        h,
                        f,
                        parent: currentNode,
                    });
                }
            }
        }
        return {
            path: [],
            distance: 0,
            found: false,
        };
    }
    getNeighbors(position, width, height, obstacles) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 1 },
            { x: 1, y: 1 },
        ];
        for (const dir of directions) {
            const newX = position.x + dir.x;
            const newY = position.y + dir.y;
            if (newX >= 0 &&
                newX < width &&
                newY >= 0 &&
                newY < height &&
                !obstacles.has(`${newX},${newY}`)) {
                neighbors.push({ x: newX, y: newY });
            }
        }
        return neighbors;
    }
    heuristic(pos1, pos2) {
        return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
    }
    getDistance(pos1, pos2) {
        const dx = Math.abs(pos1.x - pos2.x);
        const dy = Math.abs(pos1.y - pos2.y);
        return dx + dy - Math.min(dx, dy) * (1 - Math.SQRT2);
    }
    reconstructPath(node) {
        const path = [];
        let current = node;
        while (current) {
            path.unshift(current.position);
            current = current.parent;
        }
        return path;
    }
    getMapGrid() {
        return this.dataStorageService.getMapGrid();
    }
};
exports.PathPlanningService = PathPlanningService;
exports.PathPlanningService = PathPlanningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_storage_service_1.DataStorageService])
], PathPlanningService);
//# sourceMappingURL=path-planning.service.js.map