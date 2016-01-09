package main

import (
	"encoding/json"
	"fmt"
	"github.com/google/cadvisor/info/v1"
	"io/ioutil"
	"net/http"
	"time"
)

type NodeStats struct {
	CpuCores    int        `json:"cpuCores"`
	MemoryLimit uint64     `json:"memoryLimit"`
	Stats       []NodeStat `json:"stats"`
}

type NodeStat struct {
	Cpu              uint64    `json:"cpu"`
	CpuPercentage    float64   `json:"cpuPercentage"`
	Memory           uint64    `json:"memory"`
	MemoryPercentage float64   `json:"memoryPercentage"`
	Timestamp        time.Time `json:"timestamp"`
}

func GetNodeStats(host string) (*NodeStats, error) {
	machineInfo, err := getMachineInfo(host)
	if err != nil {
		return nil, err
	}

	containerInfo, err := getContainerInfo(host)
	if err != nil {
		return nil, err
	}

	return getNodeStats(machineInfo, containerInfo), nil
}

func getNodeStats(machineInfo *v1.MachineInfo, containerInfo *v1.ContainerInfo) *NodeStats {
	stats := &NodeStats{
		CpuCores:    machineInfo.NumCores,
		MemoryLimit: containerInfo.Spec.Memory.Limit,
	}

	for i, stat := range containerInfo.Stats {
		// skip if no previous stats
		if i-1 < 0 {
			continue
		}

		stats.Stats = append(
			stats.Stats,
			calculateStats(stats, stat, containerInfo.Stats[i-1]))
	}

	return stats
}

func getMachineInfo(host string) (*v1.MachineInfo, error) {
	resp, err := http.Get(fmt.Sprintf("http://%s:4194/api/v2.0/machine", host))
	if err != nil {
		return nil, err
	}
	if resp == nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var machineInfo v1.MachineInfo
	if err := json.Unmarshal(body, &machineInfo); err != nil {
		return nil, err
	}
	return &machineInfo, nil
}

func getContainerInfo(host string) (*v1.ContainerInfo, error) {
	resp, err := http.Get(fmt.Sprintf("http://%s:4194/api/v1.0/containers", host))
	if err != nil {
		return nil, err
	}
	if resp == nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var containerInfo v1.ContainerInfo
	if err := json.Unmarshal(body, &containerInfo); err != nil {
		return nil, err
	}
	return &containerInfo, nil
}

func calculateStats(nodeStats *NodeStats, currStats *v1.ContainerStats, prevStats *v1.ContainerStats) NodeStat {
	return NodeStat{
		Cpu: currStats.Cpu.Usage.Total,
		CpuPercentage: calculateCpuPercentage(
			nodeStats.CpuCores,
			currStats.Cpu.Usage.Total,
			prevStats.Cpu.Usage.Total,
			getNanosecondTimeInterval(
				currStats.Timestamp,
				prevStats.Timestamp)),
		Memory: currStats.Memory.Usage,
		MemoryPercentage: calculateMemoryPercentage(
			currStats.Memory.Usage,
			nodeStats.MemoryLimit),
		Timestamp: currStats.Timestamp,
	}
}

func getNanosecondTimeInterval(currTime time.Time, prevTime time.Time) int64 {
	return currTime.UnixNano() - prevTime.UnixNano()
}

func calculateCpuPercentage(numCores int, currTotal uint64, prevTotal uint64, interval int64) float64 {
	rawUsage := float64(currTotal) - float64(prevTotal)
	cpuUsagePercentage := ((rawUsage / float64(interval)) / float64(numCores)) * 100
	if cpuUsagePercentage > 100 {
		return 100
	}
	return cpuUsagePercentage
}

func calculateMemoryPercentage(usage uint64, total uint64) float64 {
	return float64(usage) / float64(total) * 100
}
