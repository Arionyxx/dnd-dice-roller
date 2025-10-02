// Collision Detection System

export class CollisionSystem {
  constructor() {
    // Collision system doesn't need state
  }

  // Circle vs Circle collision
  circleCircle(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = obj1.radius + obj2.radius;

    return distance < minDistance;
  }

  // Circle vs Rectangle collision
  circleRect(circle, rect) {
    // Find the closest point on the rectangle to the circle
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate distance from circle center to closest point
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    return distanceSquared < (circle.radius * circle.radius);
  }

  // Rectangle vs Rectangle collision (AABB)
  rectRect(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  // Point vs Circle collision
  pointCircle(point, circle) {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distanceSquared = dx * dx + dy * dy;
    return distanceSquared < (circle.radius * circle.radius);
  }

  // Point vs Rectangle collision
  pointRect(point, rect) {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  // Line vs Circle collision (for shooting/raycasting)
  lineCircle(lineStart, lineEnd, circle) {
    // Vector from line start to circle center
    const dx = circle.x - lineStart.x;
    const dy = circle.y - lineStart.y;

    // Line direction vector
    const lineDx = lineEnd.x - lineStart.x;
    const lineDy = lineEnd.y - lineStart.y;

    // Length squared of line
    const lineLengthSquared = lineDx * lineDx + lineDy * lineDy;

    // Normalize and find closest point on line
    const t = Math.max(0, Math.min(1, (dx * lineDx + dy * lineDy) / lineLengthSquared));

    // Closest point on line segment
    const closestX = lineStart.x + t * lineDx;
    const closestY = lineStart.y + t * lineDy;

    // Distance from closest point to circle center
    const distX = circle.x - closestX;
    const distY = circle.y - closestY;
    const distanceSquared = distX * distX + distY * distY;

    return distanceSquared < (circle.radius * circle.radius);
  }

  // Sweep collision - predicts if moving circle will collide with static circle
  sweepCircleCircle(moving, static, velocityX, velocityY, dt) {
    // Calculate relative velocity
    const relVx = velocityX;
    const relVy = velocityY;

    // Vector between centers
    const dx = static.x - moving.x;
    const dy = static.y - moving.y;

    // Combined radius
    const combinedRadius = moving.radius + static.radius;

    // Quadratic equation coefficients for intersection
    const a = relVx * relVx + relVy * relVy;
    const b = -2 * (dx * relVx + dy * relVy);
    const c = dx * dx + dy * dy - combinedRadius * combinedRadius;

    // Solve quadratic
    const discriminant = b * b - 4 * a * c;

    // No collision if discriminant is negative
    if (discriminant < 0) return null;

    // Calculate time of collision
    const t = (-b - Math.sqrt(discriminant)) / (2 * a);

    // Collision only if within this frame
    if (t >= 0 && t <= dt) {
      return {
        time: t,
        point: {
          x: moving.x + relVx * t,
          y: moving.y + relVy * t
        }
      };
    }

    return null;
  }

  // Resolve circle collision with velocity
  resolveCircleCollision(obj1, obj2) {
    // Calculate collision normal
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Avoid division by zero

    // Normalize
    const nx = dx / distance;
    const ny = dy / distance;

    // Separate objects
    const overlap = (obj1.radius + obj2.radius) - distance;
    const separationX = nx * overlap * 0.5;
    const separationY = ny * overlap * 0.5;

    obj1.x -= separationX;
    obj1.y -= separationY;
    obj2.x += separationX;
    obj2.y += separationY;

    // If objects have velocity, apply collision response
    if (obj1.vx !== undefined && obj1.vy !== undefined &&
        obj2.vx !== undefined && obj2.vy !== undefined) {

      // Relative velocity
      const relVx = obj1.vx - obj2.vx;
      const relVy = obj1.vy - obj2.vy;

      // Velocity along collision normal
      const velAlongNormal = relVx * nx + relVy * ny;

      // Don't resolve if velocities are separating
      if (velAlongNormal > 0) return;

      // Restitution (bounciness) - 0.5 for moderate bounce
      const restitution = 0.5;

      // Calculate impulse scalar
      const impulse = -(1 + restitution) * velAlongNormal;

      // Apply impulse (assuming equal mass)
      obj1.vx += impulse * nx * 0.5;
      obj1.vy += impulse * ny * 0.5;
      obj2.vx -= impulse * nx * 0.5;
      obj2.vy -= impulse * ny * 0.5;
    }
  }

  // Check if circle is completely inside bounds
  circleInBounds(circle, bounds) {
    return (
      circle.x - circle.radius >= bounds.left &&
      circle.x + circle.radius <= bounds.right &&
      circle.y - circle.radius >= bounds.top &&
      circle.y + circle.radius <= bounds.bottom
    );
  }

  // Clamp circle to bounds
  clampCircleToBounds(circle, bounds) {
    circle.x = Math.max(bounds.left + circle.radius, Math.min(bounds.right - circle.radius, circle.x));
    circle.y = Math.max(bounds.top + circle.radius, Math.min(bounds.bottom - circle.radius, circle.y));
  }

  // Get push vector to separate circle from rectangle
  getPushVector(circle, rect) {
    // Find closest point on rectangle
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Vector from closest point to circle center
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      // Circle center is inside rectangle, push up
      return { x: 0, y: -(circle.radius + 1) };
    }

    // Push amount needed
    const pushDistance = circle.radius - distance;

    if (pushDistance > 0) {
      // Normalize and scale by push distance
      const nx = dx / distance;
      const ny = dy / distance;

      return {
        x: nx * pushDistance,
        y: ny * pushDistance
      };
    }

    return { x: 0, y: 0 };
  }
}
