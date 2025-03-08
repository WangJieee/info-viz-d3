'use client'

import React from 'react'
import { useData } from '@/hooks/useData'
import { scaleBand, scaleLinear, max, rollup } from 'd3'

const BarChartCountry = () => {
  const {data} = useData()

  if(!data) {
    return <pre>Loading...</pre>
  }

  const width = 900
  const height = 600
  const margin = { top: 20, right: 200, bottom: 30, left: 140 };

  data.map(d => {
    d.Country = d.Country.split(',')[0]
    if (d.Country === 'United Kingdom of Great Britain and Northern Ireland') {
      d.Country = 'U.K.'
    }

    if (d.Country === 'United States of America') {
      d.Country = 'U.S.A.'
    }

  })
  let counts = rollup(data.filter(d => d.Country !== ''), (D) => D.length, (d) => d.Country);

  counts = Array.from(counts, ([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)

      
  const xScale = scaleLinear()
      .domain([0, max(counts, d => d.count)])
      .nice()
      .range([margin.left, width - margin.right]);

  const yScale = scaleBand()
    .domain(counts.map(d => d.country))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  return (
    <svg width={width} height={height}>
      {/* X-axis Label */}
      <text x={width / 2} y={20} textAnchor="middle" fontSize="14">
        Number of AI models developed by each country/region
      </text>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {counts.map((d) => {
          return <g key={d.country} transform={`translate(0, ${yScale(d.country)})`}>
            <rect
              x={0}
              y={0}
              width={xScale(d.count)}
              height={yScale.bandwidth()}
              fill="teal"
            />
            <text x={-5} y={yScale.bandwidth() / 2} textAnchor="end" fontSize="12" fontWeight="700" dy="0.35em">
              {d.country}
            </text>
            <text x={xScale(d.count) + 5} y={yScale.bandwidth() / 2} fontSize="12" dy="0.35em">
              {d.count}
            </text>
          </g>
        })}
      </g>
      
    </svg>
  )
}

export { BarChartCountry }