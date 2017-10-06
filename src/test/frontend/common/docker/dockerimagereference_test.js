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

import DockerImageReference from 'common/docker/dockerimagereference';

describe('DokcerImageReference', () => {

  it('should return empty string when containerImage is undefined', () => {
    // given
    let reference = undefined;

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('');
  });

  it('should return empty string when containerImage is empty', () => {
    // given
    let reference = '';

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('');
  });

  it('should return empty string when containerImage is not empty and does not contain `:`' +
         ' delimiter',
     () => {
       // given
       let reference = 'test';

       // when
       let result = new DockerImageReference(reference).tag();

       // then
       expect(result).toEqual('');
     });

  it('should return part of the string after `:` delimiter', () => {
    // given
    let reference = 'test:1';

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('1');
  });

  it('should return part of the string after `:` delimiter', () => {
    // given
    let reference = 'private.registry:5000/test:1';

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('1');
  });

  it('should return empty string when containerImage is not empty and does not containe `:`' +
         ' delimiter after `/` delimiter',
     () => {
       // given
       let reference = 'private.registry:5000/test';

       // when
       let result = new DockerImageReference(reference).tag();

       // then
       expect(result).toEqual('');
     });

  it('should return part of the string after `:` delimiter when containerImage is not empty' +
         'and containe two `/` delimiters',
     () => {
       // given
       let reference = 'private.registry:5000/namespace/test:1';

       // when
       let result = new DockerImageReference(reference).tag();

       // then
       expect(result).toEqual('1');
     });

  it('should return part of the string after last `:` delimiter when containerImage is not empty' +
         ' and containe two `:` delimiters',
     () => {
       // given
       let reference = 'private.registry:5000/test:image:1';

       // when
       let result = new DockerImageReference(reference).tag();

       // then
       expect(result).toEqual('1');
     });

  it('should return empty string when containerImage is only `:` delimiter', () => {
    // given
    let reference = ':';

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('');
  });

  it('should return empty string when containerImage is only `/` delimiter', () => {
    // given
    let reference = '/';

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('');
  });

  it('should return empty string when containerImage is only `/` delimiter' +
         ' and `:` delimiter',
     () => {
       // given
       let reference = '/:';

       // when
       let result = new DockerImageReference(reference).tag();

       // then
       expect(result).toEqual('');
     });

  it('should retrun empty when containerImage is `::`', () => {
    // given
    let reference = '::';

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('');
  });

  it('should retrun empty when containerImage is not empty and ends with `:` delimiter', () => {
    // given
    let reference = 'test:';

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('');
  });

  it('should retrun empty when containerImage is not empty and ends with `/` delimiter', () => {
    // given
    let reference = 'test/';

    // when
    let result = new DockerImageReference(reference).tag();

    // then
    expect(result).toEqual('');
  });

});
