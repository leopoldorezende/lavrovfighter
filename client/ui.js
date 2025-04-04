// ui.js - Manipulação da interface do usuário

// Inicializa os handlers para elementos da UI
function initUIHandlers() {
    // Trata o menu hamburguer e a barra lateral
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const buttonTools = document.getElementById('button-tools');
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
  
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
    buttonTools.addEventListener('click', () => {
      sidetools.classList.toggle('active');
    });
    
    document.addEventListener('click', (event) => {
      if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
        sidebar.classList.remove('active');
      }
      if (!sidetools.contains(event.target) && !buttonTools.contains(event.target)) {
        sidetools.classList.remove('active');
      }
    });
  
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
  
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
  
        contents.forEach(c => {
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