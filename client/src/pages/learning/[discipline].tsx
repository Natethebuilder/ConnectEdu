// pages/learning/[discipline].tsx
import React, { useEffect, useRef, useState, Suspense, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Html, Float, Sky, Sparkles, useGLTF } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { fetchLearningHub } from "../../api/learningHub";
import type { LearningHub, LearningStage } from "../../types";
import { useSupabaseAuth } from "../../store/supabaseAuth";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";

// core + characters
import World from "../../core/World";
import Character from "../../characters/Character";
import { CameraOperator } from "../../core/CameraOperator";
import { CameraProvider } from "../../core/CameraContext"; // ✅ added
const API_BASE = import.meta.env.VITE_API_BASE;
const MotionGroup = motion("group");
const cleanGlbUrl = (url: string) => url.replace(/\.glb(\.glb)+$/, ".glb");

/* ============================= Island ============================= */
function FloatingIsland({
  onReady,
  position = [0, -5, 0],
}: { onReady: (scene: THREE.Object3D) => void; position?: [number, number, number]; }) {
  const { scene } = useGLTF("/models/island.glb") as any;

  useEffect(() => {
    onReady(scene);
  }, [scene, onReady]);

  return (
    <RigidBody type="fixed" colliders="trimesh" position={position}>
      <primitive object={scene} />
    </RigidBody>
  );
}

/* ========================= Stage Platform ========================= */
function StagePlatform({
  position,
  stage,
  onSelect,
}: {
  position: [number, number, number];
  stage: LearningStage;
  onSelect: (pos: [number, number, number]) => void;
}) {
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.18} floatIntensity={0.6}>
        <MotionGroup whileHover={{ scale: 1.08 }}>
          <mesh
            onClick={() => onSelect(position)}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "default")}
          >
            <cylinderGeometry args={[1.6, 1.6, 0.5, 48]} />
            <meshStandardMaterial
              color="#93c5fd"
              emissive="#60a5fa"
              emissiveIntensity={1.0}
              metalness={0.55}
              roughness={0.28}
            />
          </mesh>
        </MotionGroup>
      </Float>
      <Sparkles count={10} scale={2.6} size={2} speed={0.35} position={[0, 1, 0]} />
      <Html center>
        <div className="px-3 py-1.5 mt-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-lg text-white text-[12px] font-semibold whitespace-nowrap">
          {stage.title}
        </div>
      </Html>
    </group>
  );
}

/* ======================= Stage Auto-Placement ====================== */
function useStageSpots(island: THREE.Object3D | null, count: number): [number, number, number][] {
  return useMemo(() => {
    if (!island || count <= 0) return [];
    const ray = new THREE.Raycaster();
    const up = new THREE.Vector3(0, 1, 0);

    const hits: { p: THREE.Vector3; score: number }[] = [];
    const Rmin = 6;
    const Rmax = 24;
    const radialSteps = 18;
    const rings = 6;

    for (let r = 0; r < rings; r++) {
      const radius = THREE.MathUtils.lerp(Rmin, Rmax, r / (rings - 1));
      for (let i = 0; i < radialSteps; i++) {
        const angle = (i / radialSteps) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        ray.set(new THREE.Vector3(x, 100, z), new THREE.Vector3(0, -1, 0));
        const inter = ray.intersectObject(island, true);
        if (inter.length) {
          const hit = inter[0];
          const normal = hit.face?.normal
            ?.clone()
            .applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld))
            .normalize();
          const flat = normal ? normal.dot(up) : 1;
          const score = (flat + 1) * 0.5 + hit.point.y * 0.01;
          hits.push({ p: hit.point.clone().addScaledVector(up, 0.35), score });
        }
      }
    }

    hits.sort((a, b) => b.score - a.score);
    const out: THREE.Vector3[] = [];
    const minDist = 3.5;
    for (const h of hits) {
      if (out.length >= count) break;
      if (out.every((p) => p.distanceTo(h.p) >= minDist)) out.push(h.p);
    }
    return out.map((v) => [v.x, v.y, v.z] as [number, number, number]);
  }, [island, count]);
}

/* ============================== Main Page ============================== */
export default function LearningHubPage() {
  const { discipline } = useParams<{ discipline?: string }>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hub, setHub] = useState<LearningHub | null>(null);
  const [editing, setEditing] = useState(false);
  const [manualGlb, setManualGlb] = useState("");
  const [island, setIsland] = useState<THREE.Object3D | null>(null);
  const [spawn, setSpawn] = useState<[number, number, number] | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useSupabaseAuth();
  const avatarRef = useRef<THREE.Group>(null);

  /* Hide navbar when in hub */
  useEffect(() => {
    document.body.classList.add("hide-navbar");
    return () => document.body.classList.remove("hide-navbar");
  }, []);

  /* Load hub data */
  useEffect(() => {
    if (!discipline) return;
    fetchLearningHub(discipline).then(setHub).catch(console.error);
  }, [discipline]);

  /* Load saved avatar */
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/learning-profiles/${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.avatar_url) setAvatarUrl(cleanGlbUrl(data.avatar_url));
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    })();
  }, [user]);

  /* ReadyPlayerMe integration */
  useEffect(() => {
    if (!editing) return;

    const saveAvatarUrl = async (url?: string) => {
      const newUrl = cleanGlbUrl(url || "");
      if (!newUrl || !user?.id) return;
      const res = await fetch(`${API_BASE}/api/learning-profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, avatarUrl: newUrl }),
      });
      if (res.ok) {
        setAvatarUrl(newUrl);
        setEditing(false);
        setManualGlb("");
      } else {
        console.error("❌ Failed to save avatar", await res.text());
      }
    };

    const onMessage = (event: MessageEvent) => {
      if (!["https://readyplayer.me", "https://connectedu.readyplayer.me"].includes(event.origin))
        return;
      let payload: any;
      try {
        payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!payload || payload.source !== "readyplayerme") return;

      if (payload.eventName === "v1.frame.ready") {
        iframeRef.current?.contentWindow?.postMessage(
          { target: "readyplayerme", type: "subscribe", eventName: "v1.avatar.exported" },
          "*"
        );
      }

      if (payload.eventName === "v1.avatar.exported") {
        saveAvatarUrl(payload.data?.url);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [editing, user]);

  /* Manual save */
  const handleManualSave = () => {
    if (!manualGlb.trim() || !user?.id) return;
    const cleaned = cleanGlbUrl(manualGlb.trim());
    fetch(`${API_BASE}/api/learning-profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, avatarUrl: cleaned }),
    }).then((res) => {
      if (res.ok) {
        setAvatarUrl(cleaned);
        setEditing(false);
        setManualGlb("");
      }
    });
  };

  if (avatarUrl && !hub) {
    return <p className="text-white text-center mt-20">⚠️ Could not load learning hub data.</p>;
  }

  const stageSpots = useStageSpots(island, hub?.stages.length ?? 0);

  return (
    <section className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black">
      {(!avatarUrl || editing) && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400">
              {editing ? "Edit Your Avatar" : `Design Your ${discipline?.[0]?.toUpperCase()}${discipline?.slice(1)} Explorer`}
            </h1>
            <p className="text-white/70 mt-2 text-lg">Click “Next” in the top-right after finishing your avatar.</p>
          </div>
          <div className="w-[90vw] max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl bg-black/40">
            <iframe
              ref={iframeRef}
              src={`https://connectedu.readyplayer.me/avatar?frameApi&quickStart=true&bodyType=fullbody&avatarExport=true&t=${Date.now()}`}
              allow="camera *; microphone *; clipboard-write"
              className="w-full h-[720px] border-none"
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              value={manualGlb}
              onChange={(e) => setManualGlb(e.target.value)}
              placeholder="...or paste the .glb URL here"
              className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white w-96"
            />
            <button
              onClick={handleManualSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {avatarUrl && hub && !editing && (
          <motion.div className="absolute inset-0">
            <World>
              <color attach="background" args={["#0f172a"]} />
              <fog attach="fog" args={["#0f172a", 70, 220]} />
              <Sky sunPosition={[100, 30, 50]} />
              <ambientLight intensity={0.55} />
              <directionalLight position={[30, 60, 30]} intensity={1.4} castShadow />
              <hemisphereLight args={["#ffffff", "#2dd4bf", 0.35]} />

              <FloatingIsland
                onReady={(s) => {
                  setIsland(s);
                  const raycaster = new THREE.Raycaster();
                  raycaster.set(new THREE.Vector3(0, 100, 0), new THREE.Vector3(0, -1, 0));
                  const hits = raycaster.intersectObject(s, true);
                  if (hits.length > 0) {
                    const hit = hits[0].point;
                    setSpawn([hit.x, hit.y + 1, hit.z]);
                  } else {
                    setSpawn([0, 2, 0]);
                  }
                }}
              />

              {stageSpots.length === (hub.stages?.length ?? 0) &&
                hub.stages.map((stage, i) => (
                  <StagePlatform
                    key={stage.title}
                    stage={stage}
                    position={stageSpots[i]}
                    onSelect={(p) => console.log("Stage clicked", stage.title, p)}
                  />
                ))}

              {/* ✅ CameraProvider makes Character + CameraOperator share yaw/pitch */}
              <CameraProvider>
                <Suspense fallback={<Html center><p className="text-white">Loading avatar…</p></Html>}>
                  {spawn && (
                    <Character url={avatarUrl} ref={avatarRef} spawn={spawn} />
                  )}
                </Suspense>
                <CameraOperator targetRef={avatarRef} />
              </CameraProvider>
            </World>

            <button
              onClick={() => setEditing(true)}
              className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition"
            >
              ✏️ Edit Avatar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
