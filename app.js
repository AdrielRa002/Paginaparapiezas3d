// --- Datos de ejemplo ---
let piezas = [
  {
    id: "conector_v1",
    nombre: "Conector",
    material: "ABS",
    proceso: "CNC",
    equipo: "Bomba de infusión",
    uso: "Unión segura entre circuito de fluido y módulo de bombeo.",
    dimensiones: "50 × 34 × 24 mm",
    formatos: {
      stl: "#", // pon aquí rutas reales si quieres
      step: "#",
      obj: "#",
      pdf: null
    }
  },
  {
    id: "adaptador_v1",
    nombre: "Adaptador",
    material: "ABS",
    proceso: "CNC",
    equipo: "Sistema de ventilación",
    uso: "Adaptación entre diámetros de tubería médica.",
    dimensiones: "40 × 30 × 20 mm",
    formatos: {
      stl: "#",
      step: null,
      obj: null,
      pdf: null
    }
  },
  {
    id: "brida_v1",
    nombre: "Brida",
    material: "ABS",
    proceso: "CNC",
    equipo: "Estructura de soporte",
    uso: "Fijación mecánica de componentes.",
    dimensiones: "60 × 60 × 8 mm",
    formatos: {
      stl: "#",
      step: "#",
      obj: null,
      pdf: "#"
    }
  }
];

let piezaActual = null;
let descargas = [];

// --- Utilidades ---
function seleccionarVista(idVista) {
  const vistas = document.querySelectorAll(".view");
  vistas.forEach(v => v.classList.remove("active"));
  const vista = document.getElementById(idVista);
  if (vista) vista.classList.add("active");
}

function configurarBoton(boton, url, formato) {
  if (url) {
    boton.classList.remove("btn-disabled");
    boton.dataset.url = url;
    boton.dataset.format = formato;
  } else {
    boton.classList.add("btn-disabled");
    delete boton.dataset.url;
    delete boton.dataset.format;
  }
}

// --- Render catálogo ---
function renderPiezas(filtroTexto = "") {
  const cardsContainer = document.getElementById("cardsContainer");
  const piecesCount = document.getElementById("piecesCount");
  const texto = filtroTexto.trim().toLowerCase();

  cardsContainer.innerHTML = "";

  const filtradas = piezas.filter(p =>
    p.nombre.toLowerCase().includes(texto) ||
    p.material.toLowerCase().includes(texto) ||
    p.proceso.toLowerCase().includes(texto) ||
    (p.equipo && p.equipo.toLowerCase().includes(texto))
  );

  filtradas.forEach(pieza => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-thumb">
        <div class="card-thumb-shape"></div>
      </div>
      <div class="card-name">${pieza.nombre}</div>
      <div class="card-meta">Material: ${pieza.material}</div>
      <div class="card-meta">Proceso: ${pieza.proceso}</div>
      <div class="status-pill">Aprobada</div>
    `;
    card.addEventListener("click", () => mostrarDetalle(pieza));
    cardsContainer.appendChild(card);
  });

  piecesCount.textContent =
    filtradas.length + " pieza" + (filtradas.length === 1 ? "" : "s");
}

// --- Detalle ---
function mostrarDetalle(pieza) {
  piezaActual = pieza;

  document.getElementById("detailTitle").textContent = pieza.nombre;
  document.getElementById("detailSubtitle").textContent =
    `Material ${pieza.material} · Proceso ${pieza.proceso}`;
  document.getElementById("detailNameSide").textContent = pieza.nombre;
  document.getElementById("detailMetaSide").textContent =
    `Material: ${pieza.material} · Proceso: ${pieza.proceso}`;
  document.getElementById("detailDims").textContent = pieza.dimensiones;
  document.getElementById("detailEquipo").textContent = pieza.equipo;
  document.getElementById("detailUso").textContent = pieza.uso;

  configurarBoton(document.getElementById("btnStl"), pieza.formatos.stl, "stl");
  configurarBoton(document.getElementById("btnStep"), pieza.formatos.step, "step");
  configurarBoton(document.getElementById("btnObj"), pieza.formatos.obj, "obj");
  configurarBoton(document.getElementById("btnPdf"), pieza.formatos.pdf, "pdf");
}

// --- Historial ---
function registrarDescarga(formato, url) {
  if (!piezaActual) return;
  const ahora = new Date();
  descargas.unshift({
    pieza: piezaActual.nombre,
    formato,
    fecha: ahora.toLocaleDateString(),
    hora: ahora.toLocaleTimeString()
  });
  renderHistorial();
  window.open(url, "_blank");
}

function renderHistorial() {
  const lista = document.getElementById("historyList");
  lista.innerHTML = "";

  if (!descargas.length) {
    lista.innerHTML = `<div class="panel-sub">Sin descargas registradas en esta sesión.</div>`;
    return;
  }

  descargas.forEach(item => {
    const badgeClase =
      item.formato === "stl" ? "badge-stl" :
      item.formato === "step" ? "badge-step" :
      item.formato === "obj" ? "badge-obj" : "badge-pdf";

    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="history-badge ${badgeClase}">${item.formato.toUpperCase()}</div>
      <div>
        <div><strong>${item.pieza}</strong></div>
        <div class="history-meta">Formato ${item.formato.toUpperCase()}</div>
      </div>
      <div class="history-date">${item.fecha} · ${item.hora}</div>
    `;
    lista.appendChild(div);
  });
}

// --- Subir pieza (local) ---
function subirPieza() {
  const nombre = document.getElementById("upName").value.trim();
  const material = document.getElementById("upMaterial").value.trim();
  const proceso = document.getElementById("upProceso").value.trim();
  const equipo = document.getElementById("upEquipo").value.trim();
  const dims = document.getElementById("upDims").value.trim();
  const uso = document.getElementById("upUso").value.trim();
  const formato = document.getElementById("upFormat").value;
  const archivoNombre = document.getElementById("upFile").value.trim();
  const status = document.getElementById("uploadStatus");

  if (!nombre || !archivoNombre) {
    status.textContent = "Nombre y archivo son obligatorios.";
    return;
  }

  const nuevosFormatos = { stl: null, step: null, obj: null, pdf: null };
  nuevosFormatos[formato] = "#";

  const nuevaPieza = {
    id: "p_" + Date.now(),
    nombre,
    material: material || "-",
    proceso: proceso || "-",
    equipo: equipo || "-",
    uso: uso || "-",
    dimensiones: dims || "-",
    formatos: nuevosFormatos
  };

  piezas.unshift(nuevaPieza);
  renderPiezas();
  mostrarDetalle(nuevaPieza);
  status.textContent = "Pieza agregada al catálogo (solo en esta sesión).";
}

// --- Preferencias (solo visual) ---
function initChips() {
  const chips = document.querySelectorAll(".chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });
}

// --- Registro/Login simulados ---
function simularRegistro() {
  const nombre = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const status = document.getElementById("authStatus");

  if (!nombre || !email) {
    status.textContent = "Completa nombre y correo.";
    return;
  }

  document.getElementById("userAvatar").textContent =
    nombre.substring(0, 2).toUpperCase();
  document.getElementById("userLabel").textContent = nombre;
  status.textContent = "Registro simulado correctamente (sin servidor).";
}

function simularLogin() {
  const email = document.getElementById("logEmail").value.trim();
  const status = document.getElementById("authStatus");

  if (!email) {
    status.textContent = "Ingresa un correo.";
    return;
  }

  document.getElementById("userAvatar").textContent =
    email.substring(0, 2).toUpperCase();
  document.getElementById("userLabel").textContent = email;
  status.textContent = "Inicio de sesión simulado.";
}

// --- Inicio ---
document.addEventListener("DOMContentLoaded", () => {
  // Catálogo inicial
  renderPiezas();
  if (piezas.length) mostrarDetalle(piezas[0]);
  renderHistorial();
  initChips();

  // Búsqueda
  document
    .getElementById("searchInput")
    .addEventListener("input", e => renderPiezas(e.target.value));

  // Navegación de vistas
  const navButtons = document.querySelectorAll(".nav button");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      seleccionarVista(btn.dataset.view);
    });
  });

  // Botones de descarga
  ["btnStl", "btnStep", "btnObj", "btnPdf"].forEach(id => {
    const boton = document.getElementById(id);
    boton.addEventListener("click", () => {
      const url = boton.dataset.url;
      const formato = boton.dataset.format;
      if (!url || boton.classList.contains("btn-disabled")) return;
      registrarDescarga(formato, url);
    });
  });

  // Subir pieza
  document.getElementById("btnUpload").addEventListener("click", subirPieza);

  // Preferencias (solo muestra un alert)
  document.getElementById("btnSavePrefs").addEventListener("click", () => {
    const idioma = document.getElementById("prefLanguage").value;
    const activo = document.querySelector(".chip.active").dataset.format;
    alert(`Preferencias simuladas:\nIdioma: ${idioma}\nFormato: ${activo.toUpperCase()}`);
  });

  // Registro/Login/Logout simulados
  document.getElementById("btnRegister").addEventListener("click", simularRegistro);
  document.getElementById("btnLogin").addEventListener("click", simularLogin);
  document.getElementById("btnLogout").addEventListener("click", () => {
    document.getElementById("userAvatar").textContent = "IN";
    document.getElementById("userLabel").textContent = "Invitado · Sin sesión";
  });

  // Borrar historial
  document.getElementById("btnClearHistory").addEventListener("click", () => {
    descargas = [];
    renderHistorial();
  });
});
