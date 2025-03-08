'use client'

import {useState, useEffect, useRef} from "react";
import * as d3 from "d3";
import { useData } from "@/hooks/useData";

const ScatterPlot = () => {
  const { data } = useData()
  const svgRef = useRef()
  const tooltipRef = useRef()
  const [selectedDomain, setSelectedDomain] = useState(null)

  useEffect(() => {
    if(!data) return
    const svg = d3.select(svgRef.current)

    svg.select(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(width/80));

    svg.select(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
  }, [data]);

  if (!data) return "Loading..."

  const width = 800;
  const height = 600;
  const margin = { top: 40, right: 20, bottom: 50, left: 60 }
  

  let filteredData = data.filter((d) => d.Parameters != '' && d.DatasetSize != '' && d.DatasetSize != '0')
  filteredData.forEach(d => {
    d.Parameters = +d.Parameters
    d.DatasetSize = +d.DatasetSize
  })

  const xScale = d3.scaleLog()
    .domain([Math.min(...filteredData.map(d => d.DatasetSize)) * 0.9, Math.max(...filteredData.map(d => d.DatasetSize)) * 1.1])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLog()
    .domain([Math.min(...filteredData.map(d => d.Parameters)) * 0.9, Math.max(...filteredData.map(d => d.Parameters)) * 1.1])
    .range([height - margin.bottom, margin.top]);
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10.concat(d3.schemeDark2))
    .domain(Array.from(new Set(filteredData.map(d => d.Domain))));

  const showTooltip = (d) => {
    const tooltip = d3.select(tooltipRef.current)
    tooltip.style("visibility", "visible")
        .style("left", `${xScale(d.DatasetSize)+10}px`)
        .style("top", `${yScale(d.Parameters) + 20}px`)
        .html(`<b>${d.System}</b></br>
                Published date: ${d.Date}</br>
                #Params: ${d.Parameters}</br>
                #Data points: ${d.DatasetSize}`);
  }

  const hideTooltip = () => {
    const tooltip = d3.select(tooltipRef.current)
    tooltip.style("visibility", "hidden")
  }

  const onDataClick = (d) => {
    setSelectedDomain(d.Domain)
  }

  const onBackdropClick = (e) => {
    if (e.target.tagName !== 'circle') {
      setSelectedDomain(null)
    }
  }

  return (
    <div className="relative max-w-[860px]" onClick={(e) => onBackdropClick(e)}>
      <h2>AI Model Parameters vs. Dataset Size</h2>
      <div ref={tooltipRef} style={{
        position: "absolute",
        backgroundColor: "white",
        padding: "5px",
        border: "1px solid black",
        borderRadius: "8px",
        visibility: "hidden"
      }}></div>
      <svg ref={svgRef} width={width} height={height}>
        <g className="x-axis" />
        <g className="y-axis" />
        <g>
          {filteredData.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.DatasetSize)}
              cy={yScale(d.Parameters)}
              r={5}
              fill={!!selectedDomain && selectedDomain !== d.Domain ? 'gray': colorScale(d.Domain)}
              opacity={0.7}
              onMouseOver={() => showTooltip(d)}
              onMouseLeave={() => hideTooltip()}
              onClick={() => onDataClick(d)}
            />
          ))}
        </g>
        <text x={width / 2} y={height - 10} textAnchor="middle">Number of Data Points</text>
        <text x={0} y={280} transform="rotate(-90, 15, 280)" textAnchor="middle">Number of Parameters</text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}>
        {Array.from(colorScale.domain()).map((domain, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: colorScale(domain), marginRight: "5px" }}></div>
            <span>{domain}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ScatterPlot }
