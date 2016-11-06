
import network_graph from './network_graph.js';
import plotly_line from './plotly_line.js';
import d3_line from './d3_line.js';

function main (graph_data, graph_options, line_data, line_options) {
     
    "use strict";
    
    var net, lin;

    function chart() {
       
if(false){

        line_options.id = "#graph";
        console.log(line_options);
        lin = d3_line(line_data, line_options);
        lin();

} else{

        if( graph_options.size_by === true ){
            graph_options.node_size_by = line_data['bytime'][10];
        }

        if( graph_options.color_by === true ){
            graph_options.node_color_by = line_data['bytime'][10];
        }

        net = network_graph(graph_data, graph_options);
        net();

        // lin = plotly_line(line_data, line_options);
        lin = d3_line(line_data, line_options);
        lin(); 

        // -------------------------------------------------------------------------
        // Add interactions
        // -------------------------------------------------------------------------

          // Define the interaction on network
          var plotlyMouseOverInteraction = function(d, i){
               
               var opts = {};
               opts['line_colors'] = {};
               opts['line_widths'] = {}; 
               opts.line_colors[d.name] = 'darkblue'
               opts.line_widths[d.name] = 2
               lin(opts);
          };

          // Define mouse out
          var plotlyMouseOutInteraction = function(d, i){
              console.log("mouseout");
               var opts = {};
               opts['line_colors'] = {};
               opts['line_widths'] = {}; 
               lin(opts);
          };

          // Add the interaction to the graphs
          net.mouseover(plotlyMouseOverInteraction);
          net.mouseout(plotlyMouseOutInteraction);

        // -------------------------------------------------------------------------

          var networkMouseOverInteraction = function(name, slice){

                var opts = {};  
                if( graph_options.size_by === true){
                    opts['node_size_by'] = slice;
                }
                if( graph_options.color_by === true){
                    opts['node_color_by'] = slice;
                }
                net(opts);

                // Show tool tip
                net.showToolTip(name);
          }

          lin.mouseover(networkMouseOverInteraction);      

 } // False

    }
   


    chart.annimate = function(){
        var count = 0;
        var t = d3.interval(function(elapsed) {
                console.log(elapsed);
                var opts = {};  
                if( graph_options.size_by === true){
                    opts['node_size_by'] = line_data['bytime'][count];
                }
                if( graph_options.color_by === true){
                    opts['node_color_by'] = line_data['bytime'][count];
                }
                net(opts);
                count = count + 1;
                if (elapsed > 100*24) t.stop();
        }, 100);

        return chart;
    };

    chart.toggle_tooltips = function(){
        graph_options.show_tooltips = !graph_options.show_tooltips;
        net();
        return chart;
    };
    
    chart.toggle_directed = function(){
        graph_options.directed = !graph_options.directed;
        net();
        return chart;
    };

    return chart;
}



// module.exports = main;
export default main;
