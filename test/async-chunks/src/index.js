import './index.css';

const el = document.createElement('div');
el.className = 'flex bg-red-500';
document.body.appendChild(el);

import('./async').then(({ default: asyncFn }) => {
  asyncFn();
});
