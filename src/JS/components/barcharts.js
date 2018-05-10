/*
  Bar Chart
*/

var dataForBarCharts = [],
    totalForBarCharts = [];

function drawBarChart(currentThis, data, total){
  var margin = {top: 20, right: 20, bottom: 50, left: 50},
      marginHorizontal = {top: 20, right: 20, bottom: 50, left: 70};

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
      className = currentThis.className.split(" ")[1],
      isPercentageChart = currentThis.dataset.percent == "true";

  if("leftmargin" in currentThis.dataset) marginHorizontal.left = parseInt(currentThis.dataset.leftmargin);
  else if(isPercentageChart) margin.left = 60;

  d3.select(currentThis).select('svg').selectAll("*").remove();
  d3.select(currentThis).select('.bar-label').remove();

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
  else if(className == "barchart-grouped"){
    x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .padding(0.05);

    y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var colors = currentThis.dataset.colors.split(",");

    var keys = [];
    for(var i = 0; i < data[0].y.length; i++) keys.push(i);

    x.domain(data.map(function(d) { return d.label; }));
    x1.domain(keys).rangeRound([0, x.bandwidth()]);

    if(isPercentageChart) y.domain([0, 100]);
    else y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d.y[key]; }); })]).nice();

    svg.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
        .attr("transform", function(d) { return "translate(" + x(d.label) + ",0)"; })
      .selectAll("rect")
      .data(function(d) { return keys.map(function(key) { return {key: key, value: d.y[key]}; });})
      .enter().append("rect")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d, i) { return colors[i]; });
  }
  else{
    //Set the ranges
    x = d3.scaleBand().range([0, width]).paddingInner(0.2);
    y = d3.scaleLinear().range([height, 0]);

    x.domain(data.map(function(d) { return d.label; }));

    if(className == "barchart-stacked"){
      y.domain([0, d3.max(data, function(d) {
        if(typeof d.y == "number") return d;
        else return d.y.reduce(function(accumulator,el){
          return accumulator + el;
        }, 0);
      })]).nice();

      var index = 0;
      var colors = currentThis.dataset.colors.split(",");
      var keys = [];
      for(var i = 0; i < data[0].y.length; i++) keys.push(i);

      svg.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
          .attr("fill", function(d, i){return colors[i];})
        .selectAll("rect")
        .data(function(d) {return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d.data.label); })
          .attr("y", function(d, i) {
            //console.log(d[1]);
            if(index == data[0].y.length) index = 0;
            var heightToReturn = d.data.y[index];
            for(var j = index; j > 0; j--) heightToReturn += d.data.y[j - 1];
            //console.log(heightToReturn + d.data.y[index]);
            index++;
            return y(heightToReturn);
          })
          .attr("height", function(d, i) { if(index == data[0].y.length) index = 0;return height - y(d.data.y[index++]); })
          .attr("width", x.bandwidth());
    }
    else{
      if(isPercentageChart) y.domain([0, 100]);
      else y.domain([0, d3.max(data, function(d) { return d.y; })]);

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
  }

  if(currentThis.dataset.labels){
    d3.select(currentThis).append("div")
      .attr("class", "bar-label")
      .attr("width", "100%")
      .selectAll("p").data(currentThis.dataset.labels.split(","))
      .enter().append("p")
        .html(function(d, i){
          return "<div class = 'bubble' style = 'background:" + (colors[i] || accent)+ "'></div>" + d;
        });
  }

  //Labels for mouseover
  svg.selectAll(".bar").on("mouseover", function(d, i){
    if(isPercentageChart) tooltipText = "<h4>" + d.label + "</h4><p><strong>" + d.y.toFixed(1) + "%</strong></p>";
    else tooltipText = generateTooltip({title: d.label, responses: d.y, percentage: d.y / total});

    tooltip.classed("hidden", false).html(tooltipText);

    if(className == "barchart-horizontal") tooltip.style("left", x(d.y) + marginHorizontal.left + 12 + "px").style("top", y(d.label) - y.bandwidth() / 2 + marginHorizontal.top + "px");
    else tooltip.style("left", x(d.label) + (x.bandwidth() - tooltip.node().offsetWidth) / 4 + margin.left + "px").style("top", y(d.y) - Math.round(tooltip.node().offsetHeight) + margin.top - 12 + "px"); //TODO: for some reason this doesn't work properly

    if(className == "barchart-horizontal" || className == "barchart-vertical") d3.select(this).style("fill", d3.rgb(d3.color(accent).brighter(0.5)));
  })
  .on("mouseout", function(d){
    var e = d3.event.toElement;
    if(e && e.parentNode.parentNode != this.parentNode && e.parentNode != this.parentNode && e != this.parentNode) tooltip.classed("hidden", true);

    d3.select(this).style("fill", accent);
  });

  //Add x axis
  svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  //Add y axis
  if(isPercentageChart){
    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y).tickFormat(function(d) { return d + "%"; }));
  }
  else{
    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));
  }

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
        var temp = d.split(","),
            slice = temp.slice(1);
        if(temp[0]){
          total += parseFloat(temp[1]);
          data.push({
            y: (slice.length > 1 ? slice.map(function(d){return parseFloat(d);}) : parseFloat(temp[1])),
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
