<script lang="ts">

    import { webAppIP } from "../../data";

    export let  userInfo: Object;

    function	winningRatio(matches: number, victories: number): Number {
		if (matches === 0) return 0;
		return Number((victories/matches*100).toFixed(2));
	}

    async function	getUsers(): Promise<Array<Object>> {
		const	response: Response = await fetch(`http://${$webAppIP}:3000/users`);
		const	ret: Object = await response.json();
		return Object.values(ret);
	}

    function	compareFunction(user1: Object, user2: Object): number {
		if (winningRatio(user1['matches'], user1['victories']) === winningRatio(user2['matches'], user2['victories']))
			return 0;
		else if (winningRatio(user1['matches'], user1['victories']) > winningRatio(user2['matches'], user2['victories']))
			return -1;
		else
			return 1;
	}

    function	getRanking(users: Array<Object>): Number {
		let	position: number = 1;
		for (let i = 0; i < users.length; i++) {
			if (i > 0 && winningRatio(users[i - 1]['matches'], users[i - 1]['victories']) > 
				winningRatio(users[i]['matches'], users[i]['victories']))
				users[i]['ranking'] = ++position;
			else
				users[i]['ranking'] = position;
            if (users[i]['username'] === userInfo['username'])
                return position;
		}
	}

    async function  getRankingPosition(): Promise<Number> {
        let users: Array<Object> = await getUsers();
        users = users.sort(compareFunction);
		return getRanking(users);
    }

</script>

<table>
    <tr>
        <th>Matches</th>
        <th>Victories</th>
        <th>Losses</th>
        <th>Winning ratio</th>
        <th>Ranking</th>
    </tr>
    <tr>
        <td>{userInfo['matches']}</td>
        <td>{userInfo['victories']}</td>
        <td>{userInfo['loses']}</td>
        <td>{winningRatio(userInfo['matches'], userInfo['victories'])}%</td>
        {#await getRankingPosition()}
            <td>...</td>
        {:then ranking}
            <td>#{ranking}</td>
        {/await}
    </tr>
</table>

<style>
    table {
        margin: 0 auto;
		width: 60%;
		overflow: hidden;
        border-spacing: 0;
		border: 1px solid black;
        border-radius: 1vw;
    }

    th {
        font-family: 'TrashHand';
        font-size: 1.7em;
    }

    tr:first-of-type {
        background-color: black;
        color: #fcd612;
    }

    th {
        font-family: 'TrashHand';
        font-size: 1.2em;
    }

    td {
        color: black;
    }
</style>