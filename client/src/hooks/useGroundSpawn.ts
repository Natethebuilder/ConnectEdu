// hooks/useGroundSpawn.ts
import { useMemo } from "react";
import * as THREE from "three";

export function useGroundSpawn(
  island: THREE.Object3D | null,
  fallback: [number, number, number] = [0, 5, 0]
): [number, number, number] {
  return useMemo(() => {
    if (!island) return fallback;

    const ray = new THREE.Raycaster();
    const start = new THREE.Vector3(0, 100, 0);
    ray.set(start, new THREE.Vector3(0, -1, 0));

    const intersects = ray.intersectObject(island, true);
    if (intersects.length > 0) {
      const hit = intersects[0];
      return [hit.point.x, hit.point.y + 1.1, hit.point.z]; // small offset so capsule doesn’t clip
    }

    return fallback;
  }, [island, fallback]);
}
