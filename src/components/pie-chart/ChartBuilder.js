import mimeTypes from '../../core/mime-types';
import * as d3 from 'd3';

export default function (groups, parentNode, config) {
  var radius = Math.min(config.width, config.height) / 2,
    arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius / 2),
    labelArc = d3.arc()
      .outerRadius(radius - 5)
      .innerRadius(radius - 5),
    pie = d3.pie()
      .sort(null)
      .value(function (d) { return d.count; });

  console.log(groups);
  var data = pie(groups),
    keyFn = (x) => { return x.data.type; };

  var parent = d3.select(parentNode);


  // Pie slices -------------------- //
  var path = parent.selectAll('path')
    .data(data, keyFn); // UPDATE
  path
    .enter() // ENTER
    .append('path')
    .merge(path) // ENTER + UPDATE

    .attr('d', arc)
    .style('fill', function (d) {
      return mimeTypes.types[d.data.type].color;
    })
    .style('fill-opacity', 0)
    .transition()
    .duration(500)
    .style('fill-opacity', 1);

  path.exit()
    .transition()
    .duration(500)
    .style('fill-opacity', 0)
    .remove(); // EXIT

  // Labels ----------------------- //
  var text = parent.selectAll('text')
    .data(data, keyFn);
  text
    .enter() // ENTER
    .append("text")
    .attr('dy', '0.5em')
    .style('font-size', '0.7em')
    .merge(text) // ENTER + UPDATE
    .transition()
    .duration(500)
    .attr("transform", (d) => {
      var angle = (d.startAngle + d.endAngle) / 2,
        degrees = displayAngle(angle);

      if (degrees > 90) {
        degrees -= 180;
      }

      return `translate(${labelArc.centroid(d)}) rotate(${degrees} 0 0)`;
    })
    .style("text-anchor", function (d) {
      var angle = (d.startAngle + d.endAngle) / 2,
        degrees = displayAngle(angle);

      return (degrees > 90 ? 'end' : 'start');
    })
    .text(function (d) {
      var label = mimeTypes.types[d.data.type].label;
      return `${label} (${d.data.count})`;
    });

  text.exit() // EXIT
    .transition()
    .duration(500)
    .style('fill-opacity', 0)
    .remove();


  function displayAngle(radians) {
    var degrees = (radians * 180) / Math.PI;
    degrees -= 90;
    return degrees;
  }
}
