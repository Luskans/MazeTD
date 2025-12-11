import { GameState } from "../rooms/schema/GameState";
import { PlayerState } from "../rooms/schema/PlayerState";
import { PathNodeState } from "../rooms/schema/PathNodeState";

const BLOCKED = 1;
const FREE = 0;

export class PathfindingService {

  // private buildPlayerGridMap(state: GameState, player: PlayerState, newObstacle?: { x: number, y: number, size: number }): number[][] {
  //   const cols = state.grid.col;
  //   const rows = state.grid.row;
    
  //   // Initialiser la grille avec des cellules libres
  //   const gridMap = Array.from({ length: rows }, () => new Array(cols).fill(FREE));

  //   // 1. Ajouter les rochers initiaux non détruits
  //   // (Si le joueur peut détruire les rochers, vous auriez besoin d'une liste de "rocksRemaining" dans PlayerState)
  //   // Ici, on utilise la liste de rocks copiée lors du setup (player.rocks)
  //   for (const rock of player.rocks.values()) {
  //     for (let x = 0; x < 2; x++) {
  //       for (let y = 0; y < 2; y++) {
  //         if (rock.gridY + y < rows && rock.gridX + x < cols) {
  //           gridMap[rock.gridY + y][rock.gridX + x] = BLOCKED;
  //         }
  //       }
  //     }
  //   }

  //   // 2. Ajouter les tours et murs du joueur
  //   for (const tower of player.towers.values()) {
  //     // Supposons que les tours/murs bloquent 1x1 ou 2x2 cellules selon la taille
  //     // Pour l'exemple, supposons 1x1
  //     if (tower.gridY < rows && tower.gridX < cols) {
  //       gridMap[tower.gridY][tower.gridX] = BLOCKED;
  //     }
  //   }
  //   for (const wall of player.walls.values()) {
  //     if (wall.gridY < rows && wall.gridX < cols) {
  //       gridMap[wall.gridY][wall.gridX] = BLOCKED;
  //     }
  //   }

  //   // 3. Ajouter l'obstacle de test (pour la validation)
  //   if (newObstacle) {
  //     const size = newObstacle.size;
  //     for (let x = 0; x < size; x++) {
  //       for (let y = 0; y < size; y++) {
  //         if (newObstacle.y + y < rows && newObstacle.x + x < cols) {
  //           gridMap[newObstacle.y + y][newObstacle.x + x] = BLOCKED;
  //         }
  //       }
  //     }
  //   }

  //   // IMPORTANT : Les checkpoints ne sont PAS bloquants (CELL_CHECKPOINT est FREE)
  //   // Les ennemis doivent pouvoir passer.

  //   return gridMap;
  // }

  // // --- 2. Algorithme de Recherche de Chemin (A* ou BFS/Dijkstra) ---
  // /**
  //  * Trouve un chemin du point de départ au point d'arrivée en évitant les BLOCKED.
  //  * Retourne le chemin complet (Array<PathNodeState>) ou null si pas de chemin.
  //  * Pour ce jeu TD, le BFS est souvent suffisant si le coût de déplacement est uniforme (1 par case).
  //  */
  // private findPath(gridMap: number[][], startX: number, startY: number, endX: number, endY: number): PathNodeState[] | null {
  //   const rows = gridMap.length;
  //   const cols = gridMap[0].length;

  //   // BFS avec reconstruction du chemin
  //   const queue: [number, number][] = [[startY, startX]];
  //   const visited = new Set<string>();
  //   visited.add(`${startY},${startX}`);
  //   const parentMap = new Map<string, [number, number]>(); // Pour reconstruire le chemin

  //   const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Droite, Gauche, Bas, Haut

  //   while (queue.length > 0) {
  //     const [y, x] = queue.shift()!;

  //     if (x === endX && y === endY) {
  //       // Chemin trouvé ! Reconstruire le chemin
  //       const path: PathNodeState[] = [];
  //       let current: [number, number] | undefined = [y, x];

  //       while (current) {
  //         const [cY, cX] = current;
  //         path.unshift(new PathNodeState({ gridX: cX, gridY: cY }));
          
  //         const key = `${cY},${cX}`;
  //         const parentCoords = parentMap.get(key);
          
  //         if (parentCoords) {
  //           current = parentCoords;
  //         } else {
  //           current = undefined; // Sortir de la boucle (atteint le point de départ)
  //         }
  //       }
  //       return path;
  //     }

  //     for (const [dy, dx] of directions) {
  //       const newY = y + dy;
  //       const newX = x + dx;

  //       if (newY >= 0 && newY < rows && newX >= 0 && newX < cols) {
  //         const key = `${newY},${newX}`;
  //         // S'assurer que ce n'est pas bloqué et pas déjà visité
  //         if (gridMap[newY][newX] === FREE && !visited.has(key)) {
  //           visited.add(key);
  //           parentMap.set(key, [y, x]);
  //           queue.push([newY, newX]);
  //         }
  //       }
  //     }
  //   }
  //   return null; // Pas de chemin trouvé
  // }

  // public calculateAndSetPath(state: GameState, player: PlayerState, newObstacle?: { gridX: number, gridY: number, gridSize: number }): PathNodeState[] | null {
  //   const gridMap = this.buildPlayerGridMap(state, player, newObstacle);
    
  //   let fullPath: PathNodeState[] = [];
  //   let startPoint = { x: Math.floor(state.grid.col / 2), y: 0 }; // Point d'entrée de la carte (Exemple)

  //   const checkpoints = player.checkpoints;
    
  //   // Parcourir tous les checkpoints séquentiellement
  //   for (let i = 0; i < checkpoints.length; i++) {
  //     const checkpoint = checkpoints[i];
      
  //     // Le point de départ est soit l'entrée, soit le dernier checkpoint
  //     const pathStartX = startPoint.x;
  //     const pathStartY = startPoint.y;
      
  //     // Le point d'arrivée est le centre d'une cellule du checkpoint (arbitrairement x+1, y+1)
  //     const pathEndX = checkpoint.gridX + 1; 
  //     const pathEndY = checkpoint.gridY + 1;
      
  //     const segmentPath = this.findPath(gridMap, pathStartX, pathStartY, pathEndX, pathEndY);

  //     if (!segmentPath) {
  //       // Si un seul segment est bloqué, le chemin total est invalide
  //       return null;
  //     }

  //     // Ajouter le segment au chemin total (en excluant le point de départ, sauf si c'est le premier segment)
  //     if (i > 0) {
  //       fullPath.push(...segmentPath.slice(1)); // Exclure le point de départ (déjà dans le chemin)
  //     } else {
  //       fullPath.push(...segmentPath);
  //     }

  //     // Le point de départ du segment suivant est le point d'arrivée de celui-ci
  //     startPoint = { x: pathEndX, y: pathEndY };
  //   }
    
  //   // Après avoir vérifié tous les segments, si nous sommes en mode "SET" (non validation), on met à jour le state Colyseus
  //   if (!newObstacle) { 
  //     player.currentPath.clear();
  //     player.currentPath.push(...fullPath);
  //   }

  //   return fullPath;
  // }

  // /**
  //  * Vérifie si l'ajout d'une structure bloque le chemin pour un joueur.
  //  */
  // private validatePlacement(state: GameState, player: PlayerState, gridX: number, gridY: number, gridSize: number): boolean {
  //   const path = this.calculateAndSetPath(state, player, { gridX, gridY, gridSize });
  //   return path !== null;
  // }










  // private updatePlayerGrid(player: PlayerState, gridX: number, gridY: number, gridSize: number, action: string): void {

  // }

  // private updatePlayerPathfinding(player: PlayerState, grid: number[][]): void {

  // }

  // private findPath2(grid: number[][], startX: number, startY: number, endX: number, endY: number): PathNodeState[] | null {

  // }

  // private checkPlacement(player: PlayerState, gridX: number, gridY: number, gridSize: number): boolean {

  // }




  private buildPlayerGrid(state: GameState, player: PlayerState, newObstacle?: { gridX: number, gridY: number, gridSize: number }): number[][] {
    const cols = state.grid.col;
    const rows = state.grid.row;
    const gridMap = Array.from({ length: rows }, () => new Array(cols).fill(FREE));

    for (const rock of player.rocks.values()) {
      for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
          if (rock.gridY + y < rows && rock.gridX + x < cols) {
            gridMap[rock.gridY + y][rock.gridX + x] = BLOCKED;
          }
        }
      }
    }

    for (const tower of player.towers.values()) {
      for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
          if (tower.gridY + y < rows && tower.gridX + x < cols) {
            gridMap[tower.gridY + y][tower.gridX + x] = BLOCKED;
          }
        }
      }
    }

    for (const wall of player.walls.values()) {
      let size = wall.size === 32 ? 1 : 2;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          if (newObstacle.gridY + y < rows && newObstacle.gridX + x < cols) {
            gridMap[newObstacle.gridY + y][newObstacle.gridX + x] = BLOCKED;
          }
        }
      }
    }

    if (newObstacle) {
      const size = newObstacle.gridSize;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          if (newObstacle.gridY + y < rows && newObstacle.gridX + x < cols) {
            gridMap[newObstacle.gridY + y][newObstacle.gridX + x] = BLOCKED;
          }
        }
      }
    }

    return gridMap;
  }

  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
  }

  // BFS
  private findPath(gridMap: number[][], startX: number, startY: number, endX: number, endY: number): PathNodeState[] | null {
    const rows = gridMap.length;
    const cols = gridMap[0].length;

    const queue: [number, number][] = [[startY, startX]];
    const visited = new Set<string>();
    visited.add(`${startY},${startX}`);
    const parentMap = new Map<string, [number, number]>(); // Pour reconstruire le chemin

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Droite, Gauche, Bas, Haut

    while (queue.length > 0) {
      const [y, x] = queue.shift()!;

      if (x === endX && y === endY) {
        // Chemin trouvé ! Reconstruire le chemin
        const path: PathNodeState[] = [];
        let current: [number, number] | undefined = [y, x];

        while (current) {
          const [cY, cX] = current;
          path.unshift(new PathNodeState({ gridX: cX, gridY: cY }));
          
          const key = `${cY},${cX}`;
          const parentCoords = parentMap.get(key);
          
          if (parentCoords) {
            current = parentCoords;
          } else {
            current = undefined; // Sortir de la boucle (atteint le point de départ)
          }
        }
        return path;
      }

      for (const [dy, dx] of directions) {
        const newY = y + dy;
        const newX = x + dx;

        if (newY >= 0 && newY < rows && newX >= 0 && newX < cols) {
          const key = `${newY},${newX}`;
          // S'assurer que ce n'est pas bloqué et pas déjà visité
          if (gridMap[newY][newX] === FREE && !visited.has(key)) {
            visited.add(key);
            parentMap.set(key, [y, x]);
            queue.push([newY, newX]);
          }
        }
      }
    }
    return null; // Pas de chemin trouvé
  }

  // A*
  private findPath(gridMap: number[][], startX: number, startY: number, endX: number, endY: number): PathNodeState[] | null {
    const rows = gridMap.length;
    const cols = gridMap[0].length;
    
    // Structure de données pour stocker les informations de chaque noeud
    const nodes: Map<string, { g: number, f: number, parent: [number, number] | null }> = new Map();
    
    // Liste des nœuds à évaluer (simule la Priority Queue en utilisant g + h = f)
    const openList: string[] = []; // Contient les clés "y,x"

    const startKey = `${startY},${startX}`;
    
    // Initialisation du noeud de départ
    nodes.set(startKey, { 
      g: 0, 
      f: this.heuristic(startX, startY, endX, endY), 
      parent: null 
    });
    openList.push(startKey);

    // Les 8 directions (DX, DY)
    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0], // Cardinal (coût 1)
      [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal (coût Math.SQRT2 ≈ 1.414)
    ];

    while (openList.length > 0) {
      // 1. Trouver le nœud avec le coût f le plus bas dans openList (Simulation de Priority Queue)
      let lowestF = Infinity;
      let currentKey = '';
      let currentIndex = -1;
      
      for (let i = 0; i < openList.length; i++) {
        const key = openList[i];
        const node = nodes.get(key)!;
        if (node.f < lowestF) {
          lowestF = node.f;
          currentKey = key;
          currentIndex = i;
        }
      }
      
      // Retirer le nœud sélectionné de l'openList
      openList.splice(currentIndex, 1); 
      
      const [y, x] = currentKey.split(',').map(Number);
      
      // 2. Condition d'arrêt
      if (x === endX && y === endY) {
        // Chemin trouvé ! Reconstruire et retourner le chemin
        const path: PathNodeState[] = [];
        let currentCoords: [number, number] = [y, x];

        while (nodes.get(`${currentCoords[0]},${currentCoords[1]}`)!.parent !== null) {
          const [cY, cX] = currentCoords;
          path.unshift(new PathNodeState({ gridX: cX, gridY: cY }));
          currentCoords = nodes.get(`${cY},${cX}`)!.parent!;
        }
        // Ajouter le point de départ
        path.unshift(new PathNodeState({ gridX: startX, gridY: startY }));
        
        return path;
      }

      // 3. Examiner les voisins
      for (let i = 0; i < directions.length; i++) {
        const [dy, dx] = directions[i];
        const newY = y + dy;
        const newX = x + dx;
        
        const neighborKey = `${newY},${newX}`;

        // Déterminer le coût du pas (1 pour cardinal, sqrt(2) pour diagonal)
        const moveCost = (i < 4) ? 1 : Math.SQRT2; 

        // Vérifications de limites et d'obstacles
        if (newY >= 0 && newY < rows && newX >= 0 && newX < cols && gridMap[newY][newX] === FREE) {
          const currentNode = nodes.get(currentKey)!;
          const tentativeGScore = currentNode.g + moveCost;

          const neighborNode = nodes.get(neighborKey);

          // Si le voisin n'a pas été visité ou si le nouveau chemin est meilleur (G plus petit)
          if (!neighborNode || tentativeGScore < neighborNode.g) {
            const newG = tentativeGScore;
            const newH = this.heuristic(newX, newY, endX, endY);
            const newF = newG + newH;
            
            nodes.set(neighborKey, { 
              g: newG, 
              f: newF, 
              parent: [y, x] 
            });

            // Si le voisin n'était pas dans openList, l'ajouter
            if (openList.indexOf(neighborKey) === -1) {
              openList.push(neighborKey);
            }
          }
        }
      }
    }
    
    return null; // Pas de chemin trouvé
  }

  public calculateAndSetPath(state: GameState, player: PlayerState, newObstacle?: { gridX: number, gridY: number, gridSize: number }): PathNodeState[] | null {
    const gridMap = this.buildPlayerGrid(state, player, newObstacle);
    
    let fullPath: PathNodeState[] = [];
    // let startPoint = { x: Math.floor(state.grid.col / 2), y: 0 }; // Point d'entrée de la carte (Exemple)

    const checkpoints = Array.from(player.checkpoints.values());
    let startPoint = { x: checkpoints[0].gridX + 1, y: checkpoints[0].gridY + 1 }
    
    // Parcourir tous les checkpoints séquentiellement
    for (let i = 0; i < checkpoints.length; i++) {
      const checkpoint = checkpoints[i];
      
      // Le point de départ est soit l'entrée, soit le dernier checkpoint
      const pathStartX = startPoint.x;
      const pathStartY = startPoint.y;
      
      // Le point d'arrivée est le centre d'une cellule du checkpoint (arbitrairement x+1, y+1)
      const pathEndX = checkpoint.gridX + 1; 
      const pathEndY = checkpoint.gridY + 1;
      
      const segmentPath = this.findPath(gridMap, pathStartX, pathStartY, pathEndX, pathEndY);

      if (!segmentPath) {
        // Si un seul segment est bloqué, le chemin total est invalide
        return null;
      }

      // Ajouter le segment au chemin total (en excluant le point de départ, sauf si c'est le premier segment)
      if (i > 0) {
        fullPath.push(...segmentPath.slice(1)); // Exclure le point de départ (déjà dans le chemin)
      } else {
        fullPath.push(...segmentPath);
      }

      // Le point de départ du segment suivant est le point d'arrivée de celui-ci
      startPoint = { x: pathEndX, y: pathEndY };
    }
    
    // Après avoir vérifié tous les segments, si nous sommes en mode "SET" (non validation), on met à jour le state Colyseus
    if (!newObstacle) { 
      player.currentPath.clear();
      player.currentPath.push(...fullPath);
    }

    return fullPath;
  }

  /**
   * Vérifie si l'ajout d'une structure bloque le chemin pour un joueur.
   */
  public validatePlacement(state: GameState, player: PlayerState, gridX: number, gridY: number, gridSize: number): boolean {
    const path = this.calculateAndSetPath(state, player, { gridX, gridY, gridSize });
    return path !== null;
  }

}