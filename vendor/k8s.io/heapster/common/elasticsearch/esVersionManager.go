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
package elasticsearch

import (
	"fmt"
	"github.com/golang/glog"
	"github.com/pborman/uuid"
	"golang.org/x/net/context"
	elastic2 "gopkg.in/olivere/elastic.v3"
	elastic5 "gopkg.in/olivere/elastic.v5"
	"time"
)

type UnsupportedVersion struct{}

func (UnsupportedVersion) Error() string {
	return "Unsupported ElasticSearch Client Version"
}

type esClient struct {
	version         int
	clientV2        *elastic2.Client
	clientV5        *elastic5.Client
	bulkProcessorV2 *elastic2.BulkProcessor
	bulkProcessorV5 *elastic5.BulkProcessor
	pipeline        string
}

func NewMockClient() *esClient {
	return &esClient{}
}
func newEsClientV5(startupFns []elastic5.ClientOptionFunc, bulkWorkers int, pipeline string) (*esClient, error) {
	client, err := elastic5.NewClient(startupFns...)
	if err != nil {
		return nil, fmt.Errorf("Failed to an ElasticSearch Client: %v", err)
	}
	bps, err := client.BulkProcessor().
		Name("ElasticSearchWorker").
		Workers(bulkWorkers).
		After(bulkAfterCB).
		BulkActions(1000).               // commit if # requests >= 1000
		BulkSize(2 << 20).               // commit if size of requests >= 2 MB
		FlushInterval(10 * time.Second). // commit every 10s
		Do(context.Background())
	if err != nil {
		return nil, fmt.Errorf("Failed to an ElasticSearch Bulk Processor: %v", err)
	}
	return &esClient{version: 5, clientV5: client, bulkProcessorV5: bps, pipeline: pipeline}, nil
}
func newEsClientV2(startupFns []elastic2.ClientOptionFunc, bulkWorkers int) (*esClient, error) {
	client, err := elastic2.NewClient(startupFns...)
	if err != nil {
		return nil, fmt.Errorf("Failed to an ElasticSearch Client: %v", err)
	}
	bps, err := client.BulkProcessor().
		Name("ElasticSearchWorker").
		Workers(bulkWorkers).
		After(bulkAfterCB_v2).
		BulkActions(1000).               // commit if # requests >= 1000
		BulkSize(2 << 20).               // commit if size of requests >= 2 MB
		FlushInterval(10 * time.Second). // commit every 10s
		Do()
	if err != nil {
		return nil, fmt.Errorf("Failed to an ElasticSearch Bulk Processor: %v", err)
	}
	return &esClient{version: 2, clientV2: client, bulkProcessorV2: bps}, nil
}

func (es *esClient) IndexExists(indices ...string) (bool, error) {
	switch es.version {
	case 2:
		return es.clientV2.IndexExists(indices...).Do()
	case 5:
		return es.clientV5.IndexExists(indices...).Do(context.Background())
	default:
		return false, UnsupportedVersion{}
	}
}

func (es *esClient) CreateIndex(name string, mapping string) (interface{}, error) {
	switch es.version {
	case 2:
		return es.clientV2.CreateIndex(name).BodyString(mapping).Do()
	case 5:
		return es.clientV5.CreateIndex(name).BodyString(mapping).Do(context.Background())
	default:
		return nil, UnsupportedVersion{}
	}
}

func (es *esClient) GetAliases(index string) (interface{}, error) {
	switch es.version {
	case 2:
		return es.clientV2.Aliases().Index(index).Do()
	case 5:
		return es.clientV5.Aliases().Index(index).Do(context.Background())
	default:
		return nil, UnsupportedVersion{}
	}
}

func (es *esClient) AddAlias(index string, alias string) (interface{}, error) {
	switch es.version {
	case 2:
		return es.clientV2.Alias().Add(index, alias).Do()
	case 5:
		return es.clientV5.Alias().Add(index, alias).Do(context.Background())
	default:
		return nil, UnsupportedVersion{}
	}
}

func (es *esClient) AddBulkReq(index, typeName string, data interface{}) error {
	switch es.version {
	case 2:
		es.bulkProcessorV2.Add(elastic2.NewBulkIndexRequest().
			Index(index).
			Type(typeName).
			Id(uuid.NewUUID().String()).
			Doc(data))
		return nil
	case 5:
		req := elastic5.NewBulkIndexRequest().
			Index(index).
			Type(typeName).
			Id(uuid.NewUUID().String()).
			Doc(data)
		if es.pipeline != "" {
			req.Pipeline(es.pipeline)
		}

		es.bulkProcessorV5.Add(req)
		return nil
	default:
		return UnsupportedVersion{}
	}
}

func (es *esClient) FlushBulk() error {
	switch es.version {
	case 2:
		return es.bulkProcessorV2.Flush()
	case 5:
		return es.bulkProcessorV5.Flush()
	default:
		return UnsupportedVersion{}
	}
}

func bulkAfterCB_v2(_ int64, _ []elastic2.BulkableRequest, response *elastic2.BulkResponse, err error) {
	if err != nil {
		glog.Warningf("Failed to execute bulk operation to ElasticSearch: %v", err)
	}

	if response.Errors {
		for _, list := range response.Items {
			for name, itm := range list {
				if itm.Error != nil {
					glog.V(3).Infof("Failed to execute bulk operation to ElasticSearch on %s: %v", name, itm.Error)
				}
			}
		}
	}
}
func bulkAfterCB(_ int64, _ []elastic5.BulkableRequest, response *elastic5.BulkResponse, err error) {
	if err != nil {
		glog.Warningf("Failed to execute bulk operation to ElasticSearch: %v", err)
	}

	if response.Errors {
		for _, list := range response.Items {
			for name, itm := range list {
				if itm.Error != nil {
					glog.V(3).Infof("Failed to execute bulk operation to ElasticSearch on %s: %v", name, itm.Error)
				}
			}
		}
	}
}
