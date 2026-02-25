import './global.css';

const root = document.getElementById('root');

const element = document.createElement('div');
element.id = 'at-import-test';
element.className = 'text-brand-at-import';
element.textContent = 'at-import-theme';

root.appendChild(element);

const plainImportElement = document.createElement('div');
plainImportElement.id = 'plain-css-import-test';
plainImportElement.className = 'plain-import-text';
plainImportElement.textContent = 'plain-css-import';

root.appendChild(plainImportElement);

const themePlainElement = document.createElement('div');
themePlainElement.id = 'theme-plain-css-test';
themePlainElement.className = 'theme-plain-text';
themePlainElement.textContent = 'theme-plain-css';

root.appendChild(themePlainElement);
