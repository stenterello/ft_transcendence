<script lang="ts">
	import { userInfo, bearer, webAppIP } from "../../data";
	import { createEventDispatcher } from "svelte";
	import { loginWithPassword } from "../auth/authenticationUtils.svelte";

	const	dispatch = createEventDispatcher();

	async function	receiveBearer(): Promise<boolean> {
		const	username: string = document.getElementById('username').value;
		if (username !== $userInfo['username'])
		{
			if (document.getElementById('error') === null)
			{
				const	err: HTMLElement = document.createElement("p");
				const	errText: Text = document.createTextNode("Error in authentication");
				err.appendChild(errText);
				err.style.color = "#d61a1f";
				err.setAttribute('id', 'error');
				document.getElementById('inner').appendChild(err);
			}
			return false;
		}
		const	password: string = document.getElementById('password').value;

		const	res: Response =  await loginWithPassword(username, password, $webAppIP);
		if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
			if (document.getElementById('error') === null)
			{
				const	err: HTMLElement = document.createElement("p");
				const	errText: Text = document.createTextNode("Error in authentication");
				err.appendChild(errText);
				err.style.color = "#d61a1f";
				err.setAttribute('id', 'error');
				document.getElementById('inner').appendChild(err);
			}
			return false;
		}
		const	json: Object = await res.json();
		$userInfo['access_token'] = json['access_token'];
		$bearer = json['access_token'];
		return true;
	}

</script>

<div id="inner">
	<p>WARNING: restricted area</p>
	<p>Login again to grant access</p>
	<form>
		<input id="username" type="text" name="username" placeholder="Enter username" required>
		<input id="password" type="password" name="password" placeholder="Enter password" required>
		<input on:click|preventDefault={async () => { let bear = await receiveBearer(); dispatch('bearer', { bearer: bear }) } } type="submit">
	</form>
</div>