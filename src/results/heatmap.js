/**
 * JS file for creating heatmap showing distances between colors used in color scheme
 */

import * as d3 from 'd3';

export function createHeatMap(colorArray, distanceArray, chart){

    let dis= distanceArray.map(getEl);
    let min= Math.min(...dis);
    let max= Math.max(...dis);


    var margin={top:30, right:30, bottom:100, left:100}, width= 350-margin.left-margin.right,
        height= 350-margin.top-margin.bottom;

    var svg= d3.select(chart).append("svg").attr("width", width+margin.left+margin.right)
                .attr("height", height+margin.top+margin.bottom)
                .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
   
    var labelX= colorArray.map(stringify)
    var labelY= colorArray.map(stringify);

    var x= d3.scaleBand().range([0,width]).domain(labelX).padding(0.01);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text") 
    .style("text-anchor", "end") 
    .attr("dx", "-0.8em") 
    .attr("dy", "0.15em") 
    .style("font", "10px times")
    .attr("transform", "rotate(-90)"); 


    var y = d3.scaleBand().range([ height, 0 ]).domain(labelY).padding(0.01);
    svg.append("g")
    .style("font", "10px times")
    .call(d3.axisLeft(y));

    var colorScheme= d3.scaleLinear().range(["white","red"]).domain([min,max]);

    svg.selectAll().data(distanceArray, function(d){return d.c1+':'+d.c2})
        .enter().append('rect').attr("x", function(d){return x(d.c1)})
                                .attr("y",function(d) {return y(d.c2)})
                                .attr("width", x.bandwidth())
                                .attr("height", y.bandwidth())
                                .style("fill", function(d) {return colorScheme(d.dis)})
                                .append('text')
                                .attr("x", function(d){return x(d.c1)})
                                .attr("y",function(d) {return y(d.c2)})
                                .text(function(d) {return colorScheme(d.dis)})

    svg.selectAll().data(distanceArray, function(d) { return d.c1 + ':' + d.c2; })
                                .enter().append('text')
                                .attr("x", function(d) { return x(d.c1) + x.bandwidth() / 2; })
                                .attr("y", function(d) { return y(d.c2) + y.bandwidth() / 2; })
                                .attr("dy", ".35em") 
                                .attr("text-anchor", "middle") 
                                .text(function(d) { return d.dis.toFixed(2); })
                                .style("font", "12px times")
                                .style("fill", "black"); 

}

function stringify(c){
    return c.toString();
}

function getEl(e){
    return e.dis;
}


