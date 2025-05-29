let pantalla = document.getElementById("pantalla");
let botones = document.querySelectorAll(".botones button");
let ultimoResultado = null;
let modoRadianes = true;
let dialogoActual = null;

let modoInverso = false;
let modoHiperbolico = false;

window.agregar = function(valor) {
    if (valor === 'x') {
        const ultimo = pantalla.value.slice(-1);
        if (!isNaN(ultimo) && ultimo !== '') {
            pantalla.value += '*x';
        } else {
            pantalla.value += 'x';
        }
    } else {
        pantalla.value += valor;
    }
};

window.limpiar = function() {
    pantalla.value = "";
};

window.calcular = function() {
    try {
        let expresion = pantalla.value;

        expresion = expresion.replace(/π/g, 'pi');
        expresion = expresion.replace(/√/g, 'sqrt');
        expresion = expresion.replace(/÷/g, '/');
        expresion = expresion.replace(/×/g, '*');

        let resultado;
        if (expresion.includes('x')) {
            const valorX = prompt("Ingresa el valor de x:");
            resultado = math.evaluate(expresion, {
                degToRad: x => x * Math.PI / 180,
                x: parseFloat(valorX)
            });
        } else {
            resultado = math.evaluate(expresion, {
                degToRad: x => x * Math.PI / 180
            });
        }

        pantalla.value = resultado;
        ultimoResultado = resultado;
    } catch (error) {
        pantalla.value = "Error";
    }
};

window.generarRandom = function() {
    let numeroAleatorio = Math.random().toFixed(4);
    pantalla.value = numeroAleatorio;
};

window.usarUltimoResultado = function() {
    if (ultimoResultado !== null) {
        pantalla.value += ultimoResultado;
    }
};

window.cambiarModo = function() {
    modoRadianes = !modoRadianes;
    document.getElementById('modo-indicador').textContent = modoRadianes ? 'Rad' : 'Deg';
};

window.toggleInverso = function() {
    modoInverso = !modoInverso;
};

window.toggleHiperbolico = function() {
    modoHiperbolico = !modoHiperbolico;
};

window.insertarFuncionTrig = function(tipo) {
    let funcion = tipo;

    if (modoHiperbolico) {
        funcion += 'h';
    }

    if (modoInverso) {
        funcion = 'a' + funcion;
    }

    if (!modoRadianes && ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(funcion)) {
        pantalla.value += `${funcion}(degToRad(`;
    } else {
        pantalla.value += `${funcion}(`;
    }
};

window.mostrarMenuIntegrales = function() {
    document.getElementById('menu-integrales').classList.remove('oculto');
    document.body.insertAdjacentHTML('beforeend', '<div class="fondo-modal" onclick="cerrarMenuIntegrales()"></div>');
};

window.cerrarMenuIntegrales = function() {
    document.getElementById('menu-integrales').classList.add('oculto');
    document.querySelector('.fondo-modal')?.remove();
};

window.mostrarIntegralDefinida = function() {
    cerrarMenuIntegrales();

    const funcion = pantalla.value.trim();
    if (!funcion) {
        alert("Primero ingrese una función en la calculadora");
        return;
    }

    const html = `
        <div class="dialogo-integral">
            <h3>Integral Definida</h3>
            <div style="margin-bottom: 15px;">
                <div style="padding: 10px; background: #f5f5f5; border-radius: 8px; margin-bottom: 10px;">
                    ∫ ${funcion} dx
                </div>
            </div>
            <label>Desde:</label>
            <input type="text" id="limite-inferior" placeholder="Ej: 0, pi/2, sqrt(2)">
            
            <label>Hasta:</label>
            <input type="text" id="limite-superior" placeholder="Ej: 1, pi, 2^3">
            
            <div class="botones-dialogo">
                <button onclick="cerrarDialogoIntegral()">Cancelar</button>
                <button onclick="calcularIntegralDefinida('${funcion}')">Calcular</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    document.body.insertAdjacentHTML('beforeend', '<div class="fondo-modal" onclick="cerrarDialogoIntegral()"></div>');
    dialogoActual = document.querySelector('.dialogo-integral');
};

window.calcularIntegralDefinida = function(funcion) {
    try {
        const a = math.evaluate(document.getElementById('limite-inferior').value);
        const b = math.evaluate(document.getElementById('limite-superior').value);

        if (a >= b) {
            throw new Error("El límite inferior debe ser menor al superior");
        }

        const resultado = integralNumerica(funcion, a, b);
        pantalla.value = resultado.toFixed(6);
        cerrarDialogoIntegral();
    } catch (error) {
        alert("Error: " + error.message);
    }
};

window.mostrarIntegralIndefinida = function() {
    cerrarMenuIntegrales();

    const funcion = pantalla.value.trim();
    if (!funcion) {
        alert("Primero ingrese una función en la calculadora");
        return;
    }

    try {
        const integral = calcularIntegralIndefinida(funcion);
        pantalla.value = integral + " + C";
    } catch (error) {
        pantalla.value = "No se pudo calcular";
    }
};

window.cerrarDialogoIntegral = function() {
    dialogoActual?.remove();
    document.querySelector('.fondo-modal')?.remove();
    dialogoActual = null;
};

function integralNumerica(funcion, a, b) {
    let n = 1000;
    let h = (b - a) / n;
    let suma = 0;
    let scope = { x: 0 };

    scope.x = a;
    suma += math.evaluate(funcion, scope);
    scope.x = b;
    suma += math.evaluate(funcion, scope);

    for (let i = 1; i < n; i++) {
        scope.x = a + i * h;
        suma += 2 * math.evaluate(funcion, scope);
    }

    return (h / 2) * suma;
}

function calcularIntegralIndefinida(funcion) {
    const reglas = {
        "x": "(1/2)*x^2",
        "x^2": "(1/3)*x^3",
        "sin(x)": "-cos(x)",
        "cos(x)": "sin(x)",
        "e^x": "e^x",
        "1/x": "ln|x|"
    };

    for (const [exp, integral] of Object.entries(reglas)) {
        if (funcion === exp) return integral;
    }

    throw new Error("No se encontró una regla para esta función");
}
//GUIA
document.addEventListener('DOMContentLoaded', () => {
    const guiaBtn = document.getElementById('guiaBtn');
    const guiaContainer = document.getElementById('guiaContainer');
  
    guiaBtn.addEventListener('click', () => {
      guiaContainer.classList.toggle('oculto');
    });
  
    window.cerrarGuia = function () {
      guiaContainer.classList.add('oculto');
    };
  });
  
function calcular() {
    let expresion = pantalla.value;

    // Reemplazar % por *0.01
    expresion = expresion.replace(/%/g, '*0.01');

    // Convertir log2 y log10 si es necesario
    expresion = expresion
        .replace(/log2\(/g, 'log(')
        .replace(/log10\(/g, 'log(')
        .replace(/log\(([^)]+)\)/g, 'log($1, 2)') // esto solo si usas log2
        .replace(/log\(([^,]+), 10\)/g, 'log10($1)'); // para log10

    try {
        let resultado = math.evaluate(expresion);
        pantalla.value = resultado;
        ultimoResultado = resultado;
    } catch (e) {
        pantalla.value = "Error";
    }
}
function mostrarMenuDerivada() {
    document.getElementById('menu-derivadas').classList.remove('oculto');
}

function cerrarMenuDerivadas() {
    document.getElementById('menu-derivadas').classList.add('oculto');
}

function calcularDerivada() {
    const funcion = document.getElementById('inputFuncionDerivada').value;
    const variable = document.getElementById('inputVariableDerivada').value;

    try {
        const derivada = math.derivative(funcion, variable).toString();
        document.getElementById('pantalla').value = derivada;
        cerrarMenuDerivadas();
    } catch (error) {
        document.getElementById('pantalla').value = "Error en derivada";
    }
}
function agregar(valor) {
  pantalla.value += valor;
}
function graficar() {
    const funcion = pantalla.value.trim();
    if (!funcion.includes('x')) {
      alert("Ingresa una función con 'x'. Ej: x^2 + sin(x)");
      return;
    }
  
    try {
      // Generar datos
      const xValues = [];
      const yValues = [];
      for (let x = -10; x <= 10; x += 0.5) {
        xValues.push(x);
        yValues.push(math.evaluate(funcion, { x }));
      }
  
      // Configuración profesional del gráfico
      const layout = {
        title: {
          text: `Gráfico de: ${funcion}`,
          font: { color: '#f9a825', size: 18 }
        },
        xaxis: {
          title: 'Eje X',
          titlefont: { color: '#eee' },
          tickfont: { color: '#aaa' },
          gridcolor: '#444',
          zerolinecolor: '#666'
        },
        yaxis: {
          title: 'Eje Y',
          titlefont: { color: '#eee' },
          tickfont: { color: '#aaa' },
          gridcolor: '#444',
          zerolinecolor: '#666'
        },
        paper_bgcolor: "#222",  // Fondo del contenedor
        plot_bgcolor: "#333",   // Fondo del área del gráfico
        margin: { t: 40, l: 50, r: 30, b: 40 }, // Ajuste de márgenes
        hovermode: 'closest'
      };
  
      // Trazo (linea del gráfico)
      const trace = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: '#f9a825',  // Color naranja
          width: 3,
          shape: 'spline'    // Línea suavizada
        },
        name: `f(x) = ${funcion}`
      };
  
      // Dibujar
      Plotly.newPlot("grafico-container", [trace], layout);
  
      // Mostrar
      document.getElementById("grafico-container").classList.remove("oculto");
    } catch (error) {
      alert("Error al graficar. Revisa la función.");
      console.error(error);
    }
  }
  function limpiarGrafico() {
    const graficoContainer = document.getElementById("grafico-container");
    
    // Oculta el contenedor
    graficoContainer.classList.add("oculto");
    
    // Destruye el gráfico para liberar memoria (opcional pero recomendado)
    Plotly.purge(graficoContainer);
    
    // Elimina el botón de descarga si existe
    const botonDescarga = graficoContainer.querySelector(".boton-descargar");
    if (botonDescarga) {
      botonDescarga.remove();
    }
  }
  const btnBorrar = document.getElementById("btn-borrar");
  let presionadoTimer = null;
  let seBorroTodo = false;
  
  btnBorrar.addEventListener("mousedown", () => {
    seBorroTodo = false;
    presionadoTimer = setTimeout(() => {
      limpiar(); // Borra todo si se mantiene presionado
      seBorroTodo = true;
    }, 500);
  });
  
  btnBorrar.addEventListener("mouseup", () => {
    clearTimeout(presionadoTimer);
    if (!seBorroTodo) {
      borrarCaracter(); // Borra un carácter si fue clic corto
    }
  });
  
  btnBorrar.addEventListener("mouseleave", () => {
    clearTimeout(presionadoTimer);
  });
  function borrarCaracter() {
    if (pantalla.value.length > 0) {
      pantalla.value = pantalla.value.slice(0, -1);
    }
  }