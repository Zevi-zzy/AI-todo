/**
 * Level Calculation Logic
 * 
 * Formula:
 * Level 1: 0 - 9 points (Need 10)
 * Level 2: 10 - 24 points (Need 15)
 * Level 3: 25 - 44 points (Need 20)
 * Level 4: 45 - 69 points (Need 25)
 * ...
 * 
 * Base requirement for Level 1 -> 2 is 10.
 * Increment per level is 5.
 * 
 * Points required to reach Level L from Level L-1:
 * Required(L) = 10 + (L-2) * 5, for L >= 2.
 * 
 * Total points for Level L:
 * Total(L) = Sum(Required(i) for i=2 to L)
 * 
 * Or simply iterative check.
 */

export const BASE_XP = 10;
export const XP_INCREMENT = 5;

// Get the minimum total points required to reach a target level.
export function getMinimumPointsForLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 0;

  let totalPoints = 0;
  let pointsForNext = BASE_XP;

  for (let level = 1; level < targetLevel; level++) {
    totalPoints += pointsForNext;
    pointsForNext += XP_INCREMENT;
  }

  return totalPoints;
}

// Calculate level based on total points
export function calculateLevel(points: number): number {
  let level = 1;
  let pointsForNext = BASE_XP;
  let currentPoints = points;

  while (currentPoints >= pointsForNext) {
    currentPoints -= pointsForNext;
    level++;
    pointsForNext += XP_INCREMENT;
  }
  
  return level;
}

// Get required points for next level from current total points
export function getNextLevelThreshold(level: number): number {
  // Points needed to go from current Level to Level+1
  return BASE_XP + (level - 1) * XP_INCREMENT;
}

// Get progress to next level
// Returns { currentLevelPoints, pointsNeededForNextLevel }
export function getLevelProgress(totalPoints: number) {
  let level = 1;
  let pointsForNext = BASE_XP;
  let currentPoints = totalPoints;

  while (currentPoints >= pointsForNext) {
    currentPoints -= pointsForNext;
    level++;
    pointsForNext += XP_INCREMENT;
  }

  return {
    level,
    currentLevelPoints: currentPoints,
    pointsNeededForNextLevel: pointsForNext,
    progressPercent: Math.min(100, (currentPoints / pointsForNext) * 100)
  };
}
