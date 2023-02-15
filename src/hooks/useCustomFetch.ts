import { useCallback, useContext } from "react"
import { AppContext } from "../utils/context"
import { EndpointCacheKey, fakeFetch, RegisteredEndpoints } from "../utils/fetch"
import { useWrappedRequest } from "./useWrappedRequest"

export function useCustomFetch() {
  const { cache } = useContext(AppContext)
  const { loading, wrappedRequest } = useWrappedRequest()

  const fetchWithCache = useCallback(
    async <TData, TParams extends object = object>(
      endpoint: RegisteredEndpoints,
      params?: TParams
    ): Promise<TData | null> =>
      wrappedRequest<TData>(async () => {
        const cacheKey = getCacheKey(endpoint, params)
        const cacheResponse = cache?.current.get(cacheKey)

        if (cacheResponse) {
          const data = JSON.parse(cacheResponse)
          return data as Promise<TData>
        }

        const result = await fakeFetch<TData>(endpoint, params)
        cache?.current.set(cacheKey, JSON.stringify(result))
        return result
      }),
    [cache, wrappedRequest]
  )

  const fetchWithoutCache = useCallback(
    async <TData, TParams extends object = object>(
      endpoint: RegisteredEndpoints,
      params?: TParams
    ): Promise<TData | null> =>
      wrappedRequest<TData>(async () => {
        const result = await fakeFetch<TData>(endpoint, params)
        return result
      }),
    [wrappedRequest]
  )

  const clearCache = useCallback(() => {
    if (cache?.current === undefined) {
      return
    }

    cache.current = new Map<string, string>()
  }, [cache])

  /*
   **  Will clear cache of regeistered endpoint.
   **  Updated type to accept params after endpoint name.
   */
  const clearCacheByEndpoint = useCallback(
    (endpointsToClear: EndpointCacheKey[]) => {
      if (cache?.current === undefined) {
        return
      }

      const cacheKeys = Array.from(cache.current.keys())

      for (const key of cacheKeys) {
        const clearKey = endpointsToClear.some((endpoint) => key.startsWith(endpoint))

        if (clearKey) {
          cache.current.delete(key)
        }
      }
    },
    [cache]
  )

  /*
   **  Used to properly update transactions in bug 7.
   **  Will encode the endpoint name with additional params
   **  as the key string that would be cached.
   */
  const getCacheKey = (endpoint: RegisteredEndpoints, params?: object): EndpointCacheKey =>
    `${endpoint}${params ? `@${JSON.stringify(params)}` : ""}`

  return { fetchWithCache, fetchWithoutCache, clearCache, clearCacheByEndpoint, getCacheKey, loading }
}
