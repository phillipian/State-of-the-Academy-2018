/*
  Bar Chart
*/

var margin = {top: 20, right: 20, bottom: 50, left: 50},
    dataForBarCharts = [],
    totalForBarCharts = [];

//TODO: resizing

function drawBarChart(currentThis, data, total){
  var accent = currentThis.dataset.accent,
      width = d3.select("#sections").node().offsetWidth - margin.left - margin.right,
      height = parseInt(currentThis.dataset.height) - margin.top - margin.bottom,
      xLabel = currentThis.dataset.x,
      yLabel = currentThis.dataset.y,
      tooltip = d3.select(currentThis.firstChild),
      tooltipText;

      //Set the ranges
  var x = d3.scaleBand()
              .range([0, width])
              .padding(0.2),
      y = d3.scaleLinear()
              .range([height, 0]);

  d3.select(currentThis).select('svg').selectAll("*").remove();

  var svg = d3.select(currentThis).select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d.label; }));
  y.domain([0, d3.max(data, function(d) { return d.y; })]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.label); })
      .attr("width", x.bandwidth())
      .style("fill", accent)
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); });

  // add the x Axis w/ rotated labels
  svg.append("g")
    .style("position", "relative")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.select(".xAxis").selectAll("text")
    .style("font-family", "source_sans_pro")
    .style("font-size", "12px");

  // add the y Axis
  svg.append("g")
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

  svg.selectAll(".bar").on("mouseover", function(d, i){

    tooltipText = generateTooltip({title: d.label, responses: d.y, percentage: d.y / total});
    tooltip.classed("hidden", false).html(tooltipText);

    tooltip.style("left", x(d.label) + this.width.baseVal.value / 2 + margin.left - Math.round(tooltip.node().offsetWidth / 2) + "px")
    .style("top", y(d.y) - Math.round(tooltip.node().offsetHeight) + margin.top - 12 + "px");
  })
  .on("mouseout", function(d){
    var e = d3.event.toElement;
    if(e && e.parentNode.parentNode != this.parentNode && e.parentNode != this.parentNode && e != this.parentNode) tooltip.classed("hidden", true);
  });
}

var barCharts = d3.selectAll(".barchart").each(function(){
  var currentThis = this;
  $.ajax({
    url: this.dataset.url,
    success: function (csvd) {
      var total = 0,
      data = [];

      csvd.split("\n").forEach(function(d){
        var temp = d.split(",");
        if(temp[0]){
          total += parseInt(temp[1]);
          data.push({
            y: parseInt(temp[1]),
            label: temp[0]
          });
        }
      });

      d3.select(currentThis).append("svg");
      dataForBarCharts.push(data);
      totalForBarCharts.push(total);
      drawBarChart(currentThis, data, total);
    },
    dataType: "text"
  });
});
