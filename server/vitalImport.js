import { readFile } from 'node:fs/promises'

export const privateDirectory = new URL('./private/', import.meta.url)
export async function readVitalImport() {
  try { return JSON.parse(await readFile(new URL('vital-info.json', privateDirectory), 'utf8')) }
  catch (error) { if (error.code === 'ENOENT') return null; throw error }
}

// Preserve existing care notes and edits; append only previously unseen cards.
export function mergeVitalImport(vital, imported) {
  if (!imported || (vital.insuranceImports || []).includes(imported.importId)) return vital
  const records = vital.insurance || []
  const ids = new Set(records.map(record => record.id))
  return {
    ...vital,
    insurance: [...records, ...imported.insurance.filter(record => !ids.has(record.id))],
    insuranceImports: [...(vital.insuranceImports || []), imported.importId],
  }
}
