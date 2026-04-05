document.addEventListener("DOMContentLoaded", () => {
    const revealContainer = document.querySelector(".reveal");
    const timers = document.querySelectorAll("timer");
    
    timers.forEach((timer, index) => {
        // Encontrar la 'section' a la que pertenece este timer originalmente
        const parentSection = timer.closest('section');
        // Asignar un ID único a la sección si no lo tiene, para poder identificarla en los eventos
        const sectionId = parentSection.id || 'timer-section-' + index;
        parentSection.id = sectionId;

        // Mover el timer fuera de los slides (al contenedor principal de reveal) para que use el mismo espacio de coordenadas que el logo
        revealContainer.appendChild(timer);

        const initialSeconds = parseInt(timer.getAttribute("data-seconds")) || 60;
        let currentSeconds = initialSeconds;
        let interval = null;
        
        // Estilos absolutos relativos a la ventana (igual que el logo)
        timer.style.position = "absolute";
        timer.style.top = "2%"; // Iguala la altura del logo
        timer.style.right = "calc(2% + 90px)"; // Se sitúa justo a la izquierda del logo
        timer.style.backgroundColor = "#e06666"; 
        timer.style.color = "white";
        timer.style.padding = "5px 15px";
        timer.style.borderRadius = "8px";
        timer.style.fontSize = "24px";
        timer.style.fontFamily = "monospace";
        timer.style.display = "none"; // Oculto por defecto
        timer.style.alignItems = "center";
        timer.style.gap = "10px";
        timer.style.zIndex = "9999"; // Igual que el logo
        timer.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";

        const timeDisplay = document.createElement("span");
        timeDisplay.style.minWidth = "70px";
        timeDisplay.style.textAlign = "center";
        timeDisplay.style.fontWeight = "bold";
        
        const formatTime = (secs) => {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = (secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };
        
        timeDisplay.textContent = formatTime(currentSeconds);
        
        const btnStyle = "background: white; color: #e06666; border: none; padding: 2px; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold; width: 20px; height: 18px;";
        
        const btnsContainer = document.createElement("div");
        btnsContainer.style.display = "grid";
        btnsContainer.style.gridTemplateColumns = "1fr 1fr";
        btnsContainer.style.gap = "4px";

        const playPauseBtn = document.createElement("button");
        playPauseBtn.innerHTML = "▶"; 
        playPauseBtn.style.cssText = btnStyle;
        
        const resetBtn = document.createElement("button");
        resetBtn.innerHTML = "↺"; 
        resetBtn.style.cssText = btnStyle;
        
        const stopBtn = document.createElement("button");
        stopBtn.innerHTML = "⏹"; 
        stopBtn.style.cssText = btnStyle;

        const addTimeBtn = document.createElement("button");
        addTimeBtn.innerHTML = "+30"; 
        addTimeBtn.style.cssText = btnStyle;
        addTimeBtn.style.fontSize = "9px";
        
        const playBeep = () => {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const playSound = (startTime) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, startTime);
                gain.gain.setValueAtTime(0.5, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                osc.start(startTime);
                osc.stop(startTime + 0.3);
            };
            for (let i = 0; i < 5; i++) {
                playSound(ctx.currentTime + (i * 0.4));
            }
        };
        
        const updateTimer = () => {
            if (currentSeconds > 0) {
                currentSeconds--;
                timeDisplay.textContent = formatTime(currentSeconds);
            } else {
                clearInterval(interval);
                interval = null;
                playPauseBtn.innerHTML = "▶";
                playBeep();
            }
        };
        
        playPauseBtn.addEventListener("click", () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
                playPauseBtn.innerHTML = "▶";
            } else {
                if (currentSeconds === 0) currentSeconds = initialSeconds;
                interval = setInterval(updateTimer, 1000);
                playPauseBtn.innerHTML = "⏸"; 
            }
        });
        
        resetBtn.addEventListener("click", () => {
            clearInterval(interval);
            interval = null;
            currentSeconds = initialSeconds;
            timeDisplay.textContent = formatTime(currentSeconds);
            playPauseBtn.innerHTML = "▶";
        });

        stopBtn.addEventListener("click", () => {
            currentSeconds = 2;
            timeDisplay.textContent = formatTime(currentSeconds);
            if (!interval) { 
                interval = setInterval(updateTimer, 1000);
                playPauseBtn.innerHTML = "⏸"; 
            }
        });

        addTimeBtn.addEventListener("click", () => {
            currentSeconds += 30;
            timeDisplay.textContent = formatTime(currentSeconds);
        });
        
        btnsContainer.appendChild(playPauseBtn);
        btnsContainer.appendChild(addTimeBtn);
        btnsContainer.appendChild(stopBtn);
        btnsContainer.appendChild(resetBtn);

        timer.appendChild(timeDisplay);
        timer.appendChild(btnsContainer);

        // Lógica para mostrar/ocultar el timer según la diapositiva activa
        if (typeof Reveal !== 'undefined') {
            Reveal.on('slidechanged', event => {
                if (event.currentSlide.id === sectionId) {
                    timer.style.display = "flex";
                } else {
                    timer.style.display = "none";
                }
            });
            // Comprobación inicial al cargar si estamos en esa misma diapositiva
            if (Reveal.getCurrentSlide() && Reveal.getCurrentSlide().id === sectionId) {
                timer.style.display = "flex";
            }
        }
    });
});

