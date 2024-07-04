// STATIC
export const staticTextEnglish = {
  channel: "Channel",
  channel_placeholder: "my-channel",
  message: "Message",
  messages: "Messages",
  message_placeholder: "Hello, world!",
  message_placeholder_generic: "Type a message...",
  noMessagesReceived: "No messages received",
  messageLastReceived: "Last received message",
  messagesReceived: "Received Messages",
  send: "Send",
  settings: "Settings",
  subscribeToChannel: "Subscribe to channel",
  subscribe: "Subscribe",
  unsubscribe: "Unubscribe",
};

export const translations: { [key: string]: typeof staticTextEnglish } = {
  en: staticTextEnglish,
  es: {
    channel: "Canal",
    channel_placeholder: "mi-canal",
    message: "Mensaje",
    messages: "Mensajes",
    message_placeholder: "Hola!",
    message_placeholder_generic: "Nuevo mensaje",
    noMessagesReceived: "Sin mensajes",
    messageLastReceived: "Ültimo mensaje",
    messagesReceived: "Todos los Mensajes",
    send: "Enviar",
    settings: "Configuración",
    subscribeToChannel: "Suscribirse a un canal",
    subscribe: "Suscribirse",
    unsubscribe: "Cancelar",
  },
  de: {
    channel: "Kanal",
    channel_placeholder: "mein-kanal",
    message: "Nachricht",
    messages: "Nachrichten",
    message_placeholder: "Hallo!",
    message_placeholder_generic: "Neue Nachricht",
    noMessagesReceived: "Keine Nachrichten",
    messageLastReceived: "Letzte Nachrichte",
    messagesReceived: "Empfangene Nachrichten",
    send: "Senden",
    settings: "Einstellungen",
    subscribeToChannel: "Kanal Abonnieren",
    subscribe: "Abonnieren",
    unsubscribe: "Verlassen",
  },
};

export function getText(key: keyof typeof staticTextEnglish): string {
  if (
    translations[navigator.language] &&
    translations[navigator.language][key]
  ) {
    return translations[navigator.language.substring(0, 2)][key];
  }
  return translations.en[key];
}
