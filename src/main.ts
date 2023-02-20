type BaseDate = GoogleAppsScript.Base.Date;

type Form = GoogleAppsScript.Forms.Form;
type FormResponse = GoogleAppsScript.Forms.FormResponse;
type Item = GoogleAppsScript.Forms.Item;
type ItemResponse = GoogleAppsScript.Forms.ItemResponse;

type DriveFile = GoogleAppsScript.Drive.File;

/**
 * 最新のフォーム回答結果を取得する
 * @param form Form オブジェクト
 * @returns 最新のフォーム回答結果
 */
function getLatestFormResponse(form: Form): FormResponse {
  const responses: FormResponse[] = form.getResponses();

  return responses[responses.length - 1];
}

/**
 * ポストするメッセージのヘッダー（タイトル）を作成する
 * @param form Form オブジェクト
 * @returns ヘッダー（タイトル）文字列
 */
function createPostHeader(form: Form): string {
  const latestResponse: FormResponse =
    form.getResponses()[form.getResponses().length - 1];
  const timestamp: string = formatDate(latestResponse.getTimestamp());

  return `[info][title]お問い合わせ（${timestamp}）[/title]`;
}

/**
 * 日付をフォーマットする
 * @param date Date オブジェクト
 * @returns フォーマットした日付の文字列
 */
export function formatDate(date: BaseDate): string {
  const padding = (n: number) => String(n).padStart(2, "0");

  const year = String(date.getFullYear());
  const month = padding(date.getMonth() + 1);
  const day = padding(date.getDate());
  const hour = padding(date.getHours());
  const minutes = padding(date.getMinutes());
  const seconds = padding(date.getSeconds());

  return `${year}/${month}/${day} ${hour}:${minutes}:${seconds}`;
}

/**
 * ポストするメッセージを作成する
 * @param itemResponse itemResponse オブジェクト
 * @returns ポストするメッセージ
 */
function createPostMessage(itemResponse: ItemResponse): string {
  const title: string = itemResponse.getItem().getTitle();
  const response: string = itemResponse.getResponse().toString();

  return `${title}：\n${response}\n\n`;
}

/**
 * Chatwork の特定のチャットルームにメッセージ（とファイル）をポストする
 * @param apiToken Chatwork の API Token
 * @param roomId ターゲットとなるチャットルームの Room ID
 * @param message ポストするメッセージ
 * @param file ポストするファイル
 */
function postFormDataToChatwork(
  apiToken: string,
  roomId: string,
  message: string,
  file?: DriveFile | undefined
): void {
  const url = file
    ? `https://api.chatwork.com/v2/rooms/${roomId}/files`
    : `https://api.chatwork.com/v2/rooms/${roomId}/messages`;
  const payload = file ? { file: file.getBlob(), message } : { body: message };

  UrlFetchApp.fetch(url, {
    method: "post",
    headers: {
      "X-ChatWorkToken": apiToken,
    },
    payload,
  });
}

function main(): void {
  const apiToken: string | null =
    PropertiesService.getScriptProperties().getProperty("API_TOKEN");
  if (!apiToken) {
    throw new Error("API token is not set.");
  }

  const roomId: string | null =
    PropertiesService.getScriptProperties().getProperty("ROOM_ID");
  if (!roomId) {
    throw new Error("Room id is not set.");
  }

  const form: Form = FormApp.getActiveForm();

  let file: DriveFile | undefined;
  let message = `${createPostHeader(form)}`;

  const itemResponses: ItemResponse[] =
    getLatestFormResponse(form).getItemResponses();
  for (const itemResponse of itemResponses) {
    const item: Item = itemResponse.getItem();
    if (item.getType() === FormApp.ItemType.FILE_UPLOAD) {
      const response = itemResponse.getResponse().toString();
      file = DriveApp.getFileById(response);
    } else {
      message += createPostMessage(itemResponse);
    }
  }
  message += "[/info]";

  postFormDataToChatwork(apiToken, roomId, message, file);
}
