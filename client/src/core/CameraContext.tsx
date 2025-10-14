// core/CameraContext.tsx
import { createContext, useContext, useRef } from "react";

type CameraCtx = {
  yaw: React.MutableRefObject<number>;
  pitch: React.MutableRefObject<number>;
};

const CameraContext = createContext<CameraCtx | null>(null);

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const yaw = useRef(0);
  const pitch = useRef(-0.25);
  return (
    <CameraContext.Provider value={{ yaw, pitch }}>
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraAngles() {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("useCameraAngles must be used inside <CameraProvider>");
  return ctx;
}
