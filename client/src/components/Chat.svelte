<script lang="ts">
  import { onMount, tick } from "svelte";

  export let room: any; 

  type ChatMessage = {
    type: "chat" | "sys";
    text: string;
    from?: string;
  };

  let messages: ChatMessage[] = [];
  let text = "";
  let messagesEl: HTMLDivElement;

  function appendChat(from: string, t: string) {
    messages = [...messages, { type: "chat", text: t, from: from }];
  }

  export function appendSys(t: string) {
    messages = [...messages, { type: "sys", text: t }];
  }

  async function scrollToBottom() {
    await tick(); 
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  $: messages.length, scrollToBottom();

  onMount(() => {
    if (!room) return;

    room.onMessage("chat", (msg: any) =>
      appendChat(msg.from ?? "anonymous", msg.text),
    );

    room.onMessage("sys", (t: string) =>
      appendSys(t),
    );
  });

  function send() {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    room.send("chat", trimmedText);
    text = "";
  }
</script>

<div class="chat-panel">
  <h4>Chat</h4>
  <div class="chat-messages" bind:this={messagesEl}>
    {#each messages as m (m)}
      <div class:sys={m.type === "sys"}>
        {#if m.type === "sys"}
          {m.text}
        {:else}
          {m.from} : {m.text}
        {/if}
      </div>
    {/each}
  </div>
  <div class="chat-input-row">
    <input
      bind:value={text}
      on:keydown={(e) => e.key === "Enter" && send()}
      placeholder="Message..."
    />
    <button class="btn" on:click={send}>Envoyer</button>
  </div>
</div>

<style>
  .chat-panel {
    background: var(--panel);
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(27,43,68,0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 520px;
  }
  .chat-messages {
    flex: 1;
    overflow: auto;
    padding: 8px;
    border-radius: 8px;
    background: linear-gradient(180deg,#fbfcff,#ffffff);
  }
  .chat-messages div {
    margin-bottom: 6px;
  }
  .chat-messages .sys {
    color: var(--muted);
    font-style: italic;
    font-size: 13px;
  }
  .chat-input-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  input {
    flex: 1;
  }
  input::placeholder {
    color: var(--muted);
    font-style: italic;
    font-size: 13px;
    }
</style>