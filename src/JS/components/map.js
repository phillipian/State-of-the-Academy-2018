/*
  US Map
*/

d3.selectAll(".map").each(function(){
  var total = 0,
      regionNames = ["Discontinuous", "Northeast", "Southeast", "Southwest", "West", "Midwest", "International"];

  var accent = d3.color(this.dataset.accent);

  var responses = this.dataset.responses.split(",").map(function(element, i){
    total += parseInt(element);
    return {
      responses: parseInt(element),
      name: regionNames[i]
    };
  });

  var colorSort = responses.slice().sort(function(a, b) {
    return a.responses - b.responses;
  });

  responses = responses.map(function(element, i){
    return {
      responses: element.responses,
      name: element.name,
      color: d3.color(accent.darker(0.4 * colorSort.indexOf(element)))
    };
  });

  console.log(responses);

  var currentElement = this,
      tooltipText,
      tooltip = d3.select(this.firstChild);

  d3.svg(this.dataset.url).then(function(res){
    var svg = res.documentElement;
    d3.select(currentElement).node().appendChild(svg);
    d3.select(svg).selectAll("*")
      .data(responses)
      .style("fill", function(d, i){
        return d3.rgb(d.color);
      })
      .on("mouseover", function(d, i){
        d3.select(this).style("fill", d3.rgb(accent.brighter(0.3)));
        tooltipText = generateTooltip({title: d.name, responses: d.responses, percentage: d.responses / total});
        tooltip.classed("hidden", false).html(tooltipText);
      })
      .on("mousemove", function(d){
        var mouse = d3.mouse(currentElement);

        tooltip.style("left", mouse[0] - Math.round(tooltip.node().offsetWidth / 2) + "px")
          .style("top", mouse[1] - Math.round(tooltip.node().offsetHeight) - 10 + "px");
      })
      .on("mouseout", function(d){
        d3.select(this).style("fill", d3.rgb(d.color));
        tooltip.classed("hidden", true);
      });
  });
});
