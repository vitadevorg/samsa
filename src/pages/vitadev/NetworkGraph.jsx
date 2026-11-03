import React, { useEffect, useRef, useState } from 'react';

const HEIGHT = 320;
const TWO_PI = Math.PI * 2;
const ORBIT_BASE = 24; // radio de la órbita más cercana de los médicos alrededor de su institución
const ORBIT_STEP = 7;
const MAX_ORBIT = ORBIT_BASE + 2 * ORBIT_STEP;
const PULSE_INTERVAL_MS = 1500; // cada cuánto sale un impulso nuevo desde el centro

// Color de cada tipo de nodo (tonos apagados de la paleta del panel).
const COLORS = {
  center: '#1e293b',
  clinic: '#6366f1',
  hospital: '#14b8a6',
  particular: '#3b82f6',
  member: '#94a3b8',
};

// Red animada y minimalista: VitaDev en el centro, conectado a cada clínica, hospital y al grupo de
// médicos particulares; alrededor de cada uno orbitan sus médicos. Por las conexiones viaja de vez en
// cuando un punto que "enciende" el nodo al llegar. Solo usa nombres y cantidades: nada clínico.
//
// `groups`: [{ id, label, sub, kind: 'clinic' | 'hospital' | 'particular', members: [nombres] }]
// Se dibuja en un <canvas>; con "reducir movimiento" activado en el sistema queda una imagen fija.
const NetworkGraph = ({ groups }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null); // { x, y, label, sub } del nodo bajo el mouse

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Nodos ---
    const makeNode = (props) => ({ x: 0, y: 0, baseX: 0, baseY: 0, flash: 0, ...props });
    const center = makeNode({ id: 'center', label: 'VitaDev', sub: 'Administración central', kind: 'center', radius: 9, phase: 0 });
    const groupNodes = groups.map((group, i) => makeNode({
      id: group.id, label: group.label, sub: group.sub, kind: group.kind, radius: 7, phase: i * 1.7,
    }));
    const memberNodes = [];
    groups.forEach((group, i) => {
      group.members.forEach((name, j) => {
        memberNodes.push(makeNode({
          id: `${group.id}-${j}`, label: name, sub: group.label, kind: 'member', radius: 3,
          parent: groupNodes[i],
          orbitRadius: ORBIT_BASE + (j % 3) * ORBIT_STEP,
          orbitAngle: (j / group.members.length) * TWO_PI,
          orbitSpeed: (0.00012 + (j % 4) * 0.00004) * (i % 2 === 0 ? 1 : -1),
        }));
      });
    });
    const nodes = [center, ...groupNodes, ...memberNodes];
    const membersOf = (groupNode) => memberNodes.filter((member) => member.parent === groupNode);

    // --- Medidas y posiciones base (se recalculan al cambiar el ancho) ---
    let width = 0;
    const layout = () => {
      center.baseX = width / 2;
      center.baseY = HEIGHT / 2 + 10;
      const radiusX = Math.max(110, width * 0.34);
      const radiusY = HEIGHT * 0.27;
      groupNodes.forEach((node, i) => {
        const angle = -Math.PI / 2 + (i / groupNodes.length) * TWO_PI;
        node.baseX = center.baseX + Math.cos(angle) * radiusX;
        node.baseY = center.baseY + Math.sin(angle) * radiusY;
      });
    };
    const resize = () => {
      width = wrap.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = HEIGHT * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${HEIGHT}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
      update(performance.now());
      draw();
    };

    // --- Movimiento: los nodos "respiran" y los médicos orbitan ---
    const update = (now) => {
      center.x = center.baseX;
      center.y = center.baseY + Math.sin(now * 0.001) * 3;
      groupNodes.forEach((node) => {
        node.x = node.baseX + Math.sin(now * 0.0006 + node.phase) * 7;
        node.y = node.baseY + Math.cos(now * 0.0005 + node.phase) * 6;
      });
      memberNodes.forEach((node) => {
        const angle = node.orbitAngle + now * node.orbitSpeed;
        node.x = node.parent.x + Math.cos(angle) * node.orbitRadius;
        node.y = node.parent.y + Math.sin(angle) * node.orbitRadius;
      });
    };

    // --- Impulsos que viajan por las conexiones ---
    let pulses = [];
    const spawnPulse = (from, to, speed = 0.0006) => pulses.push({ from, to, progress: 0, speed });
    const advancePulses = (dt) => {
      const arrived = [];
      pulses.forEach((pulse) => { pulse.progress += dt * pulse.speed; });
      pulses = pulses.filter((pulse) => {
        if (pulse.progress < 1) return true;
        arrived.push(pulse);
        return false;
      });
      arrived.forEach(({ to }) => {
        to.flash = 1;
        // Al llegar a una clínica u hospital el impulso sigue hacia algunos de sus médicos.
        if (groupNodes.includes(to)) {
          const members = membersOf(to);
          members.sort(() => Math.random() - 0.5).slice(0, 1).forEach((member) => spawnPulse(to, member, 0.0009));
        }
      });
      nodes.forEach((node) => { node.flash = Math.max(0, node.flash - dt * 0.0012); });
    };

    // --- Dibujo ---
    const lineBetween = (a, b, color, lineWidth) => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, HEIGHT);
      groupNodes.forEach((node) => lineBetween(center, node, 'rgba(148, 163, 184, 0.45)', 1));
      memberNodes.forEach((node) => lineBetween(node.parent, node, 'rgba(148, 163, 184, 0.3)', 0.8));

      // Impulso: un punto pequeño que viaja por la línea.
      pulses.forEach((pulse) => {
        ctx.beginPath();
        ctx.arc(
          pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress,
          pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress,
          2.5, 0, TWO_PI
        );
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      });

      nodes.forEach((node) => {
        const color = COLORS[node.kind];
        // Al recibir un impulso, un anillo fino que se expande y se desvanece.
        if (node.flash > 0.02) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 3 + (1 - node.flash) * 9, 0, TWO_PI);
          ctx.strokeStyle = color;
          ctx.globalAlpha = node.flash * 0.5;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, TWO_PI);
        ctx.fillStyle = color;
        ctx.fill();
      });

      ctx.font = '500 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'; // contorno blanco: el texto se lee aunque pase una línea por detrás
      ctx.fillStyle = '#475569';
      const drawLabel = (node, offsetY) => {
        const text = node.label.length > 26 ? `${node.label.slice(0, 25)}…` : node.label;
        ctx.strokeText(text, node.x, node.y + offsetY);
        ctx.fillText(text, node.x, node.y + offsetY);
      };
      drawLabel(center, center.radius + 16);
      // Las etiquetas de las instituciones quedan fuera de la órbita de sus médicos:
      // arriba si el nodo está en la parte alta, abajo en el resto.
      groupNodes.forEach((node) => {
        const isOnTop = node.baseY < center.baseY - 20;
        drawLabel(node, isOnTop ? -(MAX_ORBIT + 8) : MAX_ORBIT + 14);
      });
    };

    // --- Bucle de animación ---
    let rafId = 0;
    let last = performance.now();
    let sincePulse = PULSE_INTERVAL_MS;
    const frame = (now) => {
      const dt = Math.min(now - last, 64); // si la pestaña estuvo oculta, no saltar de golpe
      last = now;
      sincePulse += dt;
      if (sincePulse >= PULSE_INTERVAL_MS && groupNodes.length > 0) {
        sincePulse = 0;
        spawnPulse(center, groupNodes[Math.floor(Math.random() * groupNodes.length)]);
      }
      update(now);
      advancePulses(dt);
      draw();
      rafId = requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();
    if (!reduceMotion) rafId = requestAnimationFrame(frame);

    // --- Mouse: nombre del nodo bajo el puntero ---
    let hoveredId = null;
    const handleMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hit = nodes.find((node) => Math.hypot(node.x - x, node.y - y) <= node.radius + 6);
      if ((hit?.id ?? null) === hoveredId) return;
      hoveredId = hit?.id ?? null;
      setTooltip(hit ? { x: hit.x, y: hit.y - hit.radius - 10, label: hit.label, sub: hit.sub } : null);
    };
    const handleLeave = () => {
      hoveredId = null;
      setTooltip(null);
    };
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [groups]);

  return (
    <div ref={wrapRef} className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      <div className="absolute top-4 left-5 z-10 pointer-events-none">
        <p className="text-sm font-bold text-gray-800">Red S.A.M.S.A</p>
      </div>
      <ul className="absolute top-4 right-5 z-10 flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs text-gray-500 pointer-events-none">
        {[['clinic', 'Clínicas'], ['hospital', 'Hospitales'], ['particular', 'Particulares'], ['member', 'Médicos']].map(([kind, label]) => (
          <li key={kind} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[kind] }} />
            {label}
          </li>
        ))}
      </ul>
      <canvas ref={canvasRef} role="img" aria-label="Red animada de instituciones y médicos conectados con VitaDev" className="block" />
      {tooltip && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-bold">{tooltip.label}</p>
          {tooltip.sub && <p className="text-slate-300">{tooltip.sub}</p>}
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
