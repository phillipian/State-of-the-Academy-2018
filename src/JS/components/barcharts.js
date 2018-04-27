/*
  Bar Chart
*/

var margin = {top: 20, right: 20, bottom: 50, left: 50},
    marginHorizontal = {top: 20, right: 20, bottom: 50, left: 70},
    dataForBarCharts = [],
    totalForBarCharts = [];

function drawBarChart(currentThis, data, total){
  var accent = currentThis.dataset.accent,
      height = parseInt(currentThis.dataset.height) - margin.top - margin.bottom,
      xLabel = currentThis.dataset.x,
      yLabel = currentThis.dataset.y,
      tooltip = d3.select(currentThis.firstChild),
      tooltipText,
      width = d3.select("#sections").node().offsetWidth - margin.left - margin.right,
      x,
      y,
      svg,
      className = currentThis.className.split(" ")[1];

  d3.select(currentThis).select('svg').selectAll("*").remove();

  svg = d3.select(currentThis).select("svg")
    .attr("width", width + marginHorizontal.left + marginHorizontal.right)
    .attr("height", height + marginHorizontal.top + marginHorizontal.bottom)
    .append("g")
      .attr("transform", "translate(" + marginHorizontal.left + "," + marginHorizontal.top + ")");

  if(className == "barchart-horizontal"){
    width = d3.select("#sections").node().offsetWidth - marginHorizontal.left - marginHorizontal.right;
    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleBand().range([height, 0]).padding(0.2);

    x.domain([0, d3.max(data, function(d) { return d.y; })]);
    y.domain(data.map(function(d) { return d.label; }));

    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
          .attr("x", 1)
          .attr("height", y.bandwidth())
          .style("fill", accent)
          .attr("y", function(d) { return y(d.label); })
          .attr("width", function(d) { return x(d.y); });
  }
  else{
    //Set the ranges
    x = d3.scaleBand().range([0, width]).padding(0.2);
    y = d3.scaleLinear().range([height, 0]);

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
  }

  //Labels for mouseover
  svg.selectAll(".bar").on("mouseover", function(d, i){
    tooltipText = generateTooltip({title: d.label, responses: d.y, percentage: d.y / total});
    tooltip.classed("hidden", false).html(tooltipText);

    if(className == "barchart-horizontal") tooltip.style("left", x(d.y) + marginHorizontal.left + 12 + "px").style("top", y(d.label) - y.bandwidth() / 2 + marginHorizontal.top + "px");
    else tooltip.style("left", x(d.label) + this.width.baseVal.value / 2 + margin.left - Math.round(tooltip.node().offsetWidth / 2) + "px").style("top", y(d.y) - Math.round(tooltip.node().offsetHeight) + margin.top - 12 + "px");
  })
  .on("mouseout", function(d){
    var e = d3.event.toElement;
    if(e && e.parentNode.parentNode != this.parentNode && e.parentNode != this.parentNode && e != this.parentNode) tooltip.classed("hidden", true);
  });

  //Add x axis
  svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  //Add y axis
  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));

  //Labels
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -1 * (className == "barchart-horizontal" ? marginHorizontal.left : margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-family", "source_sans_pro")
    .style("font-weight", "bold")
    .text(className == "barchart-horizontal" ? xLabel : yLabel);

  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .style("font-family", "source_sans_pro")
    .style("font-weight", "bold")
    .text(className == "barchart-horizontal" ? yLabel : xLabel);

  svg.select(".xAxis").selectAll("text")
    .style("font-family", "source_sans_pro")
    .style("font-size", "12px");
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
