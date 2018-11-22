/*
Copyright 2018 The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package v1beta1

import (
	"k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

// SchemeGroupVersion is group version used to register these objects
var SchemeGroupVersion = schema.GroupVersion{Group: "app.k8s.io", Version: "v1beta1"}

// Kind takes an unqualified kind and returns back a Group qualified GroupKind
func Kind(kind string) schema.GroupKind {
	return SchemeGroupVersion.WithKind(kind).GroupKind()
}

// Resource takes an unqualified resource and returns a Group qualified GroupResource
func Resource(resource string) schema.GroupResource {
	return SchemeGroupVersion.WithResource(resource).GroupResource()
}

var (
	SchemeBuilder = runtime.NewSchemeBuilder(addKnownTypes)
	AddToScheme   = SchemeBuilder.AddToScheme
)

// Adds the list of known types to Scheme.
func addKnownTypes(scheme *runtime.Scheme) error {
	scheme.AddKnownTypes(SchemeGroupVersion,
		&Application{},
		&ApplicationList{},
	)
	metav1.AddToGroupVersion(scheme, SchemeGroupVersion)
	return nil
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

type ApplicationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Application `json:"items"`
}

// CRD Generation
func getFloat(f float64) *float64 {
	return &f
}

func getInt(i int64) *int64 {
	return &i
}

var (
	// Define CRDs for resources
	ApplicationCRD = v1beta1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{
			Name: "applications.app.k8s.io",
		},
		Spec: v1beta1.CustomResourceDefinitionSpec{
			Group:   "app.k8s.io",
			Version: "v1beta1",
			Names: v1beta1.CustomResourceDefinitionNames{
				Kind:   "Application",
				Plural: "applications",
			},
			Scope: "Namespaced",
			Validation: &v1beta1.CustomResourceValidation{
				OpenAPIV3Schema: &v1beta1.JSONSchemaProps{
					Type: "object",
					Properties: map[string]v1beta1.JSONSchemaProps{
						"apiVersion": v1beta1.JSONSchemaProps{
							Type: "string",
						},
						"kind": v1beta1.JSONSchemaProps{
							Type: "string",
						},
						"metadata": v1beta1.JSONSchemaProps{
							Type: "object",
						},
						"spec": v1beta1.JSONSchemaProps{
							Type: "object",
							Properties: map[string]v1beta1.JSONSchemaProps{
								"assemblyPhase": v1beta1.JSONSchemaProps{
									Type: "string",
								},
								"componentKinds": v1beta1.JSONSchemaProps{
									Type: "array",
									Items: &v1beta1.JSONSchemaPropsOrArray{
										Schema: &v1beta1.JSONSchemaProps{
											Type:       "object",
											Properties: map[string]v1beta1.JSONSchemaProps{},
										},
									},
								},
								"descriptor": v1beta1.JSONSchemaProps{
									Type: "object",
									Properties: map[string]v1beta1.JSONSchemaProps{
										"description": v1beta1.JSONSchemaProps{
											Type: "string",
										},
										"icons": v1beta1.JSONSchemaProps{
											Type: "array",
											Items: &v1beta1.JSONSchemaPropsOrArray{
												Schema: &v1beta1.JSONSchemaProps{
													Type: "object",
													Properties: map[string]v1beta1.JSONSchemaProps{
														"size": v1beta1.JSONSchemaProps{
															Type: "string",
														},
														"src": v1beta1.JSONSchemaProps{
															Type: "string",
														},
														"type": v1beta1.JSONSchemaProps{
															Type: "string",
														},
													},
													Required: []string{
														"src",
													}},
											},
										},
										"keywords": v1beta1.JSONSchemaProps{
											Type: "array",
											Items: &v1beta1.JSONSchemaPropsOrArray{
												Schema: &v1beta1.JSONSchemaProps{
													Type: "string",
												},
											},
										},
										"links": v1beta1.JSONSchemaProps{
											Type: "array",
											Items: &v1beta1.JSONSchemaPropsOrArray{
												Schema: &v1beta1.JSONSchemaProps{
													Type: "object",
													Properties: map[string]v1beta1.JSONSchemaProps{
														"description": v1beta1.JSONSchemaProps{
															Type: "string",
														},
														"url": v1beta1.JSONSchemaProps{
															Type: "string",
														},
													},
												},
											},
										},
										"maintainers": v1beta1.JSONSchemaProps{
											Type: "array",
											Items: &v1beta1.JSONSchemaPropsOrArray{
												Schema: &v1beta1.JSONSchemaProps{
													Type: "object",
													Properties: map[string]v1beta1.JSONSchemaProps{
														"email": v1beta1.JSONSchemaProps{
															Type: "string",
														},
														"name": v1beta1.JSONSchemaProps{
															Type: "string",
														},
														"url": v1beta1.JSONSchemaProps{
															Type: "string",
														},
													},
												},
											},
										},
										"notes": v1beta1.JSONSchemaProps{
											Type: "string",
										},
										"owners": v1beta1.JSONSchemaProps{
											Type: "array",
											Items: &v1beta1.JSONSchemaPropsOrArray{
												Schema: &v1beta1.JSONSchemaProps{
													Type: "object",
													Properties: map[string]v1beta1.JSONSchemaProps{
														"email": v1beta1.JSONSchemaProps{
															Type: "string",
														},
														"name": v1beta1.JSONSchemaProps{
															Type: "string",
														},
														"url": v1beta1.JSONSchemaProps{
															Type: "string",
														},
													},
												},
											},
										},
										"type": v1beta1.JSONSchemaProps{
											Type: "string",
										},
										"version": v1beta1.JSONSchemaProps{
											Type: "string",
										},
									},
								},
								"info": v1beta1.JSONSchemaProps{
									Type: "array",
									Items: &v1beta1.JSONSchemaPropsOrArray{
										Schema: &v1beta1.JSONSchemaProps{
											Type: "object",
											Properties: map[string]v1beta1.JSONSchemaProps{
												"name": v1beta1.JSONSchemaProps{
													Type: "string",
												},
												"type": v1beta1.JSONSchemaProps{
													Type: "string",
												},
												"value": v1beta1.JSONSchemaProps{
													Type: "string",
												},
												"valueFrom": v1beta1.JSONSchemaProps{
													Type: "object",
													Properties: map[string]v1beta1.JSONSchemaProps{
														"configMapKeyRef": v1beta1.JSONSchemaProps{
															Type: "object",
															Properties: map[string]v1beta1.JSONSchemaProps{
																"key": v1beta1.JSONSchemaProps{
																	Type: "string",
																},
															},
														},
														"ingressRef": v1beta1.JSONSchemaProps{
															Type: "object",
															Properties: map[string]v1beta1.JSONSchemaProps{
																"host": v1beta1.JSONSchemaProps{
																	Type: "string",
																},
																"path": v1beta1.JSONSchemaProps{
																	Type: "string",
																},
															},
														},
														"secretKeyRef": v1beta1.JSONSchemaProps{
															Type: "object",
															Properties: map[string]v1beta1.JSONSchemaProps{
																"key": v1beta1.JSONSchemaProps{
																	Type: "string",
																},
															},
														},
														"serviceRef": v1beta1.JSONSchemaProps{
															Type: "object",
															Properties: map[string]v1beta1.JSONSchemaProps{
																"path": v1beta1.JSONSchemaProps{
																	Type: "string",
																},
																"port": v1beta1.JSONSchemaProps{
																	Type:   "integer",
																	Format: "int32",
																},
															},
														},
														"type": v1beta1.JSONSchemaProps{
															Type: "string",
														},
													},
												},
											},
										},
									},
								},
								"selector": v1beta1.JSONSchemaProps{
									Type:       "object",
									Properties: map[string]v1beta1.JSONSchemaProps{},
								},
							},
						},
						"status": v1beta1.JSONSchemaProps{
							Type: "object",
							Properties: map[string]v1beta1.JSONSchemaProps{
								"observedGeneration": v1beta1.JSONSchemaProps{
									Type:   "integer",
									Format: "int64",
								},
							},
						},
					},
				},
			},
		},
	}
)
