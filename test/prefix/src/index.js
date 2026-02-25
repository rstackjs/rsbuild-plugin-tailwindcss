import 'tailwindcss/utilities.css';

const root = document.getElementById('root');
const element = document.createElement('div');
element.id = 'test';
element.className = 'tw-flex';
element.textContent = 'prefix';
root.appendChild(element);
