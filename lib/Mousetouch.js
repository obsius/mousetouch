'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CLICK_THRESHOLD = 200;
var DBLCLICK_THRESHOLD = 500;
var MOVE_THRESHOLD = 2;

var MouseTouch = function () {
	function MouseTouch(element) {
		var _this = this;

		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		(0, _classCallCheck3.default)(this, MouseTouch);
		this.dispatchers = {};

		this.touchmove = function (e) {
			if (!_this.touch) {
				_this.touch = true;
			}

			if (_this.lastDownAt && time() - _this.lastDownAt > _this.clickThreshold) {
				_this.dispatch('mousemove', e);
			}
		};

		this.touchstart = function (e) {
			if (!_this.touch) {
				_this.touch = true;
			}

			_this.lastDownAt = time();
			_this.srcEvent = e;

			_this.dispatch('mousedown', e);
		};

		this.touchend = function (e) {
			if (_this.lastDownAt && time() - _this.lastDownAt < _this.clickThreshold) {

				_this.dispatch('click', _this.srcEvent);

				if (_this.lastClickAt && time() - _this.lastClickAt < _this.dblClickThreshold) {
					_this.lastClickAt = null;
					_this.dispatch('dblclick', _this.srcEvent);
				} else {
					_this.lastClickAt = time();
				}
			}

			_this.dispatch('mouseup', _this.srcEvent);
		};

		this.touchcancel = function (e) {};

		this.mousemove = function (e) {
			if (!_this.touch) {
				if (_this.lastDownAt && time() - _this.lastDownAt > _this.clickThreshold) {
					_this.dispatch('mousemove', e);
				}
			}
		};

		this.mousedown = function (e) {
			if (!_this.touch) {
				_this.lastDownAt = time();
				_this.dispatch('mousedown', e);
			}
		};

		this.mouseup = function (e) {
			if (!_this.touch) {
				_this.dispatch('mouseup', e);
			}
		};

		this.click = function (e) {
			if (!_this.touch) {
				_this.dispatch('click', e);
			}
		};

		this.dblclick = function (e) {
			if (!_this.touch) {
				_this.dispatch('dblclick', e);
			}
		};

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

	(0, _createClass3.default)(MouseTouch, [{
		key: 'on',
		value: function on(eventType, fn) {
			if (eventType != 'mousemove' && eventType != 'mousedown' && eventType != 'mouseup' && eventType != 'click' && eventType != 'dblclick') {

				throw new Error('Unrecognized event type "' + eventType + '" passed to MouseInteractions registerer');
			}

			if (!this.dispatchers[eventType]) {
				this.dispatchers[eventType] = [];
			}

			this.dispatchers[eventType].push(fn);
		}
	}, {
		key: 'off',
		value: function off(eventType) {
			var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			if (eventType != 'mousemove' && eventType != 'mousedown' && eventType != 'mouseup' && eventType != 'click' && eventType != 'dblclick') {

				throw new Error('Unrecognized event "' + eventType + '" passed to MouseInteractions deregisterer');
			}

			if (!fn || !this.dispatchers[eventType]) {
				this.dispatchers[eventType] = [];
			} else {
				for (var i = this.dispatchers[eventType].length; i--;) {
					this.dispatchers.splice(i, 1);
				}
			}
		}
	}, {
		key: 'destroy',
		value: function destroy() {
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

	}, {
		key: 'dispatch',
		value: function dispatch(eventType, event) {
			if (!this.dispatchers[eventType]) {
				return;
			}

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = (0, _getIterator3.default)(this.dispatchers[eventType]), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var fn = _step.value;

					fn(normalizeEvent(event, this.offset));
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}]);
	return MouseTouch;
}();

/* internals */

exports.default = MouseTouch;
function time() {
	return new Date().getTime();
}

function getElementOffset(element) {

	var offset = {
		x: 0,
		y: 0
	};

	while (element.offsetParent) {
		offset.x -= element.offsetLeft - element.scrollLeft;
		offset.y -= element.offsetTop - element.scrollTop;

		element = element.offsetParent;
	}

	return offset;
}

function normalizeEvent(event, offset) {

	if (event.offsetX != null && event.offsetY != null) {
		return event;
	}

	event.offsetX = event.targetTouches ? event.targetTouches[0].pageX : event.clientX;
	event.offsetY = event.targetTouches ? event.targetTouches[0].pageY : event.clientY;

	event.offsetX -= offset.x;
	event.offsetY -= offset.y;

	return event;
}