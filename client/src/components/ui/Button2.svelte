<script>
    import { createEventDispatcher } from 'svelte';

    export let text = '';
    export let icon = '⭐';
    export let isDisabled = false;

    const dispatch = createEventDispatcher();

    function handleClick() {
        if (!isDisabled) {
            dispatch('click');
        }
    }
</script>

<button on:click={handleClick} disabled={isDisabled}>
    <span class="icon">{icon}</span>
    <span class="text">{text}</span>
</button>

<style>
    button {
        /* Style de base pour l'effet "bois" (simulé ici avec des couleurs) */
        background-color: #5c3a21; /* Couleur bois foncé */
        color: #f7e6c4; /* Couleur texte/parchemin */
        border: 3px solid #8d5b30; /* Bordure plus claire pour le relief */
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 4px #3d2516; /* Ombre pour l'effet 3D */
        transition: transform 0.1s, box-shadow 0.1s;
        min-width: 60px; /* Taille minimale pour les boutons du bas */
    }

    button:hover:not([disabled]) {
        background-color: #6e472a; /* Changement de couleur au survol */
    }

    button:active:not([disabled]) {
        transform: translateY(2px); /* Effet d'enfoncement au clic */
        box-shadow: 0 2px #3d2516;
    }

    /* État désactivé quand un panneau est ouvert */
    button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .icon {
        font-size: 24px;
        line-height: 1;
        margin-bottom: 3px;
    }

    .text {
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
    }
</style>