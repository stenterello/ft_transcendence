<script lang="ts">
	import AuthError from "./AuthError.svelte";
    import CreateUser from "./CreateUser.svelte";

	export let token: string | undefined;

	async function	getInfo(): Promise<string> | null{
		if (token === undefined)
			return null;
		const res = await fetch('https://api.intra.42.fr/v2/me', {
			method: 'GET',
			headers: new Headers({'Authorization': 'Bearer ' + token}),
		})
		const json = await res.json();
		return (json);
	}

	function	craftUserInfo(json: string): Map<string, string> {
		let ret: Map<string, string> = new Map();

		ret.set('username', json['login']);
		ret.set('email', json['email']);
		ret.set('pictureLink', json['image']['link']);
		return (ret);
	}

	async function	getJSON() {
		const	info: string = await getInfo();
		let ret = craftUserInfo(info);
		return (ret);
	}

</script>

{#if token === undefined}
	<AuthError />
{:else}
	{#await getJSON()}
		<p>I'm retrieving your cute data from 42 servers...</p>
	{:then values}
		<CreateUser userInfo={values} on:message />
	{/await}
{/if}
