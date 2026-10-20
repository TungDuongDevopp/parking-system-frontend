import type { AbpError } from '../types/Apb/abp'

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

const findMatchingField = <Field extends string>(value: string, fields: Record<Field, readonly string[]>) =>
    (Object.keys(fields) as Field[])
        .map((field) => ({
            field,
            matchLength: Math.max(
                0,
                ...fields[field]
                    .map(normalize)
                    .filter((alias) => normalize(value).includes(alias))
                    .map((alias) => alias.length),
            ),
        }))
        .filter(({ matchLength }) => matchLength > 0)
        .sort((first, second) => second.matchLength - first.matchLength)[0]?.field

export const mapAbpFieldErrors = <Field extends string>(
    error: AbpError | null,
    fields: Record<Field, readonly string[]>,
): FieldErrors<Field> => {
    const fieldErrors: FieldErrors<Field> = {}
    const validationErrors = error?.validationErrors ?? []

    for (const validationError of validationErrors) {
        for (const member of validationError.members) {
            const field = findMatchingField(member, fields)
            if (field && validationError.message.trim()) {
                fieldErrors[field] = validationError.message.trim()
            }
        }
    }

    if (Object.keys(fieldErrors).length === 0) {
        const message = [
            error?.message,
            error?.details,
            ...validationErrors.map(({ message: validationMessage }) => validationMessage),
        ].filter(Boolean).join(' ')
        const field = findMatchingField(message, fields)
        if (field) {
            fieldErrors[field] = validationErrors[0]?.message.trim() || error?.details || error?.message || ''
        }
    }

    return fieldErrors
}

export const mapMessageToFieldErrors = <Field extends string>(
    message: string,
    fields: Record<Field, readonly string[]>,
): FieldErrors<Field> => {
    const field = findMatchingField(message, fields)
    const errors: FieldErrors<Field> = {}
    if (field) errors[field] = message
    return errors
}
