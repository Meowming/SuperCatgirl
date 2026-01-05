
import { Entity, Camera } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../constants';

export const drawBackground = (ctx: CanvasRenderingContext2D, camera: Camera) => {
  // Sky
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};

const drawCatgirl = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  // Simple catgirl drawing using shapes
  const headSize = width * 0.7;
  const bodyWidth = width * 0.8;
  const bodyHeight = height * 0.5;

  // 1. Legs/Feet
  ctx.fillStyle = '#333'; // Dark shoes
  ctx.fillRect(width * 0.2, height - 8, width * 0.25, 8);
  ctx.fillRect(width * 0.55, height - 8, width * 0.25, 8);

  // 2. Body (Cyan Outfit)
  ctx.fillStyle = '#00ffff'; // Cyan
  ctx.fillRect((width - bodyWidth) / 2, height - bodyHeight - 4, bodyWidth, bodyHeight);
  
  // 3. Head (Skin)
  ctx.fillStyle = '#ffe0bd'; // Skin tone
  const headY = height - bodyHeight - headSize;
  ctx.fillRect((width - headSize) / 2, headY, headSize, headSize);

  // 4. Hair (Pink)
  ctx.fillStyle = '#ff69b4'; // Pink hair
  // Top hair
  ctx.fillRect((width - headSize) / 2 - 2, headY - 2, headSize + 4, headSize * 0.4);
  // Side hair (bangs)
  ctx.fillRect((width - headSize) / 2 - 2, headY, 4, headSize);
  ctx.fillRect((width + headSize) / 2 - 2, headY, 4, headSize);
  
  // 5. Ears (Pink Triangles)
  ctx.beginPath();
  ctx.moveTo((width - headSize) / 2, headY);
  ctx.lineTo((width - headSize) / 2 + 8, headY - 12);
  ctx.lineTo((width - headSize) / 2 + 16, headY);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo((width + headSize) / 2 - 16, headY);
  ctx.lineTo((width + headSize) / 2 - 8, headY - 12);
  ctx.lineTo((width + headSize) / 2, headY);
  ctx.fill();

  // 6. Eyes (Looking right)
  ctx.fillStyle = '#000';
  ctx.fillRect((width + headSize) / 2 - 8, headY + headSize * 0.4, 3, 3);
  ctx.fillRect((width + headSize) / 2 - 16, headY + headSize * 0.4, 3, 3);

  // 7. Small Tail
  ctx.strokeStyle = '#ff69b4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo((width - bodyWidth) / 2, height - 12);
  ctx.quadraticCurveTo((width - bodyWidth) / 2 - 10, height - 20, (width - bodyWidth) / 2 - 5, height - 25);
  ctx.stroke();
};

export const drawEntity = (
  ctx: CanvasRenderingContext2D, 
  entity: Entity, 
  camera: Camera, 
  assets?: { playerImage?: HTMLImageElement | null }
) => {
  const drawX = entity.pos.x - camera.x;
  const drawY = entity.pos.y - camera.y;

  // Don't draw if off-screen
  if (drawX + entity.width < 0 || drawX > CANVAS_WIDTH) return;

  switch (entity.type) {
    case 'PLAYER':
      ctx.save();
      const isFlipped = entity.vel.x < -0.1 || (entity.data?.facing === 'left' && Math.abs(entity.vel.x) < 0.1);
      if (isFlipped) {
        ctx.translate(drawX + entity.width, drawY);
        ctx.scale(-1, 1);
        drawCatgirl(ctx, entity.width, entity.height);
      } else {
        ctx.translate(drawX, drawY);
        drawCatgirl(ctx, entity.width, entity.height);
      }
      ctx.restore();
      break;

    case 'GOOMBA':
      if (entity.isDead) {
        ctx.fillStyle = '#6b3e2e';
        ctx.fillRect(drawX, drawY + entity.height / 2, entity.width, entity.height / 2);
      } else {
        ctx.fillStyle = '#6b3e2e';
        ctx.beginPath();
        ctx.arc(drawX + entity.width / 2, drawY + entity.height / 2, entity.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(drawX + 8, drawY + 8, 4, 4);
        ctx.fillRect(drawX + 20, drawY + 8, 4, 4);
      }
      break;

    case 'GROUND':
      ctx.fillStyle = '#9b4a1b';
      ctx.fillRect(drawX, drawY, entity.width, entity.height);
      ctx.strokeStyle = '#6b3e2e';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, entity.width, entity.height);
      break;

    case 'BLOCK':
      ctx.fillStyle = '#ff9b4a';
      ctx.fillRect(drawX, drawY, entity.width, entity.height);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(drawX, drawY, entity.width, entity.height);
      break;

    case 'QUESTION':
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(drawX, drawY, entity.width, entity.height);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('?', drawX + entity.width / 2, drawY + 24);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(drawX, drawY, entity.width, entity.height);
      break;

    case 'PIPE':
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(drawX, drawY, entity.width, entity.height);
      ctx.strokeStyle = '#004400';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, drawY, entity.width, entity.height);
      if (entity.data?.isTop) {
        ctx.fillStyle = '#00aa00';
        ctx.fillRect(drawX - 4, drawY, entity.width + 8, 12);
        ctx.strokeRect(drawX - 4, drawY, entity.width + 8, 12);
      }
      break;

    case 'FLAG':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(drawX + 12, drawY, 8, entity.height);
      ctx.fillStyle = '#00aa00';
      ctx.beginPath();
      ctx.moveTo(drawX + 12, drawY);
      ctx.lineTo(drawX - 20, drawY + 20);
      ctx.lineTo(drawX + 12, drawY + 40);
      ctx.fill();
      break;
  }
};
