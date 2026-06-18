"use client";

import { useState, useEffect } from "react";
import { Terminal, Cpu, Layers, ShieldCheck, Activity } from "lucide-react";

interface TelemetryNode {
  id: string;
  x: number; // percentage width
  y: number; // percentage height
  title: string;
  developer: string;
  metrics: {
    latency: string;
    uptime: string;
    throughput: string;
  };
  technologies: string[];
  status: "verified" | "warning" | "evaluating";
  logs: string[];
}

const mockNodes: TelemetryNode[] = [
  {
    id: "node-1",
    x: 15,
    y: 30,
    title: "Rust Core Engine",
    developer: "Elena Rostova",
    metrics: {
      latency: "4.2ms",
      uptime: "99.99%",
      throughput: "24.5k req/s"
    },
    technologies: ["Rust", "WASM", "gRPC"],
    status: "verified",
    logs: [
      "SYSTEM: Allocating engine clusters...",
      "BENCH: Memory footprint: 14.8MB",
      "SEC: Zero-copy deserialization active.",
      "STATUS: Verification PASS (100% test coverage)"
    ]
  },
  {
    id: "node-2",
    x: 40,
    y: 15,
    title: "Arbitrage Router v2",
    developer: "Marcus Chen",
    metrics: {
      latency: "18.1ms",
      uptime: "99.95%",
      throughput: "8.2k req/s"
    },
    technologies: ["Solidity", "Ethers.js", "Vyper"],
    status: "verified",
    logs: [
      "TRANS: Simulating cross-pool paths...",
      "GAS: Optimization tier-1 complete: -22% gas usage.",
      "STATUS: Deployment simulation stable."
    ]
  },
  {
    id: "node-3",
    x: 55,
    y: 70,
    title: "DeFi Liquidity Hub",
    developer: "Sarah Jenkins",
    metrics: {
      latency: "32.0ms",
      uptime: "99.8%",
      throughput: "12.0k req/s"
    },
    technologies: ["TypeScript", "Next.js", "GraphQL"],
    status: "evaluating",
    logs: [
      "API: Establishing subgraph subscription...",
      "WS: Connection established with 8 relayers.",
      "WARN: Inconsistent state synchronization in testnet epoch 44.",
      "STATUS: In-progress telemetry check..."
    ]
  },
  {
    id: "node-4",
    x: 85,
    y: 45,
    title: "ZK-Rollup Prover",
    developer: "Dr. Kenji Sato",
    metrics: {
      latency: "112.5ms",
      uptime: "99.90%",
      throughput: "450 txn/s"
    },
    technologies: ["Circom", "SnarkJS", "Rust"],
    status: "verified",
    logs: [
      "PROOF: Generating CRS setup parameters...",
      "PROVER: Constraints: 2,401,920 gates.",
      "SEC: Multi-party ceremony verified.",
      "STATUS: Audit verified by 3 independent nodes."
    ]
  }
];

export function TelemetryGrid() {
  const [activeNode, setActiveNode] = useState<TelemetryNode | null>(mockNodes[0]);
  const [activeConnections, setActiveConnections] = useState<[string, string][]>([]);
  const [pulseIndex, setPulseIndex] = useState(0);

  // Set up connection lines between nodes dynamically
  useEffect(() => {
    setActiveConnections([
      ["node-1", "node-2"],
      ["node-2", "node-3"],
      ["node-3", "node-4"],
      ["node-1", "node-3"]
    ]);

    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getNodeColor = (status: TelemetryNode["status"]) => {
    switch (status) {
      case "verified":
        return "text-cyan-400 border-cyan-400 bg-cyan-950/40";
      case "warning":
        return "text-amber-400 border-amber-400 bg-amber-950/40";
      case "evaluating":
        return "text-slate-400 border-slate-400 bg-slate-900/60";
    }
  };

  return (
    <div className="relative border border-border bg-card rounded-xl overflow-hidden p-6 font-sans">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Visual Map Grid Area */}
        <div className="flex-1 relative h-64 md:h-80 bg-background border border-border/80 rounded-lg overflow-hidden bg-grid-pattern/10">
          
          {/* Cyberpunk Radar sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/3 to-transparent w-1/3 animate-pulse pointer-events-none" />

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {activeConnections.map(([fromId, toId], idx) => {
              const fromNode = mockNodes.find((n) => n.id === fromId);
              const toNode = mockNodes.find((n) => n.id === toId);
              if (!fromNode || !toNode) return null;

              const x1 = `${fromNode.x}%`;
              const y1 = `${fromNode.y}%`;
              const x2 = `${toNode.x}%`;
              const y2 = `${toNode.y}%`;

              const isPulse = idx === pulseIndex;

              return (
                <g key={`${fromId}-${toId}-${idx}`}>
                  {/* Glowing background line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="stroke-cyan-500/10 dark:stroke-cyan-400/10"
                    strokeWidth={4}
                  />
                  {/* Thin main path */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="stroke-cyan-600/30 dark:stroke-cyan-400/30"
                    strokeWidth={1.5}
                  />
                  {/* Moving data pulse */}
                  {isPulse && (
                    <circle r="4" className="fill-cyan-400 animate-ping">
                      <animateMotion
                        path={`M ${fromNode.x}% ${fromNode.y}% L ${toNode.x}% ${toNode.y}%`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {mockNodes.map((node) => {
            const isSelected = activeNode?.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNode(node)}
                onMouseEnter={() => setActiveNode(node)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full border transition-[colors,transform] duration-200 ease-out cursor-pointer ${
                  isSelected 
                    ? "scale-125 border-cyan-400 bg-cyan-900/40 shadow-[0_0_12px_rgba(0,229,255,0.4)]" 
                    : "border-border hover:border-cyan-400/80 bg-card/90"
                }`}
                title={node.title}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${
                  node.status === "verified" 
                    ? "bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                    : node.status === "warning"
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    : "bg-slate-400"
                }`} />
              </button>
            );
          })}

          {/* Map Grid Labels */}
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-muted-foreground flex gap-4 pointer-events-none">
            <span>GRID: TELEMETRY_SYS_V2</span>
            <span>DEVS: 4 ACTIVE</span>
          </div>
        </div>

        {/* Terminal Tooltip Detail Area */}
        <div className="w-full md:w-80 flex flex-col justify-between border border-border bg-slate-950 text-slate-100 rounded-lg p-4 font-mono text-xs shadow-inner">
          {activeNode ? (
            <div className="space-y-4">
              {/* Terminal Title */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-cyan-400 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Terminal className="h-3.5 w-3.5" />
                  {activeNode.id} // console
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                  activeNode.status === "verified"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : activeNode.status === "warning"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                }`}>
                  {activeNode.status}
                </span>
              </div>

              {/* Node Title & Author */}
              <div>
                <h4 className="text-sm font-semibold text-white tracking-wide">{activeNode.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">DEV: {activeNode.developer}</p>
              </div>

              {/* Core Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Latency</div>
                  <div className="font-semibold text-[11px] text-cyan-400 mt-0.5">{activeNode.metrics.latency}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Uptime</div>
                  <div className="font-semibold text-[11px] text-cyan-400 mt-0.5">{activeNode.metrics.uptime}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Through</div>
                  <div className="font-semibold text-[11px] text-cyan-400 mt-0.5 truncate">{activeNode.metrics.throughput}</div>
                </div>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1">
                {activeNode.technologies.map((t, idx) => (
                  <span key={idx} className="bg-slate-900 text-[10px] border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>

              {/* Terminal Logs */}
              <div className="space-y-1 pt-2 border-t border-slate-900 leading-relaxed max-h-[88px] overflow-y-auto custom-scrollbar">
                {activeNode.logs.map((log, idx) => (
                  <div key={idx} className={`text-[10px] ${
                    log.includes("PASS") ? "text-emerald-400 font-bold" :
                    log.includes("WARN") ? "text-amber-400" : "text-slate-400"
                  }`}>
                    &gt; {log}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Hover over a node to establish connection
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
