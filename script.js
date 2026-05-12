// ============================================
//  AGUACHIAPAS — script.js (Chrome Fluid BG)
// ============================================

// ── FLUID CHROME ORGANIC BACKGROUND ──────────
(function initFluid() {
  const canvas = document.createElement('canvas');
  canvas.id = 'y2k-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Each blob is an organic closed shape made of bezier curves
  // They drift slowly, morph, and catch chrome-like specular light
  const NUM = 7;

  function makeBlob() {
    const pts = 5 + Math.floor(Math.random() * 3); // 5–7 control points
    const angles = Array.from({ length: pts }, (_, i) => (i / pts) * Math.PI * 2);
    return {
      cx:   Math.random() * W,
      cy:   Math.random() * H,
      vx:  (Math.random() - 0.5) * 0.18,
      vy:  (Math.random() - 0.5) * 0.18,
      baseR: 110 + Math.random() * 160,
      pts,
      angles,
      // Per-point wobble params
      rPhase:  angles.map(() => Math.random() * Math.PI * 2),
      rSpeed:  angles.map(() => 0.003 + Math.random() * 0.004),
      rAmp:    angles.map(() => 20 + Math.random() * 45),
      // Global breathe
      breathe: Math.random() * Math.PI * 2,
      breatheS: 0.004 + Math.random() * 0.003,
      // Chrome specular position (offset from center)
      specX: -0.25 + Math.random() * 0.1,
      specY: -0.30 + Math.random() * 0.1,
    };
  }

  let blobs = Array.from({ length: NUM }, makeBlob);
  let t = 0;

  function blobPath(b) {
    const bR = b.baseR * (1 + Math.sin(b.breathe) * 0.06);
    const pts = b.angles.map((a, i) => {
      const r = bR + Math.sin(t * b.rSpeed[i] + b.rPhase[i]) * b.rAmp[i];
      return {
        x: b.cx + Math.cos(a) * r,
        y: b.cy + Math.sin(a) * r,
      };
    });

    ctx.beginPath();
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      // Catmull-Rom → cubic bezier
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      if (i === 0) ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.closePath();
    return bR; // return effective radius
  }

  function drawBlob(b) {
    ctx.save();
    const r = blobPath(b);

    // ── Body: very dark with subtle blue-grey tint ──
    const body = ctx.createRadialGradient(
      b.cx + b.specX * r, b.cy + b.specY * r, r * 0.05,
      b.cx, b.cy, r * 1.4
    );
    body.addColorStop(0,   'rgba(28, 34, 44, 0.82)');
    body.addColorStop(0.45,'rgba(14, 18, 26, 0.75)');
    body.addColorStop(1,   'rgba(4,  6, 10, 0.0)');
    ctx.fillStyle = body;
    ctx.fill();

    // ── Chrome rim: bright thin highlight around edge ──
    ctx.save();
    ctx.clip(); // clip to blob shape
    const rim = ctx.createRadialGradient(
      b.cx + b.specX * r * 0.6, b.cy + b.specY * r * 0.6, r * 0.55,
      b.cx, b.cy, r * 1.05
    );
    rim.addColorStop(0,   'rgba(200,210,225, 0)');
    rim.addColorStop(0.78,'rgba(180,195,215, 0)');
    rim.addColorStop(0.88,'rgba(210,220,235, 0.18)');
    rim.addColorStop(0.94,'rgba(235,242,250, 0.55)');
    rim.addColorStop(1,   'rgba(255,255,255, 0.0)');
    ctx.fillStyle = rim;
    ctx.fill();
    ctx.restore();

    // ── Primary specular: bright teardrop highlight ──
    ctx.save();
    blobPath(b);
    ctx.clip();
    const sx = b.cx + b.specX * r;
    const sy = b.cy + b.specY * r;
    const spec = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.42);
    spec.addColorStop(0,   'rgba(255,255,255, 0.62)');
    spec.addColorStop(0.25,'rgba(230,238,248, 0.30)');
    spec.addColorStop(0.6, 'rgba(180,200,225, 0.08)');
    spec.addColorStop(1,   'rgba(140,170,210, 0)');
    ctx.fillStyle = spec;
    ctx.fillRect(b.cx - r * 2, b.cy - r * 2, r * 4, r * 4);
    ctx.restore();

    // ── Secondary specular: soft opposing glow ──
    ctx.save();
    blobPath(b);
    ctx.clip();
    const sx2 = b.cx - b.specX * r * 0.5;
    const sy2 = b.cy - b.specY * r * 0.5 + r * 0.55;
    const spec2 = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, r * 0.55);
    spec2.addColorStop(0,   'rgba(140,165,200, 0.22)');
    spec2.addColorStop(0.5, 'rgba(100,130,175, 0.08)');
    spec2.addColorStop(1,   'rgba(80,110,160,  0)');
    ctx.fillStyle = spec2;
    ctx.fillRect(b.cx - r * 2, b.cy - r * 2, r * 4, r * 4);
    ctx.restore();

    ctx.restore();
  }

  function loop() {
    t += 0.55;

    // Pure black base
    ctx.fillStyle = '#04060a';
    ctx.fillRect(0, 0, W, H);

    // Very subtle ambient — just a whisper of deep navy
    const amb = ctx.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .5, H * .85);
    amb.addColorStop(0,   'rgba(8,14,28, 0.55)');
    amb.addColorStop(0.6, 'rgba(4, 8,18, 0.25)');
    amb.addColorStop(1,   'rgba(2, 4, 8, 0)');
    ctx.fillStyle = amb;
    ctx.fillRect(0, 0, W, H);

    // Draw blobs with multiply-like layering
    ctx.globalCompositeOperation = 'source-over';
    blobs.forEach(b => {
      b.breathe += b.breatheS;
      b.cx += b.vx;
      b.cy += b.vy;
      // Soft boundary — wrap gently
      const pad = b.baseR * 0.5;
      if (b.cx < -pad) b.cx = W + pad;
      if (b.cx > W + pad) b.cx = -pad;
      if (b.cy < -pad) b.cy = H + pad;
      if (b.cy > H + pad) b.cy = -pad;
      drawBlob(b);
    });

    requestAnimationFrame(loop);
  }

  loop();
})();


// ── CURSOR PERSONALIZADO ──────────────────────
const cursor = document.createElement('div');
cursor.id = 'custom-cursor';
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.id = 'cursor-inner';
document.body.appendChild(cursorDot);

let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursor.style.left = ringX + 'px';
  cursor.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

document.querySelectorAll('a, button, .info-card, .stat-card, .impact-card, .gallery-item')
  .forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });


// ── ANIMACIONES AL HACER SCROLL ──────────────
const revealElements = document.querySelectorAll('.reveal');

function revealOnScroll() {
  revealElements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 80) el.classList.add('active');
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load',   revealOnScroll);


// ── IMPACT BAR ANIMATIONS ─────────────────────
const bars = document.querySelectorAll('.impact-bar-fill');
if (bars.length) {
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => barObserver.observe(b));
}


// ── COMENTARIOS CON IA ────────────────────────
const commentsList = document.getElementById('comments-list');

const comentariosFallback = [
  { nombre:'Luis Mendoza', texto:'El río ya no se puede usar como antes. La contaminación ha empeorado muchísimo.' },
  { nombre:'Andrea Gómez', texto:'Necesitamos más campañas ambientales en las escuelas y comunidades.' },
  { nombre:'Carlos Ruiz',  texto:'Cada año veo más basura cerca de los ríos y nadie hace nada.' },
  { nombre:'María López',  texto:'Las comunidades rurales son las más afectadas por la falta de agua limpia.' },
  { nombre:'José Martínez',texto:'El gobierno debería invertir más en plantas de tratamiento de agua.' },
  { nombre:'Fernanda Díaz',texto:'En mi comunidad ya no podemos pescar como antes debido a la contaminación.' },
  { nombre:'Raúl Hernández',texto:'La situación ambiental en Chiapas es alarmante y necesita atención urgente.' },
  { nombre:'Sofía Morales',texto:'Me gustaría participar en brigadas de limpieza para ayudar a los ríos.' }
];

const nombres = [
  'Valentina Cruz','Diego Ramírez','Isabel Fuentes','Tomás Aguilar',
  'Lucía Paredes','Emilio Castillo','Camila Vázquez','Andrés Moreno',
  'Natalia Reyes','Sebastián Torres','Elena Jiménez','Pablo Mendívil'
];

if (commentsList) {
  mostrarLoadingComments();
  generarComentariosIA();
}

function mostrarLoadingComments() {
  for (let i = 0; i < 4; i++) {
    const sk = document.createElement('div');
    sk.className = 'comment-card glass skeleton';
    sk.innerHTML = `<div class="sk-name"></div><div class="sk-line"></div><div class="sk-line short"></div>`;
    commentsList.appendChild(sk);
  }
}

async function generarComentariosIA() {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Genera exactamente 4 comentarios breves y distintos de ciudadanos chiapanecos preocupados por la crisis del agua en Chiapas, México. 
Los comentarios deben sonar naturales, emotivos y personales. Varía los tonos: uno preocupado, uno esperanzador, uno crítico, uno propositivo.
Usa estos nombres al azar: ${nombres.sort(() => Math.random() - 0.5).slice(0, 4).join(', ')}.
Responde SOLO con JSON válido sin backticks ni texto extra, con esta estructura:
[{"nombre":"...","texto":"..."},{"nombre":"...","texto":"..."},{"nombre":"...","texto":"..."},{"nombre":"...","texto":"..."}]`
        }]
      })
    });

    const data = await response.json();
    let texto = data.content?.[0]?.text || '';
    texto = texto.replace(/```json|```/g, '').trim();
    const comentariosIA = JSON.parse(texto);
    comentarios_renderizar(comentariosIA);

  } catch (err) {
    console.warn('IA no disponible, usando comentarios de respaldo:', err);
    const fallback = comentariosFallback
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    comentarios_renderizar(fallback);
  }
}

function comentarios_renderizar(lista) {
  commentsList.innerHTML = '';

  lista.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'comment-card glass reveal';

    const iniciales = c.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    const colores = ['#4fc3f7','#7dd3fc','#00c9a7','#60a5fa','#a78bfa','#34d399'];
    const color   = colores[i % colores.length];

    card.innerHTML = `
      <div class="comment-header">
        <div class="comment-avatar" style="background:${color}18;border:1px solid ${color}40">
          <span style="color:${color};font-family:'Orbitron',monospace;font-size:.75rem">${iniciales}</span>
        </div>
        <div class="comment-body">
          <h3>${c.nombre}</h3>
        </div>
      </div>
      <div class="comment-body">
        <p>${c.texto}</p>
      </div>
      <div class="comment-badge">
        <span class="ia-badge">✦ generado por IA</span>
      </div>
    `;

    commentsList.appendChild(card);
    setTimeout(() => card.classList.add('active'), i * 120);
  });
}


// ── FORMULARIO DE COMENTARIO ──────────────────
const commentForm = document.getElementById('comment-form');
if (commentForm) {
  commentForm.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = document.getElementById('cf-nombre').value.trim();
    const texto  = document.getElementById('cf-texto').value.trim();
    if (!nombre || !texto) return;

    const btn = commentForm.querySelector('button[type=submit]');
    btn.disabled    = true;
    btn.textContent = 'Enviando…';

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Un usuario llamado "${nombre}" dejó este comentario sobre la crisis del agua en Chiapas:
"${texto}"
Responde con una respuesta breve, empática y alentadora de la comunidad AguaChiapas (máximo 2 oraciones). 
Responde SOLO con el texto de la respuesta, sin comillas ni formato.`
          }]
        })
      });
      const data = await response.json();
      const respuesta = data.content?.[0]?.text || '¡Gracias por tu comentario!';
      mostrarToast(`AguaChiapas: ${respuesta}`);
    } catch {
      mostrarToast('¡Gracias por compartir tu opinión!');
    }

    btn.disabled    = false;
    btn.textContent = 'Enviar comentario ✦';
    commentForm.reset();
  });
}


// ── TOAST NOTIFICATION ────────────────────────
function mostrarToast(msg) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id          = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}


// ── MODAL DE INFORMACIÓN ──────────────────────
function abrirModal(tipo) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const text  = document.getElementById('modal-text');

  const info = {
    rio: {
      titulo: 'Ríos contaminados',
      texto:  'Los ríos de Chiapas reciben residuos industriales, basura y agroquímicos que afectan gravemente la salud de las comunidades y destruyen los ecosistemas acuáticos. Más del 60% de los cuerpos de agua presentan algún grado de contaminación severa.'
    },
    basura: {
      titulo: 'Basura y residuos',
      texto:  'La acumulación de basura y los desechos sólidos terminan en los cuerpos de agua debido a la falta de saneamiento y cultura ambiental. El 85% de las aguas residuales se vierten sin tratamiento previo, contaminando mantos freáticos y ríos.'
    },
    comunidad: {
      titulo: 'Comunidades afectadas',
      texto:  'Más de 1.2 millones de familias dependen diariamente de agua contaminada para sobrevivir, lo que provoca enfermedades gastrointestinales, dérmicas y afecta gravemente la calidad de vida de las comunidades rurales e indígenas de Chiapas.'
    }
  };

  const d = info[tipo];
  if (!d) return;
  title.innerText = d.titulo;
  text.innerText  = d.texto;
  modal.style.display = 'flex';
  modal.classList.add('modal-open');
}

function cerrarModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('modal-open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

window.addEventListener('click', e => {
  const modal = document.getElementById('modal');
  if (e.target === modal) cerrarModal();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});


// ── PARALLAX HERO ─────────────────────────────
window.addEventListener('scroll', () => {
  const scrolled   = window.scrollY;
  const heroVideo  = document.querySelector('.hero-video');
  if (heroVideo) heroVideo.style.transform = `translateY(${scrolled * 0.15}px)`;
});


// ── CARD GRADIENT ON HOVER ────────────────────
document.querySelectorAll('.info-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(79,195,247,.12), rgba(15,30,58,.6))`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = 'var(--card-bg)';
  });
});


// ── TEXTO HERO ANIMADO ────────────────────────
const heroTitle = document.querySelector('.hero h1');

if (heroTitle) {
  const html = heroTitle.innerHTML;
  heroTitle.innerHTML = '';

  const parser = new DOMParser();
  const doc    = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const nodes  = doc.body.firstChild.childNodes;

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      [...node.textContent].forEach((ch, i) => {
        const span = document.createElement('span');
        span.innerHTML     = ch === ' ' ? '&nbsp;' : ch;
        span.style.cssText = `opacity:0;display:inline-block;transform:translateY(20px);transition:.5s`;
        heroTitle.appendChild(span);
        setTimeout(() => {
          span.style.opacity   = 1;
          span.style.transform = 'translateY(0)';
        }, i * 32 + 300);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const wrapper = document.createElement(node.tagName);
      wrapper.className = node.className;
      [...node.textContent].forEach((ch, i) => {
        const span = document.createElement('span');
        span.innerHTML     = ch === ' ' ? '&nbsp;' : ch;
        span.style.cssText = `opacity:0;display:inline-block;transform:translateY(20px);transition:.5s`;
        wrapper.appendChild(span);
        setTimeout(() => {
          span.style.opacity   = 1;
          span.style.transform = 'translateY(0)';
        }, i * 32 + 300);
      });
      heroTitle.appendChild(wrapper);
    }
  });
}


// ── CONTADOR ANIMADO PARA ESTADÍSTICAS ────────
function animarContador(el, target, suffix = '') {
  const duration = 1800;
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(eased * target);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const statCards    = document.querySelectorAll('.stat-card');
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const h2 = entry.target.querySelector('h2');
      if (!h2 || h2.dataset.animated) return;
      h2.dataset.animated = 'true';

      const text = h2.textContent;
      if (text.includes('%')) {
        animarContador(h2, parseFloat(text), '%');
      } else if (text.includes('M')) {
        h2.textContent = '0M';
        let v = 0;
        const iv = setInterval(() => {
          v += 0.05;
          h2.textContent = v.toFixed(1) + 'M';
          if (v >= 1.2) { clearInterval(iv); h2.textContent = '1.2M'; }
        }, 40);
      }
    }
  });
}, { threshold: 0.5 });

statCards.forEach(c => statObserver.observe(c));


// ── PARTÍCULAS DE AGUA EN HERO ────────────────
function crearParticulas() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  for (let i = 0; i < 14; i++) {
    const p    = document.createElement('div');
    p.className = 'water-particle';
    const size  = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation-delay:${Math.random() * 6}s;
      animation-duration:${Math.random() * 4 + 5}s;
    `;
    hero.appendChild(p);
  }
}
crearParticulas();


// ── RIPPLE EN BOTONES Y TARJETAS ──────────────
function addRipple(el) {
  el.addEventListener('click', function(e) {
    const rect   = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className  = 'ripple-effect';
    ripple.style.cssText = `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;`;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
}
document.querySelectorAll('.hero-btn, .info-card, .stat-card').forEach(addRipple);


// ── TILT 3D EN TARJETAS ───────────────────────
document.querySelectorAll('.info-card, .impact-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rx   = -(e.clientY - cy) / rect.height * 8;
    const ry   =  (e.clientX - cx) / rect.width  * 8;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.01)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .4s ease';
    setTimeout(() => card.style.transition = '', 400);
  });
});


// ── BARRA DE PROGRESO DE LECTURA ──────────────
(function crearProgressBar() {
  const bar = document.createElement('div');
  bar.id    = 'read-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width  = (scrollTop / docHeight * 100) + '%';
  });
})();


// ── SMOOTH SCROLL ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// ── NAVBAR SCROLL EFFECT ──────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}
