<script lang="ts">

    import { waitingGame } from "../../data";
    import { createEventDispatcher } from "svelte";

    const   dispatch = createEventDispatcher();

    if ($waitingGame === false)
    {
        dispatch('message', { path: "/game" })
    }

</script>

<section>
    <video muted autoplay loop>
        <source src="videos/blue.webm" type="video/webm">
        <track kind="captions">
    </video>
    <h2>Waiting for opponent</h2>
</section>

<style>
    section {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
    }

    video {
        width: 100vw;
        height: 100vh;
    }

    h2 {
        position: absolute;
        top: 2%;
        color: white;
        font-family: 'TrashHand';
        left: 2%;
        padding: 0;
        margin: 0;
    }
</style>