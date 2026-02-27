import './app.css';

const root = document.getElementById('root');

// Enable our custom `theme-midnight` variant.
document.documentElement.setAttribute('data-theme', 'midnight');

const applyElement = document.createElement('div');
applyElement.id = 'apply-test';
applyElement.className = 'btn';
root.appendChild(applyElement);

const utilityElement = document.createElement('div');
utilityElement.id = 'utility-test';
utilityElement.className = 'debug-border';
root.appendChild(utilityElement);

const customVariantUtilityElement = document.createElement('div');
customVariantUtilityElement.id = 'custom-variant-utility';
customVariantUtilityElement.className = 'theme-midnight:bg-black';
root.appendChild(customVariantUtilityElement);

const customVariantCssElement = document.createElement('div');
customVariantCssElement.id = 'custom-variant-css';
customVariantCssElement.className = 'link';
root.appendChild(customVariantCssElement);

const variantElement = document.createElement('div');
variantElement.id = 'variant-test';
variantElement.className = 'card';
root.appendChild(variantElement);
