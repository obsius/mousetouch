'use strict';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const CLICK_THRESHOLD = 200;
const DBLCLICK_THRESHOLD = 500;
const MOVE_THRESHOLD = 2;
class MouseTouch {
  constructor(element, options = {}) {
    _defineProperty(this, "dispatchers", {});

    _defineProperty(this, "touchmove", e => {
      if (this.lastDownAt && Date.now() - this.lastDownAt > this.clickThreshold) {
        this.dispatch('mousemove', e);
      }
    });

    _defineProperty(this, "touchstart", e => {
      this.touch = true;
      this.lastDownAt = Date.now();
      this.srcEvent = e;
      this.dispatch('mousedown', e);
    });

    _defineProperty(this, "touchend", e => {
      // prevent mouseclick from firing
      if (this.touch) {
        this.touch = false;
        e.preventDefault();
      }

      this.dispatch('mouseup', this.srcEvent);

      if (this.lastDownAt && Date.now() - this.lastDownAt < this.clickThreshold) {
        this.dispatch('click', this.srcEvent);

        if (this.lastClickAt && Date.now() - this.lastClickAt < this.dblClickThreshold) {
          this.lastClickAt = null;
          this.dispatch('dblclick', this.srcEvent);
        } else {
          this.lastClickAt = Date.now();
        }
      }
    });

    _defineProperty(this, "touchcancel", e => {
      this.touch = false;
    });

    _defineProperty(this, "mousemove", e => {
      if (!this.lastDownAt || Date.now() - this.lastDownAt > this.clickThreshold) {
        this.dispatch('mousemove', e);
      }
    });

    _defineProperty(this, "mousedown", e => {
      this.lastDownAt = Date.now();
      this.dispatch('mousedown', e);
    });

    _defineProperty(this, "mouseup", e => {
      this.dispatch('mouseup', e);
    });

    _defineProperty(this, "click", e => {
      this.dispatch('click', e);
    });

    _defineProperty(this, "dblclick", e => {
      this.dispatch('dblclick', e);
    });

    this.element = element;
    this.clickThreshold = options.clickThreshold || CLICK_THRESHOLD;
    this.dblClickThreshold = options.dblClickThreshold || DBLCLICK_THRESHOLD;
    this.moveThreshold = options.moveThreshold || MOVE_THRESHOLD;
    this.offset = getElementOffset(element);
    window.addEventListener('touchend', this.touchend, false);
    window.addEventListener('touchcancel', this.touchend, false);
    window.addEventListener('mouseup', this.mouseup, false);
    element.addEventListener('touchmove', this.touchmove, false);
    element.addEventListener('touchstart', this.touchstart, false);
    element.addEventListener('mousemove', this.mousemove, false);
    element.addEventListener('mousedown', this.mousedown, false);
    element.addEventListener('click', this.click, false);
    element.addEventListener('dblclick', this.dblclick, false);
  }

  on(eventType, fn) {
    if (!validEventType(eventType)) {
      throw new Error(`Unrecognized event type "${eventType}" passed to MouseInteractions registerer`);
    }

    if (!this.dispatchers[eventType]) {
      this.dispatchers[eventType] = [];
    }

    this.dispatchers[eventType].push(fn);
  }

  off(eventType, fn = null) {
    if (!validEventType(eventType)) {
      throw new Error(`Unrecognized event "${eventType}" passed to MouseInteractions deregisterer`);
    }

    if (!fn || !this.dispatchers[eventType]) {
      this.dispatchers[eventType] = [];
    } else {
      for (let i = this.dispatchers[eventType].length; i--;) {
        this.dispatchers.splice(i, 1);
      }
    }
  }

  destroy() {
    this.dispatchers = {};
    window.removeEventListener('touchend', this.touchend);
    window.removeEventListener('touchcancel', this.touchend);
    window.removeEventListener('mouseup', this.mouseup);
    this.element.removeEventListener('touchmove', this.touchmove);
    this.element.removeEventListener('touchstart', this.touchstart);
    this.element.removeEventListener('mousemove', this.mousemove);
    this.element.removeEventListener('mousedown', this.mousedown);
    this.element.removeEventListener('click', this.click);
    this.element.removeEventListener('dblclick', this.dblclick);
  }
  /* private */


  dispatch(eventType, event) {
    if (!event || !this.dispatchers[eventType]) {
      return;
    }

    for (let fn of this.dispatchers[eventType]) {
      fn(normalizeEvent(event, this.offset));
    }
  }

}
/* internals */

function validEventType(eventType) {
  return eventType == 'mousemove' || eventType == 'mousedown' || eventType == 'mouseup' || eventType == 'click' || eventType == 'dblclick';
} // TODO: adjust for scaling and rotation


function getElementOffset(element) {
  let offset = {
    x: 0,
    y: 0
  };

  while (element.offsetParent) {
    offset.x += element.offsetLeft - element.scrollLeft;
    offset.y += element.offsetTop - element.scrollTop;
    element = element.offsetParent;
  }

  return offset;
}

function normalizeEvent(event, offset) {
  // touch events don't have buttons
  if (event.button == null) {
    event.button = 0;
  }

  if (event.offsetX != null && event.offsetY != null) {
    return event;
  }

  event.offsetX = event.targetTouches ? event.targetTouches[0].pageX : event.clientX;
  event.offsetY = event.targetTouches ? event.targetTouches[0].pageY : event.clientY;
  event.offsetX -= offset.x;
  event.offsetY -= offset.y;
  return event;
}

module.exports = MouseTouch;