package aggregation

import (
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"sort"
)

// SortableInt64 implements sort.Interface for []int64. This allows to use built in sort with int64.
type SortableInt64 []int64

func (a SortableInt64) Len() int           { return len(a) }
func (a SortableInt64) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a SortableInt64) Less(i, j int) bool { return a[i] < a[j] }

// AggregateData aggregates all the data from dataList using AggregatingFunction with name aggregateName.
// Standard data aggregation function.
func AggregateData(metricList []api.Metric, metricName string, aggregationName api.AggregationMode) api.Metric {
	_, isAggregateAvailable := api.AggregatingFunctions[aggregationName]
	if !isAggregateAvailable {
		aggregationName = api.DefaultAggregation
	}

	aggrMap, newLabel := AggregatingMapFromDataList(metricList, metricName)
	Xs := SortableInt64{}
	for k := range aggrMap {
		Xs = append(Xs, k)
	}
	newDataPoints := []api.DataPoint{}
	sort.Sort(Xs) // ensure X data points are sorted
	for _, x := range Xs {
		y := api.AggregatingFunctions[aggregationName](aggrMap[x])
		newDataPoints = append(newDataPoints, api.DataPoint{x, y})
	}

	// Create new data cell
	return api.Metric{
		DataPoints: newDataPoints,
		MetricName: metricName,
		Label:      newLabel,
		Aggregate:  aggregationName,
	}

}

// AggregatingMapFromDataList for all Data entries of given metric generates a cumulative map X -> [List of all Ys at this X].
// Afterwards this list of Ys can be easily aggregated.
func AggregatingMapFromDataList(metricList []api.Metric, metricName string) (map[int64][]int64, api.Label) {
	newLabel := api.Label{}

	aggrMap := make(map[int64][]int64, 0)
	for _, data := range metricList {
		if data.MetricName != metricName {
			continue
		}
		newLabel = newLabel.AddMetricLabel(data.Label) // update label of resulting data
		for _, dataPoint := range data.DataPoints {
			_, isXPresent := aggrMap[dataPoint.X]
			if !isXPresent {
				aggrMap[dataPoint.X] = []int64{}
			}
			aggrMap[dataPoint.X] = append(aggrMap[dataPoint.X], dataPoint.Y)
		}

	}
	return aggrMap, newLabel
}

func AggregateMetricPromises(metricPromises api.MetricPromises, metricName string,
	aggregations api.AggregationModes, forceLabel api.Label) api.MetricPromises {
	if aggregations == nil || len(aggregations) == 0 {
		aggregations = api.OnlyDefaultAggregation
	}
	result := api.NewMetricPromises(len(aggregations))
	go func() {
		metricList, err := metricPromises.GetMetrics()
		if err != nil {
			result.PutMetrics(metricList, err)
			return
		}
		aggrResult := []api.Metric{}
		for _, aggregation := range aggregations {
			aggregated := AggregateData(metricList, metricName, aggregation)
			if forceLabel != nil {
				aggregated.Label = forceLabel
			}
			aggrResult = append(aggrResult, aggregated)
		}
		result.PutMetrics(aggrResult, nil)
	}()
	return result
}
