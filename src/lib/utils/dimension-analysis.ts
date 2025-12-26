import { DIMENSION_LABELS, LIFE_DIMENSIONS, type LifeDimension } from "@/lib/validators/yearly-review";
import { STRONG_DIMENSION_THRESHOLD, WEAK_DIMENSION_THRESHOLD } from "@/lib/constants/review";

export interface DimensionInfo {
  key: LifeDimension;
  label: string;
  score: number;
}

export interface DimensionAnalysis {
  weakDimensions: DimensionInfo[];
  strongDimensions: DimensionInfo[];
  sortedDimensions: DimensionInfo[];
}

/**
 * Analyzes wheel ratings to identify weak and strong dimensions
 * 
 * @param ratings - Record of dimension keys to scores (1-10)
 * @returns Analysis object with weak, strong, and sorted dimensions
 */
export function analyzeDimensions(ratings: Record<string, number>): DimensionAnalysis {
  const dimensions = Object.entries(ratings) as [LifeDimension, number][];
  const sortedDimensions = dimensions
    .sort((a, b) => a[1] - b[1])
    .map(([dim, score]) => ({
      key: dim,
      label: DIMENSION_LABELS[dim],
      score,
    }));

  const weakDimensions = sortedDimensions
    .filter(({ score }) => score < WEAK_DIMENSION_THRESHOLD)
    .slice(0, 2);

  const strongDimensions = sortedDimensions
    .filter(({ score }) => score >= STRONG_DIMENSION_THRESHOLD)
    .slice(-2);

  return {
    weakDimensions,
    strongDimensions,
    sortedDimensions,
  };
}

/**
 * Converts dimension ratings to the format expected by WheelOfLife component
 * 
 * Maps dimension keys (e.g., "health") to display labels (e.g., "Health & Energy")
 * 
 * @param ratings - Record of dimension keys to scores
 * @returns Record of dimension labels to scores
 */
export function convertRatingsToWheelFormat(
  ratings: Record<string, number>
): Record<string, number> {
  const wheelValues: Record<string, number> = {};
  
  LIFE_DIMENSIONS.forEach((dim) => {
    wheelValues[DIMENSION_LABELS[dim]] = ratings[dim] || 5;
  });

  return wheelValues;
}

