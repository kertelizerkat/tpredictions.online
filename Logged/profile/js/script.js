const btn00 = document.getElementById('menu-btn');
    const closeBtn00 = document.getElementById('close-btn');
    const menu00 = document.getElementById('side-menu');
    const overlay00 = document.getElementById('overlay');
    const bar100 = document.getElementById('bar1');
    const bar200 = document.getElementById('bar2');
    const bar300 = document.getElementById('bar3');

    const openMenu00 = () => {
      menu00.classList.remove('translate-x-full');
      menu00.classList.add('translate-x-0');
      overlay00.classList.remove('opacity-0', 'pointer-events-none');
      bar100.classList.add('opacity-0');
      bar200.classList.add('opacity-0');
      bar300.classList.add('opacity-0');
    };

    const closeMenu00 = () => {
      menu00.classList.add('translate-x-full');
      menu00.classList.remove('translate-x-0');
      overlay00.classList.add('opacity-0', 'pointer-events-none');
     bar100.classList.remove('opacity-0');
      bar200.classList.remove('opacity-0');
      bar300.classList.remove('opacity-0');
    };

    btn00.addEventListener('click', openMenu00);
    overlay00.addEventListener('click', closeMenu00);
    closeBtn00.addEventListener('click', closeMenu00);
