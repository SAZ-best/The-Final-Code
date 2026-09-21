// Scroll reveal initialization
const revealElements = document.querySelectorAll('[data-reveal]');

function revealOnScroll() {
  const windowHeight = window.innerHeight;
  revealElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < windowHeight - 80) {
      el.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('resize', revealOnScroll);
window.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
  document.body.classList.add('loaded');
});

// Subtle typewriter subheader in home
const hero = document.querySelector('.hero-content');
if (hero) {
  const subHeader = document.createElement('p');
  subHeader.className = 'typewriter-sub';
  subHeader.style.fontFamily = 'var(--font-family-mono)';
  subHeader.style.fontSize = 'var(--text-sm)';
  subHeader.style.color = 'var(--primary-light)';
  subHeader.style.marginTop = '10px';
  subHeader.style.borderRight = '2px solid var(--primary-light)';
  subHeader.style.width = 'fit-content';
  subHeader.style.whiteSpace = 'nowrap';
  subHeader.style.overflow = 'hidden';
  subHeader.style.paddingRight = '4px';
  
  hero.appendChild(subHeader);
  
  const text = 'Didattica di base su Linux e gestione permessi.';
  let index = 0;
  
  function type() {
    if (index < text.length) {
      subHeader.textContent += text.charAt(index);
      index++;
      setTimeout(type, 60);
    } else {
      subHeader.style.borderRight = 'none'; // remove cursor when done
    }
  }
  
  // Start typewriter after a short delay
  setTimeout(type, 800);
}
