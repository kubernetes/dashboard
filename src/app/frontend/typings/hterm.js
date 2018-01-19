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

/**
 * @fileoverview Externs for hterm
 *
 * @externs
 */

const hterm = {};
hterm.defaultStorage;
hterm.Terminal;
hterm.Terminal.prototype.decorate;
hterm.Terminal.prototype.installKeyboard;
hterm.Terminal.prototype.io;
hterm.Terminal.prototype.io.prototype.onTerminalResize;
hterm.Terminal.prototype.io.prototype.onVTKeystroke;
hterm.Terminal.prototype.io.prototype.print;
hterm.Terminal.prototype.io.prototype.push;
hterm.Terminal.prototype.io.prototype.sendString;
hterm.Terminal.prototype.io.prototype.showOverlay;
hterm.Terminal.prototype.onTerminalReady;
hterm.Terminal.prototype.screenSize;
hterm.Terminal.prototype.uninstallKeyboard;

const lib = {};
lib.Storage;
lib.Storage.Memory;
