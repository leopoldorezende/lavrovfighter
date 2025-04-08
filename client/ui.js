// ui.js - Manipulação da interface do usuário

// Inicializa os handlers para elementos da UI
function initUIHandlers() {

  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const buttonTools = document.getElementById('button-tools');
  const sidetools = document.getElementById('sidetools');
  
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidetools.classList.remove('active');

  });
  buttonTools.addEventListener('click', () => {
    sidetools.classList.toggle('active');
    sidebar.classList.remove('active');
  });
  

  document.addEventListener('click', (e) => {
    if (window.innerWidth > 1200) return; // Aplica somente em mobile

    const clickedInSidebar = sidebar.contains(e.target);
    const clickedInSidetools = sidetools.contains(e.target);
    const clickedInHamburger = hamburger.contains(e.target);
    const clickedInToolsBtn = buttonTools.contains(e.target);

    // Se o clique ocorrer fora de todos os elementos, fecha ambos
    if (!clickedInSidebar && !clickedInSidetools && !clickedInHamburger && !clickedInToolsBtn) {
      sidebar.classList.remove('active');
      sidetools.classList.remove('active');
    }
  }, true);  // Usando o modo de captura

  
  // Manipulador para abas da sidebar
  const sidebarTabs = sidebar.querySelectorAll('.tab');
  const sidebarContents = sidebar.querySelectorAll('.tab-content');
  
  sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      sidebarTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      sidebarContents.forEach(c => {
        c.classList.remove('active');
        if(c.id === target) c.classList.add('active');
      });
    });
  });

  // Manipulador para abas do sidetools
  const sidetoolsTabs = sidetools.querySelectorAll('.tab');
  const sidetoolsContents = sidetools.querySelectorAll('.tab-content');
  
  sidetoolsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      sidetoolsTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      sidetoolsContents.forEach(c => {
        c.classList.remove('active');
        if(c.id === target) c.classList.add('active');
      });
    });
  });
  
  // Reseta a sidebar quando a tela for maior que 1200px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1200) {
      sidebar.classList.remove('active');
    }
  });
}

// Alterna a visibilidade entre as diferentes telas
function showScreen(screenId) {
  const screens = ['login-screen', 'room-selection-screen', 'game-screen'];
  
  screens.forEach(screen => {
    document.getElementById(screen).style.display = 
      screen === screenId ? 'block' : 'none';
  });
}

export { initUIHandlers, showScreen };