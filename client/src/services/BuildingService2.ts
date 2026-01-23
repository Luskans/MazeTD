import type { Room } from "colyseus.js";
import { BuildingPreviewService } from "./BuildingPreviewService";
import { BuildingSelectionService } from "./BuildingSelectionService";
import { BuildingViewService } from "./BuildingViewService";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { PathfindingService } from "../../../server/src/services/PathfindingService";
import { getColorByAreaType, getPlayerOffset } from "./utils";
import type { AreaState } from "../../../server/src/rooms/schema/AreaState";

export class BuildingService2 {
  private view: BuildingViewService;
  private preview: BuildingPreviewService;
  private selection: BuildingSelectionService;
  private shopData: { id: string | null, type: string | null, size: number | null } = { id: null, type: null, size: null };
  private isPreparing = false;
  private startClickPos = { x: 0, y: 0 };

  constructor(private scene: Phaser.Scene, private room: Room<GameState>, private pathfinding: PathfindingService) {
    this.view = new BuildingViewService(scene);
    this.preview = new BuildingPreviewService(scene);
    this.selection = new BuildingSelectionService(scene);

    this.initEventListeners();
  }

  private initEventListeners() {
    this.scene.game.events.on('choose_tower', (e: any) => this.startPreparation(e));
    this.scene.game.events.on('choose_wall', (e: any) => this.startPreparation(e));
    this.scene.input.on('pointermove', (p: Phaser.Input.Pointer) => this.handlePointerMove(p));
    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handlePointerDown(p));
    this.scene.input.on('pointerup', (p: Phaser.Input.Pointer) => this.handlePointerUp(p));
    this.scene.input.keyboard!.on('keydown-ESC', () => this.cancelPreparation());
  }

  // --- LOGIQUE DE PRÉPARATION ---

  private startPreparation(event: { dataId: string, type: string, size: number }) {
    this.isPreparing = true;
    this.shopData = { id: event.dataId, type: event.type, size: event.size };
    this.preview.activate(event.dataId, event.type, event.size);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing) return;

    const offset = getPlayerOffset(this.room, this.room.sessionId);
    const size = this.shopData.size!;
    const gridX = Math.floor((pointer.worldX - offset.x) / 32);
    const gridY = Math.floor((pointer.worldY - offset.y) / 32);

    const worldX = (gridX * 32) + offset.x;
    const worldY = (gridY * 32) + offset.y;
    const centerX = worldX + (size * 16);
    const centerY = worldY + (size * 16);

    const isValid = this.checkLocalValidity(gridX, gridY);
    const buffColors = this.getBuffColorsAt(centerX, centerY);

    this.preview.update(worldX, worldY, isValid, buffColors);
  }

  private cancelPreparation() {
    this.isPreparing = false;
    this.preview.deactivate();
  }

  // --- LOGIQUE D'ACTION (PLACEMENT / SÉLECTION) ---

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown()) {
      this.startClickPos = { x: pointer.x, y: pointer.y };
      return;
    }

    if (this.isPreparing) {
      this.placeBuilding(pointer);
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonReleased()) {
      const dist = Phaser.Math.Distance.Between(this.startClickPos.x, this.startClickPos.y, pointer.x, pointer.y);
      if (dist < 10) {
        this.cancelPreparation();
        this.selection.deselect();
      }
    }
  }

  private placeBuilding(pointer: Phaser.Input.Pointer) {
    const offset = getPlayerOffset(this.room, this.room.sessionId);
    const gridX = Math.floor((pointer.worldX - offset.x) / 32);
    const gridY = Math.floor((pointer.worldY - offset.y) / 32);

    if (!this.checkLocalValidity(gridX, gridY)) return;

    const player = this.room.state.players.get(this.room.sessionId);
    const isDuringWave = (this.room.state.wavePhase === 'running');
    const isPathPossible = this.pathfinding.validatePlacement(player, gridX, gridY, this.shopData.size!, isDuringWave);

    if (!isPathPossible) return;

    this.room.send("place_building", {
      dataId: this.shopData.id,
      x: gridX,
      y: gridY,
      size: this.shopData.size,
      type: this.shopData.type
    });
  }

  public getSprite(id: string) {
    return this.view.getSprite(id);
  }

  public refreshSelection(buildingState: any, ownerId: string, type: "tower" | "wall") {
    const sprite = this.view.getSprite(buildingState.id);
    if (sprite) this.selection.select(sprite, buildingState, type, ownerId);
  }

  public deselect() {
    this.selection.deselect();
  }

  // --- INTERFACE PUBLIQUE POUR LE STATE (Colyseus) ---

  public addBuilding(buildingState: any, type: "tower" | "wall", player: any, group: Phaser.GameObjects.Group) {
    const offset = getPlayerOffset(this.room, player.sessionId);
    const pos = { x: (buildingState.gridX * 32) + offset.x, y: (buildingState.gridY * 32) + offset.y };

    const sprite = this.view.addBuildingSprite(buildingState, type, pos, player.sessionId, group, (clickedSprite) => {
      this.selection.select(clickedSprite, buildingState, type, player.sessionId);
    });

    if (type === "tower") {
      const colors = this.getBuffColorsAt(sprite.x, sprite.y);
      this.view.addTowerParticles(buildingState.id, sprite.x, sprite.y, colors);
    }
  }

  public updateBuilding(id: string, action: "placing" | "selling") {
    this.view.updateStatus(id, action);
  }

  public removeBuilding(id: string) {
    if (this.selection.getSelectedId() === id) this.selection.deselect();
    this.view.remove(id);
  }

  // --- LOGIQUE MÉTIER / VALIDATION ---

  private checkLocalValidity(gridX: number, gridY: number): boolean {
    const grid = this.room.state.grid;
    const player = this.room.state.players.get(this.room.sessionId);
    const size = this.shopData.size!;
    
    if (gridX < 0 || gridY < 0 || gridX + size > this.room.state.grid.col || gridY + size > this.room.state.grid.row) return false;

    const hasCollision = (ox: number, oy: number, os: number) => !(gridX + size <= ox || ox + os <= gridX || gridY + size <= oy || oy + os <= gridY);
    const wouldFullyBlockCheckpoint = (buildingX: number, buildingY: number, buildingSize: number, checkpointX: number, checkpointY: number) => {
      let blockedCells = 0;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const cellX = checkpointX + dx;
          const cellY = checkpointY + dy;
          if (cellX >= buildingX && cellX < buildingX + buildingSize && cellY >= buildingY && cellY < buildingY + buildingSize) blockedCells++;
        }
      }
      return blockedCells === 4;
    }

    for (const r of player.rocks.values()) if (hasCollision(r.gridX, r.gridY, 2)) return false;
    for (const t of player.towers.values()) if (hasCollision(t.gridX, t.gridY, 2)) return false;
    for (const w of player.walls.values()) if (hasCollision(w.gridX, w.gridY, w.size)) return false;
    for (const c of grid.checkpoints.values()) if (wouldFullyBlockCheckpoint(gridX, gridY, size, c.gridX, c.gridY)) return false;
    return true;
  }

  private getBuffColorsAt(x: number, y: number): number[] {
    const offset = getPlayerOffset(this.room, this.room.sessionId);
    return (this.room.state.grid.areas as AreaState[])
      .filter(area => area.type !== 'speed')
      .filter(area => {
        const areaX = offset.x + (area.gridX * 32);
        const areaY = offset.y + (area.gridY * 32);
        return Phaser.Math.Distance.Between(x, y, areaX, areaY) <= area.radius;
      })
      .map(area => getColorByAreaType(area.type));
  }

  public destroy() {
    this.view.remove("");
    this.preview.deactivate();
    this.selection.deselect();
  }
}