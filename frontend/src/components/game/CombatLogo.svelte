<script lang="ts">

    export let  left: boolean = undefined;
    export let  user: Object = undefined;
    export let  points: number = 0;
    export let  isSpectator: boolean = false;

</script>

{#if isSpectator === false}
    {#if left === true}
        <div class="container">
            <img src={user['pictureLink']} alt="player pic">
            <h2>{user['username']}</h2>
            <p>{points}</p>
        </div>
    {:else}
        <div class="container reverse">
            <img src={user['pictureLink']} alt="player pic">
            <h2>{user['username']}</h2>
            <p>{points}</p>
        </div>
    {/if}
{:else}
    {#if left === true}
        <div class="container-spectator">
            <img src={user['pictureLink']} alt="player pic">
            <h2>{user['username']}</h2>
            <p>{points}</p>
        </div>
    {:else}
        <div class="container-spectator reverse">
            <img src={user['pictureLink']} alt="player pic">
            <h2>{user['username']}</h2>
            <p>{points}</p>
        </div>
    {/if}
{/if}

<style>
    img {
        height: 9vh;
        top: 0;
    }
    .container {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 30%;
        padding: 1%;
        max-height: 9vh;
    }
    .container-spectator {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 30%;
        padding: 1%;
        max-height: 9vh;
    }
    .reverse {
        flex-direction: row-reverse;
        right: 0;
    }
    h2, p {
        color: white;
    }
</style>