import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { SmartBin } from '../types';

interface ReportsViewProps {
  bins: SmartBin[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ bins }) => {
  const [reportPeriod, setReportPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

  // Aggregate metrics
  const totalBins = bins.length;
  const criticalCount = bins.filter((b) => b.fillLevel >= 80).length;
  const avgFill = Math.round(bins.reduce((acc, b) => acc + b.fillLevel, 0) / totalBins);
  const totalCapacityLiters = bins.reduce((acc, b) => acc + b.capacityLiters, 0);
  const estimatedWasteCurrentKg = Math.round(
    bins.reduce((acc, b) => acc + (b.fillLevel / 100) * 45, 0)
  );

  // Download real CSV function
  const handleExportCsv = () => {
    const headers = [
      'Bin_ID',
      'Name',
      'Zone',
      'Address',
      'Fill_Level_Percent',
      'Capacity_Liters',
      'Temperature_C',
      'Gas_PPM',
      'Battery_Percent',
      'Lid_Status',
      'Fill_Rate_PerHour',
      'Status',
      'Latitude',
      'Longitude',
    ];

    const rows = bins.map((b) => [
      b.id,
      `"${b.name}"`,
      `"${b.zone}"`,
      `"${b.address}"`,
      b.fillLevel,
      b.capacityLiters,
      b.temperature,
      b.gasPpm,
      b.battery,
      b.lidStatus,
      b.fillRatePerHour,
      b.status,
      b.lat,
      b.lng,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ecosort_smart_bins_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Municipal Audit & Sustainability Reports</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              ISO 14001 Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Export official collection manifests, carbon offsets, landfill diversion ratios, and sensor diagnostics.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <span className="text-xs text-slate-400 block mb-1">City Fleet Efficiency</span>
          <div className="text-2xl font-black text-white">92.4%</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% vs Static Routing
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <span className="text-xs text-slate-400 block mb-1">Total Carbon Avoided</span>
          <div className="text-2xl font-black text-emerald-400">1,420 kg</div>
          <span className="text-[10px] text-slate-400 font-mono">Equivalent to 62 trees</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <span className="text-xs text-slate-400 block mb-1">Landfill Diversion Ratio</span>
          <div className="text-2xl font-black text-cyan-400">68.5%</div>
          <span className="text-[10px] text-emerald-400">Target: 65% (Achieved)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <span className="text-xs text-slate-400 block mb-1">Active Smart Nodes</span>
          <div className="text-2xl font-black text-purple-400">
            {totalBins} <span className="text-xs text-slate-500 font-normal">/ {totalBins} Online</span>
          </div>
          <span className="text-[10px] text-emerald-400">99.8% IoT Uptime</span>
        </div>
      </div>

      {/* Zone Performance Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              District Analytics
            </span>
            <h3 className="text-sm font-bold text-white">Waste Generation by Municipal Zone</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Zone District</th>
                <th className="p-3">Bins</th>
                <th className="p-3">Avg Fill Level</th>
                <th className="p-3">Peak Fill Window</th>
                <th className="p-3">Dominant Category</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="p-3 font-bold text-white">Downtown Commercial</td>
                <td className="p-3">5 Bins</td>
                <td className="p-3 font-mono text-amber-400">76%</td>
                <td className="p-3 text-slate-400">12:00 PM – 2:00 PM (Lunch)</td>
                <td className="p-3 text-cyan-300">Recyclable (PET/Cartons)</td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    High Demand
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">University Campus</td>
                <td className="p-3">4 Bins</td>
                <td className="p-3 font-mono text-emerald-400">52%</td>
                <td className="p-3 text-slate-400">11:00 AM & 4:00 PM</td>
                <td className="p-3 text-emerald-300">Organic (Food Waste)</td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Normal
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Industrial Logistics</td>
                <td className="p-3">4 Bins</td>
                <td className="p-3 font-mono text-rose-400">82%</td>
                <td className="p-3 text-slate-400">5:00 PM – 7:00 PM (Shift End)</td>
                <td className="p-3 text-orange-300">Hazardous / E-Waste</td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                    Urgent Pickup
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Waterfront Esplanade</td>
                <td className="p-3">3 Bins</td>
                <td className="p-3 font-mono text-emerald-400">41%</td>
                <td className="p-3 text-slate-400">Weekends (Saturday 2 PM)</td>
                <td className="p-3 text-cyan-300">Recyclable (Al Cans)</td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Optimal
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
