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
