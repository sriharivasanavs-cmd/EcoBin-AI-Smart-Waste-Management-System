export type WasteCategory = 'Recyclable' | 'Organic' | 'Hazardous' | 'E-Waste' | 'General';

export type BinStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'COLLECTING' | 'EMPTIED';

export type UserRole = 'ADMIN' | 'COLLECTOR';

export interface TelemetryPoint {
  timestamp: string;
  fillLevel: number;
  temperature: number;
  gasPpm: number;
}

export interface SmartBin {
  id: string;
  name: string;
  zone: string;
  address: string;
  lat: number;
  lng: number;
  mapX: number; // percentage 0-100 for SVG map
  mapY: number; // percentage 0-100 for SVG map
  fillLevel: number; // 0 - 100%
  capacityLiters: number;
  temperature: number; // Celsius
  gasPpm: number; // Air quality / odor / methane in ppm
  battery: number; // 0 - 100%
  lidStatus: 'OPEN' | 'CLOSED';
  lastEmptied: string;
  fillRatePerHour: number; // % increase per hour
  status: BinStatus;
  history: TelemetryPoint[];
  categoryWeightEstimateKg?: number;
}

export interface WasteClassificationResult {
  category: WasteCategory;
  confidence: number;
  material: string;
  recyclable: boolean;
  disposalMethod: string;
  contaminationRisk: 'Low' | 'Medium' | 'High';
  carbonSavedKg: number;
  modelUsed: string;
  analysisNotes?: string;
}

export interface AlertItem {
  id: string;
  binId: string;
  binName: string;
  zone: string;
  type: 'OVERFLOW' | 'GAS_LEAK' | 'FIRE_RISK' | 'LOW_BATTERY' | 'LID_OPEN';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface RouteStop {
  stopNumber: number;
  binId: string;
  binName: string;
  zone: string;
  address: string;
  fillLevel: number;
  estimatedWeightKg: number;
  distanceFromPreviousKm: number;
  cumulativeDistanceKm: number;
  collected: boolean;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
}

export interface RouteOptimizationResult {
  stops: RouteStop[];
  totalDistanceKm: number;
  baselineDistanceKm: number;
  distanceSavedKm: number;
  fuelSavedLiters: number;
  co2SavedKg: number;
  costSavedUsd: number;
  algorithmUsed: 'OR-Tools (Guided Local Search)' | 'Greedy Nearest Neighbor' | 'Genetic Algorithm';
  executionTimeMs: number;
  totalWasteCollectedKg: number;
}

export interface MLModelMetrics {
  name: string;
  type: string;
  mae: number;
  rmse: number;
  r2Score: number;
  latencyMs: number;
  params: string;
  pros: string;
}

export interface PythonProjectFile {
  id: string;
  name: string;
  category: 'Core Pipeline' | 'ML & AI' | 'Simulation & IoT' | 'Dashboard & API' | 'Documentation & Viva';
  description: string;
  code: string;
  content?: string;
  language: string;
}
