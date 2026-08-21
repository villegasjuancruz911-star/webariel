/**
 * main.js
 * Frontend vanilla JS - Landing Page Pintura Industrial
 */

(function () {
  'use strict';

  // ======================
  // Navbar: menú móvil + scroll
  // ======================
  const header = document.getElementById('header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Cerrar menú al hacer clic en un enlace
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Efecto de scroll en header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // ======================
  // Filtros de proyectos
  // ======================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const proyectoCards = document.querySelectorAll('.proyecto-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Actualizar estado visual de botones
      filterBtns.forEach((b) => {
        b.classList.remove('active', 'bg-primary-600', 'text-white');
        b.classList.add('bg-slate-100', 'text-slate-700');
      });
      btn.classList.add('active', 'bg-primary-600', 'text-white');
      btn.classList.remove('bg-slate-100', 'text-slate-700');

      // Filtrar tarjetas
      proyectoCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = '';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ======================
  // Formulario de cotización
  // ======================
  const form = document.getElementById('form-cotizacion');
  const btnSubmit = document.getElementById('btn-submit');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const feedback = document.getElementById('form-feedback');

  function showFeedback(message, type) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove('hidden', 'success', 'error');
    feedback.classList.add(type);
  }

  function setLoading(isLoading) {
    if (!btnSubmit || !btnText || !btnSpinner) return;
    btnSubmit.disabled = isLoading;
    if (isLoading) {
      btnText.textContent = 'Enviando...';
      btnSpinner.classList.remove('hidden');
    } else {
      btnText.textContent = 'Enviar Solicitud de Cotización';
      btnSpinner.classList.add('hidden');
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Ocultar feedback anterior
      feedback?.classList.add('hidden');

      const formData = new FormData(form);
      const payload = {
        empresa: formData.get('empresa')?.toString().trim(),
        cuit: formData.get('cuit')?.toString().trim(),
        nombre_contacto: formData.get('nombre_contacto')?.toString().trim(),
        telefono: formData.get('telefono')?.toString().trim(),
        tipo_obra: formData.get('tipo_obra')?.toString().trim(),
        ubicacion: formData.get('ubicacion')?.toString().trim(),
        metros_cuadrados: formData.get('metros_cuadrados')?.toString().trim() || null,
        mensaje: formData.get('mensaje')?.toString().trim() || null,
      };

      // Validación mínima en cliente
      if (!payload.empresa || !payload.cuit || !payload.nombre_contacto ||
          !payload.telefono || !payload.tipo_obra || !payload.ubicacion) {
        showFeedback('Por favor complete todos los campos obligatorios marcados con *.', 'error');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('/api/cotizaciones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Error al enviar la solicitud.');
        }

        showFeedback(
          data.message || 'Solicitud recibida correctamente. Nos contactaremos a la brevedad.',
          'success'
        );
        form.reset();
      } catch (err) {
        console.error('Error al enviar cotización:', err);
        showFeedback(
          err.message || 'No se pudo enviar la solicitud. Verifique su conexión e intente nuevamente.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    });
  }

  // ======================
  // Smooth scroll para enlaces internos (fallback)
  // ======================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
