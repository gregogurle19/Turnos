const SPREADSHEET_ID = "TU_SPREADSHEET_ID";  // Cambialo por el ID de tu hoja
const SHEET_NAME = "Turnos";                  // El nombre de la pestaña donde guardás

function doGet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  let turnos = [];
  // Suponiendo que la fila 1 tiene encabezados
  for (let i = 1; i < data.length; i++) {
    turnos.push({
      nombre: data[i][0],
      dni: data[i][1],
      nacimiento: data[i][2],
      fecha: data[i][3],
      hora: data[i][4]
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify(turnos))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    const data = JSON.parse(e.postData.contents);

    if (data.action === "reserve") {
      if (!data.nombre || !data.dni || !data.nacimiento || !data.fecha || !data.hora) {
        return ContentService.createTextOutput(
          JSON.stringify({ result: "error", message: "Faltan datos para reservar." })
        ).setMimeType(ContentService.MimeType.JSON);
      }

      // Agregamos el turno
      sheet.appendRow([data.nombre, data.dni, data.nacimiento, data.fecha, data.hora]);

      return ContentService.createTextOutput(
        JSON.stringify({ result: "success" })
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ result: "error", message: "Acción desconocida." })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
