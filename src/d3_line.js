export default function(data, options){
  
  "use strict";

  if (typeof options === 'undefined') { options = {}; }
  if (typeof data === 'undefined'){ data = {}; }
  
  options.height = _.get(options, 'height', 500);
  options.width = _.get(options, 'width', 800); 
  options.line_width = _.get(options, 'line_width', 1);

  options.line_widths = _.get(options, 'line_widths', {});
  options.line_colors = _.get(options, 'line_colors', {});

  var margin = {top: 20, right: 20, bottom: 50, left: 50 },
      width = options.width - margin.left - margin.right,
      height = options.height - margin.top - margin.bottom;
          
  var svg = d3.select(options.id)
              .append("svg")
              .attr("class", "chart")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var lineGroup = svg.append("g")
                     .attr("class", "lines");
  
  var xaxisGroup = svg.append("g")
                     .attr("class", "axis xaxis")
                     .attr("transform", "translate(0," + height + ")");

  var yaxisGroup = svg.append("g")
                     .attr("class", "axis yaxis");

    // text label for the x axis
    svg.append("text")             
          .attr("transform",
                "translate(" + (width/2) + " ," + 
                               (height + margin.top + 20) + ")")
          .style("text-anchor", "middle")
          .text("Date");

    // text label for the y axis
    svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x",0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Value");   
 
  var std_data = _.map(data['bynode'], function( value, key){
                        return {'name': key, 'values': _.map(value, function( x, y){
                            return {'name': key, 'x': +y, 'y': +x}
                        })};
                  });

  std_data = _.flatten(std_data);

  var tmp = _.flatten(_.map(std_data, 'values'));
  var x_values = _.map(tmp, "x");
  var y_values = _.map(tmp, "y");
 
  var line = d3.line()
              .x(function (d) { return x(d.x); })
              .y(function (d) { return y(d.y); });

  var x = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(x_values));

  var y = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(y_values));

  console.log(x.domain());
  console.log(x.range());

  // mouse event functions
  var mouseover = function(d, i){  };
  var mouseout = function(d, i){  };

  function line_color(name){
    return _.get( options.line_colors, name, "grey")
  }
  
  function line_width(name){
    return _.get( options.line_widths, name, 1)
  }

  function chart(options_updates) {

        options.line_colors = _.get(options_updates, "line_colors", options.line_colors);
        options.line_widths = _.get(options_updates, "line_widths", options.line_widths);

        console.log(JSON.stringify(options));

        var update = lineGroup
              .selectAll("path")
              .data(std_data, function(d){ return d.name });

        var enter = update.enter()
              .append("path")
              .attr("class", function(d){ return "lines " + d.name})
              .attr("d", function(d) { return line(d.values); })
              .attr("fill", "none")
              .attr("stroke", function(d){ return line_color(d.name) })
              .attr("stroke-opacity", 0.8)
              .attr("stroke-width", function(d) { return line_width(d.name) });

        // Add the x Axis
        xaxisGroup.call(d3.axisBottom(x));

        // Add the y Axis
        yaxisGroup.call(d3.axisLeft(y));

        // Update
        // transitions.. 
        // var t = d3.transition()
        //           .duration(50);
        update.merge(enter)
              .transition()
              .duration(200)
                  .attr("stroke-width", function(d){  
                     return line_width(d.name);
                  })
                  .attr("stroke", function(d){  return line_color(d.name) });

        // line_enter.transition()

        // svg.selectAll(".lines").transition(t)
        //         .attr("stroke_width",  function(d) { 
        //             console.log(d);
        //             return line_width(d.name) })
        //         .attr("fill", function(d){ return line_color(d.name) });

 

  }

  chart.mouseout = function(_) {
    if (!arguments.length) return mouseout;
    mouseout = _;
    return chart;
  };

  chart.mouseover = function(_) {
    if (!arguments.length) return mouseover;
    mouseover = _;
    return chart;
  };

  return chart;

};
