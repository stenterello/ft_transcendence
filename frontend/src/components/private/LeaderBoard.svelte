<script lang="ts">

	import { createEventDispatcher } from "svelte";
    import { userInfo, webAppIP } from "../../data";

	const	dispatch = createEventDispatcher();

	async function	getUsers(): Promise<Array<Object>> {
		const	response: Response = await fetch(`http://${$webAppIP}:3000/users`);
		const	ret: Object = await response.json();
		return Object.values(ret);
	}

	function	winningRatio(matches: number, victories: number): Number {
		if (matches === 0) return 0;
		return Number((victories/matches*100).toFixed(2));
	}

	function	compareFunction(user1: Object, user2: Object): number {
		if (winningRatio(user1['matches'], user1['victories']) === winningRatio(user2['matches'], user2['victories']))
			return 0;
		else if (winningRatio(user1['matches'], user1['victories']) > winningRatio(user2['matches'], user2['victories']))
			return -1;
		else
			return 1;
	}

	function	addRanking(users: Array<Object>): void {
		let	position: number = 1;
		for (let i = 0; i < users.length; i++) {
			if (i > 0 && winningRatio(users[i - 1]['matches'], users[i - 1]['victories']) > 
				winningRatio(users[i]['matches'], users[i]['victories']))
				users[i]['ranking'] = ++position;
			else
				users[i]['ranking'] = position;
		}
	}

	async function	getLeaderboard(): Promise<Array<Object>> {
		let	users: Array<Object> = await getUsers();
		users = users.sort(compareFunction);
		addRanking(users);
		return (users);
	}

</script>

<section>
	<h2>Leaderboard</h2>
	{#await getLeaderboard()}
		<p>Loading</p>
	{:then leaderboard}
		<table id="leaderboard">
			<tr>
				<th>Ranking</th>
				<th>User</th>
				<th>Matches</th>
				<th>Victories</th>
				<th>Winning ratio</th>
			</tr>
			{#each leaderboard as user}
				<tr>
					<td>{user['ranking']}#</td>
					<td><button on:click={ () => {
						if (user['username'] !== $userInfo['username'])
							dispatch('message', { path: '/profile?user=' + user['username'] });
						else
							dispatch('message', { path: '/profile' });
					}}>{user['username']}</button></td>
					<td>{user['matches']}</td>
					<td>{user['victories']}</td>
					<td>{winningRatio(user['matches'], user['victories'])}%</td>
				</tr>
			{/each}
		</table>
	{/await}
</section>


<style>
	section {
		width: 50vw;
		background-color: #fcd612;
		border-radius: 0.5vw;
		padding: 50px 0;
	}
	h2 {
		margin-bottom: 40px;
		font-family: 'TrashHand';
		color: black;
		font-size: 2.5em;
	}
	table {
		margin: 0 auto;
		width: 60%;
		overflow: hidden;
        border-spacing: 0;
		border: 1px solid black;
        border-radius: 1vw;
	}
	tr:first-of-type {
        background-color: black;
        color: #fcd612;
    }
	th {
        font-family: 'TrashHand';
        font-size: 1.7em;
    }
	td {
		border: 1px solid black;
	}
	button {
		background-color: unset;
		width: 100%;
		height: 100%;
		transition: all 0.2s;
	}
	button:hover {
		background-color: black;
		color:#fcd612;
	}
</style>