//Returns an html string for the tooltip
function generateTooltip(json) {
  return "<h4>" + json.title + "</h4><p>Responses: <strong>" + json.responses + "</strong>" + (json.percentage ? "<br>Percentage: <strong>" + (json.percentage * 100).toFixed(1) + "%</strong>" : "") + "</p>";
}

$(document).ready(function(){
  //Smooth scrolling
  $("#sidebar a").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){
        window.location.hash = hash;
      });
    }
  });

  //Snap scrolling
  $(document).scroll(function() {
    if($(document).width() > 900){
      if($(document).scrollTop() + 60 > $("#sections").offset().top){
        $("#sidebar").css("position", "fixed");
        $("#sidebar").css("top", "40px");
      }
      else{
        $("#sidebar").css("position", "absolute");
        $("#sidebar").css("top", "80px");
      }
    }
  });

  $(window).resize(function(){
    if($(document).width() > 900){
      if($(document).scrollTop() + 60 > $("#sections").offset().top){
        $("#sidebar").css("position", "fixed");
        $("#sidebar").css("top", "40px");
      }
      else{
        $("#sidebar").css("position", "absolute");
        $("#sidebar").css("top", "80px");
      }
    }
    else{
      $("#sidebar").css("position", "relative");
      $("#sidebar").css("top", "0px");
    }
  });
});


/*
  Line Chart
*/

var margin = {top: 20, right: 20, bottom: 50, left: 50};
var dataForGraphs = [],
    totalForGraphs = [],
    bisectors = [];

var resizeId;
d3.select(window).on('resize', function(){
  resizeId = setTimeout(function(){
    d3.selectAll(".line_chart").each(function(d, i){
      var thisNode = d3.select(this),
          width = thisNode.node().offsetWidth - margin.left - margin.right,
          height = parseInt(this.dataset.height) - margin.top - margin.bottom;
      drawGraph(thisNode, dataForGraphs[i], totalForGraphs[i], width, height, this.dataset.accent, d3.select(this.firstChild), bisectors[i], this.dataset.x, this.dataset.y);
    });
  }, 500);
});

function drawGraph(thisNode, data, total, width, height, accent, tooltip, bisector, xLabel, yLabel){
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var tooltipText;

  //Create the line
  var line = d3.line()
    .x(function(d){ return x(d.x); })
    .y(function(d){ return y(d.y); });

  thisNode.select('svg').remove();

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
        tooltipText = generateTooltip({title: d.x, responses: d.y, percentage: d.y / total});
        tooltip.classed("hidden", false).html(tooltipText);

        tooltip.style("left", x(d.x) + margin.left - Math.round(tooltip.node().offsetWidth / 2) + "px")
          .style("top", y(d.y) - Math.round(tooltip.node().offsetHeight) - 12 + margin.top + "px");
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
}

d3.selectAll(".line_chart").each(function(){
  var accent = this.dataset.accent,
      thisNode = d3.select(this),
      currentElement = this,
      csv = this.dataset.csv,
      xLabel = this.dataset.x,
      yLabel = this.dataset.y,
      tooltip = d3.select(this.firstChild);

  var data = [],
      total = 0;

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
            y: parseInt(temp[1])
          });
        }
      });

      var bisector = d3.bisector(function(d) { return d.x; }).right;

      dataForGraphs.push(data);
      totalForGraphs.push(total);
      bisectors.push(bisector);

      var width = thisNode.node().offsetWidth - margin.left - margin.right,
          height = parseInt(currentElement.dataset.height) - margin.top - margin.bottom;

      drawGraph(thisNode, data, total, width, height, accent, tooltip, bisector, xLabel, yLabel);
    },
    dataType: "text"
  });
});

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
        tooltipText = generateTooltip({title: d.name, responses: d.responses, percentage: d.responses / total});
        tooltip.classed("hidden", false).html(tooltipText);
      })
      .on("mousemove", function(d){
        var mouse = d3.mouse(currentElement);

        tooltip.style("left", mouse[0] - Math.round(tooltip.node().offsetWidth / 2) + "px")
          .style("top", mouse[1] - Math.round(tooltip.node().offsetHeight) - 10 + "px");
      })
      .on("mouseout", function(d){
        tooltip.classed("hidden", true);
      });
  });
});

/*
  Percentage Slider
*/

var percentageSliders = d3.selectAll(".percentage-slider").each(function(){
  var yesResponses = parseInt(this.dataset.yes),
      noResponses = parseInt(this.dataset.no);

  var htmlYes = generateTooltip({title: "Yes", responses: yesResponses, percentage: yesResponses / (yesResponses + noResponses)}),
      htmlNo = generateTooltip({title: "No", responses: noResponses, percentage: noResponses / (yesResponses + noResponses)});

  var tooltip = d3.select(this.firstChild);

  var yesX = parseInt(d3.select(this.children[1]).node().style.width.replace("%", ""));
  var noX = parseInt(d3.select(this.children[2]).node().style.width.replace("%", ""));

  d3.select(this.children[1]) //If hovering over yes
    .on("mouseover", function(d){
      tooltip.classed("hidden", false).html(htmlYes)
        .style("left", "calc(" + Math.round(yesX / 2) + "% - " + Math.round(tooltip.node().offsetWidth / 2) + "px)")
        .style("top", "-" + (Math.round(tooltip.node().offsetHeight) + 10) + "px");
    })
    .on("mouseout", function(d){
      tooltip.classed("hidden", true);
    });

  d3.select(this.children[2]) //If hovering over no
    .on("mouseover", function(d){
      tooltip.classed("hidden", false).html(htmlNo)
        .style("left", "calc(" + Math.round(yesX + noX / 2) + "% - " + Math.round(tooltip.node().offsetWidth / 2) + "px)")
        .style("top", "-" + (Math.round(tooltip.node().offsetHeight) + 10) + "px");
    })
    .on("mouseout", function(d){
      tooltip.classed("hidden", true);
    });
});

/*
  Pie Chart
*/

var pieCharts = d3.selectAll(".pie").each(function(){
  var responses = this.dataset.responses.split(","),
      labels = this.dataset.labels.split(","),
      accent = d3.color(this.dataset.accent);

  var width = 300,
      height = 300,
      radius = 150;

  var total = 0;
  var piedata = responses.map(function(d, i){
    total += parseInt(d);
    if(i != 0) accent = d3.color(accent.darker());
    return {
      label: labels[i],
      value: parseInt(d),
      color: d3.rgb(accent)
    };
  });

  var colors = d3.scaleOrdinal(d3.schemeCategory20c);

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
