/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Bell,
  Camera,
  CheckCircle,
  Clock,
  Compass,
  Download,
  Filter,
  Flame,
  Gauge,
  HelpCircle,
  Layers,
  MapPin,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Thermometer,
  Trash2,
  TrendingUp,
  Truck,
  Wind,
  Zap,
} from 'lucide-react';

import { SmartBin, AlertItem, RouteStop, RouteOptimizationResult, UserRole } from './types';
import { MOCK_SMART_BINS, INITIAL_ALERTS, FLEET_DEPOT } from './data/mockBins';
import { Header } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import { WasteClassifierView } from './components/WasteClassifierView';
import { PredictionView } from './components/PredictionView';
import { RouteOptimizerView } from './components/RouteOptimizerView';
import { CollectorMobileView } from './components/CollectorMobileView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { PythonProjectHub } from './components/PythonProjectHub';
import { downloadProjectAsZip } from './utils/zipExport';

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');

  // Core Data State
  const [bins, setBins] = useState<SmartBin[]>(MOCK_SMART_BINS);
  const [selectedBin, setSelectedBin] = useState<SmartBin | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Active Routing State
  const [activeRouteStops, setActiveRouteStops] = useState<RouteStop[]>([]);
  const [truckProgress, setTruckProgress] = useState<number>(0);

  // Simulation Clock & Engine State
  const [simRunning, setSimRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(5);
  const [simMinutes, setSimMinutes] = useState<number>(14 * 60 + 30); // 14:30
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  // Format Sim Clock
  const hours = Math.floor((simMinutes / 60) % 24);
  const mins = Math.floor(simMinutes % 60);
  const simClockStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

  // Active Alert Count
  const activeAlertCount = alerts.filter((a) => !a.resolved).length;

  // Real-Time Simulation Loop
  useEffect(() => {
    if (!simRunning) return;

    const interval = setInterval(() => {
      // Step simulation clock
      setSimMinutes((prev) => prev + 1);

      // Advance truck progress if route is active
      if (activeRouteStops.length > 1) {
        setTruckProgress((prev) => {
          const next = prev + 0.006 * simSpeed;
          return next >= 1 ? 0 : next;
        });
      }

      // Natural fill level accumulation
      setBins((prevBins) =>
        prevBins.map((bin) => {
          // Fill level increments gradually
          const increment = (bin.fillRatePerHour / 60) * (simSpeed / 5);
          const newFill = Math.min(100, Math.round((bin.fillLevel + increment) * 10) / 10);

          // Small natural temperature fluctuation
          const tempDelta = (Math.random() - 0.48) * 0.05;
          const newTemp = Math.round((bin.temperature + tempDelta) * 10) / 10;

          // Gas accumulation if fill is high
          let newGas = bin.gasPpm;
          if (newFill > 70) {
            newGas = Math.min(450, bin.gasPpm + Math.round(Math.random() * 2));
          }

          // Check if overflow threshold crossed (>= 80%) to auto-trigger alert
          if (bin.fillLevel < 80 && newFill >= 80) {
            triggerAlert({
              id: `ALT-AUTO-${Date.now()}`,
              binId: bin.id,
              binName: bin.name,
              zone: bin.zone,
              type: 'OVERFLOW',
              severity: 'CRITICAL',
              message: `Ultrasonic sensor detects fill level at ${newFill}% - immediate collection required.`,
              timestamp: simClockStr,
              acknowledged: false,
              resolved: false,
            });
          }

          const status =
            newFill >= 80 ? 'CRITICAL' : newFill >= 60 ? 'WARNING' : 'NORMAL';

          return {
            ...bin,
            fillLevel: newFill,
            temperature: newTemp,
            gasPpm: newGas,
            status,
          };
        })
      );
    }, 1000 / simSpeed);

    return () => clearInterval(interval);
  }, [simRunning, simSpeed, activeRouteStops.length, simClockStr]);

  // Trigger helper for alerts
  const triggerAlert = (newAlert: AlertItem) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Step Simulation Manually (+15 mins)
  const handleStepSim = () => {
    setSimMinutes((prev) => prev + 15);
    setBins((prev) =>
      prev.map((b) => ({
        ...b,
        fillLevel: Math.min(100, Math.round((b.fillLevel + (b.fillRatePerHour * 0.25)) * 10) / 10),
      }))
    );
  };

  // Reset Simulation
  const handleResetSim = () => {
    setBins(MOCK_SMART_BINS);
    setAlerts(INITIAL_ALERTS);
    setSimMinutes(14 * 60 + 30);
    setTruckProgress(0);
  };

  // Empty a Bin
  const handleEmptyBin = (binId: string) => {
    setBins((prev) =>
      prev.map((b) =>
        b.id === binId
          ? {
              ...b,
              fillLevel: 0,
              gasPpm: 90,
              temperature: 20.5,
              status: 'NORMAL',
              lastEmptied: `Today at ${simClockStr}`,
            }
          : b
      )
    );

    // Auto resolve alerts for this bin
    setAlerts((prev) =>
      prev.map((a) => (a.binId === binId ? { ...a, resolved: true } : a))
    );

    if (selectedBin?.id === binId) {
      setSelectedBin((prev) => (prev ? { ...prev, fillLevel: 0, status: 'NORMAL' } : null));
    }
  };

  // Dispatch Route from Optimizer
  const handleDispatchRoute = (stops: RouteStop[], result: RouteOptimizationResult) => {
    setActiveRouteStops(stops);
    setTruckProgress(0);
    setCurrentTab('dashboard');
  };

  // Inject Anomaly for viva testing
  const handleTriggerAnomaly = (type: 'FIRE' | 'GAS' | 'OVERFLOW') => {
    const targetBin = bins[Math.floor(Math.random() * bins.length)];
    if (!targetBin) return;

    if (type === 'FIRE') {
      setBins((prev) =>
        prev.map((b) => (b.id === targetBin.id ? { ...b, temperature: 52.4, status: 'CRITICAL' } : b))
      );
      triggerAlert({
        id: `ALT-FIRE-${Date.now()}`,
        binId: targetBin.id,
        binName: targetBin.name,
        zone: targetBin.zone,
        type: 'FIRE_RISK',
        severity: 'CRITICAL',
        message: `EMERGENCY: DHT22 sensor detected abnormal heat spike at 52.4°C inside ${targetBin.name}!`,
        timestamp: simClockStr,
        acknowledged: false,
        resolved: false,
      });
    } else if (type === 'GAS') {
      setBins((prev) =>
        prev.map((b) => (b.id === targetBin.id ? { ...b, gasPpm: 385, status: 'CRITICAL' } : b))
      );
      triggerAlert({
        id: `ALT-GAS-${Date.now()}`,
        binId: targetBin.id,
        binName: targetBin.name,
        zone: targetBin.zone,
        type: 'GAS_LEAK',
        severity: 'CRITICAL',
        message: `MQ-135 sensor detected hazardous volatile gas/methane accumulation at 385 ppm!`,
        timestamp: simClockStr,
        acknowledged: false,
        resolved: false,
      });
    } else {
      setBins((prev) =>
        prev.map((b) => (b.id === targetBin.id ? { ...b, fillLevel: 98, status: 'CRITICAL' } : b))
      );
      triggerAlert({
        id: `ALT-OVF-${Date.now()}`,
        binId: targetBin.id,
        binName: targetBin.name,
        zone: targetBin.zone,
        type: 'OVERFLOW',
        severity: 'CRITICAL',
        message: `Severe container overflow at 98% capacity with sidewalk spillage risk.`,
        timestamp: simClockStr,
        acknowledged: false,
        resolved: false,
      });
    }
  };

  // Alerts acknowledge & resolve
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  // Add custom smart bin via map click
  const handleAddBin = (newBin: Partial<SmartBin>) => {
    setBins((prev) => [...prev, newBin as SmartBin]);
  };

  // Filtered bins for table
  const filteredBins = bins.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.address.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesZone = zoneFilter === 'ALL' || b.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  // Unique zones
  const zones = ['ALL', ...Array.from(new Set(bins.map((b) => b.zone)))];

  // Dashboard Stats Calculations
  const totalBinsCount = bins.length;
  const criticalBins = bins.filter((b) => b.fillLevel >= 80);
  const warningBins = bins.filter((b) => b.fillLevel >= 60 && b.fillLevel < 80);
  const normalBins = bins.filter((b) => b.fillLevel < 60);
  const averageFill = Math.round(bins.reduce((acc, b) => acc + b.fillLevel, 0) / totalBinsCount);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        simRunning={simRunning}
        setSimRunning={setSimRunning}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        simClock={simClockStr}
        activeAlertCount={activeAlertCount}
        onStepSim={handleStepSim}
        onResetSim={handleResetSim}
        onDownloadZip={downloadProjectAsZip}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Overview & Interactive City Map */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top KPI Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Total Bins */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Smart Bins Online</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{totalBinsCount} Nodes</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>100% MQTT Connected</span>
                </div>
              </div>

              {/* City Average Fill */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Mean Fill Level</span>
                  <Gauge className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white">{averageFill}%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    style={{ width: `${averageFill}%` }}
                  />
                </div>
              </div>

              {/* Critical Bins Overflow */}
              <div
                onClick={() => setCurrentTab('alerts')}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md cursor-pointer hover:border-rose-500/40 transition"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Critical Overflow</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400">
                  {criticalBins.length}{' '}
                  <span className="text-xs font-normal text-slate-400">(&ge;80%)</span>
                </div>
                <span className="text-[11px] text-rose-400 font-semibold mt-1 block">
                  {criticalBins.length > 0 ? 'Urgent dispatch required' : 'All capacities safe'}
                </span>
              </div>

              {/* Truck Route Status */}
              <div
                onClick={() => setCurrentTab('route')}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md cursor-pointer hover:border-cyan-500/40 transition"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Active Collection</span>
                  <Truck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-cyan-300">
                  {activeRouteStops.length > 0 ? '1 In Transit' : 'Idle at Depot'}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {activeRouteStops.length > 0
                    ? `${activeRouteStops.length} manifest stops`
                    : 'Ready for optimization'}
                </span>
              </div>

              {/* Carbon Reduction */}
              <div
                onClick={() => setCurrentTab('reports')}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md cursor-pointer hover:border-teal-500/40 transition col-span-2 lg:col-span-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>CO₂ Avoided</span>
                  <span className="text-xs">🌱</span>
                </div>
                <div className="text-2xl font-black text-emerald-400">1,420 kg</div>
                <span className="text-[11px] text-emerald-300 font-mono mt-1 block">
                  -38% route diesel burn
                </span>
              </div>
            </div>

            {/* Interactive Vector Smart City Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Metropolitan IoT Sensor Network (Real-Time Coordinates)
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  Click any smart bin node to inspect live telemetry or empty container.
                </span>
              </div>

              <InteractiveMap
                bins={bins}
                selectedBin={selectedBin}
                onSelectBin={setSelectedBin}
                onEmptyBin={handleEmptyBin}
                activeRouteStops={activeRouteStops}
                truckProgress={truckProgress}
                onAddBin={handleAddBin}
              />
            </div>

            {/* Quick Feature Launchpad Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                onClick={() => setCurrentTab('classifier')}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950/40 border border-blue-900/40 hover:border-blue-500/60 shadow-lg cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Camera className="w-5 h-5" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-bold text-sm text-white">AI Waste Classifier</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test webcam or benchmark images for Recyclable, Organic, Hazardous sorting.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('predictor')}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-900/40 hover:border-purple-500/60 shadow-lg cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-bold text-sm text-white">ML Fill-Level Predictor</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Forecast container overflow 6h to 24h ahead using Random Forest & LSTM.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('route')}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-900/40 hover:border-cyan-500/60 shadow-lg cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Compass className="w-5 h-5" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-bold text-sm text-white">TSP Route Optimizer</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Solve Traveling Salesperson Problem with OR-Tools for 35%+ fuel savings.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('codehub')}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-900/40 hover:border-emerald-500/60 shadow-lg cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
                </div>
                <h3 className="font-bold text-sm text-white">Viva Voce Defense Hub</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Top 10 examiner Q&As, 12-slide presentation script, and Python zip download.
                </p>
              </div>
            </div>

            {/* Smart Bins Telemetry Data Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Bin Telemetry Logs (MQTT Stream)</h3>
                  <p className="text-xs text-slate-400">
                    Showing real-time ultrasonic fill, temperature (DHT22), air quality (MQ-135), and lid status.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search bins..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="bg-slate-950 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 w-40 sm:w-48"
                    />
                  </div>

                  {/* Zone Filter */}
                  <select
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    className="bg-slate-950 text-xs text-slate-300 px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Bin ID</th>
                      <th className="p-3">Location & Zone</th>
                      <th className="p-3">Fill Level</th>
                      <th className="p-3 text-center">Temp (°C)</th>
                      <th className="p-3 text-center">Gas (MQ-135)</th>
                      <th className="p-3 text-center">Battery</th>
                      <th className="p-3 text-center">Lid</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {filteredBins.map((bin) => {
                      const isCrit = bin.fillLevel >= 80;
                      const isWarn = bin.fillLevel >= 60 && bin.fillLevel < 80;
                      return (
                        <tr
                          key={bin.id}
                          className="hover:bg-slate-800/60 cursor-pointer transition font-sans"
                          onClick={() => setSelectedBin(bin)}
                        >
                          <td className="p-3 font-mono font-bold text-white">{bin.id}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-200 block">{bin.name}</span>
                            <span className="text-[11px] text-slate-400">{bin.address} • {bin.zone}</span>
                          </td>
                          <td className="p-3 font-mono">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
                                }`}
                              >
                                {bin.fillLevel}%
                              </span>
                              <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    isCrit ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${bin.fillLevel}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono">
                            <span className={bin.temperature > 35 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                              {bin.temperature}°C
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono">
                            <span className={bin.gasPpm > 250 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                              {bin.gasPpm} ppm
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-slate-400">{bin.battery}%</td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                bin.lidStatus === 'OPEN'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {bin.lidStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmptyBin(bin.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                            >
                              Empty
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Waste Classifier */}
        {currentTab === 'classifier' && <WasteClassifierView />}

        {/* Tab 3: ML Fill-Level Predictor */}
        {currentTab === 'predictor' && <PredictionView bins={bins} />}

        {/* Tab 4: TSP Route Optimizer */}
        {currentTab === 'route' && (
          <RouteOptimizerView bins={bins} onDispatchRoute={handleDispatchRoute} />
        )}

        {/* Tab 5: Collector Mobile Mode */}
        {currentTab === 'collector' && (
          <CollectorMobileView
            activeStops={activeRouteStops}
            onMarkEmptied={handleEmptyBin}
            bins={bins}
          />
        )}

        {/* Tab 6: Alerts & Incident Response */}
        {currentTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onTriggerAnomaly={handleTriggerAnomaly}
          />
        )}

        {/* Tab 7: Reports & Analytics */}
        {currentTab === 'reports' && <ReportsView bins={bins} />}

        {/* Tab 8: Python Code & Viva Hub */}
        {currentTab === 'codehub' && (
          <PythonProjectHub onDownloadZip={downloadProjectAsZip} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI-Powered Smart Waste Management System • Final-Year Engineering Project</span>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setCurrentTab('codehub')} className="hover:text-emerald-400 transition">
              Python Source Files
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('classifier')} className="hover:text-emerald-400 transition">
              MobileNetV2 Vision
            </button>
            <span>•</span>
            <button onClick={downloadProjectAsZip} className="hover:text-emerald-400 transition font-bold text-emerald-400">
              Download Project ZIP (.zip)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
