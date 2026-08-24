class SimuladorEspejos extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 700px; margin: auto; text-align: center; color: #333;">
        <div style="display: flex; gap: 12px; justify-content: center; align-items: center; flex-wrap: wrap; margin-bottom: 12px; font-size: 14px; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e9ecef;">
          <label style="display: flex; align-items: center; gap: 4px;">
            <b>Tipo:</b>
            <select id="tipoEspejo" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc;">
              <option value="plano">Plano</option>
              <option value="concavo">Esférico Cóncavo</option>
              <option value="convexo">Esférico Convexo</option>
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
            <input type="checkbox" id="chkReflejados" checked /> Rayos Reflejados
          </label>

          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <input type="checkbox" id="chkProyectados" checked /> Proyecciones
          </label>
        </div>

        <canvas width="650" height="350" style="border: 1px solid #ccc; border-radius: 8px; background-color: #ffffff; cursor: default;"></canvas>
      </div>
    `;

    const canvas = this.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const selEspejo = this.querySelector("#tipoEspejo");
    const selRayos = this.querySelector("#tipoRayos");
    const chkRef = this.querySelector("#chkReflejados");
    const chkProy = this.querySelector("#chkProyectados");

    // Parámetros ópticos
    const V = { x: 420, y: 175 }; // Vértice del espejo
    const R = 160;                 // Radio de curvatura
    const f = R / 2;               // Distancia focal

    // Estado del Objeto
    let objX = 220;
    let objY = 95; // Y del extremo (punta) de la flecha
    let isDragging = false;

    // Métodos de interacción drag & drop
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener("mousedown", (e) => {
      const pos = getPos(e);
      const dist = Math.hypot(pos.x - objX, pos.y - objY);
      if (dist <= 10) isDragging = true;
    });

    canvas.addEventListener("mousemove", (e) => {
      const pos = getPos(e);
      const dist = Math.hypot(pos.x - objX, pos.y - objY);
      canvas.style.cursor = dist <= 10 || isDragging ? "pointer" : "default";

      if (isDragging) {
        objX = Math.min(Math.max(pos.x, 30), V.x - 5);
        objY = Math.min(Math.max(pos.y, 25), canvas.height - 25);
        draw();
      }
    });

    window.addEventListener("mouseup", () => { isDragging = false; });

    [selEspejo, selRayos, chkRef, chkProy].forEach(el => el.addEventListener("change", () => draw()));

    const drawRay = (x1, y1, x2, y2, color = "#e74c3c", dashed = false) => {
      ctx.beginPath();
      ctx.setLineDash(dashed ? [5, 5] : []);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tipo = selEspejo.value;
      const modoRayos = selRayos.value;
      const showRef = chkRef.checked;
      const showProy = chkProy.checked;

      // Centros focales según tipo
      const C = { x: tipo === "convexo" ? V.x + R : V.x - R, y: V.y };
      const F = { x: tipo === "convexo" ? V.x + f : V.x - f, y: V.y };

      // 1. Eje óptico
      drawRay(0, V.y, canvas.width, V.y, "#95a5a6");

      // 2. Dibujar Espejo
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#2c3e50";
      ctx.beginPath();
      if (tipo === "plano") {
        ctx.moveTo(V.x, 25);
        ctx.lineTo(V.x, canvas.height - 25);
      } else {
        const startAngle = tipo === "concavo" ? Math.PI * 0.75 : Math.PI * 0.25;
        const endAngle = tipo === "concavo" ? Math.PI * 1.25 : Math.PI * 0.75;
        ctx.arc(C.x, C.y, R, startAngle, endAngle, tipo === "convexo");
      }
      ctx.stroke();

      // Puntos F y C (si es esférico)
      if (tipo !== "plano") {
        [C, F, V].forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#2c3e50";
          ctx.fill();
          ctx.font = "12px sans-serif";
          ctx.fillText(["C", "F", "V"][i], p.x - 4, p.y + 18);
        });
      } else {
        ctx.beginPath();
        ctx.arc(V.x, V.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#2c3e50";
        ctx.fill();
        ctx.font = "12px sans-serif";
        ctx.fillText("V", V.x - 4, V.y + 18);
      }

      // 3. Dibujar Objeto (Flecha con control en la punta)
      ctx.beginPath();
      ctx.moveTo(objX, V.y);
      ctx.lineTo(objX, objY);
      ctx.strokeStyle = "#2980b9";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Cabeza de la flecha
      const headLen = 8;
      const angle = Math.atan2(objY - V.y, 0);
      ctx.beginPath();
      ctx.moveTo(objX, objY);
      ctx.lineTo(objX - headLen * Math.sin(angle - Math.PI / 6), objY - headLen * Math.cos(angle - Math.PI / 6));
      ctx.lineTo(objX - headLen * Math.sin(angle + Math.PI / 6), objY - headLen * Math.cos(angle + Math.PI / 6));
      ctx.fillStyle = "#2980b9";
      ctx.fill();

      // Punto arrastrable
      ctx.beginPath();
      ctx.arc(objX, objY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#e67e22";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#2980b9";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("Objeto", objX - 18, V.y + (objY < V.y ? 15 : -8));

      // 4. Trazado de Rayos
      const incidentes = [];

      if (modoRayos === "notables") {
        // Rayo 1: Paralelo al eje óptico
        incidentes.push({ targetY: objY, type: "paralelo" });
        // Rayo 2: Dirigido al Vértice
        incidentes.push({ targetY: V.y, type: "vertice" });
      } else {
        // 4 haces en abanico
        const angles = [-0.3, -0.1, 0.1, 0.3];
        angles.forEach(ang => {
          const targetY = objY + Math.tan(ang) * (V.x - objX);
          incidentes.push({ targetY: targetY, type: "angular" });
        });
      }

      incidentes.forEach(ray => {
        // Rayo Incidente (Punta objeto al espejo)
        drawRay(objX, objY, V.x, ray.targetY, "#d35400");

        // Cálculo de reflexiones
        let tanRef, incY = ray.targetY;

        if (tipo === "plano") {
          tanRef = (V.y - objY) / (V.x - objX);
          if (ray.type === "paralelo") tanRef = 0;

          // Rayo reflejado
          if (showRef) drawRay(V.x, incY, 0, incY - tanRef * V.x, "#c0392b");
          // Proyección
          if (showProy) drawRay(V.x, incY, canvas.width, incY + tanRef * (canvas.width - V.x), "#7f8c8d", true);

        } else {
          // Aproximación paraxial para espejos esféricos
          const d_o = V.x - objX;
          const h = V.y - objY;
          const d_i = (d_o * f) / (d_o - (tipo === "concavo" ? f : -f));
          const h_i = -h * (d_i / d_o);

          const imgX = tipo === "concavo" ? V.x - d_i : V.x + d_i;
          const imgY = V.y - h_i;

          if (showRef) {
            const dirX = tipo === "concavo" && d_o > f ? -1 : 1;
            const slope = (imgY - incY) / (imgX - V.x);
            const destX = V.x + dirX * 400;
            const destY = incY + slope * (destX - V.x);
            drawRay(V.x, incY, destX, destY, "#c0392b");
          }

          if (showProy) {
            drawRay(V.x, incY, imgX, imgY, "#7f8c8d", true);
          }
        }
      });
    };

    draw();
  }
}

customElements.define("simulador-espejos", SimuladorEspejos);
