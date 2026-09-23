import React, { useState } from 'react';
import {
  AlertCircle,
  Battery,
  Flame,
  Gauge,
  Navigation,
  PlusCircle,
  Sparkles,
  Thermometer,
  Trash2,
  Wind,
  X,
} from 'lucide-react';
import { SmartBin, RouteStop } from '../types';
import { FLEET_DEPOT } from '../data/mockBins';

interface InteractiveMapProps {
  bins: SmartBin[];
  selectedBin: SmartBin | null;
  onSelectBin: (bin: SmartBin | null) => void;
  onEmptyBin: (binId: string) => void;
  activeRouteStops?: RouteStop[];
  truckProgress?: number; // 0 to 1 along the route
  onAddBin?: (newBin: Partial<SmartBin>) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  bins,
  selectedBin,
  onSelectBin,
  onEmptyBin,
  activeRouteStops = [],
  truckProgress = 0,
  onAddBin,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'GAS'>('ALL');
  const [isAddingBin, setIsAddingBin] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Filter bins
  const displayedBins = bins.filter((b) => {
    if (filterMode === 'CRITICAL') return b.fillLevel >= 80;
    if (filterMode === 'GAS') return b.gasPpm >= 250;
    return true;
  });

  // Calculate truck SVG position if route stops are present
  let truckPos = { x: FLEET_DEPOT.mapX, y: FLEET_DEPOT.mapY };
  if (activeRouteStops.length > 1) {
    const totalLegs = activeRouteStops.length;
    const currentLegIndex = Math.min(
      Math.floor(truckProgress * totalLegs),
      totalLegs - 1
    );
    const nextLegIndex = (currentLegIndex + 1) % totalLegs;
    const fromStop = activeRouteStops[currentLegIndex];
    const toStop = activeRouteStops[nextLegIndex];

    const legProgress = (truckProgress * totalLegs) % 1;
    truckPos = {
      x: fromStop.mapX + (toStop.mapX - fromStop.mapX) * legProgress,
      y: fromStop.mapY + (toStop.mapY - fromStop.mapY) * legProgress,
    };
  }

  // Handle map click to place new bin
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingBin || !onAddBin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newBinId = `BIN-${bins.length + 101}`;
    onAddBin({
      id: newBinId,
      name: `Smart Bin ${newBinId}`,
      zone: x > 50 ? 'East District' : 'West District',
      address: `Avenue ${Math.floor(x * 10)}, Sector ${Math.floor(y * 5)}`,
      mapX: Math.round(x),
      mapY: Math.round(y),
      lat: 37.77 + (y - 50) * 0.001,
      lng: -122.41 + (x - 50) * 0.001,
      fillLevel: Math.floor(Math.random() * 40) + 30,
      capacityLiters: 240,
      temperature: 21.0,
      gasPpm: 110,
      battery: 95,
      lidStatus: 'CLOSED',
      lastEmptied: 'Just deployed',
      fillRatePerHour: 3.5,
      status: 'NORMAL',
      history: [],
    });
    setIsAddingBin(false);
  };

  return (
    <div className="relative w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Map Header Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 shadow-lg pointer-events-auto">
          <span className="text-xs font-semibold text-slate-300">Filter View:</span>
          <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2 py-1 rounded font-medium transition ${
                filterMode === 'ALL'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({bins.length})
            </button>
            <button
              onClick={() => setFilterMode('CRITICAL')}
              className={`px-2 py-1 rounded font-medium transition ${
                filterMode === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical ({bins.filter((b) => b.fillLevel >= 80).length})
            </button>
            <button
              onClick={() => setFilterMode('GAS')}
              className={`px-2 py-1 rounded font-medium transition ${
                filterMode === 'GAS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gas / Odor ({bins.filter((b) => b.gasPpm >= 250).length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 shadow-lg pointer-events-auto">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition ${
              showHeatmap
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold'
                : 'text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            🔥 Heatmap {showHeatmap ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setIsAddingBin(!isAddingBin)}
            className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition border ${
              isAddingBin
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAddingBin ? 'Click Map to Place' : 'Deploy Bin'}</span>
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <svg
        viewBox="0 0 1000 650"
        className={`w-full h-auto aspect-[16/10] select-none ${
          isAddingBin ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onClick={handleMapClick}
      >
        <defs>
          {/* Radial Gradient for City Water */}
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#032541" />
            <stop offset="100%" stopColor="#073d69" />
          </linearGradient>

          {/* Grid pattern for city blocks */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#1e293b"
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
          </pattern>

          {/* Glowing filter for high-fill bins */}
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-route" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Map Background with dark terrain */}
        <rect width="1000" height="650" fill="#090d16" />
        <rect width="1000" height="650" fill="url(#grid)" opacity="0.6" />

        {/* Scenic City River / Bay */}
        <path
          d="M 0,220 C 250,180 400,280 620,190 C 800,120 900,160 1000,110 L 1000,0 L 0,0 Z"
          fill="url(#riverGrad)"
          opacity="0.85"
        />
        {/* River outline highlight */}
        <path
          d="M 0,220 C 250,180 400,280 620,190 C 800,120 900,160 1000,110"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Green Parks & Conservation Zones */}
        <rect x="340" y="460" width="160" height="120" rx="16" fill="#064e3b" opacity="0.25" />
        <text x="360" y="485" fill="#10b981" fontSize="11" fontWeight="600" opacity="0.7">
          🌲 BOTANICAL GARDENS
        </text>

        <rect x="180" y="140" width="130" height="90" rx="12" fill="#042f2e" opacity="0.3" />
        <text x="195" y="165" fill="#14b8a6" fontSize="10" fontWeight="600" opacity="0.7">
          🎓 UNIVERSITY QUAD
        </text>

        {/* Industrial Tech Zone */}
        <rect x="740" y="380" width="220" height="210" rx="14" fill="#312e81" opacity="0.2" />
        <text x="760" y="405" fill="#818cf8" fontSize="10" fontWeight="600" opacity="0.7">
          🏭 INDUSTRIAL & LOGISTICS
        </text>

        {/* Major City Arterial Roads */}
        <g stroke="#334155" strokeWidth="6" strokeLinecap="round" opacity="0.7">
          {/* Main East-West Highway */}
          <line x1="20" y1="325" x2="980" y2="325" />
          {/* North-South Boulevard */}
          <line x1="580" y1="30" x2="580" y2="620" />
          {/* Diagonal Arterial Road */}
          <line x1="100" y1="580" x2="880" y2="120" strokeWidth="4" strokeDasharray="6,4" />
        </g>

        {/* Road Center Line Markings */}
        <g stroke="#475569" strokeWidth="1.5" strokeDasharray="8,6" opacity="0.8">
          <line x1="20" y1="325" x2="980" y2="325" />
          <line x1="580" y1="30" x2="580" y2="620" />
        </g>

        {/* Heatmap Overlay (if toggled) */}
        {showHeatmap && (
          <g opacity="0.45" filter="url(#glow-red)">
            {bins.map((b) => (
              <circle
                key={`heat-${b.id}`}
                cx={b.mapX * 10}
                cy={b.mapY * 6.5}
                r={15 + (b.fillLevel / 100) * 45}
                fill={b.fillLevel >= 80 ? '#ef4444' : b.fillLevel >= 60 ? '#f59e0b' : '#10b981'}
                opacity={0.5}
              />
            ))}
          </g>
        )}

        {/* Optimized Garbage Truck Route Polyline (if route stops exist) */}
        {activeRouteStops.length > 1 && (
          <g>
            {/* Route polyline glow */}
            <polyline
              points={activeRouteStops.map((s) => `${s.mapX * 10},${s.mapY * 6.5}`).join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#glow-route)"
              opacity="0.8"
            />
            <polyline
              points={activeRouteStops.map((s) => `${s.mapX * 10},${s.mapY * 6.5}`).join(' ')}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              strokeLinejoin="round"
            />

            {/* Route Stop Sequence Numbers */}
            {activeRouteStops.map((stop, idx) => (
              <g key={`stop-${stop.binId}-${idx}`}>
                <circle
                  cx={stop.mapX * 10}
                  cy={stop.mapY * 6.5 - 20}
                  r="9"
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={stop.mapX * 10}
                  y={stop.mapY * 6.5 - 16}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {stop.stopNumber}
                </text>
              </g>
            ))}

            {/* Animated Garbage Truck along route */}
            <g
              transform={`translate(${truckPos.x * 10}, ${truckPos.y * 6.5})`}
              className="transition-all duration-300 ease-linear"
            >
              <circle r="18" fill="#0284c7" opacity="0.3" className="animate-pulse" />
              <circle r="12" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fontSize="12">
                🚛
              </text>
            </g>
          </g>
        )}

        {/* Municipal Central Depot Pin */}
        <g
          transform={`translate(${FLEET_DEPOT.mapX * 10}, ${FLEET_DEPOT.mapY * 6.5})`}
          className="cursor-pointer"
        >
          <circle r="18" fill="#1e3a8a" opacity="0.5" />
          <circle r="12" fill="#2563eb" stroke="#93c5fd" strokeWidth="2" />
          <text x="0" y="4" textAnchor="middle" fontSize="12">
            🏢
          </text>
          <text
            x="0"
            y="24"
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="9"
            fontWeight="bold"
            className="drop-shadow"
          >
            MUNICIPAL DEPOT
          </text>
        </g>

        {/* Smart Bin Markers */}
        {displayedBins.map((bin) => {
          const cx = bin.mapX * 10;
          const cy = bin.mapY * 6.5;
          const isCritical = bin.fillLevel >= 80;
          const isWarning = bin.fillLevel >= 60 && bin.fillLevel < 80;
          const hasGasAlert = bin.gasPpm >= 250;
          const isSelected = selectedBin?.id === bin.id;

          const ringColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
          const circumference = 2 * Math.PI * 14;
          const strokeDashoffset = circumference - (bin.fillLevel / 100) * circumference;

          return (
            <g
              key={bin.id}
              transform={`translate(${cx}, ${cy})`}
              className="cursor-pointer group transition-transform duration-200 hover:scale-125"
              onClick={(e) => {
                e.stopPropagation();
                onSelectBin(bin);
              }}
            >
              {/* Pulsing halo ring for critical overflow bins */}
              {isCritical && (
                <circle
                  r="24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity="0.7"
                  className="animate-ping origin-center"
                />
              )}

              {/* Selection Indicator Ring */}
              {isSelected && (
                <circle
                  r="22"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4,2"
                />
              )}

              {/* Background circular disc */}
              <circle r="14" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

              {/* Dynamic Fill Level Progress Arc */}
              <circle
                r="14"
                fill="none"
                stroke={ringColor}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90)"
              />

              {/* Bin Center Icon / Text */}
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="9"
                fontWeight="800"
              >
                {Math.round(bin.fillLevel)}%
              </text>

              {/* Gas Alert Warning Badge */}
              {hasGasAlert && (
                <g transform="translate(10, -10)">
                  <circle r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fontSize="7" fill="#ffffff">
                    ⚠️
                  </text>
                </g>
              )}

              {/* Hover Tooltip Label */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                <rect
                  x="-65"
                  y="-48"
                  width="130"
                  height="34"
                  rx="6"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-34"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  {bin.name}
                </text>
                <text x="0" y="-21" textAnchor="middle" fill="#94a3b8" fontSize="8.5">
                  {bin.fillLevel}% • {bin.gasPpm}ppm • {bin.temperature}°C
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center gap-4 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Normal (&lt;60%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Warning (60-79%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Critical Overflow (&ge;80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🏢</span>
          <span>Central Depot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-cyan-400" />
          <span>Optimized Route</span>
        </div>
      </div>

      {/* Selected Bin Telemetry Drawer / Popover */}
      {selectedBin && (
        <div className="absolute top-16 right-4 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl p-4 z-30 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">{selectedBin.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    selectedBin.fillLevel >= 80
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {selectedBin.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{selectedBin.address}</p>
              <p className="text-[11px] text-emerald-400 font-mono">ID: {selectedBin.id} • {selectedBin.zone}</p>
            </div>
            <button
              onClick={() => onSelectBin(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sensor Telemetry Gauges Grid */}
          <div className="grid grid-cols-2 gap-2 my-3">
            {/* Ultrasonic Fill */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Fill Level
                </span>
                <span className="font-mono font-bold text-white text-xs">{selectedBin.fillLevel}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    selectedBin.fillLevel >= 80
                      ? 'bg-rose-500'
                      : selectedBin.fillLevel >= 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedBin.fillLevel}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Ultrasonic: ~{Math.round(100 - selectedBin.fillLevel * 0.9)} cm clearance
              </p>
            </div>

            {/* Temperature (DHT22) */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-orange-400" /> Temp (DHT22)
                </span>
              </div>
              <div className="text-sm font-extrabold text-white">
                {selectedBin.temperature}°C
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {selectedBin.temperature > 35 ? '⚠️ Fire Risk Warning' : 'Normal Operating'}
              </p>
            </div>

            {/* Gas / Smell (MQ-135) */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-purple-400" /> Gas (MQ-135)
                </span>
              </div>
              <div className="text-sm font-extrabold text-white">
                {selectedBin.gasPpm} <span className="text-xs font-normal text-slate-400">PPM</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {selectedBin.gasPpm > 250 ? '⚠️ High Methane/Odor' : 'Air Quality Nominal'}
              </p>
            </div>

            {/* Battery & Lid */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery
                </span>
                <span className="font-mono font-bold text-white text-xs">{selectedBin.battery}%</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">
                Lid: <span className={selectedBin.lidStatus === 'OPEN' ? 'text-amber-400' : 'text-slate-300'}>{selectedBin.lidStatus}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Last Emptied: {selectedBin.lastEmptied}</p>
            </div>
          </div>

          {/* Quick Action: Mark Emptied */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onEmptyBin(selectedBin.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Bin (Simulate Pickup)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
