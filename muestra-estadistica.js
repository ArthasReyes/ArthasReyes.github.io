class MuestraEstadistica extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="font-family: sans-serif; max-width: 600px; text-align: center; margin: auto;">
        <div style="margin-bottom: 15px;">
          <button id="btnSample" style="padding: 8px 16px; font-size: 14px; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 4px; margin-right: 10px;">
            Extraer Muestra Aleatoria
          </button>
          <button id="btnReset" style="padding: 8px 16px; font-size: 14px; cursor: pointer; background: #e74c3c; color: white; border: none; border-radius: 4px;">
            Reiniciar
          </button>
        </div>
        <canvas width="600" height="300" style="border: 2px solid #ccc; border-radius: 8px; background-color: #fafafa;"></canvas>
      </div>
    `;

    const canvas = this.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const btnSample = this.querySelector("#btnSample");
    const btnReset = this.querySelector("#btnReset");

    const popCenter = { x: 150, y: 160, radius: 110 };
    const sampleCenter = { x: 450, y: 160, radius: 70 };

    let population = [];
    const popSize = 200;
    const sampleSize = 30;
    let animationFrameId;
    let isAnimating = false;

    const randomInCircle = (center, radius) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius; 
      return { x: center.x + r * Math.cos(angle), y: center.y + r * Math.sin(angle) };
    };

    const initPopulation = () => {
      population = [];
      for (let i = 0; i < popSize; i++) {
        const pos = randomInCircle(popCenter, popCenter.radius - 6);
        population.push({
          x: pos.x, y: pos.y,
          startX: pos.x, startY: pos.y,
          targetX: pos.x, targetY: pos.y,
          selected: false,
          color: "#3498db"
        });
      }
      isAnimating = false;
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondos de áreas
      ctx.fillStyle = "#ebf5fb";
      ctx.beginPath(); ctx.arc(popCenter.x, popCenter.y, popCenter.radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e8f8f5";
      ctx.beginPath(); ctx.arc(sampleCenter.x, sampleCenter.y, sampleCenter.radius, 0, Math.PI * 2); ctx.fill();

      // Etiquetas
      ctx.fillStyle = "#333"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("POBLACIÓN", popCenter.x, popCenter.y - popCenter.radius - 10);
      ctx.fillText("MUESTRA", sampleCenter.x, sampleCenter.y - sampleCenter.radius - 10);

      // --- DIBUJO DE INDIVIDUOS ---
      population.forEach(p => {
        if (p.selected) {
          // 1. Dibuja el "rastro" o fantasma en la posición original dentro de la población
          ctx.beginPath();
          ctx.arc(p.startX, p.startY, 3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(230, 126, 34, 0.4)"; // Naranja suave transparente
          ctx.lineWidth = 2;
          ctx.stroke();

          // 2. Dibuja el punto seleccionado con resalte (borde blanco y sombra)
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); // Un poco más grande
          ctx.fillStyle = "#e67e22"; // Naranja vibrante
          ctx.shadowBlur = 5;
          ctx.shadowColor = "rgba(0,0,0,0.3)";
          ctx.fill();
          
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.shadowBlur = 0; // Reset sombra
        } else {
          // Puntos no seleccionados
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      });
    };

    const animate = () => {
      let needsUpdate = false;
      population.forEach(p => {
        if (p.selected) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            p.x += dx * 0.08;
            p.y += dy * 0.08;
            needsUpdate = true;
          } else {
            p.x = p.targetX; p.y = p.targetY;
          }
        }
      });
      draw();
      if (needsUpdate) animationFrameId = requestAnimationFrame(animate);
      else isAnimating = false;
    };

    const selectSample = () => {
      if (isAnimating) return;
      population.forEach(p => { p.x = p.startX; p.y = p.startY; p.selected = false; });
      const shuffled = [...population].sort(() => 0.5 - Math.random());
      const selectedSubset = shuffled.slice(0, sampleSize);
      selectedSubset.forEach(p => {
        p.selected = true;
        const newPos = randomInCircle(sampleCenter, sampleCenter.radius - 8);
        p.targetX = newPos.x; p.targetY = newPos.y;
      });
      isAnimating = true;
      animate();
    };

    btnSample.addEventListener("click", selectSample);
    btnReset.addEventListener("click", () => { cancelAnimationFrame(animationFrameId); initPopulation(); });
    initPopulation();
  }
}

customElements.define("muestra-estadistica", MuestraEstadistica);