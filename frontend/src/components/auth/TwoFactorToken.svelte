<script lang="ts">

	import { createEventDispatcher } from "svelte";
	import { setCookie } from 'svelte-cookie';
	import { userInfo, webAppIP } from "../../data";

	const	dispatch = createEventDispatcher();

	async function	checkToken(): Promise<void> {
		const	token: string = document.getElementById('token').value;

		if (!token.length)
		{
			if (document.getElementById('error') === null)
			{
				const	err: HTMLElement = document.createElement('p');
				const	errText: Text = document.createTextNode('HEY!!! Don\'t try to do nasty things to my users!!!');
				err.appendChild(errText);
				err.setAttribute('id', 'error');
				err.style.color = '#d61a1f';
				document.getElementById('container').appendChild(err);
			}
			return ;
		}
		else
		{
			const	toSend = { 'username': $userInfo['username'], 'email': $userInfo['email'], 'twoFactorAuthenticationCode': token };
			const	response: Response = await fetch(`http://${$webAppIP}:3000/auth/2fa/authenticate`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'Authorization': 'Bearer ' + $userInfo['access_token']
				},
				body: JSON.stringify(toSend)
			});
			if (response.ok)
			{
				setCookie('transcendence_session', $userInfo['username'] + '-token', 7, false);
				dispatch('message', { path: "/profile" });
			}
			else if (document.getElementById('error') === null || document.getElementById('error').innerText !== "Wrong token")
			{
				if (document.getElementById('error') !== null)
					document.getElementById('error').remove();
				const	err: HTMLElement = document.createElement('p');
				const	errText: Text = document.createTextNode('Wrong token');
				err.appendChild(errText);
				err.setAttribute('id', 'error');
				err.style.color = '#d61a1f';
				document.getElementById('container').appendChild(err);
			}
		}
	}

</script>

<div id="container">
	<p>Enter your super secure code, buddy</p>
	<input id="token" type="password" required>
	<button on:click|preventDefault={checkToken}>Submit</button>
</div>

<style>
	p {
		color: white;
	}
</style>