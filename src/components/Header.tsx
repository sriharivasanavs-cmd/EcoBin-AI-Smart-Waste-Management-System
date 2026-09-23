import React from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  Download,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Truck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  simRunning: boolean;
  setSimRunning: (running: boolean) => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  simClock: string;
  activeAlertCount: number;
  onStepSim: () => void;
  onResetSim: () => void;
  onDownloadZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  simRunning,
  setSimRunning,
  simSpeed,
  setSimSpeed,
  simClock,
  activeAlertCount,
  onStepSim,
  onResetSim,
  onDownloadZip,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40">
              <span className="text-xl">♻️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">EcoSort AI</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Smart City IoT
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Gemini Enabled
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Final-Year IoT, Computer Vision & TSP Route Optimizer
              </p>
            </div>
          </div>

          {/* Simulation Controls & Ticker */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline text-slate-400">Sim:</span>
              <span className="text-emerald-300 font-semibold">{simClock}</span>
            </div>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={() => setSimRunning(!simRunning)}
              title={simRunning ? 'Pause simulation' : 'Play simulation'}
              className={`p-1.5 rounded-md text-xs font-medium transition ${
                simRunning
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
              }`}
            >
              {simRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onStepSim}
              title="Step +15 minutes"
              className="p-1.5 rounded-md text-xs bg-slate-700/70 hover:bg-slate-700 text-slate-300 border border-slate-600/50"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Speed Multiplier */}
            <select
              value={simSpeed}
              onChange={(e) => setSimSpeed(Number(e.target.value))}
              className="bg-slate-900 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value={1}>1x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
              <option value={20}>20x</option>
            </select>
          </div>

          {/* User Role Switcher & Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Alert Indicator */}
            <button
              onClick={() => setCurrentTab('alerts')}
              className={`relative p-2 rounded-lg transition border ${
                activeAlertCount > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={`${activeAlertCount} active alerts`}
            >
              <AlertTriangle className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Role Switcher */}
            <div className="flex bg-slate-800/90 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setUserRole('ADMIN')}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                  userRole === 'ADMIN'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => {
                  setUserRole('COLLECTOR');
                  setCurrentTab('collector');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                  userRole === 'COLLECTOR'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Collector</span>
              </button>
            </div>

            {/* Quick Download Full Project ZIP */}
            <button
              onClick={onDownloadZip}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition border border-emerald-400/30"
              title="Download complete runnable Python project as ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Python Project (.zip)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-800/80 overflow-x-auto py-2 text-xs font-medium scrollbar-none">
          {[
            { id: 'dashboard', label: 'Overview & Map', icon: '🗺️' },
            { id: 'classifier', label: 'AI Waste Classifier (CV)', icon: '📷' },
            { id: 'predictor', label: 'ML Fill Predictor', icon: '📈' },
            { id: 'route', label: 'TSP Route Optimizer', icon: '🚛' },
            { id: 'collector', label: 'Collector Mobile Mode', icon: '📱' },
            { id: 'alerts', label: `Alerts (${activeAlertCount})`, icon: '🚨' },
            { id: 'reports', label: 'Reports & CSV', icon: '📑' },
            { id: 'codehub', label: 'Python Source Code & Viva Hub', icon: '💻' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition flex items-center gap-1.5 ${
                currentTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
