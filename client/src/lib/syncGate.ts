/**
 * Sync Gate - Contract Version Enforcement
 * 
 * Compares backend specVersion to frontend expected version.
 * If mismatch or unhealthy -> READ_ONLY mode (GET allowed, mutations blocked)
 */

import { httpGet } from './http';

// Expected spec version from build-time env var
const EXPECTED_SPEC_VERSION = import.meta.env.VITE_SPEC_VERSION || 'v1';

export type SyncState = 'SYNCED' | 'READ_ONLY' | 'UNKNOWN';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  commit?: string;
  env: string;
  specVersion: string;
  sync: boolean;
}

export interface VersionResponse {
  apiVersion: string;
  specVersion: string;
  buildSha?: string;
}

export interface SyncGateState {
  state: SyncState;
  healthy: boolean;
  specMatch: boolean;
  backendVersion: string | null;
  expectedVersion: string;
  reason: string | null;
  checkedAt: Date | null;
}

// Global sync state
let syncGateState: SyncGateState = {
  state: 'UNKNOWN',
  healthy: false,
  specMatch: false,
  backendVersion: null,
  expectedVersion: EXPECTED_SPEC_VERSION,
  reason: 'Not checked yet',
  checkedAt: null,
};

// Subscribers for state changes
type SyncGateListener = (state: SyncGateState) => void;
const listeners: Set<SyncGateListener> = new Set();

export function subscribeSyncGate(listener: SyncGateListener): () => void {
  listeners.add(listener);
  listener(syncGateState); // Immediate callback with current state
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(listener => listener(syncGateState));
}

/**
 * Check backend health and version, update sync state
 */
export async function checkSyncGate(): Promise<SyncGateState> {
  try {
    // Fetch health endpoint
    const healthResult = await httpGet<HealthResponse>('/health');
    
    if (!healthResult.ok || !healthResult.data) {
      syncGateState = {
        state: 'READ_ONLY',
        healthy: false,
        specMatch: false,
        backendVersion: null,
        expectedVersion: EXPECTED_SPEC_VERSION,
        reason: healthResult.error?.error || 'Health check failed',
        checkedAt: new Date(),
      };
      notifyListeners();
      return syncGateState;
    }

    const health = healthResult.data;
    const isHealthy = health.status === 'ok' || health.status === 'degraded';
    const specMatch = health.specVersion === EXPECTED_SPEC_VERSION;

    if (!isHealthy) {
      syncGateState = {
        state: 'READ_ONLY',
        healthy: false,
        specMatch,
        backendVersion: health.specVersion,
        expectedVersion: EXPECTED_SPEC_VERSION,
        reason: `Service unhealthy: ${health.status}`,
        checkedAt: new Date(),
      };
    } else if (!specMatch) {
      syncGateState = {
        state: 'READ_ONLY',
        healthy: true,
        specMatch: false,
        backendVersion: health.specVersion,
        expectedVersion: EXPECTED_SPEC_VERSION,
        reason: `Spec version mismatch: expected ${EXPECTED_SPEC_VERSION}, got ${health.specVersion}`,
        checkedAt: new Date(),
      };
    } else {
      syncGateState = {
        state: 'SYNCED',
        healthy: true,
        specMatch: true,
        backendVersion: health.specVersion,
        expectedVersion: EXPECTED_SPEC_VERSION,
        reason: null,
        checkedAt: new Date(),
      };
    }

    notifyListeners();
    return syncGateState;
  } catch (error) {
    syncGateState = {
      state: 'READ_ONLY',
      healthy: false,
      specMatch: false,
      backendVersion: null,
      expectedVersion: EXPECTED_SPEC_VERSION,
      reason: error instanceof Error ? error.message : 'Unknown error',
      checkedAt: new Date(),
    };
    notifyListeners();
    return syncGateState;
  }
}

/**
 * Get current sync state
 */
export function getSyncGateState(): SyncGateState {
  return syncGateState;
}

/**
 * Check if mutations (POST/PUT/PATCH/DELETE) are allowed
 */
export function isMutationAllowed(): boolean {
  return syncGateState.state === 'SYNCED';
}

/**
 * Guard function for mutations - throws if not allowed
 */
export function guardMutation(operation: string): void {
  if (!isMutationAllowed()) {
    throw new Error(
      `Mutation blocked (${operation}): App is in READ_ONLY mode. ${syncGateState.reason || 'Unknown reason'}`
    );
  }
}

/**
 * Initialize sync gate on app boot
 */
export async function initSyncGate(): Promise<SyncGateState> {
  console.log('[SyncGate] Initializing...');
  const state = await checkSyncGate();
  console.log(`[SyncGate] State: ${state.state}`, state.reason ? `(${state.reason})` : '');
  return state;
}

