<script lang="ts">

	import { setCookie } from "svelte-cookie";
	import { addDays } from "./authenticationUtils.svelte"
	import { createEventDispatcher } from "svelte";
	import { webAppIP } from "../../data";

	export let userInfo: Map<string, string> | null = undefined;
	const	dispatch = createEventDispatcher();

	async function	sendToBackend(map: Map<string, string>): Promise<void> {
		if (userInfo === null)
		{
			dispatch('message', { path: "/authError" });
		}
		const	date: Date = new Date();
		const	json: Object = Object.fromEntries(map);
		json['cookie'] = json['username'] + '-token';
		json['expires'] = addDays(date, 7).toISOString();

		await fetch(`http://${$webAppIP}:3000/users/auth`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(json)
		});
		
		setCookie('transcendence_session', json['username'] + '-token');
		dispatch('message', { path: "/profile" });
	}

	sendToBackend(userInfo);
	
</script>

<p>I'm saving your info</p>
