const ordenPrefijo = "VIERNES";

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const outputText = document.getElementById("outputText");
  const msgText = document.getElementById("msgText");

  outputText.innerHTML = `Di ${ordenPrefijo} para dar la instrucción`;

  let recognition;
  let stoppedManually = false;

  if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "es-MX";
  } else {
    alert("Tu navegador no soporta reconocimiento de voz.");
    return;
  }

  startBtn.addEventListener("click", () => {
    stoppedManually = false;
    recognition.start();
    startBtn.disabled = true;
    outputText.textContent = `Escuchando... Di ${ordenPrefijo} para interactuar.`;
    msgText.innerHTML = "";
  });

  recognition.onresult = (event) => {
    let transcript = event.results[event.results.length - 1][0].transcript.trim().toUpperCase();
    console.log("Texto reconocido:", transcript);

    // Si el usuario dice "VIERNES STOP", se detiene el reconocimiento
    if (transcript.startsWith(`${ordenPrefijo} SALIR`)) {
      stoppedManually = true;
      recognition.stop();
      startBtn.disabled = false;
      outputText.textContent = "Detenido. Presiona el botón para comenzar nuevamente.";
      msgText.innerHTML = "";
      return;
    }

    // Llamada a la API con la frase reconocida
    fetch("http://18.207.179.95/2api-gpt-php/endpoints/chat.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: transcript }) // CAMBIO AQUÍ para que coincida con el PHP
    })
      .then(response => response.json())
      .then(data => {
        // Mostrar solo la respuesta que venga de la API
        if (data.reply) {
          outputText.textContent = data.reply;
        } else {
          outputText.textContent = "No se recibió una respuesta válida.";
        }
      })
      .catch(error => {
        console.error("Error al consultar la API:", error);
        outputText.textContent = "Error al procesar la instrucción.";
      });
  };

  recognition.onerror = (event) => {
    console.error("Error en el reconocimiento:", event.error);
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      alert("Error: El micrófono no tiene permisos o fue bloqueado.");
    } else if (event.error === "network") {
      alert("Error: Problema de conexión con el servicio de reconocimiento de voz.");
    }
    recognition.stop();
    startBtn.disabled = false;
  };

  recognition.onend = () => {
    if (!stoppedManually) {
      msgText.innerHTML = "El reconocimiento de voz se detuvo inesperadamente<br>Habla nuevamente para continuar...";
      recognition.start();
    }
  };
});

