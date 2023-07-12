<script lang="ts">
    import NavBar from "../utils/NavBar.svelte";
	import Notifications from "../utils/Notifications.svelte";
	import { searchUser } from "../chat/interactionUtils.svelte";
    import UserManagement from "../utils/UserManagement.svelte";
	import { statusChange, userInfo, webAppIP } from "../../data";
	
	let			searchedUser: Object | null;
	let			searched: boolean = false;

	async function  updateUser(): Promise<void> {
        const   response: Response = await fetch(`http://${$webAppIP}:3000/users/` + $userInfo['username'] + '-token');
        const   json: Object = await response.json();
        $userInfo = json;
    }

	async function	getFriends(): Promise<Array<Object>> {
		await updateUser();
		const	response: Response = await fetch(
			`http://${$webAppIP}:3000/users/` + $userInfo['username'] + '-token/friends'
		);
		const	json: Object = await response.json();
		let		ret: Array<Object> = [];
		for (let i = 0; i < Object.keys(json).length; i++) {
			const	res: Response = await fetch(`http://${$webAppIP}:3000/users/` + json[i] + '-token');
			const	elem: Object = await res.json();
			ret.push(elem);
		}
		return ret;
	}

	async function	getUsers(): Promise<Array<Object>> {
		await updateUser();
		const	res: Response = await fetch(`http://${$webAppIP}:3000/users`);
		const	json: Object = await res.json();
		const	ret: Array<Object> = [];

		for (let i = 0; i < Object.keys(json).length; i++)
			ret.push(json[i]);
		return (ret);
	}

	async function	searchUserAndDisplay(username: string): Promise<void> {
		searchedUser = await searchUser(username, $webAppIP);
		searched = true;
	}

</script>

<Notifications />
<NavBar on:message on:logout />
{#key $statusChange}
	{#await getFriends()}
		<p>loading...</p>
	{:then friends}
		{#if friends !== null && friends !== undefined && friends.length > 0}
			<h1>Your friends</h1>
			<div id="friends-list">
				<ul>
					{#each friends as friend}
						<UserManagement user={friend} on:message on:change={() => { $statusChange = ($statusChange) ? false : true } } />
					{/each}
				</ul>
			</div>
			<hr>
		{:else}
			<p>You have no friends yet :(</p>
		{/if}
		<h1>Other users</h1>
		{#await getUsers()}
			<p>Loading...</p>
		{:then users}
			<div>
				<form on:submit|preventDefault={() => searchUserAndDisplay(document.getElementById('search-user').value)}>
					<label for="search-user">Search a user</label>
					<input id="search-user" name="user" type="text" placeholder="insert username">
					<input type="submit" value="search">
				</form>
			</div>
			{#key searchedUser}
				{#if searched && searchedUser !== null && searchedUser['username'] !== $userInfo['username']}
					<ul>
						<UserManagement user={searchedUser} on:message on:change={() => { $statusChange = ($statusChange) ? false : true } } />
					</ul>
				{:else if searched && searchedUser !== null && searchedUser['username'] === $userInfo['username']}
					<p>Don't play with me</p>
				{:else if searched}
					<p>No user whit that name!</p>
				{/if}
			{/key}
			{#if searched === false && users.length - 1 - $userInfo['friends'].length > 0}
				<ul>
				{#each users as user}
					{#if user['username'] !== $userInfo['username'] && $userInfo['friends'].includes(user['username']) === false}
						<UserManagement {user} on:message on:change={() => { $statusChange = ($statusChange) ? false : true } } />
					{/if}
				{/each}
				</ul>
			{/if}
		{/await}
	{/await}
{/key}

<style>

	h1 {
		color: white;
		font-family: 'TrashHand';
	}

	label {
		color: white;
		font-family: 'TrashHand';
		margin: 10px 20px 0;
	}

	ul {
		background-color: #fcd612;
		list-style-type: none;
		padding: 15px;
		border-radius: 1vw;
	}

	p {
		color: white;
		font-family: 'TrashHand';
		font-size: 3em;
		margin: 60px auto;
	}

</style>