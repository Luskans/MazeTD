import { GameState } from "../rooms/schema/GameState";
import { PlayerState } from "../rooms/schema/PlayerState";
import { PathNodeState } from "../rooms/schema/PathNodeState";

const BLOCKED = 1;
const FREE = 0;

export class PathfindingService {

  public buildStaticGrid(state: GameState): number[][] {
    const cols = state.grid.col;
    const rows = state.grid.row;
    const gridMap = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (const rock of state.grid.rocks) {
      for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
          if (rock.gridY + y < rows && rock.gridX + x < cols) {
            gridMap[rock.gridY + y][rock.gridX + x] = 1;
          }
        }
      }
    }
    return gridMap;
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

  private buildPlayerGrid(state: GameState, player: PlayerState, newObstacle?: { gridX: number, gridY: number, gridSize: number }): number[][] {
    const cols = state.grid.col;
    const rows = state.grid.row;
    const gridMap = Array.from({ length: rows }, () => new Array(cols).fill(FREE));

    for (const rock of player.rocks.values()) {
      if (!rock.destroyPending) {
        for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 2; y++) {
            if (rock.gridY + y < rows && rock.gridX + x < cols) {
              gridMap[rock.gridY + y][rock.gridX + x] = BLOCKED;
            }
          }
        }
      }
    }

    for (const tower of player.towers.values()) {
      if (!tower.sellingPending) {
        for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 2; y++) {
            if (tower.gridY + y < rows && tower.gridX + x < cols) {
              gridMap[tower.gridY + y][tower.gridX + x] = BLOCKED;
            }
          }
        }
      }
    }

    for (const wall of player.walls.values()) {
      if (!wall.sellingPending) {
        for (let x = 0; x < wall.size; x++) {
          for (let y = 0; y < wall.size; y++) {
            if (wall.gridY + y < rows && wall.gridX + x < cols) {
              gridMap[wall.gridY + y][wall.gridX + x] = BLOCKED;
            }
          }
        }
      }
    }

    if (newObstacle) {
      const size = newObstacle.gridSize;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          if (newObstacle.gridY + y >= 0 && newObstacle.gridY + y < rows && newObstacle.gridX + x >= 0 && newObstacle.gridX + x < cols) {
            gridMap[newObstacle.gridY + y][newObstacle.gridX + x] = BLOCKED;
          }
        }
      }
    }
    return gridMap;
  }

  // private heuristic(x1: number, y1: number, x2: number, y2: number): number {
  //   return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
  // }
  private heuristic(x1: number, y1: number, endX: number, endY: number): number {
    // On vise le centre des 4 cases (endX + 0.5, endY + 0.5)
    const targetX = endX + 0.5;
    const targetY = endY + 0.5;
    return Math.max(Math.abs(x1 - targetX), Math.abs(y1 - targetY));
  }

  // BFS
  // private findPath(gridMap: number[][], startX: number, startY: number, endX: number, endY: number): PathNodeState[] | null {
  //   const rows = gridMap.length;
  //   const cols = gridMap[0].length;

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

  // A*
  // private findPath(gridMap: number[][], startX: number, startY: number, endX: number, endY: number): PathNodeState[] | null {
  //   const rows = gridMap.length;
  //   const cols = gridMap[0].length;
    
  //   // Si le checkpoint de spawn est bloqué, le chemin est invalide
  //   // if (gridMap[startY][startX] !== FREE && gridMap[startY + 1][startX] !== FREE &&
  //   // gridMap[startY][startX + 1] !== FREE && gridMap[startY + 1][startX + 1] !== FREE) {
  //   //     return null;
  //   // }

  //   // Structure de données pour stocker les informations de chaque noeud
  //   const nodes: Map<string, { g: number, f: number, parent: [number, number] | null }> = new Map();
    
  //   // Liste des nœuds à évaluer (simule la Priority Queue en utilisant g + h = f)
  //   const openList: string[] = []; // Contient les clés "y,x"

  //   const startKey = `${startY},${startX}`;
    
  //   // Initialisation du noeud de départ
  //   nodes.set(startKey, { 
  //     g: 0, 
  //     f: this.heuristic(startX, startY, endX, endY), 
  //     parent: null 
  //   });
  //   openList.push(startKey);

  //   // Les 8 directions (DX, DY)
  //   const directions = [
  //     [0, 1], [0, -1], [1, 0], [-1, 0], // Cardinal (coût 1)
  //     [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal (coût Math.SQRT2 ≈ 1.414)
  //   ];

  //   while (openList.length > 0) {
  //     // 1. Trouver le nœud avec le coût f le plus bas dans openList (Simulation de Priority Queue)
  //     let lowestF = Infinity;
  //     let currentKey = '';
  //     let currentIndex = -1;
      
  //     for (let i = 0; i < openList.length; i++) {
  //       const key = openList[i];
  //       const node = nodes.get(key)!;
  //       if (node.f < lowestF) {
  //         lowestF = node.f;
  //         currentKey = key;
  //         currentIndex = i;
  //       }
  //     }
      
  //     // Retirer le nœud sélectionné de l'openList
  //     openList.splice(currentIndex, 1); 
      
  //     const [y, x] = currentKey.split(',').map(Number);
      
  //     // 2. Condition d'arrêt
  //     if (x === endX && y === endY) {
  //     // if (x >= endX && x < endX + 2 && y >= endY && y < endY + 2) {
  //       // Chemin trouvé ! Reconstruire et retourner le chemin
  //       const path: PathNodeState[] = [];
  //       let currentCoords: [number, number] = [y, x];

  //       while (nodes.get(`${currentCoords[0]},${currentCoords[1]}`)!.parent !== null) {
  //         const [cY, cX] = currentCoords;
  //         path.unshift(new PathNodeState({ gridX: cX, gridY: cY }));
  //         currentCoords = nodes.get(`${cY},${cX}`)!.parent!;
  //       }
  //       // Ajouter le point de départ
  //       path.unshift(new PathNodeState({ gridX: startX, gridY: startY }));
        
  //       return path;
  //     }

  //     // 3. Examiner les voisins
  //     for (let i = 0; i < directions.length; i++) {
  //       const [dy, dx] = directions[i];
  //       const newY = y + dy;
  //       const newX = x + dx;
        
  //       const neighborKey = `${newY},${newX}`;

  //       // Déterminer le coût du pas (1 pour cardinal, sqrt(2) pour diagonal)
  //       const moveCost = (i < 4) ? 1 : Math.SQRT2; 

  //       // Vérifications de limites et d'obstacles
  //       if (newY >= 0 && newY < rows && newX >= 0 && newX < cols && gridMap[newY][newX] === FREE) {
  //         if (i >= 4) { // Si c'est une direction diagonale
  //           // Pour aller en (x+1, y+1), il faut que (x+1, y) ET (x, y+1) soient libres
  //           if (gridMap[y][newX] !== FREE || gridMap[newY][x] !== FREE) {
  //               continue; // On bloque le passage diagonal si un des coins est occupé
  //           }
  //         }

  //         const currentNode = nodes.get(currentKey)!;
  //         const tentativeGScore = currentNode.g + moveCost;

  //         const neighborNode = nodes.get(neighborKey);

  //         // Si le voisin n'a pas été visité ou si le nouveau chemin est meilleur (G plus petit)
  //         if (!neighborNode || tentativeGScore < neighborNode.g) {
  //           const newG = tentativeGScore;
  //           const newH = this.heuristic(newX, newY, endX, endY);
  //           const newF = newG + newH;
            
  //           nodes.set(neighborKey, { 
  //             g: newG, 
  //             f: newF, 
  //             parent: [y, x] 
  //           });

  //           // Si le voisin n'était pas dans openList, l'ajouter
  //           if (openList.indexOf(neighborKey) === -1) {
  //             openList.push(neighborKey);
  //           }
  //         }
  //       }
  //     }
  //   }
    
  //   return null; // Pas de chemin trouvé
  // }

  private findPath(gridMap: number[][], startX: number, startY: number, endX: number, endY: number): PathNodeState[] | null {
    const rows = gridMap.length;
    const cols = gridMap[0].length;
    
    const nodes: Map<string, { g: number, f: number, parent: [number, number] | null }> = new Map();
    const openList: string[] = [];

    const startKey = `${startY},${startX}`;
    nodes.set(startKey, { 
      g: 0, 
      f: this.heuristic(startX, startY, endX, endY), 
      parent: null 
    });
    openList.push(startKey);

    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    while (openList.length > 0) {
      // 1. Recherche du meilleur nœud (Priority Queue)
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (nodes.get(openList[i])!.f < nodes.get(openList[currentIndex])!.f) currentIndex = i;
      }
      
      const currentKey = openList.splice(currentIndex, 1)[0];
      const [y, x] = currentKey.split(',').map(Number);

      // 2. Condition d'arrêt : on est DANS le checkpoint 2x2
      if (x >= endX && x < endX + 2 && y >= endY && y < endY + 2) {
        const path: PathNodeState[] = [];
        let tempKey: string | null = currentKey;
        while (tempKey) {
          const node = nodes.get(tempKey)!;
          const [pY, pX] = tempKey.split(',').map(Number);
          path.unshift(new PathNodeState({ gridX: pX, gridY: pY }));
          tempKey = node.parent ? `${node.parent[0]},${node.parent[1]}` : null;
        }
        return path;
      }

      // 3. Voisins
      for (let i = 0; i < directions.length; i++) {
        const [dy, dx] = directions[i];
        const nY = y + dy;
        const nX = x + dx;
        const nKey = `${nY},${nX}`;

        if (nY >= 0 && nY < rows && nX >= 0 && nX < cols && gridMap[nY][nX] === 0) {
          // Bloquer diagonales si coins occupés
          if (i >= 4 && (gridMap[y][nX] !== 0 || gridMap[nY][x] !== 0)) continue;

          const moveCost = i < 4 ? 1 : 1.414;
          const gScore = nodes.get(currentKey)!.g + moveCost;

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
    }
    return null;
  }

  // private simplifyPath(path: PathNodeState[]): PathNodeState[] {
  //   if (path.length <= 2) return path;

  //   const simplified: PathNodeState[] = [];
  //   simplified.push(path[0]); // Toujours garder le départ

  //   for (let i = 1; i < path.length - 1; i++) {
  //     const prev = path[i - 1];
  //     const curr = path[i];
  //     const next = path[i + 1];

  //     // Calcul du vecteur de direction entre (prev -> curr) et (curr -> next)
  //     const dx1 = curr.gridX - prev.gridX;
  //     const dy1 = curr.gridY - prev.gridY;
  //     const dx2 = next.gridX - curr.gridX;
  //     const dy2 = next.gridY - curr.gridY;

  //     // Si la direction change (on n'est plus en ligne droite), on garde le point 'curr'
  //     // On utilise le produit en croix pour vérifier l'alignement (plus robuste que les pentes)
  //     if (dx1 * dy2 !== dy1 * dx2) {
  //       simplified.push(curr);
  //     }
  //   }

  //   simplified.push(path[path.length - 1]); // Toujours garder l'arrivée
  //   return simplified;
  // }
  // private simplifyPath(path: PathNodeState[]): PathNodeState[] {
  //   if (path.length <= 2) return path;

  //   const simplified: PathNodeState[] = [];
  //   simplified.push(path[0]); // Toujours garder le départ

  //   for (let i = 1; i < path.length - 1; i++) {
  //     const prev = path[i - 1];
  //     const curr = path[i];
  //     const next = path[i + 1];

  //     const dx1 = curr.gridX - prev.gridX;
  //     const dy1 = curr.gridY - prev.gridY;
  //     const dx2 = next.gridX - curr.gridX;
  //     const dy2 = next.gridY - curr.gridY;

  //     // Normalisation des vecteurs (pour ne comparer que la direction)
  //     const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  //     const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

  //     // Si l'un des segments est de longueur 0 (doublon), on ignore ce point
  //     if (len1 === 0 || len2 === 0) continue;

  //     // Produit en croix pour vérifier la colinéarité
  //     // On utilise une petite marge (epsilon) pour les arrondis de diagonales
  //     const crossProduct = (dx1 / len1) * (dy2 / len2) - (dy1 / len1) * (dx2 / len2);
      
  //     if (Math.abs(crossProduct) > 0.01) {
  //       simplified.push(curr);
  //     }
  //   }

  //   simplified.push(path[path.length - 1]); // Toujours garder l'arrivée
  //   return simplified;
  // }
  private simplifyPath(path: PathNodeState[], protectedIndices: number[]): PathNodeState[] {
    if (path.length <= 2) return path;

    const simplified: PathNodeState[] = [];
    simplified.push(path[0]); // Garder le départ

    for (let i = 1; i < path.length - 1; i++) {
      if (protectedIndices.includes(i)) {
        simplified.push(path[i]);
        continue;
      }

      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];

      const dirX1 = Math.sign(curr.gridX - prev.gridX);
      const dirY1 = Math.sign(curr.gridY - prev.gridY);
      const dirX2 = Math.sign(next.gridX - curr.gridX);
      const dirY2 = Math.sign(next.gridY - curr.gridY);

      if (dirX1 !== dirX2 || dirY1 !== dirY2) {
        simplified.push(curr); // C'est un virage, on garde !
      }
    }

    simplified.push(path[path.length - 1]); // Garder l'arrivée
    return simplified;
  } 

  // public calculateAndSetPath(state: GameState, player: PlayerState, newObstacle?: { gridX: number, gridY: number, gridSize: number }): PathNodeState[] | null {
  //   const gridMap = this.buildPlayerGrid(state, player, newObstacle);
  //   const checkpoints = Array.from(player.checkpoints.values());
  //   if (checkpoints.length === 0) return null;
    
  //   let fullPath: PathNodeState[] = [];

  //   // let startPoint = { x: checkpoints[0].gridX + 1, y: checkpoints[0].gridY + 1 }
  //   // let startPoint = { x: checkpoints[0].gridX, y: checkpoints[0].gridY }
  //   let startPoint: {x: number, y: number} | null = null;
  //   for(let y = 0; y < 2; y++) {
  //       for(let x = 0; x < 2; x++) {
  //           if (gridMap[checkpoints[0].gridY + y][checkpoints[0].gridX + x] === FREE) {
  //               startPoint = { x: checkpoints[0].gridX + x, y: checkpoints[0].gridY + y };
  //               break;
  //           }
  //       }
  //       if (startPoint) break;
  //   }
  //   // Si les 4 cases du CP0 sont BLOCKED, startPoint restera null -> Chemin bloqué !
  //   if (!startPoint) return null;
    
  //   // Parcourir tous les checkpoints séquentiellement
  //   for (let i = 0; i < checkpoints.length; i++) {
  //     const checkpoint = checkpoints[i];
      
  //     // Le point de départ est soit l'entrée, soit le dernier checkpoint
  //     const pathStartX = startPoint.x;
  //     const pathStartY = startPoint.y;
      
  //     // Le point d'arrivée est le centre d'une cellule du checkpoint (arbitrairement x+1, y+1)
  //     // const pathEndX = checkpoint.gridX + 1; 
  //     // const pathEndY = checkpoint.gridY + 1;
  //     const pathEndX = checkpoint.gridX; 
  //     const pathEndY = checkpoint.gridY;
      
  //     const segmentPath = this.findPath(gridMap, pathStartX, pathStartY, pathEndX, pathEndY);

  //     if (!segmentPath) return null;

  //     // Ajouter le segment au chemin total (en excluant le point de départ, sauf si c'est le premier segment)
  //     // if (i > 0) {
  //     //   fullPath.push(...segmentPath.slice(1)); // Exclure le point de départ (déjà dans le chemin)
  //     // } else {
  //     //   fullPath.push(...segmentPath);
  //     // }
  //     fullPath.push(...segmentPath);

  //     // Le point de départ du segment suivant est le point d'arrivée de celui-ci
  //     startPoint = { x: pathEndX, y: pathEndY };
  //   }
    
  //   const optimizedPath = this.simplifyPath(fullPath);

  //   if (!newObstacle) { 
  //       player.currentPath.clear();
  //       // On ne pousse que les points "clés" (angles)
  //       player.currentPath.push(...optimizedPath);
  //   }
  //   // // Après avoir vérifié tous les segments, si nous sommes en mode "SET" (non validation), on met à jour le state Colyseus
  //   // if (!newObstacle) { 
  //   //   player.currentPath.clear();
  //   //   player.currentPath.push(...fullPath);
  //   // }

  //   // return fullPath;
  //   return optimizedPath;
  // }

  public calculateAndSetPath(state: GameState, player: PlayerState, isDuringWave: boolean, newObstacle?: { gridX: number, gridY: number, gridSize: number }): PathNodeState[] | null {
    const gridMap = this.buildPlayerGrid(state, player, newObstacle);
    const checkpoints = Array.from(player.checkpoints.values());
    if (checkpoints.length === 0) return null;

    let checkpointIndices: number[] = [];
    let fullPath: PathNodeState[] = [];

    // --- 1. Trouver le point de spawn (1ère case libre du CP0) ---
    const cp0 = checkpoints[0];
    let currentPos: {x: number, y: number} | null = null;
    
    for(let y = 0; y < 2; y++) {
      for(let x = 0; x < 2; x++) {
        if (gridMap[cp0.gridY + y][cp0.gridX + x] === 0) { // 0 = FREE
          currentPos = { x: cp0.gridX + x, y: cp0.gridY + y };
          break;
        }
      }
      if (currentPos) break;
    }

    if (!currentPos) return null; // CP0 totalement bloqué

    // --- 2. Calculer les segments vers les checkpoints suivants ---
    // On commence à i = 1 car i = 0 est notre point de départ
    for (let i = 1; i < checkpoints.length; i++) {
      const targetCP = checkpoints[i];
      
      // On part de la position RÉELLE du dernier segment
      const segmentPath = this.findPath(gridMap, currentPos.x, currentPos.y, targetCP.gridX, targetCP.gridY);

      if (!segmentPath) return null;

      // Fusion sans doublon (le premier point du segment est le dernier du précédent)
      if (fullPath.length > 0) {
        fullPath.push(...segmentPath.slice(1));
      } else {
        fullPath.push(...segmentPath);
      }

      checkpointIndices.push(fullPath.length - 1);
      // --- LA RÉPARATION EST ICI ---
      // On met à jour currentPos avec la case EXACTE où l'A* s'est arrêté dans le CP cible
      const lastNode = segmentPath[segmentPath.length - 1];
      currentPos = { x: lastNode.gridX, y: lastNode.gridY };
    }
    
    // 3. Optimisation et State
    // const cleanedPath = fullPath.filter((node, index, array) => {
    //   if (index === 0) return true;
    //   const prev = array[index - 1];
    //   return node.gridX !== prev.gridX || node.gridY !== prev.gridY;
    // });

    // const optimizedPath = this.simplifyPath(cleanedPath);
    // const optimizedPath = this.simplifyPath(fullPath);
    if (!newObstacle) { 
      if (isDuringWave) {
        player.pendingPath.clear();
        player.pendingPath.push(...fullPath);
        player.pendingPathVersion++;
      } else {
        player.currentPath.clear();
        player.currentPath.push(...fullPath);
        player.currentPathVersion++;
        // player.pendingPath.clear();
        // player.pendingPath.push(...fullPath);
        // player.pendingPathVersion++;
        if (player.pendingPath.length > 0) {
            player.pendingPath.clear();
            player.pendingPathVersion++;
        }
      }
    }
    return fullPath;
    // return optimizedPath;
}

  /**
   * Vérifie si l'ajout d'une structure bloque le chemin pour un joueur.
   */
  public validatePlacement(state: GameState, player: PlayerState, gridX: number, gridY: number, gridSize: number, isDuringWave: boolean): boolean {
    const path = this.calculateAndSetPath(state, player, isDuringWave, { gridX, gridY, gridSize });
    return path !== null;
  }
}