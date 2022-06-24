import "./CirclePackingChart.scss";
import { useD3 } from "../../hooks/useD3";
import React from "react";
import * as d3 from "d3";
import Sidebar from "../Sidebar/Sidebar";
import { useDispatch } from "react-redux";
import { set } from "../../store/selectedCircleSlice";
import ErrorComponent from "../ErrorComponent/ErrorComponent";
const height = 820;
const width = 820;

// Component visualising the code metrics
// inspired by https://observablehq.com/@d3/zoomable-circle-packing

function CirclePackingChart(data) {
  const dispatch = useDispatch();

  // creates circle packing
  const pack = (data_2) =>
    d3.pack().size([width, height]).padding(3)(
      d3
        .hierarchy(data_2)
        .sum((d) => d.value)
        .sort((x, y) => y.value - x.value)
    );

  const ref = useD3(
    (svg) => {
      // delete chart on re render
      d3.selectAll("g > *").remove();
      const root = pack(data.data);
      let focus = root;
      let view;

      const minValue = Math.min(...root.leaves().map((d) => d.data.color));
      const maxValue = Math.max(...root.leaves().map((d) => d.data.color)) + 1;

      const color = d3
        .scaleSequential(d3.interpolateRgb("green", "red"))
        .domain([minValue, maxValue]);

      svg = d3.select(ref.current).on("click", (event) => zoom(event, root));

      var node_rs = null;

      // create circles for every file
      const node = svg
        .append("g")
        .selectAll("circle")
        .data(root.descendants())
        .join("circle")
        .attr("fill", (d) => (d.children ? "#f0f0f0" : color(d.data.color)))
        .attr("stroke", (d) => (d.children ? "#000" : "#000"))
        .attr("stroke-width", (d) => (d.children ? "1px" : "0px"))
        .attr("stroke-opacity", (d) => (d.children ? "60%" : null))
        .style("cursor", "pointer")
        .on("mouseover", mouseover)
        .on("mouseout", mouseleave)
        .on("click", (event, d) => zoom(event, d));

      // create labels for every circle
      const labels = svg
        .append("g")
        .style("font-family", "sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", 1)
        .style("fill", "#000")
        .style("display", (d) => (d.parent === root ? "inline" : "none"))
        .style("font-size", calcFontSize)
        .text(calcText);

      changeViewOnZoom([root.x, root.y, root.r * 2]);

      var node_rs = null;

      // create array of radius, important for recalculating font while zooming
      createRArray();

      // calculate font size depending on zoom
      function calcFontSize(d) {
        var r =
          node_rs !== null && node_rs[d.data.path] !== undefined
            ? node_rs[d.data.path]
            : d.r;
        var len = d.data.name.substring(0, r / 3).length;
        var size = ((r / 3) * 10) / len + 1;
        return Math.min(Math.round(size), 48) + "px";
      }

      // show text depending on zoom
      function calcText(d) {
        var r =
          node_rs !== null && node_rs[d.data.path] !== undefined
            ? node_rs[d.data.path]
            : d.r;
        var text = d.data.name.substring(0, r / 3);
        if (r / 3 < 2) text = "";
        return text;
      }

      function translateOnZoom(d) {
        const k = width / view[2];
        return `translate(${(d.x - view[0]) * k},${(d.y - view[1]) * k})`;
      }

      // changes view and transforms nodes and labels on zoom
      function changeViewOnZoom(v) {
        view = v;

        node.attr("r", (d) => d.r * (width / v[2]));
        node.attr("transform", translateOnZoom);

        labels.attr("transform", translateOnZoom);

        createRArray();
      }

      // handles zoom event
      function zoom(event, d) {
        if (focus !== d) {
          event.stopPropagation();
        }

        dispatch(set(d.data));

        focus = d;

        const transitionOnZoom = svg
          .transition()
          .duration(1000)
          .tween("zoom", () => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
            return (t) => changeViewOnZoom(i(t));
          });

        labels
          .filter(function (d) {
            return (
              d === focus ||
              d.parent === focus ||
              this.style.display === "inline"
            );
          })
          .transition(transitionOnZoom)
          .style("fill-opacity", (d) =>
            d.parent === focus || (d === focus && !d.children) ? 1 : 0
          )
          .on("start", function (d) {
            if (d.parent === focus || (d === focus && !d.children))
              this.style.display = "inline";
          })
          .on("end", function (d) {
            if (d.parent !== focus && d !== focus && d.children) {
              this.style.display = "none";
            }
          });
      }

      // creates array of radius and applies calcFontSzie and calcText to labels
      function createRArray() {
        node_rs = Object.assign(
          {},
          ...node.nodes().map((d) => ({
            [d.__data__.data.path]: d.attributes.r.value
              ? d.attributes.r.value
              : d.__data__.data.r,
          }))
        );

        labels
          .filter(function (d) {
            return (
              d === focus ||
              d.parent === focus ||
              this.style.display === "inline"
            );
          })
          .style("font-size", calcFontSize)
          .text(calcText);
      }

      // mouseover behaviour 
      function mouseover(d) {
        d3.select(this)
          .attr("fill", (d) => (d.children ? "lightgrey" : color(d.data.color)))
          .attr("stroke-width", "2px")
          .attr("stroke-opacity", "80%")
          .attr("box-shadow", "5px 10px 8px #888888");
      }

      // mouseleave behaviour
      function mouseleave(d) {
        d3.select(this)
          .attr("fill", (d) => (d.children ? "white" : color(d.data.color)))
          .attr("stroke-width", (d) => (d.children ? "1px" : "0px"))
          .attr("stroke-opacity", (d) => (d.children ? "60%" : null))
          .attr("box-shadow", "null");
      }
    },
    [data]
  );

  return (
    <div className="ChartCircle" id="CirclePackedChart">
      <Sidebar />
      {data.data.children.length === 0 ? (
        <ErrorComponent />
      ) : (
        <div className="chartSVG">
          <svg
            ref={ref}
            viewBox={`-800 -425 1600 850`}
            style={{
              marginRight: "0px",
              marginLeft: "0px",
            }}
          >
            <g className="plot-area" />
            <g className="x-axis" />
            <g className="y-axis" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default CirclePackingChart;
