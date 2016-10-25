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

package handler

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"

	clientK8s "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/client/unversioned/clientcmd"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	// "github.com/kubernetes/dashboard/src/app/backend/client"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type webSocketHandler struct {
	client       *clientK8s.Client
	clientConfig clientcmd.ClientConfig
	verber       common.ResourceVerber
}

func CreateWebSocketHandler(client *clientK8s.Client, clientConfig clientcmd.ClientConfig) http.Handler {
	r := mux.NewRouter()
	verber := common.NewResourceVerber(client.RESTClient, client.ExtensionsClient.RESTClient,
		client.AppsClient.RESTClient, client.BatchClient.RESTClient)

	wsHandler := webSocketHandler{
		client:       client,
		clientConfig: clientConfig,
		verber:       verber,
	}

	r.HandleFunc("/pod/{namespace}/{pod}/exec", wsHandler.handleExecIntoPod)

	return r
}

func (handler *webSocketHandler) handleExecIntoPod(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	log.Println(vars)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	// Echo handler for now
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		if err = conn.WriteMessage(messageType, p); err != nil {
			log.Println(err)
			return
		}
	}
}
