<script lang="ts">

	import { page_shown, socket } from '../../data';
	

	if ($socket === null) {
		$page_shown = "/profile"
		history.replaceState({"href_to_show": "/profile"}, "", "/profile");
	}
	
</script>

{#if $socket !== null}

	<main>
		<h1>Welcome to the hall of fame</h1>

		<h2>Kill bill</h2>
		<p>[ win againts a player with Bill avatar ]</p>

		<h2>Leader of the Crazy 88s</h2>
		<p>[ win 88 games ]</p>

		<h2>Vernita Green's daughter</h2>
		<p>[ take revenge against a player who won against you ]</p>

		<h2>Five Point Palm Exploding Heart Technique</h2>
		<p>[ win without leaving any point to your enemy ]</p>

		<h2>Elle Driver's fan</h2>
		<p>[ win against a player with Pai Mei avatar ]</p>

		<h2>Master of swords</h2>
		<p>[ win a game while having a Hattori Hanzo avatar ]</p>

		<h2>Yakuza leader</h2>
		<p>[ win a game while having O-Ren Ishii avatar ]</p>

		<h2>The only man I ever loved</h2>
		<p>[ win a game while having Budd avatar ]</p>

		<h2>The Bride</h2>
		<p>[ kill every member of D.V.A.S. ]</p>

		<h2>Eagle's Claw Style</h2>
		<p>[ win a game while having Pai Mei avatar ]</p>

	</main>
{/if}

<style>

	main {
		background-color: #fcd612;
		color: black;
		padding: 20px 50px;
		border-radius: 1vw;
	}

	h2 {
		margin-top: 55px;
		margin-bottom: 0px;
		font-family: 'TrashHand';
		font-size: 3em;
	}

	p {
		margin-top: 0;
	}

</style>
