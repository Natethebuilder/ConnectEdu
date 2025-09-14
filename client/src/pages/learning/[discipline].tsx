import React, { useEffect, useRef, useState, Suspense } from "react";
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
import { supabase } from "../../lib/supabase";
import { useSupabaseAuth } from "../../store/supabaseAuth";
import type { MeshProps } from "@react-three/fiber";

const RPM_ORIGINS = [
  "https://readyplayer.me",
  "https://connectedu.readyplayer.me",
];

const MotionGroup = motion("group");
const MotionMesh = motion<MeshProps>("mesh");

// Clean any accidental double .glb
const cleanGlbUrl = (url: string) => url.replace(/\.glb(\.glb)+$/, ".glb");

function Avatar({ url }: { url: string }) {
  const safeUrl = cleanGlbUrl(url);
  const { scene } = useGLTF(safeUrl);
  return (
    <MotionGroup initial={{ y: -10, opacity: 0 }} animate={{ y: -2.5, opacity: 1 }}>
      <primitive object={scene} scale={1.5} />
    </MotionGroup>
  );
}

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
        <MotionGroup initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.05 }}>
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
  const { discipline } = useParams<{ discipline?: string }>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hub, setHub] = useState<LearningHub | null>(null);
  const [selectedStage, setSelectedStage] = useState<LearningStage | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useSupabaseAuth();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const prettyDiscipline = discipline ? discipline.charAt(0).toUpperCase() + discipline.slice(1) : "";

  useEffect(() => {
    document.body.classList.add("hide-navbar");
    return () => document.body.classList.remove("hide-navbar");
  }, []);

  useEffect(() => {
    if (!discipline) return;
    fetchLearningHub(discipline).then(setHub).catch(console.error);
  }, [discipline]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("learning_profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(cleanGlbUrl(data.avatar_url));
      });
  }, [user]);

  const postToRPM = (msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  const subscribeExport = () => {
    postToRPM({
      target: "readyplayerme",
      type: "subscribe",
      eventName: "v1.avatar.exported",
    });
    console.log("[RPM] Subscribed to v1.avatar.exported");
  };

  useEffect(() => {
    subscribeExport();
    const onLoad = () => {
      console.log("[RPM] iframe loaded");
      subscribeExport();
    };
    iframeRef.current?.addEventListener("load", onLoad);

    const onMessage = async (event: MessageEvent) => {
      if (!RPM_ORIGINS.includes(event.origin)) return;

      const data = typeof event.data === "string" ? (() => { try { return JSON.parse(event.data); } catch { return null; } })() : event.data;
      if (!data || data?.source !== "readyplayerme") return;

      console.log("[RPM EVENT]", data.eventName, data);

      if (data.eventName === "v1.frame.ready") {
        subscribeExport();
        return;
      }

      if (data.eventName === "v1.avatar.exported") {
        let url: string = data.data?.url || "";
        if (!url || !user?.id) return;

        url = cleanGlbUrl(url);

        setSaving(true);
        console.log("[RPM] Exported URL:", url);

        const { error } = await supabase.from("learning_profiles").upsert({
          user_id: user.id,
          avatar_url: url,
          discipline,
        });

        if (error) {
          console.error("Supabase upsert error:", error);
        } else {
          console.log("✅ Avatar saved to Supabase");
          setAvatarUrl(url);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
        setSaving(false);
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      iframeRef.current?.removeEventListener("load", onLoad);
    };
  }, [user, discipline]);

  const handleExport = () => {
    postToRPM({ target: "readyplayerme", type: "export" });
    console.log("[RPM] Export requested");
  };

  const handleUseManual = async () => {
    if (!manualUrl.trim() || !user) return;
    const cleaned = cleanGlbUrl(manualUrl.trim());
    setSaving(true);
    const { error } = await supabase.from("learning_profiles").upsert({
      user_id: user.id,
      avatar_url: cleaned,
      discipline,
    });
    if (!error) {
      setAvatarUrl(cleaned);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (avatarUrl && !hub) {
    return <p className="text-white text-center mt-20">⚠️ Could not load learning hub data.</p>;
  }

  return (
    <section className="fixed inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black flex items-center justify-center">
      {!avatarUrl && (
        <div className="flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400">
              Design Your {prettyDiscipline} Explorer
            </h1>
            <p className="text-white/70 mt-3 text-lg">
              Click “Next” or use Save & Continue — I’ll save your avatar automatically.
            </p>
          </div>

          <div className="w-[90vw] max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl bg-black/40">
            <iframe
              ref={iframeRef}
              src="https://connectedu.readyplayer.me/avatar?frameApi&quickStart=true&bodyType=fullbody"
              allow="camera *; microphone *; clipboard-write"
              className="w-full h-[720px] border-none"
            />
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleExport}
              disabled={saving}
              className={`px-6 py-3 rounded-xl text-white font-bold shadow-lg transition ${
                saving ? "bg-gray-500 cursor-wait" : "bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105"
              }`}
            >
              {saving ? "Saving…" : saved ? "✅ Saved!" : "💾 Save & Continue"}
            </button>

            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
              <input
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="…or paste the .glb URL here"
                className="bg-transparent outline-none text-white placeholder-white/50 w-80"
              />
              <button
                onClick={handleUseManual}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm font-semibold"
              >
                Use URL
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {avatarUrl && hub && (
          <motion.div className="absolute inset-0">
            <Canvas camera={{ position: [0, 5, 14], fov: 45 }}>
              <color attach="background" args={["#0f172a"]} />
              <fog attach="fog" args={["#0f172a", 15, 45]} />
              <Sky sunPosition={[100, 20, 100]} />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 25, 10]} intensity={1.2} castShadow />
              

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

              <Suspense fallback={<Html center><p className="text-white">Loading avatar…</p></Html>}>
                <Avatar url={avatarUrl} />
              </Suspense>

              <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={20} blur={2.5} far={5} />
              <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
