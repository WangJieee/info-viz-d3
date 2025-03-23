'use client'

import React, { useEffect, useRef, useState } from "react"
import { useData } from '@/hooks/useData'
import * as d3 from "d3"
import RangeSlider from 'react-range-slider-input'
import 'react-range-slider-input/dist/style.css'

const StackedAreaChart = () => {
  const { data } = useData()
  const width = 800
  const height = 500
  const margin = { top: 40, right: 20, bottom: 50, left: 60 }
  const svgRef = useRef()
  const [yearRange, setYearRange] = useState([1949, 2025])
  const [minY, maxY] = yearRange
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    if (!data) return
    const svg = d3.select(svgRef.current)

    // Draw axes
    svg.select(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.select(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    // Draw stacked area
    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));

    svg.select(".areas").selectAll("path")
      .data(series)
      .join("path")
      .attr("d", area)
      .attr("fill", d => colorScale(d.key))
      .attr("opacity", d => selectedDomain === null || selectedDomain === d.key ? 0.7 : 0.2)
  }, [data, minY, maxY, selectedDomain]);

  if (!data) return 'Loading...'

  // Process data for stacked area chart
  const parsedData = data.map(d => ({
    ...d,
    Date: new Date(d.Date)
  })).filter(d => d.Date.getFullYear() >= yearRange[0] && d.Date.getFullYear() <= yearRange[1])

  const domains = Array.from(new Set(parsedData.map(d => d.Domain)));
  const years = Array.from(new Set(parsedData.map(d => d.Date.getFullYear()))).sort((a, b) => a - b);

  const stackedData = d3.groups(parsedData, d => d.Date.getFullYear(), d => d.Domain)
    .map(([year, domainData]) => {
      const domainCounts = Object.fromEntries(domains.map(domain => [domain, 0]));
      domainData.forEach(([domain, models]) => {
        domainCounts[domain] = models.length;
      });
      return { year: year, ...domainCounts };
    });

  const stack = d3.stack().keys(domains);
  const series = stack(stackedData);

  // Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(years))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .range([height - margin.bottom, margin.top]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10.concat(d3.schemeSet3))
    .domain(domains);
  
  const onRangeChange = (v) => {
    setYearRange(v)
  }

  return (
    <div className="flex flex-col max-w-[860px]">
      <h2>Number of AI Models Published Over the Years by Domain</h2>
      <div className="self-center w-[300px] pt-[20px] relative flex justify-items-center items-center ml-[300px]">
        <span className="mr-[10px] whitespace-nowrap font-bold">Year Range:</span>
        <RangeSlider min={1949} max={2025} value={yearRange} onInput={onRangeChange}/>
        <span className="absolute top-[40px] left-[90px]">1950</span>
        <span className="absolute top-[40px] right-[-20px]">2025</span>
      </div>
      <svg ref={svgRef} width={width} height={height}>
        <g className="x-axis" />
        <g className="y-axis" />
        <g className="areas" />
        <text x={width-20} y={height-20} textAnchor="end">Year</text>
        <text x={margin.left/2} y={30} textAnchor="start">Number of AI models</text>
      </svg>
      <div>Click on legend to filter by domain: </div>
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "4px" }}>
        {Array.from(colorScale.domain()).map((domain, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", marginRight: "10px" }} 
              onClick={() => {
                setSelectedDomain(selectedDomain === domain ? null : domain)
              }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: colorScale(domain), marginRight: "5px" }}></div>
            <span>{domain}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { StackedAreaChart }