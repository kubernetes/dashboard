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

import coresFilter from 'common/filters/cores_filter';
import memoryFilter from 'common/filters/memory_filter';

function precisionFilter(d) {
  if (d < 0.01) {
    return d.toPrecision(1);
  } else if (d < 0.1) {
    return d.toPrecision(2);
  }
  return d.toPrecision(3);
}

class GraphController {
  constructor() {
    /** @export {!Array<!backendApi.Metric>} */
    this.metrics;

    // check if metrics are available
    if (this.metrics instanceof Array && this.metrics.length !== 0) {
      // extract data points by metric name and render graph.
      let toDraw = {};
      for (let i = 0; i < this.metrics.length; i++) {
        let metric = this.metrics[i];
        toDraw[metric.metricName] = metric.dataPoints;
      }
      this.generateGraph(toDraw);
    }
  }

  generateGraph(parsedGraphData) {
    let chart;
    let data;

    nv.addGraph(() => {
      chart = nv.models.multiChart().margin({top: 30, right: 90, bottom: 60, left: 75}).options({
        duration: 300,
        tooltips: true,

        useInteractiveGuideline: true,
      });

      // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the
      // parent chart, so need to chain separately
      chart.xAxis.axisLabel('Time')
          .tickFormat((d) => d3.time.format('%H:%M')(new Date(d)))
          .staggerLabels(true);
      chart.yAxis1.axisLabel('CPU (cores)').tickFormat(function(d) {
        if (d == null) {
          return 'N/A';
        }
        // return d3.format(',.3s')(d);
        return coresFilter(precisionFilter)(d);
      });

      chart.yAxis2.axisLabel('Memory (bytes)').tickFormat(function(d) {
        if (d == null) {
          return 'N/A';
        }
        // return d3.format(',.3s')(d);
        return memoryFilter(precisionFilter)(d);
      });

      chart.interactiveLayer.tooltip.valueFormatter(function(d, i) {
        return chart[`yAxis${i + 1}`].tickFormat()(d);
      });

      data = [
        {
          area: true,
          values: parsedGraphData['cpu/usage_rate'],
          key: 'Cpu Usage',
          color: '#00c752',
          fillOpacity: 0.2,
          strokeWidth: 3,
          type: 'line',
          yAxis: 1,
        },
        {
          area: true,
          values: parsedGraphData['memory/usage'],
          key: 'Memory Usage',
          color: '#326de6',
          fillOpacity: 0.2,
          strokeWidth: 3,
          type: 'line',
          yAxis: 2,
        },
      ];

      let graphArea = d3.select('#metricChart');
      let svg = graphArea.append('svg');

      svg.attr('height', 300).datum(data).call(chart);
      svg.style({
        'background-color': 'white',
        'border-bottom-style': 'solid',
        'border-bottom-width': '1px',
        'border-bottom-color': 'rgba(0, 0, 0, 0.117647)',
      });

      // todo uncomment this block to enable intelligent graph resize.
      // nv.utils.windowResize(chart.update);
      // this.scope.$watch(
      //     function () {
      //       return graphArea.node().getBoundingClientRect().width
      //     },
      //     function ()
      //     {console.log(graphArea.node().getBoundingClientRect().width);chart.update()},//listener
      //     true //deep watch
      // );

      // todo remove this block after enabling intelligent graph resize above.
      (function handleGraphResize() {
        let lastWidth = 0;
        let lastHeight = 0;
        function handleResize() {
          let dims = graphArea.node().getBoundingClientRect();
          if (dims.height !== lastHeight || dims.width !== lastWidth) {
            lastWidth = dims.width;
            lastHeight = dims.height;
            chart.update();
          }
          setTimeout(handleResize, 200);
        }
        handleResize();
      })();

      return chart;
    });
  }
}

export const graphComponent = {
  bindings: {
    'metrics': '<',
  },
  controller: GraphController,
  templateUrl: 'common/components/graph/graph.html',
};
