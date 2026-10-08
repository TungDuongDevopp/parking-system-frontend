import type { AbpError } from '../types/Apb/abp'

export const getAbpErrorMessage = (error: AbpError | null, fallback: string): string => {
    const validationMessages = error?.validationErrors
        ?.map(({ message }) => message.trim())
        .filter(Boolean)

    if (validationMessages?.length) {
        return validationMessages.join('\n')
    }

    return error?.details || error?.message || fallback
}
