const CLICK_THRESHOLD = 100;
const DBLCLICK_THRESHOLD = 400;
const MOVE_THRESHOLD = 4;

export default class MouseTouch {

	dispatchers = {};

	lastDownAt = Date.now();

	bufferPoint = new Point();
	lastPoint = new Point();

	constructor(element, options = {}) {

		this.element = element;

		this.clickThreshold = options.clickThreshold || CLICK_THRESHOLD;
		this.dblClickThreshold = options.dblClickThreshold || DBLCLICK_THRESHOLD;
		this.moveThresholdSq = (options.moveThreshold || MOVE_THRESHOLD) ** 2;

		this.offset = getElementOffset(element);

		window.addEventListener('touchend', this.touchend, false);
		window.addEventListener('touchcancel', this.touchcancel, false);
		window.addEventListener('mouseup', this.mouseup, false);

		element.addEventListener('touchmove', this.touchmove, false);
		element.addEventListener('touchstart', this.touchstart, false);
		element.addEventListener('mousemove', this.mousemove, false);
		element.addEventListener('mousedown', this.mousedown, false);
		element.addEventListener('click', this.click, false);
		element.addEventListener('auxclick', this.click, false);
		element.addEventListener('dblclick', this.dblclick, false);
	}

	destroy() {

		window.removeEventListener('touchend', this.touchend);
		window.removeEventListener('touchcancel', this.touchcancel);
		window.removeEventListener('mouseup', this.mouseup);

		this.element.removeEventListener('touchmove', this.touchmove);
		this.element.removeEventListener('touchstart', this.touchstart);
		this.element.removeEventListener('mousemove', this.mousemove);
		this.element.removeEventListener('mousedown', this.mousedown);
		this.element.removeEventListener('click', this.click);
		this.element.removeEventListener('auxclick', this.click);
		this.element.removeEventListener('dblclick', this.dblclick);

		this.element = null;
		this.dispatchers = null;
	}

	update() {
		this.offset = getElementOffset(this.element);
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

	/* private */

	computePoint(e) {
		this.bufferPoint.set(e.offsetX, e.offsetY);
	}

	dispatch(eventType, event) {

		if (!event || !this.dispatchers[eventType]) { return; }

		for (let fn of this.dispatchers[eventType]) {
			fn(wrapEvent(event, this.offset));
		}
	}

	touchmove = (e) => {
		if (Date.now() - this.lastDownAt > this.clickThreshold) {
			this.dispatch('mousemove', e);
		}
	};

	touchstart = (e) => {

		this.touch = true;

		this.lastDownAt = Date.now();
		this.srcEvent = e;

		this.dispatch('mousedown', e);
	};

	touchend = (e) => {

		// prevent mouseclick from firing
		if (this.touch) {
			this.touch = false;
			e.preventDefault();
		}

		this.dispatch('mouseup', this.srcEvent);

		if (Date.now() - this.lastDownAt < this.clickThreshold) {

			this.dispatch('click', this.srcEvent);

			if (this.lastClickAt && (Date.now() - this.lastClickAt) < this.dblClickThreshold) {
				this.lastClickAt = null;
				this.dispatch('dblclick', this.srcEvent);
			} else {
				this.lastClickAt = Date.now();
			}
		}
	};

	touchcancel = (e) => {
		this.touch = false;
	};

	mousemove = (e) => {
		if (Date.now() - this.lastDownAt > this.clickThreshold) {
			this.dispatch('mousemove', e);
		}
	};

	mousedown = (e) => {

		this.computePoint(e);

		this.lastDownAt = Date.now();
		this.lastPoint.copy(this.bufferPoint);

		this.dispatch('mousedown', e);
	};

	mouseup = (e) => {
		this.dispatch('mouseup', e);
	};

	click = (e) => {

		this.computePoint(e);

		if (this.lastPoint.distanceSq(this.bufferPoint) < this.moveThresholdSq) {
			this.dispatch('click', e);
		}
	};

	dblclick = (e) => {

		this.computePoint(e);

		if (this.lastPoint.distanceSq(this.bufferPoint) < this.moveThresholdSq) {
			this.dispatch('dblclick', e);
		}
	};
}

/* internals */

class Point {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	copy(point) {
		this.x = point.x;
		this.y = point.y;
	}

	distanceSq(point) {
		return (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
	}

	set(x, y) {
		this.x = x;
		this.y = y;
	}
}

function validEventType(eventType) {
	return (
		eventType == 'mousemove' ||
		eventType == 'mousedown' ||
		eventType == 'mouseup' ||
		eventType == 'click' ||
		eventType == 'dblclick'
	);
}

// TODO: adjust for scaling and rotation
function getElementOffset(element) {

	let offset = new Point();

	while (element.offsetParent) {
		offset.x += element.offsetLeft - element.scrollLeft;
		offset.y += element.offsetTop - element.scrollTop;
	
		element = element.offsetParent;
	}

	return offset;
}

function wrapEvent(event, offset) {

	// touch events do not have buttons
	if (event.button == null) {
		event.button = 0;
	}

	let x;
	let y;

	if (event.offsetX != null && event.offsetY != null) {
		x = event.offsetX;
		y = event.offsetY;
	} else {
		x = (event.targetTouches ? event.targetTouches[0].pageX : event.clientX) - offset.x;
		y = (event.targetTouches ? event.targetTouches[0].pageY : event.clientY) - offset.y;
	}

	return { x, y, event };
}