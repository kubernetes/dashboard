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
	"net/url"
	"strconv"
	"time"

	"github.com/golang/glog"

	"errors"
	elastic2 "gopkg.in/olivere/elastic.v3"
	elastic5 "gopkg.in/olivere/elastic.v5"
	"os"
)

const (
	ESIndex       = "heapster"
	ESClusterName = "default"
)

type ElasticSearchService struct {
	EsClient    *esClient
	baseIndex   string
	ClusterName string
}

func (esSvc *ElasticSearchService) Index(date time.Time) string {
	return date.Format(fmt.Sprintf("%s-2006.01.02", esSvc.baseIndex))
}
func (esSvc *ElasticSearchService) IndexAlias(date time.Time, typeName string) string {
	return date.Format(fmt.Sprintf("%s-%s-2006.01.02", esSvc.baseIndex, typeName))
}

func (esSvc *ElasticSearchService) FlushData() error {
	return esSvc.EsClient.FlushBulk()
}

// SaveDataIntoES save metrics and events to ES by using ES client
func (esSvc *ElasticSearchService) SaveData(date time.Time, typeName string, sinkData []interface{}) error {
	if typeName == "" || len(sinkData) == 0 {
		return nil
	}

	indexName := esSvc.Index(date)

	// Use the IndexExists service to check if a specified index exists.
	exists, err := esSvc.EsClient.IndexExists(indexName)
	if err != nil {
		return err
	}

	if !exists {
		// Create a new index.
		createIndex, err := esSvc.EsClient.CreateIndex(indexName, mapping)
		if err != nil {
			return err
		}

		ack := false
		switch i := createIndex.(type) {
		case *elastic2.IndicesCreateResult:
			ack = i.Acknowledged
		case *elastic5.IndicesCreateResult:
			ack = i.Acknowledged
		}
		if !ack {
			return errors.New("Failed to acknoledge index creation")
		}
	}

	aliases, err := esSvc.EsClient.GetAliases(indexName)
	if err != nil {
		return err
	}
	aliasName := esSvc.IndexAlias(date, typeName)

	hasAlias := false
	switch a := aliases.(type) {
	case *elastic2.AliasesResult:
		hasAlias = a.Indices[indexName].HasAlias(aliasName)
	case *elastic5.AliasesResult:
		hasAlias = a.Indices[indexName].HasAlias(aliasName)
	}
	if !hasAlias {
		createAlias, err := esSvc.EsClient.AddAlias(indexName, esSvc.IndexAlias(date, typeName))
		if err != nil {
			return err
		}

		ack := false
		switch i := createAlias.(type) {
		case *elastic2.AliasResult:
			ack = i.Acknowledged
		case *elastic5.AliasResult:
			ack = i.Acknowledged
		}
		if !ack {
			return errors.New("Failed to acknoledge index alias creation")
		}
	}

	for _, data := range sinkData {
		esSvc.EsClient.AddBulkReq(indexName, typeName, data)
	}

	return nil
}

// CreateElasticSearchConfig creates an ElasticSearch configuration struct
// which contains an ElasticSearch client for later use
func CreateElasticSearchService(uri *url.URL) (*ElasticSearchService, error) {

	var esSvc ElasticSearchService
	opts, err := url.ParseQuery(uri.RawQuery)
	if err != nil {
		return nil, fmt.Errorf("Failed to parser url's query string: %s", err)
	}

	version := 5
	if len(opts["ver"]) > 0 {
		version, err = strconv.Atoi(opts["ver"][0])
		if err != nil {
			return nil, fmt.Errorf("Failed to parse URL's version value into an int: %v", err)
		}
	}

	esSvc.ClusterName = ESClusterName
	if len(opts["cluster_name"]) > 0 {
		esSvc.ClusterName = opts["cluster_name"][0]
	}

	// set the index for es,the default value is "heapster"
	esSvc.baseIndex = ESIndex
	if len(opts["index"]) > 0 {
		esSvc.baseIndex = opts["index"][0]
	}

	var startupFnsV5 []elastic5.ClientOptionFunc
	var startupFnsV2 []elastic2.ClientOptionFunc

	// Set the URL endpoints of the ES's nodes. Notice that when sniffing is
	// enabled, these URLs are used to initially sniff the cluster on startup.
	if len(opts["nodes"]) > 0 {
		startupFnsV2 = append(startupFnsV2, elastic2.SetURL(opts["nodes"]...))
		startupFnsV5 = append(startupFnsV5, elastic5.SetURL(opts["nodes"]...))
	} else if uri.Scheme != "" && uri.Host != "" {
		startupFnsV2 = append(startupFnsV2, elastic2.SetURL(uri.Scheme+"://"+uri.Host))
		startupFnsV5 = append(startupFnsV5, elastic5.SetURL(uri.Scheme+"://"+uri.Host))
	} else {
		return nil, errors.New("There is no node assigned for connecting ES cluster")
	}

	// If the ES cluster needs authentication, the username and secret
	// should be set in sink config.Else, set the Authenticate flag to false
	if len(opts["esUserName"]) > 0 && len(opts["esUserSecret"]) > 0 {
		startupFnsV2 = append(startupFnsV2, elastic2.SetBasicAuth(opts["esUserName"][0], opts["esUserSecret"][0]))
		startupFnsV5 = append(startupFnsV5, elastic5.SetBasicAuth(opts["esUserName"][0], opts["esUserSecret"][0]))
	}

	if len(opts["maxRetries"]) > 0 {
		maxRetries, err := strconv.Atoi(opts["maxRetries"][0])
		if err != nil {
			return nil, errors.New("Failed to parse URL's maxRetries value into an int")
		}
		startupFnsV2 = append(startupFnsV2, elastic2.SetMaxRetries(maxRetries))
		startupFnsV5 = append(startupFnsV5, elastic5.SetMaxRetries(maxRetries))
	}

	if len(opts["healthCheck"]) > 0 {
		healthCheck, err := strconv.ParseBool(opts["healthCheck"][0])
		if err != nil {
			return nil, errors.New("Failed to parse URL's healthCheck value into a bool")
		}
		startupFnsV2 = append(startupFnsV2, elastic2.SetHealthcheck(healthCheck))
		startupFnsV5 = append(startupFnsV5, elastic5.SetHealthcheck(healthCheck))
	}

	if len(opts["startupHealthcheckTimeout"]) > 0 {
		timeout, err := time.ParseDuration(opts["startupHealthcheckTimeout"][0] + "s")
		if err != nil {
			return nil, fmt.Errorf("Failed to parse URL's startupHealthcheckTimeout: %s", err.Error())
		}
		startupFnsV2 = append(startupFnsV2, elastic2.SetHealthcheckTimeoutStartup(timeout))
		startupFnsV5 = append(startupFnsV5, elastic5.SetHealthcheckTimeoutStartup(timeout))
	}

	if os.Getenv("AWS_ACCESS_KEY_ID") != "" || os.Getenv("AWS_ACCESS_KEY") != "" ||
		os.Getenv("AWS_SECRET_ACCESS_KEY") != "" || os.Getenv("AWS_SECRET_KEY") != "" {
		glog.Info("Configuring with AWS credentials..")

		awsClient, err := createAWSClient()
		if err != nil {
			return nil, err
		}

		startupFnsV2 = append(startupFnsV2, elastic2.SetHttpClient(awsClient), elastic2.SetSniff(false))
		startupFnsV5 = append(startupFnsV5, elastic5.SetHttpClient(awsClient), elastic5.SetSniff(false))
	} else {
		if len(opts["sniff"]) > 0 {
			sniff, err := strconv.ParseBool(opts["sniff"][0])
			if err != nil {
				return nil, errors.New("Failed to parse URL's sniff value into a bool")
			}
			startupFnsV2 = append(startupFnsV2, elastic2.SetSniff(sniff))
			startupFnsV5 = append(startupFnsV5, elastic5.SetSniff(sniff))
		}
	}

	bulkWorkers := 5
	if len(opts["bulkWorkers"]) > 0 {
		bulkWorkers, err = strconv.Atoi(opts["bulkWorkers"][0])
		if err != nil {
			return nil, errors.New("Failed to parse URL's bulkWorkers value into an int")
		}
	}

	pipeline := ""
	if len(opts["pipeline"]) > 0 {
		pipeline = opts["pipeline"][0]
	}

	switch version {
	case 2:
		esSvc.EsClient, err = newEsClientV2(startupFnsV2, bulkWorkers)
	case 5:
		esSvc.EsClient, err = newEsClientV5(startupFnsV5, bulkWorkers, pipeline)
	default:
		return nil, UnsupportedVersion{}
	}
	if err != nil {
		return nil, fmt.Errorf("Failed to create ElasticSearch client: %v", err)
	}

	glog.V(2).Infof("ElasticSearch sink configure successfully")

	return &esSvc, nil
}
