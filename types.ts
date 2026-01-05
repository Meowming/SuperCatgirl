
export type EntityType = 'PLAYER' | 'GOOMBA' | 'BLOCK' | 'QUESTION' | 'COIN' | 'PIPE' | 'FLAG' | 'GROUND';

export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  pos: Vector;
  vel: Vector;
  width: number;
  height: number;
  isDead: boolean;
  isGrounded: boolean;
  data?: any;
}

export interface GameState {
  status: 'MENU' | 'PLAYING' | 'WON' | 'GAMEOVER';
  score: number;
  coins: number;
  lives: number;
  timer: number;
}

export interface Camera {
  x: number;
  y: number;
}
