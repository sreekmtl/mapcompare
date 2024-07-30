/**
 * JS file for creating charts and plots
 */

import * as d3 from 'd3';

export function createCovarianceChart(data){

    let min= Math.min(...data);
    let max=Math.max(...data);
    

    var margin={
        top:30, right:30, bottom:30, left:30
    };
    var width= 360-margin.left-margin.right;
    var height= 360-margin.top-margin.bottom;

    var svg= d3.select("#chart").append("svg")
                .attr("width", width+margin.left+margin.right)
                .attr("height", height+margin.top+margin.bottom)
                .append("g")
                .attr("transform","translate("+margin.left+","+margin.top+")");

    var labels= Array.from({length:300},(v,i)=>i+1);


    //creating x and y axis

    var x= d3.scaleBand().range([0,width]).domain(labels);
    svg.append("g").call(d3.axisTop(x).tickValues(d3.range(x.domain()[0], x.domain()[299], 50)));
    var y= d3.scaleBand().range([0,height]).domain(labels);
    svg.append("g").call(d3.axisLeft(y).tickValues(d3.range(x.domain()[0], x.domain()[299], 50)));
    

    //create color map

    var colorMap= d3.scaleLinear().range(["red", "green"]).domain([min,max]);

    
    let i=0, j=0;
    let xp, yp;
    svg.selectAll().data(data, function(v){

        //v is here each element in data. Therefore we have to take x-y coordinates of each v. Then use that for mapping to correct position
        
        //write logic to divide data here
    }).enter().append("rect")
      .attr("x", function(v){

        if (i<width){
            xp= i;
        }else if(i>=width && i<data.length) {
            xp= i%width;
        }
        i++;
        return xp;
    })
      .attr("y", function(v){
        if (j<width){
            yp= 0;
        }else if(j>=width && j<data.length) {
            yp= Math.floor(j/width);
        }
        j++;
        return yp
    })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function(v){
        return colorMap(v)
    })

    console.log(i,'i');


}

export function createLineChart(data){

   
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 400 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scaleLinear()
                        .domain([1, d3.max(data, d => d.bufferWidth)])
                        .range([0, width]);

        const yScale = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d.percentageInBuffer)])
                        .range([height, 0]);

        const line = d3.line()
                    .x(d => xScale(d.bufferWidth))
                    .y(d => yScale(d.percentageInBuffer));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.bufferWidth))
            .attr("cy", d => yScale(d.percentageInBuffer))
            .attr("r", 5)
            .attr("fill", "steelblue");
}