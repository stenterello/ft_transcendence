<script lang="ts">

	import { createEventDispatcher } from "svelte";
	import { receiveBearer } from "../auth/authenticationUtils.svelte";
	import { userInfo, bearer, webAppIP } from "../../data";

	const dispatch = createEventDispatcher();

	async function	changePassword(): Promise<void> {
		const	oldPassword: string = document.getElementById('old-password').value;
		const	oldPasswordTwo: string = document.getElementById('old-password-two').value;
		const	password: string = document.getElementById('new-password').value;

		if (oldPassword.length === 0 || oldPasswordTwo.length === 0 || password.length === 0)
		{
			if (document.getElementById('error') === null)
			{
				const	err: HTMLElement = document.createElement('p');
				const	errText: Text = document.createTextNode('All fields must be compiled');
				err.appendChild(errText);
				err.style.color = '#d61a1f';
				err.style.fontSize = '0.6em';
				err.setAttribute('id', 'error');
				document.getElementById('new-form').appendChild(err);
				return ;
			}
			else if (document.getElementById('error').innerText !== 'All fields must be compiled')
			{
				document.getElementById('error').innerText !== 'All fields must be compiled'
				return ;
			}
		}

		if (oldPassword !== oldPasswordTwo)
		{
			if (document.getElementById('error') === null)
			{
				const	err: HTMLElement = document.createElement('p');
				const	errText: Text = document.createTextNode('Old password fields do not match');
				err.appendChild(errText);
				err.style.color = '#d61a1f';
				err.style.fontSize = '0.6em';
				err.setAttribute('id', 'error');
				document.getElementById('new-form').appendChild(err);
				return ;
			}
			else if (document.getElementById('error').innerText !== 'Old password fields do not match')
			{
				document.getElementById('error').innerText !== 'Old password fields do not match'
				return ;
			}
		}

		const	obj: Object = { 'username': $userInfo['username'], 'password': password, 'oldPassword': oldPassword };

		const	response: Response = await fetch(`http://${$webAppIP}:3000/users/update/pwd`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'Authorization': 'Bearer ' + $userInfo['access_token']
			},
			body: JSON.stringify(obj)
		})
		if (response.ok) {
			$bearer = $userInfo['access_token'];
			dispatch('message', { path: "/profile", bearer: $userInfo['access_token'] });
			return ;
		}
		else
		{
			if (document.getElementById('error') === null)
			{
				const	err: HTMLElement = document.createElement('p');
				const	errText: Text = document.createTextNode('You gave me a wrong password');
				err.appendChild(errText);
				err.style.color = '#d61a1f';
				err.style.fontSize = '0.6em';
				err.setAttribute('id', 'error');
				document.getElementById('new-form').appendChild(err);
				return ;
			}
			else if (document.getElementById('error').innerText !== 'You gave me a wrong password')
			{
				document.getElementById('error').innerText !== 'You gave me a wrong password'
				return ;
			}
		}
	}

	let	hasBearer: boolean = (($bearer !== "") ? true : false);

	if ($userInfo['isOAuthLogged'] === true)
		dispatch('message', { path: '/profile' });

	$: {
		hasBearer = (($bearer !== "") ? true : false);
	}

</script>

<div id="container">
	{#key hasBearer}
		{#if hasBearer === false}
			<div id="inner">
				<p>WARNING: restricted area</p>
				<p>Login again to grant access</p>
				<form>
					<input id="username" type="text" name="username" placeholder="Enter username" required>
					<input id="password" type="password" name="password" placeholder="Enter password" required>
					<input on:click|preventDefault={async () => { hasBearer = await receiveBearer($userInfo, $webAppIP) } } type="submit">
				</form>
			</div>
		{:else}
			<div id="new-form">
				<label for="old-password">Insert your old password</label>
				<input id="old-password" name="old-password" type="password" required>
				<br>
				<label for="old-password-two">Confirm your old password</label>
				<input id="old-password-two" name="old-password-two" type="password" required>
				<br>
				<label for="new-password">Insert your new password</label>
				<input id="new-password" name="new-password" type="password" required>
				<br>
				<input on:click|preventDefault={changePassword} type="submit" value="Change password">
			</div>
		{/if}
	{/key}
</div>

<style>
	
	#container {
		background-image: url("images/chapter-screen.png");
		width: 100vw;
		height: 100vh;
		position: absolute;
		top: 0;
		left: 0;
		background-size: cover;
	}

	#inner {
		position: absolute;
		top: 60%;
		left: 39%;
	}

	#new-form {
		position: absolute;
		top: 56vh;
		left: 44vw;
		border: none;
		border-bottom: 3px solid white;
		background-color: black;
		color: white;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		width: fit-content;
	}

	#new-form > input {
		padding: 10px 20px;
		background-color: black;
		border: none;
		border-bottom: 3px solid white;
		cursor: pointer;
		color: white;
	}

	label, input[type=submit] {
		font-family: 'TrashHand';
	}

</style>
