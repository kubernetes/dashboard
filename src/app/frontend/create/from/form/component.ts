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

import {HttpClient} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AppDeploymentSpec,
  EnvironmentVariable,
  Namespace,
  NamespaceList,
  PortMapping,
  Protocols,
  SecretList,
} from '@api/root.api';
import {ICanDeactivate} from '@common/interfaces/candeactivate';
import {PreviewDeploymentDialog} from '@common/dialogs/previewdeployment/dialog';
import {NAMESPACE_STATE_PARAM} from '@common/params/params';

import {CreateService} from '@common/services/create/service';
import {HistoryService} from '@common/services/global/history';
import {NamespaceService} from '@common/services/global/namespace';
import {take, takeUntil} from 'rxjs/operators';

import {CreateNamespaceDialog} from './createnamespace/dialog';
import {DeployLabel} from './deploylabel/deploylabel';
import {validateUniqueName} from './validator/uniquename.validator';
import {FormValidators} from './validator/validators';
import {CreateSecretDialog} from './createsecret/dialog';
import {Subject} from 'rxjs';

// Label keys for predefined labels
const APP_LABEL_KEY = 'k8s-app';

@Component({
  selector: 'kd-create-from-form',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class CreateFromFormComponent extends ICanDeactivate implements OnInit, OnDestroy {
  showMoreOptions_ = false;
  namespaces: string[];
  protocols: string[];
  secrets: string[];
  isExternal = false;
  labelArr: DeployLabel[] = [];
  form: FormGroup;
  readonly nameMaxLength = 24;
  private created_ = false;
  private unsubscribe_ = new Subject<void>();

  constructor(
    private readonly namespace_: NamespaceService,
    private readonly create_: CreateService,
    private readonly history_: HistoryService,
    private readonly http_: HttpClient,
    private readonly route_: ActivatedRoute,
    private readonly fb_: FormBuilder,
    private readonly dialog_: MatDialog,
    private readonly router_: Router
  ) {
    super();
  }

  get name(): AbstractControl {
    return this.form.get('name');
  }

  get containerImage(): AbstractControl {
    return this.form.get('containerImage');
  }

  get replicas(): AbstractControl {
    return this.form.get('replicas');
  }

  get description(): AbstractControl {
    return this.form.get('description');
  }

  get namespace(): AbstractControl {
    return this.form.get('namespace');
  }

  get imagePullSecret(): AbstractControl {
    return this.form.get('imagePullSecret');
  }

  get cpuRequirement(): AbstractControl {
    return this.form.get('cpuRequirement');
  }

  get memoryRequirement(): AbstractControl {
    return this.form.get('memoryRequirement');
  }

  get containerCommand(): AbstractControl {
    return this.form.get('containerCommand');
  }

  get containerCommandArgs(): AbstractControl {
    return this.form.get('containerCommandArgs');
  }

  get runAsPrivileged(): AbstractControl {
    return this.form.get('runAsPrivileged');
  }

  get portMappings(): FormArray {
    return this.form.get('portMappings') as FormArray;
  }

  get variables(): FormArray {
    return this.form.get('variables') as FormArray;
  }

  get labels(): FormArray {
    return this.form.get('labels') as FormArray;
  }

  ngOnInit(): void {
    this.form = this.fb_.group({
      name: ['', Validators.compose([Validators.required, FormValidators.namePattern])],
      containerImage: ['', Validators.required],
      replicas: [1, Validators.compose([Validators.required, FormValidators.isInteger])],
      description: [''],
      namespace: [this.route_.snapshot.params.namespace || '', Validators.required],
      imagePullSecret: [''],
      cpuRequirement: ['', Validators.compose([Validators.min(0), FormValidators.isInteger])],
      memoryRequirement: ['', Validators.compose([Validators.min(0), FormValidators.isInteger])],
      containerCommand: [''],
      containerCommandArgs: [''],
      runAsPrivileged: [false],
      portMappings: this.fb_.control([]),
      variables: this.fb_.control([]),
      labels: this.fb_.control([]),
    });
    this.labelArr = [new DeployLabel(APP_LABEL_KEY, '', false), new DeployLabel()];
    this.name.valueChanges.subscribe(v => {
      this.labelArr[0].value = v;
      this.labels.patchValue([{index: 0, value: v}]);
    });
    this.namespace.valueChanges.pipe(takeUntil(this.unsubscribe_)).subscribe((namespace: string) => {
      this.name.clearAsyncValidators();
      this.name.setAsyncValidators(validateUniqueName(this.http_, namespace));
      this.name.updateValueAndValidity();
    });
    this.http_.get('api/v1/namespace').subscribe((result: NamespaceList) => {
      this.namespaces = result.namespaces.map((namespace: Namespace) => namespace.objectMeta.name);
      this.namespace.patchValue(
        !this.namespace_.areMultipleNamespacesSelected()
          ? this.route_.snapshot.params.namespace || this.namespaces[0]
          : this.namespaces[0]
      );
      this.form.markAsPristine();
    });
    this.http_
      .get('api/v1/appdeployment/protocols')
      .subscribe((protocols: Protocols) => (this.protocols = protocols.protocols));
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }

  changeExternal(isExternal: boolean): void {
    this.isExternal = isExternal;
  }

  resetImagePullSecret(): void {
    this.imagePullSecret.patchValue('');
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  isCreateDisabled(): boolean {
    return !this.form.valid || this.create_.isDeployDisabled();
  }

  getSecrets(): void {
    this.http_.get(`api/v1/secret/${this.namespace.value}`).subscribe((result: SecretList) => {
      this.secrets = result.secrets.map(secret => secret.objectMeta.name);
    });
  }

  cancel(): void {
    this.history_.goToPreviousState('overview');
  }

  areMultipleNamespacesSelected(): boolean {
    return this.namespace_.areMultipleNamespacesSelected();
  }

  isMoreOptionsEnabled(): boolean {
    return this.showMoreOptions_;
  }

  switchMoreOptions(): void {
    this.showMoreOptions_ = !this.showMoreOptions_;
  }

  handleNamespaceDialog(): void {
    const dialogData = {data: {namespaces: this.namespaces}};
    const dialogDef = this.dialog_.open(CreateNamespaceDialog, dialogData);
    dialogDef
      .afterClosed()
      .pipe(take(1))
      .subscribe(answer => {
        /**
         * Handles namespace dialog result. If namespace was created successfully then it
         * will be selected, otherwise first namespace will be selected.
         */
        if (answer) {
          this.namespaces.push(answer);
          this.namespace.patchValue(answer);
        } else {
          this.namespace.patchValue(this.namespaces[0]);
        }
      });
  }

  handleCreateSecretDialog(): void {
    const dialogData = {data: {namespace: this.namespace.value}};
    const dialogDef = this.dialog_.open(CreateSecretDialog, dialogData);
    dialogDef
      .afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        /**
         * Handles create secret dialog result. If the secret was created successfully, then it
         * will be selected,
         * otherwise None is selected.
         */
        if (response) {
          this.secrets.push(response);
          this.imagePullSecret.patchValue(response);
        } else {
          this.imagePullSecret.patchValue('');
        }
      });
  }

  /**
   * Returns true when the given port mapping is filled by the user, i.e., is not empty.
   */
  isPortMappingFilled(portMapping: PortMapping): boolean {
    return !!portMapping.port && !!portMapping.targetPort;
  }

  isVariableFilled(variable: EnvironmentVariable): boolean {
    return !!variable.name;
  }

  isNumber(value: string): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Converts array of DeployLabel to array of backend api label.
   */
  toBackendApiLabels(labels: DeployLabel[]): DeployLabel[] {
    labels[0].key = this.labelArr[0].key;
    labels[0].value = this.labelArr[0].value;
    return labels.filter((label: DeployLabel) => {
      return label.key.length !== 0 && label.value.length !== 0;
    });
  }

  preview(): void {
    this.dialog_.open(PreviewDeploymentDialog, {
      width: '900px',
      data: {
        spec: this.getSpec(),
      },
    });
  }

  deploy(): void {
    const spec = this.getSpec();
    this.create_.deploy(spec).then(() => {
      this.created_ = true;
      this.router_.navigate(['overview'], {
        queryParams: {[NAMESPACE_STATE_PARAM]: spec.namespace},
      });
    });
  }

  private getSpec(): AppDeploymentSpec {
    const portMappings = this.portMappings.value.portMappings || [];
    const variables = this.variables.value.variables || [];
    const labels = this.labels.value.labels || [];
    return {
      containerImage: this.containerImage.value,
      imagePullSecret: this.imagePullSecret.value ? this.imagePullSecret.value : null,
      containerCommand: this.containerCommand.value ? this.containerCommand.value : null,
      containerCommandArgs: this.containerCommandArgs.value ? this.containerCommandArgs.value : null,
      isExternal: this.isExternal,
      name: this.name.value,
      description: this.description.value ? this.description.value : null,
      portMappings: portMappings.filter(this.isPortMappingFilled),
      variables: variables.filter(this.isVariableFilled),
      replicas: this.replicas.value,
      namespace: this.namespace.value,
      cpuRequirement: this.isNumber(this.cpuRequirement.value) ? this.cpuRequirement.value : null,
      memoryRequirement: this.isNumber(this.memoryRequirement.value) ? `${this.memoryRequirement.value}Mi` : null,
      labels: this.toBackendApiLabels(labels),
      runAsPrivileged: this.runAsPrivileged.value,
    };
  }

  canDeactivate(): boolean {
    return this.form.pristine || this.created_;
  }
}
