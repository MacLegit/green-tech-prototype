
let classifier;
let map;
let mapInitialized = false;

window.addEventListener("load", async () => {
  classifier = await ml5.imageClassifier("MobileNet");
  console.log("Modelo carregado!");

  initChart();

  const inputImg = document.getElementById("inputImg");
  const btnClassify = document.getElementById("btn-classify");
  const btnRemover = document.getElementById("btn-remover");

  btnClassify.disabled = true;

  inputImg.addEventListener("change", evt => {
    const file = evt.target.files[0];
    if (!file) return;
    const img = document.getElementById("plantImg");
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      btnClassify.disabled = false;
      btnRemover.style.display = "inline-block";
    };
  });

  btnClassify.addEventListener("click", classifyImage);

  btnRemover.addEventListener("click", () => {
    document.getElementById("plantImg").src = "";
    inputImg.value = "";
    btnClassify.disabled = true;
    btnRemover.style.display = "none";
    document.getElementById("result").innerText = "";
    document.getElementById("dados-planta").style.display = "none";
  });
});

function navigate(sectionId) {
  document.querySelectorAll("main section").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById(sectionId);
  if (target) target.classList.add("active");

  if (sectionId === "mapa") {
    if (!mapInitialized) {
      initMapa();
      mapInitialized = true;
    } else {
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }
}

async function classifyImage() {
  const image = document.getElementById("plantImg");
  if (!image.src || image.naturalWidth === 0) {
    alert("Por favor, selecione uma imagem.");
    return;
  }

  try {
    const results = await classifier.classify(image);
    console.log(results);

    const label = results[0].label;
    const confidence = results[0].confidence;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `🌿 Planta detectada: <strong>${label}</strong><br>
      🔎 Confiança: ${(confidence * 100).toFixed(2)}%`;

    if (
      !label.toLowerCase().includes("plant") &&
      !label.toLowerCase().match(/leaf|tree|flower|flora|cactus/)
    ) {
      resultDiv.innerHTML += `<br><small>⚠️ Este modelo pode identificar objetos além de plantas.</small>`;
    }

    const labelLower = label.toLowerCase();

    const plantasInfo = {
      cactus: {
        nomeCientifico: "Cactaceae",
        consumoAgua: "Baixo",
        capturaCO2: "Alta",
        pragasComuns: ["Cochonilha", "Ácaros"],
        imgDoencas: ["cochonilha.jpg", "acaros.jpg"]
      }
    };

    const match = Object.keys(plantasInfo).find(p => labelLower.includes(p));
    const info = plantasInfo[match];

    if (info) {
      document.getElementById("nomeCientifico").innerText = info.nomeCientifico;
      document.getElementById("agua").innerText = info.consumoAgua;
      document.getElementById("co2").innerText = info.capturaCO2;
      document.getElementById("pragas").innerText = info.pragasComuns.join(", ");

      const container = document.getElementById("imgsDoencas");
      container.innerHTML = "";
      info.imgDoencas.forEach(img => {
        const el = document.createElement("img");
        el.src = `assets/doencas/${img}`;
        el.style.width = "100px";
        el.style.marginRight = "5px";
        container.appendChild(el);
      });

      document.getElementById("dados-planta").style.display = "block";
    } else {
      document.getElementById("dados-planta").style.display = "none";
    }

  } catch (err) {
    console.error("Erro na classificação:", err);
    alert("Erro na classificação da imagem.");
  }
}

async function initMapa() {
  map = L.map("map").setView([-15.77972, -47.92972], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  const pontos = [
    { lat: -15.8, lng: -47.9, cobertura: 80 },
    { lat: -15.7, lng: -48.0, cobertura: 60 }
  ];

  pontos.forEach(p => {
    L.circle([p.lat, p.lng], {
      radius: 5000,
      color: p.cobertura > 70 ? "green" : "orange",
      fillOpacity: 0.4
    }).addTo(map).bindPopup(`Cobertura vegetal: ${p.cobertura}%`);
  });

  map.locate({ setView: true, maxZoom: 10 });
  map.on("locationfound", e => {
    L.marker(e.latlng).addTo(map).bindPopup("📍 Você está aqui!");
  });
}

function initChart() {
  const ctx = document.getElementById("climateChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
      datasets: [
        {
          label: "Temperatura (°C)",
          data: [26, 26, 25, 23, 21, 20, 20, 22, 24, 26, 27, 28],
          borderColor: "red",
          backgroundColor: "rgba(255,0,0,0.1)",
          yAxisID: "y-temp"
        },
        {
          label: "Umidade (%)",
          data: [80, 79, 77, 75, 72, 70, 65, 60, 63, 68, 75, 78],
          borderColor: "blue",
          backgroundColor: "rgba(0,0,255,0.1)",
          yAxisID: "y-umi"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        "y-temp": {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Temperatura (°C)"
          }
        },
        "y-umi": {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "Umidade (%)"
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}
