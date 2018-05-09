function generateTooltip(t){return"<h4>"+t.title+"</h4><p>Responses: <strong>"+t.responses+"</strong>"+(t.percentage?"<br>Percentage: <strong>"+(100*t.percentage).toFixed(1)+"%</strong>":"")+"</p>"}function generateTooltipMultiline(t){var e="",a="";t.responses=t.responses.map(function(e,a){return{data:e,color:t.colors[a]}});for(var s=0;s<t.responses.length;s++)e+="<div class = 'bubble' style = 'background:"+t.responses[s].color+"'></div> <span>"+t.labels[s]+": "+t.responses[s].data+"</span><br>",a+="<div class = 'bubble' style = 'background:"+t.responses[s].color+"'></div> <span>"+t.labels[s]+": "+(100*t.responses[s].data/t.total).toFixed(1)+"%</span><br>";return"<h4>"+t.title+"</h4><p>Responses:</p>"+e+"<br><p>Percentage (for each category):</p>"+a}$(document).ready(function(){$("#sidebar a").on("click",function(t){if(""!==this.hash){t.preventDefault();var e=this.hash;$("html, body").animate({scrollTop:$(e).offset().top},800,function(){window.location.hash=e})}}),$(document).scroll(function(){$(document).width()>900&&($(document).scrollTop()+60>$("#sections").offset().top?($("#sidebar").css("position","fixed"),$("#sidebar").css("top","40px")):($("#sidebar").css("position","absolute"),$("#sidebar").css("top","80px")))}),$(window).resize(function(){$(document).width()>900?$(document).scrollTop()+60>$("#sections").offset().top?($("#sidebar").css("position","fixed"),$("#sidebar").css("top","40px")):($("#sidebar").css("position","absolute"),$("#sidebar").css("top","80px")):($("#sidebar").css("position","relative"),$("#sidebar").css("top","0px"))})});var dataForBarCharts=[],totalForBarCharts=[];function drawBarChart(t,e,a){var s,n,r,l,o=20,i=20,d=50,c=50,p={top:20,right:20,bottom:50,left:70},h=t.dataset.accent,u=parseInt(t.dataset.height)-o-d,f=t.dataset.x,m=t.dataset.y,g=d3.select(t.firstChild),b=d3.select("#sections").node().offsetWidth-c-i,y=t.className.split(" ")[1];if("leftmargin"in t.dataset&&(p.left=parseInt(t.dataset.leftmargin)),d3.select(t).select("svg").selectAll("*").remove(),d3.select(t).select(".bar-label").remove(),l=d3.select(t).select("svg").attr("width",b+p.left+p.right).attr("height",u+p.top+p.bottom).append("g").attr("transform","translate("+p.left+","+p.top+")"),"barchart-horizontal"==y)b=d3.select("#sections").node().offsetWidth-p.left-p.right,n=d3.scaleLinear().range([0,b]),r=d3.scaleBand().range([u,0]).padding(.2),n.domain([0,d3.max(e,function(t){return t.y})]),r.domain(e.map(function(t){return t.label})),l.selectAll(".bar").data(e).enter().append("rect").attr("class","bar").attr("x",1).attr("height",r.bandwidth()).style("fill",h).attr("y",function(t){return r(t.label)}).attr("width",function(t){return n(t.y)});else if("barchart-grouped"==y){n=d3.scaleBand().rangeRound([0,b]).paddingInner(.1);var v=d3.scaleBand().padding(.05);r=d3.scaleLinear().rangeRound([u,0]);for(var x=t.dataset.colors.split(","),w=[],A=0;A<e[0].y.length;A++)w.push(A);n.domain(e.map(function(t){return t.label})),v.domain(w).rangeRound([0,n.bandwidth()]),r.domain([0,d3.max(e,function(t){return d3.max(w,function(e){return t.y[e]})})]).nice(),l.append("g").selectAll("g").data(e).enter().append("g").attr("transform",function(t){return"translate("+n(t.label)+",0)"}).selectAll("rect").data(function(t){return w.map(function(e){return{key:e,value:t.y[e]}})}).enter().append("rect").attr("x",function(t){return v(t.key)}).attr("y",function(t){return r(t.value)}).attr("width",v.bandwidth()).attr("height",function(t){return u-r(t.value)}).attr("fill",function(t,e){return x[e]}),d3.select(t).append("div").attr("class","bar-label").attr("width","100%").selectAll("p").data(t.dataset.labels.split(",")).enter().append("p").html(function(t,e){return"<div class = 'bubble' style = 'background:"+x[e]+"'></div>"+t})}else if(n=d3.scaleBand().range([0,b]).paddingInner(.2),r=d3.scaleLinear().range([u,0]),n.domain(e.map(function(t){return t.label})),"barchart-stacked"==y){r.domain([0,d3.max(e,function(t){return"number"==typeof t.y?t:t.y.reduce(function(t,e){return t+e},0)})]).nice();var $=0;for(x=t.dataset.colors.split(","),w=[],A=0;A<e[0].y.length;A++)w.push(A);console.log(d3.stack().keys(w)(e)),l.append("g").selectAll("g").data(d3.stack().keys(w)(e)).enter().append("g").attr("fill",function(t,e){return x[e]}).selectAll("rect").data(function(t){return t}).enter().append("rect").attr("x",function(t){return n(t.data.label)}).attr("y",function(t,a){$==e[0].y.length&&($=0);for(var s=t.data.y[$],n=$;n>0;n--)s+=t.data.y[n-1];return $++,r(s)}).attr("height",function(t,a){return $==e[0].y.length&&($=0),u-r(t.data.y[$++])}).attr("width",n.bandwidth()),d3.select(t).append("div").attr("class","bar-label").attr("width","100%").selectAll("p").data(t.dataset.labels.split(",")).enter().append("p").html(function(t,e){return"<div class = 'bubble' style = 'background:"+x[e]+"'></div>"+t})}else r.domain([0,d3.max(e,function(t){return t.y})]),l.selectAll(".bar").data(e).enter().append("rect").attr("class","bar").attr("x",function(t){return n(t.label)}).attr("width",n.bandwidth()).style("fill",h).attr("y",function(t){return r(t.y)}).attr("height",function(t){return u-r(t.y)});l.selectAll(".bar").on("mouseover",function(t,e){s=generateTooltip({title:t.label,responses:t.y,percentage:t.y/a}),g.classed("hidden",!1).html(s),"barchart-horizontal"==y?g.style("left",n(t.y)+p.left+12+"px").style("top",r(t.label)-r.bandwidth()/2+p.top+"px"):g.style("left",n(t.label)+(n.bandwidth()-g.node().offsetWidth)/4+c+"px").style("top",r(t.y)-Math.round(g.node().offsetHeight)+o-12+"px")}).on("mouseout",function(t){var e=d3.event.toElement;e&&e.parentNode.parentNode!=this.parentNode&&e.parentNode!=this.parentNode&&e!=this.parentNode&&g.classed("hidden",!0)}),l.append("g").attr("class","xAxis").attr("transform","translate(0,"+u+")").call(d3.axisBottom(n)),l.append("g").attr("class","y axis").call(d3.axisLeft(r)),l.append("text").attr("transform","rotate(-90)").attr("y",-1*("barchart-horizontal"==y?p.left:c)).attr("x",0-u/2).attr("dy","1em").style("text-anchor","middle").style("font-family","source_sans_pro").style("font-weight","bold").text("barchart-horizontal"==y?f:m),l.append("text").attr("transform","translate("+b/2+" ,"+(u+o+20)+")").style("text-anchor","middle").style("font-family","source_sans_pro").style("font-weight","bold").text("barchart-horizontal"==y?m:f),l.select(".xAxis").selectAll("text").style("font-family","source_sans_pro").style("font-size","12px")}var barCharts=d3.selectAll(".barchart").each(function(){var t=this;$.ajax({url:this.dataset.url,success:function(e){var a=0,s=[];e.split("\n").forEach(function(t){var e=t.split(","),n=e.slice(1);e[0]&&(a+=parseFloat(e[1]),s.push({y:n.length>1?n.map(function(t){return parseFloat(t)}):parseFloat(e[1]),label:e[0]}))}),d3.select(t).append("svg"),dataForBarCharts.push(s),totalForBarCharts.push(a),drawBarChart(t,s,a)},dataType:"text"})}),margin={top:20,right:20,bottom:50,left:50},dataForGraphs=[],totalForGraphs=[],bisectors=[],colorsForGraphs=[],numLinesGraphs=[];function drawGraph(t,e,a,s,n,r,l,o,i,d,c,p,h,u){var f,m=d3.scalePoint().rangeRound([0,s]).padding(.1),g=d3.scaleLinear().rangeRound([n,0]);thisNode=d3.select(t);for(var b,y=[],v=0;v<p;v++)b=d3.line().x(function(t){return m(t.x)}).y(function(t){return g(t.y[v])}),y.push(b);thisNode.select("svg").selectAll("*").remove(),m.domain(e.map(function(t){return""+t.x})),g.domain([0,d3.max(e,function(t){return d3.max(t.y)})]),m.invert=d3.scaleQuantize().domain(m.range()).range(m.domain());var x=thisNode.select("svg").attr("width",s+margin.left+margin.right).attr("height",n+margin.top+margin.bottom).on("mousemove",function(){for(var s,n=m.invert(d3.mouse(this)[0]),r=0;r<e.length;r++)if(e[r].x==n){s=e[r];break}f=p>1?generateTooltipMultiline({title:s.x,responses:s.y,colors:h,total:a,labels:t.dataset.labels.split(",")}):generateTooltip({title:s.x,responses:s.y,percentage:s.y/a}),l.classed("hidden",!1).html(f),l.style("left",m(s.x)+margin.left-Math.round(l.node().offsetWidth/2)+"px").style("top",g(d3.max(s.y))-Math.round(l.node().offsetHeight)-12+margin.top+"px")}).on("mouseout",function(t){var e=d3.event.toElement;e&&e.parentNode.parentNode!=this.parentNode&&e.parentNode!=this.parentNode&&e!=this.parentNode&&l.classed("hidden",!0)}).append("g").attr("transform","translate("+margin.left+","+margin.top+")");for(v=0;v<p;v++)if("false"==c&&x.append("path").data([e]).attr("class","line").style("stroke",h[v]).style("stroke-width","2px").style("fill","none").attr("d",y[v]),"true"==u){var w=d3.area().x(function(t){return m(t.x)}).y0(function(t){return 0==v?n:g(t.y[v-1])}).y1(function(t){return g(t.y[v])});x.append("path").data([e]).attr("fill",h[v]).style("opacity","0.5").style("z-index","20").attr("d",w)}for(v=0;v<p;v++)x.selectAll(".dot-"+v).data(e).enter().append("circle").attr("class","dot-"+v).style("fill",h[v]).attr("cx",function(t){return m(t.x)}).attr("cy",function(t){return g(t.y[v])}).attr("r",5);x.append("g").style("font-family","source_sans_pro").attr("transform","translate(0,"+n+")").call(d3.axisBottom(m)),x.append("g").style("font-family","source_sans_pro").call(d3.axisLeft(g)),x.append("text").attr("transform","rotate(-90)").attr("y",0-margin.left).attr("x",0-n/2).attr("dy","1em").style("text-anchor","middle").style("font-family","source_sans_pro").style("font-weight","bold").text(d),x.append("text").attr("transform","translate("+s/2+" ,"+(n+margin.top+20)+")").style("text-anchor","middle").style("font-family","source_sans_pro").style("font-weight","bold").text(i)}d3.selectAll(".line_chart").each(function(){for(var t=d3.color(this.dataset.accent),e=d3.select(this),a=this,s=this.dataset.csv,n=this.dataset.x,r=this.dataset.y,l=d3.select(this.firstChild),o=this.dataset.lines,i=this,d=[],c=0,p=[],h=0;h<o;h++)p.push(d3.color(t.darker(1.5*h-1)));$.ajax({url:s,success:function(s){s.split("\n").map(function(t){var e=t.split(",");e[0]&&(c+=parseInt(e[1]),d.push({x:e[0],y:e.slice(1).map(function(t){return parseInt(t)})}))});var h=d3.bisector(function(t){return t.x}).right;dataForGraphs.push(d),totalForGraphs.push(c),bisectors.push(h),numLinesGraphs.push(o),colorsForGraphs.push(p);var u=d3.select("#sections").node().offsetWidth-margin.left-margin.right,f=parseInt(a.dataset.height)-margin.top-margin.bottom;if(e.append("svg"),drawGraph(i,d,c,u,f,t,l,h,n,r,a.dataset.scatter,o,p,a.dataset.shade),o>1){var m=a.dataset.labels.split(",");d3.select(a).append("div").attr("class","line-label").attr("width","100%").selectAll("p").data(p).enter().append("p").html(function(t,e){return"<div class = 'bubble' style = 'background:"+t+"'></div> "+m[e]})}},dataType:"text"})}),d3.selectAll(".map").each(function(){var t=0,e=["Discontinuous","Northeast","Southeast","Southwest","West","Midwest","International"],a=d3.color(this.dataset.accent).brighter(1),s=this.dataset.responses.split(",").map(function(a,s){return t+=parseInt(a),{responses:parseInt(a),name:e[s]}}),n=s.slice().sort(function(t,e){return t.responses-e.responses});s=s.map(function(t,e){return{responses:t.responses,name:t.name,color:d3.color(a.darker(.4*n.indexOf(t)))}});var r,l=this,o=d3.select(this.firstChild);d3.svg(this.dataset.url).then(function(e){var n=e.documentElement;d3.select(l).node().appendChild(n),d3.select(n).selectAll("*").data(s).style("fill",function(t,e){return d3.rgb(t.color)}).on("mouseover",function(e,s){d3.select(this).style("fill",d3.rgb(a.brighter(.3))),r=generateTooltip({title:e.name,responses:e.responses,percentage:e.responses/t}),o.classed("hidden",!1).html(r)}).on("mousemove",function(t){var e=d3.mouse(l);o.style("left",e[0]-Math.round(o.node().offsetWidth/2)+"px").style("top",e[1]-Math.round(o.node().offsetHeight)-10+"px")}).on("mouseout",function(t){d3.select(this).style("fill",d3.rgb(t.color)),o.classed("hidden",!0)})})});var multipane=d3.selectAll(".multipane").each(function(){var t=this.dataset.labels.split(","),e=this.id;d3.select(this).insert("div",":first-child").attr("class","multipane-labels").html(function(a){for(var s="",n=0;n<t.length;n++)s+="<a "+(0==n?"class = 'selected'":"")+" onclick = 'switchPane("+n+',"'+e+"\", this)'>"+t[n]+"</a>";return s});for(var a=this.children,s=2;s<a.length;s++)d3.select(a[s]).classed("hidden",!0)});function switchPane(t,e,a){d3.select("#"+e).select(".multipane-labels").selectAll("*").each(function(e,a){a==t?d3.select(this).classed("selected",!0):d3.select(this).classed("selected",!1)}),d3.selectAll("#"+e+">div").each(function(e,a){a>0&&(a-1==t?d3.select(this).classed("hidden",!1):d3.select(this).classed("hidden",!0))})}var resizeId,percentageSliders=d3.selectAll(".percentage-slider").each(function(){var t=parseInt(this.dataset.yes),e=parseInt(this.dataset.no),a=generateTooltip({title:"Yes",responses:t,percentage:t/(t+e)}),s=generateTooltip({title:"No",responses:e,percentage:e/(t+e)}),n=d3.select(this.firstChild),r=parseInt(d3.select(this.children[1]).node().style.width.replace("%","")),l=parseInt(d3.select(this.children[2]).node().style.width.replace("%",""));d3.select(this.children[1]).on("mouseover",function(t){n.classed("hidden",!1).html(a).style("left","calc("+Math.round(r/2)+"% - "+Math.round(n.node().offsetWidth/2)+"px)").style("top","-"+(Math.round(n.node().offsetHeight)+10)+"px")}).on("mouseout",function(t){n.classed("hidden",!0)}),d3.select(this.children[2]).on("mouseover",function(t){n.classed("hidden",!1).html(s).style("left","calc("+Math.round(r+l/2)+"% - "+Math.round(n.node().offsetWidth/2)+"px)").style("top","-"+(Math.round(n.node().offsetHeight)+10)+"px")}).on("mouseout",function(t){n.classed("hidden",!0)})}),pieCharts=d3.selectAll(".pie").each(function(){var t,e,a=this.dataset.responses.split(","),s=this.dataset.labels.split(","),n=this.dataset.colors.split(","),r=2*parseInt(this.dataset.radius)||300,l=2*parseInt(this.dataset.radius)||300,o=parseInt(this.dataset.radius)||150,i=0,d=a.map(function(t,e){return i+=parseInt(t),{label:s[e],value:parseInt(t),color:n[e]}}),c=d3.pie().value(function(t){return t.value}).sort(null),p=d3.arc().outerRadius(o).innerRadius(0),h=d3.select(this).select(".tooltip"),u=this;d3.select(this).style("width",r).style("margin","20px auto");d3.select(this).append("svg").attr("width",r).attr("height",l).append("g").attr("transform","translate("+(r-o)+","+(l-o)+")").selectAll("path").data(c(d)).enter().append("path").attr("fill",function(t,e){return t.data.color}).attr("stroke","white").attr("d",p).on("mouseover",function(e,a){t=generateTooltip({title:e.data.label,responses:e.value,percentage:e.value/i}),h.classed("hidden",!1).html(t)}).on("mousemove",function(t){e=d3.mouse(u),h.style("left",e[0]-Math.round(h.node().offsetWidth/2)+"px").style("top",e[1]-Math.round(h.node().offsetHeight)-12+"px")}).on("mouseout",function(t){h.classed("hidden",!0)});d3.select(this).append("div").attr("class","pie-label").attr("width",r).selectAll("p").data(d).enter().append("p").html(function(t,e){return"<div class = 'bubble' style = 'background:"+t.color+"'></div>"+t.label})});d3.select(window).on("resize",function(){resizeId=setTimeout(function(){d3.selectAll(".line_chart").each(function(t,e){d3.select(this);var a=d3.select("#sections").node().offsetWidth-margin.left-margin.right,s=parseInt(this.dataset.height)-margin.top-margin.bottom;drawGraph(this,dataForGraphs[e],totalForGraphs[e],a,s,this.dataset.accent,d3.select(this.firstChild),bisectors[e],this.dataset.x,this.dataset.y,this.dataset.scatter,numLinesGraphs[e],colorsForGraphs[e],this.dataset.shade)}),d3.selectAll(".barchart").each(function(t,e){drawBarChart(this,dataForBarCharts[e],totalForBarCharts[e])})},500)});