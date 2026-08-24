class SimuladorEspejos extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="font-family: system-ui, sans-serif; max-width: 750px; margin: auto; text-align: center; color: #333;">
        <div style="display: flex; gap: 15px; justify-content: center; align-items: center; flex-wrap: wrap; margin-bottom: 12px; font-size: 14px; background: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #e9ecef;">
          <label style="display: flex; align-items: center; gap: 4px;">
            <b>Espejo:</b>
            <select id="tipoEspejo" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc;">
              <option value="plano">Plano (Fase 1)</option>
            </select>
          </label>
          <label style="display: flex; align-items: center; gap: 4px;">
            <b>Rayos:</b>
            <select id="tipoRayos" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc;">
              <option value="notables">Rayos Notables</option>
              <option value="multiples">Múltiples Rayos</option>
            </select>
          </label>
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <input type="checkbox" id="chkReflejados" checked /> Reflejados
          </label>
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <input type="checkbox" id="chkProyectados" checked /> Proyectados
          </label>
        </div>
        <canvas width="750" height="400" style="border: 1px solid #ccc; border-radius: 8px; background-color: #ffffff;"></canvas>
      </div>
    `;

    const canvas = this.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const selRayos = this.querySelector("#tipoRayos");
    const chkRef = this.querySelector("#chkReflejados");
    const chkProy = this.querySelector("#chkProyectados");

    // Estado del Objeto en coordenadas lógicas (Centro del canvas es 0,0)
    let objX = -150; // x0
    let objY = 80;   // y0
    let isDragging = false;

    // Transformaciones de coordenadas (Lógicas <-> Canvas)
    const cx = (x) => canvas.width / 2 + x;
    const cy = (y) => canvas.height / 2 - y;
    const lx = (canvasX) => canvasX - canvas.width / 2;
    const ly = (canvasY) => canvas.height / 2 - canvasY;

    // Manejo del Drag & Drop
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    canvas.addEventListener("mousedown", (e) => {
      const pos = getPos(e);
      // Evaluamos distancia en coordenadas de canvas a la punta de la flecha
      if (Math.hypot(pos.x - cx(objX), pos.y - cy(objY)) <= 15) isDragging = true;
    });

    canvas.addEventListener("mousemove", (e) => {
      const pos = getPos(e);
      canvas.style.cursor = Math.hypot(pos.x - cx(objX), pos.y - cy(objY)) <= 15 || isDragging ? "pointer" : "default";

      if (isDragging) {
        // Restringimos el objeto al semiplano izquierdo (x < 0)
        objX = Math.min(lx(pos.x), -20);
        objY = ly(pos.y);
        draw();
      }
    });

    window.addEventListener("mouseup", () => { isDragging = false; });
    [selRayos, chkRef, chkProy].forEach(el => el.addEventListener("change", () => draw()));

    // Dibuja un segmento finito
    const drawSegment = (x1, y1, x2, y2, color, dashed = false) => {
      ctx.beginPath();
      ctx.setLineDash(dashed ? [6, 6] : []);
      ctx.moveTo(cx(x1), cy(y1));
      ctx.lineTo(cx(x2), cy(y2));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Dibuja una semirrecta (rayo infinito) desde un punto pasando por otro
    const drawRay = (startX, startY, passX, passY, color, dashed = false) => {
      const dx = passX - startX;
      const dy = passY - startY;
      const len = Math.hypot(dx, dy);
      if (len === 0) return;
      
      const dirX = dx / len;
      const dirY = dy / len;
      const maxL = 2000; // Suficiente para salir del canvas
      
      drawSegment(startX, startY, startX + dirX * maxL, startY + dirY * maxL, color, dashed);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Eje Óptico (y = 0)
      drawSegment(-canvas.width/2, 0, canvas.width/2, 0, "#95a5a6");

      // 2. Espejo Plano en x = 0
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2c3e50";
      ctx.beginPath();
      ctx.moveTo(cx(0), cy(-180));
      ctx.lineTo(cx(0), cy(180));
      ctx.stroke();

      // Vértice (0,0)
      ctx.fillStyle = "#2c3e50";
      ctx.beginPath(); ctx.arc(cx(0), cy(0), 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "14px sans-serif";
      ctx.fillText("V", cx(0) - 15, cy(0) - 10);

      // 3. Objeto (Flecha en x0)
      ctx.beginPath();
      ctx.moveTo(cx(objX), cy(0));
      ctx.lineTo(cx(objX), cy(objY));
      ctx.strokeStyle = "#2980b9";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Punta de la flecha
      const headLen = 10;
      const angObj = objY > 0 ? Math.PI/2 : -Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(cx(objX), cy(objY));
      ctx.lineTo(cx(objX) - headLen * Math.cos(angObj - Math.PI / 6), cy(objY) + headLen * Math.sin(angObj - Math.PI / 6));
      ctx.lineTo(cx(objX) - headLen * Math.cos(angObj + Math.PI / 6), cy(objY) + headLen * Math.sin(angObj + Math.PI / 6));
      ctx.fillStyle = "#2980b9"; ctx.fill();

      // Handler (Punto arrastrable)
      ctx.beginPath(); ctx.arc(cx(objX), cy(objY), 7, 0, Math.PI * 2);
      ctx.fillStyle = "#e67e22"; ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.stroke();
      
      ctx.fillStyle = "#2980b9"; ctx.font = "bold 13px sans-serif";
      ctx.fillText("Objeto", cx(objX) - 22, cy(0) + (objY > 0 ? 20 : -10));

      // 4. Geometría de Rayos
      const modo = selRayos.value;
      const showRef = chkRef.checked;
      const showProy = chkProy.checked;
      const imgX = -objX; // Posición virtual x
      const imgY = objY;  // Posición virtual y

      if (modo === "multiples") {
        const a = 30; // Distancia de separación
        const targetsY = [objY + 2*a, objY + a, objY - a, objY - 2*a];
        
        targetsY.forEach(ty => {
          // Incidente: de (x0, y0) a (0, ty)
          drawSegment(objX, objY, 0, ty, "#d35400");
          
          if (showRef) {
            // Reflejado: desde (0, ty) pasando por (x0, y0 + 2*(ty - y0))
            const refY = objY + 2 * (ty - objY);
            drawRay(0, ty, objX, refY, "#c0392b");
          }
          if (showProy) {
            // Proyectado: desde (0, ty) pasando por (-x0, y0)
            drawRay(0, ty, imgX, imgY, "#7f8c8d", true);
          }
        });

      } else if (modo === "notables") {
        // --- Rayo 1: Paralelo al eje óptico ---
        // Incidente: (x0, y0) a (0, y0)
        drawSegment(objX, objY, 0, objY, "#d35400");
        if (showRef) {
          // Rebote: de (0, y0) hacia (x0, y0)
          drawRay(0, objY, objX, objY, "#c0392b");
        }
        if (showProy) {
          // Proyección: de (0, y0) hacia (-x0, y0)
          drawRay(0, objY, imgX, objY, "#7f8c8d", true);
        }

        // --- Rayo 2: Al Vértice ---
        // Incidente: (x0, y0) a (0, 0)
        drawSegment(objX, objY, 0, 0, "#d35400");
        if (showRef) {
          // Rebote: de (0, 0) hacia (x0, -y0)
          drawRay(0, 0, objX, -objY, "#c0392b");
        }
        if (showProy) {
          // Proyección: de (0, 0) hacia (-x0, y0)
          drawRay(0, 0, imgX, imgY, "#7f8c8d", true);
        }
      }

      // Dibujar la Imagen Virtual (Opcional, ayuda a la visualización)
      if (showProy) {
        ctx.beginPath();
        ctx.moveTo(cx(imgX), cy(0));
        ctx.lineTo(cx(imgX), cy(imgY));
        ctx.strokeStyle = "rgba(127, 140, 141, 0.5)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };

    draw();
  }
}

customElements.define("simulador-espejos", SimuladorEspejos);
