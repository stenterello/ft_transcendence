<script lang="ts">
    import { createEventDispatcher } from "svelte";
	import { statusChange, userInfo, socket } from "../../data";

	const	dispatch = createEventDispatcher();

	export let	user: Object = undefined;
</script>

{#if user['status'] !== 'offline' && user['status'] !== 'in game' && $userInfo['blocklist'].includes(user['username']) === false}
	<li>
		<div class="left">
			<img src={user['pictureLink']} alt="{user['username']} picture"/>
			<p id="username">{user['username']}</p>
			{#if user['status'] === 'online'}
				<p>[ status: <span class="dot online">·</span> online ]</p>
			{:else}
				<p>[ status: <span class="dot ingame">·</span> in game ]</p>
			{/if}
		</div>
		<div class="right">
			{#key $statusChange}
				{#if user['status'] === 'online' && $userInfo['friends'].includes(user['username'])}
					<button on:click={() => {
						$socket.emit('invite to private game', JSON.stringify({user: user['username']}));
						dispatch('message', { path: '/waitingUser', opponent: user['username'] });
					}
				}>Invite to play</button>
				{:else}
					<button>is currently playing a game</button>
				{/if}
			{/key}
		</div>
	</li>
{/if}

<style>

    #username {
        font-family: 'TrashHand';
        font-size: 2em;
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

    li {
        background-color: #f8b71d;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2%;
		border-radius: 1vw;
		margin: 10px;
    }

    img {
        width: 5vw;
		display: inline-block;
    }

    .left {
        flex-basis: 60%;
    }

    button {
        margin: 7px auto;
        background-color: black;
        color:#fcd612;
    }

	li > div {
		display: flex;
		align-items: center;
		justify-content: space-around;
	}

	div > p {
		display: inline-block;
	}

</style>