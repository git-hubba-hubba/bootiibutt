import { useEffect, useState } from 'react'
import { initial } from '../data/initial'
export function useFamily() {
  const [data, setData] = useState(initial)
  const [status, setStatus] = useState('Connecting…')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    let localImportLoaded = false
    async function load() {
      try {
        const response = await fetch('/api/family')
        if (!response.ok) throw new Error('Unavailable')
        const next = await response.json()
        if(active) { setData(previous => previous.revision === next.revision ? previous : next); setStatus('MongoDB connected') }
      } catch {
        if(active) setStatus(previous => previous === 'Connecting…' ? 'Demo mode · changes stay in this session' : previous)
        if (!localImportLoaded) {
          try {
            const response = await fetch('/api/vital-import')
            if (!response.ok) return
            const imported = await response.json()
            if (!Array.isArray(imported.insurance)) return
            localImportLoaded = true
            if(active) setData(previous => {
              const existing = previous.vital.insurance || []
              const ids = new Set(existing.map(record => record.id))
              return {...previous, vital:{...previous.vital,insurance:[...existing,...imported.insurance.filter(record => !ids.has(record.id))]}}
            })
          } catch { /* The local API may also be offline. Keep the demo usable. */ }
        }
      }
    }
    load()
    const timer = setInterval(load,15000)
    return () => {active = false;clearInterval(timer)}
  }, [])
  async function update(next) {
    setError('')
    if (status === 'MongoDB connected') {
      try {
        const response = await fetch('/api/family', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
        const result = await response.json()
        if (!response.ok) {
          if(response.status === 409) { const latest = await fetch('/api/family'); if(latest.ok) setData(await latest.json()) }
          throw new Error(result.message || 'Your changes could not be saved. Please try again.')
        }
        setData(result);return true
      } catch (err) { setError(err.message); return false }
    }
    setData(next); return true
  }
  return { data, update, status, error }
}
