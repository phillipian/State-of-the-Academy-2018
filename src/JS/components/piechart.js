/*
  Pie Chart
*/

var pieCharts = d3.selectAll(".pie").each(function(){
  var responses = this.dataset.responses.split(","),
      labels = this.dataset.labels.split(","),
      colors = this.dataset.colors.split(",");

  var width = 300,
      height = 300,
      radius = 150;

  var total = 0;
  var piedata = responses.map(function(d, i){
    total += parseInt(d);
    return {
      label: labels[i],
      value: parseInt(d),
      color: colors[i]
    };
  });

  var pie = d3.pie()
    .value(function(d){
      return d.value;
    });

  var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius / 2);

  var tooltip = d3.select(this.firstChild),
      tooltipText,
      mouse;

  var currentElement = this;

  //Add pieChart
  var myChart = d3.select(this).append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + (width - radius) + "," + (height - radius) + ")")
      .selectAll("path").data(pie(piedata))
      .enter().append("path")
        .attr("fill", function(d, i){
          return d.data.color;
        })
        .attr("stroke", "white")
        .attr("d", arc)
        .on("mouseover", function(d, i){
          tooltipText = generateTooltip({title: d.data.label, responses: d.value, percentage: d.value / total});
          tooltip.classed("hidden", false).html(tooltipText);
        })
        .on("mousemove", function(d){
          mouse = d3.mouse(currentElement);

          tooltip.style("left", mouse[0] - Math.round(tooltip.node().offsetWidth / 2) + "px")
            .style("top", mouse[1] - Math.round(tooltip.node().offsetHeight) - 12 + "px");
        })
        .on("mouseout", function(d){
          tooltip.classed("hidden", true);
        });

  //Add labels underneath pie chart
  d3.select(this).append("div")
    .attr("class", "pie-label")
    .attr("width", "100%")
    .selectAll("p").data(piedata)
    .enter().append("p")
      .html(function(d, i){
        return "<div class = 'bubble' style = 'background:" + d.color + "'></div>" + d.label;
      });
});
