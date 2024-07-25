/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import { NarrativeLabel, NarrativeLabelColor } from "@/model/types";
import { ResultEntry } from "@/model/types";

interface CollectionResultsRevRankProps {
  rawData: ResultEntry[] | null;
}

const CollectionResultsRevRank: FC<CollectionResultsRevRankProps> = ({
  rawData,
}) => {
  const refPlot = useRef();
  const [plot, setPlot] = useState<{ svg: any; plotContainer: any } | null>(
    null,
  );

  /*
    Transform the data given as:
      {
        label: "NEUTRAL",
        date: "2019-02-28T20:00:00Z",
        position: 0,
      },
      {
        label: "MITIGATOR",
        date: "2019-02-29T20:00:00Z",
        position: 1,
      },
      ...
    in an object for each label:
    {
      MITIGATOR: [1, 2, 3, 4],
      DISINFORMATION: [1, 4, 2, 7],
      NEUTRAL: [1, 6, 6, 3],
    }
    where position i in each array represents a date, and the value is the reverse rank
    of all results for that date
    For example if at a certain date there are three entries for MITIGATOR ad position
    1, 3, 7 then its reverse rank is going to be (1/1 + 1/3 + 1/7)
   */
  function revRank() {
    if (rawData === null) return;

    const dataByDateAndLabel: {
      [date: string]: { [label: string]: number[] };
    } = {};
    const dates = Array.from(new Set(rawData.map((d) => d.date))).sort();
    for (const date of dates) {
      if (!dataByDateAndLabel[date]) {
        dataByDateAndLabel[date] = {};
        for (const label in NarrativeLabel) {
          dataByDateAndLabel[date][label] = [];
        }
      }
    }

    rawData.forEach((e) => {
      if (!e.label) {
        return; // data is not labeled yet
      }
      dataByDateAndLabel[e.date][e.label].push(e.position);
    });
    const res: { [label: string]: number[] } = {};
    for (const label in NarrativeLabel) {
      res[label] = [];
    }
    for (const date of dates) {
      Object.keys(NarrativeLabel).forEach((label) => {
        const positions = dataByDateAndLabel[date][label];
        if (positions.length === 0) {
          res[label].push(0);
        } else {
          res[label].push(positions.reduce((acc, p) => acc + 1 / p, 0));
        }
      });
    }
    return res;
  }

  // Plot Initializer
  useEffect(() => {
    const plot: { svg: any; plotContainer: any } = {
      svg: null,
      plotContainer: null,
    };
    plot.svg = d3.select(refPlot.current);
    plot.plotContainer = d3
      .select(refPlot.current)
      .append("g")
      .attr("class", "container");

    plot.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-size", "10px")
      .classed("yaxis", true)
      .text("Inverse rank");

    setPlot(plot);
  }, []);

  // Plot Updating function
  useEffect(() => {
    if (!plot || rawData === null) return;

    plot.plotContainer.selectAll("*").remove();

    // Setting up scales
    const plotSize = plot.svg.node().getBoundingClientRect();
    const width = plotSize.width;
    const height = plotSize.height;

    // Define margins
    const margin = { top: 10, right: 0, bottom: 10, left: 40 };
    const effectiveWidth = width - margin.left - margin.right;
    const effectiveHeight = height - margin.top - margin.bottom;
    plot.plotContainer.attr(
      "transform",
      `translate(${margin.left},${margin.top})`,
    );

    // Data
    const data = revRank();
    // Calculating the max value across all datasets for the y-axis domain
    const maxData = Math.max(...Object.values(data).flat());

    // Unique dates and positions for scales
    const dates = Array.from(new Set(rawData.map((d) => d.date))).sort();
    const xScale = d3
      .scaleBand()
      .domain(dates) // Setting domain as all unique dates
      .range([0, effectiveWidth])
      .padding(0.1); // Optional, for spacing between bands
    // Since scaleBand returns the start of the band, we need to adjust to center the line:
    const xPoint = (date) => xScale(date) + xScale.bandwidth() / 2;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxData])
      .range([effectiveHeight, 0]);

    // Axes
    const dateFormat = d3.timeFormat("%d-%m-%Y");
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d: string) => dateFormat(new Date(d)));

    const line = d3
      .line()
      .x((d, i) => xPoint(dates[i]))
      .y((d) => yScale(d));

    // Draw lines for each category
    plot.plotContainer.select("path").remove();
    Object.entries(data).forEach(([key, value]) => {
      plot.plotContainer
        .append("path")
        .datum(value)
        .attr("fill", "none")
        .attr("stroke", NarrativeLabelColor[key])
        .attr("stroke-width", 2)
        .attr("d", line);
    });

    plot.plotContainer
      .append("g")
      .attr("transform", `translate(0,${effectiveHeight})`)
      .call(xAxis)
      .selectAll("text")
      .remove();
      // no ticks for the x axis
      // to add for debug only since is displayed in the plot below:
      // .selectAll("text")
      // .style("text-anchor", "end")
      // .attr("dx", "-.8em")
      // .attr("dy", "-0.6em")
      // .attr("transform", "rotate(-90)");

    plot.plotContainer.append("g").call(d3.axisLeft(yScale));

    plot.svg
      .select(".yaxis")
      .attr("y", 0)
      .attr("x", 0 - (effectiveHeight / 2 + margin.top));
  }, [rawData, plot]);

  return (
    <div className="w-full">
      <svg ref={refPlot} className="w-full"></svg>
    </div>
  );
};

export default CollectionResultsRevRank;
