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
        
        const btnStyle = "background: white; color: #e06666; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 20px; font-weight: bold;";
        
        // Botón de Play / Pausa
        const playPauseBtn = document.createElement("button");
        playPauseBtn.innerHTML = "▶"; // Start icon
        playPauseBtn.style.cssText = btnStyle;
        
        // Botón de Reinicio
        const resetBtn = document.createElement("button");
        resetBtn.innerHTML = "↺"; // Reset icon
        resetBtn.style.cssText = btnStyle;
        
        const updateTimer = () => {
            if (currentSeconds > 0) {
                currentSeconds--;
                timeDisplay.textContent = formatTime(currentSeconds);
            } else {
                clearInterval(interval);
                interval = null;
                playPauseBtn.innerHTML = "▶";
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
        
        timer.appendChild(timeDisplay);
        timer.appendChild(playPauseBtn);
        timer.appendChild(resetBtn);
    });
});
