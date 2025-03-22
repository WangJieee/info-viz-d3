'use client'

import {useState, useEffect} from 'react'
import {csv} from 'd3'

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  const fullYear = year < 50 ? 2000 + year : 1900 + year; // Adjust for 2-digit year
  return `${fullYear}-${month}-${day}`
};

const useData = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await csv("./notable_ai_models_clean.csv", (d) => ({
        ...d,
        Country: d.Country.split(',')[0] || 'others',
        Date: parseDate(d['Publication date']), 
        Domain: d.Domain.split(',')[0]
      }));
      setData(res)
    }

    fetchData()
  }, [])

  return {data}
}

export {useData}
