package main

import (
	"context"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
)

// LoadConfig holds the configuration for load generation
type LoadConfig struct {
	RPS    int    `json:"rps" binding:"required,min=1,max=1000"`
	Target string `json:"target" binding:"required,url"`
}

// LoadStats holds statistics about the load generation
type LoadStats struct {
	Active        bool    `json:"active"`
	TargetRPS     int     `json:"targetRps"`
	ActualRPS     float64 `json:"actualRps"`
	TotalRequests int64   `json:"totalRequests"`
	SuccessCount  int64   `json:"successCount"`
	FailCount     int64   `json:"failCount"`
	SuccessRate   float64 `json:"successRate"`
}

// LoadSimulator manages load generation
type LoadSimulator struct {
	mu            sync.RWMutex
	active        bool
	targetRPS     int
	target        string
	totalRequests int64
	successCount  int64
	failCount     int64
	cancel        context.CancelFunc
	startTime     time.Time
	client        *http.Client
}

var simulator = &LoadSimulator{
	client: &http.Client{
		Timeout: 5 * time.Second,
	},
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.POST("/load/start", startLoad)
	r.POST("/load/stop", stopLoad)
	r.GET("/load/status", getStatus)
	r.GET("/health", healthCheck)

	r.Run(":8002")
}


func startLoad(c *gin.Context) {
	var config LoadConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: rps (1-1000) and target URL required",
		})
		return
	}

	simulator.mu.Lock()
	defer simulator.mu.Unlock()

	if simulator.active {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Load generation already active",
		})
		return
	}

	// Reset counters
	atomic.StoreInt64(&simulator.totalRequests, 0)
	atomic.StoreInt64(&simulator.successCount, 0)
	atomic.StoreInt64(&simulator.failCount, 0)

	simulator.active = true
	simulator.targetRPS = config.RPS
	simulator.target = config.Target
	simulator.startTime = time.Now()

	ctx, cancel := context.WithCancel(context.Background())
	simulator.cancel = cancel

	go runLoadGenerator(ctx, config.RPS, config.Target)

	c.JSON(http.StatusOK, gin.H{
		"message":   "Load generation started",
		"targetRps": config.RPS,
		"target":    config.Target,
	})
}

func stopLoad(c *gin.Context) {
	simulator.mu.Lock()
	defer simulator.mu.Unlock()

	if !simulator.active {
		c.JSON(http.StatusOK, gin.H{
			"message": "Load generation not active",
		})
		return
	}

	if simulator.cancel != nil {
		simulator.cancel()
	}

	// Wait briefly for goroutines to stop
	time.Sleep(100 * time.Millisecond)

	simulator.active = false
	simulator.cancel = nil

	c.JSON(http.StatusOK, gin.H{
		"message":       "Load generation stopped",
		"totalRequests": atomic.LoadInt64(&simulator.totalRequests),
		"successCount":  atomic.LoadInt64(&simulator.successCount),
		"failCount":     atomic.LoadInt64(&simulator.failCount),
	})
}

func getStatus(c *gin.Context) {
	simulator.mu.RLock()
	defer simulator.mu.RUnlock()

	total := atomic.LoadInt64(&simulator.totalRequests)
	success := atomic.LoadInt64(&simulator.successCount)
	fail := atomic.LoadInt64(&simulator.failCount)

	var actualRPS float64
	var successRate float64

	if simulator.active && time.Since(simulator.startTime).Seconds() > 0 {
		actualRPS = float64(total) / time.Since(simulator.startTime).Seconds()
	}

	if total > 0 {
		successRate = float64(success) / float64(total) * 100
	}

	stats := LoadStats{
		Active:        simulator.active,
		TargetRPS:     simulator.targetRPS,
		ActualRPS:     actualRPS,
		TotalRequests: total,
		SuccessCount:  success,
		FailCount:     fail,
		SuccessRate:   successRate,
	}

	c.JSON(http.StatusOK, stats)
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "load-go",
	})
}


func runLoadGenerator(ctx context.Context, rps int, target string) {
	// Calculate interval between requests
	interval := time.Second / time.Duration(rps)
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	// Use a semaphore to limit concurrent requests
	sem := make(chan struct{}, 100) // Max 100 concurrent requests

	for {
		select {
		case <-ctx.Done():
			// Graceful shutdown - wait for in-flight requests
			for i := 0; i < cap(sem); i++ {
				select {
				case sem <- struct{}{}:
				case <-time.After(2 * time.Second):
					return
				}
			}
			return
		case <-ticker.C:
			select {
			case sem <- struct{}{}:
				go func() {
					defer func() { <-sem }()
					makeRequest(target)
				}()
			default:
				// Skip if too many concurrent requests
				atomic.AddInt64(&simulator.failCount, 1)
				atomic.AddInt64(&simulator.totalRequests, 1)
			}
		}
	}
}

func makeRequest(target string) {
	atomic.AddInt64(&simulator.totalRequests, 1)

	resp, err := simulator.client.Get(target)
	if err != nil {
		atomic.AddInt64(&simulator.failCount, 1)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		atomic.AddInt64(&simulator.successCount, 1)
	} else {
		atomic.AddInt64(&simulator.failCount, 1)
	}
}
