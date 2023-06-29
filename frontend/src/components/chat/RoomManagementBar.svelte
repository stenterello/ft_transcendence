<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let	roomInfo: Object;
	const		dispatch = createEventDispatcher();

	function	toggleManagement(): void {
		dispatch('options', null);
	}
</script>

<div id="chat-header">
	<h4>{roomInfo['name']}</h4>
	<div class="settings">
		<img src="wrench.png" alt="settings" />
		<button on:click={toggleManagement} ></button>
	</div>
</div>

<style>
	#chat-header {
		display: flex;
		background-color: black;
		justify-content: space-between;
		align-items: center;
		height: 15%;
	}
	h4 {
        margin: 0;
        padding: 0;
        font-family: 'TrashHand';
        color: #fcd612;
		font-size: 1.2em;
    }
	.settings {
		position: relative;
		padding: 3px;
		width: 7%;
		background-color: white;
	}
	.settings > img {
		width: 100%;
		height: 100%;
	}
	.settings > button {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: rgba(255,255,255,0);
	}
</style>