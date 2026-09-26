"use client";

import { useCallback, useEffect, useState } from "react";
import type { InterviewListResponse } from "@/types/interview";

interface UseInterviewsResult {
  data: InterviewListResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInterviews(queryString: string): UseInterviewsResult {
  const [data, setData] = useState<InterviewListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const requestKey = `${queryString}|${reloadKey}`;
  const [prevRequestKey, setPrevRequestKey] = useState(requestKey);

  if (requestKey !== prevRequestKey) {
    setPrevRequestKey(requestKey);
    setIsLoading(true);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/interviews?${queryString}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error ?? json.message ?? "Failed to load interviews");
        }
        if (!cancelled) {
          setData(json.data as InterviewListResponse);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load interviews");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryString, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, isLoading, error, refetch };
}
