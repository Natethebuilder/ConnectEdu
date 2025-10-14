import { useEffect, useRef, useState } from "react";

declare global { interface Window { loadPyodide: any; } }

export default function PyPlayground({ defaultCode }: { defaultCode: string }) {
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState(defaultCode);
  const [out, setOut] = useState("");
  const pyRef = useRef<any>(null);

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
    s.onload = async () => {
      pyRef.current = await window.loadPyodide();
      setReady(true);
    };
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  async function run() {
    if (!pyRef.current) return;
    try {
      const result = await pyRef.current.runPythonAsync(code);
      setOut(String(result ?? ""));
    } catch (e: any) {
      setOut(String(e));
    }
  }

  return (
    <div>
      {!ready && <div className="text-gray-500 mb-2">Loading Python runtime…</div>}
      <div className="grid md:grid-cols-2 gap-4">
        <textarea className="min-h-[220px] rounded-xl border p-3 font-mono text-sm" value={code} onChange={(e)=>setCode(e.target.value)} />
        <pre className="min-h-[220px] rounded-xl border p-3 bg-black/80 text-green-200 overflow-auto text-sm">{out}</pre>
      </div>
      <div className="mt-3 flex gap-2 justify-end">
        <button onClick={() => setCode(defaultCode)} className="px-3 py-2 rounded-xl border bg-white">Reset</button>
        <button disabled={!ready} onClick={run} className="px-3 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-50">Run</button>
      </div>
    </div>
  );
}
