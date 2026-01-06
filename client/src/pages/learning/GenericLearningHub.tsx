import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import http from "../../api/http";
import { saveQuizScore, saveReflection } from "../../hooks/useLearningProgress";

// Discipline-specific configurations
const DISCIPLINE_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  gradient: { from: string; to: string };
  accent: string;
  quote: string;
  description: string;
  BackgroundComponent: React.FC;
}> = {
  biology: {
    icon: () => <span className="text-2xl">🌱</span>,
    bgColor: "#0a1f0f",
    gradient: { from: "#10b981", to: "#34d399" },
    accent: "emerald",
    quote: "Life finds a way",
    description: "Explore the wonders of life sciences with hands-on learning and curated resources.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#0a1f0f"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#10b981" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <sphereGeometry args={[1.6, 64, 64]} />
              <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <Float speed={2.4} rotationIntensity={2}>
            <mesh position={[2.2, -1.3, 0]}>
              <sphereGeometry args={[0.9, 32, 32]} />
              <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.4} transparent opacity={0.22} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(16,185,129,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(52,211,153,.18),transparent)]" />
      </div>
    ),
  },
  "computer-science": {
    icon: () => <span className="text-2xl">💻</span>,
    bgColor: "#0a0e27",
    gradient: { from: "#6366f1", to: "#8b5cf6" },
    accent: "indigo",
    quote: "Code the future",
    description: "Master algorithms, systems, and innovation with interactive learning paths.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={["#0a0e27"]} />
          <Suspense fallback={null}>
            <Stars radius={80} depth={50} count={5000} factor={2} saturation={0} fade speed={0.8} />
          </Suspense>
          <ambientLight intensity={0.15} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#6366f1" />
          <pointLight position={[-6, -2, -4]} intensity={0.7} color="#8b5cf6" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(99,102,241,.25),transparent),radial-gradient(50%_50%_at_90%_80%,rgba(139,92,246,.22),transparent)]" />
      </div>
    ),
  },
  mathematics: {
    icon: () => <span className="text-2xl">📐</span>,
    bgColor: "#1a1a2e",
    gradient: { from: "#64748b", to: "#475569" },
    accent: "slate",
    quote: "Mathematics is the language of the universe",
    description: "Unlock the beauty of numbers, patterns, and proofs through structured learning.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={["#1a1a2e"]} />
          <Suspense fallback={null}>
            <Stars radius={80} depth={50} count={4000} factor={2} saturation={0} fade speed={0.8} />
          </Suspense>
          <ambientLight intensity={0.15} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#64748b" />
          <pointLight position={[-6, -2, -4]} intensity={0.7} color="#475569" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(100,116,139,.25),transparent),radial-gradient(50%_50%_at_90%_80%,rgba(71,85,105,.22),transparent)]" />
      </div>
    ),
  },
  "data-science": {
    icon: () => <span className="text-2xl">📊</span>,
    bgColor: "#0a1628",
    gradient: { from: "#06b6d4", to: "#3b82f6" },
    accent: "cyan",
    quote: "Data is the new oil",
    description: "Transform data into insights with machine learning and analytics expertise.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={["#0a1628"]} />
          <Suspense fallback={null}>
            <Stars radius={80} depth={50} count={5000} factor={2} saturation={0} fade speed={0.8} />
          </Suspense>
          <ambientLight intensity={0.15} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#06b6d4" />
          <pointLight position={[-6, -2, -4]} intensity={0.7} color="#3b82f6" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(6,182,212,.25),transparent),radial-gradient(50%_50%_at_90%_80%,rgba(59,130,246,.22),transparent)]" />
      </div>
    ),
  },
  "economics-business": {
    icon: () => <span className="text-2xl">💼</span>,
    bgColor: "#1a1208",
    gradient: { from: "#eab308", to: "#f59e0b" },
    accent: "yellow",
    quote: "Build the future of business",
    description: "Master economics, strategy, and entrepreneurship with real-world applications.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#1a1208"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#eab308" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(234,179,8,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(245,158,11,.18),transparent)]" />
      </div>
    ),
  },
  psychology: {
    icon: () => <span className="text-2xl">🧠</span>,
    bgColor: "#1f0a1f",
    gradient: { from: "#ec4899", to: "#f472b6" },
    accent: "pink",
    quote: "Understand the mind",
    description: "Explore human behavior, cognition, and mental processes through research and practice.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#1f0a1f"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#ec4899" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <octahedronGeometry args={[1.6, 0]} />
              <meshStandardMaterial color="#ec4899" emissive="#be185d" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(236,72,153,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(244,114,182,.18),transparent)]" />
      </div>
    ),
  },
  education: {
    icon: () => <span className="text-2xl">🎓</span>,
    bgColor: "#1a0a1f",
    gradient: { from: "#a855f7", to: "#c084fc" },
    accent: "purple",
    quote: "Empower the next generation",
    description: "Develop teaching excellence and educational leadership through practical experience.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#1a0a1f"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#a855f7" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <torusGeometry args={[1.2, 0.4, 16, 100]} />
              <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(168,85,247,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(192,132,252,.18),transparent)]" />
      </div>
    ),
  },
  "law-political-science": {
    icon: () => <span className="text-2xl">⚖️</span>,
    bgColor: "#1a1a1a",
    gradient: { from: "#6b7280", to: "#4b5563" },
    accent: "gray",
    quote: "Justice and democracy",
    description: "Master legal reasoning, policy analysis, and political systems through rigorous study.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={["#1a1a1a"]} />
          <Suspense fallback={null}>
            <Stars radius={80} depth={50} count={3000} factor={2} saturation={0} fade speed={0.8} />
          </Suspense>
          <ambientLight intensity={0.15} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#6b7280" />
          <pointLight position={[-6, -2, -4]} intensity={0.7} color="#4b5563" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(107,114,128,.25),transparent),radial-gradient(50%_50%_at_90%_80%,rgba(75,85,99,.22),transparent)]" />
      </div>
    ),
  },
  "art-design": {
    icon: () => <span className="text-2xl">🎨</span>,
    bgColor: "#1a0a2e",
    gradient: { from: "#a855f7", to: "#ec4899" },
    accent: "violet",
    quote: "Create without limits",
    description: "Develop your artistic vision and design skills through portfolio building and critique.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#1a0a2e"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#a855f7" intensity={0.8} />
          <pointLight position={[-5, -5, 5]} color="#ec4899" intensity={0.7} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <dodecahedronGeometry args={[1.4, 0]} />
              <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(168,85,247,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(236,72,153,.18),transparent)]" />
      </div>
    ),
  },
  "communications-media": {
    icon: () => <span className="text-2xl">📢</span>,
    bgColor: "#0a1f1a",
    gradient: { from: "#14b8a6", to: "#10b981" },
    accent: "teal",
    quote: "Tell your story",
    description: "Master journalism, media production, and communication through hands-on projects.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#0a1f1a"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#14b8a6" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <coneGeometry args={[1.2, 2, 8]} />
              <meshStandardMaterial color="#14b8a6" emissive="#0d9488" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(20,184,166,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(16,185,129,.18),transparent)]" />
      </div>
    ),
  },
  "environmental-science": {
    icon: () => <span className="text-2xl">🌍</span>,
    bgColor: "#0a1f0f",
    gradient: { from: "#22c55e", to: "#16a34a" },
    accent: "green",
    quote: "Protect our planet",
    description: "Explore sustainability, conservation, and climate science through research and action.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#0a1f0f"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#22c55e" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <icosahedronGeometry args={[1.6, 0]} />
              <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(34,197,94,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(22,163,74,.18),transparent)]" />
      </div>
    ),
  },
  architecture: {
    icon: () => <span className="text-2xl">🏛️</span>,
    bgColor: "#1a1815",
    gradient: { from: "#78716c", to: "#57534e" },
    accent: "stone",
    quote: "Design the future",
    description: "Master architectural design, urban planning, and sustainable building through portfolio development.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#1a1815"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#78716c" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <boxGeometry args={[1.5, 2, 1.5]} />
              <meshStandardMaterial color="#78716c" emissive="#57534e" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(120,113,108,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(87,83,78,.18),transparent)]" />
      </div>
    ),
  },
  "medicine-healthcare": {
    icon: () => <span className="text-2xl">⚕️</span>,
    bgColor: "#1f0a0a",
    gradient: { from: "#ef4444", to: "#f87171" },
    accent: "red",
    quote: "Heal and serve",
    description: "Prepare for medical school and healthcare careers through rigorous academics and clinical experience.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#1f0a0a"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#ef4444" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <octahedronGeometry args={[1.6, 0]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(239,68,68,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(248,113,113,.18),transparent)]" />
      </div>
    ),
  },
  "history-literature": {
    icon: () => <span className="text-2xl">📚</span>,
    bgColor: "#0f0a1f",
    gradient: { from: "#6366f1", to: "#818cf8" },
    accent: "indigo",
    quote: "Learn from the past, write the future",
    description: "Explore historical narratives and literary analysis through research and critical thinking.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={["#0f0a1f"]} />
          <Suspense fallback={null}>
            <Stars radius={80} depth={50} count={4000} factor={2} saturation={0} fade speed={0.8} />
          </Suspense>
          <ambientLight intensity={0.15} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#6366f1" />
          <pointLight position={[-6, -2, -4]} intensity={0.7} color="#818cf8" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(99,102,241,.25),transparent),radial-gradient(50%_50%_at_90%_80%,rgba(129,140,248,.22),transparent)]" />
      </div>
    ),
  },
  "mechanical-engineering": {
    icon: () => <span className="text-2xl">⚙️</span>,
    bgColor: "#1a1208",
    gradient: { from: "#f59e0b", to: "#d97706" },
    accent: "amber",
    quote: "Build the machines of tomorrow",
    description: "Master mechanical systems, design, and manufacturing through hands-on projects.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#1a1208"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#f59e0b" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <torusGeometry args={[1.2, 0.3, 16, 100]} />
              <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(245,158,11,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(217,119,6,.18),transparent)]" />
      </div>
    ),
  },
  "electrical-engineering": {
    icon: () => <span className="text-2xl">⚡</span>,
    bgColor: "#1a0a1f",
    gradient: { from: "#fbbf24", to: "#f59e0b" },
    accent: "yellow",
    quote: "Power the future",
    description: "Master circuits, electronics, and power systems through theory and practice.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#1a0a1f"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#fbbf24" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <octahedronGeometry args={[1.6, 0]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(251,191,36,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(245,158,11,.18),transparent)]" />
      </div>
    ),
  },
  "civil-engineering": {
    icon: () => <span className="text-2xl">🏗️</span>,
    bgColor: "#0a1a0f",
    gradient: { from: "#84cc16", to: "#65a30d" },
    accent: "lime",
    quote: "Build the infrastructure of tomorrow",
    description: "Master structural design, construction, and infrastructure through engineering projects.",
    BackgroundComponent: () => (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#0a1a0f"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#84cc16" intensity={0.8} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <boxGeometry args={[1.5, 2, 1.5]} />
              <meshStandardMaterial color="#84cc16" emissive="#65a30d" emissiveIntensity={0.35} transparent opacity={0.28} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(132,204,22,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(101,163,13,.18),transparent)]" />
      </div>
    ),
  },
};

// Default fallback config
const DEFAULT_CONFIG = {
  icon: () => <span className="text-2xl">📖</span>,
  bgColor: "#0b1026",
  gradient: { from: "#6366f1", to: "#8b5cf6" },
  accent: "indigo",
  quote: "Your learning journey",
  description: "A guided path to mastery with curated resources and progress tracking.",
  BackgroundComponent: () => (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={["#0b1026"]} />
        <Suspense fallback={null}>
          <Stars radius={80} depth={50} count={5000} factor={2} saturation={0} fade speed={0.8} />
        </Suspense>
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#6366f1" />
        <pointLight position={[-6, -2, -4]} intensity={0.7} color="#8b5cf6" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(99,102,241,.25),transparent),radial-gradient(50%_50%_at_90%_80%,rgba(139,92,246,.22),transparent)]" />
    </div>
  ),
};

// ---------- utils ----------
function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const springy = { type: "spring", stiffness: 180, damping: 22 } as const;

function titleCase(str: string) {
  return str
    .toLowerCase()
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Tailwind class mappings for accent colors
const accentClasses: Record<string, {
  bg400: string;
  bg300: string;
  bg500: string;
  bg200: string;
  text200: string;
  text300: string;
  ring300: string;
  hoverBg: string;
  gradientFrom: string;
  gradientTo: string;
}> = {
  emerald: {
    bg400: "bg-emerald-400",
    bg300: "bg-emerald-300",
    bg500: "bg-emerald-500",
    bg200: "bg-emerald-200",
    text200: "text-emerald-200",
    text300: "text-emerald-300",
    ring300: "ring-emerald-300",
    hoverBg: "hover:bg-emerald-500/30",
    gradientFrom: "from-emerald-200",
    gradientTo: "to-emerald-300",
  },
  indigo: {
    bg400: "bg-indigo-400",
    bg300: "bg-indigo-300",
    bg500: "bg-indigo-500",
    bg200: "bg-indigo-200",
    text200: "text-indigo-200",
    text300: "text-indigo-300",
    ring300: "ring-indigo-300",
    hoverBg: "hover:bg-indigo-500/30",
    gradientFrom: "from-indigo-200",
    gradientTo: "to-indigo-300",
  },
  slate: {
    bg400: "bg-slate-400",
    bg300: "bg-slate-300",
    bg500: "bg-slate-500",
    bg200: "bg-slate-200",
    text200: "text-slate-200",
    text300: "text-slate-300",
    ring300: "ring-slate-300",
    hoverBg: "hover:bg-slate-500/30",
    gradientFrom: "from-slate-200",
    gradientTo: "to-slate-300",
  },
  cyan: {
    bg400: "bg-cyan-400",
    bg300: "bg-cyan-300",
    bg500: "bg-cyan-500",
    bg200: "bg-cyan-200",
    text200: "text-cyan-200",
    text300: "text-cyan-300",
    ring300: "ring-cyan-300",
    hoverBg: "hover:bg-cyan-500/30",
    gradientFrom: "from-cyan-200",
    gradientTo: "to-cyan-300",
  },
  yellow: {
    bg400: "bg-yellow-400",
    bg300: "bg-yellow-300",
    bg500: "bg-yellow-500",
    bg200: "bg-yellow-200",
    text200: "text-yellow-200",
    text300: "text-yellow-300",
    ring300: "ring-yellow-300",
    hoverBg: "hover:bg-yellow-500/30",
    gradientFrom: "from-yellow-200",
    gradientTo: "to-yellow-300",
  },
  pink: {
    bg400: "bg-pink-400",
    bg300: "bg-pink-300",
    bg500: "bg-pink-500",
    bg200: "bg-pink-200",
    text200: "text-pink-200",
    text300: "text-pink-300",
    ring300: "ring-pink-300",
    hoverBg: "hover:bg-pink-500/30",
    gradientFrom: "from-pink-200",
    gradientTo: "to-pink-300",
  },
  purple: {
    bg400: "bg-purple-400",
    bg300: "bg-purple-300",
    bg500: "bg-purple-500",
    bg200: "bg-purple-200",
    text200: "text-purple-200",
    text300: "text-purple-300",
    ring300: "ring-purple-300",
    hoverBg: "hover:bg-purple-500/30",
    gradientFrom: "from-purple-200",
    gradientTo: "to-purple-300",
  },
  gray: {
    bg400: "bg-gray-400",
    bg300: "bg-gray-300",
    bg500: "bg-gray-500",
    bg200: "bg-gray-200",
    text200: "text-gray-200",
    text300: "text-gray-300",
    ring300: "ring-gray-300",
    hoverBg: "hover:bg-gray-500/30",
    gradientFrom: "from-gray-200",
    gradientTo: "to-gray-300",
  },
  violet: {
    bg400: "bg-violet-400",
    bg300: "bg-violet-300",
    bg500: "bg-violet-500",
    bg200: "bg-violet-200",
    text200: "text-violet-200",
    text300: "text-violet-300",
    ring300: "ring-violet-300",
    hoverBg: "hover:bg-violet-500/30",
    gradientFrom: "from-violet-200",
    gradientTo: "to-violet-300",
  },
  teal: {
    bg400: "bg-teal-400",
    bg300: "bg-teal-300",
    bg500: "bg-teal-500",
    bg200: "bg-teal-200",
    text200: "text-teal-200",
    text300: "text-teal-300",
    ring300: "ring-teal-300",
    hoverBg: "hover:bg-teal-500/30",
    gradientFrom: "from-teal-200",
    gradientTo: "to-teal-300",
  },
  green: {
    bg400: "bg-green-400",
    bg300: "bg-green-300",
    bg500: "bg-green-500",
    bg200: "bg-green-200",
    text200: "text-green-200",
    text300: "text-green-300",
    ring300: "ring-green-300",
    hoverBg: "hover:bg-green-500/30",
    gradientFrom: "from-green-200",
    gradientTo: "to-green-300",
  },
  stone: {
    bg400: "bg-stone-400",
    bg300: "bg-stone-300",
    bg500: "bg-stone-500",
    bg200: "bg-stone-200",
    text200: "text-stone-200",
    text300: "text-stone-300",
    ring300: "ring-stone-300",
    hoverBg: "hover:bg-stone-500/30",
    gradientFrom: "from-stone-200",
    gradientTo: "to-stone-300",
  },
  red: {
    bg400: "bg-red-400",
    bg300: "bg-red-300",
    bg500: "bg-red-500",
    bg200: "bg-red-200",
    text200: "text-red-200",
    text300: "text-red-300",
    ring300: "ring-red-300",
    hoverBg: "hover:bg-red-500/30",
    gradientFrom: "from-red-200",
    gradientTo: "to-red-300",
  },
  amber: {
    bg400: "bg-amber-400",
    bg300: "bg-amber-300",
    bg500: "bg-amber-500",
    bg200: "bg-amber-200",
    text200: "text-amber-200",
    text300: "text-amber-300",
    ring300: "ring-amber-300",
    hoverBg: "hover:bg-amber-500/30",
    gradientFrom: "from-amber-200",
    gradientTo: "to-amber-300",
  },
  lime: {
    bg400: "bg-lime-400",
    bg300: "bg-lime-300",
    bg500: "bg-lime-500",
    bg200: "bg-lime-200",
    text200: "text-lime-200",
    text300: "text-lime-300",
    ring300: "ring-lime-300",
    hoverBg: "hover:bg-lime-500/30",
    gradientFrom: "from-lime-200",
    gradientTo: "to-lime-300",
  },
};

// ---------- Resource Card ----------
type Resource = {
  title: string;
  type: string;
  link: string;
  platform: string;
  estimatedHours?: number;
};

function ResourceCard({ r, bookmarked, onBookmark, accentCls }: { r: Resource; bookmarked?: boolean; onBookmark?: () => void; accentCls: typeof accentClasses.emerald }) {
  return (
    <motion.a
      href={r.link}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -4 }}
      className="group relative block rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accentCls.bg500}/10 ${accentCls.bg500}/10 opacity-0 transition-opacity group-hover:opacity-100`} />
      <div className="relative z-10">
        <div className="mb-1 flex items-center gap-2 text-xs text-white/70">
          <span className="px-2 py-0.5 rounded-full bg-white/10">{r.platform}</span>
          <span>•</span>
          <span>{r.type}</span>
          {typeof r.estimatedHours === "number" && <span>• {r.estimatedHours}h</span>}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold text-white/90">{r.title}</h4>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-white/60" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onBookmark?.();
              }}
              className="rounded-full bg-white/10 p-1 hover:bg-white/20"
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-emerald-300" />
              ) : (
                <Bookmark className="h-4 w-4 text-white/70" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

// ---------- Project Carousel ----------
function ProjectCarousel({ ideas }: { ideas: string[] }) {
  return (
    <div className="relative">
      <div className="flex snap-x snap-mandatory overflow-x-auto gap-4 pb-2">
        {ideas.map((idea, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="snap-start min-w-[280px] rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur"
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
              <Sparkles className="h-4 w-4 text-yellow-200" /> Project Idea
            </div>
            <p className="text-white/85">{idea}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function GenericLearningHub() {
  const { discipline = "" } = useParams();
  const config = DISCIPLINE_CONFIG[discipline] || DEFAULT_CONFIG;
  const { icon: Icon, gradient, accent, quote, description, BackgroundComponent } = config;
  const accentCls = accentClasses[accent] || accentClasses.indigo;
  
  const [hub, setHub] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [region, setRegion] = useState<string>("Global");
  const [activeStage, setActiveStage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  // store progress for ALL regions (not just the current one)
  const [stageState, setStageState] = useState<Record<string, Record<string, any>>>({});
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1️⃣ Wait for the user
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;
      if (!currentUser || !mounted) return;
      setUser(currentUser);

      // 2️⃣ Load hub JSON
      const res = await http.get(`/learning/${discipline}`);
      if (!mounted) return;
      setHub(res.data);

      // 3️⃣ Load user progress
      const { data: progress } = await supabase
        .from("learning_progress")
        .select("stage_state, region, bookmarks")
        .eq("user_id", currentUser.id)
        .eq("discipline", discipline)
        .maybeSingle();

      if (progress) {
        setStageState(progress.stage_state || {});
        setRegion(progress.region || "Global");
        setBookmarks(progress.bookmarks || []);
      } else {
        setStageState({});
      }

      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [discipline]);

  const allRegions: string[] = useMemo(
    () => hub?.availableRegions || Object.keys(hub?.stages?.[0]?.regions || { Global: true }),
    [hub]
  );

  const overallProgress = useMemo(() => {
    if (!hub || !hub.stages) return 0;
    const currentRegionState = stageState[region] || {};
    let total = 0; let done = 0;
    for (const stage of hub.stages) {
      const regionData = stage.regions?.[region] || stage.regions?.Global;
      const list: string[] = regionData?.checklist || [];
      total += list.length;
      const checked = Object.keys(currentRegionState?.[stage.id]?.checklist || {}).filter(
        (k) => currentRegionState?.[stage.id]?.checklist?.[k]
      ).length;
      done += checked;
    }
    return total ? Math.round((done / total) * 100) : 0;
  }, [hub, stageState, region]);

  async function persist(
    updatedStageState: Record<string, any> = stageState,
    currentRegion = region,
    currentBookmarks = bookmarks
  ) {
    if (!user?.id) return;

    const { data: existing } = await supabase
      .from("learning_progress")
      .select("stage_state")
      .eq("user_id", user.id)
      .eq("discipline", discipline)
      .maybeSingle();

    const serverState = existing?.stage_state || {};

    // merge: keep all regions, patch just the current one
    const merged = {
      ...serverState,
      ...updatedStageState,
      [currentRegion]: {
        ...(serverState[currentRegion] || {}),
        ...(updatedStageState[currentRegion] || {}),
      },
    };

    await supabase
      .from("learning_progress")
      .upsert(
        {
          user_id: user.id,
          discipline,
          region: currentRegion,
          stage_state: merged,
          bookmarks: currentBookmarks
        },
        { onConflict: "user_id,discipline" }
      )
      .select();

    setStageState(merged);
  }

  function isBookmarked(link: string) {
    return bookmarks?.some((b) => b.link === link);
  }

  function toggleBookmark(r: Resource) {
    const exists = bookmarks.some((b: any) => b.link === r.link);
    const next = exists ? bookmarks.filter((b: any) => b.link !== r.link) : [...bookmarks, r];
    setBookmarks(next);
    persist(stageState, region, next);
  }

  function toggleTask(stageId: number, task: string) {
    setStageState((prev) => {
      const regionState = { ...(prev[region] || {}) };
      const currentStage = {
        ...(regionState[stageId] || {}),
        checklist: { ...(regionState[stageId]?.checklist || {}) },
      };

      // Toggle task
      currentStage.checklist[task] = !currentStage.checklist[task];

      const updatedRegionState = { ...regionState, [stageId]: currentStage };
      const next = { ...prev, [region]: updatedRegionState };

      // Save the updated all-region state
      persist(next, region);
      return next;
    });
  }

  useEffect(() => {
    if (!activeStage) return;
    const q = activeStage.quiz || [];
    const allAnswered = Object.keys(quizAnswers).length >= q.length;
    if (allAnswered) {
      const score = q.reduce((acc: number, cur: any, i: number) => acc + (quizAnswers[i] === cur.correct ? 1 : 0), 0);
      const pct = Math.round((score / q.length) * 100);
      setQuizScore(pct);
      if (user?.id) saveQuizScore(user.id, discipline, activeStage.id, pct);
    } else {
      setQuizScore(null);
    }
  }, [quizAnswers, activeStage, user?.id, discipline]);

  if (loading || !hub) {
    return (
      <div className="relative min-h-screen">
        <BackgroundComponent />
        <div className="grid place-items-center min-h-screen">
          <div className="flex items-center gap-3 text-white/80">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your {titleCase(discipline)} journey…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <BackgroundComponent />
      {/* Header / Hero */}
      <header className="relative mx-auto max-w-6xl px-6 pt-14">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springy}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r opacity-40 rounded-full" style={{ background: `linear-gradient(to right, ${gradient.from}40, ${gradient.to}40)` }} />
            <div className="flex items-center justify-center gap-3 rounded-full bg-white/5 px-6 py-3 ring-1 ring-white/10 backdrop-blur">
              <Icon />
              <p className="font-semibold tracking-wide">{titleCase(discipline)} Learning Hub</p>
            </div>
          </div>
          <h1 className="text-balance bg-gradient-to-br bg-clip-text text-center text-4xl font-extrabold text-transparent sm:text-6xl" style={{ backgroundImage: `linear-gradient(to bottom right, white, ${accentCls.bg200})` }}>
            "{quote}"
          </h1>
          <p className="max-w-2xl text-white/80">
            {description}
          </p>
          {/* progress ring */}
          <div className="relative grid place-items-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow">
              <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,.12)" strokeWidth="10" fill="none" />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                strokeWidth="10"
                stroke={`url(#grad-${accent})`}
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * 2 * 52}`}
                strokeDashoffset={(1 - overallProgress / 100) * Math.PI * 2 * 52}
                initial={{ strokeDashoffset: Math.PI * 2 * 52 }}
                animate={{ strokeDashoffset: (1 - overallProgress / 100) * Math.PI * 2 * 52 }}
                transition={springy}
              />
              <defs>
                <linearGradient id={`grad-${accent}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor={gradient.from} />
                  <stop offset="100%" stopColor={gradient.to} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-xl font-bold">{overallProgress}%</div>
          </div>
          {/* Region chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {allRegions.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRegion(r);
                  persist(stageState, r);
                }}
                className={cx(
                  "rounded-full border border-white/15 px-4 py-1.5 text-sm backdrop-blur transition",
                  r === region ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </motion.div>
      </header>
      {/* Stages timeline */}
      <main className="mx-auto mt-12 max-w-6xl px-6 pb-28">
        <ol className="relative border-l border-white/10">
          {hub.stages.map((stage: any, idx: number) => {
            const rData = stage.regions?.[region] || stage.regions?.Global;
            const list: string[] = rData?.checklist || [];
            const regionState = stageState?.[region] || {};
            const checked = Object.keys(regionState?.[stage.id]?.checklist || {}).filter(
              (k) => regionState?.[stage.id]?.checklist?.[k]
            ).length;

            const pct = list.length ? Math.round((checked / list.length) * 100) : 0;
            return (
              <li key={stage.id} className="ml-6 pb-10">
                <span className={`absolute -left-[9px] mt-1 grid h-4 w-4 place-items-center rounded-full ${accentCls.bg400} ring-2 ${accentCls.ring300}/50`} />
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-2xl bg-white/5 p-5 backdrop-blur ring-1 ring-white/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        <span className="mr-2 text-white/70">Stage {idx + 1}:</span> {stage.title}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-white/70">{stage.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {pct}%
                      </div>
                      <button
                        onClick={() => setActiveStage(stage)}
                        className={`inline-flex items-center gap-1 rounded-full ${accentCls.bg500}/20 px-3 py-1 ${accentCls.text200} ring-1 ${accentCls.ring300}/30 ${accentCls.hoverBg}`}
                      >
                        Open <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
        {/* Bookmarks gallery */}
        {bookmarks?.length > 0 && (
          <section className="mt-14">
            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Bookmark className="h-5 w-5" /> Your bookmarks
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((r: Resource) => (
                <ResourceCard key={r.link} r={r} bookmarked onBookmark={() => toggleBookmark(r)} accentCls={accentCls} />
              ))}
            </div>
          </section>
        )}
      </main>
      {/* Stage Modal */}
      <AnimatePresence>
        {activeStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={springy}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl 
                         border border-white/20 bg-white/10 backdrop-blur-2xl 
                         shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-white/90 leading-relaxed"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveStage(null)}
                className="absolute right-3 top-3 rounded-full bg-white/15 p-2 hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-6 p-6 sm:grid-cols-5">
                {/* LEFT COLUMN */}
                <div className="sm:col-span-3 space-y-6">
                  {/* Title & Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                      {activeStage.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      {activeStage.description}
                    </p>
                  </div>

                  {/* Region Overview */}
                  <div className="rounded-2xl bg-black/35 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <p className="text-sm text-white/90 leading-relaxed">
                      {(activeStage.regions?.[region] || activeStage.regions?.Global)?.overview}
                    </p>
                  </div>

                  {/* Checklist */}
                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <h4 className={`mb-3 font-semibold ${accentCls.text200}`}>Checklist</h4>
                    <ul className="space-y-2">
                      {(activeStage.regions?.[region] || activeStage.regions?.Global)?.checklist?.map((task: string) => (
                        <li
                          key={task}
                          className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 hover:bg-white/10 transition"
                        >
                          <button
                            onClick={() => toggleTask(activeStage.id, task)}
                            className={cx(
                              "mt-0.5 grid h-5 w-5 place-items-center rounded-full border transition",
                              stageState?.[region]?.[activeStage.id]?.checklist?.[task]
                                ? "border-emerald-400 bg-emerald-400/25"
                                : "border-white/30 hover:border-indigo-300"
                            )}
                          >
                            {stageState?.[region]?.[activeStage.id]?.checklist?.[task] && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                            )}
                          </button>
                          <span className="text-sm text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                            {task}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Curated Resources */}
                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <h4 className={`mb-2 font-semibold ${accentCls.text200}`}>Curated Resources</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(activeStage.regions?.[region] || activeStage.regions?.Global)?.resources?.map((r: Resource) => (
                        <ResourceCard
                          key={r.link}
                          r={r}
                          bookmarked={isBookmarked(r.link)}
                          onBookmark={() => toggleBookmark(r)}
                          accentCls={accentCls}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Reflection Box */}
                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <h4 className={`mb-2 font-semibold ${accentCls.text200}`}>Reflection</h4>
                    <textarea
                      className="min-h-[96px] w-full rounded-xl bg-white/10 p-3 text-sm text-white/90 
                                 placeholder:text-white/50 outline-none ring-1 ring-inset ring-white/15 
                                 focus:ring-indigo-400 transition"
                      placeholder="What did you explore, learn, or build in this stage?"
                      defaultValue={stageState?.[region]?.[activeStage.id]?.notes || ""}
                      onBlur={(e) => {
                        const val = e.currentTarget.value;
                        setStageState((prev) => {
                          const regionState = { ...(prev[region] || {}) };
                          const nextStage = { ...(regionState[activeStage.id] || {}), notes: val };
                          const next = { ...prev, [region]: { ...regionState, [activeStage.id]: nextStage } };
                          persist(next, region);
                          return next;
                        });
                        if (user?.id) saveReflection(user.id, discipline, activeStage.id, val);
                      }}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="sm:col-span-2 flex flex-col gap-4">
                  {/* Quick Quiz */}
                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                      <GraduationCap className={`h-4 w-4 ${accentCls.text300}`} /> Quick Quiz
                    </div>
                    <div className="space-y-3">
                      {(activeStage.quiz || []).map((Q: any, i: number) => (
                        <div key={i}>
                          <p className="text-sm text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{Q.q}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Q.opts.map((opt: string) => (
                              <button
                                key={opt}
                                onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: opt }))}
                                className={cx(
                                  "rounded-full border border-white/15 px-3 py-1 text-sm transition",
                                  quizAnswers[i] === opt
                                    ? `${accentCls.bg500}/40 ring-1 ${accentCls.ring300}/40`
                                    : "bg-white/10 hover:bg-white/15"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {quizScore !== null && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 text-emerald-300 font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
                      >
                        ✅ You scored {quizScore}%
                      </motion.div>
                    )}
                  </div>

                  {/* Projects */}
                  {activeStage.regions?.Global?.projectIdeas && (
                    <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                      <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                        <Sparkles className={`h-4 w-4 ${accentCls.text300}`} /> Explore Projects
                      </div>
                      <ProjectCarousel ideas={activeStage.regions.Global.projectIdeas} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-10 text-center text-xs text-white/50">Made for learners who aim for excellence ✨</footer>
    </div>
  );
}
