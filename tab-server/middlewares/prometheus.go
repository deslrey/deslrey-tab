package middlewares

import (
	"fmt"
	"strconv"
	"time"

	"tab-server/logs"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
)

const (
	PrometheusNamespace    = "deslrey-tab-data"
	EndpointsDataSubsystem = "endpoints"
)

var (
	endpointsLantencyMonitor = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Namespace: PrometheusNamespace,
			Subsystem: EndpointsDataSubsystem,
			Name:      "deslrey-tab-statistic",
			Help:      "统计耗时数据",
			Buckets:   []float64{1, 5, 10, 20, 50, 100, 500, 1000, 5000, 10000},
		}, []string{EndpointsDataSubsystem},
	)
)

func init() {
	prometheus.MustRegister(
		endpointsLantencyMonitor,
	)
}

func HandleEndpointLantency() gin.HandlerFunc {
	return func(c *gin.Context) {
		endpoint := c.Request.URL.Path
		start := time.Now()

		defer func() {
			lantency := time.Since(start)

			lantencyStr := fmt.Sprintf("%0.3d", lantency.Nanoseconds()/1e6)
			lantencyFloat64, err := strconv.ParseFloat(lantencyStr, 64)
			if err != nil {
				panic(err)
			}

			logs.Logger.Infof("耗时%fms", lantencyFloat64)

			endpointsLantencyMonitor.
				With(prometheus.Labels{EndpointsDataSubsystem: endpoint}).
				Observe(lantencyFloat64)
		}()

		c.Next()
	}
}
