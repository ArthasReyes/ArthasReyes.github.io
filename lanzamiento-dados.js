class LanzamientoDados extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="font-family: sans-serif; max-width: 520px; text-align: center; margin: auto;">
        <div style="margin-bottom: 15px;">
          <button id="btnRoll" style="padding: 8px 16px; font-size: 16px; cursor: pointer; background: #9b59b6; color: white; border: none; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Lanzar Dados
          </button>
        </div>
        <canvas width="468" height="325" style="border: 2px solid #ccc; border-radius: 8px; background-color: #fafafa; display: block; margin: 0 auto;"></canvas>
      </div>
    `;

    const canvas = this.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const btnRoll = this.querySelector("#btnRoll");

    let dice = Array(12).fill(1);
    let isRolling = false;

    const drawRoundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const drawDot = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2); // Puntos un 30% más grandes
      ctx.fillStyle = "#2c3e50";
      ctx.fill();
    };

    const drawDie = (x, y, size, value) => {
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = "white";
      drawRoundRect(x, y, size, size, 13); // Bordes redondeados ajustados a la escala
      ctx.fill();

      ctx.shadowColor = "transparent"; 
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 2;
      ctx.stroke();

      const p = size * 0.25; 
      const c = size * 0.5;  
      const l = p;           
      const r = size - p;    
      const t = p;           
      const b = size - p;    

      const dot = (dx, dy) => drawDot(x + dx, y + dy);

      if (value === 1 || value === 3 || value === 5) dot(c, c);
      if (value > 1) { dot(l, t); dot(r, b); }
      if (value > 3) { dot(r, t); dot(l, b); }
      if (value === 6) { dot(l, c); dot(r, c); }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dimensiones aumentadas un 30%
      const size = 73; // Tamaño del dado
      const gap = 16;  // Espacio entre dados
      const cols = 4;  // 4 columnas
      
      const gridWidth = (cols * size) + ((cols - 1) * gap);
      const startX = (canvas.width - gridWidth) / 2;
      const startY = 33; // Margen superior escalado

      for (let i = 0; i < 12; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (size + gap);
        const y = startY + row * (size + gap);
        drawDie(x, y, size, dice[i]);
      }
    };

    const rollAnimation = () => {
      let frames = 0;
      const maxFrames = 15;

      const animate = () => {
        frames++;
        dice = dice.map(() => Math.floor(Math.random() * 6) + 1);
        draw();

        if (frames < maxFrames) {
          requestAnimationFrame(animate);
        } else {
          isRolling = false;
        }
      };
      requestAnimationFrame(animate);
    };

    btnRoll.addEventListener("click", () => {
      if (isRolling) return;
      isRolling = true;
      rollAnimation();
    });

    dice = dice.map(() => Math.floor(Math.random() * 6) + 1);
    draw();
  }
}

customElements.define("lanzamiento-dados", LanzamientoDados);