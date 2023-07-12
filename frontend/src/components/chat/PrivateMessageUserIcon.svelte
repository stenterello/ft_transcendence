<script lang="ts">

	import { createEventDispatcher } from "svelte";
    import { webAppIP } from "../../data";

    export let  username: string = undefined;
	const		dispatch = createEventDispatcher();


    async function	retrieveOtherUserInfo(username: string): Promise<Object | null> {
		const	response: Response = await fetch(`http://${$webAppIP}:3000/users/` + username + '-token');

		try {
			const	json: Object = await response.json();
			return (json);
		}
		catch {
			return null;
		}
	}

</script>

{#await retrieveOtherUserInfo(username)}
    <p>Loading</p>
{:then otherUserInfo}
    <div id="user-container">
        <img loading="lazy" src="{otherUserInfo['pictureLink']}" alt="user pic" />
        <button on:click|preventDefault={ () => { dispatch('select-chat', { user: username }) } }>{username}</button>
        {#if otherUserInfo['status'] === 'online'}
            <p><span class="dot online">·</span> {otherUserInfo['status']}</p>
        {:else if otherUserInfo['status'] === 'in game'}
            <p><span class="dot ingame">·</span> {otherUserInfo['status']}</p>
        {:else}
            <p><span class="dot offline">·</span> {otherUserInfo['status']}</p>
        {/if}
    </div>
{/await}

<style>
    div {
        margin: 4%;
        padding: 2%;
        display: flex;
        justify-content: space-around;
        flex-direction: var(--flex-direction);
        align-items: center;
        background-color: #f8b71d;
        border-radius: 1vw;
    }

    p {
        margin: 0;
        height: 3em;
        position: relative;
        top: -1.6em;
    }

    img {
        max-width: 40%;
        max-height: 50px;
        margin: 10px;
        object-fit: scale-down;
    }

    button {
        cursor: pointer;
        background-color: black;
        color: #fcd612;
        min-width: 40%;
        z-index: 10;
    }

    .dot {
        font-size: 3em;
        position: relative;
        top: 10px;
        margin: 0;
    }

    .online {
        color: green;
    }

    .ingame {
        color: #d61a1f;
    }

    .offline {
        color: black;
    }
</style>