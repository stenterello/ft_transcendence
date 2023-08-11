<script lang="ts">
	import { socket, waitingGame, opponent, pos, userInfo, mapUrl, racketSize } from "../../data";
	import { createEventDispatcher } from 'svelte';

	const	dispatch = createEventDispatcher();

	let	answerChange: boolean = true;
	$waitingGame = true;
	let	rememberOpponent: string = $opponent;

	$socket.on('privateGameReady', (data) => {
		if (data['opponent'] !== $userInfo['username'])
			$opponent = data['opponent'];
		$pos = data['pos'];
		$waitingGame = false;
		$mapUrl = data['map'];
		$racketSize = data['size'];
		console.log(data)
		dispatch('message', { path: "/privateGame" })
	});

	$socket.on('gameDismissed', () => {
		$opponent = undefined;
		$waitingGame = false;
		answerChange = (answerChange) ? false : true;
	});

</script>

{#key answerChange}
	{#if answerChange === true}
		<div>
			<h4>Waiting {$opponent} to answer your challenge</h4>
			<h6>don't leave this page</h6>
			<img src="katana.png" alt="loading icon" />
		</div>
	{:else}
		<div>
			<h4>{rememberOpponent} dismissed your challenge request :(</h4>
		</div>
	{/if}
{/key}

<style>
	div {
		width: 50vw;
		background-color: #fcd612;
		border-radius: 0.5vw;
		height: 50vh;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	h4, h6 {
		font-family: 'TrashHand';
		color: black;
		font-size: 2em;
	}

	h6 {
		font-size: unset;
		margin: 0 0 25px;
	}

	img {
		height: 15%;
		animation: rotate 1.4s ease-in-out infinite running;
	}

	@keyframes rotate {
		from { rotate: 0deg; }
		to { rotate: 360deg; }
	}
</style>