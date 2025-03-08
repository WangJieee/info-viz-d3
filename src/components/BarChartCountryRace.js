'use client'

import {useState, useEffect, useRef} from 'react'
import { useData } from '@/hooks/useData'
import * as d3 from "d3"



const formatDate = d3.utcFormat("%Y")
function formatCountry(c) {
  if (c === 'United Kingdom of Great Britain and Northern Ireland') {
    return 'U.K.'
  }

  if (c === 'United States of America') {
    return 'U.S.A.'
  }

  if (c === 'Korea (Republic of)') {
    return 'South Korea'
  }

  return c
}

const BarChartCountryRace = () => {
  const {data} = useData()
  const svgRef = useRef()
  
  const [keyframes, setKeyframes] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [isReplay, setIsReplay] = useState(false)

  const countriesRef = useRef()
  const n = countriesRef.current?.size || 0
  const barSize = 42
  const marginTop = 0
  const marginRight = 0
  const marginBottom = 50
  const marginLeft = 10
  const width = 750
  const height = 500
  const duration = 100

  useEffect(() => {
    if (!data) return
    const countries = new Set(data.map(d => d.Country))
    countriesRef.current = countries

    const datevalues = Array.from(d3.rollup(data, (D) => D.length, d => d.Date, d => d.Country))
      .map(([date, data]) => [new Date(date), data])
      .sort(([a], [b]) => d3.ascending(a, b))

    function rank(input, value) {
      const data = Array.from(input, country => ({country, value: value[country] || 0}));
      data.sort((a, b) => d3.descending(a.value, b.value));
      for (let i = 0; i < data.length; ++i) data[i].rank = i;
      return data;
    }
    const keyframes = [];
    const countryCount = {}
    datevalues.forEach(([date, data]) => {
      Array.from(data).forEach(([country, count]) => {
        countryCount[country] = countryCount[country] ? countryCount[country] + count : count
      })
    
      keyframes.push([
        date,
        rank(countries, countryCount)
      ])
    })

    setKeyframes(keyframes);
  }, [data]);


  useEffect(() => {
    if (keyframes.length === 0) return;
    let index = 0
    if (isReplay) {
      index = 0
      setIsReplay(false)
    }
    function animate() {
      if (index >= keyframes.length) return;
      setCurrentFrame(keyframes[index++]);
      setTimeout(animate, duration);
    }
    animate();
  }, [keyframes, isReplay]);

  const onReplay = () => {
    setIsReplay(true)
  }


  useEffect(() => {
    d3.selectAll("rect")
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)

    d3.selectAll("text.label")
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)
  }, [currentFrame]);

  if (!data) return 'Loading ...'


  const x = d3.scaleLinear().range([marginLeft, width])
  const y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([marginTop, marginTop + barSize * (n + 1 + 0.1)])
    .padding(0.1)


  if (!currentFrame) return <div>Loading...</div>
  const [currentDate, rankedData] = currentFrame
  x.domain([0, d3.max(rankedData, d => d.value)+50 || 1])
  y.domain(rankedData.map(d => d.country))

  const colorScale = d3.scaleOrdinal(Array.from(new Set(d3.schemeSet3.concat(d3.schemeSet2).concat(d3.schemeAccent))))
    .domain(Array.from(new Set(data.map(d => d.Country))));

  const svg = d3.select(svgRef.current)

  svg.select(".x-axis")
    .attr("transform", `translate(0, ${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width/75));

  return (
    <div className="flex flex-col items-center justify-items-center">
      <h2 className="self-start">Top 10 Countries/Regions who Published Most AI Models </h2>
      <svg width={width} height={height} ref={svgRef}>
        <g className="x-axis" />
        <g transform={`translate(0,${marginTop})`}> 
          {rankedData.map(d => {
            if (d.value === 0 || d.rank > 9) return null
            return <g key={d.country}>
              <rect
                fill={colorScale(d.country)}
                x={x(0)}
                y={y(d.country)}
                height={y.bandwidth()}
                width={x(d.value)}
              />
              <text 
                x={x(d.value)+15} 
                y={y(d.country) + y.bandwidth() / 3} 
                textAnchor="start" 
                fontSize="12" 
                fontWeight="700" 
                dy="0.35em">
                {formatCountry(d.country)}
              </text>
              <text
                className="label"
                fontSize='10px'
                y={y(d.country) + y.bandwidth() / 3 * 2}
                x={x(d.value)+15}
                dy="0.3em"
                textAnchor="start"
              >
                {d.value}
              </text>
            </g>
          })}
          <text
            className="label"
            fontWeight="bold"
            fontSize='56px'
            y={300}
            x={400}
            dy="0.32em"
          >
            {formatDate(currentDate)}
          </text>
         
        </g>
        <text x={width} y={height-10} textAnchor="end">Number of AI models published</text>
      </svg>
      <button className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-full" onClick={onReplay}>
        Replay
      </button>
    </div>
  )
}

export { BarChartCountryRace }