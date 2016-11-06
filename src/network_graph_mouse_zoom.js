export default function(options){
  
  "use strict";

  options = options || {};
  
  options.height = _.get(options, 'height', 500) 
  options.width = _.get(options, 'width', 800) 

  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = options.width - margin.left - margin.right,
      height = options.height - margin.top - margin.bottom;
  
  var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[-100, -100], [width + 100, height + 100]])
        .on("zoom", zoomed);
          
  var svg = d3.select(options.id)
              .append("svg")
              .attr("class", "chart")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
              .call(zoom);

  // build the arrow.
  svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter()
        .append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 12)
        .attr("refY", 0)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .attr("fill", "lightgrey")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

  var overlay = svg.append("rect")
                .attr("class", "overlay")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("fill", "none")
                .attr("pointer-events", "all");

  var networkGroup = svg.append("g")
                     .attr("class", "network");

  var data = options.data || {}

  var x = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(_.map(data['nodes'], 'x')));

  var y = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(_.map(data['nodes'], 'y')));
 
  var default_color =  d3.scaleOrdinal(d3.schemeCategory10)
                              .domain( _.uniq(_.map(data['nodes'], 'kind')) );

  var color = _.get(options, 'color', default_color) 

  function zoomed() {
      networkGroup.attr("transform", d3.event.transform);
      gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
      gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
  }

  function get_size(d){
    if(d['kind'] == 'line'){ 
        return 3; 
    }
    else{ 
        return 5; 
    } 
  }

  function get_color(d){
    return "grey"
  }


  function onCircleEnter(selection) {
        selection.attr("cx", function(d,i) { return x(d['x']); })
                 .attr("cy", function(d,i) { return y(d['y']); })
                 .attr("r",  function(d,i) { return get_size(d); })
                 .attr("class", function(d){ return "circle " + d['name'];})
                 .attr("fill", function(d){ return get_color(d); })
                 .attr("stroke-width",  0.15)
                 .attr("stroke",  function(d) { return "#d3d3d3"; }); 

  }

  function onLineEnter(selection){
        selection.attr("x1", function(d) { return x(+d['source_x']); })
                    .attr("x2", function(d) { return x(+d['target_x']); })
                    .attr("y1", function(d) { return y(+d['source_y']); })
                    .attr("y2", function(d) { return y(+d['target_y']); })
                    .attr("stroke-width", 6)
                    .attr("stroke", "#d3d3d3"); 
        
  }

  function chart() {
  
        var position_lookup = _.keyBy(data['nodes'], 'name'); 
        
        // Create the edges from data['nodes'] and data['edges'] 
        var edges = data['edges'].map(function(edge){
                return {'name': edge['source'] + ":" + edge['target'],
                        'source_x': position_lookup[edge['source']]['x'], 
                        'source_y': position_lookup[edge['source']]['y'],
                        'target_x': position_lookup[edge['target']]['x'],
                        'target_y': position_lookup[edge['target']]['y'] }
        }); 
        
        
        var lineEnter = networkGroup.selectAll("line")
                                 .data(edges, function(d) { return d['name'] })
                                 .enter()
                                 .append('line')
                                 .attr("marker-end", "url(#end)");

        var circleEnter = networkGroup.selectAll("circle")
                                 .data(data['nodes'], function(d) { return d['name']; })
                                 .enter()
                                 .append('circle');

        lineEnter.call(onLineEnter);
        circleEnter.call(onCircleEnter);

        
                

  } // chart
  

  return chart;
}
