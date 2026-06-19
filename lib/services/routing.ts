import { haversineKm } from '../geo';

export interface RouteStop {
  id: string; // "base" or matchId
  lat: number;
  lng: number;
  title: string;
}

export interface RoutePlan {
  stops: RouteStop[];
  totalDistanceKm: number;
  totalDurationMin: number; // simplistic assumption: 30km/h + 10 mins per pickup
}

function calculateTotalDistance(stops: RouteStop[]): number {
  let dist = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    dist += haversineKm(stops[i].lat, stops[i].lng, stops[i + 1].lat, stops[i + 1].lng);
  }
  return dist;
}

// 2-opt Swap function
function twoOptSwap(route: RouteStop[], i: number, k: number): RouteStop[] {
  const newRoute = [...route.slice(0, i), ...route.slice(i, k + 1).reverse(), ...route.slice(k + 1)];
  return newRoute;
}

export function planOptimizedRoute(baseStop: RouteStop, pickups: RouteStop[]): RoutePlan {
  if (pickups.length === 0) {
    return { stops: [baseStop, baseStop], totalDistanceKm: 0, totalDurationMin: 0 };
  }

  // 1. Nearest Neighbor Initialization
  let unvisited = [...pickups];
  let current = baseStop;
  let initialRoute: RouteStop[] = [baseStop];

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = haversineKm(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
      if (d < minDistance) {
        minDistance = d;
        nearestIdx = i;
      }
    }

    current = unvisited[nearestIdx];
    initialRoute.push(current);
    unvisited.splice(nearestIdx, 1);
  }
  
  // Return to base
  initialRoute.push(baseStop);

  // 2. 2-opt refinement
  let improved = true;
  let bestRoute = [...initialRoute];
  let bestDistance = calculateTotalDistance(bestRoute);

  while (improved) {
    improved = false;
    // Don't swap first and last stops (base)
    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let k = i + 1; k < bestRoute.length - 1; k++) {
        const newRoute = twoOptSwap(bestRoute, i, k);
        const newDistance = calculateTotalDistance(newRoute);
        if (newDistance < bestDistance) {
          bestDistance = newDistance;
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }

  const durationMin = (bestDistance / 30) * 60 + (pickups.length * 10);

  return {
    stops: bestRoute,
    totalDistanceKm: Number(bestDistance.toFixed(2)),
    totalDurationMin: Math.round(durationMin)
  };
}
