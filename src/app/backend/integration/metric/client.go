package metric

type MetricClient interface {
	DownloadMetric(selectors []ResourceSelector, metricName string) MetricPromises
	DownloadMetrics(selectors []ResourceSelector, metricNames []string) MetricPromises
	AggregateMetrics(metrics MetricPromises, aggregations AggregationModes) MetricPromises

	HealthCheck() error
}