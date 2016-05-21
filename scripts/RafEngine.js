'use strict';

function isFunc(func) {
  if (func.apply && func.call && func.bind) {
      return true;
    }

    return false;
}


define(function(){


  function RafEngine() {
    this.work = [];
    this.perms = [];
    //this._raf();
  }

  RafEngine.prototype.think = function() {

    for (var i = 0; i < this.perms.length; i++) {
      var perm = this.perms[i];
      perm();
    }

    var pop = this.work.pop();
    while (pop !== null && pop !== undefined) {
      if (isFunc(pop)) {
        pop();
      }
      pop = this.work.pop();
    }

    this._raf();
  };

  RafEngine.prototype._raf = function() {
    requestAnimationFrame(this.think.bind(this));
  };

  RafEngine.prototype.perm = function(callback) {
    this.perms.push(callback);
    this._raf();
  };

  RafEngine.prototype.queue = function(callback) {
    this.work.push(callback);
  };

  return RafEngine;
});
