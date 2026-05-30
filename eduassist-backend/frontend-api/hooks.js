/**
 * EduAssist React API Hooks
 * Place at: frontend/src/hooks/useApi.js
 *
 * These hooks wrap the API client with loading/error state management.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { aiAPI, pdfAPI, cvAPI, filesAPI, dashboardAPI, authAPI } from '../api/client';

// ── Generic async hook ────────────────────────────────────────────────────────
export function useAsync(asyncFn, immediate = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn(...args);
      if (mountedRef.current) setData(result);
      return result;
    } catch (e) {
      if (mountedRef.current) setError(e.message);
      throw e;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [asyncFn]);

  useEffect(() => { if (immediate) execute(); }, []); // eslint-disable-line

  return { data, loading, error, execute, setData };
}

// ── AI hooks ──────────────────────────────────────────────────────────────────

/**
 * Hook for generating AI study content.
 *
 * Usage:
 *   const { generate, loading, results, error, progress } = useAiGenerate();
 *   await generate({ inputText: '...', requestedTypes: ['summary', 'mcq'] });
 */
export function useAiGenerate() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [meta, setMeta] = useState(null);

  const generate = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);
      setProgress(0);

      const res = await aiAPI.generate({ ...params, onProgress: setProgress });
      setResults(res.results);
      setSessionId(res.sessionId);
      setMeta(res.meta);
      return res;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setProgress(0);
    setSessionId(null);
  }, []);

  return { generate, loading, results, error, progress, sessionId, meta, reset };
}

/**
 * Hook for AI session history.
 */
export function useAiHistory(params = {}) {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (fetchParams = {}) => {
    try {
      setLoading(true);
      const res = await aiAPI.getHistory({ ...params, ...fetchParams });
      setSessions(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (id) => {
    await aiAPI.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s._id !== id));
  }, []);

  const saveSession = useCallback(async (id, saved) => {
    const res = await aiAPI.updateSession(id, { saved });
    setSessions((prev) => prev.map((s) => s._id === id ? res.session : s));
  }, []);

  useEffect(() => { fetch(); }, []);

  return { sessions, pagination, loading, error, fetch, deleteSession, saveSession };
}

// ── PDF hooks ─────────────────────────────────────────────────────────────────

/**
 * Hook for PDF tool operations.
 *
 * Usage:
 *   const { run, loading, result, error, progress } = usePdfTool('imageToPdf');
 */
export function usePdfTool(tool) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const run = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setProgress(0);

      const handler = pdfAPI[tool];
      if (!handler) throw new Error(`Unknown PDF tool: ${tool}`);

      // Inject progress callback as last arg if the tool supports it
      const res = await handler(...args, setProgress);
      setResult(res);
      return res;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [tool]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return { run, loading, result, error, progress, reset };
}

// ── CV hooks ──────────────────────────────────────────────────────────────────

/**
 * Hook for managing a single CV (create/update).
 */
export function useCv(cvId = null) {
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(!!cvId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cvId) return;
    (async () => {
      try {
        const res = await cvAPI.get(cvId);
        setCv(res.cv);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [cvId]);

  const save = useCallback(async (data) => {
    try {
      setSaving(true);
      let res;
      if (cvId || cv?._id) {
        res = await cvAPI.update(cvId || cv._id, data);
      } else {
        res = await cvAPI.create(data);
      }
      setCv(res.cv);
      return res.cv;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }, [cvId, cv]);

  const exportPdf = useCallback(async () => {
    if (!cv?._id) throw new Error('Save CV first');
    await cvAPI.exportPdf(cv._id);
  }, [cv]);

  return { cv, loading, saving, error, save, exportPdf, setCv };
}

/**
 * Hook for CV list.
 */
export function useCvList() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await cvAPI.list();
        setCvs(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remove = useCallback(async (id) => {
    await cvAPI.delete(id);
    setCvs((prev) => prev.filter((c) => c._id !== id));
  }, []);

  return { cvs, loading, error, remove };
}

// ── Dashboard hook ────────────────────────────────────────────────────────────

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardAPI.overview();
        setData(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

// ── Auth hook ─────────────────────────────────────────────────────────────────

export function useProfile() {
  const { data, loading, error, execute } = useAsync(authAPI.me, true);
  const update = useCallback(
    (updates) => authAPI.updateProfile(updates).then(() => execute()),
    [execute]
  );
  return { user: data?.user, loading, error, update };
}
