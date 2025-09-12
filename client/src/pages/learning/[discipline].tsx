import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Float,
  Sky,
  Sparkles,
  ContactShadows,
  Html,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { fetchLearningHub } from "../../api/learningHub";
import type { LearningHub, LearningStage } from "../../types";
import { MeshProps } from "@react-three/fiber";




const MotionGroup = motion("group");
const MotionMesh = motion<MeshProps>("mesh");

function Avatar({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <MotionGroup initial={{ y: -10, opacity: 0 }} animate={{ y: -2.5, opacity: 1 }}>
      <primitive object={scene} scale={1.5} />
    </MotionGroup>
  );
}

useGLTF.preload("https://models.readyplayer.me/placeholder.glb");

function StagePlatform({
  position,
  stage,
  onSelect,
}: {
  position: [number, number, number];
  stage: LearningStage;
  onSelect: () => void;
}) {
  return (
    <group position={position}>
      <pointLight position={[0, 1, 0]} intensity={2.5} color="#60a5fa" distance={8} />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.6}>
        <MotionGroup
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          {/* ✅ onClick goes here on MotionMesh */}
          <MotionMesh onClick={onSelect} className="cursor-pointer">
            <cylinderGeometry args={[2, 2, 0.5, 64]} />
            <meshStandardMaterial
              color="#93c5fd"
              emissive="#60a5fa"
              emissiveIntensity={1.2}
              metalness={0.6}
              roughness={0.2}
            />
          </MotionMesh>
        </MotionGroup>
      </Float>

      <Sparkles count={20} scale={3} size={2} speed={0.3} position={[0, 1, 0]} />

      <Html center>
        <div className="px-4 py-2 mt-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-lg text-white text-sm font-semibold whitespace-nowrap">
          {stage.title}
        </div>
      </Html>
    </group>
  );
}



export default function LearningHubPage() {
  const { discipline } = useParams<{ discipline: string }>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hub, setHub] = useState<LearningHub | null>(null);
  const [selectedStage, setSelectedStage] = useState<LearningStage | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load LearningHub data
  useEffect(() => {
    if (!discipline) return;
    fetchLearningHub(discipline)
      .then(setHub)
      .catch((err) => console.error("Failed to load hub", err));
  }, [discipline]);

  // Avatar ReadyPlayerMe
  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== "https://readyplayer.me") return;
      if (event.data?.source === "readyplayerme" && event.data.eventName === "v1.avatar.exported") {
        const url = event.data.data.url;
        setAvatarUrl(url + ".glb");
      }
    };
    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, []);

  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({
        target: "readyplayerme",
        type: "subscribe",
        eventName: "v1.avatar.exported",
      }),
      "*"
    );
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black flex items-center justify-center px-6 sm:px-12 pt-32">
      {/* Step 1: Avatar creation screen */}
      {!avatarUrl && (
  <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black">
    {/* Overlay text */}
   <div className="absolute top-10 left-0 right-0 text-center z-10 px-6">
  <h1 className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 mb-4">
    Design Your {discipline && discipline[0].toUpperCase() + discipline.slice(1)} Explorer
  </h1>
  <p className="text-lg text-white/80 max-w-xl mx-auto">
    Create your personal avatar who will guide you to the top of the mountain — your journey starts here.
  </p>
</div>


    {/* Fullscreen iframe */}
    <div className="absolute inset-0 w-full h-full">
      <iframe
        ref={iframeRef}
        src="https://readyplayer.me/avatar?frameApi"
        allow="camera *; microphone *; clipboard-write"
        className="w-full h-full"
      />
    </div>
  </div>
)}


      {/* Step 2: 3D climb experience */}
      <AnimatePresence>
        {avatarUrl && hub && (
          <motion.div className="absolute inset-0">
            <Canvas camera={{ position: [0, 5, 14], fov: 45 }}>
              <color attach="background" args={["#0f172a"]} />
              <fog attach="fog" args={["#0f172a", 15, 45]} />
              <Sky sunPosition={[100, 20, 100]} />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 25, 10]} intensity={1.2} castShadow />
              <Environment preset="sunset" />

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
                <coneGeometry args={[10, 15, 64]} />
                <meshStandardMaterial color="#1e293b" roughness={1} />
              </mesh>

              {hub.stages.map((stage, i) => (
                <StagePlatform
                  key={stage.title}
                  position={[0, i * 3 - 2, 0]}
                  stage={stage}
                  onSelect={() => setSelectedStage(stage)}
                />
              ))}

              <Avatar url={avatarUrl} />
              <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} far={5} />
              <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Stage detail panel */}
      <AnimatePresence>
        {selectedStage && (
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 z-50 w-[420px] bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl p-6 overflow-y-auto"
          >
            <button
              onClick={() => setSelectedStage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedStage.title}</h2>
            <p className="text-gray-600 mb-6">{selectedStage.description}</p>

            <div className="space-y-4">
              {selectedStage.resources.map((r) => (
                <a
                  key={r.title}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-gray-200 shadow-sm hover:shadow transition"
                >
                  <div className="text-sm font-semibold text-gray-800">{r.title}</div>
                  {r.description && (
                    <div className="text-xs text-gray-600 mt-1">{r.description}</div>
                  )}
                </a>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </section>
  );
}
