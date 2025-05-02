// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package database_test

import (
	"database/sql"
	"log"
	"testing"
	"time"

	"github.com/onsi/ginkgo"
	"github.com/onsi/gomega"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	"k8s.io/metrics/pkg/apis/metrics/v1beta1"
	_ "modernc.org/sqlite"

	"k8s.io/dashboard/metrics-scraper/pkg/database"
)

func TestMetricsUtil(t *testing.T) {
	gomega.RegisterFailHandler(ginkgo.Fail)
	ginkgo.RunSpecs(t, "Sidecar Database Test")
}

func nodeMetrics() v1beta1.NodeMetricsList {
	tmp := v1beta1.NodeMetrics{}
	tmp.SetName("testing")
	tmp.Usage = v1.ResourceList{
		v1.ResourceCPU:    resource.MustParse("1"),
		v1.ResourceMemory: resource.MustParse("100"),
	}

	nm := v1beta1.NodeMetricsList{
		Items: []v1beta1.NodeMetrics{
			tmp,
		},
	}

	return nm
}

func podMetrics() v1beta1.PodMetricsList {
	tmp2 := v1beta1.ContainerMetrics{}
	tmp2.Name = "container_test"
	tmp2.Usage = v1.ResourceList{
		v1.ResourceCPU:    resource.MustParse("1"),
		v1.ResourceMemory: resource.MustParse("100"),
	}

	tmp := v1beta1.PodMetrics{}
	tmp.SetName("testing")
	tmp.Containers = []v1beta1.ContainerMetrics{
		tmp2,
	}

	nm := v1beta1.PodMetricsList{
		Items: []v1beta1.PodMetrics{
			tmp,
		},
	}

	return nm
}

var _ = ginkgo.Describe("Database functions", func() {
	ginkgo.Context("With an in-memory database", func() {
		ginkgo.It("should generate 'nodes' table to dump metrics in.", func() {
			db, err := sql.Open("sqlite", ":memory:")
			if err != nil {
				panic(err.Error())
			}

			defer db.Close()

			err = database.CreateDatabase(db)
			if err != nil {
				panic(err.Error())
			}

			_, err = db.Query("select * from nodes;")
			if err != nil {
				panic(err.Error())
			}
			gomega.Expect(err).To(gomega.BeNil())
		})

		ginkgo.It("should generate 'pods' table to dump metrics in.", func() {
			db, err := sql.Open("sqlite", ":memory:")
			if err != nil {
				panic(err.Error())
			}
			defer db.Close()

			err = database.CreateDatabase(db)
			if err != nil {
				panic(err.Error())
			}

			_, err = db.Query("select * from pods;")
			if err != nil {
				panic(err.Error())
			}
			gomega.Expect(err).To(gomega.BeNil())
		})

		ginkgo.It("should insert metrics into the database.", func() {
			db, err := sql.Open("sqlite", ":memory:")
			if err != nil {
				panic(err.Error())
			}
			defer db.Close()

			err = database.CreateDatabase(db)
			if err != nil {
				panic(err.Error())
			}

			nm := nodeMetrics()
			pm := podMetrics()

			err = database.UpdateDatabase(db, &nm, &pm)
			if err != nil {
				panic(err.Error())
			}

			rows, err := db.Query("select name, cpu, memory from nodes")
			if err != nil {
				log.Fatal(err)
			}
			defer rows.Close()
			for rows.Next() {
				var name string
				var cpu int64
				var memory int64
				err = rows.Scan(&name, &cpu, &memory)
				if err != nil {
					log.Fatal(err)
				}
				testCpu := resource.MustParse("1")
				testMemory := resource.MustParse("100")
				gomega.Expect(err).To(gomega.BeNil())
				gomega.Expect(name).To(gomega.Equal("testing"))
				gomega.Expect(cpu).To(gomega.Equal(testCpu.MilliValue()))
				gomega.Expect(memory).To(gomega.Equal(testMemory.MilliValue() / 1000))
			}

			rows, err = db.Query("select name, container, cpu, memory from pods")
			if err != nil {
				log.Fatal(err)
			}
			defer rows.Close()
			for rows.Next() {
				var name string
				var container string
				var cpu int64
				var memory int64
				err = rows.Scan(&name, &container, &cpu, &memory)
				if err != nil {
					log.Fatal(err)
				}
				testCpu := resource.MustParse("1")
				testMemory := resource.MustParse("100")
				gomega.Expect(err).To(gomega.BeNil())
				gomega.Expect(name).To(gomega.Equal("testing"))
				gomega.Expect(container).To(gomega.Equal("container_test"))
				gomega.Expect(cpu).To(gomega.Equal(testCpu.MilliValue()))
				gomega.Expect(memory).To(gomega.Equal(testMemory.MilliValue() / 1000))
			}
		})
		ginkgo.It("should cull the database based on a window.", func() {
			db, err := sql.Open("sqlite", ":memory:")
			if err != nil {
				panic(err.Error())
			}
			defer db.Close()

			err = database.CreateDatabase(db)
			if err != nil {
				panic(err.Error())
			}

			nm := nodeMetrics()
			pm := podMetrics()

			err = database.UpdateDatabase(db, &nm, &pm)
			if err != nil {
				panic(err.Error())
			}

			sqlStmt := "insert into nodes(name,cpu,memory,storage,time) values('lame','1000','100000','0',datetime('now','-20 minutes'));"
			_, err = db.Exec(sqlStmt)
			if err != nil {
				panic(err.Error())
			}

			timeWindow, err := time.ParseDuration("5m")
			if err != nil {
				panic(err.Error())
			}

			err = database.CullDatabase(db, timeWindow)
			if err != nil {
				panic(err.Error())
			}

			rows, err := db.Query("select name, cpu, memory from nodes")
			if err != nil {
				log.Fatal(err)
			}
			defer rows.Close()
			for rows.Next() {
				var name string
				var cpu int64
				var memory int64
				err = rows.Scan(&name, &cpu, &memory)
				if err != nil {
					log.Fatal(err)
				}
				testCpu := resource.MustParse("1")
				testMemory := resource.MustParse("100")
				gomega.Expect(err).To(gomega.BeNil())
				gomega.Expect(name).To(gomega.Equal("testing"))
				gomega.Expect(cpu).To(gomega.Equal(testCpu.MilliValue()))
				gomega.Expect(memory).To(gomega.Equal(testMemory.MilliValue() / 1000))
			}

		})
	})
})
