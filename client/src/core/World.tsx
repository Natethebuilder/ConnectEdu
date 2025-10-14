// core/World.tsx
import React, { PropsWithChildren } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Sky } from "@react-three/drei";
import { Physics } from "@react-three/rapier";

export default function World({ children }: PropsWithChildren) {
  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["w", "ArrowUp"] },
        { name: "backward", keys: ["s", "ArrowDown"] },
        { name: "left", keys: ["a", "ArrowLeft"] },
        { name: "right", keys: ["d", "ArrowRight"] },
        { name: "jump", keys: [" ", "Space"] },
      ]}
    >
      <Canvas shadows camera={{ fov: 55 }}>
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 70, 200]} />
        <Sky sunPosition={[100, 20, 50]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[30, 50, 30]} intensity={1.2} castShadow />
        
        {/* ✅ Use Rapier Physics */}
        <Physics gravity={[0, -9.81, 0]}>
          {children}
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
}
