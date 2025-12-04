<script>
    import { slide } from "svelte/transition";

  export let title = 'Panel';
  export let positionY = "bottom"; // bottom | top
  export let positionX = "center"; // left | center | right
  export let onClose = () => {};
</script>

<div 
  class="panel {positionY} {positionX}" 
  on:click|stopPropagation
  transition:slide={{ axis: positionX === "center" ? "y" : "x" }}
  tabindex="0"
  role="dialog"
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') onClose();
  }}
>
    <header>
        <h2>{title}</h2>
        <button class="close-btn" type="button" on:click={onClose}>
            &times;
        </button>
    </header>
    
    <div class="content">
        <slot></slot>
    </div>
</div>

<style>
  .panel {
    /* Effet "Panneau en Bois" */
    width: 90%; /* Prend plus de place sur mobile */
    max-width: 600px;
    max-height: 90%;
    background-color: #9e7b5f; /* Couleur de fond du bois plus clair */
    border: 5px solid #3d2516; /* Gros cadre sombre */
    border-radius: 15px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
    padding: 20px;
    display: flex;
    flex-direction: column;
    z-index: 1001; /* Au-dessus de l'overlay */
  }

  .panel {
    position: absolute;
    background: #222;
    padding: 20px;
  }

  .bottom {
    bottom: 80px; /* au-dessus des boutons */
    left: 0;
    right: 0;
  }

  .right {
    top: 70px; /* sous settings */
    bottom: 0;
    right: 0;
    width: 300px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #5c3a21; /* Ligne de séparation */
    padding-bottom: 10px;
    margin-bottom: 15px;
  }

  h2 {
    color: #3d2516; /* Texte sombre pour l'effet "gravé" */
    margin: 0;
    font-size: 24px;
  }

  .close-btn {
    background: #cc4444;
    color: white;
    border: 2px solid #a30000;
    border-radius: 5px;
    font-size: 20px;
    line-height: 1;
    padding: 5px 10px;
    cursor: pointer;
  }

  .content {
    flex-grow: 1;
    overflow-y: auto;
    /* Style du contenu du panneau (e.g., arrière-plan parchemin) */
    background-color: #f7e6c4; /* Couleur parchemin */
    color: #3d2516;
    padding: 15px;
    border-radius: 5px;
  }
</style>