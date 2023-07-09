<script lang="ts">

	import { page_shown, socket, userInfo } from '../../data';

	export let	user: Object = undefined;

	if (user === undefined) {
		user = $userInfo;
	}
	
	let	achievementDesc = [
		"win againts a player with Bill avatar",
		"win 88 games",
		"take revenge against a player who won against you",
		"win without leaving any point to your enemy",
		"win against a player with Pai Mei avatar",
		"win a game while having a Hattori Hanzo avatar",
		"win a game while having O-Ren Ishii avatar",
		"win a game while having Budd avatar",
		"kill every member of D.V.A.S.",
		"win a game while having Pai Mei avatar"
	];

	let	titles: Array<string> = [
		"Kill bill",
		"Leader of the Crazy 88s",
		"Vernita Green's daughter",
		"Five Point Palm Exploding Heart Technique",
		"Elle Driver's fan",
		"Master of swords",
		"Yakuza leader",
		"The only man I ever loved",
		"The Bride",
		"Eagle's Claw Style"
	]

	if ($socket === null) {
		$page_shown = "/profile"
		history.replaceState({"href_to_show": "/profile"}, "", "/profile");
	}

	let	ownedAchievements: Array<string> = [];
	let	otherAchievements: Array<string> = [];
	let	achievements = user['achievement'];

	function	defineAchievements(): void {
		for (let i = 0; achievements.hasOwnProperty(Object.keys(achievements)[i]); i++) {
			if (achievements[Object.keys(achievements)[i]] === true)
				ownedAchievements.push(Object.keys(achievements)[i]);
			else
				otherAchievements.push(Object.keys(achievements)[i]);
		}
	}

	function	getAchievementDescription(title: string): string {
		let	i: number = 0;
		for (; titles[i]; i++) {
			if (titles[i] === title)
				break ;
		}
		return achievementDesc[i];
	}

	defineAchievements();

</script>

{#if $socket !== null}

	<main>
		<h1>Welcome to the hall of fame</h1>

		<h4>Owned achievements</h4>

		{#if ownedAchievements.length === 0}
			{#if user['username'] === $userInfo['username']}
				<p>You don't have any achievement yet, I'm so sad.</p>
			{:else}
				<p>This user does not own any achievement yet.</p>
			{/if}
		{:else}
			{#each ownedAchievements as achievement}
				<h2 style="text-decoration: underline;">{achievement}</h2>
				<p>[ {getAchievementDescription(achievement)} ]</p>
			{/each}
		{/if}

		<h4>Other achievements</h4>

		{#if otherAchievements.length === 0}
			{#if user['username'] === $userInfo['username']}
				<p>You detain each achievement this game offers! You are the best</p>
			{:else}
				<p>This player is a badass: he controls each achievement!</p>
			{/if}
		{:else}
			{#each otherAchievements as achievement}
				<h2>{achievement}</h2>
				<p>[ {getAchievementDescription(achievement)} ]</p>
			{/each}
		{/if}

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

	h4 {
		font-size: 2em;
		background-color: black;
		color: #fcd612;
		border-radius: 5vw;
	}

	p {
		margin-top: 0;
	}

</style>
