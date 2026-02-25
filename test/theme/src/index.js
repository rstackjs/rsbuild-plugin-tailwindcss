const root = document.getElementById('root');

// Element styled using JS config theme (tailwind.config.js).
const configElement = document.createElement('div');
configElement.id = 'test';
configElement.className = 'text-brand';
configElement.textContent = 'theme-config';
root.appendChild(configElement);

// Element styled using a custom @theme CSS file.
const themeElement = document.createElement('div');
themeElement.id = 'theme-test';
themeElement.className = 'text-brand-theme';
themeElement.textContent = 'theme-css';
root.appendChild(themeElement);
