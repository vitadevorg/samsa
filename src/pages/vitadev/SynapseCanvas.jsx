import React, { useEffect, useRef } from 'react';

const TARGET_CELL_PX = 105;       // separación aproximada entre neuronas
const MAX_NEURONS = 150;
const AVOID_PADDING_PX = 26;   // aire extra alrededor de las zonas a evitar (cubre las dendritas)
const MARGIN_PX = 6;      // las neuronas llegan casi hasta el borde
const TWO_PI = Math.PI * 2;
const SEED = 20260930;             // misma disposición de neuronas en cada visita
const PULSE_SPEED_PX_PER_MS = 0.09; // velocidad del impulso eléctrico (lenta)
const TRAIL_STEPS = 16;            // largo de la estela
const TRAIL_STEP_T = 0.011;
const REFRACTORY_MS = 1200;        // después de disparar, la neurona "descansa" un momento
const SPONTANEOUS_MS = 1800;       // si hay muy poca actividad, una neurona dispara sola
const MAX_PULSES = 12;

// Generador pseudoaleatorio con semilla (para que la disposición sea siempre la misma).
const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Punto de una curva de Bézier cuadrática en t (0 a 1).
const curvePoint = (edge, t) => {
  const u = 1 - t;
  return {
    x: u * u * edge.a.x + 2 * u * t * edge.cx + t * t * edge.b.x,
    y: u * u * edge.a.y + 2 * u * t * edge.cy + t * t * edge.b.y,
  };
};

// Neuronas conectadas entre sí por axones curvos; por ellos viaja un impulso eléctrico que, al llegar,
// enciende la neurona y se propaga a sus vecinas (sinapsis). Es solo decoración: no depende de los datos.
// `avoidRef`: referencia a un elemento (por ejemplo el título de la página) donde NO se dibuja nada:
// ahí no se ponen neuronas ni pasan axones, para no tapar el texto.
const SynapseCanvas = ({ avoidRef }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let neurons = [];
    let edges = [];
    let pulses = [];

    // --- Armado de la red según el ancho disponible ---
    // Rectángulo a evitar, en coordenadas del canvas (o null si no hay).
    const getAvoidZone = () => {
      const target = avoidRef?.current;
      if (!target) return null;
      const box = target.getBoundingClientRect();
      const origin = wrap.getBoundingClientRect();
      return {
        left: box.left - origin.left - AVOID_PADDING_PX,
        right: box.right - origin.left + AVOID_PADDING_PX,
        top: box.top - origin.top - AVOID_PADDING_PX,
        bottom: box.bottom - origin.top + AVOID_PADDING_PX,
      };
    };
    const insideZone = (zone, x, y) => zone && x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
    // ¿El axón entre dos neuronas pasa por la zona? Se prueban varios puntos de su curva.
    const crossesZone = (zone, a, b, bend) => {
      if (!zone) return false;
      const controlX = (a.baseX + b.baseX) / 2 - (b.baseY - a.baseY) * bend;
      const controlY = (a.baseY + b.baseY) / 2 + (b.baseX - a.baseX) * bend;
      for (let t = 0; t <= 1; t += 1 / 16) {
        const u = 1 - t;
        const x = u * u * a.baseX + 2 * u * t * controlX + t * t * b.baseX;
        const y = u * u * a.baseY + 2 * u * t * controlY + t * t * b.baseY;
        if (insideZone(zone, x, y)) return true;
      }
      return false;
    };

    const build = () => {
      const random = seededRandom(SEED);
      const zone = getAvoidZone();
      // Grilla con variación: reparte las neuronas parejo (sin huecos ni amontonamientos).
      // La grilla cubre todo el fondo; si el área es muy grande, las celdas se agrandan para no pasar el máximo.
      const cell = Math.max(TARGET_CELL_PX, Math.sqrt(((width - 2 * MARGIN_PX) * (height - 2 * MARGIN_PX)) / MAX_NEURONS));
      const columns = Math.max(3, Math.round((width - 2 * MARGIN_PX) / cell));
      const rows = Math.max(2, Math.round((height - 2 * MARGIN_PX) / cell));
      const cellWidth = (width - 2 * MARGIN_PX) / columns;
      const cellHeight = (height - 2 * MARGIN_PX) / rows;
      neurons = [];
      for (let index = 0; index < columns * rows; index += 1) {
        const spot = {
          x: MARGIN_PX + ((index % columns) + 0.5 + (random() - 0.5) * 0.7) * cellWidth,
          y: MARGIN_PX + (Math.floor(index / columns) + 0.5 + (random() - 0.5) * 0.7) * cellHeight,
        };
        if (insideZone(zone, spot.x, spot.y)) continue; // en la zona a evitar no se pone ninguna neurona
        neurons.push({
          baseX: spot.x, baseY: spot.y, x: spot.x, y: spot.y,
          radius: 3.5 + random() * 2.5,
          phase: random() * TWO_PI,
          flash: 0,
          lastFire: -Infinity,
          links: [],
          // Dendritas: ramitas cortas y curvas alrededor del cuerpo de la neurona.
          dendrites: Array.from({ length: 4 + Math.floor(random() * 3) }, () => ({
            angle: random() * TWO_PI, length: 11 + random() * 9, bend: (random() - 0.5) * 1.1,
          })),
        });
      }

      // Cada neurona se conecta con sus 3 vecinas más cercanas (sin repetir conexiones).
      edges = [];
      neurons.forEach((neuron, i) => {
        const nearest = neurons
          .map((other, j) => ({ j, d: Math.hypot(other.baseX - neuron.baseX, other.baseY - neuron.baseY) }))
          .filter(({ j }) => j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 3);
        nearest.forEach(({ j, d }) => {
          if (edges.some((e) => (e.a === neuron && e.b === neurons[j]) || (e.a === neurons[j] && e.b === neuron))) return;
          const bend = (random() - 0.5) * 0.5;
          if (crossesZone(zone, neuron, neurons[j], bend)) return; // tampoco axones que atraviesen la zona
          const edge = { a: neuron, b: neurons[j], length: d, bend, cx: 0, cy: 0 };
          edges.push(edge);
          neuron.links.push(edge);
          neurons[j].links.push(edge);
        });
      });

      // Si quedaron grupos separados, se unen por sus dos neuronas más cercanas:
      // así el impulso puede recorrer toda la red.
      const groupOf = (neuron) => {
        const seen = new Set([neuron]);
        const stack = [neuron];
        while (stack.length > 0) {
          stack.pop().links.forEach((edge) => {
            [edge.a, edge.b].forEach((other) => {
              if (!seen.has(other)) { seen.add(other); stack.push(other); }
            });
          });
        }
        return seen;
      };
      let group = neurons.length > 0 ? groupOf(neurons[0]) : null;
      while (group && group.size < neurons.length) {
        let best = null;
        group.forEach((inside) => {
          neurons.filter((other) => !group.has(other)).forEach((outside) => {
            const d = Math.hypot(inside.baseX - outside.baseX, inside.baseY - outside.baseY);
            if ((!best || d < best.d) && !crossesZone(zone, inside, outside, 0)) best = { a: inside, b: outside, d };
          });
        });
        if (!best) break; // no hay forma de unirlos sin cruzar la zona: queda un grupo aparte
        const edge = { a: best.a, b: best.b, length: best.d, bend: 0, cx: 0, cy: 0 };
        edges.push(edge);
        best.a.links.push(edge);
        best.b.links.push(edge);
        group = groupOf(neurons[0]);
      }
      pulses = [];
    };

    // --- Movimiento suave de las neuronas y recálculo de las curvas ---
    const update = (now) => {
      neurons.forEach((n) => {
        n.x = n.baseX + Math.sin(now * 0.0005 + n.phase) * 3;
        n.y = n.baseY + Math.cos(now * 0.0004 + n.phase) * 3;
      });
      edges.forEach((e) => {
        const dx = e.b.x - e.a.x;
        const dy = e.b.y - e.a.y;
        // El punto de control se corre hacia un costado: así el axón sale curvo.
        e.cx = (e.a.x + e.b.x) / 2 - dy * e.bend;
        e.cy = (e.a.y + e.b.y) / 2 + dx * e.bend;
      });
    };

    // --- Sinapsis: una neurona dispara y manda impulsos por sus conexiones ---
    const sendPulse = (edge, from) => {
      if (pulses.length >= MAX_PULSES) return;
      pulses.push({ edge, forward: edge.a === from, progress: 0, target: edge.a === from ? edge.b : edge.a });
    };
    const fire = (neuron, now, cameFrom = null) => {
      if (now - neuron.lastFire < REFRACTORY_MS) return;
      neuron.lastFire = now;
      neuron.flash = 1;
      // A veces la señal se apaga sola; casi siempre sigue por una sola conexión (pocos impulsos a la vez).
      if (cameFrom && Math.random() < 0.2) return;
      const options = neuron.links.filter((edge) => edge !== cameFrom);
      options.sort(() => Math.random() - 0.5).slice(0, Math.random() < 0.25 ? 2 : 1).forEach((edge) => sendPulse(edge, neuron));
    };
    const advance = (dt, now) => {
      pulses.forEach((pulse) => { pulse.progress += (dt * PULSE_SPEED_PX_PER_MS) / pulse.edge.length; });
      const arrived = pulses.filter((pulse) => pulse.progress >= 1);
      pulses = pulses.filter((pulse) => pulse.progress < 1);
      arrived.forEach((pulse) => fire(pulse.target, now, pulse.edge));
      neurons.forEach((n) => { n.flash = Math.max(0, n.flash - dt * 0.001); });
    };

    // --- Dibujo ---
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';

      // Axones (curvas tenues)
      edges.forEach((e) => {
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.quadraticCurveTo(e.cx, e.cy, e.b.x, e.b.y);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.28)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Neuronas: dendritas y cuerpo
      neurons.forEach((n) => {
        n.dendrites.forEach((d) => {
          const endX = n.x + Math.cos(d.angle) * d.length;
          const endY = n.y + Math.sin(d.angle) * d.length;
          const controlX = n.x + Math.cos(d.angle + d.bend) * d.length * 0.6;
          const controlY = n.y + Math.sin(d.angle + d.bend) * d.length * 0.6;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.quadraticCurveTo(controlX, controlY, endX, endY);
          ctx.strokeStyle = `rgba(100, 116, 139, ${0.35 + n.flash * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        if (n.flash > 0.02) {
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 26);
          halo.addColorStop(0, `rgba(59, 130, 246, ${n.flash * 0.3})`);
          halo.addColorStop(1, 'rgba(59, 130, 246, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 26, 0, TWO_PI);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, TWO_PI);
        ctx.fillStyle = n.flash > 0.05 ? '#3b82f6' : '#94a3b8';
        ctx.fill();
      });

      // Impulsos eléctricos: cabeza brillante y estela que se desvanece
      pulses.forEach((pulse) => {
        const position = (t) => curvePoint(pulse.edge, pulse.forward ? t : 1 - t);
        for (let k = 0; k < TRAIL_STEPS; k += 1) {
          const from = pulse.progress - k * TRAIL_STEP_T;
          const to = from - TRAIL_STEP_T;
          if (to < 0) break;
          const p1 = position(from);
          const p2 = position(to);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${(1 - k / TRAIL_STEPS) * 0.9})`;
          ctx.lineWidth = 2.4 - (k / TRAIL_STEPS) * 1.4;
          ctx.stroke();
        }
        const head = position(pulse.progress);
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 9);
        glow.addColorStop(0, 'rgba(37, 99, 235, 0.95)');
        glow.addColorStop(0.4, 'rgba(59, 130, 246, 0.35)');
        glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 9, 0, TWO_PI);
        ctx.fill();
      });
    };

    // --- Tamaño ---
    const resize = () => {
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      update(performance.now());
      draw();
    };

    // --- Bucle de animación ---
    let rafId = 0;
    let last = performance.now();
    let sinceSpontaneous = 0;
    const frame = (now) => {
      const dt = Math.min(now - last, 64); // si la pestaña estuvo oculta, no saltar de golpe
      last = now;
      sinceSpontaneous += dt;
      if (sinceSpontaneous >= SPONTANEOUS_MS && pulses.length < 2 && neurons.length > 0) {
        sinceSpontaneous = 0;
        fire(neurons[Math.floor(Math.random() * neurons.length)], now);
      }
      update(now);
      advance(dt, now);
      draw();
      rafId = requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();
    // No se desactiva con "reducir movimiento" del sistema: es un adorno suave (sin destellos rápidos)
    // y esa opción dejaba la red quieta a quienes la tienen activada.
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [avoidRef]);

  return (
    // Sin tarjeta ni fondo: cubre siempre toda la ventana visible (debajo de la barra superior), detrás
    // del contenido, aunque la página sea más corta o más larga que la pantalla. El contenido de la
    // página tiene que ir en un elemento `relative z-10`; las tarjetas con fondo propio tapan lo que queda detrás.
    <div ref={wrapRef} aria-hidden="true" className="fixed inset-x-0 bottom-0 top-20 pointer-events-none">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export default SynapseCanvas;
