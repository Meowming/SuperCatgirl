
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Entity, GameState, Camera, EntityType } from './types';
import { 
  TILE_SIZE, 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  FRICTION, 
  JUMP_FORCE, 
  WALK_SPEED, 
  ENEMY_SPEED 
} from './constants';
import { drawBackground, drawEntity } from './services/renderer';
import { checkCollision } from './services/physics';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(true); // Always true now since we draw directly
  
  const [gameState, setGameState] = useState<GameState>({
    status: 'MENU',
    score: 0,
    coins: 0,
    lives: 3,
    timer: 400,
  });

  const playerRef = useRef<Entity | null>(null);
  const entitiesRef = useRef<Entity[]>([]);
  const cameraRef = useRef<Camera>({ x: 0, y: 0 });
  const keys = useRef<{ [key: string]: boolean }>({});

  const initLevel = useCallback(() => {
    const newEntities: Entity[] = [];
    const layout = [
      "                                                                                                                                                                    ",
      "                                                                                                                                                                    ",
      "                                                                                                                                                                    ",
      "                                                                                                                                                                    ",
      "                                                                                                                                                                    ",
      "      Q  B Q B Q                                              Q  Q  Q                                                                                       ",
      "                                                                                                                                                                    ",
      "                                      B Q B                                       B B B                                                                     ",
      "                                                                                                                                                                    ",
      "                P                                                                                                                                   F               ",
      "                P                     B   B            P                     B B B B B                                                              F               ",
      "GGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ];

    layout.forEach((row, y) => {
      [...row].forEach((char, x) => {
        const pos = { x: x * TILE_SIZE, y: y * TILE_SIZE };
        const baseEntity = {
          id: Math.random().toString(36).substr(2, 9),
          pos,
          vel: { x: 0, y: 0 },
          width: TILE_SIZE,
          height: TILE_SIZE,
          isDead: false,
          isGrounded: false,
        };

        if (char === 'G') newEntities.push({ ...baseEntity, type: 'GROUND' });
        if (char === 'B') newEntities.push({ ...baseEntity, type: 'BLOCK' });
        if (char === 'Q') newEntities.push({ ...baseEntity, type: 'QUESTION' });
        if (char === 'P') newEntities.push({ ...baseEntity, type: 'PIPE', data: { isTop: y === 9 } });
        if (char === 'F') newEntities.push({ ...baseEntity, type: 'FLAG', height: TILE_SIZE * 8, pos: { ...pos, y: pos.y - TILE_SIZE * 7 } });
      });
    });

    const goombaPositions = [15, 25, 35, 45, 55, 65, 85, 105];
    goombaPositions.forEach((x, i) => {
      newEntities.push({
        id: `goomba-${i}`,
        type: 'GOOMBA',
        pos: { x: x * TILE_SIZE, y: 10 * TILE_SIZE },
        vel: { x: -ENEMY_SPEED, y: 0 },
        width: TILE_SIZE,
        height: TILE_SIZE,
        isDead: false,
        isGrounded: false,
      });
    });

    playerRef.current = {
      id: 'player',
      type: 'PLAYER',
      pos: { x: 100, y: 100 },
      vel: { x: 0, y: 0 },
      width: 28, 
      height: 44, 
      isDead: false,
      isGrounded: false,
      data: { facing: 'right' }
    };

    entitiesRef.current = newEntities;
    cameraRef.current = { x: 0, y: 0 };
    setGameState({ status: 'PLAYING', score: 0, coins: 0, lives: 3, timer: 400 });
  }, []);

  const startGame = () => initLevel();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const loop = (timestamp: number) => {
      if (gameState.status === 'PLAYING') {
        update();
        render();
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    const update = () => {
      const player = playerRef.current;
      const entities = entitiesRef.current;
      if (!player) return;

      if (keys.current['ArrowLeft']) {
        player.vel.x -= WALK_SPEED * 0.2;
        player.data.facing = 'left';
      }
      if (keys.current['ArrowRight']) {
        player.vel.x += WALK_SPEED * 0.2;
        player.data.facing = 'right';
      }
      player.vel.x *= FRICTION;
      player.pos.x += player.vel.x;

      for (const entity of entities) {
        if (entity.isDead) continue;
        if (['GROUND', 'BLOCK', 'QUESTION', 'PIPE'].includes(entity.type)) {
          if (checkCollision(player, entity)) {
            if (player.vel.x > 0) {
              player.pos.x = entity.pos.x - player.width;
              player.vel.x = 0;
            } else if (player.vel.x < 0) {
              player.pos.x = entity.pos.x + entity.width;
              player.vel.x = 0;
            }
          }
        }
      }

      player.vel.y += GRAVITY;
      if ((keys.current['Space'] || keys.current['ArrowUp']) && player.isGrounded) {
        player.vel.y = JUMP_FORCE;
        player.isGrounded = false;
      }
      player.pos.y += player.vel.y;
      player.isGrounded = false;

      for (const entity of entities) {
        if (entity.isDead) continue;
        if (['GROUND', 'BLOCK', 'QUESTION', 'PIPE'].includes(entity.type)) {
          if (checkCollision(player, entity)) {
            if (player.vel.y > 0) {
              player.pos.y = entity.pos.y - player.height;
              player.vel.y = 0;
              player.isGrounded = true;
            } else if (player.vel.y < 0) {
              player.pos.y = entity.pos.y + entity.height;
              player.vel.y = 0;
              if (entity.type === 'QUESTION') {
                entity.type = 'BLOCK';
                setGameState(s => ({ ...s, coins: s.coins + 1, score: s.score + 100 }));
              }
            }
          }
        } else if (entity.type === 'FLAG' && checkCollision(player, entity)) {
          setGameState(prev => ({ ...prev, status: 'WON' }));
        }
      }

      for (const entity of entities) {
        if (entity.type === 'GOOMBA' && !entity.isDead) {
          entity.pos.x += entity.vel.x;
          for (const other of entities) {
            if (other.id !== entity.id && !other.isDead && ['GROUND', 'PIPE', 'BLOCK'].includes(other.type)) {
              if (checkCollision(entity, other)) {
                entity.vel.x *= -1;
                entity.pos.x += entity.vel.x;
                break;
              }
            }
          }

          if (checkCollision(player, entity)) {
            const overlapY = (player.pos.y + player.height) - entity.pos.y;
            if (player.vel.y > 0 && overlapY < 20) {
              entity.isDead = true;
              player.vel.y = -10; 
              setGameState(s => ({ ...s, score: s.score + 200 }));
            } else {
              setGameState(prev => ({ ...prev, status: 'GAMEOVER' }));
            }
          }
        }
      }

      if (player.pos.x < 0) player.pos.x = 0;
      if (player.pos.y > CANVAS_HEIGHT) {
        setGameState(prev => ({ ...prev, status: 'GAMEOVER' }));
      }

      const scrollThreshold = CANVAS_WIDTH / 2.5;
      if (player.pos.x > cameraRef.current.x + scrollThreshold) {
        cameraRef.current.x = player.pos.x - scrollThreshold;
      }
    };

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !playerRef.current) return;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawBackground(ctx, cameraRef.current);
      entitiesRef.current.forEach(e => drawEntity(ctx, e, cameraRef.current));
      
      drawEntity(ctx, playerRef.current, cameraRef.current);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState.status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-[800px] flex justify-between mb-2 text-sm uppercase">
        <div>PLAYER<br />{gameState.score.toString().padStart(6, '0')}</div>
        <div>COINS<br />x{gameState.coins.toString().padStart(2, '0')}</div>
        <div>WORLD<br />1-1</div>
        <div>TIME<br />{gameState.timer}</div>
      </div>

      <div className="relative border-4 border-white overflow-hidden shadow-2xl rounded-lg bg-[#5c94fc]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-transparent"
        />

        {gameState.status === 'MENU' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-4xl mb-8 text-pink-400 animate-pulse drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]">SUPER NEKO BROS</h1>
            <p className="mb-8 text-gray-300">ARROWS TO MOVE. SPACE TO JUMP.</p>
            <button
              onClick={startGame}
              className="bg-pink-600 hover:bg-pink-500 px-10 py-5 rounded-full text-xl transition-all transform hover:scale-110 active:scale-95 shadow-xl"
            >
              START ADVENTURE
            </button>
          </div>
        )}

        {(gameState.status === 'GAMEOVER' || gameState.status === 'WON') && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <h1 className="text-5xl mb-4 text-white drop-shadow-lg font-bold">{gameState.status === 'WON' ? 'COURSE CLEAR!' : 'GAME OVER'}</h1>
            <p className="text-2xl mb-8 text-yellow-400">FINAL SCORE: {gameState.score}</p>
            <button
              onClick={startGame}
              className="bg-white text-black px-8 py-4 text-xl rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
