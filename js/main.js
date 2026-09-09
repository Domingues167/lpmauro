/**
 * PLANO ESTRATÉGICO - JAVASCRIPT PRINCIPAL
 * - Captura e persistência inteligente de UTMs
 * - Máscara de telefone WhatsApp (padrão Brasil)
 * - Validação e segmentação condicional por faturamento
 * - Modal interativo para reprodução dos vídeos dos cases
 * - Modais de Termos de Uso e Políticas de Privacidade
 */

document.addEventListener('DOMContentLoaded', () => {
  initUtmTracking();
  initPhoneMask();
  initFormHandler();
  initCasesCarousel();
  initVideoModal();
  initLegalModals();
});

/* ==========================================================================
   1. UTM TRACKING & PERSISTENCE
   ========================================================================== */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

function initUtmTracking() {
  saveUtmsFromUrl();
  const utms = getStoredUtms();
  injectUtmsIntoForm(utms);
}

function saveUtmsFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(key => {
      const val = params.get(key);
      if (val) {
        localStorage.setItem(key, val);
        document.cookie = `${key}=${encodeURIComponent(val)};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
      }
    });
  } catch (err) {
    console.warn('Erro ao salvar UTMs:', err);
  }
}

function getStoredUtms() {
  const data = {};
  try {
    const params = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(key => {
      let val = params.get(key) || localStorage.getItem(key);
      if (!val) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]+)'));
        if (match) val = decodeURIComponent(match[1]);
      }
      if (val) data[key] = val;
    });
  } catch (err) {
    console.warn('Erro ao ler UTMs:', err);
  }
  return data;
}

function injectUtmsIntoForm(utms) {
  const form = document.getElementById('strategicLeadForm');
  if (!form) return;

  UTM_KEYS.forEach(key => {
    let input = form.querySelector(`input[name="${key}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      form.appendChild(input);
    }
    if (utms[key]) {
      input.value = utms[key];
    }
  });
}

function appendUtmsToUrl(targetUrl) {
  try {
    const utms = getStoredUtms();
    const url = new URL(targetUrl, window.location.href);
    Object.keys(utms).forEach(k => {
      url.searchParams.set(k, utms[k]);
    });
    return url.toString();
  } catch (e) {
    return targetUrl;
  }
}

/* ==========================================================================
   2. WHATSAPP PHONE MASK
   ========================================================================== */

function initPhoneMask() {
  const phoneInput = document.getElementById('whatsappInput');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      // (XX) XXXXX-XXXX
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
      // (XX) XXXX-XXXX
      value = value.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)$/, '($1');
    }

    e.target.value = value;
  });
}

/* ==========================================================================
   3. FORM SUBMISSION & WHATSAPP REDIRECT LOGIC
   ========================================================================== */

const TARGET_WHATSAPP_NUMBER = '5511966097451';

function formatWhatsAppMessage(data) {
  const name = (data.name || '').trim() || 'Cliente';
  const whatsapp = (data.whatsapp || '').trim() || 'Não informado';
  const instagram = (data.instagram || '').trim() || 'Não informado';
  const faturamento = data.faturamento || 'Não informado';
  const vendedores = data.vendedores || 'Não informado';

  return `Olá! Sou o(a) *${name}*. Preenchi o formulário no site para receber o plano de ação do *Sistema de Captação Automática ™️*.

• Instagram da agência: *${instagram}*
• Faturamento atual: *${faturamento}*
• Quantos vendedores: *${vendedores}*
• WhatsApp de contato: *${whatsapp}*

Gostaria de receber meu plano de ação para atrair viajantes compradores, vender viagens de ticket alto e escalar os resultados da minha agência!`;
}

function initFormHandler() {
  const form = document.getElementById('strategicLeadForm');
  const submitBtn = document.getElementById('submitButton');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic Validation
    const name = form.querySelector('[name="name"]')?.value.trim();
    const whatsapp = form.querySelector('[name="whatsapp"]')?.value.trim();
    const instagram = form.querySelector('[name="instagram"]')?.value.trim();
    const faturamento = form.querySelector('[name="faturamento"]')?.value;
    const vendedores = form.querySelector('[name="vendedores"]')?.value;

    if (!name || !whatsapp || !instagram || !faturamento || !vendedores) {
      alert('Por favor, preencha todos os campos para receber seu plano de ação.');
      return;
    }

    // Phone minimal length check: at least (XX) XXXXX-XXXX
    const rawPhone = whatsapp.replace(/\D/g, '');
    if (rawPhone.length < 10) {
      alert('Por favor, digite um número de WhatsApp válido com DDD.');
      return;
    }

    // Build payload
    const formData = new FormData(form);
    const leadPayload = {};
    formData.forEach((val, key) => { leadPayload[key] = val; });
    leadPayload['submitted_at'] = new Date().toISOString();

    // Build WhatsApp URL with formatted structured message
    const message = formatWhatsAppMessage(leadPayload);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${TARGET_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

    // Store lead locally for reference on thank you pages
    try {
      sessionStorage.setItem('lead_name', name);
      sessionStorage.setItem('lead_instagram', instagram);
      sessionStorage.setItem('lead_faturamento', faturamento);
      sessionStorage.setItem('whatsapp_url', whatsappUrl);
      sessionStorage.setItem('whatsapp_message', message);
    } catch(err) {}

    // Button loading state
    submitBtn.classList.add('loading');

    // Redirect to WhatsApp with pre-filled message
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 600);
  });
}

/* ==========================================================================
   4. CASES CAROUSEL (STRAIGHT LINE & AUTOPLAY)
   ========================================================================== */

let isCarouselPaused = false;

function initCasesCarousel() {
  const track = document.getElementById('casesTrack');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const dotsContainer = document.getElementById('carouselDots');
  const cards = track ? Array.from(track.querySelectorAll('.case-card')) : [];

  if (!track || cards.length === 0) return;

  // Enhance video thumbnail frame seek to prevent black frames
  const thumbVideos = track.querySelectorAll('.video-thumb-container video');
  thumbVideos.forEach(vid => {
    const setTime = () => {
      try {
        if (vid.currentTime === 0) {
          vid.currentTime = 1.5;
        }
      } catch (e) {}
    };
    vid.addEventListener('loadedmetadata', setTime);
    vid.addEventListener('canplay', setTime);
    if (vid.readyState >= 1) setTime();
  });

  // Calculate active index based on card positions relative to track
  function getActiveIndex() {
    const trackRect = track.getBoundingClientRect();
    let closestIndex = 0;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const cardRect = card.getBoundingClientRect();
      const diff = Math.abs(cardRect.left - trackRect.left);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    return closestIndex;
  }

  // Smooth scroll directly to target card index
  function scrollToCard(index) {
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;

    const targetCard = cards[index];
    if (!targetCard) return;

    const trackRect = track.getBoundingClientRect();
    const cardRect = targetCard.getBoundingClientRect();
    const targetScrollLeft = track.scrollLeft + (cardRect.left - trackRect.left);

    track.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth'
    });

    updateActiveDot(index);
  }

  function updateActiveDot(forcedIndex) {
    if (!dotsContainer) return;
    const activeIndex = forcedIndex !== undefined ? forcedIndex : getActiveIndex();
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  }

  // Render Indicator Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    cards.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Ir para o depoimento ${idx + 1}`);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pauseAutoplay();
        scrollToCard(idx);
      });
      dotsContainer.appendChild(dot);
    });
  }

  track.addEventListener('scroll', () => {
    window.requestAnimationFrame(() => updateActiveDot());
  }, { passive: true });

  // Navigation Arrows (Next & Prev)
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      pauseAutoplay();
      const current = getActiveIndex();
      const prev = current > 0 ? current - 1 : cards.length - 1;
      scrollToCard(prev);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      pauseAutoplay();
      const current = getActiveIndex();
      const next = current < cards.length - 1 ? current + 1 : 0;
      scrollToCard(next);
    });
  }

  // Mouse Drag to Scroll with Safe Click Distinction
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let hasDragged = false;
  let dragDistance = 0;

  track.addEventListener('mousedown', (e) => {
    if (e.target.closest('.carousel-nav-btn')) return;
    isDown = true;
    hasDragged = false;
    dragDistance = 0;
    startX = e.pageX;
    scrollStart = track.scrollLeft;
    track.classList.add('grabbing');
    pauseAutoplay();
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      track.classList.remove('grabbing');
      if (dragDistance > 20) {
        hasDragged = true;
        setTimeout(() => {
          scrollToCard(getActiveIndex());
        }, 40);
      }
      setTimeout(() => {
        hasDragged = false;
        dragDistance = 0;
      }, 150);
    }
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const diff = e.pageX - startX;
    dragDistance = Math.abs(diff);
    if (dragDistance > 8) {
      e.preventDefault();
      track.scrollLeft = scrollStart - diff;
    }
  });

  // Prevent card click only if user actually performed a significant drag
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (hasDragged || dragDistance > 15) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
    }, true);
  });

  // Autoplay loop (slides cards forward automatically)
  let autoplayInterval = null;
  function startAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      if (isCarouselPaused) return;
      const current = getActiveIndex();
      const next = current < cards.length - 1 ? current + 1 : 0;
      scrollToCard(next);
    }, 3800);
  }

  function pauseAutoplay() {
    isCarouselPaused = true;
  }

  function resumeAutoplay() {
    const modal = document.getElementById('videoModal');
    if (!modal || !modal.classList.contains('active')) {
      isCarouselPaused = false;
    }
  }

  track.addEventListener('mouseenter', pauseAutoplay);
  track.addEventListener('mouseleave', resumeAutoplay);
  track.addEventListener('touchstart', pauseAutoplay, { passive: true });
  track.addEventListener('touchend', resumeAutoplay, { passive: true });

  if (prevBtn) {
    prevBtn.addEventListener('mouseenter', pauseAutoplay);
    prevBtn.addEventListener('mouseleave', resumeAutoplay);
  }
  if (nextBtn) {
    nextBtn.addEventListener('mouseenter', pauseAutoplay);
    nextBtn.addEventListener('mouseleave', resumeAutoplay);
  }

  // Smooth scroll for bottom CTA button ("QUERO RECEBER MEU PLANO") and any #forms anchor
  document.querySelectorAll('a[href="#forms"], .btn-cases-cta').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const formSection = document.getElementById('forms');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const nameInput = document.getElementById('nameInput');
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 650);
        }
      }
    });
  });

  startAutoplay();
}

/* ==========================================================================
   5. VIDEO TESTIMONIAL MODAL (HTML5 & PANDA SUPPORT)
   ========================================================================== */

function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const modalVideoIframe = document.getElementById('modalVideoIframe');
  const modalTitle = document.getElementById('modalVideoTitle');
  const closeBtn = document.getElementById('modalCloseBtn');
  const caseCards = document.querySelectorAll('.case-card[data-video-src], .case-card[data-video]');

  if (!modal) return;

  function openVideo(src, title) {
    isCarouselPaused = true; // Pause carousel while video is playing

    if (modalTitle) {
      modalTitle.textContent = title || 'Depoimento de Sucesso';
    }

    // Check if it's an external embed iframe (YouTube, Vimeo, Panda) or a direct video file (.mp4, .mov)
    const isEmbedIframe = src.includes('pandavideo') || src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com');

    if (isEmbedIframe) {
      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
        modalVideoPlayer.style.display = 'none';
        modalVideoPlayer.src = '';
      }
      if (modalVideoIframe) {
        modalVideoIframe.style.display = 'block';
        modalVideoIframe.src = src.includes('autoplay') ? src : `${src}&autoplay=true`;
      }
    } else {
      // Direct video (.mp4 or .mov from local disk or CDN)
      if (modalVideoIframe) {
        modalVideoIframe.style.display = 'none';
        modalVideoIframe.src = '';
      }
      if (modalVideoPlayer) {
        modalVideoPlayer.style.display = 'block';
        modalVideoPlayer.src = src;
        modalVideoPlayer.play().catch(() => {});
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    modal.classList.remove('active');
    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
      modalVideoPlayer.src = '';
    }
    if (modalVideoIframe) {
      modalVideoIframe.src = '';
    }
    document.body.style.overflow = '';
    isCarouselPaused = false; // Resume carousel
  }

  caseCards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-video-src') || card.getAttribute('data-video');
      const title = card.getAttribute('data-video-title') || card.querySelector('.case-company')?.textContent || 'Depoimento';
      if (src) {
        openVideo(src, title);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeVideo);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeVideo();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeVideo();
    }
  });
}

/* ==========================================================================
   5. LEGAL MODALS (TERMOS & POLÍTICAS)
   ========================================================================== */

function initLegalModals() {
  const legalModal = document.getElementById('legalModal');
  const legalTitle = document.getElementById('legalTitle');
  const legalBody = document.getElementById('legalBody');
  const legalCloseBtn = document.getElementById('legalCloseBtn');

  if (!legalModal) return;

  const legalContents = {
    terms: {
      title: 'Termos de Uso',
      content: `
        <p>Ao utilizar este site e solicitar o Plano Estratégico, você concorda expressamente com os termos estabelecidos a seguir:</p>
        <p>1. <strong>Finalidade do Serviço:</strong> O material, diagnóstico e plano estratégico fornecidos destinam-se exclusivamente a fins consultivos para estruturação comercial e escala de vendas de agências de viagens e consultorias de turismo.</p>
        <p>2. <strong>Propriedade Intelectual:</strong> Todos os métodos, frameworks e conteúdos apresentados nesta página e nos planos são protegidos pelas leis de propriedade intelectual.</p>
        <p>3. <strong>Exatidão das Informações:</strong> O usuário compromete-se a fornecer dados verídicos no preenchimento do formulário para viabilizar um diagnóstico condizente com a realidade do seu negócio.</p>
      `
    },
    privacy: {
      title: 'Políticas de Privacidade e LGPD',
      content: `
        <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), declaramos nosso compromisso com a transparência e a segurança das suas informações:</p>
        <p>1. <strong>Coleta de Dados:</strong> Coletamos apenas as informações fornecidas voluntariamente no formulário (nome, e-mail, telefone/WhatsApp, nome da empresa e métricas de faturamento).</p>
        <p>2. <strong>Uso das Informações:</strong> Seus dados são utilizados exclusivamente para entrar em contato referente ao plano estratégico solicitado e apresentar propostas comerciais personalizadas.</p>
        <p>3. <strong>Segurança:</strong> Adotamos padrões rigorosos de criptografia e proteção para impedir acessos não autorizados. Jamais comercializamos seus dados com terceiros.</p>
      `
    }
  };

  function openLegal(type) {
    const data = legalContents[type];
    if (!data) return;

    legalTitle.textContent = data.title;
    legalBody.innerHTML = data.content;
    legalModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLegal() {
    legalModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-legal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openLegal(btn.getAttribute('data-legal'));
    });
  });

  if (legalCloseBtn) {
    legalCloseBtn.addEventListener('click', closeLegal);
  }

  legalModal.addEventListener('click', (e) => {
    if (e.target === legalModal) closeLegal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal.classList.contains('active')) {
      closeLegal();
    }
  });
}
