import { useState, type PointerEvent } from 'react'
import type { ParkingActivityDto } from '../../types/Dashboard/dashboard'

interface ActivityChartProps {
  data: ParkingActivityDto[]
  period: 7 | 30 | 90
}

const chartWidth = 760
const chartHeight = 248
const plot = { left: 40, right: 12, top: 16, bottom: 36 }
const plotWidth = chartWidth - plot.left - plot.right
const plotHeight = chartHeight - plot.top - plot.bottom

const parsePeriodDate = (value: string) =>
  new Date(value.length === 10 ? `${value}T12:00:00` : value)

const formatAxisDate = (value: string, period: number) =>
  new Intl.DateTimeFormat(undefined, period === 7
    ? { weekday: 'short' }
    : { month: 'short', day: 'numeric' },
  ).format(parsePeriodDate(value))

const formatTooltipDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(parsePeriodDate(value))

const ActivityChart = ({ data, period }: ActivityChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxValue = Math.max(1, ...data.map((point) => Math.max(point.checkInCount, point.checkOutCount)))
  const yMax = Math.ceil(maxValue / 20) * 20
  const xForIndex = (index: number) =>
    plot.left + (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth)
  const yForValue = (value: number) => plot.top + plotHeight - (value / yMax) * plotHeight
  const barSlot = plotWidth / Math.max(data.length, 1)
  const barWidth = Math.max(4, Math.min(18, barSlot * 0.28))
  const pathFor = (key: 'checkInCount' | 'checkOutCount') =>
    data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xForIndex(index)} ${yForValue(point[key])}`).join(' ')
  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * chartWidth
    const ratio = Math.min(1, Math.max(0, (x - plot.left) / plotWidth))
    setHoveredIndex(Math.round(ratio * (data.length - 1)))
  }
  const hoveredPoint = hoveredIndex === null ? null : data[hoveredIndex]
  const tickIndexes = Array.from({ length: Math.min(period === 7 ? 7 : 6, data.length) }, (_, index) =>
    Math.round(index * (data.length - 1) / (Math.min(period === 7 ? 7 : 6, data.length) - 1 || 1)),
  )
  const useBars = period === 7

  return (
    <div className="ps-chart">
      <div className="ps-chart-plot">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`Check-in and check-out counts over the last ${period} days`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="ps-in-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f6e6a" stopOpacity=".22" />
              <stop offset="100%" stopColor="#0f6e6a" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((fraction) => {
            const y = plot.top + plotHeight * fraction
            return (
              <g key={fraction}>
                <line x1={plot.left} y1={y} x2={chartWidth - plot.right} y2={y} className="ps-chart-grid" />
                <text x={plot.left - 8} y={y + 4} textAnchor="end" className="ps-chart-label">
                  {Math.round(yMax * (1 - fraction))}
                </text>
              </g>
            )
          })}
          {useBars
            ? data.map((point, index) => {
                const cx = xForIndex(index)
                const inH = plot.top + plotHeight - yForValue(point.checkInCount)
                const outH = plot.top + plotHeight - yForValue(point.checkOutCount)
                return (
                  <g key={point.periodDate}>
                    <rect
                      x={cx - barWidth - 1}
                      y={yForValue(point.checkInCount)}
                      width={barWidth}
                      height={inH}
                      rx="3"
                      className="ps-chart-bar in"
                    />
                    <rect
                      x={cx + 1}
                      y={yForValue(point.checkOutCount)}
                      width={barWidth}
                      height={outH}
                      rx="3"
                      className="ps-chart-bar out"
                    />
                  </g>
                )
              })
            : (
              <>
                <path d={`${pathFor('checkInCount')} L ${xForIndex(data.length - 1)} ${plot.top + plotHeight} L ${xForIndex(0)} ${plot.top + plotHeight} Z`} fill="url(#ps-in-fill)" />
                <path d={pathFor('checkInCount')} className="ps-chart-line in" />
                <path d={pathFor('checkOutCount')} className="ps-chart-line out" />
              </>
            )}
          {hoveredIndex !== null && (
            <line
              x1={xForIndex(hoveredIndex)}
              y1={plot.top}
              x2={xForIndex(hoveredIndex)}
              y2={plot.top + plotHeight}
              className="ps-chart-cross"
            />
          )}
          {tickIndexes.map((index) => (
            <text key={index} x={xForIndex(index)} y={chartHeight - 10} textAnchor="middle" className="ps-chart-label">
              {formatAxisDate(data[index].periodDate, period)}
            </text>
          ))}
        </svg>
        {hoveredPoint && (
          <div className="ps-chart-tip" role="status">
            <strong>{formatTooltipDate(hoveredPoint.periodDate)}</strong>
            <span><i className="in" /> In <b>{hoveredPoint.checkInCount}</b></span>
            <span><i className="out" /> Out <b>{hoveredPoint.checkOutCount}</b></span>
          </div>
        )}
      </div>
      <div className="ps-chart-legend">
        <span><i className="in" />Check-in</span>
        <span><i className="out" />Check-out</span>
        <em>{period} day window</em>
      </div>
    </div>
  )
}

interface OccupancyRingProps {
  unavailable: number
  available: number
  capacity: number
  rate: number
}

const OccupancyRing = ({ unavailable, available, capacity, rate }: OccupancyRingProps) => {
  const total = Math.max(1, capacity)
  const radius = 54
  const circ = 2 * Math.PI * radius
  const unavailableLen = (unavailable / total) * circ
  const availLen = (available / total) * circ

  return (
    <div className="ps-ring" role="img" aria-label={`${Math.round(rate)} percent occupancy`}>
      <svg viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} className="ps-ring-track" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="ps-ring-occ"
          strokeDasharray={`${unavailableLen} ${circ - unavailableLen}`}
          strokeDashoffset={circ * 0.25}
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="ps-ring-avail"
          strokeDasharray={`${availLen} ${circ - availLen}`}
          strokeDashoffset={circ * 0.25 - unavailableLen}
        />
      </svg>
      <div className="ps-ring-label">
        <strong>{Math.round(rate)}%</strong>
        <span>utilized</span>
      </div>
    </div>
  )
}

export { ActivityChart, OccupancyRing }
