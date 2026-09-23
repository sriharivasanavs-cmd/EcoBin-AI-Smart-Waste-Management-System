import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Code,
  Flame,
  Mail,
  MessageSquare,
  Radio,
  Trash2,
  Wind,
  Zap,
} from 'lucide-react';
import { AlertItem, SmartBin } from '../types';

interface AlertsViewProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onTriggerAnomaly: (type: 'FIRE' | 'GAS' | 'OVERFLOW') => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onTriggerAnomaly,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'UNRESOLVED'>('ALL');
  const [activePayloadAlert, setActivePayloadAlert] = useState<AlertItem | null>(null);

  const displayedAlerts = alerts.filter((a) => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'UNRESOLVED') return !a.resolved;
    return true;
  });

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'FIRE_RISK':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'GAS_LEAK':
        return <Wind className="w-4 h-4 text-purple-400" />;
      case 'OVERFLOW':
        return <Trash2 className="w-4 h-4 text-amber-400" />;
      case 'LOW_BATTERY':
        return <AlertCircle className="w-4 h-4 text-cyan-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Municipal Alert & Incident Center</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              Real-Time Dispatch Feed
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-sensor rule evaluation engine monitoring fill overflow, toxic gas leaks, smoldering fire spikes, and IoT node dropouts.
          </p>
        </div>

        {/* Anomaly Simulation Triggers */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold px-2">Inject Incident:</span>
          <button
            onClick={() => onTriggerAnomaly('FIRE')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5" /> Fire Spike (52°C)
          </button>
          <button
            onClick={() => onTriggerAnomaly('GAS')}
            className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold border border-purple-500/30 transition flex items-center gap-1"
          >
            <Wind className="w-3.5 h-3.5" /> Gas Odor (380ppm)
          </button>
          <button
            onClick={() => onTriggerAnomaly('OVERFLOW')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30 transition flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Overflow (98%)
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Critical Only ({alerts.filter((a) => a.severity === 'CRITICAL').length})
          </button>
          <button
            onClick={() => setFilter('UNRESOLVED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'UNRESOLVED'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Resolution ({alerts.filter((a) => !a.resolved).length})
          </button>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {displayedAlerts.length > 0 ? (
          displayedAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alert.resolved
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    : isCritical
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-rose-950/20'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical ? 'bg-rose-500/20 border border-rose-500/40' : 'bg-slate-800'
                    }`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-white">{alert.binName}</span>
                      <span className="font-mono text-xs text-slate-400">({alert.binId})</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      {alert.resolved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{alert.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Triggered: {alert.timestamp} • Zone: {alert.zone}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActivePayloadAlert(alert)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5"
                    title="View SMS/Webhook Payload"
                  >
                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Payload</span>
                  </button>

                  {!alert.acknowledged && !alert.resolved && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
                    >
                      Acknowledge
                    </button>
                  )}

                  {!alert.resolved && (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                    >
                      Resolve & Clear
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-70" />
            <p className="text-sm font-bold text-slate-300">All Municipal Sensors Nominal</p>
            <p className="text-xs text-slate-500">No active incidents require intervention.</p>
          </div>
        )}
      </div>

      {/* Notification Payload Inspector Modal */}
      {activePayloadAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Simulated Dispatch Payload Schema</span>
              </h3>
              <button
                onClick={() => setActivePayloadAlert(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Twilio SMS Payload:
                </span>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800">
                  {JSON.stringify(
                    {
                      to: '+1 (555) 019-4820',
                      from: '+1 (555) 992-ECOS',
                      body: `[MUNICIPAL ALERT] ${activePayloadAlert.severity}: ${activePayloadAlert.binName} (${activePayloadAlert.binId}) triggered ${activePayloadAlert.type}. Action required immediately.`,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Municipal Webhook JSON (311 City Services):
                </span>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800">
                  {JSON.stringify(
                    {
                      event: 'SMART_BIN_ANOMALY',
                      bin_id: activePayloadAlert.binId,
                      type: activePayloadAlert.type,
                      severity: activePayloadAlert.severity,
                      timestamp: activePayloadAlert.timestamp,
                      coordinates: {
                        lat: 37.7749,
                        lng: -122.4194,
                      },
                      auto_dispatch_truck: activePayloadAlert.severity === 'CRITICAL',
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActivePayloadAlert(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
