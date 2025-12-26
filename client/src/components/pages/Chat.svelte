<script lang="ts">
  import { tick } from "svelte";
  import { chat } from "../../stores/chatStore.svelte";
  import { sendChatMessage } from "../../colyseus/LobbyBridge";

  let messagesEl: HTMLDivElement;

  async function scrollToBottom() {
    await tick();
    messagesEl?.scrollTo({ top: messagesEl.scrollHeight });
  }

  $effect(() => {
    chat.messages.length;
    scrollToBottom();
  });
</script>

<div class="chat-panel">
  <h4>Chat</h4>

  <div class="chat-messages" bind:this={messagesEl}>
    {#each chat.messages as m (m.id)}
      <div class:sys={m.type === "sys"}>
        {#if m.type === "sys"}
          {m.text}
        {:else}
          <strong>{m.from}</strong> : {m.text}
        {/if}
      </div>
    {/each}
  </div>

  <div class="chat-input-row">
    <input
      bind:value={chat.input}
      placeholder="Message…"
      onkeydown={(e) => e.key === "Enter" && sendChatMessage()}
    />
    <button class="btn" onclick={sendChatMessage}>
      Envoyer
    </button>
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