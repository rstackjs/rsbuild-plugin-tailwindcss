import './index.css';

// 1. Important modifier
const importantDiv = document.createElement('div');
importantDiv.id = 'important';
importantDiv.className = 'flex!';
importantDiv.textContent = 'Important Flex';
document.body.appendChild(importantDiv);

// 2. 3D Transforms
const transformDiv = document.createElement('div');
transformDiv.id = 'transform';
transformDiv.className = 'perspective-[500px] rotate-x-12';
transformDiv.textContent = '3D Transform';
document.body.appendChild(transformDiv);

// 3. Container Queries
const container = document.createElement('div');
container.className = '@container/main w-[300px]';
const item = document.createElement('div');
item.id = 'container-item';
item.className = '@[200px]:text-red-500';
item.textContent = 'Container Item';
container.appendChild(item);
document.body.appendChild(container);
