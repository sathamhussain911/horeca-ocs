interface Props {
  value: number // 0-100
  color?: string
  height?: number
  showLabel?: boolean
}

export function ProgressBar({ value, color = 'var(--green3)', height = 5, showLabel = false }: Props) {
  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
          <span>Progress</span>
          <span style={{ color: value === 100 ? 'var(--green)' : 'var(--text2)' }}>{value}%</span>
        </div>
      )}
      <div className="progress-bar" style={{ height }}>
        <div
          className="progress-fill"
          style={{ width: `${Math.min(100, value)}%`, background: color }}
        />
      </div>
    </div>
  )
}
