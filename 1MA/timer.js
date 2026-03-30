document.addEventListener("DOMContentLoaded", () => {
    const timers = document.querySelectorAll("timer");
    
    timers.forEach(timer => {
        const initialSeconds = parseInt(timer.getAttribute("data-seconds")) || 60;
        let currentSeconds = initialSeconds;
        let interval = null;
        
        // Estilos para el contenedor del temporizador
        timer.style.position = "absolute";
        timer.style.top = "0px";
        timer.style.right = "0px";
        timer.style.backgroundColor = "#e06666"; // Rojo pálido como el de los ejercicios
        timer.style.color = "white";
        timer.style.padding = "10px 20px";
        timer.style.borderRadius = "10px";
        timer.style.fontSize = "30px";
        timer.style.fontFamily = "monospace";
        timer.style.display = "flex";
        timer.style.alignItems = "center";
        timer.style.gap = "15px";
        timer.style.zIndex = "100";
        timer.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";

        const timeDisplay = document.createElement("span");
        timeDisplay.style.minWidth = "90px";
        timeDisplay.style.textAlign = "center";
        timeDisplay.style.fontWeight = "bold";
        
        const formatTime = (secs) => {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = (secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };
        
        timeDisplay.textContent = formatTime(currentSeconds);
        
        const btnStyle = "background: white; color: #e06666; border: none; padding: 0px 0px; border-radius: 3px; cursor: pointer; font-size: 12px; font-weight: bold; width: 24px; height: 20px;";
        
        // Contenedor para la matriz 2x2
        const btnsContainer = document.createElement("div");
        btnsContainer.style.display = "grid";
        btnsContainer.style.gridTemplateColumns = "1fr 1fr";
        btnsContainer.style.gap = "5px";

        // Botón de Play / Pausa
        const playPauseBtn = document.createElement("button");
        playPauseBtn.innerHTML = "▶"; // Start icon
        playPauseBtn.style.cssText = btnStyle;
        
        // Botón de Reinicio
        const resetBtn = document.createElement("button");
        resetBtn.innerHTML = "↺"; // Reset icon
        resetBtn.style.cssText = btnStyle;
        
        // Botón Stop (pasa a 2s)
        const stopBtn = document.createElement("button");
        stopBtn.innerHTML = "⏹"; // Stop icon
        stopBtn.style.cssText = btnStyle;

        // Botón +30s
        const addTimeBtn = document.createElement("button");
        addTimeBtn.innerHTML = "+30s"; 
        addTimeBtn.style.cssText = btnStyle;
        addTimeBtn.style.fontSize = "10px"; // Un poco más pequeño para que quepa bien el texto
        
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

            // Programar 5 beeps espaciados
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
                // Pausar
                clearInterval(interval);
                interval = null;
                playPauseBtn.innerHTML = "▶";
            } else {
                // Iniciar/Reanudar
                if (currentSeconds === 0) currentSeconds = initialSeconds;
                interval = setInterval(updateTimer, 1000);
                playPauseBtn.innerHTML = "⏸"; // Pause icon
            }
        });
        
        resetBtn.addEventListener("click", () => {
            // Reiniciar
            clearInterval(interval);
            interval = null;
            currentSeconds = initialSeconds;
            timeDisplay.textContent = formatTime(currentSeconds);
            playPauseBtn.innerHTML = "▶";
        });

        stopBtn.addEventListener("click", () => {
            currentSeconds = 2;
            timeDisplay.textContent = formatTime(currentSeconds);
            if (!interval) { // Si estaba pausado, lo reanuda para que los 2s sigan corriendo
                interval = setInterval(updateTimer, 1000);
                playPauseBtn.innerHTML = "⏸"; // Pause icon
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
    });
});
