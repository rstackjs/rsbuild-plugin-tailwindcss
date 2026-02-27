import styles from './App.module.css';

const div = document.createElement('div');
div.id = 'test-div';
div.className = styles.myButton;
div.textContent = 'Test Button';
document.body.appendChild(div);
