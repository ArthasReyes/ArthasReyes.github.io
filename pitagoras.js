class PythagorasSim extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="font-family:sans-serif; max-width:420px; text-align:center;">
        <div style="margin-bottom:5px;">
          <input type="range" min="1" max="10" value="3" step="0.1" id="aSlider" style="width:120px;">
          <input type="range" min="1" max="10" value="4" step="0.1" id="bSlider" style="width:120px;">
        </div>
        <canvas width="400" height="400" style="border:5px solid #ccc;"></canvas>
      </div>
    `;

    const canvas = this.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const aSlider = this.querySelector("#aSlider");
    const bSlider = this.querySelector("#bSlider");

    const drawSquare = (p1, p2, flip = 1) => {
      const vx = p2.x - p1.x;
      const vy = p2.y - p1.y;

      const px = flip * (-vy);
      const py = flip * (vx);

      const p3 = { x: p2.x + px, y: p2.y + py };
      const p4 = { x: p1.x + px, y: p1.y + py };

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.stroke();
    };

    const draw = () => {
      const a = parseFloat(aSlider.value);
      const b = parseFloat(bSlider.value);

      ctx.clearRect(0, 0, 400, 400);
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // 🔑 ESCALA DINÁMICA para centrar
      const maxSide = Math.max(a, b, Math.sqrt(a*a + b*b));
      const scale = 300 / (maxSide * 2); // ajusta tamaño automáticamente

      // 🔑 CENTRO del canvas
      const centerX = 200;
      const centerY = 200;

      // triángulo centrado en A
      const A = { x: centerX - (a*scale)/2, y: centerY + (b*scale)/2 };
      const B = { x: A.x + a*scale, y: A.y };
      const C = { x: A.x, y: A.y - b*scale };

      // triángulo
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.lineTo(C.x, C.y);
      ctx.closePath();
      ctx.stroke();

      // cuadrados
      ctx.strokeStyle = "blue";
      drawSquare(A, B, 1);

      ctx.strokeStyle = "green";
      drawSquare(A, C, -1);

      ctx.strokeStyle = "red";
      drawSquare(B, C, 1);
    };

    aSlider.addEventListener("input", draw);
    bSlider.addEventListener("input", draw);

    draw();
  }
}

customElements.define("pythagoras-sim", PythagorasSim);