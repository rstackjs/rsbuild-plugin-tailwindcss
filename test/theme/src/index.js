import 'tailwindcss/utilities.css';

const root = document.getElementById('root');
const element = document.createElement('div');
element.id = 'test';
element.className = 'text-brand';
element.textContent = 'theme';
root.appendChild(element);
