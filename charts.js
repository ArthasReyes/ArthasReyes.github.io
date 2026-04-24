class ChartPie extends HTMLElement {
  connectedCallback() {
    // Crear canvas
    const canvas = document.createElement("canvas");
    this.appendChild(canvas);

    // Contenedor flexible
    this.style.display = "block";
    this.style.width = "100%";
    this.style.height = "60vh";
    this.style.maxHeight = "500px";

    const ctx = canvas.getContext("2d");

    // Parsear datos
    const labels = JSON.parse(this.getAttribute("data-labels") || "[]");
    const values = JSON.parse(this.getAttribute("data-values") || "[]");

    // Crear gráfico
    this.chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: values
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Fix Reveal (cuando la slide aparece)
    if (typeof Reveal !== "undefined") {
      Reveal.on("slidechanged", event => {
        if (this.offsetParent !== null) {
          this.chart.resize();
        }
      });
    }
  }
}

customElements.define("chart-pie", ChartPie);

class ChartBar extends HTMLElement {
  connectedCallback() {
    const canvas = document.createElement("canvas");
    this.appendChild(canvas);

    // Estilo contenedor
    this.style.display = "block";
    this.style.width = "100%";
    this.style.height = "60vh";
    this.style.maxHeight = "500px";

    const ctx = canvas.getContext("2d");

    const labels = JSON.parse(this.getAttribute("data-labels") || "[]");
    const values = JSON.parse(this.getAttribute("data-values") || "[]");

    const createChart = () => {
      if (this.chart) return;

      this.chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: [
        "#3366cc", "#dc3912", "#ff9900",
        "#109618", "#990099", "#0099c6"
      ]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});
    };

    // Fix Reveal
    if (typeof Reveal !== "undefined") {
      Reveal.on("slidechanged", event => {
        if (event.currentSlide.contains(this)) {
          createChart();
          this.chart.resize();
        }
      });

      // inicial
      setTimeout(() => {
        if (this.offsetParent !== null) createChart();
      }, 100);
    } else {
      createChart();
    }
  }
}

customElements.define("chart-bar", ChartBar);