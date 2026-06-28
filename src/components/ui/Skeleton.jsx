import React from 'react'

export function Skeleton({ width = '100%', height = '20px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, ...style }}
      role="status"
      aria-label="Cargando..."
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <Skeleton width="40px" height="40px" style={{ borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton width="70%" height="18px" style={{ marginBottom: '6px' }} />
          <Skeleton width="40%" height="14px" />
        </div>
      </div>
      <Skeleton width="100%" height="14px" style={{ marginBottom: '6px' }} />
      <Skeleton width="80%" height="14px" />
    </div>
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
