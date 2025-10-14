// characters/Character.tsx
import { forwardRef, useRef, useState, useMemo, useEffect, useImperativeHandle } from "react";
import { useGLTF, useKeyboardControls, useAnimations } from "@react-three/drei";
import { RigidBody, RapierRigidBody, CapsuleCollider } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCameraAngles } from "../core/CameraContext";

const SPEED = 2;
const JUMP_FORCE = 3;

const Character = forwardRef<THREE.Group, { url: string; spawn?: [number, number, number] }>(
  ({ url, spawn = [0, 2, 0] }, ref) => {
    const { scene } = useGLTF(url);
    const idleGLTF = useGLTF("/animations/idle.glb");
    const walkGLTF = useGLTF("/animations/walk.glb");

    const group = useRef<THREE.Group>(null);
    const bodyRef = useRef<RapierRigidBody>(null);
    useImperativeHandle(ref, () => group.current as THREE.Group, []);
    const { yaw } = useCameraAngles();

    // animations
    const clips = useMemo(() => {
      const arr: THREE.AnimationClip[] = [];
      idleGLTF.animations.forEach((c) => { const clip = c.clone(); clip.name = "Idle"; arr.push(clip); });
      walkGLTF.animations.forEach((c) => { const clip = c.clone(); clip.name = "Walk"; arr.push(clip); });
      return arr;
    }, [idleGLTF, walkGLTF]);

    const { actions } = useAnimations(clips, group);
    const [anim, setAnim] = useState<"Idle" | "Walk">("Idle");

    const [, getKeys] = useKeyboardControls();

    useEffect(() => { actions["Idle"]?.play(); }, [actions]);

    useFrame((_, delta) => {
      if (!bodyRef.current) return;
      const linvel = bodyRef.current.linvel();
      const velocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);

      const keys = getKeys();
      const forward = keys.forward ? 1 : 0;
      const backward = keys.backward ? 1 : 0;
      const left = keys.left ? 1 : 0;
      const right = keys.right ? 1 : 0;
      const jump = keys.jump;

      // build camera-relative forward/right from yaw
     // Correct forward: camera yaw points -Z when yaw=0
// inside useFrame
// build camera-relative forward/right from yaw
const forwardDir = new THREE.Vector3(
  -Math.sin(yaw.current),
  0,
  -Math.cos(yaw.current)
);
const rightDir = new THREE.Vector3(-forwardDir.z, 0, forwardDir.x);

const moveDir = new THREE.Vector3();
moveDir.addScaledVector(forwardDir, forward - backward);
moveDir.addScaledVector(rightDir, right - left);


      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        bodyRef.current.setLinvel(
          { x: moveDir.x * SPEED, y: velocity.y, z: moveDir.z * SPEED },
          true
        );

        if (group.current) {
          const targetAngle = Math.atan2(moveDir.x, moveDir.z);
          group.current.rotation.y = THREE.MathUtils.lerp(
            group.current.rotation.y, targetAngle, delta * 10
          );
        }

        if (anim !== "Walk") {
          actions["Idle"]?.fadeOut(0.15);
          actions["Walk"]?.reset().fadeIn(0.15).play();
          setAnim("Walk");
        }
      } else {
        bodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
        if (anim !== "Idle") {
          actions["Walk"]?.fadeOut(0.15);
          actions["Idle"]?.reset().fadeIn(0.15).play();
          setAnim("Idle");
        }
      }

      // jump (simple grounded check = near zero Y velocity)
      if (jump && Math.abs(velocity.y) < 0.05) {
        bodyRef.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true);
      }

      if (group.current) {
        const pos = bodyRef.current.translation();
        group.current.position.set(pos.x, pos.y - 0.9, pos.z);
      }
    });

    return (
      <RigidBody
        ref={bodyRef}
        mass={1}
        position={spawn}
        enabledRotations={[false, false, false]}
        colliders={false}
      >
        <CapsuleCollider args={[0.9, 0.4]} />
        <group ref={group}>
          <primitive object={scene} scale={0.2} />
        </group>
      </RigidBody>
    );
  }
);

export default Character;
