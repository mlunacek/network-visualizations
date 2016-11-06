export default function(data, options){
  
  "use strict";

  if (typeof options === 'undefined') { options = {}; }
  if (typeof data === 'undefined'){ data = {}; }

    var tmp = _.map(data['bynode'], function(v, k){
                    // console.log(k);
                    return { name: _.replace(k, ":", "x"), 
                             color: "lightgrey",
                            // type:  "scattergl",
                             // mode: 'lines+markers',
                             mode: 'lines',
                             line: { color: 'grey', width: 1 },
                             x: _.keys(v),
                             y: _.values(v) }
                });

    var line = document.getElementById(options.id);
  
    var layout = { margin: { t: 10, b: 30, l:30, r: 0 },
                   showlegend: false,
                   hovermode:'closest',
                     xaxis: {
                        tickfont: {
                          family: 'Courier New, monospace',
                          size: 10,
                          color: '#7f7f7f'
                        }
                      },
                      yaxis: {
                        tickfont: {
                          family: 'Courier New, monospace',
                          size: 10,
                          color: '#7f7f7f'
                        }
                      }
                  };

  // mouse event functions
  var mouseover = function(d, i){  };
  var mouseout = function(d, i){  };

  var plotly_mouseover = function(indata){
            
      var line_name = indata.points[0].data.name;
      var slice = data['bytime'][indata.points[0].x];

      mouseover(line_name, slice);

        // Highight line
      _.forEach(line.data, function(x){
            x.line.width = 1;
            x.line.color = "grey";
      });

      indata.points[0].data.line.color = "darkblue";
      indata.points[0].data.line.width = 2;
      Plotly.redraw(line);
  };


  Plotly.plot(line, tmp, layout);
  
  function chart(options_updates) {
         
     if (typeof options_updates === 'undefined') { 
        options_updates = {}; 
     }

     Plotly.redraw(line);
     
     line.on('plotly_hover', function(indata){
        plotly_mouseover(indata);
     });


  }
  
  chart.data = function(){
     return line.data;
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
