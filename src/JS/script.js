//Returns an html string for the tooltip
function generateTooltip(json) {
  return "<h4>" + json.title + "</h4><p>Responses: <strong>" + json.responses + "</strong>" + (json.percentage ? "<br>Percentage: <strong>" + (json.percentage * 100).toFixed(1) + "%</strong>" : "") + "</p>";
}
