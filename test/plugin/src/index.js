import 'tailwindcss/utilities.css';

const root = document.getElementById('root');
const element = document.createElement('div');
element.id = 'test';
element.className = 'from-plugin';
element.textContent = 'plugin';
root.appendChild(element);
