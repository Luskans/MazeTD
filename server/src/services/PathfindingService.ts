import { GameState } from "../rooms/schema/GameState";
import { PlayerState } from "../rooms/schema/PlayerState";
import { PathNodeState } from "../rooms/schema/PathNodeState";
import { Room } from "colyseus";

const BLOCKED = 1;
const FREE = 0;

export class PathfindingService {
  private room: Room<GameState>;
  
  constructor(room: Room<GameState>) {
    this.room = room;
  }

  /**
   * Construit la grille de base avec les rochers statiques
   */
  public buildStaticGrid(): number[][] {
    const cols = this.room.state.grid.col;
    const rows = this.room.state.grid.row;
    const gridMap = Array.from({ length: rows }, () => new Array(cols).fill(FREE));

    for (const rock of this.room.state.grid.rocks) {
      this.markObstacle(gridMap, rock.gridX, rock.gridY, 2);
    }
    return gridMap;
  }

  /**
   * Construit la grille spécifique à un joueur (incluant tours et murs)
   */
  private buildPlayerGrid(player: PlayerState, newObstacle?: { gridX: number, gridY: number, gridSize: number }): number[][] {
    const cols = this.room.state.grid.col;
    const rows = this.room.state.grid.row;
    const gridMap = Array.from({ length: rows }, () => new Array(cols).fill(FREE));

    for (const rock of player.rocks.values()) {
      if (!rock.destroyPending) this.markObstacle(gridMap, rock.gridX, rock.gridY, 2);
    }

    for (const tower of player.towers.values()) {
      if (!tower.sellingPending) this.markObstacle(gridMap, tower.gridX, tower.gridY, 2);
    }

    for (const wall of player.walls.values()) {
      if (!wall.sellingPending) this.markObstacle(gridMap, wall.gridX, wall.gridY, wall.size);
    }

    if (newObstacle) {
      this.markObstacle(gridMap, newObstacle.gridX, newObstacle.gridY, newObstacle.gridSize);
    }

    return gridMap;
  }

  private markObstacle(grid: number[][], startX: number, startY: number, size: number) {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const nY = startY + y;
        const nX = startX + x;
        if (nY >= 0 && nY < grid.length && nX >= 0 && nX < grid[0].length) {
          grid[nY][nX] = BLOCKED;
        }
      }
    }
  }

  public validateCheckpointPath(gridMap: number[][], checkpoints: { gridX: number; gridY: number }[]): boolean {
    let startX = checkpoints[0].gridX + 1;
    let startY = checkpoints[0].gridY + 1;

    for (let i = 0; i < checkpoints.length; i++) {
      const cp = checkpoints[i];
      const endX = cp.gridX + 1;
      const endY = cp.gridY + 1;

      const path = this.findPath(gridMap, startX, startY, endX, endY);
      if (!path) return false;

      startX = endX;
      startY = endY;
    }
    return true;
  }

  /**
   * Algorithme A* standard
   */
  private findPath(gridMap: number[][], startX: number, startY: number, endX: number, endY: number): PathNodeState[] | null {
    const rows = gridMap.length;
    const cols = gridMap[0].length;
    const nodes: Map<string, { g: number, f: number, parent: [number, number] | null }> = new Map();
    const openList: string[] = [];

    const startKey = `${startY},${startX}`;
    nodes.set(startKey, { g: 0, f: this.heuristic(startX, startY, endX, endY), parent: null });
    openList.push(startKey);

    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    while (openList.length > 0) {
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (nodes.get(openList[i])!.f < nodes.get(openList[currentIndex])!.f) currentIndex = i;
      }

      const currentKey = openList.splice(currentIndex, 1)[0];
      const [y, x] = currentKey.split(',').map(Number);

      if (x >= endX && x < endX + 2 && y >= endY && y < endY + 2) {
        return this.reconstructPath(nodes, currentKey);
      }

      for (let i = 0; i < directions.length; i++) {
        const [dy, dx] = directions[i];
        const nY = y + dy;
        const nX = x + dx;
        if (nY < 0 || nY >= rows || nX < 0 || nX >= cols || gridMap[nY][nX] === BLOCKED) continue;

        if (i >= 4 && (gridMap[y][nX] === BLOCKED || gridMap[nY][x] === BLOCKED)) continue;

        const moveCost = i < 4 ? 1 : 1.414;
        const gScore = nodes.get(currentKey)!.g + moveCost;
        const nKey = `${nY},${nX}`;

        if (!nodes.has(nKey) || gScore < nodes.get(nKey)!.g) {
          nodes.set(nKey, {
            g: gScore,
            f: gScore + this.heuristic(nX, nY, endX, endY),
            parent: [y, x]
          });
          if (!openList.includes(nKey)) openList.push(nKey);
        }
      }
    }
    return null;
  }

  /**
   * Nouvelle étape : Simplifie les points inutiles avant le lissage
   */
  private simplifyPath(path: PathNodeState[]): PathNodeState[] {
    if (path.length <= 2) return path;
    const simplified: PathNodeState[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];

      const dx1 = curr.gridX - prev.gridX;
      const dy1 = curr.gridY - prev.gridY;
      const dx2 = next.gridX - curr.gridX;
      const dy2 = next.gridY - curr.gridY;

      if (dx1 * dy2 !== dy1 * dx2) {
        simplified.push(curr);
      }
    }
    simplified.push(path[path.length - 1]);
    return simplified;
  }

  /**
   * Lissage de chemin (Path Smoothing) pour des angles libres
   */
  private smoothPath(path: PathNodeState[], gridMap: number[][]): PathNodeState[] {
    if (path.length <= 2) return path;

    const smoothed: PathNodeState[] = [path[0]];
    let currentIdx = 0;

    while (currentIdx < path.length - 1) {
      let lastVisibleIdx = currentIdx + 1;

      for (let nextIdx = currentIdx + 2; nextIdx < path.length; nextIdx++) {
        if (this.isLineClear(path[currentIdx], path[nextIdx], gridMap)) {
          lastVisibleIdx = nextIdx;
        } else {
          break;
        }
      }

      smoothed.push(path[lastVisibleIdx]);
      currentIdx = lastVisibleIdx;
    }

    return smoothed;
  }

  private isLineClear(start: PathNodeState, end: PathNodeState, gridMap: number[][]): boolean {
    const x1 = start.gridX + 0.5;
    const y1 = start.gridY + 0.5;
    const x2 = end.gridX + 0.5;
    const y2 = end.gridY + 0.5;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist === 0) return true;

    const steps = Math.ceil(dist * 4); 

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const checkX = Math.floor(x1 + dx * t);
      const checkY = Math.floor(y1 + dy * t);

      if (gridMap[checkY]?.[checkX] === BLOCKED) {
        return false;
      }
    }

    return true;
  }

  private heuristic(x1: number, y1: number, endX: number, endY: number): number {
    const targetX = endX + 0.5;
    const targetY = endY + 0.5;
    const dx = Math.abs(x1 - targetX);
    const dy = Math.abs(y1 - targetY);
    return (dx + dy) + (1.414 - 2) * Math.min(dx, dy);
  }

  private reconstructPath(nodes: Map<string, any>, currentKey: string): PathNodeState[] {
    const path: PathNodeState[] = [];
    let tempKey: string | null = currentKey;
    while (tempKey) {
      const [y, x] = tempKey.split(',').map(Number);
      path.unshift(new PathNodeState({ gridX: x, gridY: y }));
      const node = nodes.get(tempKey);
      tempKey = node.parent ? `${node.parent[0]},${node.parent[1]}` : null;
    }
    return path;
  }

  public calculateAndSetPath(player: PlayerState, isDuringWave: boolean, newObstacle?: { gridX: number, gridY: number, gridSize: number }): PathNodeState[] | null {
    const gridMap = this.buildPlayerGrid(player, newObstacle);
    const checkpoints = Array.from(player.checkpoints.values());
    if (checkpoints.length < 2) return null;

    let fullFinalPath: PathNodeState[] = [];
    let currentPos = { x: checkpoints[0].gridX + 1, y: checkpoints[0].gridY + 1 };

    for (let i = 1; i < checkpoints.length; i++) {
      const targetCP = checkpoints[i];
      const segmentAStar = this.findPath(gridMap, currentPos.x, currentPos.y, targetCP.gridX, targetCP.gridY);
      
      if (!segmentAStar) return null;

      const simplified = this.simplifyPath(segmentAStar);
      const smoothedSegment = this.smoothPath(simplified, gridMap);

      if (fullFinalPath.length > 0) {
        fullFinalPath.push(...smoothedSegment.slice(1));
      } else {
        fullFinalPath.push(...smoothedSegment);
      }

      const lastNode = smoothedSegment[smoothedSegment.length - 1];
      currentPos = { x: lastNode.gridX, y: lastNode.gridY };
    }

    if (!newObstacle) {
      const targetPath = isDuringWave ? player.pendingPath : player.currentPath;
      targetPath.clear();
      targetPath.push(...fullFinalPath);
      isDuringWave ? player.pendingPathVersion++ : player.currentPathVersion++;
    }

    return fullFinalPath;
  }

  public validatePlacement(player: PlayerState, gridX: number, gridY: number, gridSize: number, isDuringWave: boolean): boolean {
    return this.calculateAndSetPath(player, isDuringWave, { gridX, gridY, gridSize }) !== null;
  }
}