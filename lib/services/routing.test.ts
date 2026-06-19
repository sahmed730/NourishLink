import { describe, it, expect } from 'vitest';
import { planOptimizedRoute } from './routing';

describe('Routing Service (NN + 2-opt)', () => {
  it('should return base stop when no pickups', () => {
    const base = { id: 'base', lat: 0, lng: 0, title: 'Base' };
    const result = planOptimizedRoute(base, []);
    expect(result.stops.length).toBe(2);
    expect(result.stops[0].id).toBe('base');
    expect(result.stops[1].id).toBe('base');
    expect(result.totalDistanceKm).toBe(0);
  });

  it('should return route to one pickup and back', () => {
    const base = { id: 'base', lat: 0, lng: 0, title: 'Base' };
    const p1 = { id: 'p1', lat: 1, lng: 1, title: 'Pickup 1' };
    const result = planOptimizedRoute(base, [p1]);
    expect(result.stops.length).toBe(3);
    expect(result.stops[0].id).toBe('base');
    expect(result.stops[1].id).toBe('p1');
    expect(result.stops[2].id).toBe('base');
    expect(result.totalDistanceKm).toBeGreaterThan(0);
  });

  it('should optimize route for multiple pickups', () => {
    const base = { id: 'base', lat: 40.7128, lng: -74.0060, title: 'Base NYC' };
    const p1 = { id: 'p1', lat: 40.7200, lng: -74.0100, title: 'P1' };
    const p2 = { id: 'p2', lat: 40.7300, lng: -74.0200, title: 'P2' };
    const p3 = { id: 'p3', lat: 40.7400, lng: -74.0300, title: 'P3' };
    
    // Nearest neighbor will go base -> p1 -> p2 -> p3 -> base
    const result = planOptimizedRoute(base, [p3, p1, p2]);
    
    expect(result.stops.length).toBe(5);
    expect(result.stops[0].id).toBe('base');
    expect(result.stops[4].id).toBe('base');
    // Ensure it visited all
    expect(result.stops.map(s => s.id)).toContain('p1');
    expect(result.stops.map(s => s.id)).toContain('p2');
    expect(result.stops.map(s => s.id)).toContain('p3');
  });
});
