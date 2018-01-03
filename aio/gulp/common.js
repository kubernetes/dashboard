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

import gulp from 'gulp';
import through from 'through2';

/**
 * Utility function for specifying multiple gulp.dest destinations.
 * @param {string|!Array<string>} outputDirs destinations for the gulp dest function calls
 * @param {function(?Error=)|undefined} opt_doneFn - Callback.
 * @return {stream}
 */
export function multiDest(outputDirs, opt_doneFn) {
  if (!Array.isArray(outputDirs)) {
    outputDirs = [outputDirs];
  }
  let outputs = outputDirs.map((dir) => gulp.dest(dir));
  let outputStream = through.obj();

  outputStream.on('data', (data) => outputs.forEach((dest) => {
    dest.write(data);
  }));
  outputStream.on('end', () => outputs.forEach((dest) => {
    dest.end();
  }));

  // build a closure to track all streams
  let stillRunning = outputs.length;
  if (opt_doneFn) {
    outputs.forEach((output) => output.on('finish', () => {
      stillRunning--;
      if (stillRunning === 0) {
        opt_doneFn();
      }
    }));
  }

  return outputStream;
}
