/*
  Line Chart
*/
var margin = {top: 20, right: 20, bottom: 50, left: 50};
var dataForGraphs = [],
    totalForGraphs = [],
    bisectors = [],
    colorsForGraphs = [],
    numLinesGraphs = [];

function drawGraph(thisNode, data, total, width, height, accent, tooltip, bisector, xLabel, yLabel, scatter, numLines, colors, shade){
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var tooltipText;

  //Create the line
  var lines = [],
      line;

  for(var i = 0; i < numLines; i++){
    line = d3.line()
      .x(function(d){ return x(d.x); })
      .y(function(d){ return y(d.y[i]); });

    lines.push(line);
  }

  thisNode.select('svg').selectAll("*").remove();

  var svg = thisNode.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("mousemove", function(){
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisector(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i];

      if(d0 && d1){
        var d = x0 - d0.x > d1.x - x0 ? d1 : d0;
        if(numLines > 1) tooltipText = generateTooltipMultiline({title: d.x, responses: d.y, colors: colors, total: total});
        else tooltipText = generateTooltip({title: d.x, responses: d.y, percentage: d.y / total});
        tooltip.classed("hidden", false).html(tooltipText);

        tooltip.style("left", x(d.x) + margin.left - Math.round(tooltip.node().offsetWidth / 2) + "px")
          .style("top", y(d3.max(d.y)) - Math.round(tooltip.node().offsetHeight) - 12 + margin.top + "px");
      }
    })
    .on("mouseout", function(d){
      var e = d3.event.toElement;
      if(e && e.parentNode.parentNode != this.parentNode && e.parentNode != this.parentNode && e != this.parentNode) tooltip.classed("hidden", true);
    })
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xExtent = d3.extent(data, function(d) { return d.x; }),
      xRange = xExtent[1] - xExtent[0];

  x.domain([xExtent[0] - (xRange * 0.05), xExtent[1] + (xRange * 0.05)]);
  y.domain([0, d3.max(data, function(d) { return d3.max(d.y); })]); //TODO: Replace d.y with Math.max of all ys

  for(var i = 0; i < numLines; i++){
    // Add the line path.
    if(scatter == "false"){
      svg.append("path")
        .data([data])
        .attr("class", "line")
        .style("stroke", colors[i])
        .style("stroke-width", "2px")
        .style("fill", "none")
        .attr("d", lines[i]);
    }

    //Shade the space between lines, if necessary
    if(shade){
      var area = d3.area()
        .x(function(d){return x(d.x);})
        .y0(function(d){return i == 0 ? height : y(d.y[i - 1]);})
        .y1(function(d){return y(d.y[i]);});

      svg.append("path")
        .data([data])
        .attr("fill", colors[i])
        .style("opacity", "0.5")
        .style("z-index", "20")
        .attr("d", area);
    }
  }

  for(var i = 0; i < numLines; i++){
    //Add circles for each data point
    svg.selectAll(".dot-" + i)
      .data(data)
      .enter().append("circle")
      .attr("class", "dot-" + i)
      .style("fill", colors[i])
      .attr("cx", function(d){return x(d.x);})
      .attr("cy", function(d){return y(d.y[i]);})
      .attr("r", 5);
  }

  //Add the X Axis
  svg.append("g")
    .style("font-family", "source_sans_pro")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  //Add the Y Axis
  svg.append("g")
    .style("font-family", "source_sans_pro")
    .call(d3.axisLeft(y));

  //Label for Y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-family", "source_sans_pro")
    .style("font-weight", "bold")
    .text(yLabel);

  //Label for X axis
  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .style("font-family", "source_sans_pro")
    .style("font-weight", "bold")
    .text(xLabel);
}

d3.selectAll(".line_chart").each(function(){
  var accent = d3.color(this.dataset.accent),
      thisNode = d3.select(this),
      currentElement = this,
      csv = this.dataset.csv,
      xLabel = this.dataset.x,
      yLabel = this.dataset.y,
      tooltip = d3.select(this.firstChild),
      numLines = this.dataset.lines;

  var data = [],
      total = 0;

  var colors = [];
  for(var i = 0; i < numLines; i++) colors.push(d3.color(accent.darker(i)));

  $.ajax({
    url: csv,
    success: function (csvd) {
      //data = $.csv.toArrays(csvd);
      csvd.split("\n").map(function(d){
        var temp = d.split(",");
        if(temp[0]){
          total += parseInt(temp[1]);
          data.push({
            x: parseInt(temp[0]),
            y: temp.slice(1).map(function(element){
              return parseInt(element)
            })
          });
        }
      });

      var bisector = d3.bisector(function(d) { return d.x; }).right;

      dataForGraphs.push(data);
      totalForGraphs.push(total);
      bisectors.push(bisector);
      numLinesGraphs.push(numLines);
      colorsForGraphs.push(colors);

      var width = d3.select("#sections").node().offsetWidth - margin.left - margin.right,
          height = parseInt(currentElement.dataset.height) - margin.top - margin.bottom;

      thisNode.append("svg");

      drawGraph(thisNode, data, total, width, height, accent, tooltip, bisector, xLabel, yLabel, currentElement.dataset.scatter, numLines, colors, currentElement.dataset.shade == "true");

      if(numLines > 1){
        var labels = currentElement.dataset.labels.split(",");
        d3.select(currentElement).append("div")
          .attr("class", "line-label")
          .attr("width", "100%")
          .selectAll("p").data(colors)
          .enter().append("p")
            .html(function(d, i){
              return "<div class = 'bubble' style = 'background:" + d + "'></div> " + labels[i];
            });
      }
    },
    dataType: "text"
  });
});
