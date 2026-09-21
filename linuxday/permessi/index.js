const splash = document.getElementById('splash');
const desktop = document.getElementById('desktop');

window.addEventListener('DOMContentLoaded', () => {
  const giaVisto = sessionStorage.getItem('splashShown');

  const nascondiSplash = () => {
    splash.style.opacity = '0';
    splash.style.pointerEvents = 'none';
    desktop.classList.add('active');
    sessionStorage.setItem('splashShown', '1');
  };

  if (giaVisto) {
    // Non è la prima volta in questa sessione: nascondi subito.
    // Se la pagina ha impiegato tempo a caricare, lo splash è comunque
    // rimasto visibile fino a questo momento, quindi copre automaticamente
    // eventuali rallentamenti senza bisogno di logica aggiuntiva.
    nascondiSplash();
  } else {
    // Prima volta in assoluto: mostra lo splash per la durata prevista.
    setTimeout(nascondiSplash, 1800);
  }
});

const folders = document.querySelectorAll('.folder');
folders.forEach((folder) => {
  folder.addEventListener('mouseenter', () => {
    folder.style.transform = 'translateY(-10px)';
  });
  folder.addEventListener('mouseleave', () => {
    folder.style.transform = 'translateY(0)';
  });
});