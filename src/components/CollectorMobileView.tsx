import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Sparkles,
  Trash2,
  Truck,
  Upload,
} from 'lucide-react';
import { RouteStop, SmartBin } from '../types';

interface CollectorMobileViewProps {
  activeStops: RouteStop[];
  onMarkEmptied: (binId: string) => void;
  bins: SmartBin[];
}

export const CollectorMobileView: React.FC<CollectorMobileViewProps> = ({
  activeStops,
  onMarkEmptied,
  bins,
}) => {
  const [completedStops, setCompletedStops] = useState<Set<string>>(new Set());
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentReported, setIncidentReported] = useState(false);
  const [incidentType, setIncidentType] = useState('ROAD_BLOCKED');
  const [incidentNote, setIncidentNote] = useState('');

  // Current active stop is the first uncollected non-depot stop
  const pendingStops = activeStops.filter(
    (s) => s.binId !== 'DEPOT-01' && !completedStops.has(s.binId)
  );
  const currentStop = pendingStops[0] || null;

  const totalNonDepot = activeStops.filter((s) => s.binId !== 'DEPOT-01').length;
  const completedCount = completedStops.size;
  const progressPercent = totalNonDepot > 0 ? Math.round((completedCount / totalNonDepot) * 100) : 100;

  const handleCollect = (binId: string) => {
    setCompletedStops((prev) => new Set(prev).add(binId));
    onMarkEmptied(binId);
  };

  const submitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentReported(true);
    setTimeout(() => {
      setIncidentReported(false);
      setIncidentOpen(false);
      setIncidentNote('');
    }, 1800);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Mobile Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 p-4 rounded-2xl border border-cyan-900/50 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-lg">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-white">Truck #TR-04</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                ACTIVE SHIFT
              </span>
            </div>
            <p className="text-xs text-slate-400">Driver: Dave Miller • Route #RT-209</p>
          </div>
        </div>

        <button
          onClick={() => setIncidentOpen(true)}
          className="text-xs px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-semibold"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Hazard</span>
        </button>
      </div>

      {/* Shift Progress Gauge */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300">Shift Progress</span>
          <span className="font-mono font-bold text-cyan-400">
            {completedCount} / {totalNonDepot} Bins ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Active Stop Card */}
      {currentStop ? (
        <div className="bg-slate-900 rounded-2xl border-2 border-cyan-500/80 p-5 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-cyan-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            NEXT TARGET STOP #{currentStop.stopNumber}
          </div>

          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-1">
              TARGET BIN: {currentStop.binId} • {currentStop.zone}
            </span>
            <h3 className="text-lg font-black text-white">{currentStop.binName}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {currentStop.address}
            </p>
          </div>

          {/* Key Sensor Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Fill Level</span>
              <span className="text-base font-extrabold text-rose-400 font-mono">
                {currentStop.fillLevel}% (Full)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Est. Waste Weight</span>
              <span className="text-base font-extrabold text-white font-mono">
                {currentStop.estimatedWeightKg} kg
              </span>
            </div>
          </div>

          {/* Action: Empty & Collect Button */}
          <button
            onClick={() => handleCollect(currentStop.binId)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <CheckCircle className="w-5 h-5" />
            <span>CONFIRM BIN EMPTIED & COLLECTED</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-emerald-500/40 p-6 text-center space-y-2 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">All Scheduled Bins Collected!</h3>
          <p className="text-xs text-slate-400">
            Proceed back to the Central Municipal Depot (DEPOT-01) for offloading and vehicle maintenance.
          </p>
        </div>
      )}

      {/* Upcoming Stops Queue */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Remaining Shift Stops ({pendingStops.length})
        </span>

        <div className="space-y-2">
          {activeStops
            .filter((s) => s.binId !== 'DEPOT-01')
            .map((stop) => {
              const isDone = completedStops.has(stop.binId);
              const isCurrent = currentStop?.binId === stop.binId;

              return (
                <div
                  key={stop.binId}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition text-xs ${
                    isDone
                      ? 'bg-slate-950/60 border-slate-800/80 text-slate-500 line-through'
                      : isCurrent
                      ? 'bg-cyan-950/30 border-cyan-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCurrent
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : stop.stopNumber}
                    </span>
                    <div>
                      <span className="font-bold block">{stop.binName}</span>
                      <span className="text-[10px] text-slate-400">{stop.address}</span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-[11px]">{stop.fillLevel}%</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Report Incident Modal */}
      {incidentOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Report Field Incident
              </h3>
              <button
                onClick={() => setIncidentOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {incidentReported ? (
              <div className="p-4 text-center text-emerald-400 space-y-1">
                <CheckCircle className="w-8 h-8 mx-auto" />
                <p className="text-xs font-bold">Incident Dispatched to Municipal Supervisor</p>
              </div>
            ) : (
              <form onSubmit={submitIncident} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Hazard Category</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-slate-950 text-white p-2 rounded-lg border border-slate-700"
                  >
                    <option value="ROAD_BLOCKED">Road Blocked / Construction</option>
                    <option value="DAMAGED_LID">Damaged Bin / Broken Lid</option>
                    <option value="HAZARDOUS_SPILL">Chemical / Medical Waste Spill</option>
                    <option value="FIRE_SMOKE">Smoke / Fire Detected in Bin</option>
                    <option value="SENSOR_VANDALIZED">Ultrasonic Sensor Missing / Vandalized</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Driver Notes</label>
                  <textarea
                    rows={2}
                    value={incidentNote}
                    onChange={(e) => setIncidentNote(e.target.value)}
                    placeholder="Provide details for fleet supervisor..."
                    className="w-full bg-slate-950 text-white p-2 rounded-lg border border-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIncidentOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    Transmit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
