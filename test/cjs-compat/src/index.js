import lib from './lib.cjs';

const div = document.createElement('div');
div.id = 'cjs-output';
div.textContent = lib.message;
document.body.appendChild(div);
