
import { Entity, Vector } from '../types';

export const checkCollision = (a: Entity, b: Entity) => {
  return (
    a.pos.x < b.pos.x + b.width &&
    a.pos.x + a.width > b.pos.x &&
    a.pos.y < b.pos.y + b.height &&
    a.pos.y + a.height > b.pos.y
  );
};

export const getCollisionSide = (a: Entity, b: Entity) => {
  const dx = (a.pos.x + a.width / 2) - (b.pos.x + b.width / 2);
  const dy = (a.pos.y + a.height / 2) - (b.pos.y + b.height / 2);
  const width = (a.width + b.width) / 2;
  const height = (a.height + b.height) / 2;
  const crossWidth = width * dy;
  const crossHeight = height * dx;

  if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
    if (crossWidth > crossHeight) {
      return crossWidth > -crossHeight ? 'bottom' : 'left';
    } else {
      return crossWidth > -crossHeight ? 'right' : 'top';
    }
  }
  return null;
};
