function getLatestItemResponses(form: GoogleAppsScript.Forms.Form) {
  const formResponses: GoogleAppsScript.Forms.FormResponse[] =
    form.getResponses();
  const latestResponse: GoogleAppsScript.Forms.FormResponse =
    formResponses[formResponses.length - 1];
  const latestItemResponses: GoogleAppsScript.Forms.ItemResponse =
    latestResponse.getItemResponses();

  return latestItemResponses;
}

function getHeader(form: GoogleAppsScript.Forms.Form) {
  const latestResponse: GoogleAppsScript.Forms.FormResponse =
    form.getResponses()[form.getResponses().length - 1];
  const timestamp: string = formatDate(latestResponse.getTimestamp());
  const header: string = `## 投稿日時\n${timestamp}\n\n`;

  return header;
}

function formatDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${minutes}:${seconds}`;
}

function getMessage(itemResponse: ItemResponse): string {
  const title: string = itemResponse.getItem().getTitle();
  const response: string = itemResponse.getResponse();
  const message: string = `## ${title}\n${response}\n\n`;

  return message;
}

function postMessage(apiToken, roomId, message, file) {
  if (file === undefined) {
    const options: UrlFetchApp.FetchOptions = {
      method: "post",
      headers: {
        "X-ChatWorkToken": apiToken,
      },
      payload: {
        body: message,
      },
    };

    UrlFetchApp.fetch(
      `https://api.chatwork.com/v2/rooms/${roomId}/messages`,
      options
    );
  } else {
    const options: UrlFetchApp.FetchOptions = {
      method: "post",
      headers: {
        "X-ChatWorkToken": apiToken,
      },
      payload: {
        file: file.getBlob(),
        message: message,
      },
    };

    UrlFetchApp.fetch(
      `https://api.chatwork.com/v2/rooms/${roomId}/files`,
      options
    );
  }
}

function postFormDataToChatwork(): void {
  const apiToken: string =
    PropertiesService.getScriptProperties().getProperty("API_TOKEN");
  const roomId: number =
    PropertiesService.getScriptProperties().getProperty("ROOM_ID");

  const form: Form = FormApp.getActiveForm();
  let file;
  let message: string = `${getHeader(form)}`;

  for (const itemResponse of getLatestItemResponses(form)) {
    if (itemResponse.getItem().getType() == "FILE_UPLOAD") {
      file = DriveApp.getFileById(itemResponse.getResponse());
    } else {
      message += getMessage(itemResponse);
    }
  }

  postMessage(apiToken, roomId, message, file);
}
