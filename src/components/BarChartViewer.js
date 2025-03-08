'use client'

import React from 'react'
import { useData } from '@/hooks/useData'
import { scaleBand, rollup, scaleLinear, max } from 'd3'

const BarChartViewer = () => {
  const {data} = useData()

  if(!data) {
    return <pre>Loading...</pre>
  }

  const width = 800
  const height = 500
  const margin = { top: 20, right: 200, bottom: 30, left: 120 };

  let counts = {}
  data.map(d => {
    const domains = d.Domain.split(',')
    domains.forEach(domain => {
      counts[domain] = counts[domain] ? counts[domain] + 1 : 1
    });
  })

  counts = Object.keys(counts).map(domain => ({ domain, count: counts[domain]}))
          .sort((a, b) => b.count - a.count)

      
  const xScale = scaleLinear()
      .domain([0, max(counts, d => d.count)])
      .nice()
      .range([margin.left, width - margin.right]);

  const yScale = scaleBand()
    .domain(counts.map(d => d.domain))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  return (
    <svg width={width} height={height}>
      {/* X-axis Label */}
      <text x={width / 2} y={20} textAnchor="middle" fontSize="14">
        Number of AI models under each domain
      </text>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {counts.map((d) => (
          <g key={d.domain} transform={`translate(0, ${yScale(d.domain)})`}>
            <rect
              x={0}
              y={0}
              width={xScale(d.count)}
              height={yScale.bandwidth()}
              fill="teal"
            />
            <text x={-5} y={yScale.bandwidth() / 2} textAnchor="end" fontSize="12" fontWeight="700" dy="0.35em">
              {d.domain}
            </text>
            <text x={xScale(d.count) + 5} y={yScale.bandwidth() / 2} fontSize="12" dy="0.35em">
              {d.count}
            </text>
          </g>
        ))}
      </g>
      
    </svg>
  )
}

export { BarChartViewer }