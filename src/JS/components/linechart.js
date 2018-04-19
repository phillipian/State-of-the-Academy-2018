/*
  Line Chart
*/

d3.selectAll(".line_chart").each(function(){
  var accent = this.dataset.accent,
      thisNode = d3.select(this),
      csv = this.dataset.csv,
      xLabel = this.dataset.x,
      yLabel = this.dataset.y,
      margin = {top: 20, right: 20, bottom: 50, left: 50},
      width = thisNode.node().offsetWidth - margin.left - margin.right,
      height = parseInt(this.dataset.height) - margin.top - margin.bottom;

  var tooltip = d3.select(this.firstChild),
    tooltipText;

  var data = [];

  $.ajax({
    url: csv,
    success: function (csvd) {
      //data = $.csv.toArrays(csvd);
      csvd.split("\n").map(function(d){
        var temp = d.split(",");
        if(temp[0]){
          data.push({
            x: parseInt(temp[0]),
            y: parseInt(temp[1])
          });
        }
      });

      var x = d3.scaleLinear().range([0, width]);
      var y = d3.scaleLinear().range([height, 0]);
      var bisector = d3.bisector(function(d) { return d.x; }).right;

      //Create the line
      var line = d3.line()
        .x(function(d){ return x(d.x); })
        .y(function(d){ return y(d.y); });

      var svg = thisNode.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .on("mousemove", function(){
          var x0 = x.invert(d3.mouse(this)[0]),
              i = bisector(data, x0, 1),
              d0 = data[i - 1],
              d1 = data[i];

          if(d0 && d1){
            var d = x0 - d0.x > d1.x - x0 ? d1 : d0;
            tooltipText = generateTooltip({title: d.x, responses: d.y, percentage: null});
            tooltip.classed("hidden", false).html(tooltipText);

            tooltip.style("left", x(d.x) + 5 + "px")
              .style("top", y(d.y) - Math.round(tooltip.node().offsetHeight) + 10 + "px");
          }
        })
        .on("mouseout", function(d){
          var e = d3.event.toElement;
          if(e.parentNode.parentNode != this.parentNode && e.parentNode != this.parentNode && e != this.parentNode) tooltip.classed("hidden", true);
        })
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(d3.extent(data, function(d) { return d.x; }));
      y.domain([0, d3.max(data, function(d) { return d.y; })]);

      // Add the line path.
      svg.append("path")
        .data([data])
        .attr("class", "line")
        .style("stroke", accent)
        .style("stroke-width", "2px")
        .style("fill", "none")
        .attr("d", line);

      //Add circles for each data point
      svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .style("fill", accent)
        .attr("cx", function(d){return x(d.x);})
        .attr("cy", function(d){return y(d.y);})
        .attr("r", 5);

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
    },
    dataType: "text"
  });
});
