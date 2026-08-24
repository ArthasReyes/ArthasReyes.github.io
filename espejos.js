class SimuladorEspejos extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="font-family: system-ui, sans-serif; max-width: 750px; margin: auto; text-align: center; color: #333;">
        <div style="display: flex; gap: 15px; justify-content: center; align-items: center; flex-wrap: wrap; margin-bottom: 12px; font-size: 14px; background: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #e9ecef;">
          <label style="display: flex; align-items: center; gap: 4px;">
            <b>Espejo:</b>
            <select id="tipoEspejo" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc;">
              <option value="plano">Plano</option>
              <option value="concavo">Esférico Cóncavo</option>
              <option value="convexo">Esférico Convexo</option>
            </select>
          </label>

          <label style="display: flex; align-items: center; gap: 4px;">
            <b>Rayos:</b>
            <select id="tipoRayos" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc;">
              <option value="notables">2 Rayos Notables</option>
              <option value="multiples">4 Rayos Múltiples</option>
            </select>
          </label>

          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <input type="checkbox" id="chkReflejados" checked /> Rayos Reflejados
          </label>

          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <input type="checkbox" id="chkProyectados" checked /> Proyecciones
          </label>
        </div>

        <canvas width="750" height="400" style="border: 1px solid #ccc; border-radius: 8px; background-color: #ffffff; cursor: default;"></canvas>
      </div>
    `;

    const canvas = this.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const selEspejo = this.querySelector("#tipoEspejo");
    const selRayos = this.querySelector("#tipoRayos");
    const chkRef = this.querySelector("#chkReflejados");
    const chkProy = this.querySelector("#chkProyectados");

    // Parámetros geométricos exactos
    const V = { x: 500, y: 200 }; // Vértice
    const R = 300;                // Radio de curvatura grande para minimizar aberración esférica visual
    const espejoAlto = 160;       // Límite vertical de dibujo del espejo (desde el vértice)

    // Estado del Objeto
    let objX = 220;
    let objY = 100;
    let isDragging = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    canvas.addEventListener("mousedown", (e) => {
      const pos = getPos(e);
      if (Math.hypot(pos.x - objX, pos.y - objY) <= 12) isDragging = true;
    });

    canvas.addEventListener("mousemove", (e) => {
      const pos = getPos(e);
      canvas.style.cursor = Math.hypot(pos.x - objX, pos.y - objY) <= 12 || isDragging ? "pointer" : "default";

      if (isDragging) {
        // Limitar la posición del objeto al lado izquierdo del espejo
        objX = Math.min(Math.max(pos.x, 30), V.x - 20);
        objY = Math.min(Math.max(pos.y, 30), canvas.height - 30);
        draw();
      }
    });

    window.addEventListener("mouseup", () => { isDragging = false; });
    [selEspejo, selRayos, chkRef, chkProy].forEach(el => el.addEventListener("change", () => draw()));

    const drawRay = (x1, y1, x2, y2, color, dashed = false) => {
      ctx.beginPath();
      ctx.setLineDash(dashed ? [6, 6] : []);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Función matemática para intersectar un rayo con el espejo (plano o círculo)
    const getIntersectionAndNormal = (O, dir, tipo) => {
      if (tipo === "plano") {
        if (dir.x === 0) return null;
        const t = (V.x - O.x) / dir.x;
        const M = { x: V.x, y: O.y + t * dir.y };
        return { M, n: { x: -1, y: 0 } }; // Normal siempre apunta a la izquierda
      } 
      
      // Espejo Esférico
      const isConcavo = tipo === "concavo";
      const C = { x: isConcavo ? V.x - R : V.x + R, y: V.y }; // Centro de curvatura
      
      const dx = O.x - C.x;
      const dy = O.y - C.y;
      
      const a = dir.x * dir.x + dir.y * dir.y;
      const b = 2 * (dir.x * dx + dir.y * dy);
      const c = dx * dx + dy * dy - R * R;
      const disc = b * b - 4 * a * c;

      if (disc < 0) return null; // No choca

      const t1 = (-b - Math.sqrt(disc)) / (2 * a);
      const t2 = (-b + Math.sqrt(disc)) / (2 * a);

      // Evaluar ambas intersecciones y elegir la que está en el arco del espejo (cerca al Vértice)
      const M1 = { x: O.x + t1 * dir.x, y: O.y + t1 * dir.y };
      const M2 = { x: O.x + t2 * dir.x, y: O.y + t2 * dir.y };

      const d1 = t1 > 0.001 ? Math.hypot(M1.x - V.x, M1.y - V.y) : Infinity;
      const d2 = t2 > 0.001 ? Math.hypot(M2.x - V.x, M2.y - V.y) : Infinity;

      if (d1 === Infinity && d2 === Infinity) return null;

      const M = (d1 < d2) ? M1 : M2;
      
      // Calcular vector Normal en el punto de intersección
      // Cóncavo: la cara pulida está a la derecha del centro (normal apunta de la curva hacia el centro)
      // Convexo: la cara pulida está a la izquierda del centro (normal apunta del centro hacia afuera)
      const distMC = Math.hypot(M.x - C.x, M.y - C.y);
      let n = isConcavo 
        ? { x: (C.x - M.x) / distMC, y: (C.y - M.y) / distMC }
        : { x: (M.x - C.x) / distMC, y: (M.y - C.y) / distMC };

      return { M, n };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const tipo = selEspejo.value;
      const modoRayos = selRayos.value;

      // 1. Eje Óptico
      drawRay(0, V.y, canvas.width, V.y, "#95a5a6");

      // Centros C y F para la geometría esférica
      const isConcavo = tipo === "concavo";
      const C = tipo === "plano" ? null : { x: isConcavo ? V.x - R : V.x + R, y: V.y };
      const F = tipo === "plano" ? null : { x: isConcavo ? V.x - R/2 : V.x + R/2, y: V.y };

      // 2. Dibujar Espejo Físico
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#2c3e50";
      ctx.beginPath();
      if (tipo === "plano") {
        ctx.moveTo(V.x, V.y - espejoAlto);
        ctx.lineTo(V.x, V.y + espejoAlto);
      } else {
        const anguloApertura = Math.asin(espejoAlto / R);
        if (isConcavo) {
          // Curva a la derecha del centro
          ctx.arc(C.x, C.y, R, -anguloApertura, anguloApertura);
        } else {
          // Curva a la izquierda del centro
          ctx.arc(C.x, C.y, R, Math.PI - anguloApertura, Math.PI + anguloApertura);
        }
      }
      ctx.stroke();

      // Puntos Notables (C, F, V)
      ctx.fillStyle = "#2c3e50";
      ctx.font = "14px sans-serif";
      
      const drawPoint = (pt, label, offset = 18) => {
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillText(label, pt.x - 4, pt.y + offset);
      };

      drawPoint(V, "V");
      if (tipo !== "plano") {
        drawPoint(F, "F");
        drawPoint(C, "C");
      }

      // 3. Dibujar Objeto
      ctx.beginPath();
      ctx.moveTo(objX, V.y);
      ctx.lineTo(objX, objY);
      ctx.strokeStyle = "#2980b9";
      ctx.lineWidth = 3;
      ctx.stroke();

      const headLen = 10;
      const angleObj = Math.atan2(objY - V.y, 0);
      ctx.beginPath();
      ctx.moveTo(objX, objY);
      ctx.lineTo(objX - headLen * Math.sin(angleObj - Math.PI / 6), objY - headLen * Math.cos(angleObj - Math.PI / 6));
      ctx.lineTo(objX - headLen * Math.sin(angleObj + Math.PI / 6), objY - headLen * Math.cos(angleObj + Math.PI / 6));
      ctx.fillStyle = "#2980b9"; ctx.fill();

      // Handler arrastrable
      ctx.beginPath(); ctx.arc(objX, objY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#e67e22"; ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#2980b9"; ctx.font = "bold 13px sans-serif";
      ctx.fillText("Objeto", objX - 22, V.y + (objY < V.y ? 18 : -10));

      // 4. Configurar Vectores Directores de Rayos Incidentes
      const O = { x: objX, y: objY };
      const direcciones = [];

      if (modoRayos === "notables") {
        // Rayo 1: Paralelo al eje óptico (dir.y = 0)
        direcciones.push({ x: 1, y: 0 });
        
        // Rayo 2: Hacia el vértice V
        const dx = V.x - O.x;
        const dy = V.y - O.y;
        const len = Math.hypot(dx, dy);
        direcciones.push({ x: dx / len, y: dy / len });
      } else {
        // 4 Rayos apuntando a diferentes alturas del espejo
        const targetsY = [V.y - 120, V.y - 40, V.y + 40, V.y + 120];
        targetsY.forEach(ty => {
          const dx = V.x - O.x;
          const dy = ty - O.y;
          const len = Math.hypot(dx, dy);
          direcciones.push({ x: dx / len, y: dy / len });
        });
      }

      // 5. Motor de Trazado de Rayos (Reflexión Física)
      direcciones.forEach(dir => {
        const hit = getIntersectionAndNormal(O, dir, tipo);
        
        // Si el rayo impacta fuera de la altura física dibujada del espejo, lo descartamos visualmente
        if (!hit || Math.abs(hit.M.y - V.y) > espejoAlto) return;

        const { M, n } = hit;

        // Vector Incidente hacia la normal
        // Ley de reflexión vectorial: R = D - 2(D·n)n
        const dot = dir.x * n.x + dir.y * n.y;
        const reflejado = {
          x: dir.x - 2 * dot * n.x,
          y: dir.y - 2 * dot * n.y
        };

        // Dibujar Rayo Incidente (Naranja)
        drawRay(O.x, O.y, M.x, M.y, "#d35400");

        // Dibujar Rayo Reflejado Real (Rojo - rebota hacia la izquierda)
        if (chkRef.checked) {
          // Proyectamos lejos en la dirección reflejada
          const destX = M.x + reflejado.x * 2000;
          const destY = M.y + reflejado.y * 2000;
          drawRay(M.x, M.y, destX, destY, "#c0392b");
        }

        // Dibujar Proyección Virtual (Gris punteado - se proyecta hacia la derecha del espejo)
        if (chkProy.checked) {
          // La proyección va en dirección contraria al reflejado (-reflejado)
          const projX = M.x - reflejado.x * 2000;
          const projY = M.y - reflejado.y * 2000;
          
          // Solo dibujar la línea punteada hacia el lado "virtual" (x > M.x)
          // Usamos clip() para asegurar que la línea punteada solo exista "detrás" del espejo
          ctx.save();
          ctx.beginPath();
          ctx.rect(V.x, 0, canvas.width - V.x, canvas.height); // Solo permitimos dibujo a la derecha del vértice
          ctx.clip();
          drawRay(M.x, M.y, projX, projY, "#7f8c8d", true);
          ctx.restore();
        }
      });
    };

    draw();
  }
}

customElements.define("simulador-espejos", SimuladorEspejos);
