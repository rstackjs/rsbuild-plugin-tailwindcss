// import url from './index.css?url';
const url = new URL('./index.css', import.meta.url).href;
import raw from './index.css?raw';

window.cssUrl = url;
window.cssRaw = raw;

// We also need to inject it to make sure it doesn't break normal behavior
import './index.css';
