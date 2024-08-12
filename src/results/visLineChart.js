/**
 * Line charts for visualizing:
 * color-Hue
 * color-saturation
 * color-lightness
 */

import * as d3 from 'd3';

export function createLineGraph(clr,comp,chart,[xTitle,yTitle]){


    //graph code

var margin = { top: 30, right: 30, bottom: 120, left: 60 };
var width = 450 - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;


var svg = d3.select(chart).append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


const x = d3.scalePoint()
    .domain(clr)
    .range([0, width]);


const y = d3.scaleLinear()
    .domain([0, d3.max(comp)])
    .nice()
    .range([height, 0]);


const line = d3.line()
    .x((d, i) => x(clr[i]))
    .y(d => y(d));


svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text") 
    .style("text-anchor", "end") 
    .attr("dx", "-0.8em") 
    .attr("dy", "0.15em") 
    .style("font", "10px times")
    .attr("transform", "rotate(-90)");
    
svg.append("g")
    .attr("transform", `translate(0,${height + 40})`)
    .append("text")
    .attr("fill", "#000")
    .attr("x", width / 2)
    .attr("y", 60)
    .attr("text-anchor", "middle")
    .style("font-size", "14px") 
    .style("font-weight","bold")
    .text(xTitle);


svg.append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("dy", "0.71em")
    .attr("text-anchor", "middle")
    .style("font-size", "14px") 
    .style("font-weight","bold")
    .text(yTitle);



svg.append("path")
    .datum(comp)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);
    
svg.selectAll("circle")
    .data(comp)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => x(clr[i]))
    .attr("cy", d => y(d))
    .attr("r", 5)
    .attr("fill", "steelblue");

}

