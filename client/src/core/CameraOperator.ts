// core/CameraOperator.tsx
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCameraAngles } from "./CameraContext";

export function CameraOperator({ targetRef }: { targetRef: React.RefObject<THREE.Group> }) {
  const { camera, gl } = useThree();
  const { yaw, pitch } = useCameraAngles();

  const currentPos = useRef(new THREE.Vector3());
  const desiredPos = useRef(new THREE.Vector3());
  const targetWorld = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  const sensitivity = 0.002;
  const distance = 4;     // fixed trailing distance
  const height = 0;     // eye level above target
  const stiffness = 12;   // spring toward desired (higher = snappier)
  const damping = 2;    // damping factor (0..1), higher = less overshoot

  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = () => {
      canvas.requestPointerLock();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      yaw.current -= e.movementX * sensitivity;
      pitch.current -= e.movementY * sensitivity;
      // clamp pitch to avoid flip
      const limit = Math.PI / 3;
      pitch.current = Math.max(-limit, Math.min(limit, pitch.current));
    };

    canvas.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gl, yaw, pitch]);

  useFrame((_, dt) => {
    if (!targetRef.current) return;

    // get true world position of the avatar root
    targetRef.current.getWorldPosition(targetWorld.current);

    // spherical offset from yaw/pitch (keep fixed distance)
    const offX = Math.sin(yaw.current) * Math.cos(pitch.current) * distance;
    const offY = Math.sin(pitch.current) * distance + height;
    const offZ = Math.cos(yaw.current) * Math.cos(pitch.current) * distance;

    desiredPos.current.set(
      targetWorld.current.x + offX,
      targetWorld.current.y + offY,
      targetWorld.current.z + offZ
    );

    // initialize to avoid initial long lerp
    if (!initialized.current) {
      currentPos.current.copy(desiredPos.current);
      initialized.current = true;
    }

    // critically-damped spring toward desired
    const t = Math.min(dt, 1 / 30); // prevent large dt spikes
    const toTarget = desiredPos.current.clone().sub(currentPos.current).multiplyScalar(stiffness * t);
    currentPos.current.add(toTarget.multiplyScalar(1 - (1 - damping) * t));

    camera.position.copy(currentPos.current);
    // look slightly above root (head)
    camera.lookAt(
      targetWorld.current.x,
      targetWorld.current.y,
      targetWorld.current.z
    );
  });

  return null;
}
