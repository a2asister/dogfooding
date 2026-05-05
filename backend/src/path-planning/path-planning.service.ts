import { Injectable } from '@nestjs/common';
import { Position } from '../robots/interfaces/robot.interface';
import { PathNode, PathPlanningResult } from './interfaces/path-planning.interface';
import { DataStorageService } from '../data-storage/data-storage.service';

@Injectable()
export class PathPlanningService {
  constructor(private dataStorageService: DataStorageService) {}

  planPath(
    start: Position,
    end: Position,
    additionalObstacles: Position[] = [],
  ): PathPlanningResult {
    const mapGrid = this.dataStorageService.getMapGrid();
    const obstacles = this.dataStorageService.getObstacles();
    
    const allObstacles: Set<string> = new Set();
    
    obstacles.forEach(obs => {
      allObstacles.add(`${obs.position.x},${obs.position.y}`);
    });
    
    additionalObstacles.forEach(pos => {
      allObstacles.add(`${pos.x},${pos.y}`);
    });

    const openList: PathNode[] = [];
    const closedList: Set<string> = new Set();

    const startNode: PathNode = {
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

      if (!currentNode) continue;

      if (
        currentNode.position.x === end.x &&
        currentNode.position.y === end.y
      ) {
        return {
          path: this.reconstructPath(currentNode),
          distance: currentNode.g,
          found: true,
        };
      }

      closedList.add(
        `${currentNode.position.x},${currentNode.position.y}`,
      );

      const neighbors = this.getNeighbors(
        currentNode.position,
        mapGrid.width,
        mapGrid.height,
        allObstacles,
      );

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        if (closedList.has(neighborKey)) continue;

        const g = currentNode.g + this.getDistance(currentNode.position, neighbor);
        const h = this.heuristic(neighbor, end);
        const f = g + h;

        const existingNode = openList.find(
          node =>
            node.position.x === neighbor.x &&
            node.position.y === neighbor.y,
        );

        if (existingNode) {
          if (g < existingNode.g) {
            existingNode.g = g;
            existingNode.f = f;
            existingNode.parent = currentNode;
          }
        } else {
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

  private getNeighbors(
    position: Position,
    width: number,
    height: number,
    obstacles: Set<string>,
  ): Position[] {
    const neighbors: Position[] = [];
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

      if (
        newX >= 0 &&
        newX < width &&
        newY >= 0 &&
        newY < height &&
        !obstacles.has(`${newX},${newY}`)
      ) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

  private heuristic(pos1: Position, pos2: Position): number {
    return Math.max(
      Math.abs(pos1.x - pos2.x),
      Math.abs(pos1.y - pos2.y),
    );
  }

  private getDistance(pos1: Position, pos2: Position): number {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx + dy - Math.min(dx, dy) * (1 - Math.SQRT2);
  }

  private reconstructPath(node: PathNode): Position[] {
    const path: Position[] = [];
    let current: PathNode | null = node;

    while (current) {
      path.unshift(current.position);
      current = current.parent;
    }

    return path;
  }

  getMapGrid() {
    return this.dataStorageService.getMapGrid();
  }
}
