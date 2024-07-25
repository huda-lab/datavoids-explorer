/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import { NarrativeLabel, NarrativeLabelColor } from "@/model/types";
import { ResultEntry } from "@/model/types";
import { dateFromDateISOString } from "@/lib/utils";

interface CollectionResultsPositionsProps {
  rawData: ResultEntry[] | null;
}

const CollectionResultsPositions: FC<CollectionResultsPositionsProps> = ({
  rawData,
}) => {
  const refPlot = useRef();
  const [plot, setPlot] = useState<{ svg: any; plotContainer: any } | null>(
    null,
  );

  // Plot Initializer
  useEffect(() => {
    const plot: { svg: any; plotContainer: any } = {
      svg: null,
      plotContainer: null,
    };
    plot.svg = d3.select(refPlot.current) as any;
    plot.plotContainer = plot.svg.append("g").attr("class", "container");

    // Adding labels
    plot.svg
      .append("text")
      .style("text-anchor", "middle")
      .classed("xaxis", true)
      .attr("font-size", "10px")
      .text("Timestamp");

    plot.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-size", "10px")
      .classed("yaxis", true)
      .text("Result rank");
    setPlot(plot);
  }, []);

  // Plot Updating function
  useEffect(() => {
    if (!plot || rawData === null) return;

    // Clear previous drawings
    plot.plotContainer.selectAll("*").remove();

    // Plot size
    const plotSize = plot.svg.node().getBoundingClientRect();
    const width = plotSize.width;
    const height = plotSize.height;

    // Define margins
    const margin = { top: 10, right: 0, bottom: 80, left: 40 };
    const effectiveWidth = width - margin.left - margin.right;
    const effectiveHeight = height - margin.top - margin.bottom;
    plot.plotContainer.attr(
      "transform",
      `translate(${margin.left},${margin.top})`,
    );

    // Unique dates and positions for scales
    const dates = Array.from(new Set(rawData.map((d) => d.date))).sort();
    const uniquePositions = Array.from(
      new Set(rawData.map((d) => d.position)),
    ).sort((a, b) => a - b);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(dates)
      .range([0, effectiveWidth])
      .padding(0.1);

    const yScale = d3
      .scaleBand()
      .domain(uniquePositions.map(String))
      .range([0, effectiveHeight])
      .padding(0.1);

    const colorScale = d3
      .scaleOrdinal()
      .domain([
        NarrativeLabel.NEUTRAL,
        NarrativeLabel.MITIGATOR,
        NarrativeLabel.DISINFORMATION,
        NarrativeLabel["N/A"],
        NarrativeLabel.ERROR,
      ])
      .range([
        NarrativeLabelColor.NEUTRAL,
        NarrativeLabelColor.MITIGATOR,
        NarrativeLabelColor.DISINFORMATION,
        NarrativeLabelColor["N/A"],
        NarrativeLabelColor.ERROR,
      ]);

    // Axes
    const dateFormat = d3.timeFormat("%d-%m-%Y");
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d: string) => dateFormat(new Date(d)));
    const yAxis = d3.axisLeft(yScale).tickFormat((d: number) => `${d}`);

    // Draw rectangles
    plot.plotContainer
      .selectAll("rect")
      .data(rawData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.date))
      .attr("y", (d) => yScale(String(d.position)))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.label));

    // Append axes to the container
    plot.plotContainer
      .append("g")
      .attr("transform", `translate(0,${effectiveHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.6em")
      .attr("transform", "rotate(-90)");

    plot.plotContainer.append("g").call(yAxis);

    // Adding labels
    plot.svg
      .select(".xaxis")
      .attr(
        "transform",
        `translate(${effectiveWidth / 2 + margin.left},${height - 5})`,
      );

    plot.svg
      .select(".yaxis")
      .attr("y", 0)
      .attr("x", 0 - (effectiveHeight / 2 + margin.top));
  }, [rawData, plot]);

  return (
    <div className="flex min-h-[35rem] w-full flex-col">
      <svg ref={refPlot} className="w-full grow"></svg>
      <div className="flex flex-row-reverse gap-2">
        {Object.keys(NarrativeLabel)
          .filter((key) => key != NarrativeLabel.ERROR)
          .map((key) => (
            <div key={key} className="mr-2 flex items-center">
              <div
                className="mr-1 inline-block h-2 w-2 border border-solid border-gray-200"
                style={{ backgroundColor: NarrativeLabelColor[key] }}
              ></div>
              <div>{key}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CollectionResultsPositions;
