// Copyright 2017 The Kubernetes Authors.
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

import {NgModule} from '@angular/core';

import {SharedModule} from '../../shared.module';
import {ResourceModule} from '../services/resource/module';

import {ActionbarComponent} from './actionbar/component';
import {ActionbarDetailActionsComponent} from './actionbar/detailactions/component';
import {ActionbarDetailDeleteComponent} from './actionbar/detailactions/delete/component';
import {ActionbarDetailEditComponent} from './actionbar/detailactions/edit/component';
import {DefaultDetailsActionbar} from './actionbars/defaultdetail/component';
import {NamespaceDetailsActionbar} from './actionbars/namespacedetail/component';
import {AllocationChartComponent} from './allocationchart/component';
import {BreadcrumbsComponent} from './breadcrumbs/component';
import {CardComponent} from './card/component';
import {ChipDialog} from './chips/chipdialog/dialog';
import {ChipsComponent} from './chips/component';
import {CommaSeparatedListComponent} from './commaseparatedlist/component';
import {ConditionListComponent} from './condition/component';
import {ContainerCardComponent} from './container/component';
import {CreatorCardComponent} from './creator/component';
import {ExternalEndpointComponent} from './endpoint/external/component';
import {InternalEndpointComponent} from './endpoint/internal/component';
import {HiddenPropertyComponent} from './hiddenproperty/component';
import {ColumnComponent} from './list/column/component';
import {LogsButtonComponent} from './list/column/logsbutton/component';
import {MenuComponent} from './list/column/menu/component';
import {CardListFilterComponent} from './list/filter/component';
import {RowDetailComponent} from './list/rowdetail/component';
import {LoadingSpinner} from './list/spinner/component';
import {ListZeroStateComponent} from './list/zerostate/component';
import {NamespaceChangeDialog} from './namespace/changedialog/dialog';
import {NamespaceSelectorComponent} from './namespace/component';
import {ObjectMetaComponent} from './objectmeta/component';
import {PodStatusCardComponent} from './podstatus/component';
import {PolicyRuleListComponent} from './policyrule/component';
import {PropertyComponent} from './property/component';
import {ProxyComponent} from './proxy/component';
import {ClusterRoleListComponent} from './resourcelist/clusterrole/component';
import {ConfigMapListComponent} from './resourcelist/configmap/component';
import {CronJobListComponent} from './resourcelist/cronjob/component';
import {DaemonSetListComponent} from './resourcelist/daemonset/component';
import {DeploymentListComponent} from './resourcelist/deployment/component';
import {EventListComponent} from './resourcelist/event/component';
import {IngressListComponent} from './resourcelist/ingress/component';
import {JobListComponent} from './resourcelist/job/component';
import {NamespaceListComponent} from './resourcelist/namespace/component';
import {NodeListComponent} from './resourcelist/node/component';
import {PersistentVolumeListComponent} from './resourcelist/persistentvolume/component';
import {PersistentVolumeClaimListComponent} from './resourcelist/persistentvolumeclaim/component';
import {PodListComponent} from './resourcelist/pod/component';
import {ReplicaSetListComponent} from './resourcelist/replicaset/component';
import {ReplicationControllerListComponent} from './resourcelist/replicationcontroller/component';
import {SecretListComponent} from './resourcelist/secret/component';
import {ServiceListComponent} from './resourcelist/service/component';
import {StatefulSetListComponent} from './resourcelist/statefulset/component';
import {StorageClassListComponent} from './resourcelist/storageclass/component';
import {TextInputComponent} from './textinput/component';
import {UploadFileComponent} from './uploadfile/component';
import {ZeroStateComponent} from './zerostate/component';

@NgModule({
  imports: [
    SharedModule,
    ResourceModule,
  ],
  declarations: [
    AllocationChartComponent,
    CardComponent,
    ActionbarComponent,
    BreadcrumbsComponent,
    PropertyComponent,
    ObjectMetaComponent,
    ChipsComponent,
    LoadingSpinner,
    CardListFilterComponent,
    ProxyComponent,
    PodListComponent,
    NodeListComponent,
    ReplicaSetListComponent,
    NamespaceListComponent,
    PersistentVolumeListComponent,
    ListZeroStateComponent,
    ZeroStateComponent,
    ClusterRoleListComponent,
    StorageClassListComponent,
    CronJobListComponent,
    DaemonSetListComponent,
    DeploymentListComponent,
    JobListComponent,
    ReplicationControllerListComponent,
    StatefulSetListComponent,
    ConfigMapListComponent,
    SecretListComponent,
    PersistentVolumeClaimListComponent,
    IngressListComponent,
    ServiceListComponent,
    ExternalEndpointComponent,
    InternalEndpointComponent,
    ChipDialog,
    TextInputComponent,
    RowDetailComponent,
    ColumnComponent,
    LogsButtonComponent,
    MenuComponent,
    HiddenPropertyComponent,
    EventListComponent,
    ContainerCardComponent,
    ConditionListComponent,
    CreatorCardComponent,
    PodStatusCardComponent,
    NamespaceSelectorComponent,
    NamespaceChangeDialog,
    PolicyRuleListComponent,
    CommaSeparatedListComponent,
    ActionbarDetailActionsComponent,
    ActionbarDetailDeleteComponent,
    ActionbarDetailEditComponent,
    UploadFileComponent,
    DefaultDetailsActionbar,
    NamespaceDetailsActionbar,
  ],
  exports: [
    AllocationChartComponent,
    CardComponent,
    ActionbarComponent,
    BreadcrumbsComponent,
    PropertyComponent,
    ObjectMetaComponent,
    ChipsComponent,
    LoadingSpinner,
    CardListFilterComponent,
    ProxyComponent,
    PodListComponent,
    NodeListComponent,
    ReplicaSetListComponent,
    NamespaceListComponent,
    PersistentVolumeListComponent,
    ZeroStateComponent,
    ClusterRoleListComponent,
    StorageClassListComponent,
    CronJobListComponent,
    DaemonSetListComponent,
    DeploymentListComponent,
    JobListComponent,
    ReplicationControllerListComponent,
    StatefulSetListComponent,
    ConfigMapListComponent,
    SecretListComponent,
    PersistentVolumeClaimListComponent,
    IngressListComponent,
    ServiceListComponent,
    ExternalEndpointComponent,
    InternalEndpointComponent,
    TextInputComponent,
    HiddenPropertyComponent,
    EventListComponent,
    ContainerCardComponent,
    ConditionListComponent,
    CreatorCardComponent,
    PodStatusCardComponent,
    NamespaceSelectorComponent,
    PolicyRuleListComponent,
    CommaSeparatedListComponent,
    ActionbarDetailActionsComponent,
    ActionbarDetailDeleteComponent,
    ActionbarDetailEditComponent,
    UploadFileComponent,
    DefaultDetailsActionbar,
    NamespaceDetailsActionbar,
  ],
  entryComponents: [
    ChipDialog,
    RowDetailComponent,
    LogsButtonComponent,
    MenuComponent,
    NamespaceChangeDialog,
  ]
})
export class ComponentsModule {}
