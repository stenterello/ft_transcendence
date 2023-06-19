<script lang="ts">
    import { socket } from "../../data";

	export let	user: string = undefined;

</script>

<div>
	<button on:click={() => $socket.emit('DeleteConv', JSON.stringify({user: user}))}>Clear History</button>
</div>

<style>
	div {
		width: 100%;
		height: 85%;
		display: flex;
		justify-content: center;
		align-items: center;
		align-items: center;
	}

	button {
		border: 1px solid black;
		border-radius: 1vw;
	}

	button:hover {
		background-color: #f9c31a;
	}

</style>