import type { AbpError, AbpResponse } from '../types/Apb/abp'
import { getAbpErrorMessage } from './abpError'

export class ApiServiceError extends Error {
    readonly abpError: AbpError | null
    readonly status: number | null

    constructor(message: string, abpError: AbpError | null = null, status: number | null = null) {
        super(message)
        this.name = 'ApiServiceError'
        this.abpError = abpError
        this.status = status
    }
}

const parseResponse = async <T>(
    response: Response,
    fallback: string,
    allowEmptyBody: boolean,
): Promise<AbpResponse<T> | null> => {
    const body = await response.text()
    if (!body.trim()) {
        if (allowEmptyBody && response.ok) return null
        throw new ApiServiceError(
            response.ok ? fallback : `${fallback} (HTTP ${response.status}).`,
            null,
            response.status,
        )
    }

    let result: AbpResponse<T>
    try {
        result = JSON.parse(body) as AbpResponse<T>
    } catch {
        throw new ApiServiceError(
            response.ok ? `Invalid server response: ${fallback}` : `${fallback} (HTTP ${response.status}).`,
            null,
            response.status,
        )
    }

    if (!response.ok || !result.success) {
        throw new ApiServiceError(
            getAbpErrorMessage(result.error, response.ok ? fallback : `${fallback} (HTTP ${response.status}).`),
            result.error,
            response.status,
        )
    }

    return result
}

export function readAbpResult<T>(
    response: Response,
    fallback: string,
    allowNullResult: true,
): Promise<T | null>
export function readAbpResult<T>(
    response: Response,
    fallback: string,
    allowNullResult?: false,
): Promise<T>
export async function readAbpResult<T>(
    response: Response,
    fallback: string,
    allowNullResult = false,
): Promise<T | null> {
    const result = await parseResponse<T>(response, fallback, false)
    if (!result || (!allowNullResult && result.result === null)) {
        throw new ApiServiceError(fallback, result?.error ?? null, response.status)
    }
    return result.result
}

export const readAbpVoid = async (response: Response, fallback: string): Promise<void> => {
    await parseResponse<null>(response, fallback, true)
}

export const getAbpErrorFromException = (error: unknown): AbpError | null =>
    error instanceof ApiServiceError ? error.abpError : null
