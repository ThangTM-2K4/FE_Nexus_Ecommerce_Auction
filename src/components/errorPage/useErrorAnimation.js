import { useEffect, useState } from 'react';

export function useErrorAnimation({ animationData, animationSrc }) {
  const [data, setData] = useState(animationData ?? null);
  const [loading, setLoading] = useState(Boolean(animationSrc && !animationData));

  useEffect(() => {
    if (animationData) {
      setData(animationData);
      setLoading(false);
      return undefined;
    }

    if (!animationSrc) {
      setData(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    fetch(animationSrc)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [animationData, animationSrc]);

  return { animationData: data, loading };
}
