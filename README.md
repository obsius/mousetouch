# Mousetouch

Mousetouch is a small, lightweight library to provide consistent mouse and touch interactions. It only support touch interactions that can be done with the mouse also.


## Integrating
Mousetouch has defined defaults and can be used by constructing it.

### Reference
```js
import Mousetouch from 'mousetouch';
const Mousetouch = require('mousetouch');

const mousetouch = new Mousetouch('<dom element to listen to>', {
	clickThreshold: '<default 200 ms>',
	dblClickThreshold: '<default 500ms>',
	moveThreshold: '<default 2px>'
});

mousetouch.on('mousemove', (e) => {});
mousetouch.on('mousedown', (e) => {});
mousetouch.on('mouseup', (e) => {});
mousetouch.on('click', (e) => {});
mousetouch.on('dblclick', (e) => {});
```


## Contributing
Feel free to make changes and submit pull requests whenever.


## License
Mousetouch uses the [MIT](https://opensource.org/licenses/MIT) license.