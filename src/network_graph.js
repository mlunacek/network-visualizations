export default function(data, options){
  
  "use strict";

  if (typeof options === 'undefined') { options = {}; }

  _.forEach(data['nodes'], function(d){
      d['name'] = _.replace(d['name'], ":", "x");
  }); 

  _.forEach(data['edges'], function(d){
      d['source'] = _.replace(d['source'], ":", "x");
      d['target'] = _.replace(d['target'], ":", "x");
  });

  //
  var position_lookup = _.keyBy(data['nodes'], 'name'); 

    // Create the edges from data['nodes'] and data['edges'] 
  var edges = data['edges'].map(function(edge){
            
            return {'name': edge['source'] + ":" + edge['target'],
                    'kind': position_lookup[edge['source']]['kind'] + ":" + 
                            position_lookup[edge['target']]['kind'],  
                    'source_x': position_lookup[edge['source']]['x'], 
                    'source_y': position_lookup[edge['source']]['y'],
                    'target_x': position_lookup[edge['target']]['x'],
                    'target_y': position_lookup[edge['target']]['y'] }
   }); 

  options.height = _.get(options, 'height', 500);
  options.width = _.get(options, 'width', 800); 

  options.line_width = _.get(options, 'line_width', 1);
  options.node_size = _.get(options, 'node_size', 8);
  options.node_color = _.get(options, 'node_color', "darkgrey");
  options.directed = _.get(options, 'directed', "true");
  options.line_color = _.get(options, 'line_color', "grey");

  options.arrow_size = _.get(options, "arrow_size", 5 ); 

  options.node_sizes = _.get(options, "node_sizes", {});
  options.node_colors = _.get(options, "node_colors", {});

  options.line_colors = _.get(options, "line_colors", {});
  options.line_widths = _.get(options, "line_widths", {});


  var margin = {top: 50, right: 50, bottom: 50, left: 50 },
      width = options.width - margin.left - margin.right,
      height = options.height - margin.top - margin.bottom;
  
          
  var svg = d3.select(options.id)
              .append("svg")
              .attr("class", "chart")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var tooltip = d3.select(options.id)
                  .append('div')
                  .style('position','absolute')
                  .style('padding','0 10px')
                  .style('opacity',0)
                  .attr('class', 'tooltip');
  
  // var toolbar = d3.select(options.id)
  //                 .append('div')
  //                 .style('position','absolute')
  //                 .style('padding','0 10px')
  //                 .style('opacity', 1)
  //                 .attr('class', 'toolbar');
  //
  // toolbar.html( "<label> <input type='checkbox'> Check me out </label>")
  //       .style('left', (0) + 'px')
  //       .style('top',  (0) + 'px');


  // build the arrow.
  svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter()
        .append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("markerWidth", options.arrow_size)
        .attr("markerHeight", options.arrow_size)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .attr("fill", "grey")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
 
  var group = svg.append("g");

  // var overlay = group
  //               .append("rect")
  //               .attr("class", "overlay")
  //               .attr("width", width + margin.left + margin.right)
  //               .attr("height", height + margin.top + margin.bottom)
  //               .attr("fill", "none")
  //               .attr("pointer-events", "all")
  //               .on("mouseover", function() {
  //                   console.log("mouseover");
  //               });
  //
  
  var networkGroup = group.append("g")
                     .attr("class", "network");
  
  function mouseMoveHandler() {

      console.log("mouse move");
      // get the current mouse position
      var points  = d3.mouse(this);

      // use the new diagram.find() function to find the Voronoi site
      // closest to the mouse, limited by max distance voronoiRadius
      var site = voronoiDiagram.find(points[0], points[1], 50);
      console.log("site = " + site);
      // highlight the point if we found one
      // highlight(site && site.data);
  }


  group.append('rect')
       .attr('class', 'overlay')
       .attr('width', width)
       .attr('height', height)
       .style('fill', '#f00')
       .style('opacity', 0)
       .on('mousemove', mouseMoveHandler)
       .on('mousedown', function(d){ console.log("mousedown"); })
       .on('mouseup', function(d){ console.log("mouseup"); })
       .on('dblclick', function(d){ console.log("dblclick"); })
       .on('click', function(d){ console.log("click"); });


  // This is for the tool tip
  var focus  = svg.append("g")
                  .attr("class", "focus")
                  .style("display", "none");
 

    // focus.append("foreignObject")
    //       .attr("width", 20)
    //       .attr("height", 20)
    //       .attr("x", 20)
    //       .attr("y", 0)
    //       .append("xhtml:body")
    //       .html("");

   focus.append("circle")
          .style("fill", "none")
          .style("stroke", "black")
          .attr("r", 4);
 
  // var tip = d3.tip()
  //             .attr("class", "d3-tip")
  //             .html(function(d) { return d.name; });
  //
  // svg.call(tip);

  var x = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(_.map(data['nodes'], 'x')));

  var y = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(_.map(data['nodes'], 'y')));
  
  var voronoiDiagram = d3.voronoi()
                         .x(function(d){ return x(d.x) })
                         .y(function(d){ return y(d.y) })
                         .size([width, height])(data['nodes']);


  var default_color =  d3.scaleOrdinal(d3.schemeCategory10)
                              .domain( _.uniq(_.map(data['nodes'], 'kind')) );

  var color = _.get(options, 'color', default_color) 
  
  var voronoi = null; 
  var tooltipped = null;
        
  var node_size_scale = d3.scaleLinear().range([1, 15]);
  
  var node_color_scale = d3.scaleLinear().range([0, 1]);
  // var color_map = d3.interpolateRdBu;
  // var color_map = d3.interpolateBuPu;
  var color_map = d3.interpolateBlues;
  // mouse event functions
  
  
  var mouseover = function(d, i){  };
  var mouseout = function(d, i){  };


  function node_color(kind, name){
    var value = _.get( options.node_colors, name, _.get(options.node_colors, kind, options.node_color));
    if( options.color_by === true ){
        if( _.has(options.node_color_by, name) ){
            var color_index = node_color_scale(_.get(options.node_color_by, name))
            return color_map(color_index);
        }
        
    }
    return value
  }

  function node_size(kind, name){
    var value = _.get( options.node_sizes, name, _.get(options.node_sizes, kind, options.node_size));
    if( options.size_by === true){
        if( _.has(options.node_size_by, name) ){
            return node_size_scale(_.get(options.node_size_by, name))
        }
    }
    return value;
  }
  
  function line_width(kind, name){
    return _.get( options.line_widths, name, _.get(options.line_widths, kind, options.line_width))
  }

  function line_color(kind, name){
    return _.get( options.line_colors, name, _.get(options.line_colors, kind, options.line_color))
  }

  function onCircleEnter(selection) {
        selection.attr("cx", function(d,i) { return x(d['x']); })
                 .attr("cy", function(d,i) { return y(d['y']); })
                 .attr("class", function(d){ return "circle " + d['name'];})
                 .attr("r",  function(d,i) { return node_size(d['kind'], d['name']) })
                 .attr("fill", function(d){ return node_color(d['kind'], d['name']) })
                 .attr("stroke",  function(d) { return node_color(d['name']); })
                 .attr("stroke-width",  0.15);
                 // .on('mouseover', tip.show);

  }

  function onLineEnter(selection){

        // flip based on arrow direction
        selection.attr("x1", function(d) { return x(+d['source_x']); })
                 .attr("x2", function(d) { return x(+d['target_x']); })
                 .attr("y1", function(d) { return y(+d['source_y']); })
                 .attr("y2", function(d) { return y(+d['target_y']); })
                 .attr("class", function(d){ return "lines";})
                 .attr("stroke-width", function(d){ return line_width(d['kind'], d['name']); })
                 .attr("stroke", function(d){ return line_color(d['kind'], d['name']) });

        console.log("network " + options.directed);
        if(options.directed){
            selection.attr("marker-end", "url(#end)");
        }
        else{
            selection.attr("marker-end", "none");
        }
  }
 
  var removeTooltip = function(){
      focus.style("display", "none");
      tooltip.transition().style('opacity', 0)
  } 

  var showTooltip = function (d) {
    if( options.show_tooltips === true){
        console.log(options.show_tooltips);
        tooltip.transition()
                .style('opacity', .8)
                .style('padding', 20);
          
        var pos = [ x(d.x), y(d.y)]; 
          
            // console.log(pos + " " + width + " " + height); 

        tooltip.html(d.name)
            .style('left', (pos[0] + margin.left + 30) + 'px')
            .style('top',  (pos[1] + margin.top - 10) + 'px');
        
        focus.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")");
        focus.style("display", null);
    }
  }

  svg.on('mousemove', function() {
      if (!voronoi) {
        voronoi = d3.voronoi()
              .x(function(d) { return x(d.x); })
              .y(function(d) { return y(d.y); })
        (data['nodes']);
      }

    
      var p = d3.mouse(this);
      console.log(p);
      var site;
      // // don't react if the mouse is close to one of the axis
      if (p[0] < 0 || p[1] < 0) {
        site = null;
      } else {
        site = voronoi.find(p[0], p[1], 50);
      }
      if (site !== tooltipped) {
        if (tooltipped){
             removeTooltip();
             mouseout();
        }
        if (site) {
             showTooltip(site.data);
             mouseover(site.data);
        }
        tooltipped = site;
      }
  });

  function chart(options_updates) {
         
        if (typeof options_updates === 'undefined') { 
            options_updates = {}; 
        }

        options.node_sizes = _.get(options_updates, "node_sizes", options.node_sizes);
        options.node_size_by = _.get(options_updates, "node_size_by", options.node_size_by);
        options.node_color_by = _.get(options_updates, "node_color_by", options.node_color_by);

        node_size_scale.domain(d3.extent(_.values(options.node_size_by)));
        node_color_scale.domain(d3.extent(_.values(options.node_color_by))); 


        var lineEnter = networkGroup.selectAll("line")
                                 .data(edges, function(d) { return d['name'] })
                                 .enter()
                                 .append('line');

        lineEnter.call(onLineEnter);

        var circleEnter = networkGroup.selectAll("circle")
                                 .data(data['nodes'], function(d) { return d['name']; })
                                 .enter()
                                 .append('circle');

        circleEnter.call(onCircleEnter);

        // transitions.. 
        var t = d3.transition()
                  .duration(50)
                  .ease(d3.easeLinear);

        svg.selectAll(".circle").transition(t)
                .attr("r",  function(d) { return node_size(d['kind'], d['name']) })
                .attr("fill", function(d){ return node_color(d['kind'], d['name']) });
                
        console.log("network " + options.directed);
        if(options.directed){
            svg.selectAll(".lines").transition(t).attr("marker-end", "url(#end)");
        }
        else{
            svg.selectAll(".lines").transition(t).attr("marker-end", "none");
        }
         
                

  } // chart
  
  chart.svg = function() {
    return svg;
  };        

  chart.networkGroup= function() {
    return networkGroup;
  };        

  chart.showToolTip = function(node_name, text){
    var node = networkGroup.select("."+node_name);
    // console.log(node.datum());
    showTooltip(node.datum());
    return true;
  };

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
}
