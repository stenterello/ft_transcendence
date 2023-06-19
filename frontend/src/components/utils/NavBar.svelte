<script lang="ts">

	import { createEventDispatcher } from "svelte";
	import { deleteCookie } from 'svelte-cookie';
	import { socket, waitingGame, events, generalMessages, bearer, chat, onlineUsers, inGameUsers, userInfo, userSelected } from "../../data";

	const	dispatch = createEventDispatcher();

</script>

<section>
	<button on:click|preventDefault={() => dispatch('message', { path: "/profile" })}>Profile</button>
	<button on:click|preventDefault={() => dispatch('message', { path: "/friends" })}>Friends</button>
	<button on:click|preventDefault={() => {
			deleteCookie('transcendence_session');
			$socket.disconnect();
			$events.length = 0;
			$generalMessages.length = 0;
			$onlineUsers.length = 0;
			$inGameUsers.length = 0;
			$waitingGame = false;
			$socket = null;
			$bearer = "";
			$chat = false;
			$userInfo = undefined;
			$userSelected = undefined;
			dispatch('logout', { path: "/" });
		}
	}>Logout</button>
</section>


<style>
	section {
		position: fixed;
		bottom: 15px;
		left: 15px;
		display: flex;
		flex-direction: column;
		width: 10vw;
	}

	button {
		width: 100%;
		background-color: #fcd612;
		margin: 5px;
		color: black;
	}

	button:hover {
		border-color: white;
	}
</style>
