
export const TILE_SIZE = 32;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 480;
export const GRAVITY = 0.6;
export const FRICTION = 0.85;
export const JUMP_FORCE = -14;
export const WALK_SPEED = 4;
export const ENEMY_SPEED = 1.5;

// Simplified Level 1-1 layout
// G = Ground, B = Brick, Q = Question, P = Pipe, F = Flag, E = Enemy
export const LEVEL_LAYOUT = [
  "                                                                                                                                                                    ",
  "                                                                                                                                                                    ",
  "                                                                                                                                                                    ",
  "                                                                                                                                                                    ",
  "                                                                                                                                                                    ",
  "      Q  B Q B Q                                                                                                                                                    ",
  "                                                                                                                                                                    ",
  "                                      B Q B                                                                                                                         ",
  "                                                                                                                                                                    ",
  "                P                     B   B                                                                                                         F               ",
  "                P                     B   B            P                                                                                            F               ",
  "GGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  "GGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
];

// In a real game, this would be a much more complex array.
// We'll generate a more detailed one in the game logic.
