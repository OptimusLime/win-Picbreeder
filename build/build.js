/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("optimuslime~el.js@master", function (exports, module) {
/**
* el.js v0.3 - A JavaScript Node Creation Tool
*
* https://github.com/markgandolfo/el.js
*
* Copyright 2013 Mark Gandolfo and other contributors
* Released under the MIT license.
* http://en.wikipedia.org/wiki/MIT_License
*/

module.exports = el;

function el(tagName, attrs, child) {
  // Pattern to match id & class names
  var pattern = /([a-z]+|#[\w-\d]+|\.[\w\d-]+)/g

  if(arguments.length === 2) {
    if(attrs instanceof Array
    || typeof attrs === 'function'
    || typeof attrs === 'string'
    || attrs.constructor !== Object
    ) {
      child = attrs;
      attrs = undefined;
    }

  }
  // does the user pass attributes in, if not set an empty object up
  attrs = typeof attrs !== 'undefined' ? attrs : {};
  child = typeof child !== 'undefined' ? child : [];
  child = child instanceof Array ? child : [child];

  // run the pattern over the tagname an attempt to pull out class & id attributes
  // shift the first record out as it's the element name
  matched = tagName.match(pattern);
  tagName = matched[0];
  matched.shift();

  // Iterate over the matches and concat the attrs to either class or id keys in attrs json object
  for (var m in matched) {
    if(matched[m][0] == '.') {
      if(attrs['class'] == undefined) {
        attrs['class'] = matched[m].substring(1, matched[m].length);
      } else {
        attrs['class'] = attrs['class'] + ' ' + matched[m].substring(1, matched[m].length);
      }
    } else if(matched[m][0] == '#') {
      if(attrs['id'] == undefined) {
        attrs['id'] = matched[m].substring(1, matched[m].length)
      } else {
        // Feels dirty having multiple id's, but it's allowed: http://www.w3.org/TR/selectors/#id-selectors
        attrs['id'] = attrs['id'] + ' ' + matched[m].substring(1, matched[m].length);
      }
    }
  }

  // create the element
  var element = document.createElement(tagName);
  for(var i = 0; i < child.length; i += 1) {
    (function(child){
      switch(typeof child) {
        case 'object':
          element.appendChild(child);
          break;
        case 'function':
          var discardDoneCallbackResult = false;
          var doneCallback = function doneCallback(content) {
            if (!discardDoneCallbackResult) {
              element.appendChild(content);
            }
          }
          var result = child.apply(null, [doneCallback])
          if(typeof result != 'undefined') {
            discardDoneCallbackResult = true;
            element.appendChild(result);
          }
          break;
        case 'string':
          element.appendChild(document.createTextNode(child));
        default:
          //???
      }
    }(child[i]));

  }

  for (var key in attrs) {
    if (attrs.hasOwnProperty(key)) {
      element.setAttribute(key, attrs[key]);
    }
  }

  return element;
};

// alias
el.create = el.c = el;

// vanity methods
el.img = function(attrs) {
  return el.create('img', attrs);
};

el.a = function(attrs, child) {
  return el.create('a', attrs, child);
};

el.div = function(attrs, child) {
  return el.create('div', attrs, child);
};

el.p = function(attrs, child) {
  return el.create('p', attrs, child);
};

el.input = function(attrs, child) {
  return el.create('input', attrs);
};

});

require.modules["optimuslime-el.js"] = require.modules["optimuslime~el.js@master"];
require.modules["optimuslime~el.js"] = require.modules["optimuslime~el.js@master"];
require.modules["el.js"] = require.modules["optimuslime~el.js@master"];


require.register("optimuslime~traverse@master", function (exports, module) {
var traverse = module.exports = function (obj) {
    return new Traverse(obj);
};

function Traverse (obj) {
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.has = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            return false;
        }
        node = node[key];
    }
    return true;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            forEach(objectKeys(src), function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var keepGoing = true;
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents[parents.length - 1],
            parents : parents,
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x, stopHere) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
                if (stopHere) keepGoing = false;
            },
            'delete' : function (stopHere) {
                delete state.parent.node[state.key];
                if (stopHere) keepGoing = false;
            },
            remove : function (stopHere) {
                if (isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
                if (stopHere) keepGoing = false;
            },
            keys : null,
            before : function (f) { modifiers.before = f },
            after : function (f) { modifiers.after = f },
            pre : function (f) { modifiers.pre = f },
            post : function (f) { modifiers.post = f },
            stop : function () { alive = false },
            block : function () { keepGoing = false }
        };
        
        if (!alive) return state;
        
        function updateState() {
            if (typeof state.node === 'object' && state.node !== null) {
                if (!state.keys || state.node_ !== state.node) {
                    state.keys = objectKeys(state.node)
                }
                
                state.isLeaf = state.keys.length == 0;
                
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i].node_ === node_) {
                        state.circular = parents[i];
                        break;
                    }
                }
            }
            else {
                state.isLeaf = true;
                state.keys = null;
            }
            
            state.notLeaf = !state.isLeaf;
            state.notRoot = !state.isRoot;
        }
        
        updateState();
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (!keepGoing) return state;
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            updateState();
            
            forEach(state.keys, function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == state.keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (isArray(src)) {
            dst = [];
        }
        else if (isDate(src)) {
            dst = new Date(src.getTime ? src.getTime() : src);
        }
        else if (isRegExp(src)) {
            dst = new RegExp(src);
        }
        else if (isError(src)) {
            dst = { message: src.message };
        }
        else if (isBoolean(src)) {
            dst = new Boolean(src);
        }
        else if (isNumber(src)) {
            dst = new Number(src);
        }
        else if (isString(src)) {
            dst = new String(src);
        }
        else if (Object.create && Object.getPrototypeOf) {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        else if (src.constructor === Object) {
            dst = {};
        }
        else {
            var proto =
                (src.constructor && src.constructor.prototype)
                || src.__proto__
                || {}
            ;
            var T = function () {};
            T.prototype = proto;
            dst = new T;
        }
        
        forEach(objectKeys(src), function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

var objectKeys = Object.keys || function keys (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }

var isArray = Array.isArray || function isArray (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

forEach(objectKeys(Traverse.prototype), function (key) {
    traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
    };
});

var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
    return key in obj;
};

});

require.modules["optimuslime-traverse"] = require.modules["optimuslime~traverse@master"];
require.modules["optimuslime~traverse"] = require.modules["optimuslime~traverse@master"];
require.modules["traverse"] = require.modules["optimuslime~traverse@master"];


require.register("optimuslime~traverse@0.6.6-1", function (exports, module) {
var traverse = module.exports = function (obj) {
    return new Traverse(obj);
};

function Traverse (obj) {
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.has = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            return false;
        }
        node = node[key];
    }
    return true;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            forEach(objectKeys(src), function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var keepGoing = true;
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents[parents.length - 1],
            parents : parents,
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x, stopHere) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
                if (stopHere) keepGoing = false;
            },
            'delete' : function (stopHere) {
                delete state.parent.node[state.key];
                if (stopHere) keepGoing = false;
            },
            remove : function (stopHere) {
                if (isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
                if (stopHere) keepGoing = false;
            },
            keys : null,
            before : function (f) { modifiers.before = f },
            after : function (f) { modifiers.after = f },
            pre : function (f) { modifiers.pre = f },
            post : function (f) { modifiers.post = f },
            stop : function () { alive = false },
            block : function () { keepGoing = false }
        };
        
        if (!alive) return state;
        
        function updateState() {
            if (typeof state.node === 'object' && state.node !== null) {
                if (!state.keys || state.node_ !== state.node) {
                    state.keys = objectKeys(state.node)
                }
                
                state.isLeaf = state.keys.length == 0;
                
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i].node_ === node_) {
                        state.circular = parents[i];
                        break;
                    }
                }
            }
            else {
                state.isLeaf = true;
                state.keys = null;
            }
            
            state.notLeaf = !state.isLeaf;
            state.notRoot = !state.isRoot;
        }
        
        updateState();
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (!keepGoing) return state;
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            updateState();
            
            forEach(state.keys, function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == state.keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (isArray(src)) {
            dst = [];
        }
        else if (isDate(src)) {
            dst = new Date(src.getTime ? src.getTime() : src);
        }
        else if (isRegExp(src)) {
            dst = new RegExp(src);
        }
        else if (isError(src)) {
            dst = { message: src.message };
        }
        else if (isBoolean(src)) {
            dst = new Boolean(src);
        }
        else if (isNumber(src)) {
            dst = new Number(src);
        }
        else if (isString(src)) {
            dst = new String(src);
        }
        else if (Object.create && Object.getPrototypeOf) {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        else if (src.constructor === Object) {
            dst = {};
        }
        else {
            var proto =
                (src.constructor && src.constructor.prototype)
                || src.__proto__
                || {}
            ;
            var T = function () {};
            T.prototype = proto;
            dst = new T;
        }
        
        forEach(objectKeys(src), function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

var objectKeys = Object.keys || function keys (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }

var isArray = Array.isArray || function isArray (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

forEach(objectKeys(Traverse.prototype), function (key) {
    traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
    };
});

var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
    return key in obj;
};

});

require.modules["optimuslime-traverse"] = require.modules["optimuslime~traverse@0.6.6-1"];
require.modules["optimuslime~traverse"] = require.modules["optimuslime~traverse@0.6.6-1"];
require.modules["traverse"] = require.modules["optimuslime~traverse@0.6.6-1"];


require.register("component~emitter@master", function (exports, module) {

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});

require.modules["component-emitter"] = require.modules["component~emitter@master"];
require.modules["component~emitter"] = require.modules["component~emitter@master"];
require.modules["emitter"] = require.modules["component~emitter@master"];


require.register("component~worker@master", function (exports, module) {

/**
 * Module dependencies.
 */

var Emitter = require("component~emitter@master");
var WebWorker = window.Worker;

/**
 * Expose `Worker`.
 */

module.exports = Worker;

/**
 * Initialize a new `Worker` with `script`.
 *
 * @param {String} script
 * @api public
 */

function Worker(script) {
  var self = this;
  this.ids = 0;
  this.script = script;
  this.worker = new WebWorker(script);
  this.worker.addEventListener('message', this.onmessage.bind(this));
  this.worker.addEventListener('error', this.onerror.bind(this));
}

/**
 * Mixin emitter.
 */

Emitter(Worker.prototype);

/**
 * Handle messages.
 */

Worker.prototype.onmessage = function(e){
  this.emit('message', e.data, e);
};

/**
 * Handle errors.
 */

Worker.prototype.onerror = function(e){
  var err = new Error(e.message);
  err.event = e;
  this.emit('error', err);
};

/**
 * Terminate the worker.
 */

Worker.prototype.close = function(){
  this.worker.terminate();
};

/**
 * Send a `msg` with optional callback `fn`.
 *
 * TODO: allow passing of transferrables
 *
 * @param {Mixed} msg
 * @param {Function} [fn]
 * @api public
 */

Worker.prototype.send = function(msg, fn){
  if (fn) this.request(msg, fn);
  this.worker.postMessage(msg);
};

/**
 * Send a `msg` as a request with `fn`.
 *
 * @param {Mixed} msg
 * @param {Function} fn
 * @param {Array} [transferables]
 * @api public
 */

Worker.prototype.request = function(msg, fn, transferables){
  var self = this;
  var id = ++this.ids;

  // req
  msg.id = id;
  this.worker.postMessage(msg, transferables);

  // rep
  this.on('message', onmessage);

  function onmessage(msg) {
    if (id != msg.id) return;
    self.off('message', onmessage);
    delete msg.id;
    fn(msg);
  }
};

});

require.modules["component-worker"] = require.modules["component~worker@master"];
require.modules["component~worker"] = require.modules["component~worker@master"];
require.modules["worker"] = require.modules["component~worker@master"];


require.register("component~reduce@1.0.1", function (exports, module) {

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});

require.modules["component-reduce"] = require.modules["component~reduce@1.0.1"];
require.modules["component~reduce"] = require.modules["component~reduce@1.0.1"];
require.modules["reduce"] = require.modules["component~reduce@1.0.1"];


require.register("visionmedia~superagent@master", function (exports, module) {
/**
 * Module dependencies.
 */

var Emitter = require("component~emitter@master");
var reduce = require("component~reduce@1.0.1");

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR(isXDomainRequest) {
  if (isXDomainRequest === true) {
    if (typeof new XMLHttpRequest().withCredentials !== 'undefined') {
      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      
      return new XMLHttpRequest();
    } else if (typeof XDomainRequest !== "undefined") {
      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      
      return new XDomainRequest();
    } else {
      return false;
    }
  } else {
    if (root.XMLHttpRequest
      && ('file:' !== root.location.protocol || !root.ActiveXObject)) {
      return new XMLHttpRequest();
    } else {
      try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
      try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
      try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
      try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
    }
  }

  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(typeof this.xhr.status !== 'undefined' ? this.xhr.status : 0);
  if (typeof this.xhr.getAllResponseHeaders !== 'undefined' &&
      typeof this.xhr.getResponseHeader !== 'undefined') {
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  } else if (typeof this.xhr.contentType !== 'undefined') {
    this.header = this.headers = {};
    this.header['content-type'] = this.xhr.contentType;
    this.setHeaderProperties(this.header);
  }
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  
  var isXDomainRequest = false;

  if (typeof root.location !== 'undefined') {
    var hostnameMatch = this.url.match(/http[s]?:\/\/([^\/]*)/);

    if (hostnameMatch && hostnameMatch[1] !== root.location.hostname) {
      isXDomainRequest = true;
    }
  }

  var xhr = this.xhr = getXHR(isXDomainRequest);
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  if (typeof xhr.onreadystatechange !== 'undefined') {
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };
  } else {
    xhr.onload = function () {
      if (self.aborted) return self.timeoutError();
      self.emit('end');
    }

    xhr.onerror = function () {
      self.emit('end');
    }

    xhr.ontimeout = function () {
      return self.timeoutError();
    }
  }

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    if (typeof xhr.setRequestHeader !== 'undefined') {
    xhr.setRequestHeader(field, this.header[field]);
  }
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});

require.modules["visionmedia-superagent"] = require.modules["visionmedia~superagent@master"];
require.modules["visionmedia~superagent"] = require.modules["visionmedia~superagent@master"];
require.modules["superagent"] = require.modules["visionmedia~superagent@master"];


require.register("optimuslime~win-query@0.0.1-4", function (exports, module) {
var request = require("visionmedia~superagent@master");

module.exports = winquery;

function winquery(backbone, globalConfig, localConfig)
{
  var self= this;

  //need to make requests, much like win-publish
  //pull in backbone info, we gotta set our logger/emitter up
  var self = this;

  self.winFunction = "query";

  //this is how we talk to win-backbone
  self.backEmit = backbone.getEmitter(self);

  //grab our logger
  self.log = backbone.getLogger(self);

  //only vital stuff goes out for normal logs
  self.log.logLevel = localConfig.logLevel || self.log.normal;

  //we have logger and emitter, set up some of our functions

  if(!globalConfig.server)// || !globalConfig.port)
    throw new Error("Global configuration requires server location and port")

  self.hostname = globalConfig.server;
  self.port = globalConfig.port;

  var baseWIN = function()
  {
    return self.hostname + (self.port ?  ":" + self.port : "") + "/api";
  }

  self.getWIN = function(apiPath, queryObjects, resFunction)
  {
    var base = baseWIN();

    if(typeof queryObjects == "function")
    {
      resFunction = queryObjects;
      queryObjects = {};
    }
    else //make sure to always have at least an empty object
      queryObjects = queryObjects || {};

    var qNotEmpty = false;
    var queryAdditions = "?";
    for(var key in queryObjects){
      if(queryAdditions.length > 1)
        queryAdditions += "&";

      qNotEmpty = true;
      queryAdditions += key + "=" + queryObjects[key];
    } 
    var fullPath = base + apiPath + (qNotEmpty ? queryAdditions : "");

    self.log("Requesting get from: ",fullPath )
    request
      .get(fullPath)
      // .send(data)
      .set('Accept', 'application/json')
      .end(resFunction);
  }

  self.postWIN = function(apiPath, data, resFunction)
  {
    var base = baseWIN();

    var fullPath= base + apiPath;
    self.log("Requesting post to: ",fullPath )

    request
      .post(fullPath)
      .send(data)
      .set('Accept', 'application/json')
      .end(resFunction);
  }

  //what events do we need?
  //none for now, though in the future, we might have a way to communicate with foreign win-backbones as if it was just sending
  //a message within our own backbone -- thereby obfuscating what is done remotely and what is done locally 
  self.requiredEvents = function()
  {
    return [
    ];
  }

  //what events do we respond to?
  self.eventCallbacks = function()
  { 
    return {
      "query:getArtifacts" : self.getArtifacts,
      "query:getSeeds" : self.getSeeds,
      "query:getHomeQuery" : self.getHomeData
    };
  }
  self.getArtifacts = function(type, list, finished)
  {
    var apiPath = "/artifacts";

    var lstring;
    //combine artifacts together
    if(typeof list == "string")
    {
      lString = list;
    }
    else if(Array.isArray(list))
    {
      lString = list.join(',');
    }

    self.getWIN(apiPath, {artifactType: type, wids: list}, function(err, res)
    {
      // self.log("Artifact return: ", err, " res: ", res.error);
      if(err)
      {
        finished(err);
        return;
      }
      else if(res.statusCode == 500 || res.statusCode == 404)
      {
        finished("Server Artifacts failure: " + JSON.stringify(res.error) + " | message: " + err.message);
        return;
      }

      //otherwise, all good -- pass the body back -- just a list of artifacts
      finished(undefined, res.body);

    });
  }
  self.getHomeData = function(start, end, finished)
  {
    //simply make a request that fetches the different categories from the server
    var apiPath = '/home/recent';
      
    //send start/end for knowing which part to look through

    self.getWIN(apiPath, {start: start, end: end}, function(err, res)
    {
      self.log("Artifact return: ", err, " res: ", res.error);
      if(err)
      {
        finished(err);
        return;
      }
      else if(res.statusCode == 500 || res.statusCode == 404)
      {
        finished("Server Home failure: " + JSON.stringify(res.error) + " | message: " + err.message);
        return;
      }

      //otherwise, all good
      finished(undefined, {"recent" : res.body});

    });
  }
  self.getSeeds = function(type, maxCount, finished)
  {
    var apiPath = "/seeds";

    //grab the seeds (up to a maximum number)
    self.getWIN(apiPath, {maxSeeds: maxCount}, function(err, res)
    {
      // self.log("Artifact return: ", err, " res: ", res.error);
      if(err)
      {
        finished(err);
        return;
      }
      else if(res.statusCode == 500 || res.statusCode == 404)
      {
        finished("Server Seed failure: " + JSON.stringify(res.error) + " | message: " + err.message);
        return;
      }

      //otherwise, all good -- pass the body back -- just a list of artifacts
      finished(undefined, res.body);

    });
  }

  return self;

}


});

require.modules["optimuslime-win-query"] = require.modules["optimuslime~win-query@0.0.1-4"];
require.modules["optimuslime~win-query"] = require.modules["optimuslime~win-query@0.0.1-4"];
require.modules["win-query"] = require.modules["optimuslime~win-query@0.0.1-4"];


require.register("optimuslime~win-publish@0.0.1-4", function (exports, module) {
//superagent handles browser or node.js requests
//thank you tjholowaychuk
var request = require("visionmedia~superagent@master");

//now we're ready to get into this module
module.exports = winpublish;

function winpublish(backbone, globalConfig, localConfig)
{
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "publish";

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	//we have logger and emitter, set up some of our functions

	if(!globalConfig.server)
		throw new Error("Global configuration requires server location and port")

	self.hostname = globalConfig.server;
	self.port = globalConfig.port;
	
	//what events do we need?
	//none for now, though in the future, we might have a way to communicate with foreign win-backbones as if it was just sending
	//a message within our own backbone -- thereby obfuscating what is done remotely and what is done locally 
	self.requiredEvents = function()
	{
		return [
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			"publish:publishArtifacts" : self.publishArtifacts
		};
	}

	var baseWIN = function()
	{
		return self.hostname + (self.port ? ":" + self.port : "") + "/api";
	}

	self.getWIN = function(apiPath, data, resFunction)
	{
		var base = baseWIN();

		request
		  .get(base + apiPath)
		  // .send(data)
		  .set('Accept', 'application/json')
		  .end(resFunction);
	}

	self.postWIN = function(apiPath, data, resFunction)
	{
		var base = baseWIN();

		request
		  .post(base + apiPath)
		  .send(data)
		  .set('Accept', 'application/json')
		  .end(resFunction);
	}

	//publish many at a time! Heading out to the internet thank you
	self.publishArtifacts = function(type, session, individuals, privateIndividuals, finished)
	{
		//need to hit the server for certain behavior
		var apiPath = '/artifacts';
		
		var artifacts = individuals;
		var privateArtifacts = privateIndividuals;
		//artifacts going in must be in an array -- this will change in the future 
		//for backwards compat, it is what it is

		// if(Array.isArray(individuals, privateIndividuals))
		// {
		// 	artifacts = {};
		// 	for(var i=0; i < individuals, privateIndividuals.length; i++)
		// 	{
		// 		var ind = individuals, privateIndividuals[i];
		// 		artifacts[ind.wid] = ind;
		// 	}
		// }

		var data = {artifacts: artifacts, privateArtifacts: privateArtifacts, artifactType: type, user: '', sessionID: session.sessionID, publish: session.publish};

		self.postWIN(apiPath, data, function(err, res)
		{
			self.log("Artifact return: ", err, " res: ", res.error);
			if(err)
			{
				finished(err);
				return;
			}
			else if(res.statusCode == 500 || res.statusCode == 404)
			{
				finished("Server failure: " + JSON.stringify(res.error) + " | message: " + err.message);
				return;
			}


			//otherwise, all good
			finished();

			//maybe wwe do other things, don't know yet
		});
	}

	return self;
}





});

require.modules["optimuslime-win-publish"] = require.modules["optimuslime~win-publish@0.0.1-4"];
require.modules["optimuslime~win-publish"] = require.modules["optimuslime~win-publish@0.0.1-4"];
require.modules["win-publish"] = require.modules["optimuslime~win-publish@0.0.1-4"];


require.register("techjacker~q@master", function (exports, module) {
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        requestTick = function () {
            channel.port2.postMessage(0);
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this does have the nice side-effect of reducing the size
// of the code by reducing x.call() to merely x(), eliminating many
// hard-to-minify characters.
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
// engine that has a deployed base of browsers that support generators.
// However, SM's generators use the Python-inspired semantics of
// outdated ES6 drafts.  We would like to support ES6, but we'd also
// like to make it possible to use generators in deployed browsers, so
// we also support Python-style generators.  At some point we can remove
// this block.
var hasES6Generators;
try {
    /* jshint evil: true, nonew: false */
    new Function("(function* (){ yield 1; })");
    hasES6Generators = true;
} catch (e) {
    hasES6Generators = false;
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = deprecate(function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    }, "valueOf", "inspect");

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = deprecate(function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        });
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var unhandledReasonsDisplayed = false;
var trackUnhandledRejections = true;
function displayUnhandledReasons() {
    if (
        !unhandledReasonsDisplayed &&
        typeof window !== "undefined" &&
        !window.Touch &&
        window.console
    ) {
        console.warn("[Q] Unhandled rejection reasons (should be empty):",
                     unhandledReasons);
    }

    unhandledReasonsDisplayed = true;
}

function logUnhandledReasons() {
    for (var i = 0; i < unhandledReasons.length; i++) {
        var reason = unhandledReasons[i];
        if (reason && typeof reason.stack !== "undefined") {
            console.warn("Unhandled rejection reason:", reason.stack);
        } else {
            console.warn("Unhandled rejection reason (no stack):", reason);
        }
    }
}

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;
    unhandledReasonsDisplayed = false;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;

        // Show unhandled rejection reasons if Node exits without handling an
        // outstanding rejection.  (Note that Browserify presently produces a
        // `process` global without the `EventEmitter` `on` method.)
        if (typeof process !== "undefined" && process.on) {
            process.on("exit", logUnhandledReasons);
        }
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    unhandledReasons.push(reason);
    displayUnhandledReasons();
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    if (typeof process !== "undefined" && process.on) {
        process.removeListener("exit", logUnhandledReasons);
    }
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;
            if (hasES6Generators) {
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

});

require.modules["techjacker-q"] = require.modules["techjacker~q@master"];
require.modules["techjacker~q"] = require.modules["techjacker~q@master"];
require.modules["q"] = require.modules["techjacker~q@master"];


require.register("optimuslime~win-backbone@0.0.4-5", function (exports, module) {

//Control all the win module! Need emitter for basic usage. 
var Emitter = (typeof process != "undefined" ?  require("component~emitter@master") : require("component~emitter@master"));
var Q = require("techjacker~q@master");
//

module.exports = winBB;

function winBB(homeDirectory)
{
	//
	var self = this;

	//we're an emitter! but we also mean extra business, so we override some calls later
	Emitter(self);

	//pull the inner versions, we'll overwrite self versions later
	var innerEmit = self.emit;
	var innerHasListeners = self.hasListeners;


	//cache the shift function
	var shift = [].shift;

	self.log = function()
	{
		throw new Error("Backbone doesn't use log directly anymore. Call backbone.getLogger(moduleObject) instead. ");
	}
	self.log.logLevel = function()
	{
		throw new Error("Backbone doesn't use log.loglevel anymore. Call backbone.logLevel directly instead. ");
	}

	var prependText = function(winFunction)
	{
		return !winFunction ? "" :  "    [" + winFunction + "]: ";
	}
	self.silenceBackbone = false;
	self.logLevel = 1;
	self.nologging = -1;
	self.warning = 0;
	self.normal = 1;
	self.verbose = 2;
	self.testing = 3;

	var muted = {};
	var modIDs = 0;
	var propID = "_backboneID";
	var propIDToName = {};
	var allLoggers = [];

	//we assign every module a log identification
	function nextModID() {return modIDs++;}

	//backbone handles the most basic logging for now, filtering by logLevel at the time
	//no stored history -- this will require a separate module
	//the practice of logging through the backbone should be standard though
	self.getLogger = function(moduleObject)
	{
		var winFunction = moduleObject.winFunction;
		var prepend = prependText(winFunction);

		var mid = addLogger(moduleObject);
		//otherwise ... 
		//already have an mid -- assigned by the loader

		if(typeof process != "undefined")//&& "".cyan != undefined)
		{
			prepend = '\x1B[36m' + prepend + '\x1B[39m';
		}

		var logFunction = function()
		{
			var logCategory;
			if(typeof arguments[0] == "number")
			{
				logCategory = [].shift.call(arguments);
			}
			else //otherwise, assume it's just a verbose message by default -- why would you log otherwise?
				logCategory = logFunction.verbose;

			if(!logCategory)
				throw new Error("Log category must be defined.");

			[].splice.call(arguments, 0,0, prepend)

			//needs to be lower than both our individual level, and our global level -- can't flood the log as any module
			if(logCategory <= logFunction.logLevel && logCategory <= self.logLevel && !muted[mid])
				console.log.apply(console, arguments);
		}

		//assign id to our logger!
		logFunction[propID] = mid;

		logFunction.log = logFunction;
		logFunction.logLevel = self.logLevel;
		logFunction.nologging = self.nologging;
		logFunction.warning = self.warning;
		logFunction.normal = self.normal;
		logFunction.verbose = self.verbose;
		logFunction.testing = self.testing;

		return logFunction;
	}
	//hold our logger propID
	var internalLog = self.getLogger({});

	//set the backbone logger to this internal object prop ID assigned by logger
	addNameToMID("backbone", internalLog[propID]);

	internalLog.logLevel = internalLog.testing;

	//none modules so far
	self.moduleCount = 0;

	//we need to have all calls on record
	var callerEvents = {};
	var requiredEvents = {};
	var optionalEvents = {};
	var moduleObjects = {};

	var mutingAll = false;

	function addLogger(moduleObject)
	{
		//tada
		var mid = moduleObject[propID];

		//if we haven't already gotten an mid assigned to this object
		if(mid == undefined)
		{
			//we need to assign an mid 
			mid = nextModID();

			//all we can do is assign it to this winfunction
			moduleObject[propID] = mid;
		}

		//grab the mid -- later we can do other things if necessary
		allLoggers.push(mid);

		//please respect the silence
		if(mutingAll)
			muted[mid] = true;

		return mid;
	}

	//can mute/unmute
	self.mute = function(name)
	{
		var mid = propIDToName[name];

		if(mid != undefined)
			muted[mid] = true;
	}
	self.unmute = function(name)
	{
		var mid = propIDToName[name];
		delete muted[mid];
	}
	self.muteAll = function()
	{
		mutingAll = true;
		for(var i=0; i < allLoggers.length; i++)
			muted[allLoggers[i]] = true;
	}
	self.unmuteAll = function(){
		muted = {};
		mutingAll = false;
	}
	self.muteLogger = function(logObject)
	{
		muted[logObject[propID]] = true;
	}
	
	self.unmuteLogger = function(logObject)
	{
		delete muted[logObject[propID]];
	}


	function addNameToMID(name, id)
	{
		//don't want duplicates
		if(propIDToName[name] != undefined)
			throw new Error("Duplicate prop ID being sent in, likely named another module 'backbone'");

			//for silencing by name
		propIDToName[name] = id;

		if(mutingAll)
			muted[id] = true;
	}

	//helpful getters for the module objects
	self.getModules = function(moduleNames){

		//empty? jsut send the whole module object back -- pretty dangerous -- ill advised
		if(!moduleNames)
			return moduleObjects;

		//otherwise, we build a map for the name
		var mReturn = {};

		//you can send an array of names, an object indexed by names, or a simple string
		var nameList = moduleNames;

		if(typeof moduleNames == "string")
			moduleNames = [moduleNames];
		else if(typeof moduleNames == "object")
			nameList = Object.keys(moduleNames);
		else if(!Array.isArray(moduleNames))
			throw new Error("Improper module names submitted: must be a string, an array, or a map of the module names");

		//loop through, grab the stuff
		for(var i=0; i < nameList.length; i++)
		{
			var name = nameList[i];
			mReturn[name] = moduleObjects[name];
		}

		//send it back, simple
		return mReturn;

	};
	self.getModuleCount = function(){return self.moduleCount;};
	self.getModuleNameList = function(){return Object.keys(moduleObjects);};


	var parseEventName = function(fullEvent)
	{
		var splitEvent = fullEvent.split(':');

		//if there is no ":", then this is improperly formatted
		if(splitEvent.length <= 1)
			throw new Error("Improper event name format, winFunction:eventName, instead looks like: " + fullEvent);

		return {winFunction: splitEvent[0], eventName: splitEvent[1]}
	}

	self.loadModules = function(inputNameOrObject, allConfiguration, localConfiguration)
	{
		var globalConfiguration;
		if(typeof localConfiguration == "undefined")
		{
			//we handle the case where potentially we have a global object and a bunch of local objects
			allConfiguration = allConfiguration || {};
			globalConfiguration = allConfiguration.global || {};
			localConfiguration = allConfiguration;
		}
		//both are defined -- one assumed to be global, other local
		else if(allConfiguration && localConfiguration)
		{
			globalConfiguration = allConfiguration;
			localConfiguration = localConfiguration;
		}
		else if(localConfiguration)
		{
			//allconfiguration is undefined-- this is weird -- maybe they made a mistake
			//try to pull global from local
			allConfiguration = localConfiguration;
			globalConfiguration = localConfiguration.global || {};
		}
		else
		{
			//just cover the basics, both undefined
			allConfiguration  = allConfiguration || {};
			globalConfiguration = allconfiguration.global || {};
			localConfiguration = localConfiguration || {};
		}
		
		//we have sent in a full object, or just a reference for a text file to load
		var jsonModules = inputNameOrObject;
		if(typeof inputNameOrObject == "string")
		{
			var fs = require("fs");
			var fBuffer = fs.readFileSync(inputNameOrObject);
			jsonModules = JSON.parse(fBuffer);
		}

		//otherwise, json modules is the json module information
		var mCount = 0;
		for(var key in jsonModules)
		{
			//perhaps there is some relative adjustments that need to be made for this to work?

			var locationNameOrObject = jsonModules[key];
			//if you're a function or object, we just leave you alone (the function will be instantiated at the end)
			//makes it easier to test things
			if(typeof locationNameOrObject == "object" || typeof locationNameOrObject == "function")
			{
				moduleObjects[key] = locationNameOrObject;
			}
			else if(locationNameOrObject.indexOf('/') != -1)
			{
				//locations relative to the home directory of the app
				moduleObjects[key] = require(homeDirectory + locationNameOrObject);
			}
			else
				moduleObjects[key] = require(locationNameOrObject);

			//if it's a function, we create a new object
			// if(typeof moduleObjects[key] != "function")
				// throw new Error("WIN Modules need to be functions for creating objects (that accept win backbone as first argument)")
			
			//create the object passing the backbone
			if(typeof moduleObjects[key] == "function") // then pass on teh configuration, both inputs are guaranteed to exist
				moduleObjects[key] = new moduleObjects[key](self, globalConfiguration, localConfiguration[key] || {});


			//if they were not assign an mid by a logger, then I don't need to worry -- yet
			var mid = moduleObjects[key][propID];
			if(mid == undefined)
			{
				mid = nextModID();
				moduleObjects[key][propID] = mid;
			}

			//go ahead and register this name for muting purposes
			addNameToMID(key, mid);

			mCount++;
		}

		self.moduleCount = mCount;

		//now we register our winFunctions for these modules
		for(var key in moduleObjects)
		{
			var wFun = moduleObjects[key].winFunction;
			if(!wFun || wFun == "" || typeof wFun != "string")
			{
				internalLog('Module does not implement winFunction properly-- must be non-empty string unlike: ' +  wFun);
				throw new Error("Improper win function");
			}

			//instead we do this later

			// if(!callerEvents[wFun])
			// {
			// 	//duplicate behaviors now allowed in backbone -- multiple objects claiming some events or functionality
			// 	callerEvents[wFun] = {};
			// 	requiredEvents[wFun] = {};
			// 	optionalEvents[wFun] = {};
			// }

		}

		//now we register our callback functions for all the events
		for(var key in moduleObjects)
		{
			var mod = moduleObjects[key];

			// if(!mod.eventCallbacks)
			// {
			// 	throw new Error("No callback function inside module: " +  mod.winFunction +  " full module: " +  mod);

			// }

			//event callbacks are option -- should cut down on module bloat for simple modules to do stuff
			if(!mod.eventCallbacks){
				internalLog("WARNING, loaded module doesn't provide any callback events inside: ", mod.winFunction, " - with key - ", key);

				//skip!
				continue;
			}

			//grab the event callbacks
			var mCallbacks = mod.eventCallbacks();

			for(var fullEventName in mCallbacks)
			{
				//
				if(typeof fullEventName != "string")
				{
					throw new Error("Event callback keys must be strings: " +  fullEventName);
				}

				var cb = mCallbacks[fullEventName];
				if(!cb || typeof cb != "function")
				{
					throw new Error("Event callback must be non-null function: " +  cb);
				}

				if(self.moduleHasListeners(fullEventName))
				{
					internalLog("Backbone doesn't allow duplicate callbacks for the same event: " + fullEventName);
					throw new Error("Same event answered more than once: " + fullEventName);
				}

				//now we register inside of the backbone
				//we override what was there before
				self.off(fullEventName);
				
				//sole callback for this event -- always overwriting
				self.on(fullEventName, cb);

				//throws error for improper formatting
				var parsed = parseEventName(fullEventName);

				var callObject = callerEvents[parsed.winFunction];
				
				if(!callObject){
					callObject = {};
					callerEvents[parsed.winFunction] = callObject;
				}

				callObject[parsed.eventName] = fullEventName;
			}
		}

		//now we grab all the required functionality for the mods
		for(var key in moduleObjects)
		{
			//call the mod for the events
			var mod = moduleObjects[key];

			//guaranteed to exist from callbacks above
			var fun = mod.winFunction;

			if(!mod.requiredEvents){
				internalLog("WARNING, loaded module doesn't require any events inside: ", fun, " - with key - ", key);

				//skip!
				continue;
			}

			// if(!mod.requiredEvents)
			// {
			// 	throw new Error("Required events function not written in module: " +  fun);
			// }

			var reqs = mod.requiredEvents();

			if(!reqs)
			{
				throw new Error("requiredEvents must return non-null array full of required events.");
			}

			//make sure we have all these events
			for(var i=0; i < reqs.length; i++)
			{
				if(!self.moduleHasListeners(reqs[i]))
					throw new Error("Missing a required listener: " +  reqs[i]);

				var parsed = parseEventName(reqs[i]);

				//lets keep track of who needs what. 
				var required = requiredEvents[fun];
				if(!required)
				{
					required = {};
					requiredEvents[fun] = required;
				}

				//then index into win function
				if(!required[parsed.winFunction])
				{
					required[parsed.winFunction] = {};
				}

				//and again to pared event name
				if(!required[parsed.winFunction][parsed.eventName])
				{
					required[parsed.winFunction][parsed.eventName] = reqs[i];
				}

			}

			//of course any mod can make optional events
			//these are events that you can optionally call, but aren't necessarily satisfied by any module
			//you should check the backbone for listeners before making an optional call -- use at your own risk!
			if(mod.optionalEvents)
			{
				var opts = mod.optionalEvents();

				for(var i=0; i < opts.length; i++)
				{
					var parsed = parseEventName(opts[i]);

					//lets keep track of who needs what. 
					var optional = optionalEvents[fun];

					//if we haven't seen this function requiring stuff before, create our object!
					if(!optional){
						optional = {};
						optionalEvents[fun] = optional;
					}

					//same for win function, have we seen before?
					if(!optional[parsed.winFunction])
					{
						optional[parsed.winFunction] = {};
					}

					//then the full on event name
					if(!optional[parsed.winFunction][parsed.eventName])
					{
						optional[parsed.winFunction][parsed.eventName] = opts[i];
					}
				}
			}

		}
	}



	//build a custom emitter for our module
	self.getEmitter = function(module)
	{
		if(!module.winFunction)
		{
			throw new Error("Can't generate module call function for module that doesn't have a winFunction!");
		}
		//emitter implicitly knows who is calling through closure
		var moduleFunction = module.winFunction;

		var emitter = function()
		{
			[].splice.call(arguments, 0, 0, moduleFunction);
			return self.moduleEmit.apply(self, arguments);
		}

		//pass the function through
		emitter.emit = emitter;

		//pass in the emitter to create a q calling function
		emitter.qCall = createQCallback(emitter);

		//use the qcalls to chain multiple calls together using Q.all and Q.allSettled
		emitter.qConcurrent = qAllCallback(emitter.qCall);

		//this makes it more convenient to check for listeners 
		//you don't need a backbone object AND an emitter. The emitter tells you both info 
		//-- while being aware of who is making requests
		emitter.hasListeners = function()
		{
			//has listeners is aware, so we can tap in and see who is checking for listeners 
			return self.moduleHasListeners.apply(self, arguments);
		}

		return emitter;
	}

		//this is for given a module a promise based callback method -- no need to define for every module
	//requires the Q library -- a worthy addition for cleaning up callback logic
	function createQCallback(bbEmit)
	{
		return function()
		{
			//defer -- resolve later
		    var defer = Q.defer();

		    //first add our own function type
		    var augmentArgs = arguments;

		    //make some assumptions about the returning call
		    var callback = function(err)
		    {
		        if(err)
		        {
		            defer.reject(err);
		        }
		        else
		        {
		            //remove the error object, send the info onwards
		            [].shift.call(arguments);

		            //now we have to do something funky here
		            //if you expect more than one argument, we have to send in the argument object 
		            //and you pick out the appropriate arguments
		            //if it's just one, we send the one argument like normal

		            //this is the behavior chosen
		            if(arguments.length > 1)
		                defer.resolve(arguments);
		            else
		                defer.resolve.apply(defer, arguments);
		        }
		    };

		    //then we add our callback to the end of our function -- which will get resolved here with whatever arguments are passed back
		    [].push.call(augmentArgs, callback);

		    //make the call, we'll catch it inside the callback!
		    bbEmit.apply(bbEmit, augmentArgs);

		    return defer.promise;
		}
	}

	function qAllCallback(qCall)
	{
		return function()
		{
			var defer = Q.defer();

			//send in all the events you want called by win-backbone
			var eventCalls = [].shift.call(arguments);

			var options = [].shift.call(arguments) || {};

			//these are all the things you want to call
			var allCalls = [];

			//either we call the all function (wish fails at the first error)
			var qfunc = Q.allSettled;

			//or optionally, we wait till they all fail or succeed
			if(options.endOnError)
				qfunc = Q.all;
			
			//create a bunch of promises that will be potentially resolved
			for(var i=0; i < eventCalls.length; i++)
				allCalls.push(qCall.apply(qCall, eventCalls[i]));

			//here we go!
			qfunc.call(qfunc, allCalls)
				.then(function(results)
				{
					//we got back stuff back
					//it's easy for Q.all
					//it would have caused an error, and been rejected inside fail
					if(options.endOnError){
						defer.resolve(results);
					}
					else
					{
						var finalValues = {length:0};
						var errors = [];
						var errored = false;

						for(var i=0; i < results.length; i++)
						{
							var result = results[i];

							//we know the outcome
					        if (result.state === "fulfilled") {
					            finalValues[i] = result.value;
					            finalValues.length++;
					            errors.push(undefined);
					        } else {
					            var reason = result.reason;
					            errors.push(reason);
					            errored = true;
					        }
						}

						//let the errors be known
						//we always reject with an array to be consistent
						if(errored)
							defer.reject(errors);
						else //otherwise, all good -- on we go
							defer.resolve(finalValues);
					}
				})
				.fail(function(err)
				{
					//end on error -- we only have one error to return
					//we always return arrays
					defer.reject([err]);
				});

			return defer.promise;
		}
	}

	//backwards compat, but more consistent with getters
	self.getModuleRequirements =
	self.moduleRequirements =  function()
	{
		return JSON.parse(JSON.stringify(requiredEvents));
	};
	//backwards compat, but more consistent with getters
	self.getRegisteredEvents =
	self.registeredEvents = function()
	{	
		//return a deep copy so it can't be messed with
		return JSON.parse(JSON.stringify(callerEvents));
	}

	self.initializeModules = function(done)
	{	
		//call each module for initialization

		var totalCallbacks = self.moduleCount;
		var errors;

		var finishCallback = function(err)
		{
			if(err)
			{
				//we encountered an error, we should send that back
				if(!errors)
					errors = [];
				errors.push(err);
			}

			//no matter what happens, we've finished a callback
			totalCallbacks--;

			if(totalCallbacks == 0)
			{
				//we've finished all the callbacks, we're done with initialization
				//send back errors if we have them
				done(errors);
			}
		}
		var wrapMod = function(mod)
		{
			return function()
			{
				mod.initialize(function(err)
				{
					finishCallback(err);
				});
			}
		}

		var hasInit = false;

		//order of initialization might matter -- perhaps this is part of how objects are arranged in the json file?
		for(var key in moduleObjects)
		{
			var mod = moduleObjects[key];
			//make sure not to accidentally forget this
			if(!mod.initialize)
				totalCallbacks--;
			else {
				hasInit = true;
				//seems goofy, but we dont want any poorly configured modules returning during this for loop -- awkward race condition!
				setTimeout(wrapMod(mod), 0)
			}
		}
		//nobody has an initialize function
		if(!hasInit)
		{
			//call done async
			setTimeout(done, 0);
		}
	}


	self.hasListeners = function()
	{
		throw new Error("Backbone doesn't pass listeners through itself any more, it uses the emitter.hasListeners. You must call backbone.getEmitter(moduleObject) to get an emitter.");
	}

	self.emit = function()
	{
		throw new Error("Backbone doesn't pass messages through emit any more. You must call backbone.getEmitter(moduleObject) -- passing the object.");
	}

	self.moduleHasListeners = function()
	{
		//pass request through module here!
		return innerHasListeners.apply(self, arguments);
	}

	self.moduleEmit = function()
	{
		//there are more than two 
		// internalLog('Emit: ', arguments);
		if(arguments.length < 2 || typeof arguments[0] != "string" || typeof arguments[1] != "string")
		{
			throw new Error("Cannot emit with less than two arguments, each of which must be strings: " + JSON.stringify(arguments));
		}
		//take the first argument from the array -- this is the caller
		var caller = shift.apply(arguments);
		//pull out the function and event name arguments to verify the callback
		var parsed = parseEventName(arguments[0]);
		var wFunction = parsed.winFunction;
		var eventName = parsed.eventName;

		internalLog("[" + caller + "]", "calling", "[" + parsed.winFunction + "]->" + eventName);

		//now we check if this caller declared intentions 
		if(!self.verifyEmit(caller, wFunction, eventName))
		{
			throw new Error("[" + caller + "] didn't require event [" + parsed.winFunction + "]->" + parsed.eventName);
		}

		//otherwise, normal emit will work! We've already peeled off the "caller", so it's just the event + arguments being passed
		innerEmit.apply(self, arguments);

	}

	self.verifyEmit = function(caller, winFunction, eventName)
	{
		//did this caller register for this event?
		if((!requiredEvents[caller] || !requiredEvents[caller][winFunction] || !requiredEvents[caller][winFunction][eventName])
			&& (!optionalEvents[caller] || !optionalEvents[caller][winFunction] || !optionalEvents[caller][winFunction][eventName]))
			return false;


		return true;
	}

	return self;
}




});

require.modules["optimuslime-win-backbone"] = require.modules["optimuslime~win-backbone@0.0.4-5"];
require.modules["optimuslime~win-backbone"] = require.modules["optimuslime~win-backbone@0.0.4-5"];
require.modules["win-backbone"] = require.modules["optimuslime~win-backbone@0.0.4-5"];


require.register("geraintluff~tv4@master/lang/de.js", function (exports, module) {
(function (global) {
	var lang = {
		INVALID_TYPE: "Ungültiger Typ: {type} (erwartet wurde: {expected})",
		ENUM_MISMATCH: "Keine Übereinstimmung mit der Aufzählung (enum) für: {value}",
		ANY_OF_MISSING: "Daten stimmen nicht überein mit einem der Schemas von \"anyOf\"",
		ONE_OF_MISSING: "Daten stimmen nicht überein mit einem der Schemas von \"oneOf\"",
		ONE_OF_MULTIPLE: "Daten sind valid in Bezug auf mehreren Schemas von \"oneOf\": index {index1} und {index2}",
		NOT_PASSED: "Daten stimmen mit dem \"not\" Schema überein",
		// Numeric errors
		NUMBER_MULTIPLE_OF: "Wert {value} ist kein Vielfaches von {multipleOf}",
		NUMBER_MINIMUM: "Wert {value} ist kleiner als das Minimum {minimum}",
		NUMBER_MINIMUM_EXCLUSIVE: "Wert {value} ist gleich dem Exklusiven Minimum {minimum}",
		NUMBER_MAXIMUM: "Wert {value} ist größer als das Maximum {maximum}",
		NUMBER_MAXIMUM_EXCLUSIVE: "Wert {value} ist gleich dem Exklusiven Maximum {maximum}",
		// String errors
		STRING_LENGTH_SHORT: "Zeichenkette zu kurz ({length} chars), minimum {minimum}",
		STRING_LENGTH_LONG: "Zeichenkette zu lang ({length} chars), maximum {maximum}",
		STRING_PATTERN: "Zeichenkette entspricht nicht dem Muster: {pattern}",
		// Object errors
		OBJECT_PROPERTIES_MINIMUM: "Zu wenige Attribute definiert ({propertyCount}), minimum {minimum}",
		OBJECT_PROPERTIES_MAXIMUM: "Zu viele Attribute definiert ({propertyCount}), maximum {maximum}",
		OBJECT_REQUIRED: "Notwendiges Attribut fehlt: {key}",
		OBJECT_ADDITIONAL_PROPERTIES: "Zusätzliche Attribute nicht erlaubt",
		OBJECT_DEPENDENCY_KEY: "Abhängigkeit fehlt - Schlüssel nicht vorhanden: {missing} (wegen Schlüssel: {key})",
		// Array errors
		ARRAY_LENGTH_SHORT: "Array zu kurz ({length}), minimum {minimum}",
		ARRAY_LENGTH_LONG: "Array zu lang ({length}), maximum {maximum}",
		ARRAY_UNIQUE: "Array Einträge nicht eindeutig (Index {match1} und {match2})",
		ARRAY_ADDITIONAL_ITEMS: "Zusätzliche Einträge nicht erlaubt"
	};

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['../tv4'], function(tv4) {
			tv4.addLanguage('de', lang);
			return tv4;
		});
	} else if (typeof module !== 'undefined' && module.exports){
		// CommonJS. Define export.
		var tv4 = require("geraintluff~tv4@master");
		tv4.addLanguage('de', lang);
		module.exports = tv4;
	} else {
		// Browser globals
		global.tv4.addLanguage('de', lang);
	}
})(this);

});

require.register("geraintluff~tv4@master", function (exports, module) {
/*
Author: Geraint Luff and others
Year: 2013

This code is released into the "public domain" by its author(s).  Anybody may use, alter and distribute the code without restriction.  The author makes no guarantees, and takes no liability of any kind for use of this code.

If you find a bug or make an improvement, it would be courteous to let the author know, but it is not compulsory.
*/
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports){
    // CommonJS. Define export.
    module.exports = factory();
  } else {
    // Browser globals
    global.tv4 = factory();
  }
}(this, function () {

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FObject%2Fkeys
if (!Object.keys) {
	Object.keys = (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [];

			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (var i=0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create) {
	Object.create = (function(){
		function F(){}

		return function(o){
			if (arguments.length !== 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}
			F.prototype = o;
			return new F();
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FisArray
if(!Array.isArray) {
	Array.isArray = function (vArg) {
		return Object.prototype.toString.call(vArg) === "[object Array]";
	};
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FindexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		if (this === null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;

		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n !== n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

// Grungey Object.isFrozen hack
if (!Object.isFrozen) {
	Object.isFrozen = function (obj) {
		var key = "tv4_test_frozen_key";
		while (obj.hasOwnProperty(key)) {
			key += Math.random();
		}
		try {
			obj[key] = true;
			delete obj[key];
			return false;
		} catch (e) {
			return true;
		}
	};
}
// Based on: https://github.com/geraintluff/uri-templates, but with all the de-substitution stuff removed

var uriTemplateGlobalModifiers = {
	"+": true,
	"#": true,
	".": true,
	"/": true,
	";": true,
	"?": true,
	"&": true
};
var uriTemplateSuffices = {
	"*": true
};

function notReallyPercentEncode(string) {
	return encodeURI(string).replace(/%25[0-9][0-9]/g, function (doubleEncoded) {
		return "%" + doubleEncoded.substring(3);
	});
}

function uriTemplateSubstitution(spec) {
	var modifier = "";
	if (uriTemplateGlobalModifiers[spec.charAt(0)]) {
		modifier = spec.charAt(0);
		spec = spec.substring(1);
	}
	var separator = "";
	var prefix = "";
	var shouldEscape = true;
	var showVariables = false;
	var trimEmptyString = false;
	if (modifier === '+') {
		shouldEscape = false;
	} else if (modifier === ".") {
		prefix = ".";
		separator = ".";
	} else if (modifier === "/") {
		prefix = "/";
		separator = "/";
	} else if (modifier === '#') {
		prefix = "#";
		shouldEscape = false;
	} else if (modifier === ';') {
		prefix = ";";
		separator = ";";
		showVariables = true;
		trimEmptyString = true;
	} else if (modifier === '?') {
		prefix = "?";
		separator = "&";
		showVariables = true;
	} else if (modifier === '&') {
		prefix = "&";
		separator = "&";
		showVariables = true;
	}

	var varNames = [];
	var varList = spec.split(",");
	var varSpecs = [];
	var varSpecMap = {};
	for (var i = 0; i < varList.length; i++) {
		var varName = varList[i];
		var truncate = null;
		if (varName.indexOf(":") !== -1) {
			var parts = varName.split(":");
			varName = parts[0];
			truncate = parseInt(parts[1], 10);
		}
		var suffices = {};
		while (uriTemplateSuffices[varName.charAt(varName.length - 1)]) {
			suffices[varName.charAt(varName.length - 1)] = true;
			varName = varName.substring(0, varName.length - 1);
		}
		var varSpec = {
			truncate: truncate,
			name: varName,
			suffices: suffices
		};
		varSpecs.push(varSpec);
		varSpecMap[varName] = varSpec;
		varNames.push(varName);
	}
	var subFunction = function (valueFunction) {
		var result = "";
		var startIndex = 0;
		for (var i = 0; i < varSpecs.length; i++) {
			var varSpec = varSpecs[i];
			var value = valueFunction(varSpec.name);
			if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) {
				startIndex++;
				continue;
			}
			if (i === startIndex) {
				result += prefix;
			} else {
				result += (separator || ",");
			}
			if (Array.isArray(value)) {
				if (showVariables) {
					result += varSpec.name + "=";
				}
				for (var j = 0; j < value.length; j++) {
					if (j > 0) {
						result += varSpec.suffices['*'] ? (separator || ",") : ",";
						if (varSpec.suffices['*'] && showVariables) {
							result += varSpec.name + "=";
						}
					}
					result += shouldEscape ? encodeURIComponent(value[j]).replace(/!/g, "%21") : notReallyPercentEncode(value[j]);
				}
			} else if (typeof value === "object") {
				if (showVariables && !varSpec.suffices['*']) {
					result += varSpec.name + "=";
				}
				var first = true;
				for (var key in value) {
					if (!first) {
						result += varSpec.suffices['*'] ? (separator || ",") : ",";
					}
					first = false;
					result += shouldEscape ? encodeURIComponent(key).replace(/!/g, "%21") : notReallyPercentEncode(key);
					result += varSpec.suffices['*'] ? '=' : ",";
					result += shouldEscape ? encodeURIComponent(value[key]).replace(/!/g, "%21") : notReallyPercentEncode(value[key]);
				}
			} else {
				if (showVariables) {
					result += varSpec.name;
					if (!trimEmptyString || value !== "") {
						result += "=";
					}
				}
				if (varSpec.truncate != null) {
					value = value.substring(0, varSpec.truncate);
				}
				result += shouldEscape ? encodeURIComponent(value).replace(/!/g, "%21"): notReallyPercentEncode(value);
			}
		}
		return result;
	};
	subFunction.varNames = varNames;
	return {
		prefix: prefix,
		substitution: subFunction,
	};
}

function UriTemplate(template) {
	if (!(this instanceof UriTemplate)) {
		return new UriTemplate(template);
	}
	var parts = template.split("{");
	var textParts = [parts.shift()];
	var prefixes = [];
	var substitutions = [];
	var varNames = [];
	while (parts.length > 0) {
		var part = parts.shift();
		var spec = part.split("}")[0];
		var remainder = part.substring(spec.length + 1);
		var funcs = uriTemplateSubstitution(spec);
		substitutions.push(funcs.substitution);
		prefixes.push(funcs.prefix);
		textParts.push(remainder);
		varNames = varNames.concat(funcs.substitution.varNames);
	}
	this.fill = function (valueFunction) {
		var result = textParts[0];
		for (var i = 0; i < substitutions.length; i++) {
			var substitution = substitutions[i];
			result += substitution(valueFunction);
			result += textParts[i + 1];
		}
		return result;
	};
	this.varNames = varNames;
	this.template = template;
}
UriTemplate.prototype = {
	toString: function () {
		return this.template;
	},
	fillFromObject: function (obj) {
		return this.fill(function (varName) {
			return obj[varName];
		});
	}
};
var ValidatorContext = function ValidatorContext(parent, collectMultiple, errorMessages, checkRecursive, trackUnknownProperties) {
	this.missing = [];
	this.missingMap = {};
	this.formatValidators = parent ? Object.create(parent.formatValidators) : {};
	this.schemas = parent ? Object.create(parent.schemas) : {};
	this.collectMultiple = collectMultiple;
	this.errors = [];
	this.handleError = collectMultiple ? this.collectError : this.returnError;
	if (checkRecursive) {
		this.checkRecursive = true;
		this.scanned = [];
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
		this.scannedFrozenValidationErrors = [];
		this.validatedSchemasKey = 'tv4_validation_id';
		this.validationErrorsKey = 'tv4_validation_errors_id';
	}
	if (trackUnknownProperties) {
		this.trackUnknownProperties = true;
		this.knownPropertyPaths = {};
		this.unknownPropertyPaths = {};
	}
	this.errorMessages = errorMessages;
	this.definedKeywords = {};
	if (parent) {
		for (var key in parent.definedKeywords) {
			this.definedKeywords[key] = parent.definedKeywords[key].slice(0);
		}
	}
};
ValidatorContext.prototype.defineKeyword = function (keyword, keywordFunction) {
	this.definedKeywords[keyword] = this.definedKeywords[keyword] || [];
	this.definedKeywords[keyword].push(keywordFunction);
};
ValidatorContext.prototype.createError = function (code, messageParams, dataPath, schemaPath, subErrors) {
	var messageTemplate = this.errorMessages[code] || ErrorMessagesDefault[code];
	if (typeof messageTemplate !== 'string') {
		return new ValidationError(code, "Unknown error code " + code + ": " + JSON.stringify(messageParams), dataPath, schemaPath, subErrors);
	}
	// Adapted from Crockford's supplant()
	var message = messageTemplate.replace(/\{([^{}]*)\}/g, function (whole, varName) {
		var subValue = messageParams[varName];
		return typeof subValue === 'string' || typeof subValue === 'number' ? subValue : whole;
	});
	return new ValidationError(code, message, dataPath, schemaPath, subErrors);
};
ValidatorContext.prototype.returnError = function (error) {
	return error;
};
ValidatorContext.prototype.collectError = function (error) {
	if (error) {
		this.errors.push(error);
	}
	return null;
};
ValidatorContext.prototype.prefixErrors = function (startIndex, dataPath, schemaPath) {
	for (var i = startIndex; i < this.errors.length; i++) {
		this.errors[i] = this.errors[i].prefixWith(dataPath, schemaPath);
	}
	return this;
};
ValidatorContext.prototype.banUnknownProperties = function () {
	for (var unknownPath in this.unknownPropertyPaths) {
		var error = this.createError(ErrorCodes.UNKNOWN_PROPERTY, {path: unknownPath}, unknownPath, "");
		var result = this.handleError(error);
		if (result) {
			return result;
		}
	}
	return null;
};

ValidatorContext.prototype.addFormat = function (format, validator) {
	if (typeof format === 'object') {
		for (var key in format) {
			this.addFormat(key, format[key]);
		}
		return this;
	}
	this.formatValidators[format] = validator;
};
ValidatorContext.prototype.resolveRefs = function (schema, urlHistory) {
	if (schema['$ref'] !== undefined) {
		urlHistory = urlHistory || {};
		if (urlHistory[schema['$ref']]) {
			return this.createError(ErrorCodes.CIRCULAR_REFERENCE, {urls: Object.keys(urlHistory).join(', ')}, '', '');
		}
		urlHistory[schema['$ref']] = true;
		schema = this.getSchema(schema['$ref'], urlHistory);
	}
	return schema;
};
ValidatorContext.prototype.getSchema = function (url, urlHistory) {
	var schema;
	if (this.schemas[url] !== undefined) {
		schema = this.schemas[url];
		return this.resolveRefs(schema, urlHistory);
	}
	var baseUrl = url;
	var fragment = "";
	if (url.indexOf('#') !== -1) {
		fragment = url.substring(url.indexOf("#") + 1);
		baseUrl = url.substring(0, url.indexOf("#"));
	}
	if (typeof this.schemas[baseUrl] === 'object') {
		schema = this.schemas[baseUrl];
		var pointerPath = decodeURIComponent(fragment);
		if (pointerPath === "") {
			return this.resolveRefs(schema, urlHistory);
		} else if (pointerPath.charAt(0) !== "/") {
			return undefined;
		}
		var parts = pointerPath.split("/").slice(1);
		for (var i = 0; i < parts.length; i++) {
			var component = parts[i].replace(/~1/g, "/").replace(/~0/g, "~");
			if (schema[component] === undefined) {
				schema = undefined;
				break;
			}
			schema = schema[component];
		}
		if (schema !== undefined) {
			return this.resolveRefs(schema, urlHistory);
		}
	}
	if (this.missing[baseUrl] === undefined) {
		this.missing.push(baseUrl);
		this.missing[baseUrl] = baseUrl;
		this.missingMap[baseUrl] = baseUrl;
	}
};
ValidatorContext.prototype.searchSchemas = function (schema, url) {
	if (schema && typeof schema === "object") {
		if (typeof schema.id === "string") {
			if (isTrustedUrl(url, schema.id)) {
				if (this.schemas[schema.id] === undefined) {
					this.schemas[schema.id] = schema;
				}
			}
		}
		for (var key in schema) {
			if (key !== "enum") {
				if (typeof schema[key] === "object") {
					this.searchSchemas(schema[key], url);
				} else if (key === "$ref") {
					var uri = getDocumentUri(schema[key]);
					if (uri && this.schemas[uri] === undefined && this.missingMap[uri] === undefined) {
						this.missingMap[uri] = uri;
					}
				}
			}
		}
	}
};
ValidatorContext.prototype.addSchema = function (url, schema) {
	//overload
	if (typeof url !== 'string' || typeof schema === 'undefined') {
		if (typeof url === 'object' && typeof url.id === 'string') {
			schema = url;
			url = schema.id;
		}
		else {
			return;
		}
	}
	if (url === getDocumentUri(url) + "#") {
		// Remove empty fragment
		url = getDocumentUri(url);
	}
	this.schemas[url] = schema;
	delete this.missingMap[url];
	normSchema(schema, url);
	this.searchSchemas(schema, url);
};

ValidatorContext.prototype.getSchemaMap = function () {
	var map = {};
	for (var key in this.schemas) {
		map[key] = this.schemas[key];
	}
	return map;
};

ValidatorContext.prototype.getSchemaUris = function (filterRegExp) {
	var list = [];
	for (var key in this.schemas) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.getMissingUris = function (filterRegExp) {
	var list = [];
	for (var key in this.missingMap) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.dropSchemas = function () {
	this.schemas = {};
	this.reset();
};
ValidatorContext.prototype.reset = function () {
	this.missing = [];
	this.missingMap = {};
	this.errors = [];
};

ValidatorContext.prototype.validateAll = function (data, schema, dataPathParts, schemaPathParts, dataPointerPath) {
	var topLevel;
	schema = this.resolveRefs(schema);
	if (!schema) {
		return null;
	} else if (schema instanceof ValidationError) {
		this.errors.push(schema);
		return schema;
	}

	var startErrorCount = this.errors.length;
	var frozenIndex, scannedFrozenSchemaIndex = null, scannedSchemasIndex = null;
	if (this.checkRecursive && data && typeof data === 'object') {
		topLevel = !this.scanned.length;
		if (data[this.validatedSchemasKey]) {
			var schemaIndex = data[this.validatedSchemasKey].indexOf(schema);
			if (schemaIndex !== -1) {
				this.errors = this.errors.concat(data[this.validationErrorsKey][schemaIndex]);
				return null;
			}
		}
		if (Object.isFrozen(data)) {
			frozenIndex = this.scannedFrozen.indexOf(data);
			if (frozenIndex !== -1) {
				var frozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].indexOf(schema);
				if (frozenSchemaIndex !== -1) {
					this.errors = this.errors.concat(this.scannedFrozenValidationErrors[frozenIndex][frozenSchemaIndex]);
					return null;
				}
			}
		}
		this.scanned.push(data);
		if (Object.isFrozen(data)) {
			if (frozenIndex === -1) {
				frozenIndex = this.scannedFrozen.length;
				this.scannedFrozen.push(data);
				this.scannedFrozenSchemas.push([]);
			}
			scannedFrozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].length;
			this.scannedFrozenSchemas[frozenIndex][scannedFrozenSchemaIndex] = schema;
			this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = [];
		} else {
			if (!data[this.validatedSchemasKey]) {
				try {
					Object.defineProperty(data, this.validatedSchemasKey, {
						value: [],
						configurable: true
					});
					Object.defineProperty(data, this.validationErrorsKey, {
						value: [],
						configurable: true
					});
				} catch (e) {
					//IE 7/8 workaround
					data[this.validatedSchemasKey] = [];
					data[this.validationErrorsKey] = [];
				}
			}
			scannedSchemasIndex = data[this.validatedSchemasKey].length;
			data[this.validatedSchemasKey][scannedSchemasIndex] = schema;
			data[this.validationErrorsKey][scannedSchemasIndex] = [];
		}
	}

	var errorCount = this.errors.length;
	var error = this.validateBasic(data, schema, dataPointerPath)
		|| this.validateNumeric(data, schema, dataPointerPath)
		|| this.validateString(data, schema, dataPointerPath)
		|| this.validateArray(data, schema, dataPointerPath)
		|| this.validateObject(data, schema, dataPointerPath)
		|| this.validateCombinations(data, schema, dataPointerPath)
		|| this.validateHypermedia(data, schema, dataPointerPath)
		|| this.validateFormat(data, schema, dataPointerPath)
		|| this.validateDefinedKeywords(data, schema, dataPointerPath)
		|| null;

	if (topLevel) {
		while (this.scanned.length) {
			var item = this.scanned.pop();
			delete item[this.validatedSchemasKey];
		}
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
	}

	if (error || errorCount !== this.errors.length) {
		while ((dataPathParts && dataPathParts.length) || (schemaPathParts && schemaPathParts.length)) {
			var dataPart = (dataPathParts && dataPathParts.length) ? "" + dataPathParts.pop() : null;
			var schemaPart = (schemaPathParts && schemaPathParts.length) ? "" + schemaPathParts.pop() : null;
			if (error) {
				error = error.prefixWith(dataPart, schemaPart);
			}
			this.prefixErrors(errorCount, dataPart, schemaPart);
		}
	}
	
	if (scannedFrozenSchemaIndex !== null) {
		this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = this.errors.slice(startErrorCount);
	} else if (scannedSchemasIndex !== null) {
		data[this.validationErrorsKey][scannedSchemasIndex] = this.errors.slice(startErrorCount);
	}

	return this.handleError(error);
};
ValidatorContext.prototype.validateFormat = function (data, schema) {
	if (typeof schema.format !== 'string' || !this.formatValidators[schema.format]) {
		return null;
	}
	var errorMessage = this.formatValidators[schema.format].call(null, data, schema);
	if (typeof errorMessage === 'string' || typeof errorMessage === 'number') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage}).prefixWith(null, "format");
	} else if (errorMessage && typeof errorMessage === 'object') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage.message || "?"}, errorMessage.dataPath || null, errorMessage.schemaPath || "/format");
	}
	return null;
};
ValidatorContext.prototype.validateDefinedKeywords = function (data, schema) {
	for (var key in this.definedKeywords) {
		if (typeof schema[key] === 'undefined') {
			continue;
		}
		var validationFunctions = this.definedKeywords[key];
		for (var i = 0; i < validationFunctions.length; i++) {
			var func = validationFunctions[i];
			var result = func(data, schema[key], schema);
			if (typeof result === 'string' || typeof result === 'number') {
				return this.createError(ErrorCodes.KEYWORD_CUSTOM, {key: key, message: result}).prefixWith(null, "format");
			} else if (result && typeof result === 'object') {
				var code = result.code || ErrorCodes.KEYWORD_CUSTOM;
				if (typeof code === 'string') {
					if (!ErrorCodes[code]) {
						throw new Error('Undefined error code (use defineError): ' + code);
					}
					code = ErrorCodes[code];
				}
				var messageParams = (typeof result.message === 'object') ? result.message : {key: key, message: result.message || "?"};
				var schemaPath = result.schemaPath ||( "/" + key.replace(/~/g, '~0').replace(/\//g, '~1'));
				return this.createError(code, messageParams, result.dataPath || null, schemaPath);
			}
		}
	}
	return null;
};

function recursiveCompare(A, B) {
	if (A === B) {
		return true;
	}
	if (typeof A === "object" && typeof B === "object") {
		if (Array.isArray(A) !== Array.isArray(B)) {
			return false;
		} else if (Array.isArray(A)) {
			if (A.length !== B.length) {
				return false;
			}
			for (var i = 0; i < A.length; i++) {
				if (!recursiveCompare(A[i], B[i])) {
					return false;
				}
			}
		} else {
			var key;
			for (key in A) {
				if (B[key] === undefined && A[key] !== undefined) {
					return false;
				}
			}
			for (key in B) {
				if (A[key] === undefined && B[key] !== undefined) {
					return false;
				}
			}
			for (key in A) {
				if (!recursiveCompare(A[key], B[key])) {
					return false;
				}
			}
		}
		return true;
	}
	return false;
}

ValidatorContext.prototype.validateBasic = function validateBasic(data, schema, dataPointerPath) {
	var error;
	if (error = this.validateType(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	if (error = this.validateEnum(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	return null;
};

ValidatorContext.prototype.validateType = function validateType(data, schema) {
	if (schema.type === undefined) {
		return null;
	}
	var dataType = typeof data;
	if (data === null) {
		dataType = "null";
	} else if (Array.isArray(data)) {
		dataType = "array";
	}
	var allowedTypes = schema.type;
	if (typeof allowedTypes !== "object") {
		allowedTypes = [allowedTypes];
	}

	for (var i = 0; i < allowedTypes.length; i++) {
		var type = allowedTypes[i];
		if (type === dataType || (type === "integer" && dataType === "number" && (data % 1 === 0))) {
			return null;
		}
	}
	return this.createError(ErrorCodes.INVALID_TYPE, {type: dataType, expected: allowedTypes.join("/")});
};

ValidatorContext.prototype.validateEnum = function validateEnum(data, schema) {
	if (schema["enum"] === undefined) {
		return null;
	}
	for (var i = 0; i < schema["enum"].length; i++) {
		var enumVal = schema["enum"][i];
		if (recursiveCompare(data, enumVal)) {
			return null;
		}
	}
	return this.createError(ErrorCodes.ENUM_MISMATCH, {value: (typeof JSON !== 'undefined') ? JSON.stringify(data) : data});
};

ValidatorContext.prototype.validateNumeric = function validateNumeric(data, schema, dataPointerPath) {
	return this.validateMultipleOf(data, schema, dataPointerPath)
		|| this.validateMinMax(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateMultipleOf = function validateMultipleOf(data, schema) {
	var multipleOf = schema.multipleOf || schema.divisibleBy;
	if (multipleOf === undefined) {
		return null;
	}
	if (typeof data === "number") {
		if (data % multipleOf !== 0) {
			return this.createError(ErrorCodes.NUMBER_MULTIPLE_OF, {value: data, multipleOf: multipleOf});
		}
	}
	return null;
};

ValidatorContext.prototype.validateMinMax = function validateMinMax(data, schema) {
	if (typeof data !== "number") {
		return null;
	}
	if (schema.minimum !== undefined) {
		if (data < schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM, {value: data, minimum: schema.minimum}).prefixWith(null, "minimum");
		}
		if (schema.exclusiveMinimum && data === schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM_EXCLUSIVE, {value: data, minimum: schema.minimum}).prefixWith(null, "exclusiveMinimum");
		}
	}
	if (schema.maximum !== undefined) {
		if (data > schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM, {value: data, maximum: schema.maximum}).prefixWith(null, "maximum");
		}
		if (schema.exclusiveMaximum && data === schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM_EXCLUSIVE, {value: data, maximum: schema.maximum}).prefixWith(null, "exclusiveMaximum");
		}
	}
	return null;
};

ValidatorContext.prototype.validateString = function validateString(data, schema, dataPointerPath) {
	return this.validateStringLength(data, schema, dataPointerPath)
		|| this.validateStringPattern(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateStringLength = function validateStringLength(data, schema) {
	if (typeof data !== "string") {
		return null;
	}
	if (schema.minLength !== undefined) {
		if (data.length < schema.minLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_SHORT, {length: data.length, minimum: schema.minLength}).prefixWith(null, "minLength");
		}
	}
	if (schema.maxLength !== undefined) {
		if (data.length > schema.maxLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_LONG, {length: data.length, maximum: schema.maxLength}).prefixWith(null, "maxLength");
		}
	}
	return null;
};

ValidatorContext.prototype.validateStringPattern = function validateStringPattern(data, schema) {
	if (typeof data !== "string" || schema.pattern === undefined) {
		return null;
	}
	var regexp = new RegExp(schema.pattern);
	if (!regexp.test(data)) {
		return this.createError(ErrorCodes.STRING_PATTERN, {pattern: schema.pattern}).prefixWith(null, "pattern");
	}
	return null;
};
ValidatorContext.prototype.validateArray = function validateArray(data, schema, dataPointerPath) {
	if (!Array.isArray(data)) {
		return null;
	}
	return this.validateArrayLength(data, schema, dataPointerPath)
		|| this.validateArrayUniqueItems(data, schema, dataPointerPath)
		|| this.validateArrayItems(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateArrayLength = function validateArrayLength(data, schema) {
	var error;
	if (schema.minItems !== undefined) {
		if (data.length < schema.minItems) {
			error = (this.createError(ErrorCodes.ARRAY_LENGTH_SHORT, {length: data.length, minimum: schema.minItems})).prefixWith(null, "minItems");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxItems !== undefined) {
		if (data.length > schema.maxItems) {
			error = (this.createError(ErrorCodes.ARRAY_LENGTH_LONG, {length: data.length, maximum: schema.maxItems})).prefixWith(null, "maxItems");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayUniqueItems = function validateArrayUniqueItems(data, schema) {
	if (schema.uniqueItems) {
		for (var i = 0; i < data.length; i++) {
			for (var j = i + 1; j < data.length; j++) {
				if (recursiveCompare(data[i], data[j])) {
					var error = (this.createError(ErrorCodes.ARRAY_UNIQUE, {match1: i, match2: j})).prefixWith(null, "uniqueItems");
					if (this.handleError(error)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayItems = function validateArrayItems(data, schema, dataPointerPath) {
	if (schema.items === undefined) {
		return null;
	}
	var error, i;
	if (Array.isArray(schema.items)) {
		for (i = 0; i < data.length; i++) {
			if (i < schema.items.length) {
				if (error = this.validateAll(data[i], schema.items[i], [i], ["items", i], dataPointerPath + "/" + i)) {
					return error;
				}
			} else if (schema.additionalItems !== undefined) {
				if (typeof schema.additionalItems === "boolean") {
					if (!schema.additionalItems) {
						error = (this.createError(ErrorCodes.ARRAY_ADDITIONAL_ITEMS, {})).prefixWith("" + i, "additionalItems");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (error = this.validateAll(data[i], schema.additionalItems, [i], ["additionalItems"], dataPointerPath + "/" + i)) {
					return error;
				}
			}
		}
	} else {
		for (i = 0; i < data.length; i++) {
			if (error = this.validateAll(data[i], schema.items, [i], ["items"], dataPointerPath + "/" + i)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObject = function validateObject(data, schema, dataPointerPath) {
	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return null;
	}
	return this.validateObjectMinMaxProperties(data, schema, dataPointerPath)
		|| this.validateObjectRequiredProperties(data, schema, dataPointerPath)
		|| this.validateObjectProperties(data, schema, dataPointerPath)
		|| this.validateObjectDependencies(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateObjectMinMaxProperties = function validateObjectMinMaxProperties(data, schema) {
	var keys = Object.keys(data);
	var error;
	if (schema.minProperties !== undefined) {
		if (keys.length < schema.minProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MINIMUM, {propertyCount: keys.length, minimum: schema.minProperties}).prefixWith(null, "minProperties");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxProperties !== undefined) {
		if (keys.length > schema.maxProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MAXIMUM, {propertyCount: keys.length, maximum: schema.maxProperties}).prefixWith(null, "maxProperties");
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectRequiredProperties = function validateObjectRequiredProperties(data, schema) {
	if (schema.required !== undefined) {
		for (var i = 0; i < schema.required.length; i++) {
			var key = schema.required[i];
			if (data[key] === undefined) {
				var error = this.createError(ErrorCodes.OBJECT_REQUIRED, {key: key}).prefixWith(null, "" + i).prefixWith(null, "required");
				if (this.handleError(error)) {
					return error;
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectProperties = function validateObjectProperties(data, schema, dataPointerPath) {
	var error;
	for (var key in data) {
		var keyPointerPath = dataPointerPath + "/" + key.replace(/~/g, '~0').replace(/\//g, '~1');
		var foundMatch = false;
		if (schema.properties !== undefined && schema.properties[key] !== undefined) {
			foundMatch = true;
			if (error = this.validateAll(data[key], schema.properties[key], [key], ["properties", key], keyPointerPath)) {
				return error;
			}
		}
		if (schema.patternProperties !== undefined) {
			for (var patternKey in schema.patternProperties) {
				var regexp = new RegExp(patternKey);
				if (regexp.test(key)) {
					foundMatch = true;
					if (error = this.validateAll(data[key], schema.patternProperties[patternKey], [key], ["patternProperties", patternKey], keyPointerPath)) {
						return error;
					}
				}
			}
		}
		if (!foundMatch) {
			if (schema.additionalProperties !== undefined) {
				if (this.trackUnknownProperties) {
					this.knownPropertyPaths[keyPointerPath] = true;
					delete this.unknownPropertyPaths[keyPointerPath];
				}
				if (typeof schema.additionalProperties === "boolean") {
					if (!schema.additionalProperties) {
						error = this.createError(ErrorCodes.OBJECT_ADDITIONAL_PROPERTIES, {}).prefixWith(key, "additionalProperties");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else {
					if (error = this.validateAll(data[key], schema.additionalProperties, [key], ["additionalProperties"], keyPointerPath)) {
						return error;
					}
				}
			} else if (this.trackUnknownProperties && !this.knownPropertyPaths[keyPointerPath]) {
				this.unknownPropertyPaths[keyPointerPath] = true;
			}
		} else if (this.trackUnknownProperties) {
			this.knownPropertyPaths[keyPointerPath] = true;
			delete this.unknownPropertyPaths[keyPointerPath];
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectDependencies = function validateObjectDependencies(data, schema, dataPointerPath) {
	var error;
	if (schema.dependencies !== undefined) {
		for (var depKey in schema.dependencies) {
			if (data[depKey] !== undefined) {
				var dep = schema.dependencies[depKey];
				if (typeof dep === "string") {
					if (data[dep] === undefined) {
						error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: dep}).prefixWith(null, depKey).prefixWith(null, "dependencies");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (Array.isArray(dep)) {
					for (var i = 0; i < dep.length; i++) {
						var requiredKey = dep[i];
						if (data[requiredKey] === undefined) {
							error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: requiredKey}).prefixWith(null, "" + i).prefixWith(null, depKey).prefixWith(null, "dependencies");
							if (this.handleError(error)) {
								return error;
							}
						}
					}
				} else {
					if (error = this.validateAll(data, dep, [], ["dependencies", depKey], dataPointerPath)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateCombinations = function validateCombinations(data, schema, dataPointerPath) {
	return this.validateAllOf(data, schema, dataPointerPath)
		|| this.validateAnyOf(data, schema, dataPointerPath)
		|| this.validateOneOf(data, schema, dataPointerPath)
		|| this.validateNot(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateAllOf = function validateAllOf(data, schema, dataPointerPath) {
	if (schema.allOf === undefined) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.allOf.length; i++) {
		var subSchema = schema.allOf[i];
		if (error = this.validateAll(data, subSchema, [], ["allOf", i], dataPointerPath)) {
			return error;
		}
	}
	return null;
};

ValidatorContext.prototype.validateAnyOf = function validateAnyOf(data, schema, dataPointerPath) {
	if (schema.anyOf === undefined) {
		return null;
	}
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	var errorAtEnd = true;
	for (var i = 0; i < schema.anyOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.anyOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["anyOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			this.errors = this.errors.slice(0, startErrorCount);

			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
				// We need to continue looping so we catch all the property definitions, but we don't want to return an error
				errorAtEnd = false;
				continue;
			}

			return null;
		}
		if (error) {
			errors.push(error.prefixWith(null, "" + i).prefixWith(null, "anyOf"));
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (errorAtEnd) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ANY_OF_MISSING, {}, "", "/anyOf", errors);
	}
};

ValidatorContext.prototype.validateOneOf = function validateOneOf(data, schema, dataPointerPath) {
	if (schema.oneOf === undefined) {
		return null;
	}
	var validIndex = null;
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	for (var i = 0; i < schema.oneOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.oneOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["oneOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			if (validIndex === null) {
				validIndex = i;
			} else {
				this.errors = this.errors.slice(0, startErrorCount);
				return this.createError(ErrorCodes.ONE_OF_MULTIPLE, {index1: validIndex, index2: i}, "", "/oneOf");
			}
			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
			}
		} else if (error) {
			errors.push(error);
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (validIndex === null) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ONE_OF_MISSING, {}, "", "/oneOf", errors);
	} else {
		this.errors = this.errors.slice(0, startErrorCount);
	}
	return null;
};

ValidatorContext.prototype.validateNot = function validateNot(data, schema, dataPointerPath) {
	if (schema.not === undefined) {
		return null;
	}
	var oldErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
		this.unknownPropertyPaths = {};
		this.knownPropertyPaths = {};
	}
	var error = this.validateAll(data, schema.not, null, null, dataPointerPath);
	var notErrors = this.errors.slice(oldErrorCount);
	this.errors = this.errors.slice(0, oldErrorCount);
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (error === null && notErrors.length === 0) {
		return this.createError(ErrorCodes.NOT_PASSED, {}, "", "/not");
	}
	return null;
};

ValidatorContext.prototype.validateHypermedia = function validateCombinations(data, schema, dataPointerPath) {
	if (!schema.links) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.links.length; i++) {
		var ldo = schema.links[i];
		if (ldo.rel === "describedby") {
			var template = new UriTemplate(ldo.href);
			var allPresent = true;
			for (var j = 0; j < template.varNames.length; j++) {
				if (!(template.varNames[j] in data)) {
					allPresent = false;
					break;
				}
			}
			if (allPresent) {
				var schemaUrl = template.fillFromObject(data);
				var subSchema = {"$ref": schemaUrl};
				if (error = this.validateAll(data, subSchema, [], ["links", i], dataPointerPath)) {
					return error;
				}
			}
		}
	}
};

// parseURI() and resolveUrl() are from https://gist.github.com/1088850
//   -  released as public domain by author ("Yaffle") - see comments on gist

function parseURI(url) {
	var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
	// authority = '//' + user + ':' + pass '@' + hostname + ':' port
	return (m ? {
		href     : m[0] || '',
		protocol : m[1] || '',
		authority: m[2] || '',
		host     : m[3] || '',
		hostname : m[4] || '',
		port     : m[5] || '',
		pathname : m[6] || '',
		search   : m[7] || '',
		hash     : m[8] || ''
	} : null);
}

function resolveUrl(base, href) {// RFC 3986

	function removeDotSegments(input) {
		var output = [];
		input.replace(/^(\.\.?(\/|$))+/, '')
			.replace(/\/(\.(\/|$))+/g, '/')
			.replace(/\/\.\.$/, '/../')
			.replace(/\/?[^\/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
		});
		return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
	}

	href = parseURI(href || '');
	base = parseURI(base || '');

	return !href || !base ? null : (href.protocol || base.protocol) +
		(href.protocol || href.authority ? href.authority : base.authority) +
		removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
		(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
		href.hash;
}

function getDocumentUri(uri) {
	return uri.split('#')[0];
}
function normSchema(schema, baseUri) {
	if (schema && typeof schema === "object") {
		if (baseUri === undefined) {
			baseUri = schema.id;
		} else if (typeof schema.id === "string") {
			baseUri = resolveUrl(baseUri, schema.id);
			schema.id = baseUri;
		}
		if (Array.isArray(schema)) {
			for (var i = 0; i < schema.length; i++) {
				normSchema(schema[i], baseUri);
			}
		} else {
			if (typeof schema['$ref'] === "string") {
				schema['$ref'] = resolveUrl(baseUri, schema['$ref']);
			}
			for (var key in schema) {
				if (key !== "enum") {
					normSchema(schema[key], baseUri);
				}
			}
		}
	}
}

var ErrorCodes = {
	INVALID_TYPE: 0,
	ENUM_MISMATCH: 1,
	ANY_OF_MISSING: 10,
	ONE_OF_MISSING: 11,
	ONE_OF_MULTIPLE: 12,
	NOT_PASSED: 13,
	// Numeric errors
	NUMBER_MULTIPLE_OF: 100,
	NUMBER_MINIMUM: 101,
	NUMBER_MINIMUM_EXCLUSIVE: 102,
	NUMBER_MAXIMUM: 103,
	NUMBER_MAXIMUM_EXCLUSIVE: 104,
	// String errors
	STRING_LENGTH_SHORT: 200,
	STRING_LENGTH_LONG: 201,
	STRING_PATTERN: 202,
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: 300,
	OBJECT_PROPERTIES_MAXIMUM: 301,
	OBJECT_REQUIRED: 302,
	OBJECT_ADDITIONAL_PROPERTIES: 303,
	OBJECT_DEPENDENCY_KEY: 304,
	// Array errors
	ARRAY_LENGTH_SHORT: 400,
	ARRAY_LENGTH_LONG: 401,
	ARRAY_UNIQUE: 402,
	ARRAY_ADDITIONAL_ITEMS: 403,
	// Custom/user-defined errors
	FORMAT_CUSTOM: 500,
	KEYWORD_CUSTOM: 501,
	// Schema structure
	CIRCULAR_REFERENCE: 600,
	// Non-standard validation options
	UNKNOWN_PROPERTY: 1000
};
var ErrorCodeLookup = {};
for (var key in ErrorCodes) {
	ErrorCodeLookup[ErrorCodes[key]] = key;
}
var ErrorMessagesDefault = {
	INVALID_TYPE: "invalid type: {type} (expected {expected})",
	ENUM_MISMATCH: "No enum match for: {value}",
	ANY_OF_MISSING: "Data does not match any schemas from \"anyOf\"",
	ONE_OF_MISSING: "Data does not match any schemas from \"oneOf\"",
	ONE_OF_MULTIPLE: "Data is valid against more than one schema from \"oneOf\": indices {index1} and {index2}",
	NOT_PASSED: "Data matches schema from \"not\"",
	// Numeric errors
	NUMBER_MULTIPLE_OF: "Value {value} is not a multiple of {multipleOf}",
	NUMBER_MINIMUM: "Value {value} is less than minimum {minimum}",
	NUMBER_MINIMUM_EXCLUSIVE: "Value {value} is equal to exclusive minimum {minimum}",
	NUMBER_MAXIMUM: "Value {value} is greater than maximum {maximum}",
	NUMBER_MAXIMUM_EXCLUSIVE: "Value {value} is equal to exclusive maximum {maximum}",
	// String errors
	STRING_LENGTH_SHORT: "String is too short ({length} chars), minimum {minimum}",
	STRING_LENGTH_LONG: "String is too long ({length} chars), maximum {maximum}",
	STRING_PATTERN: "String does not match pattern: {pattern}",
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({propertyCount}), minimum {minimum}",
	OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({propertyCount}), maximum {maximum}",
	OBJECT_REQUIRED: "Missing required property: {key}",
	OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed",
	OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {missing} (due to key: {key})",
	// Array errors
	ARRAY_LENGTH_SHORT: "Array is too short ({length}), minimum {minimum}",
	ARRAY_LENGTH_LONG: "Array is too long ({length}), maximum {maximum}",
	ARRAY_UNIQUE: "Array items are not unique (indices {match1} and {match2})",
	ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed",
	// Format errors
	FORMAT_CUSTOM: "Format validation failed ({message})",
	KEYWORD_CUSTOM: "Keyword failed: {key} ({message})",
	// Schema structure
	CIRCULAR_REFERENCE: "Circular $refs: {urls}",
	// Non-standard validation options
	UNKNOWN_PROPERTY: "Unknown property (not in schema)"
};

function ValidationError(code, message, dataPath, schemaPath, subErrors) {
	Error.call(this);
	if (code === undefined) {
		throw new Error ("No code supplied for error: "+ message);
	}
	this.message = message;
	this.code = code;
	this.dataPath = dataPath || "";
	this.schemaPath = schemaPath || "";
	this.subErrors = subErrors || null;

	var err = new Error(this.message);
	this.stack = err.stack || err.stacktrace;
	if (!this.stack) {
		try {
			throw err;
		}
		catch(err) {
			this.stack = err.stack || err.stacktrace;
		}
	}
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.name = 'ValidationError';

ValidationError.prototype.prefixWith = function (dataPrefix, schemaPrefix) {
	if (dataPrefix !== null) {
		dataPrefix = dataPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.dataPath = "/" + dataPrefix + this.dataPath;
	}
	if (schemaPrefix !== null) {
		schemaPrefix = schemaPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.schemaPath = "/" + schemaPrefix + this.schemaPath;
	}
	if (this.subErrors !== null) {
		for (var i = 0; i < this.subErrors.length; i++) {
			this.subErrors[i].prefixWith(dataPrefix, schemaPrefix);
		}
	}
	return this;
};

function isTrustedUrl(baseUrl, testUrl) {
	if(testUrl.substring(0, baseUrl.length) === baseUrl){
		var remainder = testUrl.substring(baseUrl.length);
		if ((testUrl.length > 0 && testUrl.charAt(baseUrl.length - 1) === "/")
			|| remainder.charAt(0) === "#"
			|| remainder.charAt(0) === "?") {
			return true;
		}
	}
	return false;
}

var languages = {};
function createApi(language) {
	var globalContext = new ValidatorContext();
	var currentLanguage = language || 'en';
	var api = {
		addFormat: function () {
			globalContext.addFormat.apply(globalContext, arguments);
		},
		language: function (code) {
			if (!code) {
				return currentLanguage;
			}
			if (!languages[code]) {
				code = code.split('-')[0]; // fall back to base language
			}
			if (languages[code]) {
				currentLanguage = code;
				return code; // so you can tell if fall-back has happened
			}
			return false;
		},
		addLanguage: function (code, messageMap) {
			var key;
			for (key in ErrorCodes) {
				if (messageMap[key] && !messageMap[ErrorCodes[key]]) {
					messageMap[ErrorCodes[key]] = messageMap[key];
				}
			}
			var rootCode = code.split('-')[0];
			if (!languages[rootCode]) { // use for base language if not yet defined
				languages[code] = messageMap;
				languages[rootCode] = messageMap;
			} else {
				languages[code] = Object.create(languages[rootCode]);
				for (key in messageMap) {
					if (typeof languages[rootCode][key] === 'undefined') {
						languages[rootCode][key] = messageMap[key];
					}
					languages[code][key] = messageMap[key];
				}
			}
			return this;
		},
		freshApi: function (language) {
			var result = createApi();
			if (language) {
				result.language(language);
			}
			return result;
		},
		validate: function (data, schema, checkRecursive, banUnknownProperties) {
			var context = new ValidatorContext(globalContext, false, languages[currentLanguage], checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			var error = context.validateAll(data, schema, null, null, "");
			if (!error && banUnknownProperties) {
				error = context.banUnknownProperties();
			}
			this.error = error;
			this.missing = context.missing;
			this.valid = (error === null);
			return this.valid;
		},
		validateResult: function () {
			var result = {};
			this.validate.apply(result, arguments);
			return result;
		},
		validateMultiple: function (data, schema, checkRecursive, banUnknownProperties) {
			var context = new ValidatorContext(globalContext, true, languages[currentLanguage], checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			context.validateAll(data, schema, null, null, "");
			if (banUnknownProperties) {
				context.banUnknownProperties();
			}
			var result = {};
			result.errors = context.errors;
			result.missing = context.missing;
			result.valid = (result.errors.length === 0);
			return result;
		},
		addSchema: function () {
			return globalContext.addSchema.apply(globalContext, arguments);
		},
		getSchema: function () {
			return globalContext.getSchema.apply(globalContext, arguments);
		},
		getSchemaMap: function () {
			return globalContext.getSchemaMap.apply(globalContext, arguments);
		},
		getSchemaUris: function () {
			return globalContext.getSchemaUris.apply(globalContext, arguments);
		},
		getMissingUris: function () {
			return globalContext.getMissingUris.apply(globalContext, arguments);
		},
		dropSchemas: function () {
			globalContext.dropSchemas.apply(globalContext, arguments);
		},
		defineKeyword: function () {
			globalContext.defineKeyword.apply(globalContext, arguments);
		},
		defineError: function (codeName, codeNumber, defaultMessage) {
			if (typeof codeName !== 'string' || !/^[A-Z]+(_[A-Z]+)*$/.test(codeName)) {
				throw new Error('Code name must be a string in UPPER_CASE_WITH_UNDERSCORES');
			}
			if (typeof codeNumber !== 'number' || codeNumber%1 !== 0 || codeNumber < 10000) {
				throw new Error('Code number must be an integer > 10000');
			}
			if (typeof ErrorCodes[codeName] !== 'undefined') {
				throw new Error('Error already defined: ' + codeName + ' as ' + ErrorCodes[codeName]);
			}
			if (typeof ErrorCodeLookup[codeNumber] !== 'undefined') {
				throw new Error('Error code already used: ' + ErrorCodeLookup[codeNumber] + ' as ' + codeNumber);
			}
			ErrorCodes[codeName] = codeNumber;
			ErrorCodeLookup[codeNumber] = codeName;
			ErrorMessagesDefault[codeName] = ErrorMessagesDefault[codeNumber] = defaultMessage;
			for (var langCode in languages) {
				var language = languages[langCode];
				if (language[codeName]) {
					language[codeNumber] = language[codeNumber] || language[codeName];
				}
			}
		},
		reset: function () {
			globalContext.reset();
			this.error = null;
			this.missing = [];
			this.valid = true;
		},
		missing: [],
		error: null,
		valid: true,
		normSchema: normSchema,
		resolveUrl: resolveUrl,
		getDocumentUri: getDocumentUri,
		errorCodes: ErrorCodes
	};
	return api;
}

var tv4 = createApi();
tv4.addLanguage('en-gb', ErrorMessagesDefault);

//legacy property
tv4.tv4 = tv4;

return tv4; // used by _header.js to globalise.

}));
});

require.modules["geraintluff-tv4"] = require.modules["geraintluff~tv4@master"];
require.modules["geraintluff~tv4"] = require.modules["geraintluff~tv4@master"];
require.modules["tv4"] = require.modules["geraintluff~tv4@master"];


require.register("optimuslime~win-schema@master/lib/addSchema.js", function (exports, module) {
//pull in traverse object for this guy
var traverse = require("optimuslime~traverse@master");
var schemaSpec = require("optimuslime~win-schema@master/lib/schemaSpec.js");


module.exports = extendAddSchema;

function extendAddSchema(self)
{

  var pathDelim = self.pathDelimiter;

  var defaultWINAdd = {
    wid : "string",
    dbType : "string",
    parents : {
      type: "array",
      items : {
        type : "string"
      }
    }
  }

  var winTypeRegExp = [];
  for(var key in defaultWINAdd)
  {
    winTypeRegExp.push(key);
  }
  self.log("--All WIN keywords: ", winTypeRegExp);

  winTypeRegExp = new RegExp("\\b" + winTypeRegExp.join("\\b|\\b") + "\\b");

  //everything we need to do to add a schema inside
  //this requires checking if it's properly formatted, pulling references, and moving
  //around things if it's not formatted but we would like to make it less wordy to make schema
    self.internalAddSchema = function(type, schemaJSON, options, finished)
    {
      if(typeof options == "function")
      {
        finished = options;
        options = {};
      }
      else
        options = options || {};

      if((schemaJSON.type == "array" || schemaJSON.items) && !options.skipWINAdditions)
      {
        finished("Array-types for schema cannot have WIN additions. It doesn't make any sense. The object must be an array, but also have a wid property? Failed: " + type);
        return;
      }

      //make a clone of the object 
      schemaJSON = JSON.parse(JSON.stringify(schemaJSON)); 

      //force all types to lower case -- always -- deal with weird validation errors otherwise
      traverse(schemaJSON).forEach(function(node)
      {
          if(this.key == "type" && typeof this.node == "string")
            this.update(this.node.toLowerCase());
      })

      //we add or move objects inside the schema to make it conform to expected v4 JSON schema validation
      appendSchemaInformation(schemaJSON, options);      

      //check our schema for wacky errors!
      var schemaCheck = checkSchemaErrors(schemaJSON);
      if(schemaCheck && schemaCheck.errors)
      {
        finished("Improper schema format for " + type + " - " + JSON.stringify(schemaCheck));
        return;
      }

      if(schemaCheck && schemaCheck.warnings)
      {
        self.log("Warnings: ".yellow, schemaCheck.warnings);
      }

      //save it in our map
      self.allSchema[type] = schemaJSON;

      if(!schemaJSON.id || schemaJSON.id != type)
        schemaJSON.id = type;

      if(!schemaJSON['$schema'])
        schemaJSON['$schema'] = "http://json-schema.org/draft-04/schema#";
      
      if(!schemaJSON.type)
        schemaJSON.type = "object";

      //add the schema to our validator -- this does most heavy lifting for us
      self.validator.addSchema(schemaJSON);

      //failed to add schema for some reason?
      if(self.validator.error){
        finished(self.validator.error);
      }
      else
      {
        //no error from validator, store the references inside
        storeSchemaReferences(type, schemaJSON);

        //when we create it 
        setSchemaProperties(type, schemaJSON, options);
        //take what you want, and give nothing back! The pirates way for us!
        finished();
      }
    }
    function setSchemaProperties(type, schemaJSON, options)
    {
      var props = {};
      if(options.skipWINAdditions)
        props.isWIN = false;
      else
        props.isWIN = true;
      
      var primePaths = {};

      var tJSON = traverse(schemaJSON);

      var references = self.requiredReferences[type];
      var refMap = {};

      for(var refType in references)
      {
          var locations = references[refType];
          for(var l =0; l < locations.length; l++)
          {
              var refInfo = locations[l];
              refMap[refInfo.typePath] = refInfo;
          }
      }
      // self.log("Refmap: ", refMap);
      function isRef(path){ return refMap[path.join(pathDelim)]}

      tJSON.forEach(function(node)
      {
        if(this.isRoot || this.isLeaf)
          return;

        //kill the future investigation of references
        if(isRef(this.path))
            this.keys = [];

          //if we are a known keyword -- that's not properties or items, we skip you!
        if(this.key != "properties" && this.key != "items" && self.keywordRegExp.test(this.key))
          this.keys = [];

        //we also ignore this as well
        if(winTypeRegExp.test(this.key))
          this.keys = [];

        // self.log("Isref?".green, isRef(this.path));

        // if(this.keys.length)
          // self.log("Potential PrimePath: ".green, this.key, " node: ", this.node);

        if(this.keys.length){

          var objPath = self.stripObjectPath(this.path);

          //we're an array, or we're inisde an array!
          if(this.node.type == "array" || this.node.items || this.key =="items")
          {
              //we are an array, we'll pull the array info -- and then we close off this array -- forever!
              //remember, primary paths are all about the objects, and the FIRST layer of array
              primePaths[objPath] = {type: "array"};
              this.keys = [];
          }
          else
          {
            //you must be a properties object
            //either you have a type, or you're an object
            primePaths[objPath] = {type: this.node.type || "object"};
          }
        }
        

      })

      // self.log("\n\tprimaryPaths: ".cyan, primePaths);

      self.primaryPaths[type] = primePaths;
      self.typeProperties[type] = props;

    }
    function hasNonKeywords(obj)
    {
      var hasNonKeywords = false;
        
      if(Array.isArray(obj))
      {
        //loop through object to grab keys
        for(var i=0; i < obj.length; i++)
        {
          var iKey = obj[i];
          //check if you're not a keyword
          if(!self.keywordRegExp.test(iKey))
          {
            //just one is enough
            hasNonKeywords = true;
            break;
          }
        }
      }
      else
      {
        for(var iKey in obj)
        {
          if(!self.keywordRegExp.test(iKey))
          {
            //just one is enough
            hasNonKeywords = true;
            break;
          }
        }
      }

      return hasNonKeywords;           
    }

  //handle everything associated with adding a schema
    function checkSchemaErrors(schemaJSON)
    {

      //check against the proper schema definition
      // var vck = self.validator.validateMultiple(schemaJSON, schemaSpec, true);
       var valCheck = self.validateFunction.apply(self.validator, [schemaJSON, schemaSpec, true]);
       
       //grab all possible errors
       var checkErrors = {length: 0};
       var checkWarnings = {length: 0};

       //if we're valid -- which we almost certainly are -- just keep going
       if(!valCheck.valid)
       {
          //let it be known -- this is a weird error
          self.log("Invalid from v4 JSON schema perspective: ", valCheck[errorKey]);

          checkErrors["root"] = valCheck[errorKey];
          checkErrors.length++;

          //not valid, throw it back
          return checkErrors;
       }


       //make sure we have some properties -- otherwise there is literally no validation/
       //during the move process, this is overridden, but it's a good check nonetheless
       if(!schemaJSON.properties && !schemaJSON.items)
       {
          checkErrors["root"] = "No properties/items defined at root. Schema has no validation without properties!";
          checkErrors.length++;
       }

       //going to need to traverse our schema object
       var tJSON = traverse(schemaJSON);

       tJSON.forEach(function(node)
       {
        //skip the root please
        if(this.isRoot || this.path.join(pathDelim).indexOf('required') != -1)
          return;

        //this should be a warning
        if(!self.requireByDefault && !this.isLeaf && !this.node.required)
        {
            //if you don't have a required object, then you're gonna have a bad time
            //this is a warning
            checkWarnings[this.path.join(pathDelim)] = "warning: if you disable requireByDefault and don't put require arrays, validation will ignore those properties.";
            checkWarnings.length++;

        }
        if(this.key == "properties" && this.node.properties)
        {
           checkErrors[this.path.join(pathDelim)] = "Properties inside properties is meaningless.";
           checkErrors.length++;
        }
        if(this.key == "type" && typeof this.node != "string")
        {
            //for whatever reason, there is a type defined, but not a string in it's place? Waa?
            checkErrors[this.path.join(pathDelim)] = "Types must be string";
            checkErrors.length++;
        }
        if(this.key == "type" && !self.typeRegExp.test(this.node.toLowerCase()))
        {
           checkErrors[this.path.join(pathDelim)] = "Types must be one of " + self.validTypes + " not " + this.node;
           checkErrors.length++;
        }
        if(this.isLeaf)
        {
          //if you don't have a type, and there is no ref object
          if(!this.parent.node.properties && (this.key != "type" && this.key != "$ref") && !this.parent.node.type && !this.parent.node["$ref"])
          {
              checkErrors[this.path.join(pathDelim)] = "Object doesn't have any properties, a valid type, or a reference, therefore it is invalid in the WIN spec.";
              checkErrors.length++;
          }
        }
        //not a leaf, you don't have a reference
        if(!self.allowAnyObjects && !this.isLeaf && !this.node["$ref"] )
        {
          //special case for items -- doesn't apply
          if(this.node.type == "object" && this.key != "items")
          {
            //we're going to check if the list of keys to follow have any non keywords
            //for instance if {type: "object", otherThing: "string"} keys = type, otherThing
            //if instead it's just {type : "object", required : []}, keys = type, required 
            //notice that the top has non-keyword keys, and the bottom example does not 
            //we're looking for the bottom example and rejecting it
            var bHasNonKeywords = hasNonKeywords(this.keys);
            
            //if you ONLY have keywords -- you don't have any other object types
            //you are a violation of win spec and you allow any object or array to be passed in
            if(!bHasNonKeywords){
              // self.log("Current: ".magenta, this.key, " Keys: ".cyan, this.keys || "none, node: " + this.node, " has non? ".red + bHasNonKeywords);
              checkErrors[this.path.join(pathDelim)] = "AllowAnyObjects is off, therefore you cannot simple have an 'object' type with no inner properties";
              checkErrors.length++;
            }
          }
          else if(this.node.type == "array")
          {
            //if you are an array and you have no items -- not allowed!
            if(!this.node.items){
              // self.log("Current: ".magenta, this.key, " Keys: ".cyan, this.keys || "none, node: " + this.node, " has non? ".red + bHasNonKeywords);
              checkErrors[this.path.join(pathDelim)] = "AllowAnyObjects is off, therefore you cannot simple have an 'array' type with no inner items";
              checkErrors.length++;
            }
            else
            {
              //if you have a ref -- you're okay for us!
              var bIemsHaveNonKey = this.node.items["$ref"] || this.node.items["type"] || hasNonKeywords(this.node.items.properties || {});
               if(!bIemsHaveNonKey){
                // self.log("Current: ".magenta, this.key, " Keys: ".cyan, this.keys || "none, node: " + this.node, " has non? ".red + bHasNonKeywords);
                checkErrors[this.path.join(pathDelim)] = "AllowAnyObjects is off, therefore you cannot simple have an 'array' type with no non-keyword inner items";
                checkErrors.length++;
              }
            }
          }
        
        }
        //if you're an array
        if(this.node.type == "array")
        {
          //grab your items
          var items = this.node.items;
          if(!items && !self.allowAnyObjects)
          {
             checkErrors[this.path.join(pathDelim)] = "AllowAnyObjects is off for arrays, therefore you cannot simple have an 'array' type with no inner items";
              checkErrors.length++;
          }
          else
          {
            items = items || {};
            //we have items -- we shouldn't have a reference type && other items
            if(items.properties && items["$ref"])
            {
              checkErrors[this.path.join(pathDelim)] = "Array items in WIN cannot have properties AND a reference type. One or the other.";
              checkErrors.length++;
            }
          }
        }


       });

       if(checkErrors.length || checkWarnings.length)
        return {errors: checkErrors, warnings: checkWarnings};
      else
        return null;

    }

    self.stripObjectPath = function(path)
    {
      //obj path will be returned
      var objectPath = [];

      //travere this path, yo
      traverse(path).forEach(function()
      {
        //no routes including properties or items -- made up schema info!
        if(!this.isRoot && (this.node != "properties" && this.node != "items"))
          objectPath.push(this.node);
      });

      return objectPath.join(pathDelim);
    }

    //storing the references inside of a schema object (if we don't already know them)
    function parseSchemaReferences(schemaJSON)
    {
    	//first we wrap our object with traverse methods
    	var tJSON = traverse(schemaJSON);

    	var references = {};

    	self.log('--  Parsing refs -- ');
      // self.log(schemaJSON);
    	//now we step through pulling the path whenever we hit a reference
    	tJSON.forEach(function(node)
    	{
    		//we are at a reference point
        //we make an exception for arrays -- since the items object can hold references!
        if(this.node["$ref"] && (this.key == "items" || !self.keywordRegExp.test(this.key)))
    		// if(this.isLeaf && this.key == "$ref")
    		{
    			//todo logic for when it's "oneOf" or other valid JSON schema things
    			var fullPath = this.path.join(pathDelim);//this.path.slice(0, this.path.length-1).join(pathDelim);
    			var referenceType = this.node["$ref"];

          
          var objectPath = self.stripObjectPath(this.path);

          //pull the "items" piece out of the path -- otherwise, if you're just a normal object -- it's the same as fullPath
          var typePath = this.key == "items" ? this.path.slice(0, this.path.length-1).join(pathDelim) : fullPath;



    			if(references[fullPath])
    			{
    				throw new Error("Not yet supported reference behavior, arrays of references: ", fullPath);
    			}

          //assuming type is defined here!
    			references[fullPath] = {schemaType: referenceType, schemaPath: fullPath, objectPath: objectPath, typePath: typePath};
          self.log(self.log.testing, 'Reference detected @ '+fullPath+': ', references[fullPath]);
    		}
    	});

    	self.log("-- Full refs -- ", references);

    	return references;
    } 

    function storeSchemaReferences(type, schemaJSON)
    {
    	self.schemaReferences[type] = parseSchemaReferences(schemaJSON);

      self.requiredReferences[type] = {};

      for(var path in self.schemaReferences[type])
      {
        var schemaInfo = self.schemaReferences[type][path];
        var refType = schemaInfo.schemaType;
        var aReqRefs = self.requiredReferences[type][refType];

        if(!aReqRefs)
        {
          aReqRefs = [];
          self.requiredReferences[type][refType] = aReqRefs;
        }
        //value is the reference type 
        aReqRefs.push(schemaInfo);
      }


      //now we know all the references, their paths, and what type needs what references
    }
    function moveAllToProperties(tJSON)
    {
       tJSON.forEach(function(node)
       {          

          // self.log("Investigating: ", this.key, " @ ", this.path.join(pathDelim), " all keys: ", this.keys);
          //for all non-arrays and non-leafs and non-properties object -- move to a properties object if not a keyword!
          if(!this.isLeaf && this.key != "properties" && !Array.isArray(this.node))
          {

            //movement dpeends on what type you are -- arrays move to items, while objects move to properties
            var moveLocation = "properties";
            if(this.node.type == "array")
              moveLocation = "items";

            // self.log('Movement: ', this.key, " @ ", this.path.join(pathDelim) + " : ", this.node);
            // self.log("Move to : ".green + moveLocation);


            // self.log("Move innitiated: ".magenta, this.node);
            // self.log('Original node: '.green, node);
            var empty = true;
            var move = {};
            //any key that isn't one of our keywords is getting moved inside!
            for(var key in this.node){
                if(!self.keywordRegExp.test(key)){
                  // self.log('Moving key @ ', this.path.join(pathDelim) || "Is root? ", " : ", this.key || this.isRoot); 
                  move[key] = this.node[key];
                  empty = false;
                }
            }

            //don't move nothing derrr
            if(!empty)
            {
               // self.log('Moving: '.red, move);

              //create proeprties if it doesn't exist
              node[moveLocation] = node[moveLocation] || {};

              for(var key in move)
              {
                //move to its new home
                node[moveLocation][key] = move[key];
                //remove from previous location 
                delete node[key];
              }

              //make sure to update, thank you
              this.update(node);

              //we need to investigate the newly created properties/items object -- to continue down the rabbit hole
              this.keys.push(moveLocation);
            }
           

          }
       });
    }
    function addWINTypes(schemaJSON, options)
    {
      for(var key in defaultWINAdd)
      {
        var winAdd = defaultWINAdd[key];
        
        //if it's just a shallow string -- add it directly
        if(typeof winAdd == "string")
          schemaJSON[key] = winAdd;
        else //otehrwise, we should clone the larger object
          schemaJSON[key] = traverse(defaultWINAdd[key]).clone();
      }
    }
    function appendSchemaInformation(schemaJSON, options)
    {
      //add in default win types
      if(!options.skipWINAdditions)
        addWINTypes(schemaJSON, options);

      //build a traverse object for navigating and updating the object
      var tJSON = traverse(schemaJSON);

      //step one convert string to types
      tJSON.forEach(function(node)
      {
        var needsUpdate = false;
          //if you are a leaf -- and you only dictate the type e.g. string/number/array etc -- we'll convert you to proper type
        if(this.isLeaf && typeof this.node == "string")
        {
          //if the key is not a known keyword, and the node string is a proper type
          if(!self.keywordRegExp.test(this.key) && self.typeRegExp.test(node.toLowerCase()))
          {
            //node is a type! make sure it's a lower case type being stored.
            node = {type: node.toLowerCase()};
            needsUpdate = true;
          }
        }

        if(this.node)
        {

         if(this.node.items && !this.node.type)
          {
            this.node.type = "array";
            needsUpdate = true;
          }

          //rewrite {type : "array", "$ref" : "something"} => {type : "array", items : {"$ref" : "something"}}
          if(this.node.type == "array" && this.node["$ref"])
          {
            this.node.items = this.node.items || {};
            this.node.items["$ref"] = this.node["$ref"];
            delete this.node["$ref"];
            needsUpdate = true;
          }

        }


        if(needsUpdate)
          this.update(node);

      })

      //update location of objects to match validation issues
      //json schema won't validate outside of properties object -- which some people may forget
      //this is basically a correct method
      moveAllToProperties(tJSON);

      // var util = require('util');
      // self.log("Post move schema: ".cyan, util.inspect(schemaJSON, false, 10));

      tJSON.forEach(function(node)
      {
        var needsUpdate = false;


       
          //if we aren't a leaf object, we are a full object
          //therefore, we must have required (since we're in default mode)
          //since we cover the properties object inside, we don't need to go indepth for that key too!
        if(self.requireByDefault && !this.isLeaf && !this.node.required && !Array.isArray(this.node))
        {
          //the require needs to be filled iwth all the properties of this thing, except
          //for anything defined by v4 json schema -- so we run a regex to reject those keys
          var reqProps = [];

          // self.log("Not leaf: ".magenta, this.node, " Key : ", this.key);

          //do not do this if you're in the properties object
          //since the prop keys belong to the PARENT not the node
          if(this.key != "properties")
          {
            for(var key in this.node){
              if(!self.keywordRegExp.test(key)){
              // self.log('Key added: '.red, key);

                reqProps.push(key);
              }
            }
            // self.log('Post not props: '.blue, reqProps);
          }
          
          //for every object, you can also have a properties object too
          //required applies to the subling property object as well
          //so we loop through the properties object as well
         for(var key in this.node.properties){
            if(!self.keywordRegExp.test(key)){
              reqProps.push(key);
            }
          }

          if(reqProps.length)
          {
            node.required = reqProps;
            needsUpdate = true;
          }        
        }

     
       if(needsUpdate){
          // self.log('New required - : ', this.node, ' : ', reqProps);
          this.update(node);
        }
      });



        // self.log("--post traverse -- ", schemaJSON);

    }

	return self;
}




});

require.register("optimuslime~win-schema@master/lib/schemaSpec.js", function (exports, module) {
module.exports = 
{
    "id": "http://json-schema.org/draft-04/schema#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
        },
        "simpleTypes": {
            "enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "format": "uri"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "boolean",
            "default": false
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "boolean",
            "default": false
        },
        "maxLength": { "$ref": "#/definitions/positiveInteger" },
        "minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": {}
        },
        "maxItems": { "$ref": "#/definitions/positiveInteger" },
        "minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "maxProperties": { "$ref": "#/definitions/positiveInteger" },
        "minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "dependencies": {
        "exclusiveMaximum": [ "maximum" ],
        "exclusiveMinimum": [ "minimum" ]
    },
    "default": {}
}
});

require.register("optimuslime~win-schema@master", function (exports, module) {
//pull in the validating workhorse -- checks schema and stuff
var tv4 = require("geraintluff~tv4@master");
//pull in traverse object from the repo please!
var traverse = require("optimuslime~traverse@master");

//pull in the object that knows what all schema look like!
var schemaSpec = require("optimuslime~win-schema@master/lib/schemaSpec.js");

var addSchemaSupport = require("optimuslime~win-schema@master/lib/addSchema.js");

module.exports = winSchema;

function winSchema(winback, globalConfiguration, localConfiguration)
{
	//load up basic win-module stufffff
	var self = this;
  self.winFunction = "schema";
  self.log = winback.getLogger(self);

  //limited only by global -- or we could limit our own verboseness
  self.log.logLevel = localConfiguration.logLevel || self.log.normal;

  self.pathDelimiter = "///";

  //this creates "internalAddSchema" to handle the weighty add logic
  //need to thoroughly test and modify incoming schema to align with 
  //logical schema setup for WIN
  addSchemaSupport(self, globalConfiguration, localConfiguration);

	self.validator = tv4.freshApi();

 //set the backbone and our logging function
  self.bbEmit = winback.getEmitter(self);

  //config setups

  self.multipleErrors = (localConfiguration.multipleErrors == true || localConfiguration.multipleErrors == "true");
  //by default you can have unknown keys -- the server environment may desire to change this
  //if you don't want to be storing extra info
  //by default, on lockdown -- better that way -- no sneaky stuff
  self.allowUnknownKeys = localConfiguration.allowUnknownKeys || false;

  //all keys are required by default -- this adds in required objects for everything
  self.requireByDefault = localConfiguration.requireByDefault || true;

  //do we allow properties with just the type "object" or "array"
  //this would allow ANY data to be fit in there with no validation checks (other than it is an object or array)
  //shouldn't allow this because people could slip in all sorts of terrible things without validation
  self.allowAnyObjects = localConfiguration.allowAnyObjects || false;

  self.eventCallbacks = function()
  {
        var callbacks = {};

        //add callbacks to the object-- these are the functions called when the full event is emitted
        callbacks["schema:validate"] = self.validateData;
        callbacks["schema:validateMany"] = self.validateDataArray;
        callbacks["schema:addSchema"] = self.addSchema;
        callbacks["schema:getSchema"] = self.getSchema;
        callbacks["schema:getSchemaReferences"] = self.getSchemaReferences;
        callbacks["schema:getFullSchema"] = self.getFullSchema;
        callbacks["schema:getSchemaProperties"] = self.getSchemaProperties;

        //these are for deealing with pulling references from a specific object -- it's easier done in this module
        callbacks["schema:getReferencesAndParents"] = self.getReferencesAndParents;
        callbacks["schema:replaceParentReferences"] = self.replaceParentReferences;

        //send back our callbacks
        return callbacks;
  }
  self.requiredEvents = function()
  {
  	//don't need no one for nuffin'
  	return [];
  }

  self.initialize = function(done)
  {
  	setTimeout(function()
  	{
  		done();
  	}, 0);
  }

    //cache all our schema by type
    self.allSchema = {};
    self.schemaReferences = {};
    self.requiredReferences = {};
    self.fullSchema = {};
    self.primaryPaths = {};
    self.typeProperties = {};

    self.validTypes = "\\b" + schemaSpec.definitions.simpleTypes.enum.join('\\b|\\b') + "\\b"; //['object', 'array', 'number', 'string', 'boolean', 'null'].join('|');
    self.typeRegExp = new RegExp(self.validTypes);

    self.specKeywords = ["\\$ref|\\babcdefg"];
    for(var key in schemaSpec.properties)
      self.specKeywords.push(key.replace('$', '\\$'));

    //join using exact phrasing checks
    self.specKeywords = self.specKeywords.join('\\b|\\b') + "\\b";
    self.keywordRegExp = new RegExp(self.specKeywords);

    self.log(self.log.testing, "--Specced types: ".green, self.validTypes);
    self.log(self.log.testing, "--Specced keywords: ".green, self.specKeywords);

    self.validateFunction = (self.multipleErrors ? self.validator.validateMultiple : self.validator.validateResult);
    self.errorKey = self.multipleErrors ? "errors" : "error";

    function listTypeIssues(type)
    {
      if(!self.allSchema[type]){
        return "Schema type not loaded: " + type;
      }

      //we have to manually detect missing references -- since the validator is not concerned with such things
      //FOR WHATEVER REASON
      var missing = self.validator.getMissingUris();
      for(var i=0; i < missing.length; i++)
      {
        //if we have this type inside our refernces for this object, it means we're missing a ref schema for this type!
        if(self.requiredReferences[type][missing[i]])
        {
          return "Missing at least 1 schema definition: " + missing[i];
        }
      }
    }

    function internalValidate(schema, object)
    {
      //validate against what type?
      var result = self.validateFunction.apply(self.validator, [object, schema, true, !self.allowUnknownKeys]);

       //if it's not an array, make it an array
      //if it's empty, make it a damn array
      var errors = result[self.errorKey];

      //if you are multiple errors, then you are a non-undefined array, just return as usual
      //otherwise, you are an error but not in an array
      //if errors is undefined then this will deefault to []
      errors = (errors && !Array.isArray(errors)) ? [errors] : errors || [];

      return {valid : result.valid, errors : errors};
    }
    self.validateDataArray = function(type, objects, finished)
    {
      var typeIssues = listTypeIssues(type);

      //stop if we have type issues
      if(typeIssues)
      {
        finished(typeIssues);
        return;
      }
      else if(typeof type != "string" || !Array.isArray(objects))
      {
        finished("ValidateMany requires type [string], objects [array]");
        return;
      }

      var schema = self.validator.getSchema(type);
      // self.log('validate many against: ', schema);

      var allValid = true;
      var allErrors = [];
      for(var i=0; i < objects.length; i++)
      {
        var result = internalValidate(schema, objects[i]);

        if(!result.valid){
          allValid = false;
          allErrors.push(result.errors);
        }
        else //no error? just push empty array!
          allErrors.push([]);
      }

      //if we have errors during validation, they'll be passed on thank you!
      //if you're valid, and there are no errors, then don't send nuffin
      finished(undefined, allValid, (!allValid ? allErrors : undefined));
    }
    self.validateData = function(type, object, finished)
    {
      var typeIssues = listTypeIssues(type);

      //stop if we have type issues
      if(typeIssues)
      {
        finished(typeIssues);
        return;
      }

      //log object being checked
      self.log("Validate: ", object);

      //now we need to validate, we definitely have all the refs we need
      var schema = self.validator.getSchema(type);

      //log what's being validated
      self.log('validate against: ', schema);
    	 
      var result = internalValidate(schema, object);

      //if we have errors during validation, they'll be passed on thank you!
      //if you're valid, and there are no errors, then don't send nuffin
      finished(undefined, result.valid, (result.errors.length ? result.errors : undefined));
    }

    //todo: pull reference objects from schema -- make sure those exist as well?
   	self.addSchema = function(type, schemaJSON, options, finished)
   	{
      //pass args into internal adds
      return self.internalAddSchema.apply(self, arguments);
   	}

   	    //todo: pull reference objects from schema -- make sure those exist as well?
   	self.getSchema = function(typeOrArray, finished)
   	{   	
      //did we request one or many?
      var typeArray = typeOrArray;
      if(typeof typeOrArray == "string")
      {
        //make single type to return
        typeArray = [typeOrArray];
      }

      var refArray = [];
      for(var i=0; i < typeArray.length; i++)
      {
        var sType = typeArray[i];

      //failed to get schema for some very odd reason?
        if(!self.allSchema[sType]){
          finished("Schema type not loaded: ", sType);
          return;
        }
        //push our reference information as a clone
        refArray.push(traverse(self.validator.getSchema(sType)).clone());
        //if you hit an error -send back
        if(self.validator.error){
          finished(self.validator.error);
          return;
        }
      }

      //send the schema objects back
      //send an array regardless of how many requested -- standard behavior
      finished(undefined, refArray);    

   	}

   	self.getSchemaReferences = function(typeOrArray, finished)
   	{
      var typeArray = typeOrArray;
      if(typeof typeOrArray == "string")
      {
        //make single type to return
        typeArray = [typeOrArray];
      }

      var refArray = [];
      for(var i=0; i < typeArray.length; i++)
      {
        var sType = typeArray[i];

        if(!self.allSchema[sType]){
          finished("Schema type not loaded: ", sType);
          return;
        }
        //push our reference information as a clone
        refArray.push(traverse(self.requiredReferences[sType]).clone());
      }

  		//send the refernece objects back
      //if you are a single object, just send the one -- otherwise send an array
      finished(undefined, refArray); 		
   	}

    var buildFullSchema = function(type)
    {
      var schema = self.validator.getSchema(type);
      var tSchema = traverse(schema);

      var clone = tSchema.clone();
      var tClone = traverse(clone);
      var references = self.schemaReferences[type];

      for(var path in references)
      {
        //we get the type of reference
        var schemaInfo = references[path];
        var refType = schemaInfo.schemaType;

        //this is recursive behavior -- itwill call buidl full schema if not finished yet
        var fullRefSchema = internalGetFullSchema(refType);

        if(!fullRefSchema)
          throw new Error("No schema could be created for: " + refType + ". Please check it's defined.");

        //now we ahve teh full object to replace
        var tPath = path.split(self.pathDelimiter);

        // self.log(self.log.testing, 'Path to ref: ', tPath, " replacement: ", fullRefSchema);

        //use traverse to set the path object as our full ref object
        tClone.set(tPath, fullRefSchema);
      }

      // self.log(self.log.testing, "Returning schema: ", type, " full: ", clone);

      return clone;
    }
    var inprogressSchema = {};

    function internalGetFullSchema(type)
    {
      if(inprogressSchema[type])
      {
          throw new Error("Infinite schema reference loop: " + JSON.stringify(Object.keys(inprogressSchema)));    
      }

      inprogressSchema[type] = true;

       //if we don't have a full type yet, we build it
      if(!self.fullSchema[type])
      {
        //need to build a full schema object
        var fSchema = buildFullSchema(type);

        self.fullSchema[type] = fSchema;
      }

      //mark the in progress as false!
      delete inprogressSchema[type];

      return self.fullSchema[type];
    }

    self.getFullSchema = function(typeOrArray, finished)
    { 
      var typeArray = typeOrArray;
      if(typeof typeOrArray == "string")
      {
        //make single type to return
        typeArray = [typeOrArray];
      }

      var fullArray = [];
      for(var i=0; i < typeArray.length; i++)
      {
        var sType = typeArray[i];

         if(!self.allSchema[sType]){
          finished("Schema type not loaded: ", sType);
          return;
        }

        try
        {
          //get the full schema from internal function
          //throws error if something is wrong
          var fullSchema = internalGetFullSchema(sType);
         
          //pull the full object -- guaranteed to exist -- send a clone
           fullArray.push(traverse(fullSchema).clone());
        }
        catch(e)
        {
          //send the error if we have one
          finished(e);
          return;
        }
      }

      //send the refernece objects back
      //if you are a single object, just send the one -- otherwise send an array
      finished(undefined, fullArray);
    }

    self.getSchemaProperties = function(typeOrArray, finished)
    {
       var typeArray = typeOrArray;
      if(typeof typeOrArray == "string")
      {
        //make single type to return
        typeArray = [typeOrArray];
      }

      var propArray = [];
      for(var i=0; i < typeArray.length; i++)
      {
        var sType = typeArray[i];

         if(!self.allSchema[sType]){
          finished("Schema type not loaded: ", sType);
          return;
        }

        //get our schema properties
        propArray.push({type: sType, primaryPaths: traverse(self.primaryPaths[sType]).clone(), properties: traverse(self.typeProperties[sType]).clone()});

      }


      //send the refernece objects back
      //if you are a single object, just send the one -- otherwise send an array
      finished(undefined, propArray);
    }

    //we're going to clone the object, then replace all of the reference wids with new an improved parents
    self.replaceParentReferences = function(type, object, parentMapping, finished)
    {
      var tClone = traverse(object).clone();

      traverse(tClone).forEach(function(node)
      {
         //if we have a wid object and parents object -- likely we are a tracked reference
        if(this.node.wid && this.node.parents)
        {
          var replaceParents = parentMapping[this.node.wid];

          if(replaceParents)
          {
            //straight up replacement therapy yo
            this.node.parents = replaceParents;

            //then make sure to update and continue onwards!
            this.update(this.node);
          }
        }
      })

      //we've replaced the innards of the object with a better future!
      finished(undefined, tClone);
    }

    self.getReferencesAndParents = function(type, widObjects, finished)
    {

        //listed by some identifier, then the object, we need to look through the type, and pull references
        var fSchema = internalGetFullSchema(type);
        // self.log("Full schema: ", fSchema);
        if(!fSchema)
        {
          finished("Full schema undefined, might be missing a reference type within " + type);
          return;
        } 
        var widToParents = {};
        var traverseObjects = {};

        for(var wid in widObjects){
          widToParents[wid] = {};
          traverseObjects[wid] = traverse(widObjects[wid]);
        }

        
        //for every wid object we see, we loop through and pull that 
        traverse(fSchema).forEach(function(node)
        {
          // self.log("Node: ", this.node, "", " key: ", this.key);
          //if we have a wid object and parents object -- likely we are a tracked reference
          if(this.node.wid && this.node.parents)
          {
            //let's pull these bad boys our of our other objects
            var pathToObject = self.stripObjectPath(this.path);
            
            //if you aren't root, split it up!
            if(pathToObject != "")
              pathToObject = pathToObject.split(self.pathDelimiter);

            // self.log("\nKey before :", this.key, " node-p: ", this.parent.node, " path: ", this.path);
            
            var isArray = (this.key == "properties" && this.path[this.path.length - 2] == "items");
            // self.log("Is array? : ", isArray);
            for(var wid in traverseObjects)
            {

              var wtp = widToParents[wid];
              var tob = traverseObjects[wid];


              //fetch object from our traverse thing using this path
              var arrayOrObject = tob.get(pathToObject);

              // self.log("Path to obj: ", pathToObject, " get: ", arrayOrObject);

              //grab wid to parent mappings, always cloning parent arrays
              if(isArray)
              {
                for(var i=0; i < arrayOrObject.length; i++)
                {
                  var aobj = arrayOrObject[i];
                  //map wid objects to parent wids always thank you
                  wtp[aobj.wid] = aobj.parents.slice(0);
                }
              }
              else
                wtp[arrayOrObject.wid] = arrayOrObject.parents.slice(0);

              //now we've aded a mapping from the objects wid to the parents for that wid

            }
          }
        });

        //we send back the wids of the original widObjects mapped to the wid internal reference && the corresponding parents
        //so many damn layers -- it gets confusing
        finished(undefined, widToParents);

    }


	return self;
}




});

require.modules["optimuslime-win-schema"] = require.modules["optimuslime~win-schema@master"];
require.modules["optimuslime~win-schema"] = require.modules["optimuslime~win-schema@master"];
require.modules["win-schema"] = require.modules["optimuslime~win-schema@master"];


require.register("optimuslime~win-schema@0.0.5-4/lib/addSchema.js", function (exports, module) {
//pull in traverse object for this guy
var traverse = require("optimuslime~traverse@master");
var schemaSpec = require("optimuslime~win-schema@0.0.5-4/lib/schemaSpec.js");


module.exports = extendAddSchema;

function extendAddSchema(self)
{

  var pathDelim = self.pathDelimiter;

  var defaultWINAdd = {
    wid : "string",
    dbType : "string",
    parents : {
      type: "array",
      items : {
        type : "string"
      }
    }
  }

  var winTypeRegExp = [];
  for(var key in defaultWINAdd)
  {
    winTypeRegExp.push(key);
  }
  self.log("--All WIN keywords: ", winTypeRegExp);

  winTypeRegExp = new RegExp("\\b" + winTypeRegExp.join("\\b|\\b") + "\\b");

  //everything we need to do to add a schema inside
  //this requires checking if it's properly formatted, pulling references, and moving
  //around things if it's not formatted but we would like to make it less wordy to make schema
    self.internalAddSchema = function(type, schemaJSON, options, finished)
    {
      if(typeof options == "function")
      {
        finished = options;
        options = {};
      }
      else
        options = options || {};

      if((schemaJSON.type == "array" || schemaJSON.items) && !options.skipWINAdditions)
      {
        finished("Array-types for schema cannot have WIN additions. It doesn't make any sense. The object must be an array, but also have a wid property? Failed: " + type);
        return;
      }

      //make a clone of the object 
      schemaJSON = JSON.parse(JSON.stringify(schemaJSON)); 

      //force all types to lower case -- always -- deal with weird validation errors otherwise
      traverse(schemaJSON).forEach(function(node)
      {
          if(this.key == "type" && typeof this.node == "string")
            this.update(this.node.toLowerCase());
      })

      //we add or move objects inside the schema to make it conform to expected v4 JSON schema validation
      appendSchemaInformation(schemaJSON, options);      

      //check our schema for wacky errors!
      var schemaCheck = checkSchemaErrors(schemaJSON);
      if(schemaCheck && schemaCheck.errors)
      {
        finished("Improper schema format for " + type + " - " + JSON.stringify(schemaCheck));
        return;
      }

      if(schemaCheck && schemaCheck.warnings)
      {
        self.log("Warnings: ".yellow, schemaCheck.warnings);
      }

      //save it in our map
      self.allSchema[type] = schemaJSON;

      if(!schemaJSON.id || schemaJSON.id != type)
        schemaJSON.id = type;

      if(!schemaJSON['$schema'])
        schemaJSON['$schema'] = "http://json-schema.org/draft-04/schema#";
      
      if(!schemaJSON.type)
        schemaJSON.type = "object";

      //add the schema to our validator -- this does most heavy lifting for us
      self.validator.addSchema(schemaJSON);

      //failed to add schema for some reason?
      if(self.validator.error){
        finished(self.validator.error);
      }
      else
      {
        //no error from validator, store the references inside
        storeSchemaReferences(type, schemaJSON);

        //when we create it 
        setSchemaProperties(type, schemaJSON, options);
        //take what you want, and give nothing back! The pirates way for us!
        finished();
      }
    }
    function setSchemaProperties(type, schemaJSON, options)
    {
      var props = {};
      if(options.skipWINAdditions)
        props.isWIN = false;
      else
        props.isWIN = true;
      
      var primePaths = {};

      var tJSON = traverse(schemaJSON);

      var references = self.requiredReferences[type];
      var refMap = {};

      for(var refType in references)
      {
          var locations = references[refType];
          for(var l =0; l < locations.length; l++)
          {
              var refInfo = locations[l];
              refMap[refInfo.typePath] = refInfo;
          }
      }
      // self.log("Refmap: ", refMap);
      function isRef(path){ return refMap[path.join(pathDelim)]}

      tJSON.forEach(function(node)
      {
        if(this.isRoot || this.isLeaf)
          return;

        //kill the future investigation of references
        if(isRef(this.path))
            this.keys = [];

          //if we are a known keyword -- that's not properties or items, we skip you!
        if(this.key != "properties" && this.key != "items" && self.keywordRegExp.test(this.key))
          this.keys = [];

        //we also ignore this as well
        if(winTypeRegExp.test(this.key))
          this.keys = [];

        // self.log("Isref?".green, isRef(this.path));

        // if(this.keys.length)
          // self.log("Potential PrimePath: ".green, this.key, " node: ", this.node);

        if(this.keys.length){

          var objPath = self.stripObjectPath(this.path);

          //we're an array, or we're inisde an array!
          if(this.node.type == "array" || this.node.items || this.key =="items")
          {
              //we are an array, we'll pull the array info -- and then we close off this array -- forever!
              //remember, primary paths are all about the objects, and the FIRST layer of array
              primePaths[objPath] = {type: "array"};
              this.keys = [];
          }
          else
          {
            //you must be a properties object
            //either you have a type, or you're an object
            primePaths[objPath] = {type: this.node.type || "object"};
          }
        }
        

      })

      // self.log("\n\tprimaryPaths: ".cyan, primePaths);

      self.primaryPaths[type] = primePaths;
      self.typeProperties[type] = props;

    }
    function hasNonKeywords(obj)
    {
      var hasNonKeywords = false;
        
      if(Array.isArray(obj))
      {
        //loop through object to grab keys
        for(var i=0; i < obj.length; i++)
        {
          var iKey = obj[i];
          //check if you're not a keyword
          if(!self.keywordRegExp.test(iKey))
          {
            //just one is enough
            hasNonKeywords = true;
            break;
          }
        }
      }
      else
      {
        for(var iKey in obj)
        {
          if(!self.keywordRegExp.test(iKey))
          {
            //just one is enough
            hasNonKeywords = true;
            break;
          }
        }
      }

      return hasNonKeywords;           
    }

  //handle everything associated with adding a schema
    function checkSchemaErrors(schemaJSON)
    {

      //check against the proper schema definition
      // var vck = self.validator.validateMultiple(schemaJSON, schemaSpec, true);
       var valCheck = self.validateFunction.apply(self.validator, [schemaJSON, schemaSpec, true]);
       
       //grab all possible errors
       var checkErrors = {length: 0};
       var checkWarnings = {length: 0};

       //if we're valid -- which we almost certainly are -- just keep going
       if(!valCheck.valid)
       {
          //let it be known -- this is a weird error
          self.log("Invalid from v4 JSON schema perspective: ", valCheck[errorKey]);

          checkErrors["root"] = valCheck[errorKey];
          checkErrors.length++;

          //not valid, throw it back
          return checkErrors;
       }


       //make sure we have some properties -- otherwise there is literally no validation/
       //during the move process, this is overridden, but it's a good check nonetheless
       if(!schemaJSON.properties && !schemaJSON.items)
       {
          checkErrors["root"] = "No properties/items defined at root. Schema has no validation without properties!";
          checkErrors.length++;
       }

       //going to need to traverse our schema object
       var tJSON = traverse(schemaJSON);

       tJSON.forEach(function(node)
       {
        //skip the root please
        if(this.isRoot || this.path.join(pathDelim).indexOf('required') != -1)
          return;

        //this should be a warning
        if(!self.requireByDefault && !this.isLeaf && !this.node.required)
        {
            //if you don't have a required object, then you're gonna have a bad time
            //this is a warning
            checkWarnings[this.path.join(pathDelim)] = "warning: if you disable requireByDefault and don't put require arrays, validation will ignore those properties.";
            checkWarnings.length++;

        }
        if(this.key == "properties" && this.node.properties)
        {
           checkErrors[this.path.join(pathDelim)] = "Properties inside properties is meaningless.";
           checkErrors.length++;
        }
        if(this.key == "type" && typeof this.node != "string")
        {
            //for whatever reason, there is a type defined, but not a string in it's place? Waa?
            checkErrors[this.path.join(pathDelim)] = "Types must be string";
            checkErrors.length++;
        }
        if(this.key == "type" && !self.typeRegExp.test(this.node.toLowerCase()))
        {
           checkErrors[this.path.join(pathDelim)] = "Types must be one of " + self.validTypes + " not " + this.node;
           checkErrors.length++;
        }
        if(this.isLeaf)
        {
          //if you don't have a type, and there is no ref object
          if(!this.parent.node.properties && (this.key != "type" && this.key != "$ref") && !this.parent.node.type && !this.parent.node["$ref"])
          {
              checkErrors[this.path.join(pathDelim)] = "Object doesn't have any properties, a valid type, or a reference, therefore it is invalid in the WIN spec.";
              checkErrors.length++;
          }
        }
        //not a leaf, you don't have a reference
        if(!self.allowAnyObjects && !this.isLeaf && !this.node["$ref"] )
        {
          //special case for items -- doesn't apply
          if(this.node.type == "object" && this.key != "items")
          {
            //we're going to check if the list of keys to follow have any non keywords
            //for instance if {type: "object", otherThing: "string"} keys = type, otherThing
            //if instead it's just {type : "object", required : []}, keys = type, required 
            //notice that the top has non-keyword keys, and the bottom example does not 
            //we're looking for the bottom example and rejecting it
            var bHasNonKeywords = hasNonKeywords(this.keys);
            
            //if you ONLY have keywords -- you don't have any other object types
            //you are a violation of win spec and you allow any object or array to be passed in
            if(!bHasNonKeywords){
              // self.log("Current: ".magenta, this.key, " Keys: ".cyan, this.keys || "none, node: " + this.node, " has non? ".red + bHasNonKeywords);
              checkErrors[this.path.join(pathDelim)] = "AllowAnyObjects is off, therefore you cannot simple have an 'object' type with no inner properties";
              checkErrors.length++;
            }
          }
          else if(this.node.type == "array")
          {
            //if you are an array and you have no items -- not allowed!
            if(!this.node.items){
              // self.log("Current: ".magenta, this.key, " Keys: ".cyan, this.keys || "none, node: " + this.node, " has non? ".red + bHasNonKeywords);
              checkErrors[this.path.join(pathDelim)] = "AllowAnyObjects is off, therefore you cannot simple have an 'array' type with no inner items";
              checkErrors.length++;
            }
            else
            {
              //if you have a ref -- you're okay for us!
              var bIemsHaveNonKey = this.node.items["$ref"] || this.node.items["type"] || hasNonKeywords(this.node.items.properties || {});
               if(!bIemsHaveNonKey){
                // self.log("Current: ".magenta, this.key, " Keys: ".cyan, this.keys || "none, node: " + this.node, " has non? ".red + bHasNonKeywords);
                checkErrors[this.path.join(pathDelim)] = "AllowAnyObjects is off, therefore you cannot simple have an 'array' type with no non-keyword inner items";
                checkErrors.length++;
              }
            }
          }
        
        }
        //if you're an array
        if(this.node.type == "array")
        {
          //grab your items
          var items = this.node.items;
          if(!items && !self.allowAnyObjects)
          {
             checkErrors[this.path.join(pathDelim)] = "AllowAnyObjects is off for arrays, therefore you cannot simple have an 'array' type with no inner items";
              checkErrors.length++;
          }
          else
          {
            items = items || {};
            //we have items -- we shouldn't have a reference type && other items
            if(items.properties && items["$ref"])
            {
              checkErrors[this.path.join(pathDelim)] = "Array items in WIN cannot have properties AND a reference type. One or the other.";
              checkErrors.length++;
            }
          }
        }


       });

       if(checkErrors.length || checkWarnings.length)
        return {errors: checkErrors, warnings: checkWarnings};
      else
        return null;

    }

    self.stripObjectPath = function(path)
    {
      //obj path will be returned
      var objectPath = [];

      //travere this path, yo
      traverse(path).forEach(function()
      {
        //no routes including properties or items -- made up schema info!
        if(!this.isRoot && (this.node != "properties" && this.node != "items"))
          objectPath.push(this.node);
      });

      return objectPath.join(pathDelim);
    }

    //storing the references inside of a schema object (if we don't already know them)
    function parseSchemaReferences(schemaJSON)
    {
    	//first we wrap our object with traverse methods
    	var tJSON = traverse(schemaJSON);

    	var references = {};

    	self.log('--  Parsing refs -- ');
      // self.log(schemaJSON);
    	//now we step through pulling the path whenever we hit a reference
    	tJSON.forEach(function(node)
    	{
    		//we are at a reference point
        //we make an exception for arrays -- since the items object can hold references!
        if(this.node["$ref"] && (this.key == "items" || !self.keywordRegExp.test(this.key)))
    		// if(this.isLeaf && this.key == "$ref")
    		{
    			//todo logic for when it's "oneOf" or other valid JSON schema things
    			var fullPath = this.path.join(pathDelim);//this.path.slice(0, this.path.length-1).join(pathDelim);
    			var referenceType = this.node["$ref"];

          
          var objectPath = self.stripObjectPath(this.path);

          //pull the "items" piece out of the path -- otherwise, if you're just a normal object -- it's the same as fullPath
          var typePath = this.key == "items" ? this.path.slice(0, this.path.length-1).join(pathDelim) : fullPath;



    			if(references[fullPath])
    			{
    				throw new Error("Not yet supported reference behavior, arrays of references: ", fullPath);
    			}

          //assuming type is defined here!
    			references[fullPath] = {schemaType: referenceType, schemaPath: fullPath, objectPath: objectPath, typePath: typePath};
          self.log(self.log.testing, 'Reference detected @ '+fullPath+': ', references[fullPath]);
    		}
    	});

    	self.log("-- Full refs -- ", references);

    	return references;
    } 

    function storeSchemaReferences(type, schemaJSON)
    {
    	self.schemaReferences[type] = parseSchemaReferences(schemaJSON);

      self.requiredReferences[type] = {};

      for(var path in self.schemaReferences[type])
      {
        var schemaInfo = self.schemaReferences[type][path];
        var refType = schemaInfo.schemaType;
        var aReqRefs = self.requiredReferences[type][refType];

        if(!aReqRefs)
        {
          aReqRefs = [];
          self.requiredReferences[type][refType] = aReqRefs;
        }
        //value is the reference type 
        aReqRefs.push(schemaInfo);
      }


      //now we know all the references, their paths, and what type needs what references
    }
    function moveAllToProperties(tJSON)
    {
       tJSON.forEach(function(node)
       {          

          // self.log("Investigating: ", this.key, " @ ", this.path.join(pathDelim), " all keys: ", this.keys);
          //for all non-arrays and non-leafs and non-properties object -- move to a properties object if not a keyword!
          if(!this.isLeaf && this.key != "properties" && !Array.isArray(this.node))
          {

            //movement dpeends on what type you are -- arrays move to items, while objects move to properties
            var moveLocation = "properties";
            if(this.node.type == "array")
              moveLocation = "items";

            // self.log('Movement: ', this.key, " @ ", this.path.join(pathDelim) + " : ", this.node);
            // self.log("Move to : ".green + moveLocation);


            // self.log("Move innitiated: ".magenta, this.node);
            // self.log('Original node: '.green, node);
            var empty = true;
            var move = {};
            //any key that isn't one of our keywords is getting moved inside!
            for(var key in this.node){
                if(!self.keywordRegExp.test(key)){
                  // self.log('Moving key @ ', this.path.join(pathDelim) || "Is root? ", " : ", this.key || this.isRoot); 
                  move[key] = this.node[key];
                  empty = false;
                }
            }

            //don't move nothing derrr
            if(!empty)
            {
               // self.log('Moving: '.red, move);

              //create proeprties if it doesn't exist
              node[moveLocation] = node[moveLocation] || {};

              for(var key in move)
              {
                //move to its new home
                node[moveLocation][key] = move[key];
                //remove from previous location 
                delete node[key];
              }

              //make sure to update, thank you
              this.update(node);

              //we need to investigate the newly created properties/items object -- to continue down the rabbit hole
              this.keys.push(moveLocation);
            }
           

          }
       });
    }
    function addWINTypes(schemaJSON, options)
    {
      for(var key in defaultWINAdd)
      {
        var winAdd = defaultWINAdd[key];
        
        //if it's just a shallow string -- add it directly
        if(typeof winAdd == "string")
          schemaJSON[key] = winAdd;
        else //otehrwise, we should clone the larger object
          schemaJSON[key] = traverse(defaultWINAdd[key]).clone();
      }
    }
    function appendSchemaInformation(schemaJSON, options)
    {
      //add in default win types
      if(!options.skipWINAdditions)
        addWINTypes(schemaJSON, options);

      //build a traverse object for navigating and updating the object
      var tJSON = traverse(schemaJSON);

      //step one convert string to types
      tJSON.forEach(function(node)
      {
        var needsUpdate = false;
          //if you are a leaf -- and you only dictate the type e.g. string/number/array etc -- we'll convert you to proper type
        if(this.isLeaf && typeof this.node == "string")
        {
          //if the key is not a known keyword, and the node string is a proper type
          if(!self.keywordRegExp.test(this.key) && self.typeRegExp.test(node.toLowerCase()))
          {
            //node is a type! make sure it's a lower case type being stored.
            node = {type: node.toLowerCase()};
            needsUpdate = true;
          }
        }

        if(this.node)
        {

         if(this.node.items && !this.node.type)
          {
            this.node.type = "array";
            needsUpdate = true;
          }

          //rewrite {type : "array", "$ref" : "something"} => {type : "array", items : {"$ref" : "something"}}
          if(this.node.type == "array" && this.node["$ref"])
          {
            this.node.items = this.node.items || {};
            this.node.items["$ref"] = this.node["$ref"];
            delete this.node["$ref"];
            needsUpdate = true;
          }

        }


        if(needsUpdate)
          this.update(node);

      })

      //update location of objects to match validation issues
      //json schema won't validate outside of properties object -- which some people may forget
      //this is basically a correct method
      moveAllToProperties(tJSON);

      // var util = require('util');
      // self.log("Post move schema: ".cyan, util.inspect(schemaJSON, false, 10));

      tJSON.forEach(function(node)
      {
        var needsUpdate = false;


       
          //if we aren't a leaf object, we are a full object
          //therefore, we must have required (since we're in default mode)
          //since we cover the properties object inside, we don't need to go indepth for that key too!
        if(self.requireByDefault && !this.isLeaf && !this.node.required && !Array.isArray(this.node))
        {
          //the require needs to be filled iwth all the properties of this thing, except
          //for anything defined by v4 json schema -- so we run a regex to reject those keys
          var reqProps = [];

          // self.log("Not leaf: ".magenta, this.node, " Key : ", this.key);

          //do not do this if you're in the properties object
          //since the prop keys belong to the PARENT not the node
          if(this.key != "properties")
          {
            for(var key in this.node){
              if(!self.keywordRegExp.test(key)){
              // self.log('Key added: '.red, key);

                reqProps.push(key);
              }
            }
            // self.log('Post not props: '.blue, reqProps);
          }
          
          //for every object, you can also have a properties object too
          //required applies to the subling property object as well
          //so we loop through the properties object as well
         for(var key in this.node.properties){
            if(!self.keywordRegExp.test(key)){
              reqProps.push(key);
            }
          }

          if(reqProps.length)
          {
            node.required = reqProps;
            needsUpdate = true;
          }        
        }

     
       if(needsUpdate){
          // self.log('New required - : ', this.node, ' : ', reqProps);
          this.update(node);
        }
      });



        // self.log("--post traverse -- ", schemaJSON);

    }

	return self;
}




});

require.register("optimuslime~win-schema@0.0.5-4/lib/schemaSpec.js", function (exports, module) {
module.exports = 
{
    "id": "http://json-schema.org/draft-04/schema#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
        },
        "simpleTypes": {
            "enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "format": "uri"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "boolean",
            "default": false
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "boolean",
            "default": false
        },
        "maxLength": { "$ref": "#/definitions/positiveInteger" },
        "minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": {}
        },
        "maxItems": { "$ref": "#/definitions/positiveInteger" },
        "minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "maxProperties": { "$ref": "#/definitions/positiveInteger" },
        "minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "dependencies": {
        "exclusiveMaximum": [ "maximum" ],
        "exclusiveMinimum": [ "minimum" ]
    },
    "default": {}
}
});

require.register("optimuslime~win-schema@0.0.5-4", function (exports, module) {
//pull in the validating workhorse -- checks schema and stuff
var tv4 = require("geraintluff~tv4@master");
//pull in traverse object from the repo please!
var traverse = require("optimuslime~traverse@master");

//pull in the object that knows what all schema look like!
var schemaSpec = require("optimuslime~win-schema@0.0.5-4/lib/schemaSpec.js");

var addSchemaSupport = require("optimuslime~win-schema@0.0.5-4/lib/addSchema.js");

module.exports = winSchema;

function winSchema(winback, globalConfiguration, localConfiguration)
{
	//load up basic win-module stufffff
	var self = this;
  self.winFunction = "schema";
  self.log = winback.getLogger(self);

  //limited only by global -- or we could limit our own verboseness
  self.log.logLevel = localConfiguration.logLevel || self.log.normal;

  self.pathDelimiter = "///";

  //this creates "internalAddSchema" to handle the weighty add logic
  //need to thoroughly test and modify incoming schema to align with 
  //logical schema setup for WIN
  addSchemaSupport(self, globalConfiguration, localConfiguration);

	self.validator = tv4.freshApi();

 //set the backbone and our logging function
  self.bbEmit = winback.getEmitter(self);

  //config setups

  self.multipleErrors = (localConfiguration.multipleErrors == true || localConfiguration.multipleErrors == "true");
  //by default you can have unknown keys -- the server environment may desire to change this
  //if you don't want to be storing extra info
  //by default, on lockdown -- better that way -- no sneaky stuff
  self.allowUnknownKeys = localConfiguration.allowUnknownKeys || false;

  //all keys are required by default -- this adds in required objects for everything
  self.requireByDefault = localConfiguration.requireByDefault || true;

  //do we allow properties with just the type "object" or "array"
  //this would allow ANY data to be fit in there with no validation checks (other than it is an object or array)
  //shouldn't allow this because people could slip in all sorts of terrible things without validation
  self.allowAnyObjects = localConfiguration.allowAnyObjects || false;

  self.eventCallbacks = function()
  {
        var callbacks = {};

        //add callbacks to the object-- these are the functions called when the full event is emitted
        callbacks["schema:validate"] = self.validateData;
        callbacks["schema:validateMany"] = self.validateDataArray;
        callbacks["schema:addSchema"] = self.addSchema;
        callbacks["schema:getSchema"] = self.getSchema;
        callbacks["schema:getSchemaReferences"] = self.getSchemaReferences;
        callbacks["schema:getFullSchema"] = self.getFullSchema;
        callbacks["schema:getSchemaProperties"] = self.getSchemaProperties;

        //these are for deealing with pulling references from a specific object -- it's easier done in this module
        callbacks["schema:getReferencesAndParents"] = self.getReferencesAndParents;
        callbacks["schema:replaceParentReferences"] = self.replaceParentReferences;

        //send back our callbacks
        return callbacks;
  }
  self.requiredEvents = function()
  {
  	//don't need no one for nuffin'
  	return [];
  }

  self.initialize = function(done)
  {
  	setTimeout(function()
  	{
  		done();
  	}, 0);
  }

    //cache all our schema by type
    self.allSchema = {};
    self.schemaReferences = {};
    self.requiredReferences = {};
    self.fullSchema = {};
    self.primaryPaths = {};
    self.typeProperties = {};

    self.validTypes = "\\b" + schemaSpec.definitions.simpleTypes.enum.join('\\b|\\b') + "\\b"; //['object', 'array', 'number', 'string', 'boolean', 'null'].join('|');
    self.typeRegExp = new RegExp(self.validTypes);

    self.specKeywords = ["\\$ref|\\babcdefg"];
    for(var key in schemaSpec.properties)
      self.specKeywords.push(key.replace('$', '\\$'));

    //join using exact phrasing checks
    self.specKeywords = self.specKeywords.join('\\b|\\b') + "\\b";
    self.keywordRegExp = new RegExp(self.specKeywords);

    self.log(self.log.testing, "--Specced types: ".green, self.validTypes);
    self.log(self.log.testing, "--Specced keywords: ".green, self.specKeywords);

    self.validateFunction = (self.multipleErrors ? self.validator.validateMultiple : self.validator.validateResult);
    self.errorKey = self.multipleErrors ? "errors" : "error";

    function listTypeIssues(type)
    {
      if(!self.allSchema[type]){
        return "Schema type not loaded: " + type;
      }

      //we have to manually detect missing references -- since the validator is not concerned with such things
      //FOR WHATEVER REASON
      var missing = self.validator.getMissingUris();
      for(var i=0; i < missing.length; i++)
      {
        //if we have this type inside our refernces for this object, it means we're missing a ref schema for this type!
        if(self.requiredReferences[type][missing[i]])
        {
          return "Missing at least 1 schema definition: " + missing[i];
        }
      }
    }

    function internalValidate(schema, object)
    {
      //validate against what type?
      var result = self.validateFunction.apply(self.validator, [object, schema, true, !self.allowUnknownKeys]);

       //if it's not an array, make it an array
      //if it's empty, make it a damn array
      var errors = result[self.errorKey];

      //if you are multiple errors, then you are a non-undefined array, just return as usual
      //otherwise, you are an error but not in an array
      //if errors is undefined then this will deefault to []
      errors = (errors && !Array.isArray(errors)) ? [errors] : errors || [];

      return {valid : result.valid, errors : errors};
    }
    self.validateDataArray = function(type, objects, finished)
    {
      var typeIssues = listTypeIssues(type);

      //stop if we have type issues
      if(typeIssues)
      {
        finished(typeIssues);
        return;
      }
      else if(typeof type != "string" || !Array.isArray(objects))
      {
        finished("ValidateMany requires type [string], objects [array]");
        return;
      }

      var schema = self.validator.getSchema(type);
      // self.log('validate many against: ', schema);

      var allValid = true;
      var allErrors = [];
      for(var i=0; i < objects.length; i++)
      {
        var result = internalValidate(schema, objects[i]);

        if(!result.valid){
          allValid = false;
          allErrors.push(result.errors);
        }
        else //no error? just push empty array!
          allErrors.push([]);
      }

      //if we have errors during validation, they'll be passed on thank you!
      //if you're valid, and there are no errors, then don't send nuffin
      finished(undefined, allValid, (!allValid ? allErrors : undefined));
    }
    self.validateData = function(type, object, finished)
    {
      var typeIssues = listTypeIssues(type);

      //stop if we have type issues
      if(typeIssues)
      {
        finished(typeIssues);
        return;
      }

      //log object being checked
      self.log("Validate: ", object);

      //now we need to validate, we definitely have all the refs we need
      var schema = self.validator.getSchema(type);

      //log what's being validated
      self.log('validate against: ', schema);
    	 
      var result = internalValidate(schema, object);

      //if we have errors during validation, they'll be passed on thank you!
      //if you're valid, and there are no errors, then don't send nuffin
      finished(undefined, result.valid, (result.errors.length ? result.errors : undefined));
    }

    //todo: pull reference objects from schema -- make sure those exist as well?
   	self.addSchema = function(type, schemaJSON, options, finished)
   	{
      //pass args into internal adds
      return self.internalAddSchema.apply(self, arguments);
   	}

   	    //todo: pull reference objects from schema -- make sure those exist as well?
   	self.getSchema = function(typeOrArray, finished)
   	{   	
      //did we request one or many?
      var typeArray = typeOrArray;
      if(typeof typeOrArray == "string")
      {
        //make single type to return
        typeArray = [typeOrArray];
      }

      var refArray = [];
      for(var i=0; i < typeArray.length; i++)
      {
        var sType = typeArray[i];

      //failed to get schema for some very odd reason?
        if(!self.allSchema[sType]){
          finished("Schema type not loaded: ", sType);
          return;
        }
        //push our reference information as a clone
        refArray.push(traverse(self.validator.getSchema(sType)).clone());
        //if you hit an error -send back
        if(self.validator.error){
          finished(self.validator.error);
          return;
        }
      }

      //send the schema objects back
      //send an array regardless of how many requested -- standard behavior
      finished(undefined, refArray);    

   	}

   	self.getSchemaReferences = function(typeOrArray, finished)
   	{
      var typeArray = typeOrArray;
      if(typeof typeOrArray == "string")
      {
        //make single type to return
        typeArray = [typeOrArray];
      }

      var refArray = [];
      for(var i=0; i < typeArray.length; i++)
      {
        var sType = typeArray[i];

        if(!self.allSchema[sType]){
          finished("Schema type not loaded: ", sType);
          return;
        }
        //push our reference information as a clone
        refArray.push(traverse(self.requiredReferences[sType]).clone());
      }

  		//send the refernece objects back
      //if you are a single object, just send the one -- otherwise send an array
      finished(undefined, refArray); 		
   	}

    var buildFullSchema = function(type)
    {
      var schema = self.validator.getSchema(type);
      var tSchema = traverse(schema);

      var clone = tSchema.clone();
      var tClone = traverse(clone);
      var references = self.schemaReferences[type];

      for(var path in references)
      {
        //we get the type of reference
        var schemaInfo = references[path];
        var refType = schemaInfo.schemaType;

        //this is recursive behavior -- itwill call buidl full schema if not finished yet
        var fullRefSchema = internalGetFullSchema(refType);

        if(!fullRefSchema)
          throw new Error("No schema could be created for: " + refType + ". Please check it's defined.");

        //now we ahve teh full object to replace
        var tPath = path.split(self.pathDelimiter);

        // self.log(self.log.testing, 'Path to ref: ', tPath, " replacement: ", fullRefSchema);

        //use traverse to set the path object as our full ref object
        tClone.set(tPath, fullRefSchema);
      }

      // self.log(self.log.testing, "Returning schema: ", type, " full: ", clone);

      return clone;
    }
    var inprogressSchema = {};

    function internalGetFullSchema(type)
    {
      if(inprogressSchema[type])
      {
          throw new Error("Infinite schema reference loop: " + JSON.stringify(Object.keys(inprogressSchema)));    
      }

      inprogressSchema[type] = true;

       //if we don't have a full type yet, we build it
      if(!self.fullSchema[type])
      {
        //need to build a full schema object
        var fSchema = buildFullSchema(type);

        self.fullSchema[type] = fSchema;
      }

      //mark the in progress as false!
      delete inprogressSchema[type];

      return self.fullSchema[type];
    }

    self.getFullSchema = function(typeOrArray, finished)
    { 
      var typeArray = typeOrArray;
      if(typeof typeOrArray == "string")
      {
        //make single type to return
        typeArray = [typeOrArray];
      }

      var fullArray = [];
      for(var i=0; i < typeArray.length; i++)
      {
        var sType = typeArray[i];

         if(!self.allSchema[sType]){
          finished("Schema type not loaded: ", sType);
          return;
        }

        try
        {
          //get the full schema from internal function
          //throws error if something is wrong
          var fullSchema = internalGetFullSchema(sType);
         
          //pull the full object -- guaranteed to exist -- send a clone
           fullArray.push(traverse(fullSchema).clone());
        }
        catch(e)
        {
          //send the error if we have one
          finished(e);
          return;
        }
      }

      //send the refernece objects back
      //if you are a single object, just send the one -- otherwise send an array
      finished(undefined, fullArray);
    }

    self.getSchemaProperties = function(typeOrArray, finished)
    {
       var typeArray = typeOrArray;
      if(typeof typeOrArray == "string")
      {
        //make single type to return
        typeArray = [typeOrArray];
      }

      var propArray = [];
      for(var i=0; i < typeArray.length; i++)
      {
        var sType = typeArray[i];

         if(!self.allSchema[sType]){
          finished("Schema type not loaded: ", sType);
          return;
        }

        //get our schema properties
        propArray.push({type: sType, primaryPaths: traverse(self.primaryPaths[sType]).clone(), properties: traverse(self.typeProperties[sType]).clone()});

      }


      //send the refernece objects back
      //if you are a single object, just send the one -- otherwise send an array
      finished(undefined, propArray);
    }

    //we're going to clone the object, then replace all of the reference wids with new an improved parents
    self.replaceParentReferences = function(type, object, parentMapping, finished)
    {
      var tClone = traverse(object).clone();

      traverse(tClone).forEach(function(node)
      {
         //if we have a wid object and parents object -- likely we are a tracked reference
        if(this.node.wid && this.node.parents)
        {
          var replaceParents = parentMapping[this.node.wid];

          if(replaceParents)
          {
            //straight up replacement therapy yo
            this.node.parents = replaceParents;

            //then make sure to update and continue onwards!
            this.update(this.node);
          }
        }
      })

      //we've replaced the innards of the object with a better future!
      finished(undefined, tClone);
    }

    self.getReferencesAndParents = function(type, widObjects, finished)
    {

        //listed by some identifier, then the object, we need to look through the type, and pull references
        var fSchema = internalGetFullSchema(type);
        // self.log("Full schema: ", fSchema);
        if(!fSchema)
        {
          finished("Full schema undefined, might be missing a reference type within " + type);
          return;
        } 
        var widToParents = {};
        var traverseObjects = {};

        for(var wid in widObjects){
          widToParents[wid] = {};
          traverseObjects[wid] = traverse(widObjects[wid]);
        }

        
        //for every wid object we see, we loop through and pull that 
        traverse(fSchema).forEach(function(node)
        {
          // self.log("Node: ", this.node, "", " key: ", this.key);
          //if we have a wid object and parents object -- likely we are a tracked reference
          if(this.node.wid && this.node.parents)
          {
            //let's pull these bad boys our of our other objects
            var pathToObject = self.stripObjectPath(this.path);
            
            //if you aren't root, split it up!
            if(pathToObject != "")
              pathToObject = pathToObject.split(self.pathDelimiter);

            // self.log("\nKey before :", this.key, " node-p: ", this.parent.node, " path: ", this.path);
            
            var isArray = (this.key == "properties" && this.path[this.path.length - 2] == "items");
            // self.log("Is array? : ", isArray);
            for(var wid in traverseObjects)
            {

              var wtp = widToParents[wid];
              var tob = traverseObjects[wid];


              //fetch object from our traverse thing using this path
              var arrayOrObject = tob.get(pathToObject);

              // self.log("Path to obj: ", pathToObject, " get: ", arrayOrObject);

              //grab wid to parent mappings, always cloning parent arrays
              if(isArray)
              {
                for(var i=0; i < arrayOrObject.length; i++)
                {
                  var aobj = arrayOrObject[i];
                  //map wid objects to parent wids always thank you
                  wtp[aobj.wid] = aobj.parents.slice(0);
                }
              }
              else
                wtp[arrayOrObject.wid] = arrayOrObject.parents.slice(0);

              //now we've aded a mapping from the objects wid to the parents for that wid

            }
          }
        });

        //we send back the wids of the original widObjects mapped to the wid internal reference && the corresponding parents
        //so many damn layers -- it gets confusing
        finished(undefined, widToParents);

    }


	return self;
}




});

require.modules["optimuslime-win-schema"] = require.modules["optimuslime~win-schema@0.0.5-4"];
require.modules["optimuslime~win-schema"] = require.modules["optimuslime~win-schema@0.0.5-4"];
require.modules["win-schema"] = require.modules["optimuslime~win-schema@0.0.5-4"];


require.register("optimuslime~win-utils@master", function (exports, module) {

var winutils = {};

module.exports = winutils;

//right now, it's all we have setup -- later there will be more utilities
winutils.cuid = require("optimuslime~win-utils@master/uuid/cuid.js");

winutils.math = require("optimuslime~win-utils@master/math/winmath.js");


});

require.register("optimuslime~win-utils@master/uuid/cuid.js", function (exports, module) {
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */
//From: https://github.com/dilvie/cuid

//note that module.exports is at the end -- it exports the api variable

/*global window, navigator, document, require, process, module */
var c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock() + randomBlock() + randomBlock();

        c = (c < discreteValues) ? c : 0;
        counter = pad(c.toString(base), blockSize);

      c++; // this is not subliminal

      return  (letter + timestamp + counter + fingerprint + random);
    };

api.slug = function slug() {
  var date = new Date().getTime().toString(36),
    counter = c.toString(36).slice(-1),
    print = api.fingerprint().slice(0,1) +
      api.fingerprint().slice(-1),
    random = randomBlock().slice(-1);

  c++;

  return date.slice(2,4) + date.slice(-2) + 
    counter + print + random;
};

//fingerprint changes based on nodejs or component setup
var isBrowser = (typeof process == 'undefined');

api.fingerprint = isBrowser ?
  function browserPrint() {
      return pad((navigator.mimeTypes.length +
          navigator.userAgent.length).toString(36) +
          api.globalCount().toString(36), 4);
  }
: function nodePrint() {
  var os = require("os"),

  padding = 2,
  pid = pad((process.pid).toString(36), padding),
  hostname = os.hostname(),
  length = hostname.length,
  hostId = pad((hostname)
    .split('')
    .reduce(function (prev, char) {
      return +prev + char.charCodeAt(0);
    }, +length + 36)
    .toString(36),
  padding);
return pid + hostId;
};

api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
            count = 0;

            //global count only ever called inside browser environment
            //lets loop through and count the keys in window -- then cahce that as part of our fingerprint
        for (i in window) {
            count++;
        }

        return count;
    }());

    api.globalCount = function () { return cache; };
    return cache;
};

api.isLessThan = function(first, second)
{
  var fParse= parseInt(first);
  var sParse = parseInt(second);
  if(isNaN(fParse) && isNaN(sParse))
  {
     //tease apart first, second to determine which ID came first
    //counter + fingerprint + random = 6 blocks of 4 = 24
    var dateEnd = 6*blockSize;
    var counterEnd = 5*blockSize;
    var charStart = 1;

    //convert the base-36 time string to base 10 number -- parseint handles this by sending in the original radix
    var firstTime = parseInt(first.slice(charStart, first.length - dateEnd), base);
    //ditto for counter
    var firstCounter = parseInt(first.slice(first.length - dateEnd, first.length - counterEnd),base);

    //convert the base-36 time string to base 10 number -- parseint handles this by sending in the original radix
    var secondTime =  parseInt(second.slice(charStart, second.length - dateEnd), base);
    
    //ditto for counter 
    var secondCounter = parseInt(second.slice(second.length - dateEnd, second.length - counterEnd), base);

    //either the first time is less than the second time, and we answer this question immediately
    //or the times are equal -- then we pull the lower counter
    //techincially counters can wrap, but this won't happen very often AND this is all for measuring disjoint/excess behavior
    //the time should be enough of an ordering principal for this not to matter
    return firstTime < secondTime || (firstTime == secondTime && firstCounter < secondCounter);

  }
  else if(isNaN(sParse))
  {
    //if sParse is a string, then the first is a number and the second is a string UUID
    //to maintain backwards compat -- number come before strings in neatjs ordering
    return true;
  }//both are not NaN -- we have two numbers to compare
  else
  {
    return fParse < sParse;
  }
}

//we send out API
module.exports = api;




});

require.register("optimuslime~win-utils@master/math/winmath.js", function (exports, module) {

var mathHelper = {};

module.exports = mathHelper;

mathHelper.next = function(max)
{
    return Math.floor(Math.random()*max);
};

});

require.modules["optimuslime-win-utils"] = require.modules["optimuslime~win-utils@master"];
require.modules["optimuslime~win-utils"] = require.modules["optimuslime~win-utils@master"];
require.modules["win-utils"] = require.modules["optimuslime~win-utils@master"];


require.register("optimuslime~win-utils@0.1.1", function (exports, module) {

var winutils = {};

module.exports = winutils;

//right now, it's all we have setup -- later there will be more utilities
winutils.cuid = require("optimuslime~win-utils@0.1.1/uuid/cuid.js");

winutils.math = require("optimuslime~win-utils@0.1.1/math/winmath.js");


});

require.register("optimuslime~win-utils@0.1.1/uuid/cuid.js", function (exports, module) {
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */
//From: https://github.com/dilvie/cuid

//note that module.exports is at the end -- it exports the api variable

/*global window, navigator, document, require, process, module */
var c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock() + randomBlock() + randomBlock();

        c = (c < discreteValues) ? c : 0;
        counter = pad(c.toString(base), blockSize);

      c++; // this is not subliminal

      return  (letter + timestamp + counter + fingerprint + random);
    };

api.slug = function slug() {
  var date = new Date().getTime().toString(36),
    counter = c.toString(36).slice(-1),
    print = api.fingerprint().slice(0,1) +
      api.fingerprint().slice(-1),
    random = randomBlock().slice(-1);

  c++;

  return date.slice(2,4) + date.slice(-2) + 
    counter + print + random;
};

//fingerprint changes based on nodejs or component setup
var isBrowser = (typeof process == 'undefined');

api.fingerprint = isBrowser ?
  function browserPrint() {
      return pad((navigator.mimeTypes.length +
          navigator.userAgent.length).toString(36) +
          api.globalCount().toString(36), 4);
  }
: function nodePrint() {
  var os = require("os"),

  padding = 2,
  pid = pad((process.pid).toString(36), padding),
  hostname = os.hostname(),
  length = hostname.length,
  hostId = pad((hostname)
    .split('')
    .reduce(function (prev, char) {
      return +prev + char.charCodeAt(0);
    }, +length + 36)
    .toString(36),
  padding);
return pid + hostId;
};

api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
            count = 0;

            //global count only ever called inside browser environment
            //lets loop through and count the keys in window -- then cahce that as part of our fingerprint
        for (i in window) {
            count++;
        }

        return count;
    }());

    api.globalCount = function () { return cache; };
    return cache;
};

api.isLessThan = function(first, second)
{
  var fParse= parseInt(first);
  var sParse = parseInt(second);
  if(isNaN(fParse) && isNaN(sParse))
  {
     //tease apart first, second to determine which ID came first
    //counter + fingerprint + random = 6 blocks of 4 = 24
    var dateEnd = 6*blockSize;
    var counterEnd = 5*blockSize;
    var charStart = 1;

    //convert the base-36 time string to base 10 number -- parseint handles this by sending in the original radix
    var firstTime = parseInt(first.slice(charStart, first.length - dateEnd), base);
    //ditto for counter
    var firstCounter = parseInt(first.slice(first.length - dateEnd, first.length - counterEnd),base);

    //convert the base-36 time string to base 10 number -- parseint handles this by sending in the original radix
    var secondTime =  parseInt(second.slice(charStart, second.length - dateEnd), base);
    
    //ditto for counter 
    var secondCounter = parseInt(second.slice(second.length - dateEnd, second.length - counterEnd), base);

    //either the first time is less than the second time, and we answer this question immediately
    //or the times are equal -- then we pull the lower counter
    //techincially counters can wrap, but this won't happen very often AND this is all for measuring disjoint/excess behavior
    //the time should be enough of an ordering principal for this not to matter
    return firstTime < secondTime || (firstTime == secondTime && firstCounter < secondCounter);

  }
  else if(isNaN(sParse))
  {
    //if sParse is a string, then the first is a number and the second is a string UUID
    //to maintain backwards compat -- number come before strings in neatjs ordering
    return true;
  }//both are not NaN -- we have two numbers to compare
  else
  {
    return fParse < sParse;
  }
}

//we send out API
module.exports = api;




});

require.register("optimuslime~win-utils@0.1.1/math/winmath.js", function (exports, module) {

var mathHelper = {};

module.exports = mathHelper;

mathHelper.next = function(max)
{
    return Math.floor(Math.random()*max);
};

});

require.modules["optimuslime-win-utils"] = require.modules["optimuslime~win-utils@0.1.1"];
require.modules["optimuslime~win-utils"] = require.modules["optimuslime~win-utils@0.1.1"];
require.modules["win-utils"] = require.modules["optimuslime~win-utils@0.1.1"];


require.register("optimuslime~win-gen@0.0.2-6", function (exports, module) {
//need our general utils functions
var winutils = require("optimuslime~win-utils@master");
var extendModuleDefinitions = require("optimuslime~win-gen@0.0.2-6/lib/module/backbone.js");
var traverse = require("optimuslime~traverse@master");
var uuid = require("optimuslime~win-utils@master").cuid;
//for component: techjacker/q
var Q = require("techjacker~q@master");

var cuid = winutils.cuid;
var wMath = winutils.math;

module.exports = wingen;

function wingen(winBackbone, globalConfiguration, localConfiguration)
{
    var self = this;

    //grab our backbone object
    self.bb = winBackbone;

    self.pathDelimiter = "///";

    //all our required events!
    self.rEvents = {
        schema : {
            'validate' : 'schema:validate'
            ,'validateMany' : 'schema:validateMany'
            ,'getFullSchema' : 'schema:getFullSchema'            
            ,'getSchemaReferences' : 'schema:getSchemaReferences'            
            ,'getSchemaProperties' : 'schema:getSchemaProperties'            
        },
        encoding: {}
    };


    //extend this object to work with win backbone (simple functions)
    //don't want to get that confused -- so it's in another file
    extendModuleDefinitions(self, globalConfiguration, localConfiguration);

    //all put together, now let's build an emitter for the backbone
    self.backEmit = winBackbone.getEmitter(self);

    //deal with localConfiguration details

    //should we validate all the parents before generating offspring -- by default no
    //the reasoning: schemas should be written at the module level, it shouldn't be sent in on a whim
    //thereofre it's less likely to happen (normally you use someone elses encoding module -- is the idea)
    self.validateParents = localConfiguration.validateParents || false;
    self.validateOffspring = localConfiguration.validateOffspring || false;


    //though the following calls can be done in the extendModuleDefinitions, it's clearer to have them in the main .js file 
    //to see what events are accepted for this module
    var fullEventName = function(partialName)
    {
        return self.winFunction + ":" + partialName;
    }

    //we are evolution
    //these are the various callbacks we accept as events
    self.eventCallbacks = function()
    {
        var callbacks = {};

        //add callbacks to the object-- these are the functions called when the full event is emitted
        callbacks[fullEventName("createArtifacts")] = self.createArtifacts;

        //send back our callbacks
        return callbacks;
    }



    var qBackboneResponse = function()
    {
        var defer = Q.defer();
        // self.log('qBBRes: Original: ', arguments);

        //first add our own function type
        var augmentArgs = arguments;
        // [].splice.call(augmentArgs, 0, 0, self.winFunction);
        //make some assumptions about the returning call
        var callback = function(err)
        {
            if(err)
            {
                defer.reject(err);
            }
            else
            {
                //remove the error object, send the info onwards
                [].shift.call(arguments);
                if(arguments.length > 1)
                    defer.resolve(arguments);
                else
                    defer.resolve.apply(defer, arguments);
            }
        };

        //then we add our callback to the end of our function -- which will get resolved here with whatever arguments are passed back
        [].push.call(augmentArgs, callback);

        // self.log('qBBRes: Augmented: ', augmentArgs);
        //make the call, we'll catch it inside the callback!
        self.backEmit.apply(self.bb, augmentArgs);

        return defer.promise;
    }

    var formEncodingRequest = function(type, requestName)
    {
        return "encoding:" + type + "-" + requestName;
    }
    var hasBackboneListeners = function(type, eventName)
    {
        return self.backEmit.hasListeners(formEncodingRequest(type, eventName));
    }
    var handlesFullOffspring = function(type)
    {
        return hasBackboneListeners(type, "createFullOffspring");
    }

    var getReferencePaths = function(traverseSchema)
    {
        var referencePaths = {};
        traverseSchema.forEach(function(node)
        {
            self.log(this);
            if(!this.isLeaf && node.ref)
            {
                //this object has a reference in it
                //store the type for this path 
                //we need to worry about arrays though :/
                referencePaths[this.path] = node.type;
            }
        });
        //send back what we found
        return referencePaths;
    }

    self.processArtifactReferences = function(artifactSchema, count, referencePaths)
    {


    }

    var qValidation = function(type, objects, shouldValidate)
    {
        var defer = Q.defer();

        if(shouldValidate)
        {
            //gotta do some validation, yeehaw!

            //let our schema object know to validate!
            self.backEmit.emit("schema:validateMany", type, objects, function(err, isValid, reasons)
            {
                if(err)
                    defer.reject(err);
                else
                    defer.resolve({valid: isValid, errors: reasons});
            });
        }
        else
        {
            //no validation required, resolve immediately
            setTimeout(function()
            {
                defer.resolve(true);
            })
        }


        return defer.promise;
    }

    //just return the generic version of these objects
    function createGenericType(type)
    {
        switch(type)
        {
            case "array":
                return [];
            case "object":
                return {};
            case "number":
            case "integer":
                return 0;
            case "string":
                return "";
            case "boolean":
                return false;
            case "null":
                return null;
        }
    }

    self.qOffspringNonReferences = function(schemaProp, genProps, parentProps, overrideJSON)
    {
        return Q.fcall(function()
        {
            //let's build default non-reference objects
            var offspring = [];
            var parentIxs = [];

            //we're going to need to step through the full schema
            var primaryPaths = schemaProp.primaryPaths;
            var count = genProps.count;

            var pathKeys = Object.keys(primaryPaths);
            pathKeys.sort(function(a,b)
            {
                return a.length - b.length;
            })

            for(var i=0; i < count; i++)
                parentIxs.push([]);

            //now we have sorted our primary paths by length of path ascending
            var createArray = [];

            for(var c=0; c < count; c++)
            {
                var child, tChild;

                for(var i=0; i < pathKeys.length; i++)
                {
                    var path = pathKeys[i];
                    var type = primaryPaths[path].type;
                    if(path == "")
                    {
                        child = createGenericType(type);
                        tChild = traverse(child);
                    }
                    else
                    {
                        //set each path to be the object inside child
                        tChild.set(path.split(self.pathDelimiter), createGenericType(type));
                    }
                }

                offspring.push(child);
            }

            self.log("required: ", genProps.count);
            self.log('paths: ', pathKeys);

            //send back the array of offspring
            return [offspring, parentIxs];
        })
    } 

    function qCallAwareCreateArtifacts()
    {
        var callAware = [].shift.call(arguments);

        var defer = Q.defer();

        [].push.call(arguments, function(err, offspring)
        {
            if(err)
                defer.reject(err);
            else
                defer.resolve({call: callAware, offspringObject: offspring});
        })

        //set things in motion by calling create artifacts with the approrpaite info
        self.createArtifacts.apply(self, arguments);

        return defer.promise;
    }

    function defaultArray(count)
    {
        var offspring = [];
        var parentIxs = [];
        var cArray = [];
        //default behavior for arrays without user defined behavior-- empty! MWAHAHAHAHA
        for(var c=0; c < count; c++){
            offspring.push([]);
            parentIxs.push([]);
        }
        return {offspring: offspring, parentIxs: parentIxs};
    }

    function processArrayBehavior(refInfo, rBehavior, schemaProps, genProps, parentProps, overrideJSON)
    {   
        var offspring, parentIxs;
        var promises = [];

        // self.log('Process array beh:', rBehavior);

        if(rBehavior == undefined)
        {
            var oObj = defaultArray(genProps.count);
            offspring = oObj.offspring;
            parentIxs = oObj.parentIxs;
        }
        else
        {
            //need both offspring and parent info
            if(rBehavior.offspring)
            {
                //we already have offspring info
                offspring = rBehavior.offspring;
                parentIxs = rBehavior.parentIxs;
            }
            else
            {
                //don't have offspring, for now we just do default behavior
                //default behavior
                var oObj = defaultArray(genProps.count);
                offspring = oObj.offspring;
                parentIxs = oObj.parentIxs;
            }

        }

        //send back promises or offspring 
        return {promises: promises, offspring: offspring, parentIxs: parentIxs};
    }

    function processObjectBehavior(refInfo, rBehavior, schemaProps, genProps, parents, overrideJSON)
    {   
        var offspring, parentIxs;
        var promises = [];

        // self.log('Process object beh:', rBehavior);

        if(rBehavior == undefined)
        {
            promises.push(qCallAwareCreateArtifacts(refInfo.objectPath, refInfo.schemaType, genProps.count, parents, overrideJSON));
        }
        else
        {
            //need both offspring and parent info
            //we dont check for parent info -- since it's likely if you sent offspring you have the INTENTION correct, but maybe not the formatting
            //therefore, the parentIxs error will be caught, and the issue will be corrected
            //if we didn't activate unless we have parents AND offspring, it would be more like a silent failure cause they would return children 
            //and nothing would happen
            if(rBehavior.offspring)
            {
                //we already have offspring info
                offspring = rBehavior.offspring;
                parentIxs = rBehavior.parentIxs;
            }
            else
            {
                //don't have offspring, for now we just do default behavior
                //default behavior
                promises.push(qCallAwareCreateArtifacts(refInfo.objectPath, refInfo.schemaType, genProps.count, parents, overrideJSON));
            }
        }

        //send back promises or offspring 
        return {promises: promises, offspring: offspring, parentIxs: parentIxs};
    }
    function scrubDuplicates(array)
    {
        var distinct = {};
        traverse(array).forEach(function(){
            
            if(this.isRoot) return;

            if(!distinct[this.node]){
                distinct[this.node] = true;
            }
            else
                this.remove();
        })
    }
    //need to pull reference objects and send them for creation
    self.qCreateOffspringReferences = function(offspringAndParentIxs, schemaProps, genProps, parentProps, overrideJSON)
    {
        var count = genProps.count; 
        var type = genProps.type;

        var references = schemaProps.references;
        var refCalls = [];
        var refPaths = {};
        var arrayRefInfo = [];

        var offspringToUpdate = offspringAndParentIxs.offspring;
        if(offspringToUpdate.length != count)
            throw new Error("By reference creation, there should be the appropriate number of Offspring:" + count + " Not: " + offspringToUpdate.length);
        
        var tOffspring = [];
        for(var c=0; c < offspringToUpdate.length; c++)
            tOffspring.push(traverse(offspringToUpdate[c]))

        for(var refType in references)
        {
            var rArray = references[refType];
            for(var r=0; r < rArray.length; r++)
            {
                //grab the info
                var refInfo = rArray[r];
                //push the path
                refCalls.push(refInfo.objectPath);
                refPaths[refInfo.objectPath] = refInfo;
            }
        }
        // self.log('Ref vals: '.green,refPaths);

        var tFull = traverse(schemaProps.fullSchema);
        var pathToOffspring = {};

        var p = parentProps.parents;
        var tp = [];
        p.forEach(function(ip){tp.push(traverse(ip))});

        var refPathParents = {};

        for(var rp in refPaths)
        {
            var typeParents = [];
            for(var i=0; i < p.length; i++)
            {
                var pathParent = tp[i].get(rp.split(self.pathDelimiter));
                typeParents.push(pathParent);
            }
            refPathParents[rp] = typeParents;
        }

        // self.log("\n\tParents parents: ".cyan, parentProps.parents);
        // self.log("\n\tReference parents: ".magenta, refPathParents);
        self.log(self.log.testing, "[generator] processing references: ", refCalls);

        return Q.fcall(function()
        {            
             //if we respond to reference behavior
            if(hasBackboneListeners(type, "chooseReferenceBehavior"))
            {
                //if we have the event -- we just do this step elsewhere
                return qBackboneResponse(formEncodingRequest(type, "chooseReferenceBehavior"), refCalls, genProps, parentProps, overrideJSON); 
            }
            else
            {
                //otherwise, we build an array full of default behavior
                return {};
            }
        })
        .then(function(refBehavior)
        {
            refBehavior = refBehavior || {};

            //if we send in an arguments object cause there were multiple return params for some reason
            //just take the first, which is the map fo sho
            if(refBehavior.length)
                refBehavior = refBehavior[0];


            var allPromises = [];

            //go through all our references
            for(var rp in refPaths)
            {
                //path info
                var refInfo = refPaths[rp];

                //index into behavior if it exists
                var rBeh = refBehavior[rp];
                var action;

                var node = tFull.get(refInfo.typePath.split(self.pathDelimiter));
                self.log("Ref ", node);

                if(node.type == "array" || node.items)
                {
                    action = processArrayBehavior(refInfo, rBeh, schemaProps, genProps, refPathParents[rp], overrideJSON);               
                }
                else{
                    action = processObjectBehavior(refInfo, rBeh, schemaProps, genProps, refPathParents[rp], overrideJSON);
                }

                //concat any promises we might have
                if(action.offspring)
                    pathToOffspring[rp] = {offspring: action.offspring, parentIxs: action.parentIxs};


                allPromises = allPromises.concat(action.promises);                
                
            }
            if(allPromises.length)
                return Q.allSettled(allPromises);
            else
                return [];
        })
        .then(function(settled)
        {
            // self.log('Settingled in: ', settled);
            // self.log("Behavior so far: ", pathToOffspring);

            for(var i=0; i < settled.length; i++)
            {
                var create = settled[i];

                if(create.state != "fulfilled")
                {
                    throw new Error("Promise failed: " + JSON.stringify(create.reason));
                }

                //otherwise attach it to our path object

                var offReturn = create.value;
                var path = offReturn.call;

                pathToOffspring[path] = offReturn.offspringObject;
                // self.log('Returned ixs: '.red, offReturn.offspringObject.parentIxs);
            }


            var parentIxs = offspringAndParentIxs.parentIxs;
            //now we have everything we need theoretically
            for(var rp in refPaths)
            {
                var childObjects = pathToOffspring[rp];

                if(!childObjects || !childObjects.offspring || childObjects.offspring.length != count)
                {
                    throw new Error("Child objects not created properly: " + rp + 
                        " err: " + (childObjects && childObjects.offspring ? " wrong number of Offspring " + childObjects.offspring.length : "-- no Offspring found"));
                }

                var objPath = rp.split(self.pathDelimiter);

                //set the path for the Offspring
                for(var c=0; c < count; c++)
                {
                    tOffspring[c].set(objPath, childObjects.offspring[c]);
                    parentIxs[c] = parentIxs[c].concat(childObjects.parentIxs[c]);
                    scrubDuplicates(parentIxs[c]);

                }
            }
        })
        .fail(function(err)
        {   
            //pass the error forward!
            throw err;
        })
    }



    self.qCreateOffspring = function(type, schemaProps, genProps, parentProps, overrideJSON)
    {
        var defer = Q.defer();

        //have several events that must take place accordingly
        //offspring and parents must equal count at the end
        var offspring, parentIxs;

        //how many offspring we need?
        var count = genProps.count;

        Q.fcall(function(){
            //we have to parse the schema object -- we'll do non-reference stuff first
            if(hasBackboneListeners(type, "createNonReferenceOffspring"))
            {
                //if we have the event -- we just do this step elsewhere
                return qBackboneResponse(formEncodingRequest(type, "createNonReferenceOffspring"), genProps, parentProps, overrideJSON); 
            }
            else
            {
                //otherwise, we've got to do it ourselves -- oh boy.
                return self.qOffspringNonReferences(schemaProps, genProps, parentProps, overrideJSON);
            }
        })
        .then(function(offspringAndIxs)
        {
            //pull offspring and parental info
            offspring = offspringAndIxs[0];

            //parentIxs is optional after non-reference objects
            parentIxs = offspringAndIxs[1];

            // self.log('Nonref offspring: ', offspring);

            //must have offspring -- non optional
            if(!offspring || offspring.length != count || !parentIxs || parentIxs.length != count)
            {   
                throw new Error("CreateNonReference: offspring and parent arrays returned must be non-empty equal to count: " + count);
            }
            var offspringAndParentIxs = {offspring: offspring, parentIxs: parentIxs};

            var refCount = Object.keys(schemaProps.references).length;
            // self.log("Refs to operate: ".red, refCount, " for: " + type);
            //now we need to create the reference objects 
            if(refCount)
                return self.qCreateOffspringReferences(offspringAndParentIxs, schemaProps, genProps, parentProps, overrideJSON);
            else
                return;
        })
        .then(function()
        {
            //defer returns NOW
            defer.resolve([offspring, parentIxs]);
        })
        .fail(function(err){

            //we dun messed up
            defer.reject(err);
        })
        


        return defer.promise;
    }

    //main function, we need to create the artfiacts
    self.createArtifacts = function(type, count, parents, overrideJSON, finished)
    {
        if(typeof type != "string" || !Array.isArray(parents) || typeof count != "number")
        {
            finished("Create artifacts requires type [string], count [number], parents [array]");
            return;
        }
        //didn't pass in an override object
        // if(typeof forceParents == "function")
        // {
        //     //dont have parent ixs or override info
        //     finished = forceParents;
        //     forceParents = undefined;
        //     overrideJSON = undefined;
        // }
        // //we have parentIxs but not override info
        // else 
        if(typeof overrideJSON == "function")
        {
            finished = overrideJSON;
            overrideJSON = undefined;
        }

        // self.log("Creating artifacts: type: ", type, " cnt: ", count, " parents: ", parents, " override: ", overrideJSON, " callback exists?: ", finished ? "true" : "false");;
        self.log("[generator] creating ",count, " artifacts of type " , type);

        if(!type || !count || !parents || !parents.length || !finished){
            finished("Improper create artifacts inputs: type [string], count [Number], parents [array >= size(1)], callback [function]");
            return;
        }
        
        self.log('[generator] beginning to create ' + count + ' artifacts of type "' + type +  '" ')

        var failedCreation = false;
        var offspring, oParentIndexes;


        var genProps = {count: count, type : type};
        //parentIxs may be undefined
        var parentProps = {parents: parents};//, force: forceParents};
        var schemaProps;

        // overrideJSON = overrideJSON || {};

        //if we require parental validation, it's going to have to happen now
        qValidation(type, parents, self.validateParents)
            .then(function(isValid)
            {
                // self.log('Parent valid? ', isValid.valid, ' reasons? ', isValid.errors);
                if(!isValid.valid)
                {
                    finished(formatValidationErrors("Parent schema doesn't match type: " + type, isValid.errors));
                    failedCreation = true;
                    return;
                }
                
                // self.log('valid parents- time to make babies'.cyan);
                if(self.validateParents)
                    self.log("[generator] validated parents successfully");
                //we need to fetch two things
                var promises = [];

                promises.push(qBackboneResponse("schema:getFullSchema", type), 
                    qBackboneResponse("schema:getSchemaReferences", type),
                    qBackboneResponse("schema:getSchemaProperties", type));

                return Q.allSettled(promises);
            })
            .then(function(results)
            {
                //let everything fall through -- it's been handled
                if(failedCreation)
                    return;

                // self.log('\tSchema results: '.magenta, results);
                //our results have come back!
                if(results[0].state != "fulfilled" || results[1].state != "fulfilled" || results[2].state != "fulfilled")
                {
                    //we have an error
                    finished({message: "Failed  to get full schema and references", errors: [results[0].reason, results[1].reason, results[2].reason]});
                    return;
                }

                var fullSchema = results[0].value[0];
                var references = results[1].value[0];
                var props = results[2].value[0];


                schemaProps = {fullSchema: fullSchema, primaryPaths: props.primaryPaths, properties: props.properties, references: references};

                // self.log("Full :", fullSchema);
                // self.log("refs : ", references);
                // self.log("Props : ", props);

                //we have the schema and its references
                //check if we know how to make offspring from these objects
                if(handlesFullOffspring(type))
                {
                    // self.log("Encoding knows how to create full: ", type);
                    self.log(self.log.testing, "[generator] calling createFullOffspring for " + type);
                    return qBackboneResponse(formEncodingRequest(type, "createFullOffspring"), genProps, parentProps, overrideJSON);
                }
                else
                {
                    // self.log("Encoding doesn't handle full ", type);
                    self.log(self.log.testing, "[generator] internally creating offspring for " + type);
                    return self.qCreateOffspring(type, schemaProps, genProps, parentProps, overrideJSON);
                }

            })
            .then(function(offspringReturn){

                if(failedCreation)
                    return;

                offspring = offspringReturn[0];
                oParentIndexes = offspringReturn[1];
                var isWIN = schemaProps.properties.isWIN;

                if(!offspring || (isWIN && !oParentIndexes))
                {
                    failedCreation = true;
                    self.log("Undefined: ", arguments);

                    finished({message: "Offspring or parent information cannot be undefined after child creation!"});
                    return;
                }
                else if(offspring.length != count)
                {
                    failedCreation = true;
                    finished({message: "Wrong offspring count: " + offspring.length + " instead of (expected) " + count});
                    return;
                }
                else if(isWIN && oParentIndexes.length != count)
                 {
                    failedCreation = true;
                    finished({message: "Wrong parent information count: " + oParentIndexes.length + " instead of (expected) " + count});
                    return;
                }


                //append info to our offspring -- only if you're a WIN object
                if(schemaProps.properties.isWIN)
                    trackwidAndParentInfo(type, offspring, parents, oParentIndexes);

                self.log('offspring returned: ', offspring, "\nparents: ", oParentIndexes);

                //then we validate if necessary
                return qValidation(type, offspring, self.validateOffspring);
            })
            .then(function(isValid){

                 if(failedCreation)
                    return;

                if(!isValid.valid)
                {
                    failedCreation = true;
                    finished(formatValidationErrors("Offspring failed validation: " + type, isValid.errors));
                    return;
                }
                else
                {
                    //we have valid offspring! away they must go!
                    finished(undefined, {offspring: offspring, parentIxs: oParentIndexes});
                }

            })
            .fail(function(err){
                self.log('Failed create artifacts: ', err);
                self.log(self.log.testing, err.stack)
                finished(formatValidationErrors(err.message, []));
            })
    }

    function formatValidationErrors(msg, errors)
    {
         var formErrors = [];
        //should form the error message appropriates
        for(var i=0; i < errors.length; i++)
        {
            var errArray = errors[i];
            var reform = [];
            for(var e=0; e < errArray.length; e++)
            {   
                var err = errArray[e];
                var oErr= {};
                if(err.dataPath) oErr.dataPath = err.dataPath;
                oErr.message = err.message;

                reform.push(oErr);
            }
            formErrors.push(reform);
        }

        return {message: msg, errors: formErrors};
    }
    function trackwidAndParentInfo(type, offspring, parents, parentIxs)
    {
        for(var i=0; i < offspring.length; i++)
        {
            var pixs = parentIxs[i];
            var child = offspring[i];

            //generate a strongly unique id
            var wid = uuid();

            //give it an id and a type for tracking info
            child.wid = wid;
            child.dbType = type;
            //note: we don't record sessionID here. That's provided elsewhere, where it's more appropriate -- e.g. at evolution

            //going to create it's actual parents according to parent IXs
            var widParents = [];

            if(!pixs.length)
            {
                //all parents become responsible if no-one is mentioned specifically
                for(var p=0; p < parents.length; p++)
                    pixs.push(p);
               // self.log('No parent index array listed!');
               // throw new Error("You can't come from nothing! ParentIXs must list what parent index the offspring came from.");
            }

            //now we must pull the wids from the parents -- if they don't have wid's we need to throw an error
            for(var p=0; p < pixs.length; p++)
            {
                //this is one of the parents we used to generate the child
                var actualParent = parents[pixs[p]];

                if(!actualParent)
                {
                    self.log('Invalid parentIx: ' + pixs[p] + " only " + parents.length + " parents");
                    throw new Error('Invalid parentIx: '+ pixs[p] + " only " + parents.length + " parents");
                }
                else if(!actualParent.wid)
                {
                    self.log('Parent is unidentified: ' + pixs[p]);
                    self.log(actualParent);
                    throw new Error('Error creating artifacts -- parents do not have WID identifiers, a necessary nutrient');
                }
                //make it known who the parents are
                widParents.push(actualParent.wid);
            }

            //grab the string identifier -- we rule!
            child.parents = widParents;
        }
    }
    
    return self;
}





});

require.register("optimuslime~win-gen@0.0.2-6/lib/module/backbone.js", function (exports, module) {
//need our general utils functions
module.exports = extendObject;

function extendObject(self, globalConfiguration, localConfiguration)
{
    //
    self.winFunction = "generator";

    //pull logging from the backbone -- handles all messages to the user
    self.log = self.bb.getLogger(self);
    self.log.logLevel = localConfiguration.logLevel || self.log.normal;
    
    //we need to turn localConfiguration into what we need!
    var rEncodings = localConfiguration.encodings || [];

    //encoding reference type
    var encode = self.rEvents["encoding"];

    //only optional events now- no required for encodings
    
    // for(var i=0; i < rEncodings.length; i++)
    // {
    //     var key = rEncodings[i];
    //     //from each encoding, we require the following events
    //     var reconstitute = key + "-" + "encodingFromJSON";
    //     var condense = key + "-" + "encodingToJSON";

    //     encode[reconstitute] = "encoding:" + reconstitute;
    //     encode[condense] = "encoding:" + condense;
    // }

    self.optionalEvents = function()
    {
        var optional = [];
        for(var i=0; i < rEncodings.length; i++)
        {
            var encoding = rEncodings[i];

            optional.push("encoding:" + encoding + "-createFullOffspring");
            optional.push("encoding:" + encoding + "-arraySelection");
            //handle everything except for the internal references
            optional.push("encoding:" + encoding + "-createNonReferenceOffspring");
            optional.push("encoding:" + encoding + "-chooseReferenceBehavior");

        }
        //there are all the optional events that may be called by this object
        return optional;
    }

    self.requiredEvents = function()
    {
        //don't require any outside modules
        var events = [];
        var internalEvents= self.rEvents;
        //turn our events into an array
        //events are easier organized as an object, but for requirements, we send as array
        for(var func in internalEvents)
        {
            for(var action in internalEvents[func])
            {
                events.push(internalEvents[func][action]);
            }
        }

        self.log('Required gen events: ', events);

        //send back all required events
        return events;
    }

    self.initialize = function(done)
    {
        //set timeout available in and out of browser
       setTimeout(function()
        {
            done();
        }, 0);
    }
}





});

require.modules["optimuslime-win-gen"] = require.modules["optimuslime~win-gen@0.0.2-6"];
require.modules["optimuslime~win-gen"] = require.modules["optimuslime~win-gen@0.0.2-6"];
require.modules["win-gen"] = require.modules["optimuslime~win-gen@0.0.2-6"];


require.register("optimuslime~win-data@0.0.1-3", function (exports, module) {
var request = require("visionmedia~superagent@master");

module.exports = windata;


function windata(backbone, globalConfig, localConfig)
{
	var self= this;

	//need to make requests, much like win-publish
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "data";

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	//we have logger and emitter, set up some of our functions

	if(!globalConfig.server)
		throw new Error("Global configuration requires server location and port")

	self.hostname = globalConfig.server;
	self.port = globalConfig.port;

	//what events do we need?
	//none for now, though in the future, we might have a way to communicate with foreign win-backbones as if it was just sending
	//a message within our own backbone -- thereby obfuscating what is done remotely and what is done locally 
	self.requiredEvents = function()
	{
		return [
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			"data:winPOST" : self.postWIN,
			"data:winGET" : self.getWIN
		};
	}

	 var baseWIN = function()
	{
		return self.hostname + (self.port ? ":" + self.port : "") + "/api";
	}

	self.getWIN = function(apiPath, queryObjects, resFunction)
	{
		var base = baseWIN();

		if(typeof queryObjects == "function")
		{
		  resFunction = queryObjects;
		  queryObjects = {};
		}
		else //make sure to always have at least an empty object
		  queryObjects = queryObjects || {};

		var qNotEmpty = false;
		var queryAdditions = "?";
		for(var key in queryObjects){
		  if(queryAdditions.length > 1)
		    queryAdditions += "&";

		  qNotEmpty = true;
		  queryAdditions += key + "=" + queryObjects[key];
		} 
		var fullPath = base + apiPath + (qNotEmpty ? queryAdditions : "");

		self.log("Requesting get from: ",fullPath )
		request
		  .get(fullPath)
		  // .send(data)
		  .set('Accept', 'application/json')
		  .end(resFunction);
	}

	self.postWIN = function(apiPath, data, resFunction)
	{
		var base = baseWIN();

		var fullPath= base + apiPath;
		self.log("Requesting post to: ",fullPath )

		request
		  .post(fullPath)
		  .send(data)
		  .set('Accept', 'application/json')
		  .end(resFunction);
	}


	return self;
}



});

require.modules["optimuslime-win-data"] = require.modules["optimuslime~win-data@0.0.1-3"];
require.modules["optimuslime~win-data"] = require.modules["optimuslime~win-data@0.0.1-3"];
require.modules["win-data"] = require.modules["optimuslime~win-data@0.0.1-3"];


require.register("optimuslime~win-phylogeny@0.0.1-1", function (exports, module) {
//this will help us navigate complicated json tree objects
var traverse = require("optimuslime~traverse@master");

module.exports = winphylogeny;

function winphylogeny(backbone, globalConfig, localConfig)
{
	var self= this;

	//need to make requests, much like win-publish
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "phylogeny";

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	//we have logger and emitter, set up some of our functions

	//what events do we need?
	//none for now, though in the future, we might have a way to communicate with foreign win-backbones as if it was just sending
	//a message within our own backbone -- thereby obfuscating what is done remotely and what is done locally 
	self.requiredEvents = function()
	{
		return [
			"data:winGET"
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			"phylogeny:fullAncestry" : self.fullAncestry,
			//for now, partial == full -- for now
			"phylogeny:partialAncestry" : self.fullAncestry,
			"phylogeny:fullTreeOfArtifacts" : self.getFullTreeOfArtifacts,
			"phylogeny:buildTreeOfArtifacts" : self.buildTreeOfArtifacts
		};	
	}

	self.fullAncestry = function(finished)
	{
		//
		self.log("WARNING: calling full phylogeny might be dangerously consuming for the server. Therefore, this is a two step function." + 
			" I give you a function, you call the function. ");
		self.log("In the future, there will be an authorization password for doing this. This will deter accidents for now");

		//send it back -- no error
		finished(undefined, self.internalFullPhylogeny);
	}

	self.internalFullPhylogeny = function(artifactType, password, finished)
	{
		//query all artifacts from our server -- use a password please
		self.backEmit("data:winGET", "/artifacts", {artifactType: artifactType, all: true, password: password}, function(err, res){
			
			if(err)
			{
				finished(err);
				return;
			}
			else if(res.statusCode == 500 || res.statusCode == 404)
			{
				finished("Server full phylogeny failure: " + JSON.stringify(res.error) + " | message: " + err.message);
				return;
			}
			//there is an implicit assumption here that there aren't complicated parent child relationships here -- like 1 to 1 
			//uh oh for iesor?

			var artifacts = res.body;

			var childrenToParents = {};
			var parentsToChildren = {};

			var childrenParentCount = {};
			var parentChildrenCount = {};

			var widArtifacts = {};
			
			//this is for main artifacts
			for(var i=0; i < artifacts.length; i++)
			{
				var aChild = artifacts[i];
				var aWID = aChild.wid;
				var parents = aChild.parents;

				//a simple mapping from artifactWID to object
				widArtifacts[aWID] = aChild;

				var c2pObject = childrenToParents[aWID];
				if(!c2pObject)
				{
					c2pObject = {};
					childrenParentCount[aWID] = parents.length;
					childrenToParents[aWID] = c2pObject;
				}
				var p2cObject;
				for(var p=0; p < parents.length; p++)
				{
					var aParWID = parents[p];
					//now we map children to parents
					p2cObject = parentsToChildren[aParWID]; 
					if(!p2cObject)
					{
						p2cObject = {};
						parentChildrenCount[aParWID] = 0;
						parentsToChildren[aParWID] = p2cObject;
					}

					//now we have all information here
					//the child object marks the parent object
					c2pObject[aParWID] = true;

					//the parent object marks the child wid as a child
					p2cObject[aWID] = true;

					//increment the child count
					parentChildrenCount[aParWID]++;
				}

				//now we know all the parents for this artifact, and all the parents know this is a child
			}

			finished(undefined, {
				artifacts :  widArtifacts,
				parentsToChildren: parentsToChildren, 
				childrenToParents: childrenToParents, 
				artifactCount: artifacts.length, 
				childrenParentCount: childrenParentCount
			});

		});
	}

	//grab the full tree
	self.getFullTreeOfArtifacts = function(finished)
	{
		self.log("WARNING: calling full phylogeny/artifact tree might be dangerously consuming for the server. Therefore, this is a two step function. I give you a function, you call the function. ");
		self.log("In the future, there will be an authorization password for doing this. This will deter accidents for now");

		//send it back -- no error
		finished(undefined, self.internalFullTree);
	}
	self.internalFullTree = function(artifactType, password, finished)
	{
		//two step process, grab phylo info, then work on the tree
		self.internalFullPhylogeny(artifactType, password, function(err, artStuff)
		{
			if(err)
			{
				finished(err);
				return;
			}

			self.buildTreeOfArtifacts(artStuff, function(err, tree)
			{
				//if we have an err, it'll be passed on anyways
				finished(err, tree);
			});
		});
	}

	//we build up a full tree here
	self.buildTreeOfArtifacts = function(artObject, finished)
	{
		//got all these artifcats yo
		var artifacts = artObject.artifacts;
		var parentsToChildren  = artObject.parentsToChildren;
		var childrenToParents = artObject.childrenToParents;
		var artifactCount = artObject.artifactCount;
		var childrenParentCount = artObject.childrenParentCount;

		//so we know who is root by how many parents they have
		// self.log("C2PCount: ", childrenParentCount);

		var minChildren = Number.MAX_VALUE;
		//get the minimum
		for(var key in childrenParentCount)
			minChildren = Math.min(minChildren, childrenParentCount[key]);
	
		self.log("Minimum children among arts: " , minChildren);
		//let's follow the chain, and build a tree of sorts
		//at the top are the roots
		var root = {};
		for(var key in childrenParentCount)
		{
			//these are root objects -- they don't have any parents!
			if(childrenParentCount[key] == minChildren)
				root[key] = {};
		}

	
		//let's turn this tree into numbers, and the appropriate mapping for each artifact
		//first we'll go by layers -- mapping objects to lyaers

		//we need a real list of layers
		function recursiveTrueLayers(layer, wid, trueLayers, p2c)
		{
			var layerInfo = trueLayers[wid];

			//looking for layer info for children after we set
			//we set each object EVERY time we see it -- but do not investigate those already checked
			if(layerInfo)
				return;

			//otherwise, we don't exist!
			layerInfo = {layer: layer};
			//make it part of our object
			trueLayers[wid] = layerInfo;

			//all done with that, lets check our children and their parents!
			var children = p2c[wid];

			//making our job easy, nothing to do here
			if(!children)
				return;

			var childLayer = layerInfo.layer + 1;

			//loop through our children
			for(var widChild in children)
			{
				//look at our children, their layers are the max of our layer + 1
				recursiveTrueLayers(childLayer, widChild, trueLayers, p2c);

				//it must exist
				var clObject = trueLayers[widChild];

				//either its the current layer -- or the original layer determined (whichever is greater)
				clObject.layer = Math.max(clObject.layer, childLayer); 
			}
		}

		//we need things with the proper dependencies
		var artifactsToLayers = {};
		var layersToArtifacts = {};

		//starting from root -- find true layering info by recursively examining children
		for(var wid in root)
		{
			var startLayer = 0;
			recursiveTrueLayers(startLayer, wid, artifactsToLayers, parentsToChildren);
		}

		//appropriate layers
		for(var wid in artifactsToLayers)
		{
			//grab the layer
			var layer = artifactsToLayers[wid].layer;

			//grab the existing layer
			var layer2Art = layersToArtifacts[layer]; 
			if(!layer2Art)
 			{
 				layer2Art = {};
 				layersToArtifacts[layer] = layer2Art;
			}

			//layer to objects
			layer2Art[wid] = artifacts[wid];
		}

		//now we have layers of objects
		self.log("Artifacts to layers: ", layersToArtifacts);

		var buildNames = {};
		var links = [];

		//we now have all the info needed to name something
		var fullTreeNames = {};


		//because it's in layers, it is guaranteed to be in order of the tree of dependencies
		//that is, every child can reference a parent and the naming will be done by induction
		for(var layer in layersToArtifacts)
		{	
			var lCount = 0;
			for(var wid in layersToArtifacts[layer])
			{
				var artifact = layersToArtifacts[layer][wid];

				//what's the base -- the layer, and count of object
				var baseName = [layer, lCount++].join('-');

				//now we need to note our parents by their layer ids 
				var name =  {base: baseName, parents: []};
				
				//parents? Everyone is at least an empty array
				var parents = Object.keys(childrenToParents[wid]);

				for(var i=0; i < parents.length; i++)
				{
					//grab our parent ids
					var pWID = parents[i];
					name.parents.push(buildNames[pWID].base);
				}

				//now we have everything we need in name
				name.fullName = name.base + (name.parents.length ? "_p_" + name.parents.join('_') : "");
				name.artifact = artifact;

				//need to link parent and child
				for(var i=0; i < parents.length; i++)
				{	
					var pWID = parents[i];
					links.push({source: buildNames[pWID].fullName, target: name.fullName});
				}

				//all done, we have naming info
				buildNames[wid] = name;	

				//we have all we need for full names
				fullTreeNames[wid] = name.fullName;
			}
		}

		//have build identification
		//yeah boyeee
		//send back what we know about the tree stuffff
		finished(undefined, {nameTree: fullTreeNames, artifacts: artifacts, links: links});
	}

	self.recursiveFollowChildren = function(layer, wid, build, p2c, alreadyInvestigated, treeProperties)
	{
		//grab our potential children (might not exist)
		var children = p2c[wid];

		//this is the child of the build object -- everything must make one!
		build[wid] = {layer: layer};

		//how deep do we go???
		treeProperties.maxLayer = Math.max(treeProperties.maxLayer, layer);

		//still counts!
		treeProperties.totalCount++;

		//this object ain't got no children
		if(!children)
		{
			//no children, mark as leaf, count leaves, peace!
			treeProperties.leafCount++;

			//we're the end of the line -- here we simple store something?
			build[wid].isLeaf = true;

			return;
		}
		
		//these are all the children we need to investigate
		var investigate = Object.keys(children);	
		
		//otherwise we have to investigate all our children -- no duplicates please
		for(var i=0; i < investigate.length; i++)
		{	
			var iWID = investigate[i];

			//make sure not to fall into infinite recursion -- the worst way to die 
			if(!alreadyInvestigated[iWID])
			{
				//mark as seen
				alreadyInvestigated[iWID] = true;

				//how many non leafs do we have?
				treeProperties.nonLeafCount++;

				//keep building!
				self.recursiveFollowChildren(layer + 1, iWID, build[wid], p2c, alreadyInvestigated, treeProperties);
			}
			else
			{
				//we have seen this already, we have a cycle
				treeProperties.hasCycle = true;
				if(!treeProperties.cycle)
					treeProperties.cycle = {};

				//grab all the objects responsible for causing a cycle -- this can affect layers later
				treeProperties.cycle[iWID] = true;

			}			
		}
	}

	return self;
}







});

require.modules["optimuslime-win-phylogeny"] = require.modules["optimuslime~win-phylogeny@0.0.1-1"];
require.modules["optimuslime~win-phylogeny"] = require.modules["optimuslime~win-phylogeny@0.0.1-1"];
require.modules["win-phylogeny"] = require.modules["optimuslime~win-phylogeny@0.0.1-1"];


require.register("optimuslime~cppnjs@master", function (exports, module) {
var cppnjs = {};

//export the cppn library
module.exports = cppnjs;

//CPPNs
cppnjs.cppn = require("optimuslime~cppnjs@master/networks/cppn.js");

cppnjs.addAdaptable = function()
{
    require("optimuslime~cppnjs@master/extras/adaptableAdditions.js");
};

cppnjs.addPureCPPN = function()
{
    require("optimuslime~cppnjs@master/extras/pureCPPNAdditions.js");
};

cppnjs.addGPUExtras = function()
{
    //requires pureCPPN activations
    cppnjs.addPureCPPN();
    require("optimuslime~cppnjs@master/extras/gpuAdditions.js");
};

//add GPU extras by default
cppnjs.addGPUExtras();





//nodes and connections!
cppnjs.cppnNode = require("optimuslime~cppnjs@master/networks/cppnNode.js");
cppnjs.cppnConnection = require("optimuslime~cppnjs@master/networks/cppnConnection.js");

//all the activations your heart could ever hope for
cppnjs.cppnActivationFunctions = require("optimuslime~cppnjs@master/activationFunctions/cppnactivationfunctions.js");
cppnjs.cppnActivationFactory = require("optimuslime~cppnjs@master/activationFunctions/cppnActivationFactory.js");

//and the utilities to round it out!
cppnjs.utilities = require("optimuslime~cppnjs@master/utility/utilities.js");

//exporting the node type
cppnjs.NodeType = require("optimuslime~cppnjs@master/types/nodeType.js");



});

require.register("optimuslime~cppnjs@master/activationFunctions/cppnActivationFactory.js", function (exports, module) {
var utils = require("optimuslime~cppnjs@master/utility/utilities.js");
var cppnActivationFunctions = require("optimuslime~cppnjs@master/activationFunctions/cppnactivationfunctions.js");

var Factory = {};

module.exports = Factory;

Factory.probabilities = [];
Factory.functions = [];
Factory.functionTable= {};

Factory.createActivationFunction = function(functionID)
{
    if(!cppnActivationFunctions[functionID])
        throw new Error("Activation Function doesn't exist!");
    // For now the function ID is the name of a class that implements IActivationFunction.
    return new cppnActivationFunctions[functionID]();

};

Factory.getActivationFunction = function(functionID)
{
    var activationFunction = Factory.functionTable[functionID];
    if(!activationFunction)
    {
//            console.log('Creating: ' + functionID);
//            console.log('ActivationFunctions: ');
//            console.log(cppnActivationFunctions);

        activationFunction = Factory.createActivationFunction(functionID);
        Factory.functionTable[functionID] = activationFunction;
    }
    return activationFunction;

};

Factory.setProbabilities = function(oProbs)
{
    Factory.probabilities = [];//new double[probs.Count];
    Factory.functions = [];//new IActivationFunction[probs.Count];
    var counter = 0;

    for(var key in oProbs)
    {
        Factory.probabilities.push(oProbs[key]);
        Factory.functions.push(Factory.getActivationFunction(key));
        counter++;
    }

};

Factory.defaultProbabilities = function()
{
    var oProbs = {'BipolarSigmoid' :.25, 'Sine':.25, 'Gaussian':.25, 'Linear':.25};
    Factory.setProbabilities(oProbs);
};
Factory.getRandomActivationFunction = function()
{
    if(Factory.probabilities.length == 0)
        Factory.defaultProbabilities();

    return Factory.functions[utils.RouletteWheel.singleThrowArray(Factory.probabilities)];
};


});

require.register("optimuslime~cppnjs@master/activationFunctions/cppnactivationfunctions.js", function (exports, module) {
var cppnActivationFunctions = {};

module.exports = cppnActivationFunctions;

//implemented the following:
//BipolarSigmoid
//PlainSigmoid
//Gaussian
//Linear
//NullFn
//Sine
//StepFunction

cppnActivationFunctions.ActivationFunction = function(functionObj)
{
    var self = this;
    self.functionID = functionObj.functionID;
    self.functionString = functionObj.functionString;
    self.functionDescription = functionObj.functionDescription;
    self.calculate = functionObj.functionCalculate;
    self.enclose = functionObj.functionEnclose;
//        console.log('self.calc');
//        console.log(self.calculate);
//        console.log(self.calculate(0));
};

//this makes it easy to overwrite an activation function from the outside
//cppnActivationFunctions.AddActivationFunction("BiplorSigmoid", {NEW IMPLEMENTATION});
//this can be useful for customizing certain functions for your domain while maintaining the same names

cppnActivationFunctions.AddActivationFunction = function(functionName, description)
{
    cppnActivationFunctions[functionName] = function()
    {
        return new cppnActivationFunctions.ActivationFunction(description);
    }
};

cppnActivationFunctions.AddActivationFunction(
    "BipolarSigmoid",
    {
        functionID: 'BipolarSigmoid' ,
        functionString: "2.0/(1.0 + exp(-4.9*inputSignal)) - 1.0",
        functionDescription: "bipolar steepend sigmoid",
        functionCalculate: function(inputSignal)
        {
            return (2.0 / (1.0 + Math.exp(-4.9 * inputSignal))) - 1.0;
        },
        functionEnclose: function(stringToEnclose)
        {
            return "((2.0 / (1.0 + Math.exp(-4.9 *(" + stringToEnclose + ")))) - 1.0)";
        }
    });

cppnActivationFunctions.AddActivationFunction(
    "PlainSigmoid",
    {
        functionID: 'PlainSigmoid' ,
        functionString: "1.0/(1.0+(exp(-inputSignal)))",
        functionDescription: "Plain sigmoid [xrange -5.0,5.0][yrange, 0.0,1.0]",
        functionCalculate: function(inputSignal)
        {
            return 1.0/(1.0+(Math.exp(-inputSignal)));
        },
        functionEnclose: function(stringToEnclose)
        {
            return "(1.0/(1.0+(Math.exp(-1.0*(" + stringToEnclose + ")))))";
        }
    });

cppnActivationFunctions.AddActivationFunction(
    "Gaussian",
    {
        functionID:  'Gaussian',
        functionString: "2*e^(-(input*2.5)^2) - 1",
        functionDescription:"bimodal gaussian",
        functionCalculate: function(inputSignal)
        {
            return 2 * Math.exp(-Math.pow(inputSignal * 2.5, 2)) - 1;
        },
        functionEnclose: function(stringToEnclose)
        {
            return "(2.0 * Math.exp(-Math.pow(" + stringToEnclose + "* 2.5, 2.0)) - 1.0)";
        }
    });

cppnActivationFunctions.AddActivationFunction(
    "Linear",
    {
        functionID:   'Linear',
        functionString: "Math.abs(x)",
        functionDescription:"Linear",
        functionCalculate: function(inputSignal)
        {
            return Math.abs(inputSignal);
        },
        functionEnclose: function(stringToEnclose)
        {
            return "(Math.abs(" + stringToEnclose + "))";
        }
    });

cppnActivationFunctions.AddActivationFunction(
    "NullFn",
    {
        functionID:   'NullFn',
        functionString: "0",
        functionDescription: "returns 0",
        functionCalculate: function(inputSignal)
        {
            return 0.0;
        },
        functionEnclose: function(stringToEnclose)
        {
            return "(0.0)";
        }
    });

cppnActivationFunctions.AddActivationFunction(
    "Sine2",
    {
        functionID:   'Sine2',
        functionString: "Sin(2*inputSignal)",
        functionDescription: "Sine function with doubled period",
        functionCalculate: function(inputSignal)
        {
            return Math.sin(2*inputSignal);
        },
        functionEnclose: function(stringToEnclose)
        {
            return "(Math.sin(2.0*(" + stringToEnclose + ")))";
        }
    });


cppnActivationFunctions.AddActivationFunction(
    "Sine",
    {
        functionID:   'Sine',
        functionString: "Sin(inputSignal)",
        functionDescription: "Sine function with normal period",
        functionCalculate: function(inputSignal)
        {
            return Math.sin(inputSignal);
        },
        functionEnclose: function(stringToEnclose)
        {
            return "(Math.sin(" + stringToEnclose + "))";
        }
    });

cppnActivationFunctions.AddActivationFunction(
    "StepFunction",
    {
        functionID:    'StepFunction',
        functionString: "x<=0 ? 0.0 : 1.0",
        functionDescription: "Step function [xrange -5.0,5.0][yrange, 0.0,1.0]",
        functionCalculate: function(inputSignal)
        {
            if(inputSignal<=0.0)
                return 0.0;
            else
                return 1.0;
        },
        functionEnclose: function(stringToEnclose)
        {
            return "(((" + stringToEnclose + ') <= 0.0) ? 0.0 : 1.0)';
        }
    });

});

require.register("optimuslime~cppnjs@master/networks/cppnConnection.js", function (exports, module) {
/**
 * Module dependencies.
 */
//none

/**
 * Expose `cppnConnection`.
 */

module.exports = cppnConnection;

/**
 * Initialize a new cppnConnection.
 *
 * @param {Number} sourceIdx
 * @param {Number} targetIdx
 * @param {Number} cWeight
 * @api public
 */
//simple connection type -- from FloatFastConnection.cs
function cppnConnection(
    sourceIdx,
    targetIdx,
    cWeight
    ){

    var self = this;
    self.sourceIdx =    sourceIdx;
    self.targetIdx =    targetIdx;
    self.weight = cWeight;
    self.signal =0;

}
});

require.register("optimuslime~cppnjs@master/networks/cppnNode.js", function (exports, module) {
/**
 * Module dependencies.
 */
var NodeType = require("optimuslime~cppnjs@master/types/nodeType.js");

/**
 * Expose `cppnNode`.
 */

module.exports = cppnNode;

/**
 * Initialize a new cppnNode.
 *
 * @param {String} actFn
 * @param {String} neurType
 * @param {String} nid
 * @api public
 */

function cppnNode(actFn, neurType, nid){

    var self = this;

    self.neuronType = neurType;
    self.id = nid;
    self.outputValue = (self.neuronType == NodeType.bias ? 1.0 : 0.0);
    self.activationFunction = actFn;

}
});

require.register("optimuslime~cppnjs@master/networks/cppn.js", function (exports, module) {
/**
 * Module dependencies.
 */

var utilities = require("optimuslime~cppnjs@master/utility/utilities.js");

/**
 * Expose `CPPN`.
 */

module.exports = CPPN;

/**
 * Initialize a new error view.
 *
 * @param {Number} biasNeuronCount
 * @param {Number} inputNeuronCount
 * @param {Number} outputNeuronCount
 * @param {Number} totalNeuronCount
 * @param {Array} connections
 * @param {Array} biasList
 * @param {Array} activationFunctions
 * @api public
 */
function CPPN(
    biasNeuronCount,
    inputNeuronCount,
    outputNeuronCount,
    totalNeuronCount,
    connections,
    biasList,
    activationFunctions
    )
{
    var self = this;

    // must be in the same order as neuronSignals. Has null entries for neurons that are inputs or outputs of a module.
    self.activationFunctions = activationFunctions;

    // The modules and connections are in no particular order; only the order of the neuronSignals is used for input and output methods.
    //floatfastconnections
    self.connections = connections;

    /// The number of bias neurons, usually one but sometimes zero. This is also the index of the first input neuron in the neuron signals.
    self.biasNeuronCount = biasNeuronCount;
    /// The number of input neurons.
    self.inputNeuronCount = inputNeuronCount;
    /// The number of input neurons including any bias neurons. This is also the index of the first output neuron in the neuron signals.
    self.totalInputNeuronCount = self.biasNeuronCount + self.inputNeuronCount;
    /// The number of output neurons.
    self.outputNeuronCount = outputNeuronCount;

    //save the total neuron count for us
    self.totalNeuronCount = totalNeuronCount;

    // For the following array, neurons are ordered with bias nodes at the head of the list,
    // then input nodes, then output nodes, and then hidden nodes in the array's tail.
    self.neuronSignals = [];
    self.modSignals = [];

    // This array is a parallel of neuronSignals, and only has values during SingleStepInternal().
    // It is declared here to avoid having to reallocate it for every network activation.
    self.neuronSignalsBeingProcessed = [];

    //initialize the neuron,mod, and processing signals
    for(var i=0; i < totalNeuronCount; i++){
        //either you are 1 for bias, or 0 otherwise
        self.neuronSignals.push(i < self.biasNeuronCount ? 1 : 0);
        self.modSignals.push(0);
        self.neuronSignalsBeingProcessed.push(0);
    }

    self.biasList = biasList;

    // For recursive activation, marks whether we have finished this node yet
    self.activated = [];
    // For recursive activation, makes whether a node is currently being calculated. For recurrant connections
    self.inActivation = [];
    // For recursive activation, the previous activation for recurrent connections
    self.lastActivation = [];


    self.adjacentList = [];
    self.reverseAdjacentList = [];
    self.adjacentMatrix = [];


    //initialize the activated, in activation, previous activation
    for(var i=0; i < totalNeuronCount; i++){
        self.activated.push(false);
        self.inActivation.push(false);
        self.lastActivation.push(0);

        //then we initialize our list of lists!
        self.adjacentList.push([]);
        self.reverseAdjacentList.push([]);

        self.adjacentMatrix.push([]);
        for(var j=0; j < totalNeuronCount; j++)
        {
            self.adjacentMatrix[i].push(0);
        }
    }

//        console.log(self.adjacentList.length);

    //finally
    // Set up adjacency list and matrix
    for (var i = 0; i < self.connections.length; i++)
    {
        var crs = self.connections[i].sourceIdx;
        var crt = self.connections[i].targetIdx;

        // Holds outgoing nodes
        self.adjacentList[crs].push(crt);

        // Holds incoming nodes
        self.reverseAdjacentList[crt].push(crs);

        self.adjacentMatrix[crs][crt] = connections[i].weight;
    }
}


/// <summary>
/// Using RelaxNetwork erodes some of the perofrmance gain of FastConcurrentNetwork because of the slightly
/// more complex implemementation of the third loop - whe compared to SingleStep().
/// </summary>
/// <param name="maxSteps"></param>
/// <param name="maxAllowedSignalDelta"></param>
/// <returns></returns>
CPPN.prototype.relaxNetwork = function(maxSteps, maxAllowedSignalDelta)
{
    var self = this;
    var isRelaxed = false;
    for (var j = 0; j < maxSteps && !isRelaxed; j++) {
        isRelaxed = self.singleStepInternal(maxAllowedSignalDelta);
    }
    return isRelaxed;
};

CPPN.prototype.setInputSignal = function(index, signalValue)
{
    var self = this;
    // For speed we don't bother with bounds checks.
    self.neuronSignals[self.biasNeuronCount + index] = signalValue;
};

CPPN.prototype.setInputSignals = function(signalArray)
{
    var self = this;
    // For speed we don't bother with bounds checks.
    for (var i = 0; i < signalArray.length; i++)
        self.neuronSignals[self.biasNeuronCount + i] = signalArray[i];
};

//we can dispense of this by accessing neuron signals directly
CPPN.prototype.getOutputSignal = function(index)
{
    // For speed we don't bother with bounds checks.
    return this.neuronSignals[this.totalInputNeuronCount + index];
};

//we can dispense of this by accessing neuron signals directly
CPPN.prototype.clearSignals = function()
{
    var self = this;
    // Clear signals for input, hidden and output nodes. Only the bias node is untouched.
    for (var i = self.biasNeuronCount; i < self.neuronSignals.length; i++)
        self.neuronSignals[i] = 0.0;
};

//    cppn.CPPN.prototype.TotalNeuronCount = function(){ return this.neuronSignals.length;};

CPPN.prototype.recursiveActivation = function(){

    var self = this;
    // Initialize boolean arrays and set the last activation signal, but only if it isn't an input (these have already been set when the input is activated)
    for (var i = 0; i < self.neuronSignals.length; i++)
    {
        // Set as activated if i is an input node, otherwise ensure it is unactivated (false)
        self.activated[i] = (i < self.totalInputNeuronCount) ? true : false;
        self.inActivation[i] = false;
        if (i >= self.totalInputNeuronCount)
            self.lastActivation[i] = self.neuronSignals[i];
    }

    // Get each output node activation recursively
    // NOTE: This is an assumption that genomes have started minimally, and the output nodes lie sequentially after the input nodes
    for (var i = 0; i < self.outputNeuronCount; i++)
        self.recursiveActivateNode(self.totalInputNeuronCount + i);

};


CPPN.prototype.recursiveActivateNode = function(currentNode)
{
    var self = this;
    // If we've reached an input node we return since the signal is already set
    if (self.activated[currentNode])
    {
        self.inActivation[currentNode] = false;
        return;
    }

    // Mark that the node is currently being calculated
    self.inActivation[currentNode] = true;

    // Set the presignal to 0
    self.neuronSignalsBeingProcessed[currentNode] = 0;

    // Adjacency list in reverse holds incoming connections, go through each one and activate it
    for (var i = 0; i < self.reverseAdjacentList[currentNode].length; i++)
    {
        var crntAdjNode = self.reverseAdjacentList[currentNode][i];

        //{ Region recurrant connection handling - not applicable in our implementation
        // If this node is currently being activated then we have reached a cycle, or recurrant connection. Use the previous activation in this case
        if (self.inActivation[crntAdjNode])
        {
            //console.log('using last activation!');
            self.neuronSignalsBeingProcessed[currentNode] += self.lastActivation[crntAdjNode]*self.adjacentMatrix[crntAdjNode][currentNode];
//                    parseFloat(
//                    parseFloat(self.lastActivation[crntAdjNode].toFixed(9)) * parseFloat(self.adjacentMatrix[crntAdjNode][currentNode].toFixed(9)).toFixed(9));
        }

        // Otherwise proceed as normal
        else
        {
            // Recurse if this neuron has not been activated yet
            if (!self.activated[crntAdjNode])
                self.recursiveActivateNode(crntAdjNode);

            // Add it to the new activation
            self.neuronSignalsBeingProcessed[currentNode] +=  self.neuronSignals[crntAdjNode] *self.adjacentMatrix[crntAdjNode][currentNode];
//                    parseFloat(
//                    parseFloat(self.neuronSignals[crntAdjNode].toFixed(9)) * parseFloat(self.adjacentMatrix[crntAdjNode][currentNode].toFixed(9)).toFixed(9));
        }
        //} endregion
    }

    // Mark this neuron as completed
    self.activated[currentNode] = true;

    // This is no longer being calculated (for cycle detection)
    self.inActivation[currentNode] = false;

//        console.log('Current node: ' + currentNode);
//        console.log('ActivationFunctions: ');
//        console.log(self.activationFunctions);
//
//        console.log('neuronSignals: ');
//        console.log(self.neuronSignals);
//
//        console.log('neuronSignalsBeingProcessed: ');
//        console.log(self.neuronSignalsBeingProcessed);
    // Set this signal after running it through the activation function
    self.neuronSignals[currentNode] = self.activationFunctions[currentNode].calculate(self.neuronSignalsBeingProcessed[currentNode]);
//            parseFloat((self.activationFunctions[currentNode].calculate(parseFloat(self.neuronSignalsBeingProcessed[currentNode].toFixed(9)))).toFixed(9));

};


CPPN.prototype.isRecursive = function()
{
    var self = this;

    //if we're a hidden/output node (nodeid >= totalInputcount), and we connect to an input node (nodeid <= self.totalInputcount) -- it's recurrent!
    //if we are a self connection, duh we are recurrent
    for(var c=0; c< self.connections.length; c++)
        if((self.connections[c].sourceIdx >= self.totalInputNeuronCount
            && self.connections[c].targetIdx < self.totalInputNeuronCount)
            || self.connections[c].sourceIdx == self.connections[c].targetIdx
            )
            return true;

    self.recursed = [];
    self.inRecursiveCheck = [];


    for(var i=0; i < self.neuronSignals.length; i++)
    {

        self.recursed.push((i < self.totalInputNeuronCount) ? true : false);
        self.inRecursiveCheck.push(false);
    }

    // Get each output node activation recursively
    // NOTE: This is an assumption that genomes have started minimally, and the output nodes lie sequentially after the input nodes
    for (var i = 0; i < self.outputNeuronCount; i++){
        if(self.recursiveCheckRecursive(self.totalInputNeuronCount + i))
        {
//                console.log('Returned one!');
            return true;

        }
    }

    return false;

};

CPPN.prototype.recursiveCheckRecursive = function(currentNode)
{
    var self = this;


//        console.log('Self recursed : '+ currentNode + ' ? ' +  self.recursed[currentNode]);

//        console.log('Checking: ' + currentNode)
    //  If we've reached an input node we return since the signal is already set
    if (self.recursed[currentNode])
    {
        self.inRecursiveCheck[currentNode] = false;
        return false;
    }

    // Mark that the node is currently being calculated
    self.inRecursiveCheck[currentNode] = true;

    // Adjacency list in reverse holds incoming connections, go through each one and activate it
    for (var i = 0; i < self.reverseAdjacentList[currentNode].length; i++)
    {
        var crntAdjNode = self.reverseAdjacentList[currentNode][i];

        //{ Region recurrant connection handling - not applicable in our implementation
        // If this node is currently being activated then we have reached a cycle, or recurrant connection. Use the previous activation in this case
        if (self.inRecursiveCheck[crntAdjNode])
        {
            self.inRecursiveCheck[currentNode] = false;
            return true;
        }

        // Otherwise proceed as normal
        else
        {
            var verifiedRecursive;
            // Recurse if this neuron has not been activated yet
            if (!self.recursed[crntAdjNode])
                verifiedRecursive = self.recursiveCheckRecursive(crntAdjNode);

            if(verifiedRecursive)
                return true;
        }
        //} endregion
    }

    // Mark this neuron as completed
    self.recursed[currentNode] = true;

    // This is no longer being calculated (for cycle detection)
    self.inRecursiveCheck[currentNode] = false;

    return false;
};





(function(exports, selfBrowser, isBrowser){

    var cppn = {CPPN: {}};







    //send in the object, and also whetehr or not this is nodejs
})(typeof exports === 'undefined'? this['cppnjs']['cppn']={}: exports, this, typeof exports === 'undefined'? true : false);

});

require.register("optimuslime~cppnjs@master/types/nodeType.js", function (exports, module) {
var NodeType =
{
    bias : "Bias",
    input: "Input",
    output: "Output",
    hidden: "Hidden",
    other : "Other"
};

module.exports = NodeType;

});

require.register("optimuslime~cppnjs@master/utility/utilities.js", function (exports, module) {
var utils = {};

module.exports = utils;

utils.stringToFunction = function(str) {
    var arr = str.split(".");

    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
    }

    if (typeof fn !== "function") {
        throw new Error("function not found");
    }

    return  fn;
};

utils.nextDouble = function()
{
    return Math.random();
};

utils.next = function(range)
{
    return Math.floor((Math.random()*range));
};

utils.tanh = function(arg) {
    // sinh(number)/cosh(number)
    return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
};

utils.sign = function(input)
{
    if (input < 0) {return -1;}
    if (input > 0) {return 1;}
    return 0;
};

//ROULETTE WHEEL class


//if we need a node object, this is how we would do it
//    var neatNode = isNodejs ? self['neatNode'] : require('./neatNode.js');
utils.RouletteWheel =
{

};

/// <summary>
/// A simple single throw routine.
/// </summary>
/// <param name="probability">A probability between 0..1 that the throw will result in a true result.</param>
/// <returns></returns>
utils.RouletteWheel.singleThrow = function(probability)
{
    return (utils.nextDouble() <= probability);
};



/// <summary>
/// Performs a single throw for a given number of outcomes with equal probabilities.
/// </summary>
/// <param name="numberOfOutcomes"></param>
/// <returns>An integer between 0..numberOfOutcomes-1. In effect this routine selects one of the possible outcomes.</returns>

utils.RouletteWheel.singleThrowEven = function(numberOfOutcomes)
{
    var probability= 1.0 / numberOfOutcomes;
    var accumulator=0;
    var throwValue = utils.nextDouble();

    for(var i=0; i<numberOfOutcomes; i++)
    {
        accumulator+=probability;
        if(throwValue<=accumulator)
            return i;
    }
    //throw exception in javascript
    throw "PeannutLib.Maths.SingleThrowEven() - invalid outcome.";
};

/// <summary>
/// Performs a single thrown onto a roulette wheel where the wheel's space is unevenly divided.
/// The probabilty that a segment will be selected is given by that segment's value in the 'probabilities'
/// array. The probabilities are normalised before tossing the ball so that their total is always equal to 1.0.
/// </summary>
/// <param name="probabilities"></param>
/// <returns></returns>
utils.RouletteWheel.singleThrowArray = function(aProbabilities)
{
    if(typeof aProbabilities === 'number')
        throw new Error("Send Array to singleThrowArray!");
    var pTotal=0;	// Total probability

    //-----
    for(var i=0; i<aProbabilities.length; i++)
        pTotal+= aProbabilities[i];

    //----- Now throw the ball and return an integer indicating the outcome.
    var throwValue = utils.nextDouble() * pTotal;
    var accumulator=0;

    for(var j=0; j< aProbabilities.length; j++)
    {
        accumulator+= aProbabilities[j];

        if(throwValue<=accumulator)
            return j;
    }

    throw "PeannutLib.Maths.singleThrowArray() - invalid outcome.";
};

/// <summary>
/// Similar in functionality to SingleThrow(double[] probabilities). However the 'probabilities' array is
/// not normalised. Therefore if the total goes beyond 1 then we allow extra throws, thus if the total is 10
/// then we perform 10 throws.
/// </summary>
/// <param name="probabilities"></param>
/// <returns></returns>
utils.RouletteWheel.multipleThrows = function(aProbabilities)
{
    var pTotal=0;	// Total probability
    var numberOfThrows;

    //----- Determine how many throws of the ball onto the wheel.
    for(var i=0; i<aProbabilities.length; i++)
        pTotal+=aProbabilities[i];

    // If total probabilty is > 1 then we take this as meaning more than one throw of the ball.
    var pTotalInteger = Math.floor(pTotal);
    var pTotalRemainder = pTotal - pTotalInteger;
    numberOfThrows = Math.floor(pTotalInteger);

    if(utils.nextDouble() <= pTotalRemainder)
        numberOfThrows++;

    //----- Now throw the ball the determined number of times. For each throw store an integer indicating the outcome.
    var outcomes = [];//new int[numberOfThrows];
    for(var a=0; a < numberOfThrows; a++)
        outcomes.push(0);

    for(var i=0; i<numberOfThrows; i++)
    {
        var throwValue = utils.nextDouble() * pTotal;
        var accumulator=0;

        for(var j=0; j<aProbabilities.length; j++)
        {
            accumulator+=aProbabilities[j];

            if(throwValue<=accumulator)
            {
                outcomes[i] = j;
                break;
            }
        }
    }

    return outcomes;
};
utils.RouletteWheel.selectXFromSmallObject = function(x, objects){
    var ixs = [];
    //works with objects with count or arrays with length
    var gCount = objects.count === undefined ? objects.length : objects.count;

    for(var i=0; i<gCount;i++)
        ixs.push(i);

    //how many do we need back? we need x back. So we must remove (# of objects - x) leaving ... x objects
    for(var i=0; i < gCount -x; i++)
    {
        //remove random index
        ixs.splice(utils.next(ixs.length),1);
    }

    return ixs;
};
utils.RouletteWheel.selectXFromLargeObject = function(x, objects)
{
    var ixs = [];
    var guesses = {};
    var gCount = objects.count === undefined ? objects.length : objects.count;

    //we make sure the number of requested objects is less than the object indices
    x = Math.min(x, gCount);

    for(var i=0; i<x; i++)
    {
        var guessIx = utils.next(gCount);
        while(guesses[guessIx])
            guessIx = utils.next(gCount);

        guesses[guessIx] = true;
        ixs.push(guessIx);
    }

    return ixs;
};

});

require.register("optimuslime~cppnjs@master/extras/adaptableAdditions.js", function (exports, module) {
//The purpose of this file is to only extend CPPNs to have additional activation capabilities involving mod connections

var cppnConnection = require("optimuslime~cppnjs@master/networks/cppnConnection.js");
//default all the variables that need to be added to handle adaptable activation
var connectionPrototype = cppnConnection.prototype;
connectionPrototype.a = 0;
connectionPrototype.b = 0;
connectionPrototype.c = 0;
connectionPrototype.d = 0;
connectionPrototype.modConnection = 0;
connectionPrototype.learningRate = 0;


var CPPN = require("optimuslime~cppnjs@master/networks/cppn.js");
//default all the variables that need to be added to handle adaptable activation
var cppnPrototype = CPPN.prototype;

cppnPrototype.a = 0;
cppnPrototype.b = 0;
cppnPrototype.c = 0;
cppnPrototype.d = 0;
cppnPrototype.learningRate = 0;
cppnPrototype.pre = 0;
cppnPrototype.post = 0;

cppnPrototype.adaptable = false;
cppnPrototype.modulatory = false;


/// <summary>
/// This function carries out a single network activation.
/// It is called by all those methods that require network activations.
/// </summary>
/// <param name="maxAllowedSignalDelta">
/// The network is not relaxed as long as the absolute value of the change in signals at any given point is greater than this value.
/// Only positive values are used. If the value is less than or equal to 0, the method will return true without checking for relaxation.
/// </param>
/// <returns>True if the network is relaxed, or false if not.</returns>
cppnPrototype.singleStepInternal = function(maxAllowedSignalDelta)
{
    var isRelaxed = true;	// Assume true.
    var self = this;
    // Calculate each connection's output signal, and add the signals to the target neurons.
    for (var i = 0; i < self.connections.length; i++) {

        if (self.adaptable)
        {
            if (self.connections[i].modConnection <= 0.0)   //Normal connection
            {
                self.neuronSignalsBeingProcessed[self.connections[i].targetIdx] += self.neuronSignals[self.connections[i].sourceIdx] * self.connections[i].weight;
            }
            else //modulatory connection
            {
                self.modSignals[self.connections[i].targetIdx] += self.neuronSignals[self.connections[i].sourceIdx] * self.connections[i].weight;

            }
        }
        else
        {
            self.neuronSignalsBeingProcessed[self.connections[i].targetIdx] += self.neuronSignals[self.connections[i].sourceIdx] * self.connections[i].weight;

        }
    }

    // Pass the signals through the single-valued activation functions.
    // Do not change the values of input neurons or neurons that have no activation function because they are part of a module.
    for (var i = self.totalInputNeuronCount; i < self.neuronSignalsBeingProcessed.length; i++) {
        self.neuronSignalsBeingProcessed[i] = self.activationFunctions[i].calculate(self.neuronSignalsBeingProcessed[i]+self.biasList[i]);
        if (self.modulatory)
        {
            //Make sure it's between 0 and 1
            self.modSignals[i] += 1.0;
            if (self.modSignals[i]!=0.0)
                self.modSignals[i] = utilities.tanh(self.modSignals[i]);//Tanh(modSignals[i]);//(Math.Exp(2 * modSignals[i]) - 1) / (Math.Exp(2 * modSignals[i]) + 1));
        }
    }
    //TODO Modules not supported in this implementation - don't care


    /*foreach (float f in neuronSignals)
     HyperNEATParameters.distOutput.Write(f.ToString("R") + " ");
     HyperNEATParameters.distOutput.WriteLine();
     HyperNEATParameters.distOutput.Flush();*/

    // Move all the neuron signals we changed while processing this network activation into storage.
    if (maxAllowedSignalDelta > 0) {
        for (var i = self.totalInputNeuronCount; i < self.neuronSignalsBeingProcessed.length; i++) {

            // First check whether any location in the network has changed by more than a small amount.
            isRelaxed &= (Math.abs(self.neuronSignals[i] - self.neuronSignalsBeingProcessed[i]) > maxAllowedSignalDelta);

            self.neuronSignals[i] = self.neuronSignalsBeingProcessed[i];
            self.neuronSignalsBeingProcessed[i] = 0.0;
        }
    } else {
        for (var i = self.totalInputNeuronCount; i < self.neuronSignalsBeingProcessed.length; i++) {
            self.neuronSignals[i] = self.neuronSignalsBeingProcessed[i];
            self.neuronSignalsBeingProcessed[i] = 0.0;
        }
    }

    // Console.WriteLine(inputNeuronCount);

    if (self.adaptable)//CPPN != null)
    {
        var coordinates = [0,0,0,0];
        var modValue;
        var weightDelta;
        for (var i = 0; i < self.connections.length; i++)
        {
            if (self.modulatory)
            {
                self.pre = self.neuronSignals[self.connections[i].sourceIdx];
                self.post = self.neuronSignals[self.connections[i].targetIdx];
                modValue = self.modSignals[self.connections[i].targetIdx];

                self.a = self.connections[i].a;
                self.b = self.connections[i].b;
                self.c = self.connections[i].c;
                self.d = self.connections[i].d;

                self.learningRate = self.connections[i].learningRate;
                if (modValue != 0.0 && (self.connections[i].modConnection <= 0.0))        //modulate target neuron if its a normal connection
                {
                    self.connections[i].weight += modValue*self.learningRate * (self.a * self.pre * self.post + self.b * self.pre + self.c * self.post + self.d);
                }

                if (Math.abs(self.connections[i].weight) > 5.0)
                {
                    self.connections[i].weight = 5.0 * Math.sign(self.connections[i].weight);
                }
            }
            else
            {
                self.pre = self.neuronSignals[self.connections[i].sourceIdx];
                self.post = self.neuronSignals[self.connections[i].targetIdx];
                self.a = self.connections[i].a;
                self.b = self.connections[i].b;
                self.c = self.connections[i].c;

                self.learningRate = self.connections[i].learningRate;

                weightDelta = self.learningRate * (self.a * self.pre * self.post + self.b * self.pre + self.c * self.post);
                connections[i].weight += weightDelta;

                //   Console.WriteLine(pre + " " + post + " " + learningRate + " " + A + " " + B + " " + C + " " + weightDelta);

                if (Math.abs(self.connections[i].weight) > 5.0)
                {
                    self.connections[i].weight = 5.0 * Math.sign(self.connections[i].weight);
                }
            }
        }
    }

    for (var i = self.totalInputNeuronCount; i < self.neuronSignalsBeingProcessed.length; i++)
    {
        self.modSignals[i] = 0.0;
    }

    return isRelaxed;

};


cppnPrototype.singleStep = function(finished)
{
    var self = this;
    self.singleStepInternal(0.0); // we will ignore the value of this function, so the "allowedDelta" argument doesn't matter.
    if (finished)
    {
        finished(null);
    }
};

cppnPrototype.multipleSteps = function(numberOfSteps)
{
    var self = this;
    for (var i = 0; i < numberOfSteps; i++) {
        self.singleStep();
    }
};

});

require.register("optimuslime~cppnjs@master/extras/pureCPPNAdditions.js", function (exports, module) {
//The purpose of this file is to only extend CPPNs to have additional activation capabilities involving turning
//cppns into a string!

var CPPN = require("optimuslime~cppnjs@master/networks/cppn.js");

//for convenience, you can require pureCPPNAdditions
module.exports = CPPN;

var CPPNPrototype = CPPN.prototype;

CPPNPrototype.createPureCPPNFunctions = function()
{

    var self = this;

    //create our enclosed object for each node! (this way we actually have subnetworks functions setup too
    self.nEnclosed = new Array(self.neuronSignals.length);

    self.bAlreadyEnclosed = new Array(self.neuronSignals.length);
    self.inEnclosure = new Array(self.neuronSignals.length);

    // Initialize boolean arrays and set the last activation signal, but only if it isn't an input (these have already been set when the input is activated)
    for (var i = 0; i < self.nEnclosed.length; i++)
    {
        // Set as activated if i is an input node, otherwise ensure it is unactivated (false)
        self.bAlreadyEnclosed[i] = (i < self.totalInputNeuronCount) ? true : false;
        self.nEnclosed[i] = (i < self.totalInputNeuronCount ? "x" + i : "");

        self.inEnclosure[i] = false;

    }

    // Get each output node activation recursively
    // NOTE: This is an assumption that genomes have started minimally, and the output nodes lie sequentially after the input nodes
    for (var i = 0; i < self.outputNeuronCount; i++){

//            for (var m = 0; m < self.nEnclosed.length; m++)
//            {
//                // Set as activated if i is an input node, otherwise ensure it is unactivated (false)
//                self.bAlreadyEnclosed[m] = (m < self.totalInputNeuronCount) ? true : false;
//                self.inEnclosure[m] = false;
//            }


        self.nrEncloseNode(self.totalInputNeuronCount + i);

    }

//        console.log(self.nEnclosed);

    //now grab our ordered objects
    var orderedObjects = self.recursiveCountThings();

//        console.log(orderedObjects);

    //now let's build our functions
    var nodeFunctions = {};

    var stringFunctions = {};

    var emptyNodes = {};

    for(var i= self.totalInputNeuronCount; i < self.totalNeuronCount; i++)
    {
        //skip functions that aren't defined
        if(!self.bAlreadyEnclosed[i]){
            emptyNodes[i] = true;
            continue;
        }

        var fnString = "return " + self.nEnclosed[i] + ';';
        nodeFunctions[i] = new Function([], fnString);
        stringFunctions[i] = fnString;
    }

    var inOrderAct = [];
    //go through and grab the indices -- no need for rank and things
    orderedObjects.forEach(function(oNode)
    {
        if(!emptyNodes[oNode.node])
            inOrderAct.push(oNode.node);
    });


    var containedFunction = function(nodesInOrder, functionsForNodes, biasCount, outputCount)
    {
        return function(inputs)
        {
            var bias = 1.0;
            var context = {};
            context.rf = new Array(nodesInOrder.length);
            var totalIn = inputs.length + biasCount;

            for(var i=0; i < biasCount; i++)
                context.rf[i] = bias;

            for(var i=0; i < inputs.length; i++)
                context.rf[i+biasCount] = inputs[i];


            for(var i=0; i < nodesInOrder.length; i++)
            {
                var fIx = nodesInOrder[i];
//                console.log('Ix to hit: ' fIx + );
                context.rf[fIx] = (fIx < totalIn ? context.rf[fIx] : functionsForNodes[fIx].call(context));
            }

            return context.rf.slice(totalIn, totalIn + outputCount);
        }
    };

    //this will return a function that can be run by calling var outputs = functionName(inputs);
    var contained =  containedFunction(inOrderAct, nodeFunctions, self.biasNeuronCount, self.outputNeuronCount);

    return {contained: contained, stringFunctions: stringFunctions, arrayIdentifier: "this.rf", nodeOrder: inOrderAct};


//        console.log(self.nEnclosed[self.totalInputNeuronCount + 0].length);
//        console.log('Enclosed nodes: ');
//        console.log(self.nEnclosed);

//        console.log('Ordered: ');
//        console.log(orderedActivation);

};



CPPNPrototype.nrEncloseNode = function(currentNode)
{
    var self = this;

    // If we've reached an input node we return since the signal is already set

//        console.log('Checking: ' + currentNode);
//        console.log('Total: ');
//        console.log(self.totalInputNeuronCount);


    if (currentNode < self.totalInputNeuronCount)
    {
        self.inEnclosure[currentNode] = false;
        self[currentNode] = 'this.rf[' + currentNode + ']';
        return;
    }
    if (self.bAlreadyEnclosed[currentNode])
    {
        self.inEnclosure[currentNode] = false;
        return;
    }

    // Mark that the node is currently being calculated
    self.inEnclosure[currentNode] = true;

    // Adjacency list in reverse holds incoming connections, go through each one and activate it
    for (var i = 0; i < self.reverseAdjacentList[currentNode].length; i++)
    {
        var crntAdjNode = self.reverseAdjacentList[currentNode][i];

        //{ Region recurrant connection handling - not applicable in our implementation
        // If this node is currently being activated then we have reached a cycle, or recurrant connection. Use the previous activation in this case
        if (self.inEnclosure[crntAdjNode])
        {
            //easy fix, this isn't meant for recurrent networks -- just throw an error!
            throw new Error("Method not built for recurrent networks!");
        }

        // Otherwise proceed as normal
        else
        {

            // Recurse if this neuron has not been activated yet
            if (!self.bAlreadyEnclosed[crntAdjNode])
                self.nrEncloseNode(crntAdjNode);

//                console.log('Next: ');
//                console.log(crntAdjNode);
//                console.log(self.nEnclosed[crntAdjNode]);

            var add = (self.nEnclosed[currentNode] == "" ? "(" : "+");

            //get our weight from adjacency matrix
            var weight = self.adjacentMatrix[crntAdjNode][currentNode];

            //we have a whole number weight!
            if(Math.round(weight) === weight)
                weight = '' + weight + '.0';
            else
                weight = '' + weight;


            // Add it to the new activation
            self.nEnclosed[currentNode] += add + weight + "*" + "this.rf[" + crntAdjNode + "]";

        }
        //} endregion
//            nodeCount++;
    }

    //if we're empty, we're empty! We don't go no where, derrrr
    if(self.nEnclosed[currentNode] === '')
        self.nEnclosed[currentNode] = '0.0';
    else
        self.nEnclosed[currentNode] += ')';

    // Mark this neuron as completed
    self.bAlreadyEnclosed[currentNode] = true;

    // This is no longer being calculated (for cycle detection)
    self.inEnclosure[currentNode] = false;


//        console.log('Enclosed legnth: ' + self.activationFunctions[currentNode].enclose(self.nEnclosed[currentNode]).length);

    self.nEnclosed[currentNode] = self.activationFunctions[currentNode].enclose(self.nEnclosed[currentNode]);

};

CPPNPrototype.recursiveCountThings = function()
{
    var self= this;

    var orderedActivation = {};

    var higherLevelRecurse = function(neuron)
    {
        var inNode = new Array(self.totalNeuronCount);
        var nodeCount = new Array(self.totalNeuronCount);
        var interactCount = new Array(self.totalNeuronCount);

        for(var s=0; s < self.totalNeuronCount; s++) {
            inNode[s] = false;
            nodeCount[s] = 0;
            interactCount[s] = 0;
        }

        var recurseNode = function(currentNode)
        {
            // Mark that the node is currently being calculated
            inNode[currentNode] = true;

            var recurse = {};

            // Adjacency list in reverse holds incoming connections, go through each one and activate it
            for (var i = 0; i < self.reverseAdjacentList[currentNode].length; i++)
            {
                var crntAdjNode = self.reverseAdjacentList[currentNode][i];


                recurse[i] = (nodeCount[crntAdjNode] < nodeCount[currentNode] + 1);

                nodeCount[crntAdjNode] = Math.max(nodeCount[crntAdjNode], nodeCount[currentNode] + 1);

            }
            //all nodes are marked with correct count, let's continue backwards for each one!
            for (var i = 0; i < self.reverseAdjacentList[currentNode].length; i++)
            {
                var crntAdjNode = self.reverseAdjacentList[currentNode][i];

                if(recurse[i])
                // Recurse on it! -- already marked above
                    recurseNode(crntAdjNode);

            }

            //            nodeCount[currentNode] = nodeCount[currentNode] + 1;
            inNode[currentNode] = false;

        };

        recurseNode(neuron);

        return nodeCount;
    };


    var orderedObjects = new Array(self.totalNeuronCount);

    // Get each output node activation recursively
    // NOTE: This is an assumption that genomes have started minimally, and the output nodes lie sequentially after the input nodes
    for (var m = 0; m < self.outputNeuronCount; m++){
        //we have ordered count for this output!

        var olist = higherLevelRecurse(self.totalInputNeuronCount + m);

        var nodeSpecificOrdering  = [];

        for(var n=0; n< olist.length; n++)
        {
            //we take the maximum depending on whether or not it's been seen before
            if(orderedObjects[n])
                orderedObjects[n] = {node: n, rank: Math.max(orderedObjects[n].rank, olist[n])};
            else
                orderedObjects[n] = {node: n, rank: olist[n]};

            nodeSpecificOrdering.push({node: n, rank: olist[n]});
        }

        nodeSpecificOrdering.sort(function(a,b){return b.rank - a.rank;});

        orderedActivation[self.totalInputNeuronCount + m] = nodeSpecificOrdering;
    }


    orderedObjects.sort(function(a,b){return b.rank - a.rank;});
//        console.log(orderedObjects);


    return orderedObjects;

};
});

require.register("optimuslime~cppnjs@master/extras/gpuAdditions.js", function (exports, module) {
//this takes in cppn functions, and outputs a shader....
//radical!
//needs to be tested more! How large can CPPNs get? inputs/outputs/hiddens?
//we'll extend a CPPN to produce a GPU shader
var CPPN = require("optimuslime~cppnjs@master/networks/cppn.js");

var CPPNPrototype = CPPN.prototype;

var cppnToGPU = {};
cppnToGPU.ShaderFragments = {};

cppnToGPU.ShaderFragments.passThroughVariables =
    [
        "uniform float texelWidth;",
        "uniform float texelHeight;"

    ].join('\n');

//simple, doesn't do anything but pass on uv coords to the frag shaders
cppnToGPU.ShaderFragments.passThroughVS =
    [
        cppnToGPU.ShaderFragments.passThroughVariables,
        "varying vec2 passCoord;",

        "void main()	{",
        "passCoord = uv;",
        "gl_Position = vec4( position, 1.0 );",
        "}",
        "\n"
    ].join('\n');

cppnToGPU.ShaderFragments.passThroughVS3x3 =
    [
        cppnToGPU.ShaderFragments.passThroughVariables,
        "varying vec2 sampleCoords[9];",

        "void main()	{",

        "gl_Position = vec4( position, 1.0 );",

        "vec2 widthStep = vec2(texelWidth, 0.0);",
        "vec2 heightStep = vec2(0.0, texelHeight);",
        "vec2 widthHeightStep = vec2(texelWidth, texelHeight);",
        "vec2 widthNegativeHeightStep = vec2(texelWidth, -texelHeight);",

        "vec2 inputTextureCoordinate = uv;",

        "sampleCoords[0] = inputTextureCoordinate.xy;",
        "sampleCoords[1] = inputTextureCoordinate.xy - widthStep;",
        "sampleCoords[2] = inputTextureCoordinate.xy + widthStep;",

        "sampleCoords[3] = inputTextureCoordinate.xy - heightStep;",
        "sampleCoords[4] = inputTextureCoordinate.xy - widthHeightStep;",
        "sampleCoords[5] = inputTextureCoordinate.xy + widthNegativeHeightStep;",

        "sampleCoords[6] = inputTextureCoordinate.xy + heightStep;",
        "sampleCoords[7] = inputTextureCoordinate.xy - widthNegativeHeightStep;",
        "sampleCoords[8] = inputTextureCoordinate.xy + widthHeightStep;",

        "}",
        "\n"
    ].join('\n');


cppnToGPU.ShaderFragments.variables =
    [
        "varying vec2 passCoord; ",
        "uniform sampler2D inputTexture; "
    ].join('\n');

cppnToGPU.ShaderFragments.variables3x3 =
    [
        "varying vec2 sampleCoords[9];",
        "uniform sampler2D inputTexture; "
    ].join('\n');


//this is a generic conversion from cppn to shader
//Extends the CPPN object to have fullShaderFromCPPN function (and a callback to add any extras)
//the extras will actually dictate how the final output is created and used
CPPNPrototype.fullShaderFromCPPN = function(specificAddFunction)
{
    var cppn = this;

//        console.log('Decoded!');
//        console.log('Start enclose :)');
    var functionObject = cppn.createPureCPPNFunctions();
//        console.log('End enclose!');
    //functionobject of the form
//        {contained: contained, stringFunctions: stringFunctions, arrayIdentifier: "this.rf", nodeOrder: inOrderAct};

    var multiInput = cppn.inputNeuronCount >= 27;


    var totalNeurons = cppn.totalNeuronCount;

    var inorderString = "";

    var lastIx = functionObject.nodeOrder[totalNeurons-1];
    functionObject.nodeOrder.forEach(function(ix)
    {
        inorderString += ix +  (ix !== lastIx ? "," : "");
    });

    var defaultVariables = multiInput ? cppnToGPU.ShaderFragments.variables3x3 : cppnToGPU.ShaderFragments.variables;

    //create a float array the size of the neurons
//        var fixedArrayDec = "int order[" + totalNeurons + "](" + inorderString + ");";
    var arrayDeclaration = "float register[" + totalNeurons + "];";


    var beforeFunctionIx = "void f";
    var functionWrap = "(){";

    var postFunctionWrap = "}";

    var repString = functionObject.arrayIdentifier;
    var fns = functionObject.stringFunctions;
    var wrappedFunctions = [];
    for(var key in fns)
    {
        if(key < cppn.totalInputNeuronCount)
            continue;

        //do this as 3 separate lines
        var wrap = beforeFunctionIx + key + functionWrap;
        wrappedFunctions.push(wrap);
        var setRegister = "register[" + key + "] = ";

        var repFn =  fns[key].replace(new RegExp(repString, 'g'), "register");
        //remove all Math. references -- e.g. Math.sin == sin in gpu code
        repFn = repFn.replace(new RegExp("Math.", 'g'), "");
        //we don't want a return function, fs are void
        repFn = repFn.replace(new RegExp("return ", 'g'), "");
        //anytime you see a +-, this actually means -
        //same goes for -- this is a +
        repFn = repFn.replace(new RegExp("\\+\\-", 'g'), "-");
        repFn = repFn.replace(new RegExp("\\-\\-", 'g'), "+");

        wrappedFunctions.push(setRegister + repFn);
        wrappedFunctions.push(postFunctionWrap);
    }

    var activation = [];

    var actBefore, additionalParameters;

    if(cppn.outputNeuronCount == 1)
    {
        actBefore = "float";
        additionalParameters = "";
    }
    else
    {
//            actBefore = "float[" + ng.outputNodeCount + "]";
        actBefore = "void";
        additionalParameters = ", out float[" + cppn.outputNeuronCount + "] outputs";
    }

    actBefore += " activate(float[" +cppn.inputNeuronCount + "] fnInputs" + additionalParameters+ "){";
    activation.push(actBefore);

    var bCount = cppn.biasNeuronCount;

    for(var i=0; i < bCount; i++)
    {
        activation.push('register[' + i + '] = 1.0;');
    }
    for(var i=0; i < cppn.inputNeuronCount; i++)
    {
        activation.push('register[' + (i + bCount) + '] = fnInputs[' + i + '];');
    }

    functionObject.nodeOrder.forEach(function(ix)
    {
        if(ix >= cppn.totalInputNeuronCount)
            activation.push("f"+ix +"();");
    });

    var outputs;

    //if you're just one output, return a simple float
    //otherwise, you need to return an array
    if(cppn.outputNeuronCount == 1)
    {
        outputs = "return register[" + cppn.totalInputNeuronCount + "];";
    }
    else
    {
        var multiOut = [];

//            multiOut.push("float o[" + ng.outputNodeCount + "];");
        for(var i=0; i < cppn.outputNeuronCount; i++)
            multiOut.push("outputs[" + i + "] = register[" + (i + cppn.totalInputNeuronCount) + "];");
//            multiOut.push("return o;");

        outputs = multiOut.join('\n');
    }

    activation.push(outputs);
    activation.push("}");

    var additional = specificAddFunction(cppn);


    return {vertex: multiInput ?
        cppnToGPU.ShaderFragments.passThroughVS3x3 :
        cppnToGPU.ShaderFragments.passThroughVS,
        fragment: [defaultVariables,arrayDeclaration].concat(wrappedFunctions).concat(activation).concat(additional).join('\n')};

};


});

require.modules["optimuslime-cppnjs"] = require.modules["optimuslime~cppnjs@master"];
require.modules["optimuslime~cppnjs"] = require.modules["optimuslime~cppnjs@master"];
require.modules["cppnjs"] = require.modules["optimuslime~cppnjs@master"];


require.register("optimuslime~neatjs@master", function (exports, module) {
var neatjs = {};

//export the cppn library
module.exports = neatjs;

//nodes and connections!
neatjs.neatNode = require("optimuslime~neatjs@master/genome/neatNode.js");
neatjs.neatConnection = require("optimuslime~neatjs@master/genome/neatConnection.js");
neatjs.neatGenome = require("optimuslime~neatjs@master/genome/neatGenome.js");

//all the activations your heart could ever hope for
neatjs.iec = require("optimuslime~neatjs@master/evolution/iec.js");
neatjs.multiobjective = require("optimuslime~neatjs@master/evolution/multiobjective.js");
neatjs.novelty = require("optimuslime~neatjs@master/evolution/novelty.js");

//neatHelp
neatjs.neatDecoder = require("optimuslime~neatjs@master/neatHelp/neatDecoder.js");
neatjs.neatHelp = require("optimuslime~neatjs@master/neatHelp/neatHelp.js");
neatjs.neatParameters = require("optimuslime~neatjs@master/neatHelp/neatParameters.js");

//and the utilities to round it out!
neatjs.genomeSharpToJS = require("optimuslime~neatjs@master/utility/genomeSharpToJS.js");

//exporting the node type
neatjs.NodeType = require("optimuslime~neatjs@master/types/nodeType.js");



});

require.register("optimuslime~neatjs@master/evolution/iec.js", function (exports, module) {
/**
 * Module dependencies.
 */

var NeatGenome = require("optimuslime~neatjs@master/genome/neatGenome.js");

//pull in variables from cppnjs
var cppnjs = require("optimuslime~cppnjs@master");
var utilities =  cppnjs.utilities;

/**
 * Expose `iec objects`.
 */
module.exports = GenericIEC;

//seeds are required -- and are expected to be the correct neatGenome types
function GenericIEC(np, seeds, iecOptions)
{
    var self = this;

    self.options = iecOptions || {};
    self.np = np;

    //we keep track of new nodes and connections for the session
    self.newNodes = {};
    self.newConnections = {};

    //we can send in a seed genome -- to create generic objects when necessary
    self.seeds = seeds;

    for(var s=0; s < seeds.length; s++)
    {
        var seed = seeds[s];
        for(var c =0; c < seed.connections.length; c++)
        {
            var sConn = seed.connections[c];
            var cid = '(' + sConn.sourceID + ',' + sConn.targetID + ')';
            self.newConnections[cid] = sConn;
        }
    }

    self.cloneSeed = function(){

        var seedIx = utilities.next(self.seeds.length);

        var seedCopy = NeatGenome.Copy(self.seeds[seedIx]);
        if(self.options.seedMutationCount)
        {
            for(var i=0; i < self.options.seedMutationCount; i++)
                seedCopy.mutate(self.newNodes, self.newConnections, self.np);
        }
        return seedCopy;
    };

    self.markParentConnections = function(parents){

        for(var s=0; s < parents.length; s++)
        {
            var parent = parents[s];
            for(var c =0; c < parent.connections.length; c++)
            {
                var sConn = parent.connections[c];
                var cid = '(' + sConn.sourceID + ',' + sConn.targetID + ')';
                self.newConnections[cid] = sConn;
            }
        }

    };


        //this function handles creating a genotype from sent in parents.
    //it's pretty simple -- however many parents you have, select a random number of them, and attempt to mate them
    self.createNextGenome = function(parents)
    {
        self.markParentConnections(parents);
        //IF we have 0 parents, we create a genome with the default configurations
        var ng;
        var initialMutationCount = self.options.initialMutationCount || 0,
            postXOMutationCount = self.options.postMutationCount || 0;

        var responsibleParents = [];

        switch(parents.length)
        {
            case 0:

                //parents are empty -- start from scratch!
                ng = self.cloneSeed();

                for(var m=0; m < initialMutationCount; m++)
                    ng.mutate(self.newNodes, self.newConnections, self.np);

                //no responsible parents

                break;
            case 1:

                //we have one parent
                //asexual reproduction
                ng = parents[0].createOffspringAsexual(self.newNodes, self.newConnections, self.np);

                //parent at index 0 responsible
                responsibleParents.push(0);

                for(var m=0; m < postXOMutationCount; m++)
                    ng.mutate(self.newNodes, self.newConnections, self.np);

                break;
            default:
                //greater than 1 individual as a possible parent

                //at least 1 parent, and at most self.activeParents.count # of parents
                var parentCount = 1 + utilities.next(parents.length);

                if(parentCount == 1)
                {
                    //select a single parent for offspring
                    var rIx = utilities.next(parents.length);

                    ng = parents[rIx].createOffspringAsexual(self.newNodes, self.newConnections, self.np);
                    //1 responsible parent at index 0
                    responsibleParents.push(rIx);
                    break;
                }

                //we expect active parents to be small, so we grab parentCount number of parents from a small array of parents
                var parentIxs = utilities.RouletteWheel.selectXFromSmallObject(parentCount, parents);

                var p1 = parents[parentIxs[0]], p2;
                //if I have 3 parents, go in order composing the objects

                responsibleParents.push(parentIxs[0]);

                //p1 mates with p2 to create o1, o1 mates with p3, to make o2 -- p1,p2,p3 are all combined now inside of o2
                for(var i=1; i < parentIxs.length; i++)
                {
                    p2 = parents[parentIxs[i]];
                    ng = p1.createOffspringSexual(p2, self.np);
                    p1 = ng;
                    responsibleParents.push(parentIxs[i]);
                }

                for(var m=0; m < postXOMutationCount; m++)
                    ng.mutate(self.newNodes, self.newConnections, self.np);


                break;
        }

        //we have our genome, let's send it back

        //the reason we don't end it inisde the switch loop is that later, we might be interested in saving this genome from some other purpose
        return {offspring: ng, parents: responsibleParents};
    };

};


});

require.register("optimuslime~neatjs@master/evolution/multiobjective.js", function (exports, module) {
//here we have everything for NSGA-II mutliobjective search and neatjs
/**
 * Module dependencies.
 */

var NeatGenome = require("optimuslime~neatjs@master/genome/neatGenome.js");
var Novelty = require("optimuslime~neatjs@master/evolution/novelty.js");


//pull in variables from cppnjs
var cppnjs = require("optimuslime~cppnjs@master");
var utilities =  cppnjs.utilities;


/**
 * Expose `MultiobjectiveSearch`.
 */

module.exports = MultiobjectiveSearch;


//information to rank each genome
MultiobjectiveSearch.RankInfo = function()
{
    var self = this;
    //when iterating, we count how many genomes dominate other genomes
    self.dominationCount = 0;
    //who does this genome dominate
    self.dominates = [];
    //what is this genome's rank (i.e. what pareto front is it on)
    self.rank = 0;
    //has this genome been ranked
    self.ranked = false;
};
MultiobjectiveSearch.RankInfo.prototype.reset = function(){

    var self = this;
    self.rank = 0;
    self.ranked = false;
    self.dominationCount = 0;
    self.dominates = [];
};

MultiobjectiveSearch.Help = {};

MultiobjectiveSearch.Help.SortPopulation = function(pop)
{
    //sort genomes by fitness / age -- as genomes are often sorted
    pop.sort(function(x,y){

        var fitnessDelta = y.fitness - x.fitness;
        if (fitnessDelta < 0.0)
            return -1;
        else if (fitnessDelta > 0.0)
            return 1;

        var ageDelta = x.age - y.age;

        // Convert result to an int.
        if (ageDelta < 0)
            return -1;
        else if (ageDelta > 0)
            return 1;

        return 0;

    });
};

//class to assign multiobjective fitness to individuals (fitness based on what pareto front they are on)
MultiobjectiveSearch.multiobjectiveUtilities = function(np)
{

    var self = this;

    self.np = np;
    self.population = [];
    self.populationIDs = {};
    self.ranks = [];
    self.nov = new Novelty(10.0);
    self.doNovelty = false;
    self.generation = 0;

    self.localCompetition = false;

    self.measureNovelty = function()
    {
        var count = self.population.length;

        self.nov.initialize(self.population);

        //reset locality and competition for each genome
        for(var i=0; i < count; i++)
        {
            var genome = self.population[i];

            genome.locality=0.0;
            genome.competition=0.0;

            //we measure all objectives locally -- just to make it simpler
            for(var o=0; o < genome.objectives.length; o++)
                genome.localObjectivesCompetition[o] = 0.0;
        }

       var ng;
        var max = 0.0, min = 100000000000.0;

        for (var i = 0; i< count; i++)
        {
            ng = self.population[i];
            var fit = self.nov.measureNovelty(ng);

            //reset our fitness value to be local, yeah boyee
            //the first objective is fitness which is replaced with local fitness -- how many did you beat around you
            // # won / total number of neighbors = % competitive
            ng.objectives[0] = ng.competition / ng.nearestNeighbors;
            ng.objectives[ng.objectives.length - 2] = fit + 0.01;

            //the last local measure is the genome novelty measure
            var localGenomeNovelty = ng.localObjectivesCompetition[ng.objectives.length-1];

            //genomic novelty is measured locally as well
            console.log("Genomic Novelty: " + ng.objectives[ng.objectives.length - 1] + " After: " + localGenomeNovelty / ng.nearestNeighbors);

            //this makes genomic novelty into a local measure
            ng.objectives[ng.objectives.length - 1] = localGenomeNovelty / ng.nearestNeighbors;

            if(fit>max) max=fit;
            if(fit<min) min=fit;

        }

        console.log("nov min: "+ min + " max:" + max);
    };

    //if genome x dominates y, increment y's dominated count, add y to x's dominated list
    self.updateDomination = function( x,  y,  r1, r2)
    {
        if(self.dominates(x,y)) {
            r1.dominates.push(r2);
            r2.dominationCount++;
        }
    };


    //function to check whether genome x dominates genome y, usually defined as being no worse on all
    //objectives, and better at at least one
    self.dominates = function( x,  y) {
        var better=false;
        var objx = x.objectives, objy = y.objectives;

        var sz = objx.length;

        //if x is ever worse than y, it cannot dominate y
        //also check if x is better on at least one
        for(var i=0;i<sz-1;i++) {
            if(objx[i]<objy[i]) return false;
            if(objx[i]>objy[i]) better=true;
        }

        //genomic novelty check, disabled for now
        //threshold set to 0 -- Paul since genome is local
        var thresh=0.0;
        if((objx[sz-1]+thresh)<(objy[sz-1])) return false;
        if((objx[sz-1]>(objy[sz-1]+thresh))) better=true;

        return better;
    };

    //distance function between two lists of objectives, used to see if two individuals are unique
    self.distance = function(x, y) {
        var delta=0.0;
        var len = x.length;
        for(var i=0;i<len;i++) {
            var d=x[i]-y[i];
            delta+=d*d;
        }
        return delta;
    };


    //Todo: Print to file
    self.printDistribution = function()
    {
        var filename="dist"+    self.generation+".txt";
        var content="";

        console.log("Print to file disabled for now, todo: write in save to file!");
//            XmlDocument archiveout = new XmlDocument();
//            XmlPopulationWriter.WriteGenomeList(archiveout, population);
//            archiveout.Save(filename);
    };

    //currently not used, calculates genomic novelty objective for protecting innovation
    //uses a rough characterization of topology, i.e. number of connections in the genome
    self.calculateGenomicNovelty = function() {
        var sum=0.0;
        var max_conn = 0;

        var xx, yy;

        for(var g=0; g < self.population.length; g++) {
            xx = self.population[g];
            var minDist=10000000.0;

            var difference=0.0;
            var delta=0.0;
            //double array
            var distances= [];

            if(xx.connections.length > max_conn)
                max_conn = xx.connections.length;

            //int ccount=xx.ConnectionGeneList.Count;
            for(var g2=0; g2 < self.population.length; g2++) {
                yy = self.population[g2];
                if(g==g2)
                    continue;

                //measure genomic compatability using neatparams
                var d = xx.compat(yy, np);
                //if(d<minDist)
                //	minDist=d;

                distances.push(d);
            }
            //ascending order
            //want the closest individuals
            distances.Sort(function(a,b) {return a-b;});

            //grab the 10 closest distances
            var sz=Math.min(distances.length,10);

            var diversity = 0.0;

            for(var i=0;i<sz;i++)
                diversity+=distances[i];

            xx.objectives[xx.objectives.length-1] = diversity;
            sum += diversity;
        }
        console.log("Diversity: " + sum/population.length + " " + max_conn);
    };



    //add an existing population from hypersharpNEAT to the multiobjective population maintained in
    //this class, step taken before evaluating multiobjective population through the rank function
    self.addPopulation = function(genomes)
    {

        for(var i=0;i< genomes.length;i++)
        {
            var blacklist=false;

            //TODO: I'm not sure this is correct, since genomes coming in aren't measured locally yet
            //so in some sense, we're comparing local measures to global measures and seeing how far
            //if they are accidentally close, this could be bad news
//                for(var j=0;j<self.population.length; j++)
//                {
//                    if(self.distance(genomes[i].behavior.objectives, self.population[j].objectives) < 0.01)
//                        blacklist=true;  //reject a genome if it is very similar to existing genomes in pop
//                }
            //no duplicates please
            if(self.populationIDs[genomes[i].gid])
                blacklist = true;

            //TODO: Test if copies are needed, or not?
            if(!blacklist) {
                //add genome if it is unique
                //we might not need to make copies
                //this will make a copy of the behavior
//                    var copy = new neatGenome.NeatGenome.Copy(genomes[i], genomes[i].gid);
//                    self.population.push(copy);

                //push directly into population, don't use copy -- should test if this is a good idea?
                self.population.push(genomes[i]);
                self.populationIDs[genomes[i].gid] = genomes[i];

            }

        }

    };



    self.rankGenomes = function()
    {
        var size = self.population.length;

        self.calculateGenomicNovelty();
        if(self.doNovelty) {
            self.measureNovelty();
        }

        //reset rank information
        for(var i=0;i<size;i++) {
            if(self.ranks.length<i+1)
                self.ranks.push(new MultiobjectiveSearch.RankInfo());
            else
                self.ranks[i].reset();
        }
        //calculate domination by testing each genome against every other genome
        for(var i=0;i<size;i++) {
            for(var j=0;j<size;j++) {
                self.updateDomination(self.population[i], self.population[j],self.ranks[i],self.ranks[j]);
            }
        }

        //successively peel off non-dominated fronts (e.g. those genomes no longer dominated by any in
        //the remaining population)
        var front = [];
        var ranked_count=0;
        var current_rank=1;
        while(ranked_count < size) {
            //search for non-dominated front
            for(var i=0;i<size;i++)
            {
                //continue if already ranked
                if(self.ranks[i].ranked) continue;
                //if not dominated, add to front
                if(self.ranks[i].dominationCount==0) {
                    front.push(i);
                    self.ranks[i].ranked=true;
                    self.ranks[i].rank = current_rank;
                }
            }

            var front_size = front.length;
            console.log("Front " + current_rank + " size: " + front_size);

            //now take all the non-dominated individuals, see who they dominated, and decrease
            //those genomes' domination counts, because we are removing this front from consideration
            //to find the next front of individuals non-dominated by the remaining individuals in
            //the population
            for(var i=0;i<front_size;i++) {
                var r = self.ranks[front[i]];
                for (var dominated in r.dominates) {
                    dominated.dominationCount--;
                }
            }

            ranked_count+=front_size;
            front = [];
            current_rank++;
        }

        //we save the last objective for potential use as genomic novelty objective
        var last_obj = self.population[0].objectives.length-1;

        //fitness = popsize-rank (better way might be maxranks+1-rank), but doesn't matter
        //because speciation is not used and tournament selection is employed
        for(var i=0;i<size;i++) {
            self.population[i].fitness = (size+1)-self.ranks[i].rank;//+population[i].objectives[last_obj]/100000.0;
    }

        //sorting based on fitness
        MultiobjectiveSearch.Help.SortPopulation(self.population);

        self.generation++;

        if(self.generation%250==0)
            self.printDistribution();
    };

    //when we merge populations together, often the population will overflow, and we need to cut
    //it down. to do so, we just remove the last x individuals, which will be in the less significant
    //pareto fronts
    self.truncatePopulation = function(size)
    {
        var toRemove = self.population.length - size;
        console.log("population size before: " + self.population.length);
        console.log("removing " + toRemove);

        //remove the tail after sorting
        if(toRemove > 0)
            self.population.splice(size, toRemove);

        //changes to population, make sure to update our lookup
        self.populationIDs = NeatGenome.Help.CreateGIDLookup(self.population);

        console.log("population size after: " + self.population.length);

        return self.population;
    };

};

function MultiobjectiveSearch(seedGenomes, genomeEvaluationFunctions, neatParameters, searchParameters)
{
    var self=this;

    //functions for evaluating genomes in a population
    self.genomeEvaluationFunctions = genomeEvaluationFunctions;

    self.generation = 0;
    self.np = neatParameters;
    self.searchParameters = searchParameters;

    //for now, we just set seed genomes as population
    //in reality, we should use seed genomes as seeds into population determined by search parameters
    //i.e. 5 seed genomes -> 50 population size
    //TODO: Turn seed genomes into full first population
    self.population = seedGenomes;

    //create genome lookup once we have population
    self.populationIDs = NeatGenome.Help.CreateGIDLookup(seedGenomes);


    //see end of multiobjective search declaration for initailization code
    self.multiobjective= new MultiobjectiveSearch.multiobjectiveUtilities(neatParameters);
    self.np.compatibilityThreshold = 100000000.0; //disable speciation w/ multiobjective

    self.initializePopulation = function()
    {
        // The GenomeFactories normally won't bother to ensure that like connections have the same ID
        // throughout the population (because it's not very easy to do in most cases). Therefore just
        // run this routine to search for like connections and ensure they have the same ID.
        // Note. This could also be done periodically as part of the search, remember though that like
        // connections occuring within a generation are already fixed - using a more efficient scheme.
        self.matchConnectionIDs();

        // Evaluate the whole population.
        self.evaluatePopulation();

        //TODO: Add in some concept of speciation for NSGA algorithm -- other than genomic novelty?
        //We don't do speciation for NSGA-II algorithm

        // Now we have fitness scores and no speciated population we can calculate fitness stats for the
        // population as a whole -- and save best genomes
        //recall that speciation is NOT part of NSGA-II
        self.updateFitnessStats();

    };

    self.matchConnectionIDs = function()
    {
        var connectionIdTable = {};

        var genomeBound = self.population.length;
        for(var genomeIdx=0; genomeIdx<genomeBound; genomeIdx++)
        {
            var genome = self.population[genomeIdx];

            //loop through all the connections for this genome
            var connectionGeneBound = genome.connections.length;
            for(var connectionGeneIdx=0; connectionGeneIdx<connectionGeneBound; connectionGeneIdx++)
            {
                var connectionGene = genome.connections[connectionGeneIdx];

                var ces = connectionGene.sourceID + "," + connectionGene.targetID;

                var existingID = connectionIdTable[ces];

                if(existingID==null)
                {	// No connection withthe same end-points has been registered yet, so
                    // add it to the table.
                    connectionIdTable[ces] = connectionGene.gid;
                }
                else
                {	// This connection is already registered. Give our latest connection
                    // the same innovation ID as the one in the table.
                    connectionGene.gid = existingID;
                }
            }
            // The connection genes in this genome may now be out of order. Therefore we must ensure
            // they are sorted before we continue.
            genome.connections.sort(function(a,b){
               return a.gid - b.gid;
            });
        }
    };

    self.incrementAges = function()
    {
        //would normally increment species age as  well, but doesn't happen in multiobjective
        for(var i=0; i < self.population.length; i++)
        {
            var ng = self.population[i];
            ng.age++;
        }
    };
    self.updateFitnessStats = function()
    {
        self.bestFitness = Number.MIN_VALUE;
        self.bestGenome = null;
        self.totalNeuronCount = 0;
        self.totalConnectionCount = 0;
        self.totalFitness = 0;
        self.avgComplexity = 0;
        self.meanFitness =0;

        //go through the genomes, find the best genome and the most fit
        for(var i=0; i < self.population.length; i++)
        {
            var ng = self.population[i];
            if(ng.realFitness > self.bestFitness)
            {
                self.bestFitness = ng.realFitness;
                self.bestGenome = ng;
            }
            self.totalNeuronCount += ng.nodes.length;
            self.totalConnectionCount += ng.connections.length;
            self.totalFitness += ng.realFitness;
        }

        self.avgComplexity = (self.totalNeuronCount + self.totalConnectionCount)/self.population.length;
        self.meanFitness = self.totalFitness/self.population.length;

    };

    self.tournamentSelect = function(genomes)
    {
        var bestFound= 0.0;
        var bestGenome=null;
        var bound = genomes.length;

        //grab the best of 4 by default, can be more attempts than that
        for(var i=0;i<self.np.tournamentSize;i++) {
            var next= genomes[utilities.next(bound)];
            if (next.fitness > bestFound) {
                bestFound=next.fitness;
                bestGenome=next;
            }
        }

        return bestGenome;
    };


    self.evaluatePopulation= function()
    {
        //for each genome, we need to check if we should evaluate the individual, and then evaluate the individual

        //default everyone is evaluated
        var shouldEvaluate = self.genomeEvaluationFunctions.shouldEvaluateGenome || function(){return true;};
        var defaultFitness = self.genomeEvaluationFunctions.defaultFitness || 0.0001;

        if(!self.genomeEvaluationFunctions.evaluateGenome)
            throw new Error("No evaluation function defined, how are you supposed to run evolution?");

        var evaluateGenome = self.genomeEvaluationFunctions.evaluateGenome;

        for(var i=0; i < self.population.length; i++)
        {
            var ng = self.population[i];

            var fit = defaultFitness;

            if(shouldEvaluate(ng))
            {
                fit = evaluateGenome(ng, self.np);
            }

            ng.fitness = fit;
            ng.realFitness = fit;
        }

    };

    self.performOneGeneration = function()
    {
        //No speciation in multiobjective
        //therefore no species to check for removal

        //----- Stage 1. Create offspring / cull old genomes / add offspring to population.
        var regenerate = false;

        self.multiobjective.addPopulation(self.population);
        self.multiobjective.rankGenomes();


        //cut the population down to the desired size
        self.multiobjective.truncatePopulation(self.population.length);
        //no speciation necessary

        //here we can decide if we want to save to WIN

        self.updateFitnessStats();

        if(!regenerate)
        {
            self.createOffSpring();

            //we need to trim population to the elite count, then replace
            //however, this doesn't affect the multiobjective population -- just the population held in search at the time
            MultiobjectiveSearch.Help.SortPopulation(self.population);
            var eliteCount = Math.floor(self.np.elitismProportion*self.population.length);

            //remove everything but the most elite!
            self.population.splice(eliteCount, self.population.length - eliteCount);

            // Add offspring to the population.
            var genomeBound = self.offspringList.length;
            for(var genomeIdx=0; genomeIdx<genomeBound; genomeIdx++)
                self.population.push(self.offspringList[genomeIdx]);
        }

        //----- Stage 2. Evaluate genomes / Update stats.
        self.evaluatePopulation();
        self.updateFitnessStats();

        self.incrementAges();
        self.generation++;

    };


    self.createOffSpring = function()
    {
        self.offspringList = [];

        // Create a new lists so that we can track which connections/neurons have been added during this routine.
        self.newConnectionTable = [];
        self.newNodeTable = [];

        //now create chunk of offspring asexually
        self.createMultipleOffSpring_Asexual();
        //then the rest sexually
        self.createMultipleOffSpring_Sexual();
    };
    self.createMultipleOffSpring_Asexual = function()
    {
        //function for testing if offspring is valid
        var validOffspring = self.genomeEvaluationFunctions.isValidOffspring || function() {return true;};
        var attemptValid = self.genomeEvaluationFunctions.validOffspringAttempts || 5;

        var eliteCount = Math.floor(self.np.elitismProportion*self.population.length);


        //how many asexual offspring? Well, the proportion of asexual * total number of desired new individuals
        var offspringCount = Math.max(1, Math.round((self.population.length - eliteCount)*self.np.pOffspringAsexual));

        // Add offspring to a seperate genomeList. We will add the offspring later to prevent corruption of the enumeration loop.
        for(var i=0; i<offspringCount; i++)
        {
            var parent=null;

            //tournament select in multiobjective search
            parent = self.tournamentSelect(self.population);

            var offspring = parent.createOffspringAsexual(self.newNodeTable, self.newConnectionTable, self.np);
            var testCount = 0, maxTests = attemptValid;

            //if we have a valid genotype test function, it should be used for generating this individual!
            while (!validOffspring(offspring, self.np) && testCount++ < maxTests)
                offspring = parent.createOffspringAsexual(self.newNodeTable, self.newConnectionTable, self.np);

            //we have a valid offspring, send it away!
            self.offspringList.push(offspring);
        }
    };

    self.createMultipleOffSpring_Sexual = function()
    {
        //function for testing if offspring is valid
        var validOffspring = self.genomeEvaluationFunctions.isValidOffspring || function() {return true;};
        var attemptValid = self.genomeEvaluationFunctions.validOffspringAttempts || 5;

        var oneMember=false;
        var twoMembers=false;

        if(self.population.length == 1)
        {
            // We can't perform sexual reproduction. To give the species a fair chance we call the asexual routine instead.
            // This keeps the proportions of genomes per species steady.
            oneMember = true;
        }
        else if(self.population.length==2)
            twoMembers = true;

        // Determine how many sexual offspring to create.
        var eliteCount = Math.floor(self.np.elitismProportion*self.population.length);

        //how many sexual offspring? Well, the proportion of sexual * total number of desired new individuals
        var matingCount = Math.round((self.population.length - eliteCount)*self.np.pOffspringSexual);

        for(var i=0; i<matingCount; i++)
        {
            var parent1;
            var parent2=null;
            var offspring;

            if(utilities.nextDouble() < self.np.pInterspeciesMating)
            {	// Inter-species mating!
                //System.Diagnostics.Debug.WriteLine("Inter-species mating!");
                if(oneMember)
                    parent1 = self.population[0];
                else  {
                    //tournament select in multiobjective search
                    parent1 = self.tournamentSelect(self.population);
                }

                // Select the 2nd parent from the whole popualtion (there is a chance that this will be an genome
                // from this species, but that's OK).
                var j=0;
                do
                {
                    parent2  = self.tournamentSelect(self.population);
                }

                while(parent1==parent2 && j++ < 4);	// Slightly wasteful but not too bad. Limited by j.
            }
            else
            {	// Mating within the current species.
                //System.Diagnostics.Debug.WriteLine("Mating within the current species.");
                if(oneMember)
                {	// Use asexual reproduction instead.
                    offspring = self.population[0].createOffspringAsexual(self.newNodeTable, self.newConnectionTable, self.np);

                    var testCount = 0; var maxTests = attemptValid;
                    //if we have an assess function, it should be used for generating this individual!
                    while (!validOffspring(offspring) && testCount++ < maxTests)
                        offspring = self.population[0].createOffspringAsexual(self.newNodeTable, self.newConnectionTable, self.np);

                    self.offspringList.push(offspring);
                    continue;
                }

                if(twoMembers)
                {
                    offspring = self.population[0].createOffspringSexual(self.population[1], self.np);

                    var testCount = 0; var maxTests = attemptValid;

                    //if we have an assess function, it should be used for generating this individual!
                    while (!validOffspring(offspring) && testCount++ < maxTests)
                        offspring = self.population[0].createOffspringSexual(self.population[1], self.np);

                    self.offspringList.push(offspring);
                    continue;
                }

                parent1 = self.tournamentSelect(self.population);

                var j=0;
                do
                {
                    parent2 = self.tournamentSelect(self.population);
                }
                while(parent1==parent2 && j++ < 4);	// Slightly wasteful but not too bad. Limited by j.
            }

            if(parent1 != parent2)
            {
                offspring = parent1.createOffspringSexual(parent2, self.np);

                var testCount = 0; var maxTests = attemptValid;
                //if we have an assess function, it should be used for generating this individual!
                while (!validOffspring(offspring) && testCount++ < maxTests)
                    offspring = parent1.createOffspringSexual(parent2, self.np);

                self.offspringList.push(offspring);
            }
            else
            {	// No mating pair could be found. Fallback to asexual reproduction to keep the population size constant.
                offspring = parent1.createOffspringAsexual(self.newNodeTable, self.newConnectionTable,self.np);

                var testCount = 0; var maxTests = attemptValid;
                //if we have an assess function, it should be used for generating this individual!
                while (!validOffspring(offspring) && testCount++ < maxTests)
                    offspring = parent1.createOffspringAsexual(self.newNodeTable, self.newConnectionTable,self.np);

                self.offspringList.push(offspring);
            }
        }

    };



    //finishing initalizatgion of object
    self.initializePopulation();


}

});

require.register("optimuslime~neatjs@master/evolution/novelty.js", function (exports, module) {
/**
 * Module dependencies.
 */

var NeatGenome = require("optimuslime~neatjs@master/genome/neatGenome.js");
var utilities =  require("optimuslime~cppnjs@master").utilities;

/**
 * Expose `NeatNode`.
 */

module.exports = Novelty;

/**
 * Initialize a new NeatNode.
 *
 * @param {Number} threshold
 * @api public
 */
function Novelty(threshold)
{
    var self = this;

    self.nearestNeighbors = 20;
    self.initialized = false;
    self.archiveThreshold = threshold;
    self.measureAgainst = [];
    self.archive = [];
    self.pendingAddition = [];

    self.maxDistSeen = Number.MIN_VALUE;
}


Novelty.Behavior = function()
{
    var self =this;
    self.behaviorList = null;
    self.objectives = null;
};

Novelty.Behavior.BehaviorCopy = function(copyFrom)
{
    var behavior = new novelty.Behavior();
    if(copyFrom.behaviorList)
    {
        //copy the behavior over
        behavior.behaviorList = copyFrom.behaviorList.slice(0);
    }
    //if you have objectives filled out, take those too
    if(copyFrom.objectives)
    {
        behavior.objectives = copyFrom.objectives.slice(0);
    }
    //finished copying behavior
    return behavior;
};

Novelty.Behavior.distance = function(x, y)
{
    var dist = 0.0;

    if(!x.behaviorList || !y.behaviorList)
        throw new Error("One of the behaviors is empty, can't compare distance!");

    //simple calculation, loop through double array and sum up square differences
    for(var k=0;k<x.behaviorList.length;k++)
    {
        var delta = x.behaviorList[k]-y.behaviorList[k];
        dist += delta*delta;
    }

    //return square distance of behavior
    return dist;
};


Novelty.prototype.addPending = function()
{
    var self = this;

    var length = self.pendingAddition.length;

    if(length === 0)
    {
        self.archiveThreshold *= .95;
    }
    if(length > 5)
    {
        self.archiveThreshold *= 1.3;
    }

    //for all of our additions to the archive,
    //check against others to see if entered into archive
    for(var i=0; i < length; i++)
    {
        if(self.measureAgainstArchive(self.pendingAddition[i], false))
            self.archive.push(self.pendingAddition[i]);
    }

    //clear it all out
    self.pendingAddition = [];
};

Novelty.prototype.measureAgainstArchive = function(neatgenome, addToPending)
{
    var self = this;

    for(var genome in self.archive)
    {
        var dist = novelty.Behavior.distance(neatgenome.behavior, genome.behavior);

        if(dist > self.maxDistSeen)
        {
            self.maxDistSeen = dist;
            console.log('Most novel dist: ' + self.maxDistSeen);
        }

        if(dist < self.archiveThreshold)
            return false;

    }

    if(addToPending)
    {
        self.pendingAddition.push(neatgenome);
    }

    return true;
};

//measure the novelty of an organism against the fixed population
Novelty.prototype.measureNovelty = function(neatgenome)
{
    var sum = 0.0;
    var self = this;

    if(!self.initialized)
        return Number.MIN_VALUE;

    var noveltyList = [];

    for(var genome in self.measureAgainst)
    {
        noveltyList.push(
            {distance: novelty.Behavior.distance(genome, neatgenome.behavior),
            genome: genome}
        );
    }

    for(var genome in self.archive)
    {
        noveltyList.push(
            {distance: novelty.Behavior.distance(genome, neatgenome.behavior),
                genome: genome}
        );
    }

    //see if we should add this genome to the archive
    self.measureAgainstArchive(neatgenome,true);

    noveltyList.sort(function(a,b){return b.distance - a.distance});
    var nn = self.nearestNeighbors;
    if(noveltyList.length < self.nearestNeighbors) {
        nn=noveltyList.length;
    }

    neatgenome.nearestNeighbors = nn;

    //Paul - reset local competition and local genome novelty -- might have been incrementing over time
    //Not sure if that's the intention of the algorithm to keep around those scores to signify longer term success
    //this would have a biasing effect on individuals that have been around for longer
//            neatgenome.competition = 0;
//            neatgenome.localGenomeNovelty = 0;

    //TODO: Verify this is working - are local objectives set up, is this measuring properly?
    for (var x = 0; x < nn; x++)
    {
        sum += noveltyList[x].distance;

        if (neatgenome.realFitness > noveltyList[x].genome.realFitness)
            neatgenome.competition += 1;

        //compare all the objectives, and locally determine who you are beating
        for(var o =0; o < neatgenome.objectives.length; o++)
        {
            if(neatgenome.objectives[o] > noveltyList[x].genome.objectives[o])
                neatgenome.localObjectivesCompetition[o] += 1;
        }

        noveltyList[x].genome.locality += 1;
        // sum+=10000.0; //was 100
    }
    //neatgenome.locality = 0;
    //for(int x=0;x<nn;x++)
    //{
    //    sum+=noveltyList[x].First;

    //    if(neatgenome.RealFitness>noveltyList[x].Second.RealFitness)
    //        neatgenome.competition+=1;

    //    noveltyList[x].Second.locality+=1;
    //    //Paul: This might not be the correct meaning of locality, but I am hijacking it instead
    //    //count how many genomes we are neighbored to
    //    //then, if we take neatgenome.competition/neatgenome.locality - we get percentage of genomes that were beaten locally!
    //    neatgenome.locality += 1;
    //    // sum+=10000.0; //was 100
    //}
    return Math.max(sum, .0001);
}

//Todo REFINE... adding highest fitness might
//not correspond with most novel?
Novelty.prototype.add_most_novel = function(genomes)
{
    var self = this;

    var max_novelty =0;
    var best= null;

    for(var i=0;i<genomes.length;i++)
    {
        if(genomes[i].fitness > max_novelty)
        {
            best = genomes[i];
            max_novelty = genomes[i].fitness;
        }
    }
    self.archive.push(best);
};


Novelty.prototype.initialize = function(genomes)
{
    var self = this;
    self.initialized = true;

    self.measureAgainst = [];

    if(genomes !=null){
        for(var i=0;i<genomes.length;i++)
        {
            //we might not need to make copies
            //Paul: removed copies to make it easier to read the realfitness from the indiviudals, without making a million update calls
            self.measureAgainst.push(genomes[i]);//new NeatGenome.NeatGenome((NeatGenome.NeatGenome)p[i],i));
        }
    }
};

//update the measure population by intelligently sampling
//the current population + archive + fixed population
Novelty.prototype.update_measure = function(genomes)
{
    var self = this;

    var total = [];

    //we concatenate copies of the genomes, the measureagainst and archive array
    var total = genomes.slice(0).concat(self.measureAgainst.slice(0), self.archive.slice(0));

    self.mergeTogether(total, genomes.length);

    console.log("Size: " + self.measureAgainst.length);
}

Novelty.prototype.mergeTogether = function(list, size)
{
    var self = this;

    console.log("total count: "+ list.length);

//            Random r = new Random();
    var newList = [];



    //bool array
    var dirty = [];
    //doubles
    var closest = [];

    //set default values
    for(var x=0;x<list.length;x++)
    {
        dirty.push(false);
        closest.push(Number.MAX_VALUE);
    }
    //now add the first individual randomly to the new population
    var last_added = utilities.next(list.length);
    dirty[last_added] = true;
    newList.push(list[last_added]);

    while(newList.length < size)
    {
        var mostNovel = 0.0;
        var mostNovelIndex = 0;
        for(var x=0;x<list.length;x++)
        {
            if (dirty[x])
                continue;
            var dist_to_last = novelty.Behavior.distance(list[x].behavior,
            list[last_added].behavior);

            if (dist_to_last < closest[x])
                closest[x] = dist_to_last;

            if (closest[x] > mostNovel)
            {
                mostNovel = closest[x];
                mostNovelIndex = x;
            }
        }

        dirty[mostNovelIndex] = true;
        newList.push(NeatGenome.Copy(list[mostNovelIndex],0));
        last_added = mostNovelIndex;
    }

    self.measureAgainst = newList;
};

Novelty.prototype.updatePopulationFitness = function(genomes)
{
    var self = this;

    for (var i = 0; i < genomes.length; i++)
    {
        //we might not need to make copies
        self.measureAgainst[i].realFitness = genomes[i].realFitness;
    }
};

});

require.register("optimuslime~neatjs@master/genome/neatConnection.js", function (exports, module) {

/**
 * Module dependencies.
 */
//none

/**
 * Expose `NeatConnection`.
 */

module.exports = NeatConnection;

/**
 * Initialize a new NeatConnection.
 *
 * @param {String} gid
 * @param {Number} weight
 * @param {Object} srcTgtObj
 * @api public
 */

function NeatConnection(gid, weight, srcTgtObj) {

    var self = this;
    //Connection can be inferred by the cantor pair in the gid, however, in other systems, we'll need a source and target ID

    //gid must be a string
    self.gid = typeof gid === "number" ? "" + gid : gid;//(typeof gid === 'string' ? parseFloat(gid) : gid);
    self.weight = (typeof weight === 'string' ? parseFloat(weight) : weight);

    //node ids are strings now -- so make sure to save as string always
    self.sourceID = (typeof srcTgtObj.sourceID === 'number' ? "" + (srcTgtObj.sourceID) : srcTgtObj.sourceID);
    self.targetID = (typeof srcTgtObj.targetID === 'number' ? "" + (srcTgtObj.targetID) : srcTgtObj.targetID);

    //learning rates and modulatory information contained here, not generally used or tested
    self.a =0;
    self.b =0;
    self.c =0;
    self.d =0;
    self.modConnection=0;
    self.learningRate=0;

    self.isMutated=false;
}


NeatConnection.Copy = function(connection)
{
    return new NeatConnection(connection.gid, connection.weight, {sourceID: connection.sourceID, targetID: connection.targetID});
};
});

require.register("optimuslime~neatjs@master/genome/neatNode.js", function (exports, module) {
/**
 * Module dependencies.
 */
//none

/**
 * Expose `NeatNode`.
 */

module.exports = NeatNode;

/**
 * Initialize a new NeatNode.
 *
 * @param {String} gid
 * @param {Object,String} aFunc
 * @param {Number} layer
 * @param {Object} typeObj
 * @api public
 */
function NeatNode(gid, aFunc, layer, typeObj) {

    var self = this;

    //gids are strings not numbers -- make it so
    self.gid =  typeof gid === "number" ? "" + gid : gid;
    //we only story the string of the activation funciton
    //let cppns deal with actual act functions
    self.activationFunction = aFunc.functionID || aFunc;

    self.nodeType = typeObj.type;

    self.layer = (typeof layer === 'string' ? parseFloat(layer) : layer);

    //TODO: Create step tests, include in constructor
    self.step = 0;

    self.bias = 0;
}

NeatNode.INPUT_LAYER = 0.0;
NeatNode.OUTPUT_LAYER = 10.0;

NeatNode.Copy = function(otherNode)
{
    return new NeatNode(otherNode.gid, otherNode.activationFunction, otherNode.layer, {type: otherNode.nodeType});
};
});

require.register("optimuslime~neatjs@master/genome/neatGenome.js", function (exports, module) {
/**
 * Module dependencies.
 */

//pull in our cppn lib
var cppnjs = require("optimuslime~cppnjs@master");

//grab our activation factory, cppn object and connections
var CPPNactivationFactory = cppnjs.cppnActivationFactory;
var utilities = cppnjs.utilities;

//neatjs imports
var novelty = require("optimuslime~neatjs@master/evolution/novelty.js");
var NeatConnection = require("optimuslime~neatjs@master/genome/neatConnection.js");
var NeatNode = require("optimuslime~neatjs@master/genome/neatNode.js");

//help and params
var neatHelp =  require("optimuslime~neatjs@master/neatHelp/neatHelp.js");
var neatParameters =  require("optimuslime~neatjs@master/neatHelp/neatParameters.js");
var neatDecoder =  require("optimuslime~neatjs@master/neatHelp/neatDecoder.js");

var wUtils = require("optimuslime~win-utils@master");
var uuid = wUtils.cuid;

//going to need to read node types appropriately
var NodeType = require("optimuslime~neatjs@master/types/nodeType.js");

/**
 * Expose `NeatGenome`.
 */

module.exports = NeatGenome;

/**
 * Decodes a neatGenome in a cppn.
 *
 * @param {String} gid
 * @param {Array} nodes
 * @param {Array} connections
 * @param {Number} incount
 * @param {Number} outcount
 * @param {Boolean} debug
 * @api public
 */
function NeatGenome(gid, nodes, connections, incount, outcount, debug) {

    var self = this;

    self.gid = gid;
    self.fitness = 0;

    // From C#: Ensure that the connectionGenes are sorted by innovation ID at all times.
    self.nodes = nodes;
    self.connections = connections;

    //we start a fresh set of mutations for each genome we create!
    self.mutations = [];

    self.debug = debug;

    //keep track of behavior for novelty
    self.behavior = new novelty.Behavior();
    //keep track of "real" fitness - that is the objective measure we've observed
    self.realFitness = 0;
    self.age = 0;

    self.localObjectivesCompetition = [];

    self.meta = {};

    //TODO: Hash nodes, connections, and meta to make a global ID! 128-bit md5 hash?
    //WIN will assign a globalID or gid
//        self.gid = //get hash


    // From C#: For efficiency we store the number of input and output neurons. These two quantities do not change
// throughout the life of a genome. Note that inputNeuronCount does NOT include the bias neuron! use inputAndBiasNeuronCount.
// We also keep all input(including bias) neurons at the start of the neuronGeneList followed by
// the output neurons.
    self.inputNodeCount= incount;
    self.inputAndBiasNodeCount= incount+1;
    self.outputNodeCount= outcount;
    self.inputBiasOutputNodeCount= self.inputAndBiasNodeCount + self.outputNodeCount;
    self.inputBiasOutputNodeCountMinus2= self.inputBiasOutputNodeCount -2;



    self.networkAdaptable= false;
    self.networkModulatory= false;
    // Temp tables.
    self.connectionLookup = null;
    self.nodeLookup = null;

    /// From C#: A table that keeps a track of which connections have added to the sexually reproduced child genome.
    /// This is cleared on each call to CreateOffspring_Sexual() and is only declared at class level to
    /// prevent having to re-allocate the table and it's associated memory on each invokation.
//        self.newConnectionTable = null;
//        self.newNodeTable= null;
//        self.newConnectionList= null;

    self.parent = null;

}

//Define the helper functions here!
NeatGenome.Help = {};

var genomeCount = 0;

NeatGenome.Help.nextGenomeID = function()
{
    return genomeCount++;
};
NeatGenome.Help.currentGenomeID = function(){
    return genomeCount;
};
NeatGenome.Help.resetGenomeID = function(value){
    if(value ===undefined ){
        genomeCount = 0;
        return;
    }
    genomeCount = value;
};


var innovationCount = 0;
var lastID = -1;
var hitCount = 0;
//wouldn't work with multithreaded/multi-process environment
NeatGenome.Help.nextInnovationID = function(ix)
{
    if(ix !== undefined)
        return "" + ix;

    //generate random string quickly (unlikely to cause local collisions on any machine)
    //no more number based stuff -- all string now
    return uuid();
    // var id = 1000*(new Date().valueOf());//innovationCount++;
    // if(lastID === id)
    //     hitCount++;
    // else
    //     hitCount = 0;


    // lastID = id;
    // return id + (hitCount%1000);
};

// NeatGenome.Help.currentInnovationID = function(){
//     return innovationCount;
// };
// NeatGenome.Help.resetInnovationID = function(value){
//     if(value === undefined ){
//         innovationCount = 0;
//         return;
//     }

//     innovationCount = value;
// };


NeatGenome.Help.insertByInnovation = function(connection, connectionList)
{
    var self = connectionList;
    // Determine the insert idx with a linear search, starting from the end
    // since mostly we expect to be adding genes that belong only 1 or 2 genes
    // from the end at most.
    var idx= connectionList.length-1;
    for(; idx>-1; idx--)
    {
        if(uuid.isLessThan(self[idx].gid, connection.gid))
        {	// Insert idx found.
            break;
        }
    }
    connectionList.splice(idx+1, 0, connection);
};

NeatGenome.Help.CreateGIDLookup = function(arObject)
{
    var lookup = {};
    arObject.forEach(function(o)
    {
        lookup[o.gid] = o;
    });

    return lookup;

};


//NeuronGene creator
/// <summary>
/// Create a default minimal genome that describes a NN with the given number of inputs and outputs.
/// </summary>
/// <returns></returns>
//{connectionWeightRange: val, connectionProportion: val}
NeatGenome.Help.CreateGenomeByInnovation = function(ins, outs, connParams, existing)
{
    //existing is for seing if a connection innovation id already exists according to local believers/shamans
    existing = existing || {};
    //create our ins and outs,
    var inputNodeList = [], outputNodeList = [], nodeList = [], connectionList = [];

    var aFunc = CPPNactivationFactory.getActivationFunction('NullFn');

    var iCount = 0;

    // IMPORTANT NOTE: The neurons must all be created prior to any connections. That way all of the genomes
    // will obtain the same innovation ID's for the bias,input and output nodes in the initial population.
    // Create a single bias neuron.
    var node = new NeatNode(NeatGenome.Help.nextInnovationID(iCount++), aFunc, NeatNode.INPUT_LAYER, {type: NodeType.bias});
    //null, idGenerator.NextInnovationId, NeuronGene.INPUT_LAYER, NeuronType.Bias, actFunct, stepCount);
    inputNodeList.push(node);
    nodeList.push(node);


    // Create input neuron genes.
    aFunc = CPPNactivationFactory.getActivationFunction('NullFn');
    for(var i=0; i<ins; i++)
    {
        //TODO: DAVID proper activation function change to NULL?
        node = new NeatNode(NeatGenome.Help.nextInnovationID(iCount++), aFunc, NeatNode.INPUT_LAYER, {type: NodeType.input});
        inputNodeList.push(node);
        nodeList.push(node);
    }

    // Create output neuron genes.
    aFunc = CPPNactivationFactory.getActivationFunction('BipolarSigmoid');
    for(var i=0; i<outs; i++)
    {
        //TODO: DAVID proper activation function change to NULL?
        node = new NeatNode(NeatGenome.Help.nextInnovationID(iCount++), aFunc, NeatNode.OUTPUT_LAYER, {type: NodeType.output});
        outputNodeList.push(node);
        nodeList.push(node);
    }

    // Loop over all possible connections from input to output nodes and create a number of connections based upon
    // connectionProportion.
    outputNodeList.forEach(function(targetNode){

        inputNodeList.forEach(function(sourceNode){
            // Always generate an ID even if we aren't going to use it. This is necessary to ensure connections
            // between the same neurons always have the same ID throughout the generated population.

            if(utilities.nextDouble() < connParams.connectionProportion )
            {

                var cIdentifier = '(' + sourceNode.gid + "," + targetNode.gid + ')';

                // Ok lets create a connection.
                //if it already exists, we can use the existing innovation ID
                var connectionInnovationId = existing[cIdentifier] || NeatGenome.Help.nextInnovationID();

                //if we didn't have one before, we do now! If we did, we simply overwrite with the same innovation id
                existing[cIdentifier] = connectionInnovationId;

                connectionList.push(new NeatConnection(connectionInnovationId,
                    (utilities.nextDouble() * connParams.connectionWeightRange ) - connParams.connectionWeightRange/2.0,
                    {sourceID: sourceNode.gid, targetID: targetNode.gid}));

            }
        });
    });

    // Don't create any hidden nodes at this point. Fundamental to the NEAT way is to start minimally!
    return new NeatGenome(NeatGenome.Help.nextGenomeID(), nodeList, connectionList, ins, outs);
//            NeatGenome(idGenerator.NextGenomeId, neuronGeneList, connectionGeneList, inputNeuronCount, outputNeuronCount);

};


NeatGenome.Copy = function(genome, gid)
{

    var nodeCopy = [], connectionCopy = [];
    genome.nodes.forEach(function(node)
    {
        nodeCopy.push(NeatNode.Copy(node));
    });
    genome.connections.forEach(function(conn)
    {
        connectionCopy.push(NeatConnection.Copy(conn));
    });

    //not debuggin
    var gCopy = new NeatGenome((gid !== undefined ? gid : genome.gid), nodeCopy, connectionCopy, genome.inputNodeCount, genome.outputNodeCount, false);

    //copy the behavior as well -- if there exists any behavior to copy
    if(genome.behavior && (genome.behavior.objectives || genome.behavior.behaviorList))
        gCopy.behavior = novelty.Behavior.BehaviorCopy(genome.behavior);

    return gCopy;
};


/// Asexual reproduction with built in mutation.
NeatGenome.prototype.createOffspringAsexual = function(newNodeTable, newConnectionTable, np)
{
    var self = this;
    //copy the genome, then mutate
    var genome = NeatGenome.Copy(self, NeatGenome.Help.nextGenomeID());

    //mutate genome before returning
    genome.mutate(newNodeTable, newConnectionTable, np);

    return genome;
};



/// <summary>
/// Adds a connection to the list that will eventually be copied into a child of this genome during sexual reproduction.
/// A helper function that is only called by CreateOffspring_Sexual_ProcessCorrelationItem().
/// </summary>
/// <param name="connectionGene">Specifies the connection to add to this genome.</param>
/// <param name="overwriteExisting">If there is already a connection from the same source to the same target,
/// that connection is replaced when overwriteExisting is true and remains (no change is made) when overwriteExisting is false.</param>
//TODO: Use gid or innovationID?
NeatGenome.Help.createOffspringSexual_AddGene  = function(connectionList, connectionTable, connection, overwriteExisting)
{

    var conKey = connection.gid;

    // Check if a matching gene has already been added.
    var oIdx = connectionTable[conKey];

    if(oIdx==null)
    {	// No matching gene has been added.
        // Register this new gene with the newConnectionGeneTable - store its index within newConnectionGeneList.
        connectionTable[conKey] = connectionList.length;

        // Add the gene to the list.
        connectionList.push(NeatConnection.Copy(connection));
    }
    else if(overwriteExisting)
    {
        // Overwrite the existing matching gene with this one. In fact only the weight value differs between two
        // matching connection genes, so just overwrite the existing genes weight value.

        // Remember that we stored the gene's index in newConnectionGeneTable. So use it here.
        connectionList[oIdx].weight = connection.weight;
    }
};

/// <summary>
/// Given a description of a connection in two parents, decide how to copy it into their child.
/// A helper function that is only called by CreateOffspring_Sexual().
/// </summary>
/// <param name="correlationItem">Describes a connection and whether it exists on one parent, the other, or both.</param>
/// <param name="fitSwitch">If this is 1, then the first parent is more fit; if 2 then the second parent. Other values are not defined.</param>
/// <param name="combineDisjointExcessFlag">If this is true, add disjoint and excess genes to the child; otherwise, leave them out.</param>
/// <param name="np">Not used.</param>
NeatGenome.Help.createOffspringSexual_ProcessCorrelationItem
    = function(connectionList, connectionTable, correlationItem, fitSwitch, combineDisjointExcessFlag)
{
    switch(correlationItem.correlationType)
    {
        // Disjoint and excess genes.
        case neatHelp.CorrelationType.disjointConnectionGene:
        case neatHelp.CorrelationType.excessConnectionGene:
        {
            // If the gene is in the fittest parent then override any existing entry in the connectionGeneTable.
            if(fitSwitch==1 && correlationItem.connection1!=null)
            {
                NeatGenome.Help.createOffspringSexual_AddGene(connectionList, connectionTable, correlationItem.connection1, true);
                return;
            }

            if(fitSwitch==2 && correlationItem.connection2!=null)
            {
                NeatGenome.Help.createOffspringSexual_AddGene(connectionList, connectionTable, correlationItem.connection2, true);
                return;
            }

            // The disjoint/excess gene is on the less fit parent.
            //if(Utilities.NextDouble() < np.pDisjointExcessGenesRecombined)	// Include the gene n% of the time from whichever parent contains it.
            if(combineDisjointExcessFlag)
            {
                if(correlationItem.connection1!=null)
                {
                    NeatGenome.Help.createOffspringSexual_AddGene(connectionList, connectionTable, correlationItem.connection1, false);
                    return;
                }
                if(correlationItem.connection2!=null)
                {
                    NeatGenome.Help.createOffspringSexual_AddGene(connectionList, connectionTable, correlationItem.connection2, false);
                    return;
                }
            }
            break;
        }

        case neatHelp.CorrelationType.matchedConnectionGenes:
        {
            if(utilities.RouletteWheel.singleThrow(0.5))
            {
                // Override any existing entries in the table.
                NeatGenome.Help.createOffspringSexual_AddGene(connectionList, connectionTable, correlationItem.connection1, true);
            }
            else
            {
                // Override any existing entries in the table.
                NeatGenome.Help.createOffspringSexual_AddGene(connectionList, connectionTable, correlationItem.connection2, true);
            }
            break;
        }
    }
};


/// <summary>
/// Correlate the ConnectionGenes within the two ConnectionGeneLists - based upon innovation number.
/// Return an ArrayList of ConnectionGene[2] structures - pairs of matching ConnectionGenes.
/// </summary>
/// <param name="list1"></param>
/// <param name="list2"></param>
/// <returns>Resulting correlation</returns>
NeatGenome.Help.correlateConnectionListsByInnovation
    = function(list1, list2)
{
    var correlationResults = new neatHelp.CorrelationResults();

    //----- Test for special cases.
    if(!list1.length && !list2.length)
    {	// Both lists are empty!
        return correlationResults;
    }

    if(!list1.length)
    {	// All list2 genes are excess.
        correlationResults.correlationStatistics.excessConnectionCount = list2.length;

        list2.forEach(function(connection){
            //add a bunch of excess genes to our new creation!
            correlationResults.correlationList.push(new neatHelp.CorrelationItem(neatHelp.CorrelationType.excessConnectionGene, null, connection));
        });
        //done with correlating al; genes since list1 is empty
        return correlationResults;
    }

    // i believe there is a bug in the C# code, but it's completely irrelevant cause you'll never have 0 connections and for it to be sensical!
    if(!list2.length)
    {	// All list1 genes are excess.
        correlationResults.correlationStatistics.excessConnectionCount  = list1.length;

        list1.forEach(function(connection){
            //add a bunch of excess genes to our new creation!
            correlationResults.correlationList.push(new neatHelp.CorrelationItem(neatHelp.CorrelationType.excessConnectionGene, connection, null));
        });

        //done with correlating al; genes since list2 is empty
        return correlationResults;
    }

    //----- Both ConnectionGeneLists contain genes - compare the contents.
    var list1Idx=0;
    var list2Idx=0;
    var connection1 = list1[list1Idx];
    var connection2 = list2[list2Idx];

    for(;;)
    {

        if(uuid.isLessThan(connection2.gid, connection1.gid))
        {
            // connectionGene2 is disjoint.
            correlationResults.correlationList.push(new neatHelp.CorrelationItem(neatHelp.CorrelationType.disjointConnectionGene, null, connection2));
            correlationResults.correlationStatistics.disjointConnectionCount++;

            // Move to the next gene in list2.
            list2Idx++;
        }
        else if(connection1.gid == connection2.gid)
        {
            correlationResults.correlationList.push(new neatHelp.CorrelationItem(neatHelp.CorrelationType.matchedConnectionGenes, connection1, connection2));
            correlationResults.correlationStatistics.connectionWeightDelta += Math.abs(connection1.weight-connection2.weight);
            correlationResults.correlationStatistics.matchingCount++;

            // Move to the next gene in both lists.
            list1Idx++;
            list2Idx++;
        }
        else // (connectionGene2.InnovationId > connectionGene1.InnovationId)
        {
            // connectionGene1 is disjoint.
            correlationResults.correlationList.push(new  neatHelp.CorrelationItem(neatHelp.CorrelationType.disjointConnectionGene, connection1, null));
            correlationResults.correlationStatistics.disjointConnectionCount++;

            // Move to the next gene in list1.
            list1Idx++;
        }

        // Check if we have reached the end of one (or both) of the lists. If we have reached the end of both then
        // we execute the first if block - but it doesn't matter since the loop is not entered if both lists have
        // been exhausted.
        if(list1Idx >= list1.length)
        {
            // All remaining list2 genes are excess.
            for(; list2Idx<list2.length; list2Idx++)
            {
                correlationResults.correlationList.push(new neatHelp.CorrelationItem(neatHelp.CorrelationType.excessConnectionGene, null, list2[list2Idx]));
                correlationResults.correlationStatistics.excessConnectionCount++;
            }
            return correlationResults;
        }

        if(list2Idx >= list2.length)
        {
            // All remaining list1 genes are excess.
            for(; list1Idx<list1.length; list1Idx++)
            {
                correlationResults.correlationList.push(new neatHelp.CorrelationItem(neatHelp.CorrelationType.excessConnectionGene, list1[list1Idx], null));
                correlationResults.correlationStatistics.excessConnectionCount++;
            }
            return correlationResults;
        }

        connection1 = list1[list1Idx];
        connection2 = list2[list2Idx];
    }
};



//NeuronGene creator
NeatGenome.prototype.createOffspringSexual
    = function(otherParent, np)
{
    var self = this;

    if (otherParent == null || otherParent === undefined)
        return null;

    // Build a list of connections in either this genome or the other parent.
    var correlationResults = NeatGenome.Help.correlateConnectionListsByInnovation(self.connections, otherParent.connections);

    if(self.debug && !correlationResults.performIntegrityCheckByInnovation())
        throw "CorrelationResults failed innovation integrity check.";

    //----- Connection Genes.
    // We will temporarily store the offspring's genes in newConnectionGeneList and keeping track of which genes
    // exist with newConnectionGeneTable. Here we ensure these objects are created, and if they already existed
    // then ensure they are cleared. Clearing existing objects is more efficient that creating new ones because
    // allocated memory can be re-used.

    // Key = connection key, value = index in newConnectionGeneList.
    var newConnectionTable = {};

    //TODO: No 'capacity' constructor on CollectionBase. Create modified/custom CollectionBase.
    // newConnectionGeneList must be constructed on each call because it is passed to a new NeatGenome
    // at construction time and a permanent reference to the list is kept.
    var newConnectionList = [];

    // A switch that stores which parent is fittest 1 or 2. Chooses randomly if both are equal. More efficient to calculate this just once.
    var fitSwitch;
    if(self.fitness > otherParent.fitness)
        fitSwitch = 1;
    else if(self.fitness < otherParent.fitness)
        fitSwitch = 2;
    else
    {	// Select one of the parents at random to be the 'master' genome during crossover.
        if(utilities.nextDouble() < 0.5)
            fitSwitch = 1;
        else
            fitSwitch = 2;
    }

    var combineDisjointExcessFlag = utilities.nextDouble() < np.pDisjointExcessGenesRecombined;

    // Loop through the correlationResults, building a table of ConnectionGenes from the parents that will make it into our
    // new [single] offspring. We use a table keyed on connection end points to prevent passing connections to the offspring
    // that may have the same end points but a different innovation number - effectively we filter out duplicate connections.
//        var idxBound = correlationResults.correlationList.length;
    correlationResults.correlationList.forEach(function(correlationItem)
    {
        NeatGenome.Help.createOffspringSexual_ProcessCorrelationItem(newConnectionList, newConnectionTable, correlationItem, fitSwitch, combineDisjointExcessFlag);
    });



    //----- Neuron Genes.
    // Build a neuronGeneList by analysing each connection's neuron end-point IDs.
    // This strategy has the benefit of eliminating neurons that are no longer connected too.
    // Remember to always keep all input, output and bias neurons though!
    var newNodeList = [];

    // Keep a table of the NeuronGene ID's keyed by ID so that we can keep track of which ones have been added.
    // Key = innovation ID, value = null for some reason.

    var newNodeTable = {};

    // Get the input/output neurons from this parent. All Genomes share these neurons, they do not change during a run.
//        idxBound = neuronGeneList.Count;

    self.nodes.forEach(function(node)
    {
        if(node.nodeType != NodeType.hidden)
        {
            newNodeList.push(NeatNode.Copy(node));
            newNodeTable[node.gid] = node;
        }
//            else
//            {	// No more bias, input or output nodes. break the loop.
//                break;
//            }
    });

    // Now analyse the connections to determine which NeuronGenes are required in the offspring.
    // Loop through every connection in the child, and add to the child those hidden neurons that are sources or targets of the connection.
//        idxBound = newConnectionGeneList.Count;


    var nodeLookup = NeatGenome.Help.CreateGIDLookup(self.nodes);
    var otherNodeLookup = NeatGenome.Help.CreateGIDLookup(otherParent.nodes);
//        var connLookup =  NeatGenome.Help.CreateGIDLookup(self.connections);

    newConnectionList.forEach(function(connection)
    {
        var node;

        if(!newNodeTable[connection.sourceID])
        {
            //TODO: DAVID proper activation function
            // We can safely assume that any missing NeuronGenes at this point are hidden heurons.
            node = nodeLookup[connection.sourceID];
            if (node)
                newNodeList.push(NeatNode.Copy(node));
            else{
                node = otherNodeLookup[connection.sourceID];
                if(!node)
                    throw new Error("Connection references source node that does not exist in either parent: " + JSON.stringify(connection));
                
                newNodeList.push(NeatNode.Copy(otherNodeLookup[connection.sourceID]));
            }
            //newNeuronGeneList.Add(new NeuronGene(connectionGene.SourceNeuronId, NeuronType.Hidden, ActivationFunctionFactory.GetActivationFunction("SteepenedSigmoid")));
            newNodeTable[connection.sourceID] = node;
        }

        if(!newNodeTable[connection.targetID])
        {
            //TODO: DAVID proper activation function
            // We can safely assume that any missing NeuronGenes at this point are hidden heurons.
            node = nodeLookup[connection.targetID];
            if (node != null)
                newNodeList.push(NeatNode.Copy(node));
           else{
                node = otherNodeLookup[connection.targetID];
                if(!node)
                    throw new Error("Connection references target node that does not exist in either parent: " + JSON.stringify(connection));

                newNodeList.push(NeatNode.Copy(otherNodeLookup[connection.targetID]));
            }
                
            //newNeuronGeneList.Add(new NeuronGene(connectionGene.TargetNeuronId, NeuronType.Hidden, ActivationFunctionFactory.GetActivationFunction("SteepenedSigmoid")));
            newNodeTable[connection.targetID] = node;
        }
    });

    // TODO: Inefficient code?
    newNodeList.sort(function(a,b){
        var compare = uuid.isLessThan(a.gid, b.gid) ? 
            -1 : //is less than -- a- b = -1
            (a.gid == b.gid) ? 0 : //is possible equal to or greater
            1;//is greater than definitely
        return compare
    });

    // newConnectionGeneList is already sorted because it was generated by passing over the list returned by
    // CorrelateConnectionGeneLists() - which is always in order.
    return new NeatGenome(NeatGenome.Help.nextGenomeID(), newNodeList,newConnectionList, self.inputNodeCount, self.outputNodeCount, self.debug);

    //No module support in here

    // Determine which modules to pass on to the child in the same way.
    // For each module in this genome or in the other parent, if it was referenced by even one connection add it and all its dummy neurons to the child.
//        List<ModuleGene> newModuleGeneList = new List<ModuleGene>();
//
//        // Build a list of modules the child might have, which is a union of the parents' module lists, but they are all copies so we can't just do a union.
//        List<ModuleGene> unionParentModules = new List<ModuleGene>(moduleGeneList);
//        foreach (ModuleGene moduleGene in otherParent.moduleGeneList) {
//        bool alreadySeen = false;
//        foreach (ModuleGene match in unionParentModules) {
//            if (moduleGene.InnovationId == match.InnovationId) {
//                alreadySeen = true;
//                break;
//            }
//        }
//        if (!alreadySeen) {
//            unionParentModules.Add(moduleGene);
//        }
//    }

//        foreach (ModuleGene moduleGene in unionParentModules) {
//        // Examine each neuron in the child to determine whether it is part of a module.
//        foreach (List<long> dummyNeuronList in new List<long>[] { moduleGene.InputIds, moduleGene.OutputIds })
//        {
//            foreach (long dummyNeuronId in dummyNeuronList)
//            {
//                if (newNeuronGeneTable.ContainsKey(dummyNeuronId)) {
//                    goto childHasModule;
//                }
//            }
//        }
//
//        continue; // the child does not contain this module, so continue the loop and check for the next module.
//        childHasModule: // the child does contain this module, so make sure the child gets all the nodes the module requires to work.
//
//            // Make sure the child has all the neurons in the given module.
//            newModuleGeneList.Add(new ModuleGene(moduleGene));
//        foreach (List<long> dummyNeuronList in new List<long>[] { moduleGene.InputIds, moduleGene.OutputIds })
//        {
//            foreach (long dummyNeuronId in dummyNeuronList)
//            {
//                if (!newNeuronGeneTable.ContainsKey(dummyNeuronId)) {
//                    newNeuronGeneTable.Add(dummyNeuronId, null);
//                    NeuronGene neuronGene = this.neuronGeneList.GetNeuronById(dummyNeuronId);
//                    if (neuronGene != null) {
//                        newNeuronGeneList.Add(new NeuronGene(neuronGene));
//                    } else {
//                        newNeuronGeneList.Add(new NeuronGene(otherParent.NeuronGeneList.GetNeuronById(dummyNeuronId)));
//                    }
//                }
//            }
//        }
//    }



};


/// <summary>
/// Decode the genome's 'DNA' into a working network.
/// </summary>
/// <returns></returns>
NeatGenome.prototype.networkDecode = function(activationFn)
{
    var self = this;

    return neatDecoder.DecodeToFloatFastConcurrentNetwork(self, activationFn);
};


/// <summary>
/// Clone this genome.
/// </summary>
/// <returns></returns>
NeatGenome.prototype.clone = function()
{
    var self = this;
    return NeatGenome.Copy(self, NeatGenome.Help.nextGenomeID());
};

NeatGenome.prototype.compatFormer = function(comparisonGenome, np) {
    /* A very simple way of implementing this routine is to call CorrelateConnectionGeneLists and to then loop
     * through the correlation items, calculating a compatibility score as we go. However, this routine
     * is heavily used and in performance tests was shown consume 40% of the CPU time for the core NEAT code.
     * Therefore this new routine has been rewritten with it's own version of the logic within
     * CorrelateConnectionGeneLists. This allows us to only keep comparing genes up to the point where the
     * threshold is passed. This also eliminates the need to build the correlation results list, this difference
     * alone is responsible for a 200x performance improvement when testing with a 1664 length genome!!
     *
     * A further optimisation is achieved by comparing the genes starting at the end of the genomes which is
     * where most disparities are located - new novel genes are always attached to the end of genomes. This
     * has the result of complicating the routine because we must now invoke additional logic to determine
     * which genes are excess and when the first disjoint gene is found. This is done with an extra integer:
     *
     * int excessGenesSwitch=0; // indicates to the loop that it is handling the first gene.
     *						=1;	// Indicates that the first gene was excess and on genome 1.
     *						=2;	// Indicates that the first gene was excess and on genome 2.
     *						=3;	// Indicates that there are no more excess genes.
     *
     * This extra logic has a slight performance hit, but this is minor especially in comparison to the savings that
     * are expected to be achieved overall during a NEAT search.
     *
     * If you have trouble understanding this logic then it might be best to work through the previous version of
     * this routine (below) that scans through the genomes from start to end, and which is a lot simpler.
     *
     */
    var self = this;

    //this can be replaced with the following code:




    var list1 = self.connections;
    var list2 = comparisonGenome.connections;

//
//        var compatibility = 0;
//        var correlation = NeatGenome.Help.correlateConnectionListsByInnovation(list1, list2);
//        compatibility += correlation.correlationStatistics.excessConnectionCount*np.compatibilityExcessCoeff;
//        compatibility += correlation.correlationStatistics.disjointConnectionCount*np.compatibilityDisjointCoeff;
//        compatibility += correlation.correlationStatistics.connectionWeightDelta*np.compatibilityWeightDeltaCoeff;
//        return compatibility;


    var excessGenesSwitch=0;

    // Store these heavily used values locally.
    var list1Count = list1.length;
    var list2Count = list2.length;

    //----- Test for special cases.
    if(list1Count==0 && list2Count==0)
    {	// Both lists are empty! No disparities, therefore the genomes are compatible!
        return 0.0;
    }

    if(list1Count==0)
    {	// All list2 genes are excess.
        return ((list2.length * np.compatibilityExcessCoeff));
    }

    if(list2Count==0)
    {
        // All list1 genes are excess.
        return ((list1Count * np.compatibilityExcessCoeff));
    }

    //----- Both ConnectionGeneLists contain genes - compare the contents.
    var compatibility = 0.0;
    var list1Idx=list1Count-1;
    var list2Idx=list2Count-1;
    var connection1 = list1[list1Idx];
    var connection2 = list2[list2Idx];
    for(;;)
    {
        if(connection1.gid == connection2.gid)
        {
            // No more excess genes. It's quicker to set this every time than to test if is not yet 3.
            excessGenesSwitch=3;

            // Matching genes. Increase compatibility by weight difference * coeff.
            compatibility += Math.abs(connection1.weight-connection2.weight) * np.compatibilityWeightDeltaCoeff;

            // Move to the next gene in both lists.
            list1Idx--;
            list2Idx--;
        }
        else if(!uuid.isLessThan(connection2.gid, connection1.gid))
        {
            // Most common test case(s) at top for efficiency.
            if(excessGenesSwitch==3)
            {	// No more excess genes. Therefore this mismatch is disjoint.
                compatibility += np.compatibilityDisjointCoeff;
            }
            else if(excessGenesSwitch==2)
            {	// Another excess gene on genome 2.
                compatibility += np.compatibilityExcessCoeff;
            }
            else if(excessGenesSwitch==1)
            {	// We have found the first non-excess gene.
                excessGenesSwitch=3;
                compatibility += np.compatibilityDisjointCoeff;
            }
            else //if(excessGenesSwitch==0)
            {	// First gene is excess, and is on genome 2.
                excessGenesSwitch = 2;
                compatibility += np.compatibilityExcessCoeff;
            }

            // Move to the next gene in list2.
            list2Idx--;
        } 
        else // (connectionGene2.InnovationId < connectionGene1.InnovationId)
        {
            // Most common test case(s) at top for efficiency.
            if(excessGenesSwitch==3)
            {	// No more excess genes. Therefore this mismatch is disjoint.
                compatibility += np.compatibilityDisjointCoeff;
            }
            else if(excessGenesSwitch==1)
            {	// Another excess gene on genome 1.
                compatibility += np.compatibilityExcessCoeff;
            }
            else if(excessGenesSwitch==2)
            {	// We have found the first non-excess gene.
                excessGenesSwitch=3;
                compatibility += np.compatibilityDisjointCoeff;
            }
            else //if(excessGenesSwitch==0)
            {	// First gene is excess, and is on genome 1.
                excessGenesSwitch = 1;
                compatibility += np.compatibilityExcessCoeff;
            }

            // Move to the next gene in list1.
            list1Idx--;
        }


        // Check if we have reached the end of one (or both) of the lists. If we have reached the end of both then
        // we execute the first 'if' block - but it doesn't matter since the loop is not entered if both lists have
        // been exhausted.
        if(list1Idx < 0)
        {
            // All remaining list2 genes are disjoint.
            compatibility +=  (list2Idx+1) * np.compatibilityDisjointCoeff;
            return (compatibility); //< np.compatibilityThreshold);
        }

        if(list2Idx < 0)
        {
            // All remaining list1 genes are disjoint.
            compatibility += (list1Idx+1) * np.compatibilityDisjointCoeff;
            return (compatibility); //< np.compatibilityThreshold);
        }

        connection1 = list1[list1Idx];
        connection2 = list2[list2Idx];
    }
};

NeatGenome.prototype.compat = function(comparisonGenome, np) {

    var self = this;
    var list1 = self.connections;
    var list2 = comparisonGenome.connections;

    var compatibility = 0;
    var correlation = NeatGenome.Help.correlateConnectionListsByInnovation(list1, list2);
    compatibility += correlation.correlationStatistics.excessConnectionCount*np.compatibilityExcessCoeff;
    compatibility += correlation.correlationStatistics.disjointConnectionCount*np.compatibilityDisjointCoeff;
    compatibility += correlation.correlationStatistics.connectionWeightDelta*np.compatibilityWeightDeltaCoeff;
    return compatibility;

};

NeatGenome.prototype.isCompatibleWithGenome= function(comparisonGenome, np)
{
    var self = this;

    return (self.compat(comparisonGenome, np) < np.compatibilityThreshold);
};

NeatGenome.Help.InOrderInnovation = function(aObj)
{
    var prevId = 0;

    for(var i=0; i< aObj.length; i++){
        var connection = aObj[i];
        if(uuid.isLessThan(connection.gid, prevId))
            return false;
        prevId = connection.gid;
    }

    return true;
};


/// <summary>
/// For debug purposes only.
/// </summary>
/// <returns>Returns true if genome integrity checks out OK.</returns>
NeatGenome.prototype.performIntegrityCheck = function()
{
    var self = this;
    return NeatGenome.Help.InOrderInnovation(self.connections);
};


NeatGenome.prototype.mutate = function(newNodeTable, newConnectionTable, np)
{
    var self = this;

    // Determine the type of mutation to perform.
    var probabilities = [];
    probabilities.push(np.pMutateAddNode);
//        probabilities.push(0);//np.pMutateAddModule);
    probabilities.push(np.pMutateAddConnection);
    probabilities.push(np.pMutateDeleteConnection);
    probabilities.push(np.pMutateDeleteSimpleNeuron);
    probabilities.push(np.pMutateConnectionWeights);
    probabilities.push(np.pMutateChangeActivations);

    var outcome = utilities.RouletteWheel.singleThrowArray(probabilities);
    switch(outcome)
    {
        case 0:
            self.mutate_AddNode(newNodeTable);
            return 0;
        case 1:
//               self.mutate_Ad Mutate_AddModule(ea);
            self.mutate_AddConnection(newConnectionTable,np);
            return 1;
        case 2:
            self.mutate_DeleteConnection();
            return 2;
        case 3:
            self.mutate_DeleteSimpleNeuronStructure(newConnectionTable, np);
            return 3;
        case 4:
            self.mutate_ConnectionWeights(np);
            return 4;
        case 5:
            self.mutate_ChangeActivation(np);
            return 5;
    }
};



//NeuronGene creator
/// <summary>
/// Add a new node to the Genome. We do this by removing a connection at random and inserting
/// a new node and two new connections that make the same circuit as the original connection.
///
/// This way the new node is properly integrated into the network from the outset.
/// </summary>
/// <param name="ea"></param>
NeatGenome.prototype.mutate_AddNode = function(newNodeTable, connToSplit)
{
    var self = this;

    if(!self.connections.length)
        return null;

    // Select a connection at random.
    var connectionToReplaceIdx = Math.floor(utilities.nextDouble() * self.connections.length);
    var connectionToReplace =  connToSplit || self.connections[connectionToReplaceIdx];

    // Delete the existing connection. JOEL: Why delete old connection?
    //connectionGeneList.RemoveAt(connectionToReplaceIdx);

    // Check if this connection has already been split on another genome. If so then we should re-use the
    // neuron ID and two connection ID's so that matching structures within the population maintain the same ID.
    var existingNeuronGeneStruct = newNodeTable[connectionToReplace.gid];

    var newNode;
    var newConnection1;
    var newConnection2;
    var actFunct;

    var nodeLookup = NeatGenome.Help.CreateGIDLookup(self.nodes);

    //we could attempt to mutate the same node TWICE -- causing big issues, since we'll double add that node

    var acnt = 0;
    var attempts = 5;
    //while we
    while(acnt++ < attempts && existingNeuronGeneStruct && nodeLookup[existingNeuronGeneStruct.node.gid])
    {
        connectionToReplaceIdx = Math.floor(utilities.nextDouble() * self.connections.length);
        connectionToReplace =  connToSplit || self.connections[connectionToReplaceIdx];
        existingNeuronGeneStruct = newNodeTable[connectionToReplace.gid];
    }

    //we have failed to produce a new node to split!
    if(acnt == attempts && existingNeuronGeneStruct && nodeLookup[existingNeuronGeneStruct.node.gid])
        return;

    if(!existingNeuronGeneStruct)
    {	// No existing matching structure, so generate some new ID's.

        //TODO: DAVID proper random activation function
        // Replace connectionToReplace with two new connections and a neuron.
        actFunct= CPPNactivationFactory.getRandomActivationFunction();
        //newNeuronGene = new NeuronGene(ea.NextInnovationId, NeuronType.Hidden, actFunct);

        var nextID = NeatGenome.Help.nextInnovationID();//connectionToReplace.gid);

        newNode = new NeatNode(nextID, actFunct,
            (nodeLookup[connectionToReplace.sourceID].layer + nodeLookup[connectionToReplace.targetID].layer)/2.0,
            {type: NodeType.hidden});

        nextID = NeatGenome.Help.nextInnovationID();
        newConnection1 = new NeatConnection(nextID, 1.0, {sourceID: connectionToReplace.sourceID, targetID:newNode.gid});

        nextID = NeatGenome.Help.nextInnovationID();
        newConnection2 =  new NeatConnection(nextID, connectionToReplace.weight, {sourceID: newNode.gid, targetID: connectionToReplace.targetID});

        // Register the new ID's with NewNeuronGeneStructTable.
        newNodeTable[connectionToReplace.gid] = {node: newNode, connection1: newConnection1, connection2: newConnection2};
    }
    else
    {	// An existing matching structure has been found. Re-use its ID's

        //TODO: DAVID proper random activation function
        // Replace connectionToReplace with two new connections and a neuron.
        actFunct = CPPNactivationFactory.getRandomActivationFunction();
        var tmpStruct = existingNeuronGeneStruct;
        //newNeuronGene = new NeuronGene(tmpStruct.NewNeuronGene.InnovationId, NeuronType.Hidden, actFunct);
        newNode = NeatNode.Copy(tmpStruct.node);
        newNode.nodeType = NodeType.hidden;
        //new NeuronGene(null, tmpStruct.NewNeuronGene.gid, tmpStruct.NewNeuronGene.Layer, NeuronType.Hidden, actFunct, this.step);

        newConnection1 = new NeatConnection(tmpStruct.connection1.gid, 1.0, {sourceID: connectionToReplace.sourceID, targetID:newNode.gid});
//                new ConnectionGene(tmpStruct.NewConnectionGene_Input.gid, connectionToReplace.SourceNeuronId, newNeuronGene.gid, 1.0);
        newConnection2 = new NeatConnection(tmpStruct.connection2.gid, connectionToReplace.weight, {sourceID: newNode.gid, targetID: connectionToReplace.targetID});
//                new ConnectionGene(tmpStruct.NewConnectionGene_Output.gid, newNeuronGene.gid, connectionToReplace.TargetNeuronId, connectionToReplace.Weight);
    }

    // Add the new genes to the genome.
    self.nodes.push(newNode);
    NeatGenome.Help.insertByInnovation(newConnection1, self.connections);
    NeatGenome.Help.insertByInnovation(newConnection2, self.connections);

    //in javascript, we return the new node and connections created, since it's so easy!
//        return {node: newNode, connection1: newConnection1, newConnection2: newConnection2};

};

//Modules not implemented
//    NeatGenome.prototype.mutate_AddModule = function(np)
//    {
//    }

NeatGenome.prototype.testForExistingConnectionInnovation = function(sourceID, targetID)
{
    var self = this;
//        console.log('looking for source: ' + sourceID + ' target: ' + targetID);

    for(var i=0; i< self.connections.length; i++){
        var connection = self.connections[i];
        if(connection.sourceID == sourceID && connection.targetID == targetID){
            return connection;
        }
    }

    return null;
};

//messes with the activation functions
NeatGenome.prototype.mutate_ChangeActivation = function(np)
{
    //let's select a node at random (so long as it's not an input)
    var self = this;

    for(var i=0; i < self.nodes.length; i++)
    {
        //not going to change the inputs
        if(i < self.inputAndBiasNodeCount)
            continue;

        if(utilities.nextDouble() < np.pNodeMutateActivationRate)
        {
            self.nodes[i].activationFunction = CPPNactivationFactory.getRandomActivationFunction().functionID;
        }
    }
};

//add a connection, sourcetargetconnect specifies the source, target or both nodes you'd like to connect (optionally)
NeatGenome.prototype.mutate_AddConnection = function(newConnectionTable, np, sourceTargetConnect)
{
    //if we didn't send specifics, just create an empty object
    sourceTargetConnect = sourceTargetConnect || {};

    var self = this;
    // We are always guaranteed to have enough neurons to form connections - because the input/output neurons are
    // fixed. Any domain that doesn't require input/outputs is a bit nonsensical!

    // Make a fixed number of attempts at finding a suitable connection to add.

    if(self.nodes.length>1)
    {	// At least 2 neurons, so we have a chance at creating a connection.

        for(var attempts=0; attempts<5; attempts++)
        {
            // Select candidate source and target neurons. Any neuron can be used as the source. Input neurons
            // should not be used as a target
            var srcNeuronIdx;
            var tgtNeuronIdx;



            // Find all potential inputs, or quit if there are not enough.
            // Neurons cannot be inputs if they are dummy input nodes of a module.
            var potentialInputs = [];

            self.nodes.forEach(function(n)
            {
                if(n.activationFunction.functionID !== 'ModuleInputNeuron')
                    potentialInputs.push(n);
            });


            if (potentialInputs.length < 1)
                return false;

            var potentialOutputs = [];

            // Find all potential outputs, or quit if there are not enough.
            // Neurons cannot be outputs if they are dummy input or output nodes of a module, or network input or bias nodes.
            self.nodes.forEach(function(n)
            {
                if(n.nodeType != NodeType.bias && n.nodeType != NodeType.input &&
                    n.activationFunction.functionID !== 'ModuleInputNeuron'
                    &&  n.activationFunction.functionID !== 'ModuleOutputNeuron')
                    potentialOutputs.push(n);
            });

            if (potentialOutputs.length < 1)
                return false;

            var sourceNeuron = sourceTargetConnect.source || potentialInputs[utilities.next(potentialInputs.length)];
            var targetNeuron = sourceTargetConnect.target || potentialOutputs[utilities.next(potentialOutputs.length)];

            // Check if a connection already exists between these two neurons.
            var sourceID = sourceNeuron.gid;
            var targetID = targetNeuron.gid;

            //we don't allow recurrent connections, we can't let the target layers be <= src
            if(np.disallowRecurrence && targetNeuron.layer <= sourceNeuron.layer)
                continue;

            if(!self.testForExistingConnectionInnovation(sourceID, targetID))
            {
                // Check if a matching mutation has already occured on another genome.
                // If so then re-use the connection ID.
                var connectionKey = "(" + sourceID + "," + targetID + ")";
                var existingConnection = newConnectionTable[connectionKey];
                var newConnection;
                var nextID = NeatGenome.Help.nextInnovationID();
                if(existingConnection==null)
                {	// Create a new connection with a new ID and add it to the Genome.
                    newConnection = new NeatConnection(nextID,
                        (utilities.nextDouble()*np.connectionWeightRange/4.0) - np.connectionWeightRange/8.0,
                        {sourceID: sourceID, targetID: targetID});

//                            new ConnectionGene(ea.NextInnovationId, sourceID, targetID,
//                            (Utilities.NextDouble() * ea.NeatParameters.connectionWeightRange/4.0) - ea.NeatParameters.connectionWeightRange/8.0);

                    // Register the new connection with NewConnectionGeneTable.
                    newConnectionTable[connectionKey] = newConnection;

                    // Add the new gene to this genome. We have a new ID so we can safely append the gene to the end
                    // of the list without risk of breaking the innovation ID order.
                    self.connections.push(newConnection);
                }
                else
                {	// Create a new connection, re-using the ID from existingConnection, and add it to the Genome.
                    newConnection = new NeatConnection(existingConnection.gid,
                        (utilities.nextDouble()*np.connectionWeightRange/4.0) -  np.connectionWeightRange/8.0,
                        {sourceID: sourceID, targetID: targetID});

//                            new ConnectionGene(existingConnection.InnovationId, sourceId, targetID,
//                            (Utilities.NextDouble() * ea.NeatParameters.connectionWeightRange/4.0) - ea.NeatParameters.connectionWeightRange/8.0);

                    // Add the new gene to this genome. We are re-using an ID so we must ensure the connection gene is
                    // inserted into the correct position (sorted by innovation ID).
                    NeatGenome.Help.insertByInnovation(newConnection, self.connections);
//                        connectionGeneList.InsertIntoPosition(newConnection);
                }



                return true;
            }
        }
    }

    // We couldn't find a valid connection to create. Instead of doing nothing lets perform connection
    // weight mutation.
    self.mutate_ConnectionWeights(np);

    return false;
};

NeatGenome.prototype.mutate_ConnectionWeights = function(np)
{
    var self = this;
    // Determine the type of weight mutation to perform.
    var probabilties = [];

    np.connectionMutationParameterGroupList.forEach(function(connMut){
        probabilties.push(connMut.activationProportion);
    });

    // Get a reference to the group we will be using.
    var paramGroup = np.connectionMutationParameterGroupList[utilities.RouletteWheel.singleThrowArray(probabilties)];

    // Perform mutations of the required type.
    if(paramGroup.selectionType== neatParameters.ConnectionSelectionType.proportional)
    {
        var mutationOccured=false;
        var connectionCount = self.connections.length;
        self.connections.forEach(function(connection){

            if(utilities.nextDouble() < paramGroup.proportion)
            {
                self.mutateConnectionWeight(connection, np, paramGroup);
                mutationOccured = true;
            }

        });

        if(!mutationOccured && connectionCount>0)
        {	// Perform at least one mutation. Pick a gene at random.
            self.mutateConnectionWeight(self.connections[utilities.next(connectionCount)], // (Utilities.NextDouble() * connectionCount)],
                np,
                paramGroup);
        }
    }
    else // if(paramGroup.SelectionType==ConnectionSelectionType.FixedQuantity)
    {
        // Determine how many mutations to perform. At least one - if there are any genes.
        var connectionCount = self.connections.length;

        var mutations = Math.min(connectionCount, Math.max(1, paramGroup.quantity));
        if(mutations==0) return;

        // The mutation loop. Here we pick an index at random and scan forward from that point
        // for the first non-mutated gene. This prevents any gene from being mutated more than once without
        // too much overhead. In fact it's optimal for small numbers of mutations where clashes are unlikely
        // to occur.
        for(var i=0; i<mutations; i++)
        {
            // Pick an index at random.
            var index = utilities.next(connectionCount);
            var connection = self.connections[index];

            // Scan forward and find the first non-mutated gene.
            while(self.connections[index].isMutated)
            {	// Increment index. Wrap around back to the start if we go off the end.
                if(++index==connectionCount)
                    index=0;
            }

            // Mutate the gene at 'index'.
            self.mutateConnectionWeight(self.connections[index], np, paramGroup);
            self.connections[index].isMutated = true;
        }

        self.connections.forEach(function(connection){
            //reset if connection has been mutated, in case we go to do more mutations...
            connection.isMutated = false;
        });

    }
};

NeatGenome.prototype.mutateConnectionWeight = function(connection, np, paramGroup)
{
    switch(paramGroup.perturbationType)
    {
        case neatParameters.ConnectionPerturbationType.jiggleEven:
        {
            connection.weight += (utilities.nextDouble()*2-1.0) * paramGroup.perturbationFactor;

            // Cap the connection weight. Large connections weights reduce the effectiveness of the search.
            connection.weight = Math.max(connection.weight, -np.connectionWeightRange/2.0);
            connection.weight = Math.min(connection.weight, np.connectionWeightRange/2.0);
            break;
        }
        //Paul - not implementing cause Randlib.gennor is a terribel terrible function
        //if i need normal distribution, i'll find another javascript source
//            case neatParameters.ConnectionPerturbationType.jiggleND:
//            {
//                connectionGene.weight += RandLib.gennor(0, paramGroup.Sigma);
//
//                // Cap the connection weight. Large connections weights reduce the effectiveness of the search.
//                connectionGene.weight = Math.max(connectionGene.weight, -np.connectionWeightRange/2.0);
//                connectionGene.weight = Math.min(connectionGene.weight, np.connectionWeightRange/2.0);
//                break;
//            }
        case neatParameters.ConnectionPerturbationType.reset:
        {
            // TODO: Precalculate connectionWeightRange / 2.
            connection.weight = (utilities.nextDouble()*np.connectionWeightRange) - np.connectionWeightRange/2.0;
            break;
        }
        default:
        {
            throw "Unexpected ConnectionPerturbationType";
        }
    }
};

/// <summary>
/// If the neuron is a hidden neuron and no connections connect to it then it is redundant.
/// No neuron is redundant that is part of a module (although the module itself might be found redundant separately).
/// </summary>
NeatGenome.prototype.isNeuronRedundant=function(nodeLookup, nid)
{
    var self = this;
    var node = nodeLookup[nid];
    if (node.nodeType != NodeType.hidden
        || node.activationFunction.functionID === 'ModuleInputNeuron'
        || node.activationFunction.functionID === 'ModuleOutputNeuron')
        return false;

    return !self.isNeuronConnected(nid);
};

NeatGenome.prototype.isNeuronConnected = function(nid)
{
    var self = this;
    for(var i=0; i < self.connections.length; i++)
    {
        var connection =  self.connections[i];

        if(connection.sourceID == nid)
            return true;
        if(connection.targetID == nid)
            return true;

    }

    return false;
};


NeatGenome.prototype.mutate_DeleteConnection = function(connection)
{
    var self = this;
    if(self.connections.length ==0)
        return;

    self.nodeLookup = NeatGenome.Help.CreateGIDLookup(self.nodes);

    // Select a connection at random.
    var connectionToDeleteIdx = utilities.next(self.connections.length);

    if(connection){
        for(var i=0; i< self.connections.length; i++){
            if(connection.gid == self.connections[i].gid)
            {
                connectionToDeleteIdx = i;
                break;
            }
        }
    }

    var connectionToDelete = connection || self.connections[connectionToDeleteIdx];

    // Delete the connection.
    self.connections.splice(connectionToDeleteIdx,1);

    var srcIx = -1;
    var tgtIx = -1;

    self.nodes.forEach(function(node,i){

        if(node.sourceID == connectionToDelete.sourceID)
            srcIx = i;

        if(node.targetID == connectionToDelete.targetID)
            tgtIx = i;
    });

    // Remove any neurons that may have been left floating.
    if(self.isNeuronRedundant(self.nodeLookup ,connectionToDelete.sourceID)){
        self.nodes.splice(srcIx,1);//(connectionToDelete.sourceID);
    }

    // Recurrent connection has both end points at the same neuron!
    if(connectionToDelete.sourceID !=connectionToDelete.targetID){
        if(self.isNeuronRedundant(self.nodeLookup, connectionToDelete.targetID))
            self.nodes.splice(tgtIx,1);//neuronGeneList.Remove(connectionToDelete.targetID);
    }
};

NeatGenome.BuildNeuronConnectionLookupTable_NewConnection = function(nodeConnectionLookup,nodeTable, gid, connection, inOrOut)
{
    // Is this neuron already known to the lookup table?
    var lookup = nodeConnectionLookup[gid];

    if(lookup==null)
    {	// Creae a new lookup entry for this neuron Id.
        lookup = {node: nodeTable[gid], incoming: [], outgoing: [] };
        nodeConnectionLookup[gid] = lookup;
    }

    // Register the connection with the NeuronConnectionLookup object.
    lookup[inOrOut].push(connection);
};
NeatGenome.prototype.buildNeuronConnectionLookupTable = function()
{
    var self = this;
    self.nodeLookup = NeatGenome.Help.CreateGIDLookup(self.nodes);

    var nodeConnectionLookup = {};

    self.connections.forEach(function(connection){

        //what node is this connections target? That makes this an incoming connection
        NeatGenome.BuildNeuronConnectionLookupTable_NewConnection(nodeConnectionLookup,
            self.nodeLookup,connection.targetID, connection, 'incoming');

        //what node is this connectino's source? That makes this an outgoing connection for the node
        NeatGenome.BuildNeuronConnectionLookupTable_NewConnection(nodeConnectionLookup,
            self.nodeLookup, connection.sourceID, connection, 'outgoing');
    });

    return nodeConnectionLookup;
};

/// <summary>
/// We define a simple neuron structure as a neuron that has a single outgoing or single incoming connection.
/// With such a structure we can easily eliminate the neuron and shift it's connections to an adjacent neuron.
/// If the neuron's non-linearity was not being used then such a mutation is a simplification of the network
/// structure that shouldn't adversly affect its functionality.
/// </summary>
NeatGenome.prototype.mutate_DeleteSimpleNeuronStructure = function(newConnectionTable, np)
{

    var self = this;

    // We will use the NeuronConnectionLookupTable to find the simple structures.
    var nodeConnectionLookup = self.buildNeuronConnectionLookupTable();


    // Build a list of candidate simple neurons to choose from.
    var simpleNeuronIdList = [];

    for(var lookupKey in nodeConnectionLookup)
    {
        var lookup = nodeConnectionLookup[lookupKey];


        // If we test the connection count with <=1 then we also pick up neurons that are in dead-end circuits,
        // RemoveSimpleNeuron is then able to delete these neurons from the network structure along with any
        // associated connections.
        // All neurons that are part of a module would appear to be dead-ended, but skip removing them anyway.
        if (lookup.node.nodeType == NodeType.hidden
            && !(lookup.node.activationFunction.functionID == 'ModuleInputNeuron')
            && !(lookup.node.activationFunction.functionID == 'ModuleOutputNeuron') ) {
            if((lookup.incoming.length<=1) || (lookup.outgoing.length<=1))
                simpleNeuronIdList.push(lookup.node.gid);
        }
    }

    // Are there any candiate simple neurons?
    if(simpleNeuronIdList.length==0)
    {	// No candidate neurons. As a fallback lets delete a connection.
        self.mutate_DeleteConnection();
        return false;
    }

    // Pick a simple neuron at random.
    var idx = utilities.next(simpleNeuronIdList.length);//Math.floor(utilities.nextDouble() * simpleNeuronIdList.length);
    var nid = simpleNeuronIdList[idx];
    self.removeSimpleNeuron(nodeConnectionLookup, nid, newConnectionTable, np);

    return true;
};

NeatGenome.prototype.removeSimpleNeuron = function(nodeConnectionLookup, nid, newConnectionTable, np)
{
    var self = this;
    // Create new connections that connect all of the incoming and outgoing neurons
    // that currently exist for the simple neuron.
    var lookup = nodeConnectionLookup[nid];

    lookup.incoming.forEach(function(incomingConnection)
    {
        lookup.outgoing.forEach(function(outgoingConnection){

            if(!self.testForExistingConnectionInnovation(incomingConnection.sourceID, outgoingConnection.targetID))
            {	// Connection doesnt already exists.

                // Test for matching connection within NewConnectionGeneTable.
                var connectionKey =  "(" + incomingConnection.sourceID + "," + outgoingConnection.targetID + ")";

                //new ConnectionEndpointsStruct(incomingConnection.SourceNeuronId,
//                   outgoi//ngConnection.TargetNeuronId);
                var existingConnection = newConnectionTable[connectionKey];
                var newConnection;
                var nextID = NeatGenome.Help.nextInnovationID();
                if(existingConnection==null)
                {	// No matching connection found. Create a connection with a new ID.
                    newConnection = new NeatConnection(nextID,
                        (utilities.nextDouble() * np.connectionWeightRange) - np.connectionWeightRange/2.0,
                        {sourceID:incomingConnection.sourceID, targetID: outgoingConnection.targetID});
//                           new ConnectionGene(ea.NextInnovationId,
//                           incomingConnection.SourceNeuronId,
//                           outgoingConnection.TargetNeuronId,
//                           (Utilities.NextDouble() * ea.NeatParameters.connectionWeightRange) - ea.NeatParameters.connectionWeightRange/2.0);

                    // Register the new ID with NewConnectionGeneTable.
                    newConnectionTable[connectionKey] = newConnection;

                    // Add the new gene to the genome.
                    self.connections.push(newConnection);
                }
                else
                {	// Matching connection found. Re-use its ID.
                    newConnection = new NeatConnection(existingConnection.gid,
                        (utilities.nextDouble() * np.connectionWeightRange) - np.connectionWeightRange/2.0,
                        {sourceID:incomingConnection.sourceID, targetID: outgoingConnection.targetID});

                    // Add the new gene to the genome. Use InsertIntoPosition() to ensure we don't break the sort
                    // order of the connection genes.
                    NeatGenome.Help.insertByInnovation(newConnection, self.connections);
                }

            }

        });

    });


    lookup.incoming.forEach(function(incomingConnection, inIx)
    {
        for(var i=0; i < self.connections.length; i++)
        {
            if(self.connections[i].gid == incomingConnection.gid)
            {
                self.connections.splice(i,1);
                break;
            }
        }
    });

    lookup.outgoing.forEach(function(outgoingConnection, inIx)
    {
        if(outgoingConnection.targetID != nid)
        {
            for(var i=0; i < self.connections.length; i++)
            {
                if(self.connections[i].gid == outgoingConnection.gid)
                {
                    self.connections.splice(i,1);
                    break;
                }
            }
        }
    });

    // Delete the simple neuron - it no longer has any connections to or from it.
    for(var i=0; i < self.nodes.length; i++)
    {
        if(self.nodes[i].gid == nid)
        {
            self.nodes.splice(i,1);
            break;
        }
    }


};

});

require.register("optimuslime~neatjs@master/neatHelp/neatDecoder.js", function (exports, module) {
/**
 * Module dependencies.
 */

//pull in our cppn lib
var cppnjs = require("optimuslime~cppnjs@master");

//grab our activation factory, cppn object and connections
var CPPNactivationFactory = cppnjs.cppnActivationFactory;
var CPPN = cppnjs.cppn;
var CPPNConnection = cppnjs.cppnConnection;

//going to need to read node types appropriately
var NodeType = require("optimuslime~neatjs@master/types/nodeType.js");

/**
 * Expose `NeatDecoder`.
 */

var neatDecoder = {};

module.exports = neatDecoder;

/**
 * Decodes a neatGenome in a cppn.
 *
 * @param {Object} ng
 * @param {String} activationFunction
 * @api public
 */
neatDecoder.DecodeToFloatFastConcurrentNetwork = function(ng, activationFunction)
{
    var outputNeuronCount = ng.outputNodeCount;
    var neuronGeneCount = ng.nodes.length;

    var biasList = [];
    for(var b=0; b< neuronGeneCount; b++)
        biasList.push(0);

    // Slightly inefficient - determine the number of bias nodes. Fortunately there is not actually
    // any reason to ever have more than one bias node - although there may be 0.

    var activationFunctionArray = [];
    for(var i=0; i < neuronGeneCount; i++){
        activationFunctionArray.push("");
    }

    var nodeIdx=0;
    for(; nodeIdx<neuronGeneCount; nodeIdx++)
    {
        activationFunctionArray[nodeIdx] = CPPNactivationFactory.getActivationFunction(ng.nodes[nodeIdx].activationFunction);
        if(ng.nodes[nodeIdx].nodeType !=  NodeType.bias)
            break;
    }
    var biasNodeCount = nodeIdx;
    var inputNeuronCount = ng.inputNodeCount;
    for (; nodeIdx < neuronGeneCount; nodeIdx++)
    {
        activationFunctionArray[nodeIdx] = CPPNactivationFactory.getActivationFunction(ng.nodes[nodeIdx].activationFunction);
        biasList[nodeIdx] = ng.nodes[nodeIdx].bias;
    }

    // ConnectionGenes point to a neuron ID. We need to map this ID to a 0 based index for
    // efficiency.

    // Use a quick heuristic to determine which will be the fastest technique for mapping the connection end points
    // to neuron indexes. This is heuristic is not 100% perfect but has been found to be very good in in real word
    // tests. Feel free to perform your own calculation and create a more intelligent heuristic!
    var  connectionCount= ng.connections.length;

    var fastConnectionArray = [];
    for(var i=0; i< connectionCount; i++){
        fastConnectionArray.push(new CPPNConnection(0,0,0));
    }

    var nodeTable = {};// neuronIndexTable = new Hashtable(neuronGeneCount);
    for(var i=0; i<neuronGeneCount; i++)
        nodeTable[ng.nodes[i].gid] = i;

    for(var connectionIdx=0; connectionIdx<connectionCount; connectionIdx++)
    {
        //fastConnectionArray[connectionIdx] = new FloatFastConnection();
        //Note. Binary search algorithm assume that neurons are ordered by their innovation Id.
        var connection = ng.connections[connectionIdx];
        fastConnectionArray[connectionIdx].sourceIdx = nodeTable[connection.sourceID];
        fastConnectionArray[connectionIdx].targetIdx = nodeTable[connection.targetID];

        //save this for testing!
//                System.Diagnostics.Debug.Assert(fastConnectionArray[connectionIdx].sourceNeuronIdx>=0 && fastConnectionArray[connectionIdx].targetNeuronIdx>=0, "invalid idx");

        fastConnectionArray[connectionIdx].weight = connection.weight;
        fastConnectionArray[connectionIdx].learningRate = connection.learningRate;
        fastConnectionArray[connectionIdx].a = connection.a;
        fastConnectionArray[connectionIdx].b = connection.b;
        fastConnectionArray[connectionIdx].c = connection.c;

//                connectionIdx++;
    }

    // Now sort the connection array on sourceNeuronIdx, secondary sort on targetNeuronIdx.
    // Using Array.Sort is 10 times slower than the hand-coded sorting routine. See notes on that routine for more
    // information. Also note that in tests that this sorting did no t actually improve the speed of the network!
    // However, it may have a benefit for CPUs with small caches or when networks are very large, and since the new
    // sort takes up hardly any time for even large networks, it seems reasonable to leave in the sort.
    //Array.Sort(fastConnectionArray, fastConnectionComparer);
    //if(fastConnectionArray.Length>1)
    //	QuickSortFastConnections(0, fastConnectionArray.Length-1);

    return new CPPN(biasNodeCount, inputNeuronCount,
        outputNeuronCount, neuronGeneCount,
        fastConnectionArray, biasList, activationFunctionArray);

};


});

require.register("optimuslime~neatjs@master/neatHelp/neatHelp.js", function (exports, module) {
/**
* Module dependencies.
*/
var uuid = require("optimuslime~win-utils@master").cuid;
/**
* Expose `neatHelp`.
*/

var neatHelp = {};

module.exports = neatHelp;

//define helper types!
neatHelp.CorrelationType =
{
    matchedConnectionGenes : 0,
    disjointConnectionGene : 1,
    excessConnectionGene : 2
};

neatHelp.CorrelationStatistics = function(){

    var self= this;
    self.matchingCount = 0;
    self.disjointConnectionCount = 0;
    self.excessConnectionCount = 0;
    self.connectionWeightDelta = 0;
};

neatHelp.CorrelationItem = function(correlationType, conn1, conn2)
{
    var self= this;
    self.correlationType = correlationType;
    self.connection1 = conn1;
    self.connection2 = conn2;
};


neatHelp.CorrelationResults = function()
{
    var self = this;

    self.correlationStatistics = new neatHelp.CorrelationStatistics();
    self.correlationList = [];

};

//TODO: Integrity check by GlobalID
neatHelp.CorrelationResults.prototype.performIntegrityCheckByInnovation = function()
{
    var prevInnovationId= "";

    var self = this;

    for(var i=0; i< self.correlationList.length; i++){
        var correlationItem =  self.correlationList[i];

        switch(correlationItem.correlationType)
        {
            // Disjoint and excess genes.
            case neatHelp.CorrelationType.disjointConnectionGene:
            case neatHelp.CorrelationType.excessConnectionGene:
                // Disjoint or excess gene.
                if(		(!correlationItem.connection1 && !correlationItem.connection2)
                    ||	(correlationItem.connection1 && correlationItem.connection2))
                {	// Precisely one gene should be present.
                    return false;
                }
                if(correlationItem.connection1)
                {
                    if(uuid.isLessThan(correlationItem.connection1.gid, prevInnovationId) || correlationItem.connection1.gid == prevInnovationId)
                        return false;

                    prevInnovationId = correlationItem.connection1.gid;
                }
                else // ConnectionGene2 is present.
                {
                    if(uuid.isLessThan(correlationItem.connection2.gid, prevInnovationId) || correlationItem.connection2.gid == prevInnovationId)
                        return false;

                    prevInnovationId = correlationItem.connection2.gid;
                }

                break;
            case neatHelp.CorrelationType.matchedConnectionGenes:

                if(!correlationItem.connection1 || !correlationItem.connection2)
                    return false;

                if(		(correlationItem.connection1.gid != correlationItem.connection2.gid)
                    ||	(correlationItem.connection1.sourceID != correlationItem.connection2.sourceID)
                    ||	(correlationItem.connection1.targetID != correlationItem.connection2.targetID))
                    return false;

                // Innovation ID's should be in order and not duplicated.
                if(uuid.isLessThan(correlationItem.connection1.gid, prevInnovationId) || correlationItem.connection1.gid == prevInnovationId)
                    return false;

                prevInnovationId = correlationItem.connection1.gid;

                break;
        }
    }

    return true;
};

});

require.register("optimuslime~neatjs@master/neatHelp/neatParameters.js", function (exports, module) {
/**
 * Module dependencies.
 */
//none

/**
 * Expose `neatParameters`.
 */
module.exports = NeatParameters;

var	DEFAULT_POPULATION_SIZE = 150;
var  DEFAULT_P_INITIAL_POPULATION_INTERCONNECTIONS = 1.00;//DAVID 0.05F;

var DEFAULT_P_OFFSPRING_ASEXUAL = 0.5;
var DEFAULT_P_OFFSPRING_SEXUAL = 0.5;
var DEFAULT_P_INTERSPECIES_MATING = 0.01;

var DEFAULT_P_DISJOINGEXCESSGENES_RECOMBINED = 0.1;

//----- High level mutation proportions
var DEFAULT_P_MUTATE_CONNECTION_WEIGHTS = 0.988;
var DEFAULT_P_MUTATE_ADD_NODE = 0.002;
var DEFAULT_P_MUTATE_ADD_MODULE = 0.0;
var DEFAULT_P_MUTATE_ADD_CONNECTION = 0.018;
var DEFAULT_P_MUTATE_CHANGE_ACTIVATIONS = 0.001;
var DEFAULT_P_MUTATE_DELETE_CONNECTION = 0.001;
var DEFAULT_P_MUTATE_DELETE_SIMPLENEURON = 0.00;
var DEFAULT_N_MUTATE_ACTIVATION = 0.01;

//-----
var DEFAULT_COMPATIBILITY_THRESHOLD = 8 ;
var DEFAULT_COMPATIBILITY_DISJOINT_COEFF = 1.0;
var DEFAULT_COMPATIBILITY_EXCESS_COEFF = 1.0;
var DEFAULT_COMPATIBILITY_WEIGHTDELTA_COEFF = 0.05;

var DEFAULT_ELITISM_PROPORTION = 0.2;
var DEFAULT_SELECTION_PROPORTION = 0.2;

var DEFAULT_TARGET_SPECIES_COUNT_MIN = 6;
var DEFAULT_TARGET_SPECIES_COUNT_MAX = 10;

var DEFAULT_SPECIES_DROPOFF_AGE = 200;

var DEFAULT_PRUNINGPHASE_BEGIN_COMPLEXITY_THRESHOLD = 50;
var DEFAULT_PRUNINGPHASE_BEGIN_FITNESS_STAGNATION_THRESHOLD = 10;
var DEFAULT_PRUNINGPHASE_END_COMPLEXITY_STAGNATION_THRESHOLD = 15;

var DEFAULT_CONNECTION_WEIGHT_RANGE = 10.0;
//		public const double DEFAULT_CONNECTION_MUTATION_SIGMA = 0.015;

var DEFAULT_ACTIVATION_PROBABILITY = 1.0;

NeatParameters.ConnectionPerturbationType =
{
    /// <summary>
    /// Reset weights.
    /// </summary>
    reset : 0,

        /// <summary>
        /// Jiggle - even distribution
        /// </summary>
        jiggleEven :1

        /// <summary>
        /// Jiggle - normal distribution
        /// </summary>
//            jiggleND : 2
};
NeatParameters.ConnectionSelectionType =
{
    /// <summary>
    /// Select a proportion of the weights in a genome.
    /// </summary>
    proportional :0,

        /// <summary>
        /// Select a fixed number of weights in a genome.
        /// </summary>
        fixedQuantity :1
};

NeatParameters.ConnectionMutationParameterGroup = function(
     activationProportion,
     perturbationType,
     selectionType,
     proportion,
     quantity,
     perturbationFactor,
     sigma)
{
    var self = this;
    /// <summary>
    /// This group's activation proportion - relative to the totalled
    /// ActivationProportion for all groups.
    /// </summary>
    self.activationProportion = activationProportion;

    /// <summary>
    /// The type of mutation that this group represents.
    /// </summary>
    self.perturbationType = perturbationType;

    /// <summary>
    /// The type of connection selection that this group represents.
    /// </summary>
    self.selectionType = selectionType;

    /// <summary>
    /// Specifies the proportion for SelectionType.Proportional
    /// </summary>
    self.proportion=proportion ;

    /// <summary>
    /// Specifies the quantity for SelectionType.FixedQuantity
    /// </summary>
    self.quantity= quantity;

    /// <summary>
    /// The perturbation factor for ConnectionPerturbationType.JiggleEven.
    /// </summary>
    self.perturbationFactor= perturbationFactor;

    /// <summary>
    /// Sigma for for ConnectionPerturbationType.JiggleND.
    /// </summary>
    self.sigma= sigma;
};

NeatParameters.ConnectionMutationParameterGroup.Copy = function(copyFrom)
{
    return new NeatParameters.ConnectionMutationParameterGroup(
        copyFrom.ActivationProportion,
         copyFrom.PerturbationType,
           copyFrom.SelectionType,
         copyFrom.Proportion,
      copyFrom.Quantity,
       copyFrom.PerturbationFactor,
     copyFrom.Sigma
    );
};

function NeatParameters()
{
    var self = this;
    self.histogramBins = [];
    self.archiveThreshold=3.00;
    self.tournamentSize=4;
    self.noveltySearch=false;
    self.noveltyHistogram=false;
    self.noveltyFixed=false;
    self.noveltyFloat=false;
    self.multiobjective=false;

    self.allowSelfConnections = false;

    self.populationSize = DEFAULT_POPULATION_SIZE;
    self.pInitialPopulationInterconnections = DEFAULT_P_INITIAL_POPULATION_INTERCONNECTIONS;

    self.pOffspringAsexual = DEFAULT_P_OFFSPRING_ASEXUAL;
    self.pOffspringSexual = DEFAULT_P_OFFSPRING_SEXUAL;
    self.pInterspeciesMating = DEFAULT_P_INTERSPECIES_MATING;

    self.pDisjointExcessGenesRecombined = DEFAULT_P_DISJOINGEXCESSGENES_RECOMBINED;

    //----- High level mutation proportions
    self.pMutateConnectionWeights	= DEFAULT_P_MUTATE_CONNECTION_WEIGHTS;
    self.pMutateAddNode = DEFAULT_P_MUTATE_ADD_NODE;
    self.pMutateAddModule = DEFAULT_P_MUTATE_ADD_MODULE;
    self.pMutateAddConnection = DEFAULT_P_MUTATE_ADD_CONNECTION;
    self.pMutateDeleteConnection		= DEFAULT_P_MUTATE_DELETE_CONNECTION;
    self.pMutateDeleteSimpleNeuron	= DEFAULT_P_MUTATE_DELETE_SIMPLENEURON;
    self.pMutateChangeActivations = DEFAULT_P_MUTATE_CHANGE_ACTIVATIONS;
    self.pNodeMutateActivationRate = DEFAULT_N_MUTATE_ACTIVATION;

    //----- Build a default ConnectionMutationParameterGroupList.
    self.connectionMutationParameterGroupList = [];

    self.connectionMutationParameterGroupList.push(new NeatParameters.ConnectionMutationParameterGroup(0.125, NeatParameters.ConnectionPerturbationType.jiggleEven,
        NeatParameters.ConnectionSelectionType.proportional, 0.5, 0, 0.05, 0.0));

    self.connectionMutationParameterGroupList.push(new NeatParameters.ConnectionMutationParameterGroup(0.5, NeatParameters.ConnectionPerturbationType.jiggleEven,
        NeatParameters.ConnectionSelectionType.proportional, 0.1, 0, 0.05, 0.0));

    self.connectionMutationParameterGroupList.push(new NeatParameters.ConnectionMutationParameterGroup(0.125, NeatParameters.ConnectionPerturbationType.jiggleEven,
        NeatParameters.ConnectionSelectionType.fixedQuantity, 0.0, 1, 0.05, 0.0));

    self.connectionMutationParameterGroupList.push(new NeatParameters.ConnectionMutationParameterGroup(0.125, NeatParameters.ConnectionPerturbationType.reset,
        NeatParameters.ConnectionSelectionType.proportional, 0.1, 0, 0.0, 0.0));

    self.connectionMutationParameterGroupList.push(new NeatParameters.ConnectionMutationParameterGroup(0.125, NeatParameters.ConnectionPerturbationType.reset,
        NeatParameters.ConnectionSelectionType.fixedQuantity, 0.0, 1, 0.0, 0.0));

    //-----
    self.compatibilityThreshold = DEFAULT_COMPATIBILITY_THRESHOLD;
    self.compatibilityDisjointCoeff = DEFAULT_COMPATIBILITY_DISJOINT_COEFF;
    self.compatibilityExcessCoeff = DEFAULT_COMPATIBILITY_EXCESS_COEFF;
    self.compatibilityWeightDeltaCoeff = DEFAULT_COMPATIBILITY_WEIGHTDELTA_COEFF;

    self.elitismProportion = DEFAULT_ELITISM_PROPORTION;
    self.selectionProportion = DEFAULT_SELECTION_PROPORTION;

    self.targetSpeciesCountMin = DEFAULT_TARGET_SPECIES_COUNT_MIN;
    self.targetSpeciesCountMax = DEFAULT_TARGET_SPECIES_COUNT_MAX;

    self.pruningPhaseBeginComplexityThreshold = DEFAULT_PRUNINGPHASE_BEGIN_COMPLEXITY_THRESHOLD;
    self.pruningPhaseBeginFitnessStagnationThreshold = DEFAULT_PRUNINGPHASE_BEGIN_FITNESS_STAGNATION_THRESHOLD;
    self.pruningPhaseEndComplexityStagnationThreshold = DEFAULT_PRUNINGPHASE_END_COMPLEXITY_STAGNATION_THRESHOLD;

    self.speciesDropoffAge = DEFAULT_SPECIES_DROPOFF_AGE;

    self.connectionWeightRange = DEFAULT_CONNECTION_WEIGHT_RANGE;

    //DAVID
    self.activationProbabilities = [];//new double[4];
    self.activationProbabilities.push(DEFAULT_ACTIVATION_PROBABILITY);
    self.activationProbabilities.push(0);
    self.activationProbabilities.push(0);
    self.activationProbabilities.push(0);
};

NeatParameters.Copy = function(copyFrom)
{
    var self = new NeatParameters();

    //paul - joel originally
    self.noveltySearch = copyFrom.noveltySearch;
    self.noveltyHistogram = copyFrom.noveltyHistogram;
    self.noveltyFixed = copyFrom.noveltyFixed;
    self.noveltyFloat = copyFrom.noveltyFloat;
    self.histogramBins = copyFrom.histogramBins;


    self.allowSelfConnections = copyFrom.allowSelfConnections;

    self.populationSize = copyFrom.populationSize;

    self.pOffspringAsexual = copyFrom.pOffspringAsexual;
    self.pOffspringSexual = copyFrom.pOffspringSexual;
    self.pInterspeciesMating = copyFrom.pInterspeciesMating;

    self.pDisjointExcessGenesRecombined = copyFrom.pDisjointExcessGenesRecombined;

    self.pMutateConnectionWeights = copyFrom.pMutateConnectionWeights;
    self.pMutateAddNode = copyFrom.pMutateAddNode;
    self.pMutateAddModule = copyFrom.pMutateAddModule;
    self.pMutateAddConnection = copyFrom.pMutateAddConnection;
    self.pMutateDeleteConnection = copyFrom.pMutateDeleteConnection;
    self.pMutateDeleteSimpleNeuron = copyFrom.pMutateDeleteSimpleNeuron;

    // Copy the list.
    self.connectionMutationParameterGroupList = [];
    copyFrom.connectionMutationParameterGroupList.forEach(function(c){
        self.connectionMutationParameterGroupList.push(NeatParameters.ConnectionMutationParameterGroup.Copy(c));

    });

    self.compatibilityThreshold = copyFrom.compatibilityThreshold;
    self.compatibilityDisjointCoeff = copyFrom.compatibilityDisjointCoeff;
    self.compatibilityExcessCoeff = copyFrom.compatibilityExcessCoeff;
    self.compatibilityWeightDeltaCoeff = copyFrom.compatibilityWeightDeltaCoeff;

    self.elitismProportion = copyFrom.elitismProportion;
    self.selectionProportion = copyFrom.selectionProportion;

    self.targetSpeciesCountMin = copyFrom.targetSpeciesCountMin;
    self.targetSpeciesCountMax = copyFrom.targetSpeciesCountMax;

    self.pruningPhaseBeginComplexityThreshold = copyFrom.pruningPhaseBeginComplexityThreshold;
    self.pruningPhaseBeginFitnessStagnationThreshold = copyFrom.pruningPhaseBeginFitnessStagnationThreshold;
    self.pruningPhaseEndComplexityStagnationThreshold = copyFrom.pruningPhaseEndComplexityStagnationThreshold;

    self.speciesDropoffAge = copyFrom.speciesDropoffAge;

    self.connectionWeightRange = copyFrom.connectionWeightRange;

    return self;
};



});

require.register("optimuslime~neatjs@master/types/nodeType.js", function (exports, module) {
var NodeType =
{
    bias : "Bias",
    input: "Input",
    output: "Output",
    hidden: "Hidden",
    other : "Other"
};

module.exports = NodeType;
});

require.register("optimuslime~neatjs@master/utility/genomeSharpToJS.js", function (exports, module) {
//Convert between C# SharpNEAT Genotype encoded in XML into a JS genotype in JSON
//pretty simple

/**
 * Module dependencies.
 */

var NeatGenome = require("optimuslime~neatjs@master/genome/neatGenome.js");
var NeatNode = require("optimuslime~neatjs@master/genome/neatNode.js");
var NeatConnection = require("optimuslime~neatjs@master/genome/neatConnection.js");
var NodeType = require("optimuslime~neatjs@master/types/nodeType.js");


/**
 * Expose `GenomeConverter`.
 */

var converter = {};

//we export the convert object, with two functions
module.exports = converter;

converter.NeuronTypeToNodeType = function(type)
{
    switch(type)
    {
        case "bias":
            return NodeType.bias;
        case "in":
            return NodeType.input;
        case "out":
            return NodeType.output;
        case "hid":
            return NodeType.hidden;
        default:
            throw new Error("inpropper C# neuron type detected");
    }
};

converter.ConvertCSharpToJS = function(xmlGenome)
{

    //we need to parse through a c# version of genome, and make a js genome from it

    var aNeurons = xmlGenome['neurons']['neuron'] || xmlGenome['neurons'];
    var aConnections = xmlGenome['connections']['connection'] || xmlGenome['connections'];


    //we will use nodes and connections to make our genome
    var nodes = [], connections = [];
    var inCount = 0, outCount = 0;

    for(var i=0; i < aNeurons.length; i++)
    {
        var csNeuron = aNeurons[i];
        var jsNode = new NeatNode(csNeuron.id, csNeuron.activationFunction, csNeuron.layer, {type: converter.NeuronTypeToNodeType(csNeuron.type)});
        nodes.push(jsNode);

        if(csNeuron.type == 'in') inCount++;
        else if(csNeuron.type == 'out') outCount++;
    }

    for(var i=0; i < aConnections.length; i++)
    {
        var csConnection = aConnections[i];
        var jsConnection = new NeatConnection(csConnection['innov-id'], csConnection.weight, {sourceID:csConnection['src-id'], targetID: csConnection['tgt-id']});
        connections.push(jsConnection);
    }

    var ng = new NeatGenome(xmlGenome['id'], nodes, connections, inCount, outCount);
    ng.adaptable = (xmlGenome['adaptable'] == 'True');
    ng.modulated = (xmlGenome['modulated'] == 'True');
    ng.fitness = xmlGenome['fitness'];
    ng.realFitness = xmlGenome['realfitness'];
    ng.age = xmlGenome['age'];

    return ng;
};

});

require.modules["optimuslime-neatjs"] = require.modules["optimuslime~neatjs@master"];
require.modules["optimuslime~neatjs"] = require.modules["optimuslime~neatjs@master"];
require.modules["neatjs"] = require.modules["optimuslime~neatjs@master"];


require.register("component~event@0.1.4", function (exports, module) {
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
});

require.modules["component-event"] = require.modules["component~event@0.1.4"];
require.modules["component~event"] = require.modules["component~event@0.1.4"];
require.modules["event"] = require.modules["component~event@0.1.4"];


require.register("component~query@0.0.3", function (exports, module) {
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});

require.modules["component-query"] = require.modules["component~query@0.0.3"];
require.modules["component~query"] = require.modules["component~query@0.0.3"];
require.modules["query"] = require.modules["component~query@0.0.3"];


require.register("component~matches-selector@master", function (exports, module) {
/**
 * Module dependencies.
 */

var query = require("component~query@0.0.3");

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});

require.modules["component-matches-selector"] = require.modules["component~matches-selector@master"];
require.modules["component~matches-selector"] = require.modules["component~matches-selector@master"];
require.modules["matches-selector"] = require.modules["component~matches-selector@master"];


require.register("discore~closest@0.1.3", function (exports, module) {
var matches = require("component~matches-selector@master")

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});

require.modules["discore-closest"] = require.modules["discore~closest@0.1.3"];
require.modules["discore~closest"] = require.modules["discore~closest@0.1.3"];
require.modules["closest"] = require.modules["discore~closest@0.1.3"];


require.register("component~delegate@0.2.2", function (exports, module) {
/**
 * Module dependencies.
 */

var closest = require("discore~closest@0.1.3")
  , event = require("component~event@0.1.4");

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});

require.modules["component-delegate"] = require.modules["component~delegate@0.2.2"];
require.modules["component~delegate"] = require.modules["component~delegate@0.2.2"];
require.modules["delegate"] = require.modules["component~delegate@0.2.2"];


require.register("component~events@master", function (exports, module) {

/**
 * Module dependencies.
 */

var events = require("component~event@0.1.4");
var delegate = require("component~delegate@0.2.2");

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});

require.modules["component-events"] = require.modules["component~events@master"];
require.modules["component~events"] = require.modules["component~events@master"];
require.modules["events"] = require.modules["component~events@master"];


require.register("ramitos~resize@master", function (exports, module) {
var binds = {};

module.exports.bind = function (element, cb, ms) {
  if(!binds[element]) binds[element] = {};
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  if(!ms) ms = 250;
  
  binds[element][cb] = setInterval(function () {
    if((width === element.offsetWidth) && (height === element.offsetHeight)) return;
    height = element.offsetHeight;
    width = element.offsetWidth;
    cb(element);
  }, ms);
};

module.exports.unbind = function (element, cb) {
  if(!binds[element][cb]) return;
  clearInterval(binds[element][cb]);
};
});

require.modules["ramitos-resize"] = require.modules["ramitos~resize@master"];
require.modules["ramitos~resize"] = require.modules["ramitos~resize@master"];
require.modules["resize"] = require.modules["ramitos~resize@master"];


require.register("component~indexof@0.0.1", function (exports, module) {

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});

require.modules["component-indexof"] = require.modules["component~indexof@0.0.1"];
require.modules["component~indexof"] = require.modules["component~indexof@0.0.1"];
require.modules["indexof"] = require.modules["component~indexof@0.0.1"];


require.register("component~classes@master", function (exports, module) {
/**
 * Module dependencies.
 */

var index = require("component~indexof@0.0.1");

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});

require.modules["component-classes"] = require.modules["component~classes@master"];
require.modules["component~classes"] = require.modules["component~classes@master"];
require.modules["classes"] = require.modules["component~classes@master"];


require.register("component~bind@1.0.0", function (exports, module) {
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});

require.modules["component-bind"] = require.modules["component~bind@1.0.0"];
require.modules["component~bind"] = require.modules["component~bind@1.0.0"];
require.modules["bind"] = require.modules["component~bind@1.0.0"];


require.register("component~trim@0.0.1", function (exports, module) {

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

});

require.modules["component-trim"] = require.modules["component~trim@0.0.1"];
require.modules["component~trim"] = require.modules["component~trim@0.0.1"];
require.modules["trim"] = require.modules["component~trim@0.0.1"];


require.register("component~keyname@0.0.1", function (exports, module) {

/**
 * Key name map.
 */

var map = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta'
};

/**
 * Return key name for `n`.
 *
 * @param {Number} n
 * @return {String}
 * @api public
 */

module.exports = function(n){
  return map[n];
};
});

require.modules["component-keyname"] = require.modules["component~keyname@0.0.1"];
require.modules["component~keyname"] = require.modules["component~keyname@0.0.1"];
require.modules["keyname"] = require.modules["component~keyname@0.0.1"];


require.register("component~props@1.1.2", function (exports, module) {
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[$a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

});

require.modules["component-props"] = require.modules["component~props@1.1.2"];
require.modules["component~props"] = require.modules["component~props@1.1.2"];
require.modules["props"] = require.modules["component~props@1.1.2"];


require.register("component~to-function@2.0.5", function (exports, module) {

/**
 * Module Dependencies
 */

var expr;
try {
  expr = require("component~props@1.1.2");
} catch(e) {
  expr = require("component~props@1.1.2");
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  };
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  };
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

});

require.modules["component-to-function"] = require.modules["component~to-function@2.0.5"];
require.modules["component~to-function"] = require.modules["component~to-function@2.0.5"];
require.modules["to-function"] = require.modules["component~to-function@2.0.5"];


require.register("component~type@1.0.0", function (exports, module) {

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});

require.modules["component-type"] = require.modules["component~type@1.0.0"];
require.modules["component~type"] = require.modules["component~type@1.0.0"];
require.modules["type"] = require.modules["component~type@1.0.0"];


require.register("component~each@0.2.5", function (exports, module) {

/**
 * Module dependencies.
 */

try {
  var type = require("component~type@1.0.0");
} catch (err) {
  var type = require("component~type@1.0.0");
}

var toFunction = require("component~to-function@2.0.5");

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`
 * in optional context `ctx`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @param {Object} [ctx]
 * @api public
 */

module.exports = function(obj, fn, ctx){
  fn = toFunction(fn);
  ctx = ctx || this;
  switch (type(obj)) {
    case 'array':
      return array(obj, fn, ctx);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn, ctx);
      return object(obj, fn, ctx);
    case 'string':
      return string(obj, fn, ctx);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function string(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function object(obj, fn, ctx) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn.call(ctx, key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function array(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj[i], i);
  }
}

});

require.modules["component-each"] = require.modules["component~each@0.2.5"];
require.modules["component~each"] = require.modules["component~each@0.2.5"];
require.modules["each"] = require.modules["component~each@0.2.5"];


require.register("component~set@1.0.0", function (exports, module) {

/**
 * Expose `Set`.
 */

module.exports = Set;

/**
 * Initialize a new `Set` with optional `vals`
 *
 * @param {Array} vals
 * @api public
 */

function Set(vals) {
  if (!(this instanceof Set)) return new Set(vals);
  this.vals = [];
  if (vals) {
    for (var i = 0; i < vals.length; ++i) {
      this.add(vals[i]);
    }
  }
}

/**
 * Add `val`.
 *
 * @param {Mixed} val
 * @api public
 */

Set.prototype.add = function(val){
  if (this.has(val)) return;
  this.vals.push(val);
};

/**
 * Check if this set has `val`.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api public
 */

Set.prototype.has = function(val){
  return !! ~this.indexOf(val);
};

/**
 * Return the indexof `val`.
 *
 * @param {Mixed} val
 * @return {Number}
 * @api private
 */

Set.prototype.indexOf = function(val){
  for (var i = 0, len = this.vals.length; i < len; ++i) {
    var obj = this.vals[i];
    if (obj.equals && obj.equals(val)) return i;
    if (obj == val) return i;
  }
  return -1;
};

/**
 * Iterate each member and invoke `fn(val)`.
 *
 * @param {Function} fn
 * @return {Set}
 * @api public
 */

Set.prototype.each = function(fn){
  for (var i = 0; i < this.vals.length; ++i) {
    fn(this.vals[i]);
  }
  return this;
};

/**
 * Return the values as an array.
 *
 * @return {Array}
 * @api public
 */

Set.prototype.values = 
Set.prototype.toJSON = function(){
  return this.vals;
};

/**
 * Return the set size.
 *
 * @return {Number}
 * @api public
 */

Set.prototype.size = function(){
  return this.vals.length;
};

/**
 * Empty the set and return old values.
 *
 * @return {Array}
 * @api public
 */

Set.prototype.clear = function(){
  var old = this.vals;
  this.vals = [];
  return old;
};

/**
 * Remove `val`, returning __true__ when present, otherwise __false__.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

Set.prototype.remove = function(val){
  var i = this.indexOf(val);
  if (~i) this.vals.splice(i, 1);
  return !! ~i;
};

/**
 * Perform a union on `set`.
 *
 * @param {Set} set
 * @return {Set} new set
 * @api public
 */

Set.prototype.union = function(set){
  var ret = new Set;
  var a = this.vals;
  var b = set.vals;
  for (var i = 0; i < a.length; ++i) ret.add(a[i]);
  for (var i = 0; i < b.length; ++i) ret.add(b[i]);
  return ret;
};

/**
 * Perform an intersection on `set`.
 *
 * @param {Set} set
 * @return {Set} new set
 * @api public
 */

Set.prototype.intersect = function(set){
  var ret = new Set;
  var a = this.vals;
  var b = set.vals;

  for (var i = 0; i < a.length; ++i) {
    if (set.has(a[i])) {
      ret.add(a[i]);
    }
  }

  for (var i = 0; i < b.length; ++i) {
    if (this.has(b[i])) {
      ret.add(b[i]);
    }
  }

  return ret;
};

/**
 * Check if the set is empty.
 *
 * @return {Boolean}
 * @api public
 */

Set.prototype.isEmpty = function(){
  return 0 == this.vals.length;
};


});

require.modules["component-set"] = require.modules["component~set@1.0.0"];
require.modules["component~set"] = require.modules["component~set@1.0.0"];
require.modules["set"] = require.modules["component~set@1.0.0"];


require.register("stephenmathieson~normalize@0.0.1", function (exports, module) {

/**
 * Normalize the events provided to `fn`
 *
 * @api public
 * @param {Function|Event} fn
 * @return {Function|Event}
 */

exports = module.exports = function (fn) {
  // handle functions which are passed an event
  if (typeof fn === 'function') {
    return function (event) {
      event = exports.normalize(event);
      fn.call(this, event);
    };
  }

  // just normalize the event
  return exports.normalize(fn);
};

/**
 * Normalize the given `event`
 *
 * @api private
 * @param {Event} event
 * @return {Event}
 */

exports.normalize = function (event) {
  event = event || window.event;

  event.target = event.target || event.srcElement;

  event.which = event.which ||  event.keyCode || event.charCode;

  event.preventDefault = event.preventDefault || function () {
    this.returnValue = false;
  };

  event.stopPropagation = event.stopPropagation || function () {
    this.cancelBubble = true;
  };

  return event;
};

});

require.modules["stephenmathieson-normalize"] = require.modules["stephenmathieson~normalize@0.0.1"];
require.modules["stephenmathieson~normalize"] = require.modules["stephenmathieson~normalize@0.0.1"];
require.modules["normalize"] = require.modules["stephenmathieson~normalize@0.0.1"];


require.register("component~pillbox@master", function (exports, module) {
/**
 * Module dependencies.
 */

var Emitter = require("component~emitter@master")
  , keyname = require("component~keyname@0.0.1")
  , events = require("component~events@master")
  , each = require("component~each@0.2.5")
  , Set = require("component~set@1.0.0")
  , bind = require("component~bind@1.0.0")
  , trim = require("component~trim@0.0.1")
  , normalize = require("stephenmathieson~normalize@0.0.1");

/**
 * Expose `Pillbox`.
 */

module.exports = Pillbox

/**
 * Initialize a `Pillbox` with the given
 * `input` element and `options`.
 *
 * @param {Element} input
 * @param {Object} options
 * @api public
 */

function Pillbox(input, options) {
  if (!(this instanceof Pillbox)) return new Pillbox(input, options);
  this.options = options || {}
  this.input = input;
  this.tags = new Set;
  this.el = document.createElement('div');
  this.el.className = 'pillbox';
  try {
    this.el.style = input.style;
  } catch (e) {
    // IE8 just can't handle this
  }
  input.parentNode.insertBefore(this.el, input);
  input.parentNode.removeChild(input);
  this.el.appendChild(input);
  this.events = events(this.el, this);
  this.bind();
}

/**
 * Mixin emitter.
 */

Emitter(Pillbox.prototype);

/**
 * Bind internal events.
 *
 * @return {Pillbox}
 * @api public
 */

Pillbox.prototype.bind = function(){
  this.events.bind('click');
  this.events.bind('keydown');
  return this;
};

/**
 * Unbind internal events.
 *
 * @return {Pillbox}
 * @api public
 */

Pillbox.prototype.unbind = function(){
  this.events.unbind();
  return this;
};

/**
 * Handle keyup.
 *
 * @api private
 */

Pillbox.prototype.onkeydown = normalize(function(e){
  switch (keyname(e.which)) {
    case 'enter':
      e.preventDefault();
      this.add(e.target.value);
      e.target.value = '';
      break;
    case 'space':
      if (this.options.space === false || this.options.allowSpace === true) 
        return;
      e.preventDefault();
      this.add(e.target.value);
      e.target.value = '';
      break;
    case 'backspace':
      if ('' == e.target.value) {
        this.remove(this.last());
      }
      break;
  }
});

/**
 * Handle click.
 *
 * @api private
 */

Pillbox.prototype.onclick = function(){
  this.input.focus();
};

/**
 * Set / Get all values.
 *
 * @param {Array} vals
 * @return {Array|Pillbox}
 * @api public
 */

Pillbox.prototype.values = function(vals){
  var self = this;

  if (0 == arguments.length) {
    return this.tags.values();
  }

  each(vals, function(value){
    self.add(value);
  });

  return this;
};

/**
 * Return the last member of the set.
 *
 * @return {String}
 * @api private
 */

Pillbox.prototype.last = function(){
  return this.tags.vals[this.tags.vals.length - 1];
};

/**
 * Add `tag`.
 *
 * @param {String} tag
 * @return {Pillbox} self
 * @api public
 */

Pillbox.prototype.add = function(tag) {
  var self = this
  tag = trim(tag);

  // blank
  if ('' == tag) return;

  // exists
  if (this.tags.has(tag)) return;

  // lowercase
  if (this.options.lowercase) tag = tag.toLowerCase();

  // add it
  this.tags.add(tag);

  // list item
  var span = document.createElement('span');
  span.setAttribute('data', tag);
  span.appendChild(document.createTextNode(tag));
  span.onclick = function(e) {
    e.preventDefault();
    self.input.focus();
  };

  // delete link
  var del = document.createElement('a');
  del.appendChild(document.createTextNode('✕'));
  del.href = '#';
  del.onclick = bind(this, this.remove, tag);
  span.appendChild(del);

  this.el.insertBefore(span, this.input);
  this.emit('add', tag);

  return this;
}

/**
 * Remove `tag`.
 *
 * @param {String} tag
 * @return {Pillbox} self
 * @api public
 */

Pillbox.prototype.remove = function(tag) {
  if (!this.tags.has(tag)) return this;
  this.tags.remove(tag);

  var span;
  for (var i = 0; i < this.el.childNodes.length; ++i) {
    span = this.el.childNodes[i];
    if (tag == span.getAttribute('data')) break;
  }

  this.el.removeChild(span);
  this.emit('remove', tag);

  return this;
}

});

require.modules["component-pillbox"] = require.modules["component~pillbox@master"];
require.modules["component~pillbox"] = require.modules["component~pillbox@master"];
require.modules["pillbox"] = require.modules["component~pillbox@master"];


require.register("component~domify@master", function (exports, module) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var div = document.createElement('div');
// Setup
div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
// Make sure that link elements get serialized correctly by innerHTML
// This requires a wrapper element in IE
var innerHTMLBug = !div.getElementsByTagName('link').length;
div = undefined;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

});

require.modules["component-domify"] = require.modules["component~domify@master"];
require.modules["component~domify"] = require.modules["component~domify@master"];
require.modules["domify"] = require.modules["component~domify@master"];


require.register("timoxley~next-tick@0.0.2", function (exports, module) {
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

});

require.modules["timoxley-next-tick"] = require.modules["timoxley~next-tick@0.0.2"];
require.modules["timoxley~next-tick"] = require.modules["timoxley~next-tick@0.0.2"];
require.modules["next-tick"] = require.modules["timoxley~next-tick@0.0.2"];


require.register("ecarter~css-emitter@0.0.1", function (exports, module) {
/**
 * Module Dependencies
 */

var events = require("component~event@0.1.4");

// CSS events

var watch = [
  'transitionend'
, 'webkitTransitionEnd'
, 'oTransitionEnd'
, 'MSTransitionEnd'
, 'animationend'
, 'webkitAnimationEnd'
, 'oAnimationEnd'
, 'MSAnimationEnd'
];

/**
 * Expose `CSSnext`
 */

module.exports = CssEmitter;

/**
 * Initialize a new `CssEmitter`
 *
 */

function CssEmitter(element){
  if (!(this instanceof CssEmitter)) return new CssEmitter(element);
  this.el = element;
}

/**
 * Bind CSS events.
 *
 * @api public
 */

CssEmitter.prototype.bind = function(fn){
  for (var i=0; i < watch.length; i++) {
    events.bind(this.el, watch[i], fn);
  }
  return this;
};

/**
 * Unbind CSS events
 * 
 * @api public
 */

CssEmitter.prototype.unbind = function(fn){
  for (var i=0; i < watch.length; i++) {
    events.unbind(this.el, watch[i], fn);
  }
  return this;
};

/**
 * Fire callback only once
 * 
 * @api public
 */

CssEmitter.prototype.once = function(fn){
  var self = this;
  function on(){
    self.unbind(on);
    fn.apply(self.el, arguments);
  }
  self.bind(on);
  return this;
};


});

require.modules["ecarter-css-emitter"] = require.modules["ecarter~css-emitter@0.0.1"];
require.modules["ecarter~css-emitter"] = require.modules["ecarter~css-emitter@0.0.1"];
require.modules["css-emitter"] = require.modules["ecarter~css-emitter@0.0.1"];


require.register("yields~has-transitions@0.0.1", function (exports, module) {

/**
 * Check if `el` or browser supports transitions.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api public
 */

exports = module.exports = function(el){
  switch (arguments.length) {
    case 0: return bool;
    case 1: return bool
      ? transitions(el)
      : bool;
  }
};

/**
 * Check if the given `el` has transitions.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */

function transitions(el, styl){
  if (el.transition) return true;
  styl = window.getComputedStyle(el);
  return !! styl.transition;
}

/**
 * Style.
 */

var styl = document.body.style;

/**
 * Export support.
 */

var bool = 'transition' in styl
  || 'webkitTransition' in styl
  || 'MozTransition' in styl
  || 'msTransition' in styl;

});

require.modules["yields-has-transitions"] = require.modules["yields~has-transitions@0.0.1"];
require.modules["yields~has-transitions"] = require.modules["yields~has-transitions@0.0.1"];
require.modules["has-transitions"] = require.modules["yields~has-transitions@0.0.1"];


require.register("component~once@0.0.1", function (exports, module) {

/**
 * Identifier.
 */

var n = 0;

/**
 * Global.
 */

var global = (function(){ return this })();

/**
 * Make `fn` callable only once.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

module.exports = function(fn) {
  var id = n++;

  function once(){
    // no receiver
    if (this == global) {
      if (once.called) return;
      once.called = true;
      return fn.apply(this, arguments);
    }

    // receiver
    var key = '__called_' + id + '__';
    if (this[key]) return;
    this[key] = true;
    return fn.apply(this, arguments);
  }

  return once;
};

});

require.modules["component-once"] = require.modules["component~once@0.0.1"];
require.modules["component~once"] = require.modules["component~once@0.0.1"];
require.modules["once"] = require.modules["component~once@0.0.1"];


require.register("yields~after-transition@0.0.1", function (exports, module) {

/**
 * dependencies
 */

var has = require("yields~has-transitions@0.0.1")
  , emitter = require("ecarter~css-emitter@0.0.1")
  , once = require("component~once@0.0.1");

/**
 * Transition support.
 */

var supported = has();

/**
 * Export `after`
 */

module.exports = after;

/**
 * Invoke the given `fn` after transitions
 *
 * It will be invoked only if the browser
 * supports transitions __and__
 * the element has transitions
 * set in `.style` or css.
 *
 * @param {Element} el
 * @param {Function} fn
 * @return {Function} fn
 * @api public
 */

function after(el, fn){
  if (!supported || !has(el)) return fn();
  emitter(el).bind(fn);
  return fn;
};

/**
 * Same as `after()` only the function is invoked once.
 *
 * @param {Element} el
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

after.once = function(el, fn){
  var callback = once(fn);
  after(el, fn = function(){
    emitter(el).unbind(fn);
    callback();
  });
};

});

require.modules["yields-after-transition"] = require.modules["yields~after-transition@0.0.1"];
require.modules["yields~after-transition"] = require.modules["yields~after-transition@0.0.1"];
require.modules["after-transition"] = require.modules["yields~after-transition@0.0.1"];


require.register("segmentio~on-escape@master", function (exports, module) {

var bind = require("component~event@0.1.4").bind
  , indexOf = require("component~indexof@0.0.1");


/**
 * Expose `onEscape`.
 */

module.exports = exports = onEscape;


/**
 * Handlers.
 */

var fns = [];


/**
 * Escape binder.
 *
 * @param {Function} fn
 */

function onEscape (fn) {
  fns.push(fn);
}


/**
 * Bind a handler, for symmetry.
 */

exports.bind = onEscape;


/**
 * Unbind a handler.
 *
 * @param {Function} fn
 */

exports.unbind = function (fn) {
  var index = indexOf(fns, fn);
  if (index !== -1) fns.splice(index, 1);
};


/**
 * Bind to `document` once.
 */

bind(document, 'keydown', function (e) {
  if (27 !== e.keyCode) return;
  for (var i = 0, fn; fn = fns[i]; i++) fn(e);
});
});

require.modules["segmentio-on-escape"] = require.modules["segmentio~on-escape@master"];
require.modules["segmentio~on-escape"] = require.modules["segmentio~on-escape@master"];
require.modules["on-escape"] = require.modules["segmentio~on-escape@master"];


require.register("segmentio~showable@0.1.1", function (exports, module) {
var after = require("yields~after-transition@0.0.1").once;
var nextTick = require("timoxley~next-tick@0.0.2");

/**
 * Hide the view
 */
function hide(fn){
  var self = this;

  if(this.hidden == null) {
    this.hidden = this.el.classList.contains('hidden');
  }

  if(this.hidden || this.animating) return;

  this.hidden = true;
  this.animating = true;

  after(self.el, function(){
    self.animating = false;
    self.emit('hide');
    if(fn) fn();
  });

  self.el.classList.add('hidden');
  this.emit('hiding');
  return this;
}

/**
 * Show the view. This waits until after any transitions
 * are finished. It also removed the hide class on the next
 * tick so that the transition actually paints.
 */
function show(fn){
  var self = this;

  if(this.hidden == null) {
    this.hidden = this.el.classList.contains('hidden');
  }

  if(this.hidden === false || this.animating) return;

  this.hidden = false;
  this.animating = true;

  this.emit('showing');

  after(self.el, function(){
    self.animating = false;
    self.emit('show');
    if(fn) fn();
  });

  this.el.offsetHeight;

  nextTick(function(){
    self.el.classList.remove('hidden');
  });

  return this;
}

/**
 * Mixin methods into the view
 *
 * @param {Emitter} obj
 */
module.exports = function(obj) {
  obj.hide = hide;
  obj.show = show;
  return obj;
};
});

require.modules["segmentio-showable"] = require.modules["segmentio~showable@0.1.1"];
require.modules["segmentio~showable"] = require.modules["segmentio~showable@0.1.1"];
require.modules["showable"] = require.modules["segmentio~showable@0.1.1"];


require.register("jkroso~classes@1.1.0", function (exports, module) {

module.exports = document.createElement('div').classList
  ? require("jkroso~classes@1.1.0/modern.js")
  : require("jkroso~classes@1.1.0/fallback.js")
});

require.register("jkroso~classes@1.1.0/fallback.js", function (exports, module) {

var index = require("component~indexof@0.0.1")

exports.add = function(name, el){
	var arr = exports.array(el)
	if (index(arr, name) < 0) {
		arr.push(name)
		el.className = arr.join(' ')
	}
}

exports.remove = function(name, el){
	if (name instanceof RegExp) {
		return exports.removeMatching(name, el)
	}
	var arr = exports.array(el)
	var i = index(arr, name)
	if (i >= 0) {
		arr.splice(i, 1)
		el.className = arr.join(' ')
	}
}

exports.removeMatching = function(re, el){
	var arr = exports.array(el)
	for (var i = 0; i < arr.length;) {
		if (re.test(arr[i])) arr.splice(i, 1)
		else i++
	}
	el.className = arr.join(' ')
}

exports.toggle = function(name, el){
	if (exports.has(name, el)) {
		exports.remove(name, el)
	} else {
		exports.add(name, el)
	}
}

exports.array = function(el){
	return el.className.match(/([^\s]+)/g) || []
}

exports.has =
exports.contains = function(name, el){
	return index(exports.array(el), name) >= 0
}
});

require.register("jkroso~classes@1.1.0/modern.js", function (exports, module) {

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @param {Element} el
 * @api public
 */

exports.add = function(name, el){
	el.classList.add(name)
}

/**
 * Remove `name` if present
 *
 * @param {String|RegExp} name
 * @param {Element} el
 * @api public
 */

exports.remove = function(name, el){
	if (name instanceof RegExp) {
		return exports.removeMatching(name, el)
	}
	el.classList.remove(name)
}

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @param {Element} el
 * @api public
 */

exports.removeMatching = function(re, el){
	var arr = exports.array(el)
	for (var i = 0; i < arr.length; i++) {
		if (re.test(arr[i])) el.classList.remove(arr[i])
	}
}

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @param {Element} el
 * @api public
 */

exports.toggle = function(name, el){
	el.classList.toggle(name)
}

/**
 * Return an array of classes.
 *
 * @param {Element} el
 * @return {Array}
 * @api public
 */

exports.array = function(el){
	return el.className.match(/([^\s]+)/g) || []
}

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @param {Element} el
 * @api public
 */

exports.has =
exports.contains = function(name, el){
	return el.classList.contains(name)
}
});

require.modules["jkroso-classes"] = require.modules["jkroso~classes@1.1.0"];
require.modules["jkroso~classes"] = require.modules["jkroso~classes@1.1.0"];
require.modules["classes"] = require.modules["jkroso~classes@1.1.0"];


require.register("ianstormtaylor~classes@0.1.0", function (exports, module) {

var classes = require("jkroso~classes@1.1.0");


/**
 * Expose `mixin`.
 */

module.exports = exports = mixin;


/**
 * Mixin the classes methods.
 *
 * @param {Object} object
 * @return {Object}
 */

function mixin (obj) {
  for (var method in exports) obj[method] = exports[method];
  return obj;
}


/**
 * Add a class.
 *
 * @param {String} name
 * @return {Object}
 */

exports.addClass = function (name) {
  classes.add(name, this.el);
  return this;
};


/**
 * Remove a class.
 *
 * @param {String} name
 * @return {Object}
 */

exports.removeClass = function (name) {
  classes.remove(name, this.el);
  return this;
};


/**
 * Has a class?
 *
 * @param {String} name
 * @return {Boolean}
 */

exports.hasClass = function (name) {
  return classes.has(name, this.el);
};


/**
 * Toggle a class.
 *
 * @param {String} name
 * @return {Object}
 */

exports.toggleClass = function (name) {
  classes.toggle(name, this.el);
  return this;
};

});

require.modules["ianstormtaylor-classes"] = require.modules["ianstormtaylor~classes@0.1.0"];
require.modules["ianstormtaylor~classes"] = require.modules["ianstormtaylor~classes@0.1.0"];
require.modules["classes"] = require.modules["ianstormtaylor~classes@0.1.0"];


require.register("optimuslime~overlay@master", function (exports, module) {
var template = require("optimuslime~overlay@master/lib/index.html");
var domify = require("component~domify@master");
var emitter = require("component~emitter@master");
var showable = require("segmentio~showable@0.1.1");
var classes = require("ianstormtaylor~classes@0.1.0");

/**
 * Export `Overlay`
 */
module.exports = Overlay;


/**
 * Initialize a new `Overlay`.
 *
 * @param {Element} target The element to attach the overlay to
 * @api public
 */

function Overlay(target) {
  if(!(this instanceof Overlay)) return new Overlay(target);

  this.target = target || document.body;
  this.el = domify(template);
  this.el.addEventListener('click', this.handleClick.bind(this));

  var el = this.el;
  var parent = this.target;

  this.on('showing', function(){
    parent.appendChild(el);
  });

  this.on('hide', function(){
    parent.removeChild(el);
  });
}


/**
 * When the overlay is click, emit an event so that
 * the view that is using this overlay can choose
 * to close the overlay if they want
 *
 * @param {Event} e
 */
Overlay.prototype.handleClick = function(e){
  this.emit('click', e);
};


/**
 * Mixins
 */
emitter(Overlay.prototype);
showable(Overlay.prototype);
classes(Overlay.prototype);
});

require.define("optimuslime~overlay@master/lib/index.html", "<div class=\"Overlay hidden\"></div>");

require.modules["optimuslime-overlay"] = require.modules["optimuslime~overlay@master"];
require.modules["optimuslime~overlay"] = require.modules["optimuslime~overlay@master"];
require.modules["overlay"] = require.modules["optimuslime~overlay@master"];


require.register("optimuslime~modal@master", function (exports, module) {
var domify = require("component~domify@master");
var Emitter = require("component~emitter@master");
var overlay = require("optimuslime~overlay@master");
var onEscape = require("segmentio~on-escape@master");
var template = require("optimuslime~modal@master/lib/index.html");
var Showable = require("segmentio~showable@0.1.1");
var Classes = require("ianstormtaylor~classes@0.1.0");

/**
 * Expose `Modal`.
 */

module.exports = Modal;


/**
 * Initialize a new `Modal`.
 *
 * @param {Element} el The element to put into a modal
 */
function replaceOverlayHide(fn){
  var self = this;

  if(this.hidden == null) {
    this.hidden = this.el.classList.contains('hidden');
  }

  this.emit('hiding');
  self.el.classList.add('hidden');
  this.hidden = null;
  self.animating = false;
  self.emit('hide');
  if(fn) fn();
 
  return this;
}

function Modal (el) {
  if (!(this instanceof Modal)) return new Modal(el);
  this.el = domify(template);
  this.el.appendChild(el);
  this._overlay = overlay();
  this._overlay.hide = replaceOverlayHide;
  console.log(this._overlay);

  var el = this.el;

  this.on('showing', function(){
    document.body.appendChild(el);
  });

  this.on('hide', function(){
    document.body.removeChild(el);
  });
}





/**
 * Mixin emitter.
 */

Emitter(Modal.prototype);
Showable(Modal.prototype);
Classes(Modal.prototype);


/**
 * Set the transition in/out effect
 *
 * @param {String} type
 *
 * @return {Modal}
 */

Modal.prototype.effect = function(type) {
  this.el.setAttribute('effect', type);
  return this;
};


/**
 * Add an overlay
 *
 * @param {Object} opts
 *
 * @return {Modal}
 */

Modal.prototype.overlay = function(){
  var self = this;
  this.on('showing', function(){
    self._overlay.show();
  });
  this.on('hiding', function(){
    // self._overlay.hidden = self._overlay.el.classList.contains('hidden');
    // self._overlay.animating = false;
    // self._overlay.el.classList.add('hidden');
    // self._overlay.emit.call(self._overlay, 'hide');
    self._overlay.hide();
  });
  return this;
};


/**
 * Make the modal closeable.
 *
 * @return {Modal}
 */

Modal.prototype.closeable =
Modal.prototype.closable = function () {
  var self = this;

  function hide(){
    self.hide();
  }

  this._overlay.on('click', hide);
  onEscape(hide);
  return this;
};

});

require.define("optimuslime~modal@master/lib/index.html", "<div class=\"Modal hidden\" effect=\"toggle\"></div>");

require.modules["optimuslime-modal"] = require.modules["optimuslime~modal@master"];
require.modules["optimuslime~modal"] = require.modules["optimuslime~modal@master"];
require.modules["modal"] = require.modules["optimuslime~modal@master"];


require.register("./libs/initialization/win-setup", function (exports, module) {
//here we test the insert functions
//making sure the database is filled with objects of the schema type
// var wMath = require('win-utils').math;

module.exports = winsetup;

function winsetup(requiredEvents, moduleJSON, moduleConfigs, finished)
{ 
    var winback = require("optimuslime~win-backbone@0.0.4-5");

    var Q = require("techjacker~q@master");

    var backbone, generator, backEmit, backLog;

    var emptyModule = 
    {
        winFunction : "experiment",
        eventCallbacks : function(){ return {}; },
        requiredEvents : function() {
            return requiredEvents;
        }
    };

    //add our own empty module onto this object
    moduleJSON["setupExperiment"] = emptyModule;
    
    var qBackboneResponse = function()
    {
        var defer = Q.defer();
        // self.log('qBBRes: Original: ', arguments);

        //first add our own function type
        var augmentArgs = arguments;
        // [].splice.call(augmentArgs, 0, 0, self.winFunction);
        //make some assumptions about the returning call
        var callback = function(err)
        {
            if(err)
            {
              backLog("QCall fail: ", err);
                defer.reject(err);
            }
            else
            {
                //remove the error object, send the info onwards
                [].shift.call(arguments);
                if(arguments.length > 1)
                    defer.resolve(arguments);
                else
                    defer.resolve.apply(defer, arguments);
            }
        };

        //then we add our callback to the end of our function -- which will get resolved here with whatever arguments are passed back
        [].push.call(augmentArgs, callback);

        // self.log('qBBRes: Augmented: ', augmentArgs);
        //make the call, we'll catch it inside the callback!
        backEmit.apply(backEmit, augmentArgs);

        return defer.promise;
    }

    //do this up front yo
    backbone = new winback();

    backbone.logLevel = backbone.testing;

    backEmit = backbone.getEmitter(emptyModule);
    backLog = backbone.getLogger({winFunction:"experiment"});
    backLog.logLevel = backbone.testing;

    //loading modules is synchronous
    backbone.loadModules(moduleJSON, moduleConfigs);

    var registeredEvents = backbone.registeredEvents();
    var requiredEvents = backbone.moduleRequirements();
      
    backLog('Backbone Events registered: ', registeredEvents);
    backLog('Required: ', requiredEvents);

    backbone.initializeModules(function(err)
    {
      backLog("Finished Module Init");
      finished(err, {logger: backLog, emitter: backEmit, backbone: backbone, qCall: qBackboneResponse});
    });
}
});

require.modules["win-setup"] = require.modules["./libs/initialization/win-setup"];


require.register("./libs/encoding/cppn-additions", function (exports, module) {
//here we test the insert functions
//making sure the database is filled with objects of the schema type
// var wMath = require('win-utils').math;

module.exports = cppnAdditions;

var cppnjs = require("optimuslime~cppnjs@master");

function cppnAdditions()
{ 
   var self = this;


   self.winFunction = "cppnAdditions";
   
   self.requiredEvents = function(){return [];};
   self.eventCallbacks = function(){return {};};

   self.initialize = function(done)
   {
        //we do our damage here!
         self.addCPPNFunctionsToLibrary();
         done();
   };

   //these are the names of our cppn objects
   var pbActivationFunctions = {sigmoid: 'PBBipolarSigmoid', gaussian: 'PBGaussian', sine: 'Sine', cos: "PBCos", identity: 'pbLinear'};

    //in order to use certain activation functions
    self.addCPPNFunctionsToLibrary = function()
    {
        var actFunctions = cppnjs.cppnActivationFunctions;
        var actFactory = cppnjs.cppnActivationFactory;

         actFunctions[pbActivationFunctions.sigmoid] = function(){
                return new actFunctions.ActivationFunction({
                    functionID: pbActivationFunctions.sigmoid ,
                    functionString: "2.0/(1.0+(exp(-inputSignal))) - 1.0",
                    functionDescription: "Plain sigmoid [xrange -5.0,5.0][yrange, 0.0,1.0]",
                    functionCalculate: function(inputSignal)
                    {
                        return 2.0/(1.0+(Math.exp(-inputSignal))) - 1.0;
                    },
                    functionEnclose: function(stringToEnclose)
                    {
                        return "(2.0/(1.0+(Math.exp(-1.0*" + stringToEnclose + "))) - 1.0)";
                    }
                });
            };

        actFunctions[pbActivationFunctions.gaussian] = function(){
            return new actFunctions.ActivationFunction({
                    functionID: pbActivationFunctions.gaussian,
                    functionString: "2*e^(-(input)^2) - 1",
                    functionDescription:"bimodal gaussian",
                    functionCalculate :function(inputSignal)
                    {
                        return 2 * Math.exp(-Math.pow(inputSignal, 2)) - 1;
                    },
                    functionEnclose: function(stringToEnclose)
                    {
                        return "(2.0 * Math.exp(-Math.pow(" + stringToEnclose + ", 2.0)) - 1.0)";
                    }
                });
            };

        actFunctions[pbActivationFunctions.identity] = function(){
            return new actFunctions.ActivationFunction({
                functionID: pbActivationFunctions.identity,
                functionString: "x",
                functionDescription:"Linear",
                functionCalculate: function(inputSignal)
                {
                    return inputSignal;
                },
                functionEnclose: function(stringToEnclose)
                {
                    return "(" + stringToEnclose + ")";
                }
            });
        };

        actFunctions[pbActivationFunctions.cos] = function(){
           return new actFunctions.ActivationFunction({
                functionID: pbActivationFunctions.cos,
                functionString: "Cos(inputSignal)",
                functionDescription: "Cos function with normal period",
                functionCalculate: function(inputSignal)
                {
                    return Math.cos(inputSignal);
                },
                functionEnclose: function(stringToEnclose)
                {
                    return "(Math.cos(" + stringToEnclose + "))";
                }
            });
        };

        //makes these the only activation functions being generated by picbreeder genotypes
        var probs = {};
        probs[pbActivationFunctions.sigmoid] = .22;
        probs[pbActivationFunctions.gaussian] = .22;
        probs[pbActivationFunctions.sine] = .22;
        probs[pbActivationFunctions.cos] = .22;
        probs[pbActivationFunctions.identity] = .12;
        actFactory.setProbabilities(probs);
    };



    return self;
}
});

require.modules["cppn-additions"] = require.modules["./libs/encoding/cppn-additions"];


require.register("./libs/encoding/pbEncoding", function (exports, module) {
//here we test the insert functions
//making sure the database is filled with objects of the schema type
// var wMath = require('win-utils').math;

var picbreederSchema = require("./libs/encoding/pbEncoding/picbreederSchema.js");

module.exports = pbEncoding;

function pbEncoding(backbone, globalConfig, localConfig)
{
	var self = this;

	//boom, let's get right into the business of encoding
	self.winFunction = "encoding";

    //for convenience, this is our artifact type
	self.encodingName = "picArtifact";

	self.log = backbone.getLogger(self);
	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	self.eventCallbacks = function()
	{ 
		return {
			// //easy to handle neat geno full offspring
			// "encoding:iesor-createNonReferenceOffspring" : function(genProps, parentProps, sessionObject, done) { 
				
   //              //session might be undefined -- depending on win-gen behavior
   //              //make sure session exists
   //              sessionObject = sessionObject || {};

			// 	//need to engage parent creation here -- could be complicated
			// 	var parents = parentProps.parents;

   //              //how many to make
			// 	var count = genProps.count;

   //              //these will be the final objects to return
			// 	var allParents = [];
			// 	var children = [];

			// 	//pull potential forced parents
			// 	var forced = sessionObject.forceParents;

   //              //go through all the children -- using parents or force parents to create the new offspring
   //              for(var c=0; c < count; c++)
   //              {
   //                  //we simply randomly pull environment from a parent
   //                  var randomParentIx = wMath.next(parents.length);

   //                  //if we have parents that are forced upon us
   //                  if(forced){
   //                      //pull random ix
   //                      var rIx = wMath.next(forced[c].length);
   //                      //use random index of forced parent as the actual ix
   //                      randomParentIx = forced[c][rIx];
   //                  }

   //                  //our child together!
   //                  var rOffspring = {};

   //                  //all we need to do (for the current schema)
   //                  //is to copy the environment
   //                  rOffspring.meta = JSON.parse(JSON.stringify(parents[randomParentIx].meta));

   //                  //just return our simple object with a randomly chosen environment
   //                  children.push(rOffspring);

   //                  //random parent was involved, make sure to mark who!
   //                  allParents.push([randomParentIx]);
   //              }

			// 	//done, send er back
			// 	done(undefined, children, allParents);

			//  	return; 
			//  }
		};
	};

	//need to be able to add our schema
	self.requiredEvents = function() {
		return [
			"schema:addSchema"
		];
	};

	self.initialize = function(done)
    {
    	self.log("Init win-iesor encoding: ", picbreederSchema);

		//how we talk to the backbone by emitting events
    	var emitter = backbone.getEmitter(self);

		//add our neat genotype schema -- loaded neatschema from another file -- 
		//this is just the standard neat schema type -- others can make neatjs changes that require a different schema
        emitter.emit("schema:addSchema", self.encodingName, picbreederSchema, function(err)
        {
        	if(err){
        		done(new Error(err));
        		return;
        	}
        	done();
        });
    }


	return self;
}
});

require.register("./libs/encoding/pbEncoding/picbreederSchema.js", function (exports, module) {
//contains the neat schema setup -- default for neatjs stuff.

//Need a way to override schema inside WIN -- for now, neat comes with its own schema. Will be able to add variations later
//(for things looking to add extra neat features while still having all the custom code). 

//Alternatively, they could just copy this module, and add their own stuff. Module is small. 
 
module.exports = {
    "genome": { 
        "$ref" : "NEATGenotype"
    }
    //some meta info about this object being stored
    ,"meta": {
        "imageTitle": "string",
        "imageTags": {type: "array", items: {type: "string"}}
    }
};



});

require.modules["pbEncoding"] = require.modules["./libs/encoding/pbEncoding"];


require.register("./libs/evolution/win-neat/lib/neatSchema.js", function (exports, module) {
//contains the neat schema setup -- default for neatjs stuff.

//Need a way to override schema inside WIN -- for now, neat comes with its own schema. Will be able to add variations later
//(for things looking to add extra neat features while still having all the custom code). 

//Alternatively, they could just copy this module, and add their own stuff. Module is small. 
 
module.exports = {
    "nodes": {
        "type" : "array",
        "gid": "String",
        "step": {"type": "Number"},
        "activationFunction": "String",
        "nodeType": "String",
        "layer": {"type": "Number"},
        "bias" : {"type": "Number"}
    },
    "connections": {
        "type" : "array",
        "gid" : "String",
        // "step": {"type": "Number"},

        "sourceID": "String",
        "targetID": "String",
        "weight": "Number"
    }
};



});

require.register("./libs/evolution/win-neat", function (exports, module) {
//here we test the insert functions
//making sure the database is filled with objects of the schema type
var neat = require("optimuslime~neatjs@master");
var neatSchema = require("./libs/evolution/win-neat/lib/neatSchema.js");
var NodeType = neat.NodeType;
var neatNode = neat.neatNode;
var neatConnection = neat.neatConnection;
var neatGenome = neat.neatGenome;

var wMath = require("optimuslime~win-utils@master").math;

module.exports = winneat;

function defaultParameters()
{
	//make a new neat param object
	var np = new neat.neatParameters();

    //set up the defaults here
    np.pMutateAddConnection = .13;
    np.pMutateAddNode = .13;
    np.pMutateDeleteSimpleNeuron = .00;
    np.pMutateDeleteConnection = .00;
    np.pMutateConnectionWeights = .72;
    np.pMutateChangeActivations = .02;

    np.pNodeMutateActivationRate = 0.2;
    np.connectionWeightRange = 3.0;
    np.disallowRecurrence = true;

    //send it back
    return np;
}

function selectXFromSmallObject(x, objects){

	//the final ix object will be returned
    var ixs = [];
    //works with objects with count or arrays with length
    var gCount = objects.count === undefined ? objects.length : objects.count;

    for(var i=0; i<gCount;i++)
        ixs.push(i);

    //how many do we need back? we need x back. So we must remove (# of objects - x) leaving ... x objects
    for(var i=0; i < gCount -x; i++)
    {
        //remove random index
        ixs.splice(wMath.next(ixs.length),1);
    }

    //return a random collection of distinct indices
    return ixs;
};


function winneat(backbone, globalConfig, localConfig)
{
	var self = this;

	//boom, let's get right into the business of encoding

	self.winFunction = "encoding";
	//maintain backwards compat with old win versions -- use neat geno name
	self.encodingName = "NEATGenotype";

	self.log = backbone.getLogger(self);
	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	//either pass in your own, or we make some defaults
	self.neatParameters = localConfig.neatParameters || defaultParameters();

	//pull options from the local config object under options
	self.options = localConfig.options || {};


	self.eventCallbacks = function()
	{ 
		return {
            "encoding:NEATGenotype-measureGenomeDistances" : self.calculateGenomicDistances,
			//easy to handle neat geno full offspring
			"encoding:NEATGenotype-createFullOffspring" : function(genProps, parentProps, sessionObject, done) { 
				
                //session might be undefined -- depending on win-gen behavior
                //make sure session exists
                sessionObject = sessionObject || {};

				//need to engage parent creation here -- could be complicated
				//taken from previous neatjs stuff -- added forced parents logic
				var jsonParents = parentProps.parents;

                // self.log("Create children from: ", jsonParents);

				//we have the json parents above, now we need to convert into fresh actual parents 
				var parents = [];
				for(var i=0; i < jsonParents.length; i++)
				{
					//convert genotype json into full genotype with functions and stuff
					var ng = genotypeFromJSON(jsonParents[i]);
					parents.push(ng);
				}

                //how many to make
				var count = genProps.count;

                //these will be the final objects to return
				var allParents = [];
				var children = [];

				//pull potential forced parents
				var forced = sessionObject.forceParents;

                //if we are forced to use particular parents, this helper will put the list of parents in an array for us
				var getForceParents = function(parentList)
				{
                    var pIxMap = {};
					var fullParents = [];
					for(var i=0; i < parentList.length; i++)
					{
						//grab the index
						var pIx = parentList[i];
                        //given an index of fullParents, we can say what the original index was
                        pIxMap[i] = pIx;
						//use index to fetch full parent object -- push to parental list
						fullParents.push(parents[pIx]);
					}
					return {parents: fullParents, ixMap: pIxMap};
				}

				//go through all the children -- using parents or force parents to create the new offspring
				// keep in mind all parents are full neatgenomes that have all necessary functions
				for(var c=0; c < count; c++)
				{
					//use the parents 
					var oParents = parents;

                    var fmap;
					//forced has a full parental list
					if(forced){    
                        fmap = getForceParents(forced[c]);
						oParents = fmap.parents;
                        // self.log("Forced parents: ", oParents);
                    }

					//create offspring from the parents, hooray
                    //session object potentially has things for handling newConnection/newNodes logic
					var offObject = self.createNextGenome(oParents, sessionObject);

					//back to JSON from whence you came!
					var rOffspring = genotypeToJSON(offObject.offspring);

					//grab the json offspring object
					children.push(rOffspring);

                    //parent ixs returned from create genome
                    var rParentIxs = offObject.parentIxs;

                    //parentixs tells us which of the forced parents was used 
                    //but the forced parent index != original parent index
                    //so we have to map back from the forced parents to the original parent index using ixMap
                    if(forced)
                    {
                        realIxs = [];
                        for(var p=0; p < rParentIxs.length; p++)
                            realIxs.push(fmap.ixMap[rParentIxs[p]]);

                        rParentIxs = realIxs;
                    }

					//createnext genome knows which parents were involved
					allParents.push(rParentIxs);
				}

				//done, send er back
				done(undefined, children, allParents);

			 	return; 
			 }
		};
	};

	self.markParentConnections = function(parents, sessionObject){

        for(var s=0; s < parents.length; s++)
        {
            var parent = parents[s];
            for(var c =0; c < parent.connections.length; c++)
            {
                var sConn = parent.connections[c];
                var cid = '(' + sConn.sourceID + ',' + sConn.targetID + ')';
                sessionObject.newConnections[cid] = sConn;
            }
        }
    };

	self.createNextGenome = function(parents, sessionObject)
    {
        //make sure to have session object setup
        sessionObject.newConnections = sessionObject.newConnections || {};
        //nodes is just an array -- doesn't really do much ...
        sessionObject.newNodes = sessionObject.newNodes || {};

        self.markParentConnections(parents,sessionObject);

        //IF we have 0 parents, we create a genome with the default configurations
        var ng;
        var initialMutationCount = self.options.initialMutationCount || 0,
            postXOMutationCount = self.options.postMutationCount || 0;
            
        var moreThanTwoParents = self.options.moreThanTwoParents || 0.05;

        var responsibleParents = [];

        switch(parents.length)
        {
            case 0:
                throw new Error("Cannot create new NEAT genome in win-NEAT without any parents.")
            case 1:

                //we have one parent
                //asexual reproduction
                ng = parents[0].createOffspringAsexual(sessionObject.newNodes, sessionObject.newConnections, self.neatParameters);
                // self.log("\n\n\n\n\nPars: ".red, parents[0].createOffspringAsexual);
                //parent at index 0 responsible
                responsibleParents.push(0);

                for(var m=0; m < postXOMutationCount; m++)
                    ng.mutate(sessionObject.newNodes, sessionObject.newConnections, self.neatParameters);

                break;
            default:
                //greater than 1 individual as a possible parent

                //at least 1 parent, and at most self.activeParents.count # of parents
                var parentCount = 1;

                //if you are more than the probabiliy of having >2 parents, then it's just normal behavior -- 1 or 2 parents
                if(Math.random() > moreThanTwoParents)
                {
                    parentCount = 1 + wMath.next(2);
                  
                }
                else  //chance that parents will be more than 2 parents -- unusual for neat genotypes
                    parentCount = 1 + wMath.next(parents.length);

                if(parentCount == 1)
                {
                    //select a single parent for offspring
                    var rIx = wMath.next(parents.length);

                    ng = parents[rIx].createOffspringAsexual(sessionObject.newNodes, sessionObject.newConnections, self.neatParameters);
                    //1 responsible parent at index 0
                    responsibleParents.push(rIx);
                    break;
                }

                //we expect active parents to be small, so we grab parentCount number of parents from a small array of parents
                var parentIxs = selectXFromSmallObject(parentCount, parents);

                var p1 = parents[parentIxs[0]], p2;
                //if I have 3 parents, go in order composing the objects

                responsibleParents.push(parentIxs[0]);

                //p1 mates with p2 to create o1, o1 mates with p3, to make o2 -- p1,p2,p3 are all combined now inside of o2
                for(var i=1; i < parentIxs.length; i++)
                {
                    p2 = parents[parentIxs[i]];
                    ng = p1.createOffspringSexual(p2, self.neatParameters);
                    p1 = ng;
                    responsibleParents.push(parentIxs[i]);
                }

                for(var m=0; m < postXOMutationCount; m++)
                    ng.mutate(sessionObject.newNodes, sessionObject.newConnections, self.neatParameters);


                break;
        }

        //we have our genome, let's send it back

        //the reason we don't end it inisde the switch loop is that later, we might be interested in saving this genome from some other purpose
        return {offspring: ng, parentIxs: responsibleParents};
    };

        //currently not used, calculates genomic novelty objective for protecting innovation
    //uses a rough characterization of topology, i.e. number of connections in the genome
    self.calculateGenomicDistances = function(genomeMap, closestCount, finished) {

        var sum=0.0;
        var max_conn = 0;

        var xx, yy;
        // self.log('Geno obj: ', neatGenome.prototype);

        //convert from json if it is json
        var checkNotJSON = function(gObject)
        {
            //gneomes should have a compat function
            if(typeof gObject.compat != "function")
            {
                gObject = genotypeFromJSON(gObject);
            }

            //don't touch object if not necessary
            return gObject;
        }

        var gDiversity = {};
        var gc = 0;
        for(var wid in genomeMap) 
        {
            //keep count
            gc++;

            xx = checkNotJSON(genomeMap[wid]);
            //quickly make sure our genomeMap is full of real objects
            genomeMap[wid] = xx;
            

            var minDist=10000000.0;

            var difference=0.0;
            var delta=0.0;
            //double array
            var distances= [];

            if(xx.connections.length > max_conn)
                max_conn = xx.connections.length;

            //int ccount=xx.ConnectionGeneList.Count;
            for(var sWID in genomeMap) {

                //make sure it's not json object -- we can do this before comparison cause it needs
                //to happen anyways
                yy = checkNotJSON(genomeMap[sWID]); 
                genomeMap[sWID] = yy;

                if(wid==sWID)
                    continue;

                //measure genomic compatability using neatparams
                var d = xx.compat(yy, self.neatParameters);
                //if(d<minDist)
                //  minDist=d;

                distances.push(d);
            }

            //ascending order
            //want the closest individuals
            distances.sort(function(a,b) {return a-b;});

            //grab the 10 closest distances
            var sz=Math.min(distances.length, closestCount);

            var gDistance = 0.0;

            for(var i=0;i<sz;i++)
                gDistance+=distances[i];

            sum += gDistance;

            gDiversity[wid] = {distance: gDistance};
        }

        self.log("Sum Distance among genotypes: " + sum/gc + " with max connections in genome: " + max_conn);

        var results = {genomeDistances: gDiversity, sumDistance: sum, averageDistance: sum/gc, genomeCount: gc};

        //sync or asyn, don't matter to us -- as long as win-backbone supports it(not yet)
        if(finished)
            finished(undefined, results);
        else
            return results;

    };

	//need to be able to add our schema
	self.requiredEvents = function() {
		return [
			"schema:addSchema"
		];
	};

	self.initialize = function(done)
    {
    	self.log("Init win-neat encoding");

		//how we talk to the backbone by emitting events
    	var emitter = backbone.getEmitter(self);

		//add our neat genotype schema -- loaded neatschema from another file -- 
		//this is just the standard neat schema type -- others can make neatjs changes that require a different schema
        emitter.emit("schema:addSchema", self.encodingName, neatSchema, function(err)
        {
        	if(err){
        		done(new Error(err));
        		return;
        	}
        	done();
        });
    }


	return self;
}


//define genotypeto/fromjson functions
winneat.genotypeToJSON = genotypeToJSON;
winneat.genotypeFromJSON = genotypeFromJSON;

function genotypeToJSON(ng)
{
    //need to match the schema
    var ngJSON = {nodes:ng.nodes, connections: []};
    for(var i=0; i < ng.connections.length; i++)
    {   
        var conJSON = {};
        var conn = ng.connections[i];
        for(var key in neatSchema.connections)
        {
            if(key != "type")
            {
                conJSON[key] = conn[key];
            }
        }
        ngJSON.connections.push(conJSON);
    }
    return ngJSON;
}

function genotypeFromJSON(ngJSON)
{   
    var nodes = [];

    var inCount = 0;
    var outCount = 0;

    for(var i=0; i < ngJSON.nodes.length; i++)
    {
        var dbNode = ngJSON.nodes[i];

        switch(dbNode.nodeType)
        {
            case NodeType.input:
                inCount++;
                break;
            case NodeType.output:
                outCount++;
                break;
            case NodeType.bias:
            case NodeType.hidden:
            case NodeType.other:
                break;
            default:
                // self.log('Erroneous node type: ' + dbNode.nodeType, " Node: ", dbNode);
                throw new Error("Erroneous node type: " + dbNode.nodeType + " in node: " + JSON.stringify(dbNode));
                // break;
        }

        var nNode = new neatNode(dbNode.gid, dbNode.activationFunction, dbNode.layer, {type: dbNode.nodeType});
        nodes.push(nNode);
    }

    var connections = [];

    for(var i=0; i < ngJSON.connections.length; i++)
    {
        //grab connection from db object
        var dbConn = ngJSON.connections[i];

        //convert to our neatConnection -- pretty simple
        var nConn = new neatConnection(dbConn.gid, dbConn.weight, {sourceID: dbConn.sourceID, targetID: dbConn.targetID});

        //push connection object
        connections.push(nConn);
    }

    //here we goooooooooo
    var ng = new neatGenome(ngJSON.wid, nodes, connections, inCount,outCount, false);
    //note the wid we have from the db object (by default this is added)
    ng.wid = ngJSON.wid;
    //we also have parents already set as well -- make sure to transfer this inforas well -- it's very important
    ng.parents = ngJSON.parents;
    //we've converted back to ng
    //we are finished!
    return ng;
}


});

require.modules["win-neat"] = require.modules["./libs/evolution/win-neat"];


require.register("./libs/evolution/win-iec", function (exports, module) {
//generating session info
var uuid = require("optimuslime~win-utils@master").cuid;

module.exports = winiec;

function winiec(backbone, globalConfig, localConfig)
{
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "evolution";

	if(!localConfig.genomeType)
		throw new Error("win-IEC needs a genome type specified."); 

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	//we have logger and emitter, set up some of our functions

	function clearEvolution(genomeType)
	{
		//optionally, we can change types if we need to 
		if(genomeType)
			self.genomeType = genomeType;

		self.log("clear evo to type: ", self.genomeType)
		self.selectedParents = {};
		//all the evo objects we ceated -- parents are a subset
		self.evolutionObjects = {};

		//count it up
		self.parentCount = 0;

		//session information -- new nodes and connections yo! that's all we care about after all-- new innovative stuff
		//i rambled just then. For no reason. Still doing it. Sucks that you're reading this. trolololol
		self.sessionObject = {};

		//everything we publish is linked by this session information
		self.evolutionSessionID = uuid();

		//save our seeds!
		self.seeds = {};

		//map children to parents for all objects
		self.childrenToParents = {};

		self.seedParents = {};
	}

	//we setup all our basic 
	clearEvolution(localConfig.genomeType);

	//what events do we need?
	self.requiredEvents = function()
	{
		return [
		//need to be able to create artifacts
			"generator:createArtifacts",
			"schema:replaceParentReferences",
			"schema:getReferencesAndParents",
			"publish:publishArtifacts",
			//in the future we will also need to save objects according to our save tendencies
			//for now, we'll offload that to UI decisions
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			"evolution:selectParents" : self.selectParents,
			"evolution:unselectParents" : self.unselectParents,
			"evolution:publishArtifact" : self.publishArtifact,
			//we fetch a list of objects based on IDs, if they don't exist we create them
			"evolution:getOrCreateOffspring" : self.getOrCreateOffspring,
			"evolution:loadSeeds" : self.loadSeeds,
			"evolution:resetEvolution" : clearEvolution

		};
	}

	

	// self.findSeedOrigins = function(eID)
	// {
	// 	//let's look through parents until we find the seed you originated from -- then you are considered a decendant
	// 	var alreadyChecked = {};

	// 	var originObjects = {};
	// 	var startingParents = self.childrenToParents[eID];

	// 	while(startingParents.length)
	// 	{
	// 		var nextCheck = [];
	// 		for(var i=0; i < startingParents.length; i++)
	// 		{
	// 			var parentWID = startingParents[i];

	// 			if(!alreadyChecked[parentWID])
	// 			{
	// 				//mark it as checked
	// 				alreadyChecked[parentWID] = true;

	// 				if(self.seeds[parentWID])
	// 				{
	// 					//this is a seed!
	// 					originObjects[parentWID] = self.seeds[parentWID];
	// 				}

	// 				//otherwise, it's not of interested, but perhaps it's parents are!

	// 				//let's look at the parents parents
	// 				var grandparents = self.childrenToParents[parentWID];

	// 				if(grandparents)
	// 				{
	// 					nextCheck = nextCheck.concat(grandparents);
	// 				}
	// 			}
	// 		}

	// 		//continue the process - don't worry about loops, we're checking!
	// 		startingParents = nextCheck;
	// 	}

	// 	//send back all the seed objects
	// 	return originObjects
	// }

	self.publishArtifact = function(id, meta, finished)
	{
		//don't always have to send meta info -- since we don't know what to do with it anyways
		if(typeof meta == "function")
		{
			finished = meta;
			meta = {};
		}
		//we fetch the object from the id

		var evoObject = self.evolutionObjects[id];

		if(!evoObject)
		{
			finished("Evolutionary artifactID to publish is invalid: " + id);
			return;
		}
		//we also want to store some meta info -- don't do anything about that for now 

		// var seedParents = self.findSeedOrigins(id);

		//
		var seedList = [];

		//here is what needs to happen, the incoming evo object has the "wrong" parents
		//the right parents are the published parents -- the other parents 

		//this will need to be fixed in the future -- we need to know private vs public parents
		//but for now, we simply send in the public parents -- good enough for picbreeder iec applications
		//other types of applications might need more info.

		var widObject = {};
		widObject[evoObject.wid] = evoObject;
		self.backEmit("schema:getReferencesAndParents", self.genomeType, widObject, function(err, refsAndParents){

			//now we know our references
			var refParents = refsAndParents[evoObject.wid];

			//so we simply fetch our appropraite seed parents 
			var evoSeedParents = self.noDuplicatSeedParents(refParents);

			//now we have all the info we need to replace all our parent refs
			self.backEmit("schema:replaceParentReferences", self.genomeType, evoObject, evoSeedParents, function(err, cloned)
			{
				//now we have a cloned version for publishing, where it has public seeds

				 //just publish everything public for now!
		        var session = {sessionID: self.evolutionSessionID, publish: true};

		        //we can also save private info
		        //this is where we would grab all the parents of the individual
		        var privateObjects = [];

				self.backEmit("publish:publishArtifacts", self.genomeType, session, [cloned], [], function(err)
				{
					if(err)
					{
						finished(err);
					}
					else //no error publishing, hooray!
						finished(undefined, cloned);

				})

			})

		});
       
	}

	//no need for a callback here -- nuffin to do but load
	self.loadSeeds = function(idAndSeeds, finished)
	{
		//we have all the seeds and their ids, we just absorb them immediately
		for(var eID in idAndSeeds)
		{
			var seed = idAndSeeds[eID];
			//grab the objects and save them
			self.evolutionObjects[eID] = seed;

			//save our seeds
			self.seeds[seed.wid] = seed;
		}

		self.log("seed objects: ", self.seeds);

		self.backEmit("schema:getReferencesAndParents", self.genomeType, self.seeds, function(err, refsAndParents)
		{
			if(err)
			{
				//pass on the error if it happened
				if(finished)
					finished(err);
				else
					throw err;
				return;
			}
			//there are no parent refs for seeds, just the refs themselves which are important
			for(var wid in self.seeds)
			{
				var refs = Object.keys(refsAndParents[wid]);
				for(var i=0; i < refs.length; i++)
				{
					//who is the parent seed of a particular wid? why itself duh!
					self.seedParents[refs[i]] = [refs[i]];
				}
			}

			// self.log("Seed parents: ", self.seedParents);

			//note, there is no default behavior with seeds -- as usual, you must still tell iec to select parents
			//there is no subsitute for parent selection
			if(finished)
				finished();

		});


	}

	//just grab from evo objects -- throw error if issue
	self.selectParents = function(eIDList, finished)
	{
		if(typeof eIDList == "string")
			eIDList = [eIDList];

		var selectedObjects = {};

		for(var i=0; i < eIDList.length; i++)
		{	
			var eID = eIDList[i];

			//grab from evo
			var evoObject = self.evolutionObjects[eID];

			if(!evoObject){
				//wrong id 
				finished("Invalid parent selection: " + eID);
				return;
			}

			selectedObjects[eID] = evoObject;

			//save as a selected parent
			self.selectedParents[eID] = evoObject;
			self.parentCount++;
		}
	
		//send back the evolutionary object that is linked to this parentID
		finished(undefined, selectedObjects);
	}

	self.unselectParents = function(eIDList, finished)
	{
		if(typeof eIDList == "string")
			eIDList = [eIDList];

		for(var i=0; i < eIDList.length; i++)
		{	
			var eID = eIDList[i];

			//remove this parent from the selected parents -- doesn't delete from all the individuals
			if(self.selectedParents[eID])
				self.parentCount--;

			delete self.selectedParents[eID];
		}

		//callback optional really, here for backwards compat 
		if(finished)
			finished();

	}

	self.noDuplicatSeedParents = function(refsAndParents)
	{
		var allSeedNoDup = {};

		//this is a map from the wid to the associated parent wids
		for(var refWID in refsAndParents)
		{
			var parents = refsAndParents[refWID];

			var mergeParents = [];

			for(var i=0; i < parents.length; i++)
			{
				var seedsForEachParent = self.seedParents[parents[i]];

				//now we just merge all these together
				mergeParents = mergeParents.concat(seedsForEachParent);
			}

			//then we get rid of any duplicates
			var nodups = {};
			for(var i=0; i < mergeParents.length; i++)
				nodups[mergeParents[i]] = true;

			//by induction, each wid generated knows it's seed parents (where each seed reference wid references itself in array form)
			//therefore, you just look at your reference's parents to see who they believe is their seed 
			//and concat those results together -- pretty simple, just remove duplicates
			allSeedNoDup[refWID] = Object.keys(nodups);
		}	

		return allSeedNoDup;	
	}

	self.callGenerator = function(allObjects, toCreate, finished)
	{
		var parents = self.getOffspringParents();

		//we need to go fetch some stuff
		self.backEmit("generator:createArtifacts", self.genomeType, toCreate.length, parents, self.sessionObject, function(err, artifacts)
		{
			if(err)
			{
				//pass on the error if it happened
				finished(err);
				return;
			}

			// self.log("iec generated " + toCreate.length + " individuals: ", artifacts);

			//otherwise, let's do this thang! match artifacts to offspring -- arbitrary don't worry
			var off = artifacts.offspring;

			var widOffspring = {};

			for(var i=0; i < off.length; i++)
			{
				var oObject = off[i];
				var eID = toCreate[i];
				//save our evolution object internally -- no more fetches required
				self.evolutionObjects[eID] = oObject;

				//store objects relateive to their requested ids for return
				allObjects[eID] = (oObject);


				//clone the parent objects for the child!
				widOffspring[oObject.wid] = oObject;

				// var util = require('util')
				// self.log("off returned: ".magenta, util.inspect(oObject, false, 3));
			}

			self.backEmit("schema:getReferencesAndParents", self.genomeType, widOffspring, function(err, refsAndParents)
			{
				if(err)
				{
					finished(err);
					return;
				}

				//check the refs for each object
				for(var wid in widOffspring)
				{
					//here we are with refs and parents
					var rAndP = refsAndParents[wid];

					var widSeedParents = self.noDuplicatSeedParents(rAndP);

					// self.log("\n\nwid seed parents: ".magenta, rAndP);


					//for each key, we set our seed parents appropriately	
					for(var key in widSeedParents)
					{
						self.seedParents[key] = widSeedParents[key];
					}
				}

				// self.log("\n\nSeed parents: ".magenta, self.seedParents);

				//mark the offspring as the list objects
				finished(undefined, allObjects);

			});



		});
	}

	//generator yo face!
	self.getOrCreateOffspring = function(eIDList, finished)
	{
		//don't bother doing anything if you havne't selected parents
		if(self.parentCount ==0){
			finished("Cannot generate offspring without parents");
			return;
		}

		//we need to make a bunch, as many as requested
		var toCreate = [];

		var allObjects = {};

		//first we check to see which ids we already know
		for(var i=0; i < eIDList.length; i++)
		{
			var eID = eIDList[i];
			var evoObject = self.evolutionObjects[eID];
			if(!evoObject)
			{
				toCreate.push(eID);
			}
			else
			{
				//otherwise add to objects that will be sent back
				allObjects[eID] = evoObject;
			}
		}

		//now we have a list of objects that must be created
		if(toCreate.length)
		{
			//this will handle the finished call for us -- after it gets artifacts from the generator
			self.callGenerator(allObjects, toCreate, finished);	
		}
		else
		{
			//all ready to go -- send back our objects
			finished(undefined, allObjects)
		}

	}

	self.getOffspringParents = function()
	{
		var parents = [];

		for(var key in self.selectedParents)
			parents.push(self.selectedParents[key]);

		return parents;
	}

	return self;
}





});

require.modules["win-iec"] = require.modules["./libs/evolution/win-iec"];


require.register("./libs/ui/home/win-home-ui", function (exports, module) {

var emitter = require("component~emitter@master");
var element = require("optimuslime~el.js@master");
// var dimensions = require('dimensions');

module.exports = winhome; 

var uFlexID = 0;

function winhome(backbone, globalConfig, localConfig)
{
	// console.log(divValue); 
	var self = this;

	self.winFunction = "ui";

	self.backEmit = backbone.getEmitter(self);
	self.log = backbone.getLogger(self);

	//add appropriate classes to our given div

	self.uid = "home" + uFlexID++;

	var emitterIDs = 0;
	self.uiEmitters = {};
	self.homeElements = {};


	self.requiredEvents = function(){return ["query:getHomeQuery"];};

	self.eventCallbacks = function()
	{
		return {
			"ui:home-initializeDisplay" : self.initializeDisplay,
			"ui:home-ready" : self.ready
		}

	}

	self.initializeDisplay = function(div, options, finished)
	{
		if(typeof options == "function")
		{
			finished = options;
			options = {};
		}
		else //make sure it exists
			options = options || {};

		var homeHolder = element('div.winhome.og-grid');

		var title = options.title || "WIN Domain (customize with title option)"; 


		var th2 = document.createElement('h1');
		th2.innerHTML = title;

	

		var tEl = element('div', {style: "font-size: 2em;"}, th2);
		
		var phyloTitle = options.phylogenyLocation;
		var startFromScratch = options.startFromScratchLocation;

		//if specified, link out to a new site!
		if(phyloTitle){
			var phyloLink = document.createElement('h3');
			var link = element('a', {href: phyloTitle, class: "phyloLink"}, 'Browse full phylogeny here');
			phyloLink.appendChild(link)

			tEl.appendChild(phyloLink);
		}

		if(startFromScratch)
		{
			var scratchLink = document.createElement('h3');
			var link = element('a', {href: startFromScratch, class: "phyloLink"}, 'Start From Scratch');
			scratchLink.appendChild(link)

			tEl.appendChild(scratchLink);
		}

		var loading = element('div', "(images loading...)");
		

		homeHolder.appendChild(tEl);
		homeHolder.appendChild(loading);
		
		var uID = emitterIDs++;
		var uie = {uID: uID};
		emitter(uie);

		self.uiEmitters[uID] = uie;
		self.homeElements[uID] = homeHolder;

		div.appendChild(homeHolder);


		//all done making the display -- added a title and some stuff dooooooop
		finished(undefined, {ui: homeHolder, emitter: uie, uID: uID});
		
	}

	self.createElement = function(wid, category, options)
	{

		var size = options.objectSize || {width: 150, height: 150};

		var addWidth = options.additionalElementWidth || 0;
		var addHeight = options.additionalElementHeight || 50;

		var trueElementSize = "width: " + (size.width) + "px; height: " + (size.height) + "px;"; 
		var fullWidthAndHeight = "width: " + (size.width + addWidth) + "px; height: " + (size.height + addHeight) + "px;"; 
		var id = category + "-" + wid;

		//for now, everything has a border! 

		//now we add some buttons
		var aImg = element('div', {style: trueElementSize, class: "border"});
		var evoBut = element('div', {style: "", class: "homeElementButton"}, "Branch");
		// var history = element('div', {style: "", class: "homeElementButton border"}, "Ancestors");

		//this is where the artifact stuff goes
		var aElement = element('a', {style: fullWidthAndHeight, class: "border"}, 
			[aImg, 
			evoBut
			// , history
			]); 

		var simpleElement = element('li', {id:id, class: "home"}, [aElement]);



		//we also need to add on some extra space for buttons buttons buttons ! need to branch and stuff

		return {full: simpleElement, artifactElement: aImg, branch: evoBut, ancestors: history};
	}

	self.emitElementCreation = function(emit, wid, artifact, eDiv)
	{
		//let 
		emit.emit("elementCreated", wid, artifact, eDiv, function()
		{
			//maybe we do somehitng her in the future -- nuffin' for now gov'nor
		});
	}

	self.clickBranchButton  = function(emit, wid, artifact, eDiv)
	{
		eDiv.addEventListener('click', function()
		{
			emit.emit("artifactBranch", wid, artifact, eDiv);
		});
	}

	self.clickAncestorsButton  = function(emit, wid, artifact, eDiv)
	{
		eDiv.addEventListener('click', function()
		{
			emit.emit("artifactAncestors", wid, artifact, eDiv);
		});
	}


	self.ready = function(uID, options, finished)
	{
		if(typeof options == "function")
		{
			finished = options;
			options = {};
		}
		else //make sure it exists
			options = options || {};


		//pull the emitter for letting know about new objects
		var emit = self.uiEmitters[uID];
		var home = self.homeElements[uID];

		//okay let's setup up everything for real
		var itemStart = options.itemStart || 0;
		var itemsToDisplay = options.itemsToDisplay || 10;

		self.log("Item query - start: ", itemStart, " end: ", (itemStart + itemsToDisplay));


		//then we make a query request
		self.backEmit("query:getHomeQuery", itemStart, (itemStart + itemsToDisplay), function(err, categories)
		{
			//all the categories returned from the home query, and associated objects
			if(err)
			{
				finished(err);
				return;
			}

			console.log("Ready home query ret: ", categories);

			var singleCatID;

			for(var cat in categories)
			{
				singleCatID = cat + "-" + uID ;
				//set up the category title section
				var elWrapper = element('ul#' + singleCatID + ".og-grid", {class: "thumbwrap"});

				var catTitle = document.createElement('h2');
					catTitle.innerHTML = cat;
				var catTitle = element('div', {}, [catTitle, elWrapper]);

				home.appendChild(catTitle);

				//now we let it be known we're creeating elelemtns
				var arts = categories[cat].artifacts;

				for(var i=0; i < arts.length; i++)
				{
					var artifact = arts[i];
					var wid = artifact.wid;

					var elObj = self.createElement(wid, cat, options);

					//add this object to our other elements in the category list
					elWrapper.appendChild(elObj.full);

					self.clickBranchButton(emit, wid, artifact, elObj.branch);
					// self.clickAncestorsButton(emit, wid, artifact, elObj.ancestors);

					self.emitElementCreation(emit, wid, artifact, elObj.artifactElement);
				}
			}

			if(finished)
				finished();

		});
	}

	return self;
}




});

require.modules["win-home-ui"] = require.modules["./libs/ui/home/win-home-ui"];


require.register("./libs/ui/iec/flexstatic", function (exports, module) {

var Emitter = require("component~emitter@master");
// var dimensions = require('dimensions');

module.exports = flexstatic; 

var uFlexID = 0;


function flexstatic(divValue, reqOptions)
{
	// console.log(divValue);
 
	var self = this;

	console.log("POP POP!!d!");

	if(!reqOptions || !reqOptions.objectSize || !reqOptions.objectSize.width || !reqOptions.objectSize.height)
		throw new Error("Can't use flexforever without options or objectSize");

	//deep clone the required options object
	reqOptions = JSON.parse(JSON.stringify(reqOptions));

	//add emitter properties to this object
	Emitter(self);

	//add appropriate classes to our given div
	self.uid = "iec" + uFlexID++;

	self.objectSize = reqOptions.objectSize;

	reqOptions.extraHeightPerObject = reqOptions.extraHeightPerObject || 0;

	//for external ids, where should we start -- not necessarily 0!
	self.startIx = reqOptions.startIx || 0;

	//add a certain amount to our height object to compensate for any additional padding
	self.objectSize.height = self.objectSize.height + reqOptions.extraHeightPerObject;

	var fstatBase = self.uid + "-fstatic-#@#";
	var outerFlexID = fstatBase.replace(/#@#/g, "container");
	var wrapFlexID = fstatBase.replace(/#@#/g, "wrapper");
	
	//console check!
	// console.log('Base: ', fstatBase, " contain: ", outerFlexID, " wrap: ", wrapFlexID);

	//set the innerHTML of the supplied div to now be setup for swiper integration
	divValue.innerHTML = "<div id=\"" + outerFlexID + "\" class=\"fstat-container\">" + 
	// "<div id=" + wrapFlexID + " class=\"fstat-wrapper\">" + 
	// "</div>" +
	"</div>";

	self.borderSize = 1;

	// console.log(divValue.innerHTML);

	// var innerWrapper = document.querySelector("#" + wrapFlexID);
	var outerContainer = document.querySelector("#" + outerFlexID);
	// var dimWrapper = dimensions(innerWrapper);

	var itemsPerRow = function()
	{
		// console.log("Outer: ", outerContainer.offsetWidth, " objects: " , (self.objectSize.width + 2*(self.objectSize.rowMargin || 0 )));
		return Math.floor(outerContainer.offsetWidth/(self.objectSize.width + 2*(self.objectSize.rowMargin || 0)));
	}

	var itemsPerColumn = function()
	{
		return Math.floor(outerContainer.offsetHeight/(self.objectSize.height + 2*(self.objectSize.columnMargin || 0)));
	}

	var maxItemsPerPage = function()
	{
		//the number = number holdable in a row * number of columns
		//at least 1 will be created -- old code -- maybe later
		return Math.max(itemsPerRow()*itemsPerColumn(), 0);// 1);
	}

	var itemsOnPage, itemStart, flexInner;

	var htmlObjects = {};
	var itemCount = 0;
	var itemsOnScreen = 0;

	var init = false;
	self.initialize = function()
	{
		// console.log("Begin init!");
		if(init)
			return;

		//don't do this multiple times
		init = true;

		var flexID = self.uid + "-flex-inner";
		outerContainer.innerHTML = "<div id=\"" + flexID + "\" class=\"flexvcenter\" style=\"border: 1px solid black; height:100%;\"></div>";

		flexInner = document.querySelector("#"+flexID);

		//need to fill our current box with everything we can fit
		var maxIPP = maxItemsPerPage();

		itemStart = 0;


		for(var i=0; i < maxIPP; i++)
		{
			var el = internalCreate(i);
			itemsOnScreen++;
			flexInner.appendChild(el);
		}
	}

	function externalID(i)
	{
		return i + self.startIx;
	}

	function internalCreate(i)
	{
		var el = createElement(i);
		htmlObjects[i] = el;
		itemCount++;
		self.emit('elementCreated', externalID(i), el);
		return el;
	}


	self.removeExcessChildren = function()
	{
		var aRemove = [];
		//if you have too many chilrdren, the extras have to go!
		for(var i = itemsOnScreen; i < flexInner.children.length; i++)
		{
			aRemove.push(flexInner.children[i]);
		}
		aRemove.forEach(function(rm)
		{
			flexInner.removeChild(rm);
		});
	}
	self.previousPage = function()
	{
		//no going left when no more room
		if(itemStart == 0)
			return;
		//we're going to the previous page -- this won't require creating a bunch of elements
		var maxIPP = maxItemsPerPage();

		//hide the current elements
		for(var i= itemStart; i < itemStart + itemsOnScreen; i++)
		{
			self.emit('elementHidden', externalID(i), htmlObjects[i]);
		}

		//we can't go below 0!
		var movement = Math.min(itemStart, maxIPP);

		//going backwards a mighty step!
		itemStart -= movement;

		//items on csreen changes
		itemsOnScreen = movement;

		//Loop through and pull the relevant children
		for(var i=itemStart; i < itemStart + movement; i++)
		{
			var el = htmlObjects[i];
			self.emit('elementVisible', externalID(i));

			if(flexInner.children.length > i - itemStart)
				//replace the children of our container
				flexInner.replaceChild(el, flexInner.children[i-itemStart]);
			else
				flexInner.appendChild(el);	
		}

		self.removeExcessChildren();
	}

	self.nextPage = function()
	{
		//we're going to the next page -- this might require creating a new bunch of elements
		var maxIPP = maxItemsPerPage();

		console.log("Maxpp: ", maxIPP);

		//hide the current elements
		for(var i= itemStart; i < itemStart + itemsOnScreen; i++)
		{
			self.emit('elementHidden', externalID(i), htmlObjects[i]);
		}

		//now let's move to the next page
		itemStart += itemsOnScreen;

		//reset items on screen 
		itemsOnScreen = maxIPP;

		//and create if necessary
		for(var i=itemStart; i < itemStart + maxIPP; i++)
		{
			var el = htmlObjects[i];
			
			//we already made this object
			if(el)
			{
				self.emit('elementVisible', externalID(i), el);
			}
			else
			{
				el = internalCreate(i);
			}

			//replace the child -- or append it depending on circumstances
			if(flexInner.children.length > i - itemStart)
				flexInner.replaceChild(el, flexInner.children[i-itemStart]);
			else
				flexInner.appendChild(el);	
		}

		self.removeExcessChildren();
	}

	var objectIDToUID = function(idCount)
	{
		return self.uid + "-object-" + externalID(idCount);
	}

	//create an element from scratch (using the given identifier)
	var createElement = function(ix)
	{
		var element = document.createElement('div');
		var objectUID = objectIDToUID(ix);

		element.id = objectUID;
		element.style.width = self.objectSize.width + "px";
		element.style.height = self.objectSize.height + "px";

		element.style.marginLeft = self.objectSize.rowMargin + "px" || 0;
		element.style.marginRight = self.objectSize.rowMargin + "px" || 0;

		element.style.marginTop = self.objectSize.columnMargin + "px" || 0;
		element.style.marginBottom = self.objectSize.columnMargin + "px" || 0;

		// element.style.border = (self.borderSize ? (self.borderSize + "px solid black") : 0);

		//make it a border class element
		element.className += "border";

		element.style.overflow = "hidden";

		return element;
	}

	return self;
}




});

require.modules["flexstatic"] = require.modules["./libs/ui/iec/flexstatic"];


require.register("./libs/ui/iec/flexparents", function (exports, module) {

var Emitter = require("component~emitter@master");
var resize = require("ramitos~resize@master");
// var dimensions = require('dimensions');

module.exports = parentList; 

var uFlexID = 0;

function parentList(divValue, reqOptions)
{
	// console.log(divValue);
 
	var self = this;

	if(!reqOptions || !reqOptions.objectSize || !reqOptions.objectSize.width || !reqOptions.objectSize.height)
		throw new Error("Can't use flexforever without options or objectSize");

	//deep clone the required options object
	reqOptions = JSON.parse(JSON.stringify(reqOptions));

	//prepend the new objects
	self.append = reqOptions.append || false;

	//add emitter properties to this object
	Emitter(self);

	//add appropriate classes to our given div
	self.uid = "plist" + uFlexID++;

	self.objectSize = reqOptions.objectSize;
	// console.log(reqOptions.maxItemCount);
	//we auto determin
	self.autoDetermineMax = reqOptions.autoDetermineMax == undefined ? true : reqOptions.autoDetermineMax;

	self.maxItemCount = reqOptions.maxItemCount || Number.MAX_VALUE;

	reqOptions.extraHeightPerObject = reqOptions.extraHeightPerObject || 0;

	//add a certain amount to our height object to compensate for any additional padding
	self.objectSize.height = self.objectSize.height + reqOptions.extraHeightPerObject;

	var plistBase = self.uid + "-#@#";
	var outerFlexID = plistBase.replace(/#@#/g, "container");
	
	//set the innerHTML of the supplied div to now be setup for swiper integration
	divValue.innerHTML = "<div id=" + outerFlexID + " class=\"plist-container parentflex\" style=\"border: 1px solid black; height:100%;\">" 
	+ "</div>";


	var outerContainer = document.querySelector("#" + outerFlexID);

	var itemsPerColumn = function()
	{
		return Math.floor(outerContainer.offsetHeight/(self.objectSize.height + 2*(self.objectSize.columnMargin || 0 + self.borderSize)));
	}

	if(self.autoDetermineMax)
	{
		self.maxItemCount = itemsPerColumn();
		// console.log("Max items: ", self.maxItemCount);
	}

	resize.bind(outerContainer, function()
	{
		//we've received a resize event 
		//adjust element counts and the like
		if(self.autoDetermineMax)
			self.maxItemCount = itemsPerColumn();

		// console.log("Size change deteced, max items: ", self.maxItemCount);


		if(activeElements > self.maxItemCount)
		{
			//don't remove EVERYTHING -- need to leave 1 element no matter what size
			var max = Math.max(1, self.maxItemCount);

			for(var i = max; i < activeElements; i++)
			{
				//remove oldest first always -- however many times we need to do this
				self.removeOldest();
			}
		}
	})


	self.borderSize = 1;

	var nextItem = 0;
	var activeElements = 0;
	
	var htmlObjects = {};
	var dataObjects = {};

	//internal create the parent
	function internalCreate(i, data)
	{
		// console.log("\t\thapkjsdflkjsdflkjsdlfkj: calling create: ", i, " d: ", data)
		var el = createElement(i);
		htmlObjects[i] = el;
		dataObjects[i] = data;
		activeElements++;
		self.emit('elementCreated', data, i, el);
		return el;
	}

	self.activeParents = function(){return activeElements;};

	//really simple, just append to our container a new element
	self.addElement = function(data)
	{
		var newID = nextItem++;

		var el = internalCreate(newID, data);

		// console.log("activeElements: ", activeElements, " count: ", self.maxItemCount)
			//need to remove the lowest element
		if(activeElements > self.maxItemCount)
			self.removeOldest();

		//prepend
		if(!self.append)
			outerContainer.insertBefore(el, outerContainer.firstChild);
		else //otherwise we're appending the object
			outerContainer.append(el);
	}
	self.removeOldest = function()
	{
		var keys = Object.keys(htmlObjects);
		keys.sort(function(a,b){return parseInt(a) - parseInt(b);});

		//grab the lowest key we have
		var rmKey = keys[0];

		//now we remove that object at the bottom of the list
		self.removeElement(rmKey);		
	}

	self.removeElement = function(id)
	{
		// console.log("Removing: ", id);
		//get the object from our list of objects
		var el = htmlObjects[id];
		var data = dataObjects[id];

		//minus an element
		activeElements--;

		//let it be known, it's over! We're about to remove the parent
		self.emit('elementRemoved', data, id);

		//remove the object!
		outerContainer.removeChild(el);

		delete htmlObjects[id];
		delete dataObjects[id];

	}

	self.removeRandom = function()
	{
		var keys = Object.keys(htmlObjects);
		var rmIx = Math.floor(Math.random()*keys.length);

		//jusst remove something random -- for testing purposes
		self.removeElement(keys[rmIx]);
	}

	var objectIDToUID = function(idCount)
	{
		return self.uid + "-object-" + idCount;
	}

	var getElement = function(ix)
	{
		var objectUID = objectIDToUID(ix);
		return htmlObjects[objectUID];
	}

	//create an element from scratch (using the given identifier)
	var createElement = function(ix)
	{
		var element = document.createElement('div');
		var objectUID = objectIDToUID(ix);

		element.id = objectUID;
		element.style.width = self.objectSize.width + "px";
		element.style.height = self.objectSize.height + "px";

		element.style.marginLeft = self.objectSize.rowMargin + "px" || 0;
		element.style.marginRight = self.objectSize.rowMargin + "px" || 0;

		element.style.marginTop = self.objectSize.columnMargin + "px" || 0;
		element.style.marginBottom = self.objectSize.columnMargin + "px" || 0;

		// element.style.border = (self.borderSize ? (self.borderSize + "px solid black") : 0);

		//make it a border class element
		element.className += "border pobject";

		element.style.overflow = "hidden";

		return element;
	}

	return self;
}




});

require.modules["flexparents"] = require.modules["./libs/ui/iec/flexparents"];


require.register("./libs/ui/iec/publishui", function (exports, module) {

var modal = require("optimuslime~modal@master");
var emitter = require("component~emitter@master");
var element = require("optimuslime~el.js@master");
var pillbox = require("component~pillbox@master");
var classes = require("component~classes@master");

      
module.exports = function(options)
{	
	var self = this;

	//have emit capabilities -- let other know when certain events are triggered
	emitter(self);

	//given a div, we need to make our publishing adjustments
	if(!options.objectSize)
		throw new Error("Need object size for publish view!");

	var modalNames = {
		bPublish: "modal-publish",
		bCancel: "modal-cancel",
		iTitle: "modal-title",
		iTags : "modal-tags",
		dArtifact : "modal-artifact-object",
		dTop : "modal-top",
		dBottom: "modal-bottom",
		dParent : "modal-parent"
	}


	//now, we setup our div objects
	self.createModalWindow = function()
	{
		//we need to make a full blown UI and hook it up to events that will be emitted

		var div = element('div', {id: modalNames.dParent, class: "container fullSize flexContainerColumn"});

		var row = element('div', {id: modalNames.dTop, class: "noPadding flexRow flexSeparate"});

		var titleObject = element('div', {class: "title fullWidth flexContainerRow noPadding"}, 
			[ 
				element('div', {class: "col-xs-3 noPadding"}, 'Title: '),
				element('input', {id: modalNames.iTitle, type : "text", class: "col-auto noPadding titleText"})
			]);

		var tagObject = element('div', {id: "tag-holder", class: "fullSize flexContainerRow noPadding"}, 
			[
				element('div', {class: "col-xs-3 noPadding"}, 'Tags: '),
				element('input', {id: modalNames.iTags, type: "text", class: "col-auto noPadding"})
			]);

		var rightColumn = element('div', {id: "text-col"}, [titleObject, tagObject]);


		var widthAndHeight = "width: " + options.objectSize.width + "px; height: " + options.objectSize.height + "px;"; 
		var leftColumn = element('div', {id: "art-col", class: "col-xs-5"}, element('div', {id: modalNames.dArtifact, style: widthAndHeight, class: "border"}, "artifact here"));

		row.appendChild(leftColumn);
		row.appendChild(rightColumn);


		var pubButton = element('div', {id: modalNames.bPublish, class: "col-auto modalButton publish centerRow"}, "Publish");
		var cancelButton = element('div', {id: modalNames.bCancel, class: "col-auto modalButton cancel centerRow"}, "Cancel");

		var bottom = element('div', {id: modalNames.dBottom, class: "noPadding fullWidth flexContainerRow flexSeparate"}, [pubButton, cancelButton]);

		//now add the top row
		div.appendChild(row);
		div.appendChild(bottom);

		return div;
	}

	var div = self.createModalWindow();

	//do we need this piece?
	document.body.appendChild(div);

	var artifactDiv = document.getElementById(modalNames.dArtifact);

	var title = document.getElementById(modalNames.iTitle);
	//add tags to artifact-tag object
	var tags = document.getElementById(modalNames.iTags);

	var input = pillbox(tags, { lowercase : true, space: true });
	classes(tags.parentNode)
		.add("col-auto")
		.add("noPadding");

	//now we add listeners for publish/cancel
	var pub = document.getElementById(modalNames.bPublish);

	pub.addEventListener('click', function()
	{
		//for right now, we just close the modal
		self.publishArtifact();
	})

	var cancel = document.getElementById(modalNames.bCancel);
	cancel.addEventListener('click', function()
	{
		//for right now, we just close the modal
		self.cancelArtifact();
	})

	var view = modal(div)
		.overlay()
	    .effect('fade-and-scale');


    var currentID;

    self.launchPublishModal = function(eID)
    {
    	if(currentID != eID)
    	{
    		//clear tag and titles
    		tags.value = "";
    		title.value = "";
    	}
    	currentID = eID;
    	view.show();

    	var fc;
    	while((fc = artifactDiv.firstChild) != undefined)
    	{
    		artifactDiv.removeChild(fc);
    	}

    	//showing an object with a given id -- removed the innards for replacement
    	self.emit("publishShown", eID, artifactDiv, function()
		{
			//this doesn't have to be called, but it's good to be in the habbit -- since we may also want to display a loading gif
		});
    }

    self.cancelArtifact = function()
    {
    	view.hide();
    	self.emit("publishHidden", currentID);
    }

    self.publishArtifact = function()
    {
    	if(!self.hasListeners("publishArtifact"))
    	{
    		console.log("Warning: No listeners for publishing");
    		view.hide();
    	}
    	else{
    		var meta = {title: title.value, tags: input.values()};
	    	self.emit("publishArtifact", currentID, meta, function()
	    	{
	    		//when finished -- hide the mofo!p
	    		view.hide();
	    	});
	    }
    }


     return self;
}

});

require.modules["publishui"] = require.modules["./libs/ui/iec/publishui"];


require.register("./libs/ui/iec/flexiec", function (exports, module) {

var Emitter = require("component~emitter@master");
var resize = require("ramitos~resize@master");
var classes = require("component~classes@master");
var events = require("component~events@master");

var publish = require("./libs/ui/iec/publishui");

//
var element = require("optimuslime~el.js@master");

var flexstatic = require("./libs/ui/iec/flexstatic");
var flexparents = require("./libs/ui/iec/flexparents");
// var dimensions = require('dimensions');

module.exports = flexIEC; 

var uFlexID = 0;

function flexIEC(divValue, reqOptions)
{
	// console.log(divValue);
	var self = this;

	if(!reqOptions || !reqOptions.evoOptions  || !reqOptions.parentOptions)
		throw new Error("Can't use flexforever without options or objectSize");

	//deep clone the required options object
	reqOptions = JSON.parse(JSON.stringify(reqOptions));

	//someobody needs to tell us where to start the count 
	reqOptions.evoOptions.startIx = reqOptions.startIx || reqOptions.evoOptions.startIx || 0;

	self.bottomElementSize = reqOptions.bottomElementSize || 47;

	//need to add some space to our objects
	reqOptions.evoOptions.extraHeightPerObject = self.bottomElementSize;

	reqOptions.publishOptions = reqOptions.publishOptions || {objectSize: reqOptions.evoOptions.objectSize};

	//add emitter properties to this object
	Emitter(self);

	//add appropriate classes to our given div
	self.uid = "flexIEC" + uFlexID++;

	self.objectSize = reqOptions.objectSize;

	var iecBase = self.uid + "-#@#";
	var outerFlexID = iecBase.replace(/#@#/g, "container");
	
	//set the innerHTML of the supplied div to now be setup for swiper integration
	divValue.innerHTML = "<div id=" + outerFlexID + " class=\"iec-container flexIEC border\" style=\"height:100%;\">" 
	+ "</div>";

	var outerContainer = document.querySelector("#" + outerFlexID);


	//Out yo face, tell us when your changing sizes
	resize.bind(outerContainer, function()
	{
		// console.log('IEC Resize: ', outerContainer.offsetWidth, " height: ",)
	});

	//now we need to setup the parent section and the iec children section
	var container = element('div', {id: "test",  class: "container fullWH pOR"});	

	//simple test at first
	var row = element('div', {id: "test", class : "row mOR fullWH"});


	var parentFlexDiv, evoFlexDiv;

	var loadingIndividuals = {};
	var finishedLoading = {};
	var fullObjects = {};

	var parentObjects = {};



	self.createEvolutionGrid = function()
	{
		//build piece by piece the evo grid
		var rightColumn = element('div', {id: "evo-col", class: "col-auto fullWH colObject border mOR pOR"});
		var tabs = element('div', {id: "evoTabs", class : "tabs row mOR"});

		var evoBottom = element('div', {id: "evo-bot", class : "innerObject colObject"});
		evoFlexDiv = evoBottom;

		rightColumn.appendChild(tabs);
		rightColumn.appendChild(evoBottom);

		return rightColumn;
	}

	self.createParentList = function()
	{
		//creat the top level container
		var parentColumn = element('div', 
			{id: "parent-col", style: "width: " + (reqOptions.parentOptions.objectSize.width  + 25) + "px", 
			class: "col-xs-3 fullWH colObject border mOR pOR"});
		
		//then we break it into the title row, and the actual parent list object 
		var parentTopRow = element('div', {id: "p-top", class : ""});
		var parentBottomRow = element('div', {id: "p-bot", class : "innerObject colObject border"});

		var choice = element('div', {id: "p-top-choice", class : "border"});
		choice.innerHTML = "Parent Artifacts";

		//add the choice object to our top row (to have something to display)
		parentTopRow.appendChild(choice);
		parentColumn.appendChild(parentTopRow);
		parentColumn.appendChild(parentBottomRow);

		parentFlexDiv = parentBottomRow;

		return parentColumn;
	}

	//set it to like, then start parent creation process
	self.createParent = function(eID)
	{
		//create parent using element info
		self.parentFlex.addElement(eID);
	}
	self.deleteParent = function(eID)
	{
		var pObject = parentObjects[eID];

		//remove this object from our parent
		self.parentFlex.removeElement(pObject.pID);
	}

	//a parent has been removed!
	self.parentDeleted = function(evoID, pID)
	{
		var el = fullObjects[evoID];

		// console.log("Deleted parent: ", evoID, el);

		if(el)
		{
			var cl = classes(el);

			if(cl.has('like'))
				cl.toggle('like'); 
		}

		//delete parent using element info
		delete parentObjects[evoID];

		//let it be known wassup
		self.emit("parentUnselected", evoID);
	}

	var pSelected = function(evoID)
	{
		return function()
		{
			//don't really do anything after selecting parents
		};
	}

	self.parentCreated = function(evoID, parID, eDiv)
	{
		var el = fullObjects[evoID];
		if(el)
		{
			var cl = classes(el);

			if(!cl.has('like'))
				cl.toggle('like'); 
		}

		//when a parent is created, we make note
		parentObjects[evoID] = {pID: parID, el: eDiv};

		//make it known that this parent was selected for real -- we'll handle the UI
		self.emit("parentSelected", evoID, eDiv, pSelected(evoID));
	}

	self.likeElement = function(e)
	{
		//either you  or your parent have an ID -- pull that id info
		var tID = e.target.id || e.target.parentElement.id;

		//replace element name to get teh original eID
		var elementID = tID.replace(/-like/g, "");

		//already a parent, toggle -- remove parent
		if(parentObjects[elementID])
		{
			// console.log("Start delete parent: ", elementID)
			self.deleteParent(elementID);
		}
		else{
			// console.log("Start make parent: ", elementID)
			self.createParent(elementID);
		}


		//we toggle adding this to our parent objects
	}

	self.publishElement = function(e)
	{
		//either you  or your parent have an ID -- pull that id info
		var tID = e.target.id || e.target.parentElement.id;

		var elementID = tID.replace(/-publish/g, "");

		//launch a publish attempt using this ID
		self.publish.launchPublishModal(elementID);
	}

	self.createLoadingWrapper = function(eID)
	{
		var wrapDiv = element('div', {id: eID + "-wrap", class: "colObject"});
		var loadingDiv = element('div', {id: eID + "-object", class: "loading innerObject"});

		var bottomRow = element('div', {id: eID + "-bot", style : "height: " + self.bottomElementSize + "px;", class: "row mOR border"});

		//create a like button with an inner like div -- content == like graphic
		var likeButton = element('div', {id: eID + "-like", class: "col-auto pOR border"}, element('div', 'like'));
		var publishButton = element('div', {id: eID + "-publish", class: "col-auto pOR border"}, element('div', 'pub'));
	
		//create some managers...
		var likeManager = events(likeButton, self);
		var pubManager = events(publishButton, self);

		//bind click events to self.like and self.publish callbacks
		likeManager.bind('click', 'likeElement');
		pubManager.bind('click', 'publishElement');	


		bottomRow.appendChild(likeButton);
		bottomRow.appendChild(publishButton);

		wrapDiv.appendChild(loadingDiv);
		wrapDiv.appendChild(bottomRow);

		//send it back all done up
		return {full: wrapDiv, object: loadingDiv};
	}

	//create the left parent side

	// var parentColumn = element('div', {id: "parent-col", class: "col-xs-3 fullWH colObject border mOR pOR"});
	var pColumn = self.createParentList();
	var evoColumn = self.createEvolutionGrid();

	//append both columns to the iec object
	row.appendChild(pColumn);
	row.appendChild(evoColumn);

	container.appendChild(row);

	outerContainer.appendChild(container);



	//create our flex parent
	self.parentFlex = new flexparents(parentFlexDiv, reqOptions.parentOptions || {});

	self.parentFlex.on('elementCreated', self.parentCreated);
	self.parentFlex.on('elementRemoved', self.parentDeleted);


	//create the evolution grid -- self initializes
	self.evoFlex = new flexstatic(evoFlexDiv, reqOptions.evoOptions || {});

	self.activeParents = function(){return self.parentFlex.activeParents();};

	self.individualLoaded = function(eID)
	{
		return function()
		{
			//grab our loading individual using the ID
			var eDiv = loadingIndividuals[eID];

			//grab class information,
			var c = classes(eDiv);
			//use class info to toggle loading backgroung (if it still exists)
			if(c.has('loading'))
				c.toggle('loading');

			for(var i=0; i < eDiv.children.length; i++)
			{	
				var c = classes(eDiv.children[i]);
				if(c.has('loading'))
					c.toggle('loading');
			}

			finishedLoading[eID] = eDiv;
			//get rid of the other stuff
			delete loadingIndividuals[eID];
		}
	}

	self.evoFlex.on('elementCreated', function(eID, eDiv)
	{
		var wrapDiv = self.createLoadingWrapper(eID);
		
		eDiv.appendChild(wrapDiv.full);

		//save full object
		fullObjects[eID] = eDiv;

		//now officially loading this object
		loadingIndividuals[eID] = wrapDiv.object;

		self.emit('createIndividual', eID, wrapDiv.object, self.individualLoaded(eID));
	});

	self.evoFlex.on('elementVisible', function(eID)
	{
		console.log("Visible: ", eID);
		// element.className += "grid-cell";
		// eDiv.innerHTML = "<div>Vis: "+eID+"</div>";
	});

	self.evoFlex.on('elementHidden', function(eID)
	{
		console.log("Hidden: ", eID);
		// element.className += "grid-cell";
		// eDiv.innerHTML = "<div>Invis: "+eID+"</div>";
	});


	//signify that it's time to init everything
	self.ready = function()
	{
		self.evoFlex.initialize();
	}

	//deal with publishing	-- add in our publishing object according to publishUI setup
	self.publish = publish(reqOptions.publishOptions);

	//this is the real deal! We have what we need to publish
	self.publish.on('publishArtifact', function(eID, meta, finished)
	{
		//we now pass this on to those above us for proper publishing behavior
		self.emit('publishArtifact', eID, meta, finished);
	});

	self.publish.on('publishShown', function(eID, eDiv, finished){

		//we have space in eDiv for our objects (according to size already determined)
		//we have nothing to add to this info
		self.emit('publishShown', eID, eDiv, finished);
	});

	self.publish.on('publishHidden', function(eID, eDiv, finished){

		//we have space in eDiv for our objects (according to size already determined)
		//we have nothing to add to this info
		self.emit('publishHidden', eID);
	});



	return self;
}




});

require.modules["flexiec"] = require.modules["./libs/ui/iec/flexiec"];


require.register("./libs/ui/iec/win-flexIEC", function (exports, module) {
var flexIEC = require("./libs/ui/iec/flexiec");
var winIEC = require("./libs/evolution/win-iec");

var emitter = require("component~emitter@master");

//we need to combine the two! Also, we're a win module -- so shape up!
module.exports = winflex;

function winflex(backbone, globalConfig, localConfig)
{
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "ui";

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	self.moreThanOneDisplay = localConfig.moreThanOneDisplay || false;

	//we have logger and emitter, set up some of our functions

	self.htmlEvoObjects = {};

	//what events do we need?
	self.requiredEvents = function()
	{
		return [
			"evolution:loadSeeds",
			"evolution:getOrCreateOffspring",
			"evolution:selectParents",
			"evolution:publishArtifact",
			"evolution:unselectParents"
			//in the future we will also need to save objects according to our save tendencies
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			"ui:initializeDisplay" : self.initializeDiv,
			"ui:ready" : self.ready
		};
	}

	var uiCount = 0;
	var single = false;

	var uiObjects = {};

	self.chooseRandomSeed = function(seedMap)
	{
		var seedKeys = Object.keys(seedMap);
		var rIx = Math.floor(Math.random()*seedKeys.length);
		return seedKeys[rIx];
	}

	//initialize 
	self.initializeDiv = function(seeds, div, flexOptions, done)
	{
		if(single && self.moreThanOneDisplay)
			return;

		if(!seeds.length)
		{
			done("Must send at least 1 seed to initialization -- for now");
			return;
		}

		if(seeds.length > 1)
			self.log("Undefined behavior with more than one seed in this UI object. You were warned, sorry :/")
		//not getting stuck with an undefined issue
		flexOptions = flexOptions || {};

		//if you only ever allow one div to take over 
		single = true;

		//seed related -- start generating ids AFTER the seed count -- this is important
		//why? Because effectively there is a mapping between ids created in the ui and ids of objects created in evoltuion
		//they stay in sync all the time, except for seeds, where more ids exist than there are visuals. 
		//for that purpose, seeds occupy [0, startIx), 
		var startIx = seeds.length;
		flexOptions.startIx = Math.max(startIx, flexOptions.startIx || 0);

		//part of the issue here is that flexIEC uses the ids as an indicator of order because they are assumed to be numbers
		//therefor remove oldest uses that info -- but in reality, it just needs to time stamp the creation of evo objects, and this can all be avoided in the future
		var seedMap = {};
		for(var i=0; i < seeds.length; i++)
			seedMap["" + i] = seeds[i];

		//untested if you switch that!
		var nf = new flexIEC(div, flexOptions);

		//add some stuff to our thing for emitting
		var uiEmitter = {};
		emitter(uiEmitter);

		//a parent was selected by flex
		nf.on('parentSelected', function(eID, eDiv, finished)
		{
			//now a parent has been selected -- let's get that parent selection to evolution!
			 self.backEmit("evolution:selectParents", [eID], function(err, parents)
			 {
			 	//index into parent object, grab our single object
			 	var parent = parents[eID];

			 	//now we use this info and pass it along for other ui business we don't care about
			 	//emit for further behavior -- must be satisfied or loading never ends hehehe
			 	uiEmitter.emit('parentSelected', eID, eDiv, parent, finished);
			 });
		});

		//parent is no longer rocking it. Sorry to say. 
		nf.on('parentUnselected', function(eID)
		{
			//now a parent has been selected -- let's get that parent selection to evolution!
			 self.backEmit("evolution:unselectParents", [eID], function(err)
			 {
			 	//now we use this info and pass it along for other ui business we don't care about
			 	//emit for further behavior -- must be satisfied or loading never ends hehehe
			 	uiEmitter.emit('parentUnselected', eID);

		 		self.log("act pars: ",nf.activeParents());
			 	//are we empty? fall back to the chosen seed please!
			 	if(nf.activeParents() == 0)
			 	 	nf.createParent(self.chooseRandomSeed(seedMap));

			 });
		});

		//individual created inside the UI system -- let's make a corresponding object in evolution
		nf.on('createIndividual', function(eID, eDiv, finished)
		{
			//let it be known that we are looking for a sweet payday -- them kids derr
			 self.backEmit("evolution:getOrCreateOffspring", [eID], function(err, allIndividuals)
			 {
			 	// console.error("shitidjfdijfdf");
			 	//we got the juice!
			 	var individual = allIndividuals[eID];

			 	self.log("Create ind. create returned: ", allIndividuals);

			 	//now we use this info and pass it along for other ui business we don't care about
			 	//emit for further behavior -- must be satisfied or loading never ends hehehe
			 	uiEmitter.emit('individualCreated', eID, eDiv, individual, finished);
			 });
		});

		nf.on('publishArtifact', function(eID, meta, finished)
		{
			//let it be known that we are looking for a sweet payday -- them kids derr
			 self.backEmit("evolution:publishArtifact", eID, meta, function(err)
			 {
			 	if(err)
			 	{
			 		uiEmitter.emit('publishError', eID, err);
			 	}
			 	else
			 	{
			 		uiEmitter.emit('publishSuccess', eID);
			 	}

			 	//now we are done publishing
			 	finished();

			 });
		});

		//might be published-- we are looking at the modal window
		nf.on('publishShown', function(eID, eDiv, finished)
		{
			//we simply send back the indentifier, and where to put your display in the html object
		 	uiEmitter.emit('publishShown', eID, eDiv, finished);
		});

		//we hid the object -- maybe animation needs to stop or something, let it be known
		nf.on('publishHidden', function(eID)
		{
			uiEmitter.emit('publishHidden', eID);
		});

		//this is a temporary measure for now
		//send the seeds for loading into iec -- there will be a better way to do this in the future
		self.backEmit("evolution:loadSeeds", seedMap, function(err)
		{
			if(err)
			{
				done(err);
			}
			else
			{
				var uID = uiCount++;
				var uiObj = {uID: uID, ui: nf, emitter: uiEmitter, seeds: seedMap};
				uiObjects[uID] = uiObj;
				//send back the ui object
				done(undefined, uiObj);
			}
		});
	}

	self.ready = function(uID, done)
	{
		var uio = uiObjects[uID];

		var nf = uio.ui;

		//pull a random seed to set as the single parent (that's just our choice)
		//we could pull 2 if they existed, but we don't
		
		var parentSeedID = self.chooseRandomSeed(uio.seeds);

		//auto select parent -- this will cause changes to evolution
		nf.createParent(parentSeedID);

		//start up the display inside of the div passed in
		nf.ready();

	}


	return self;
}

});

require.modules["win-flexIEC"] = require.modules["./libs/ui/iec/win-flexIEC"];


require.register("./libs/webworkers/webworker-queue", function (exports, module) {

var WebWorkerClass = require("component~worker@master");

module.exports = webworkerqueue;

function webworkerqueue(scriptName, workerCount)
{ 
    var self = this;

    self.nextWorker = 0;
    
    //queue to pull from 
    self.taskQueue = [];
    self.taskCallbacks = {};

    //store the web workers
    self.workers = [];

    //how many workers available
    self.availableWorkers = workerCount;

    //note who is in use
    self.inUseWorkers = {};
    
    //and the full count of workers
    self.totalWorkers = workerCount;

    for(var i=0; i < workerCount; i++){

        var webworker = new WebWorkerClass(scriptName);

        //create a new worker id (simply the index will do)
        var workerID = i;

        //label our workers
        webworker.workerID = workerID;

        //create a webworker message callback unique for this worker
        //webworker in this case is not a raw webworker, but an emitter object -- so we attach to the message object
        webworker.on('message', uniqueWorkerCallback(workerID));

        //store the worker inside here
        self.workers.push(webworker);
    }


    function uniqueWorkerCallback(workerID)
    {
        return function(data){
            //simply pass on the message with the tagged worker
            workerMessage(workerID, data);
        }
    }

    function getNextAvailableWorker()
    {
        //none available, return null
        if(self.availableWorkers == 0)
            return;

        //otherwise, we know someone is available
        setNextAvailableIx();

        //grab the next worker available
        var worker = self.workers[self.nextWorker];

        //note that it's now in use
        self.inUseWorkers[self.nextWorker] = true;

        //less workers available
        self.availableWorkers--;

        //send back the worker
        return worker;
    }

    function setNextAvailableIx()
    {
        for(var i=0; i < self.totalWorkers; i++)
        {
            //check if it's in use
            if(!self.inUseWorkers[i])
            {
                self.nextWorker = i;
                break;
            }
        }
    }

    //this function takes a workerID and a data object -- called from the worker
    function workerMessage(workerID, data)
    {
        //we got our message, we pass it for callback

        //we know what workerID, so pull the associated callback
        var cb = self.taskCallbacks[workerID];

        //now remove all things associated with the task
        delete self.taskCallbacks[workerID];

        //free the worker
        delete self.inUseWorkers[workerID];

        //now on the market :)
        self.availableWorkers++;

        //prepare the callback -- if it exists
        if(cb)
        {
            //send the data back, pure and simple
            cb(data);
        }

        //now, do we have any queue events waiting?
        if(self.taskQueue.length > 0)
        {
            //now we need to process the task
            var taskObject = self.taskQueue.shift();

            //okay, queue it up! -- this should work immediately becuase we just freed a worker
            self.queueJob(taskObject.data, taskObject.callback);
        }
    }


    self.queueJob = function(data, callback)
    {

        //if we have any available workers, just assign it directly, with a callback stored
        var worker = getNextAvailableWorker();

        if(worker)
        {
            //we have a worker to issue commands to now
            //this is the callback we engage once the message comes back
            self.taskCallbacks[worker.workerID] = callback;

            //send the data now, thanks -- we'll handle callback in workerMessage function
            worker.send(data);
        }
        else
        {   
            //otherwise, we need to add the item to the queue
            self.taskQueue.push({data: data, callback: callback});
            //the queue is cleared when the other workers return from their functions
        }
    }

}

});

require.modules["webworker-queue"] = require.modules["./libs/webworkers/webworker-queue"];


require.register("win-picbreeder", function (exports, module) {
var flexStatic = require("./libs/ui/iec/flexstatic");



console.log("Static a go!");
});

require.define("win-picbreeder/pbConfig.json", {"serverRoot":"http://localhost:3000","apiRoot":"","winHostPort":3001});

require.modules["win-picbreeder"] = require.modules["win-picbreeder"];


