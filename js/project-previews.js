// Shared behavior for the three project showcase cards.
  let activeProjectModal = null;
  let projectModalReturnFocus = null;
  let projectModalBodyOverflow = '';
  let projectModalCloseTimer = null;
  let projectModalSequence = 0;

  function openProjectModal(id, trigger) {
   const modal = document.getElementById(id);
   if (!modal) return;
   const sequence = ++projectModalSequence;
   clearTimeout(projectModalCloseTimer);
   if (!activeProjectModal) {
    projectModalBodyOverflow = document.body.style.overflow;
   } else if (activeProjectModal !== modal) {
    activeProjectModal.classList.remove('is-open');
    activeProjectModal.hidden = true;
    activeProjectModal.setAttribute('aria-hidden', 'true');
   }
   projectModalReturnFocus = trigger || document.activeElement;
   activeProjectModal = modal;
   modal.hidden = false;
   modal.setAttribute('aria-hidden', 'false');
   modal.querySelector('.project-modal-body').scrollTop = 0;
   document.body.style.overflow = 'hidden';
   modal.querySelector('.project-modal-exit').focus({ preventScroll: true });
   requestAnimationFrame(() => {
    requestAnimationFrame(() => {
     if (sequence === projectModalSequence && activeProjectModal === modal) {
      modal.classList.add('is-open');
     }
    });
   });
  }

  function closeProjectModal(id) {
   const modal = activeProjectModal;
   if (!modal || (id && modal.id !== id)) return;
   ++projectModalSequence;
   clearTimeout(projectModalCloseTimer);
   modal.classList.remove('is-open');
   const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260;
   projectModalCloseTimer = setTimeout(() => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    activeProjectModal = null;
    document.body.style.overflow = projectModalBodyOverflow;
    if (projectModalReturnFocus && projectModalReturnFocus.isConnected) {
     projectModalReturnFocus.focus({ preventScroll: true });
    }
   }, delay);
  }

  function openKapeModal(trigger) { openProjectModal('kape-modal', trigger); }
  function openByteModal(trigger) { openProjectModal('byte-modal', trigger); }
  function openPrimeModal(trigger) { openProjectModal('prime-modal', trigger); }
  function closeKapeModal() { closeProjectModal('kape-modal'); }
  function closeByteModal() { closeProjectModal('byte-modal'); }
  function closePrimeModal() { closeProjectModal('prime-modal'); }

  document.querySelectorAll('.project-modal').forEach(modal => {
   modal.addEventListener('click', event => {
    if (event.target === modal || event.target.classList.contains('project-modal-backdrop') || event.target.closest('[data-project-close]')) {
     closeProjectModal(modal.id);
    }
   });
  });

  document.querySelectorAll('.project-preview-trigger').forEach(trigger => {
   trigger.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
     event.preventDefault();
     trigger.click();
    }
   });
  });

  document.addEventListener('keydown', event => {
   if (!activeProjectModal) return;
   if (event.key === 'Escape') {
    event.preventDefault();
    closeProjectModal(activeProjectModal.id);
   } else if (event.key === 'Tab') {
    const controls = activeProjectModal.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || !activeProjectModal.contains(document.activeElement))) {
     event.preventDefault();
     last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !activeProjectModal.contains(document.activeElement))) {
     event.preventDefault();
     first.focus();
    }
   }
  });
