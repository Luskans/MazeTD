export type ChatMessage = {
  id: number;
  type: "chat" | "sys";
  text: string;
  from?: string;
};

let nextId = 0;

export const chat = $state({
  messages: [] as ChatMessage[],
  input: ""
});

export function addChatMessage(from: string, text: string) {
  chat.messages = [
    ...chat.messages,
    { id: nextId++, type: "chat", from, text }
  ];
}

export function addSystemMessage(text: string) {
  chat.messages = [
    ...chat.messages,
    { id: nextId++, type: "sys", text }
  ];
}

export function clearChat() {
  chat.messages = [];
}
