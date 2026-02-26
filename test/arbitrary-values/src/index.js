const root = document.getElementById('root');

// Arbitrary color value with a type hint, e.g. bg-[color:var(--mystery-var)].
const bgElement = document.createElement('div');
bgElement.id = 'bg-arbitrary-test';
bgElement.textContent = 'bg-arbitrary';
bgElement.style.setProperty('--arbitrary-bg-color', '#010203');
bgElement.className = 'bg-[color:var(--arbitrary-bg-color)]';
root.appendChild(bgElement);

// Arbitrary spacing value using --spacing() inside calc(),
// mirroring docs examples like py-[calc(--spacing(4)-1px)].
const spacingElement = document.createElement('div');
spacingElement.id = 'spacing-arbitrary-test';
spacingElement.textContent = 'spacing-arbitrary';
spacingElement.className = 'py-[calc(--spacing(4)-1px)]';
root.appendChild(spacingElement);
