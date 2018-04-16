/*
  US Map
*/

d3.selectAll(".map").each(function(){
  //TODO: reorganize these variables
  var url = this.dataset.url;
  var total = 0;
  var regionNames = ["Discontinuous", "Northeast", "Southeast", "Southwest", "West", "Midwest", "International"];
  var responses = this.dataset.responses.split(",").map(function(element, i){
    total += parseInt(element);
    return {
      responses: parseInt(element),
      name: regionNames[i]
    };
  });

  var currentElement = this;
  var tooltipText;
  var tooltip = d3.select(this.firstChild);

  d3.svg(url).then(function(res){
    var svg = res.documentElement;
    d3.select(currentElement).node().appendChild(svg);
    d3.select(svg).selectAll("*")
      .data(responses)
      .on("mouseover", function(d, i){
        tooltipText = generateTooltip({title: d.name, responses: d.responses, percentage: d.responses / total});
        tooltip.classed("hidden", false).html(tooltipText);

        console.log(d3.select(currentElement).node().getBoundingClientRect());

        var bbox = d3.select(currentElement).node().getBoundingClientRect();
        var mouse = d3.mouse(this);

        ///tooltip.style("left", mouse[0] - bbox.x + "px")
          //.style("top", mouse[1] - bbox.y + "px");
      })
      .on("mousemove", function(d){
        var bbox = d3.select(currentElement).node().getBoundingClientRect();
        var mouse = d3.mouse(currentElement);

        tooltip.style("left", mouse[0] - Math.round(tooltip.node().offsetWidth / 2) + "px")
          .style("top", mouse[1] - Math.round(tooltip.node().offsetHeight) - 10 + "px");
      })
      .on("mouseout", function(d){
        tooltip.classed("hidden", true);
      });
  });
});
