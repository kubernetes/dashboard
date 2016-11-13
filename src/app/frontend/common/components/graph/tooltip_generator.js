// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


export function getCustormTooltipGenerator(chart, eventsByDataPointIndex) {
  return (d,uu,uuu) => {
    if (d === null) {
      return '';
    }

    var table = d3.select(document.createElement("table"));

    var theadEnter = table.selectAll("thead")
        .data([d])
        .enter().append("thead");

    theadEnter.append("tr")
        .append("td")
        .attr("colspan", 3)
        .append("strong")
        .classed("x-value", true)
        .html(chart.interactiveLayer.tooltip.headerFormatter()(d.value));


    var tbodyEnter = table.selectAll("tbody")
        .data([d])
        .enter().append("tbody");

    var trowEnter = tbodyEnter.selectAll("tr")
        .data(function (p) {
          return p.series
        })
        .enter()
        .append("tr")
        .classed("highlight", function (p) {
          return p.highlight
        });

    trowEnter.append("td")
        .classed("legend-color-guide", true)
        .append("div")
        .style("background-color", function (p) {
          return p.color
        });

    trowEnter.append("td")
        .classed("key", true)
        .classed("total", function (p) {
          return !!p.total
        })
        .html(function (p, i) {
          return chart.interactiveLayer.tooltip.keyFormatter()(p.key, i)
        });

    trowEnter.append("td")
        .classed("value", true)
        .html(function (p, i) {
          return chart.interactiveLayer.tooltip.valueFormatter()(p.value, i)
        });

    trowEnter.filter(function (p, i) {
      return p.percent !== undefined
    }).append("td")
        .classed("percent", true)
        .html(function (p, i) {
          return "(" + d3.format('%')(p.percent) + ")"
        });

    trowEnter.selectAll("td").each(function (p) {
      if (p.highlight) {
        var opacityScale = d3.scale.linear().domain([0, 1]).range(["#fff", p.color]);
        var opacity = 0.6;
        d3.select(this)
            .style("border-bottom-color", opacityScale(opacity))
            .style("border-top-color", opacityScale(opacity))
        ;
      }
    });

    var html = table.node().outerHTML;
    if (d.footer !== undefined)
      html += "<div class='footer'>" + d.footer + "</div>";

    html += `<hr>`;
    html += `<div class='footer'>  ${i18n.MSG_EVENT_NUMBER_LABEL}<b>${eventsByDataPointIndex[d.index].length}</b> </div>`;
    html += `<div class='footer'><i>(${i18n.MSG_EXPAND_EVENTS_PROMPT})</i></div>`;

    return html;

  };
}

const i18n = {
  /** @export {string} @desc Name of the CPU usage metric as displayed in the legend. */
  MSG_EVENT_NUMBER_LABEL: goog.getMsg('Number of events:'),
  /** @export {string} @desc Name of the CPU usage metric as displayed in the legend. */
  MSG_EXPAND_EVENTS_PROMPT: goog.getMsg('click to see'),
}