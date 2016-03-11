package main

import (
	info "github.com/google/cadvisor/info/v1"
	"reflect"
	"testing"
	"time"
)

func TestGetNodeStats(t *testing.T) {
	timestamp := time.Now()
	machineInfo := &info.MachineInfo{NumCores: 1}
	containerInfo := &info.ContainerInfo{
		Spec: info.ContainerSpec{
			Memory: info.MemorySpec{Limit: 1000},
		},
		Stats: []*info.ContainerStats{
			{
				Cpu:       info.CpuStats{Usage: info.CpuUsage{Total: 100}},
				Memory:    info.MemoryStats{Usage: 100},
				Timestamp: timestamp,
			},
			{
				Cpu:       info.CpuStats{Usage: info.CpuUsage{Total: 200}},
				Memory:    info.MemoryStats{Usage: 200},
				Timestamp: timestamp,
			},
			{
				Cpu:       info.CpuStats{Usage: info.CpuUsage{Total: 300}},
				Memory:    info.MemoryStats{Usage: 300},
				Timestamp: timestamp,
			},
		}}
	expected := &NodeStats{
		CpuCores:    1,
		MemoryLimit: 1000,
		Stats: []NodeStat{
			{
				Cpu:              200,
				CpuPercentage:    100,
				Memory:           200,
				MemoryPercentage: 20,
				Timestamp:        timestamp,
			},
			{
				Cpu:              300,
				CpuPercentage:    100,
				Memory:           300,
				MemoryPercentage: 30,
				Timestamp:        timestamp,
			},
		}}
	stats := getNodeStats(machineInfo, containerInfo)

	if !reflect.DeepEqual(stats, expected) {
		t.Errorf("getNodeStats(%#v, %#v) == %#v, expected %#v",
			machineInfo, containerInfo, stats, expected)
	}
}

func TestGetNanosecondTimeInterval(t *testing.T) {
	baseTime := time.Now()
	cases := []struct {
		prev     time.Time
		curr     time.Time
		expected int64
	}{
		{baseTime, baseTime.Add(1 * time.Second), int64(1000000000)},
		{baseTime, baseTime.Add(3 * time.Second), int64(3000000000)},
	}

	for _, c := range cases {
		nanoseconds := getNanosecondTimeInterval(c.curr, c.prev)
		if nanoseconds != c.expected {
			t.Errorf("getNanosecondTimeInterval(%#v, %#v) == %d, expected %d",
				c.curr, c.prev, nanoseconds, c.expected)
		}
	}
}

func TestCalculateCpuPercentage(t *testing.T) {
	var b float64 = 1000000000

	cases := []struct {
		numCores  int
		currTotal uint64
		prevTotal uint64
		interval  int64
		expected  float64
	}{
		{1, uint64(2 * b), uint64(1.5 * b), int64(1 * b), 50},
		{2, uint64(2 * b), uint64(1.5 * b), int64(1 * b), 25},
		{4, uint64(2 * b), uint64(1.75 * b), int64(1 * b), 6.25},
		{2, uint64(2 * b), uint64(1 * b), int64(1 * b), 50},
	}

	for _, c := range cases {
		percentage := calculateCpuPercentage(
			c.numCores, c.currTotal, c.prevTotal, c.interval)

		if percentage != c.expected {
			t.Errorf("calculateCpuPercentage(%d, %d, %d, %d) == %f, expected %f",
				c.numCores, c.currTotal, c.prevTotal, c.interval, percentage, c.expected)
		}
	}
}

func TestCalculateMemoryPercentage(t *testing.T) {
	cases := []struct {
		usage    uint64
		total    uint64
		expected float64
	}{
		{100, 200, 50},
		{100, 100, 100},
		{100, 125, 80},
	}

	for _, c := range cases {
		percentage := calculateMemoryPercentage(c.usage, c.total)
		if percentage != c.expected {
			t.Errorf("calculateMemoryPercentage(%d, %d) == %f, expected %f",
				c.usage, c.total, percentage, c.expected)
		}
	}
}
