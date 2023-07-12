<script lang="ts">
    import { socket } from "../../data";
    import GetInfo from "./GetInfo.svelte";


	export let code: string | undefined = undefined;

	const grant_type: string = 'authorization_code';
	const client_id: string = 'u-s4t2ud-adc0efe1a0bf91978d89796314b8297930becce3a35c95f623c2059b571c45ad';
	const client_secret: string = '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';
	const redirect_uri: string = 'http://localhost:3000/auth/code';

	function craftPayload(code: string): string {
		const keys: string[] = [ 'grant_type', 'client_id', 'client_secret' ];
		const values: string[] = [ grant_type, client_id, client_secret ];
		let ret: string = "";
		for (let i = 0; i < values.length; i++)
		{
			ret = ret.concat(keys[i]);
			ret = ret.concat('=');
			ret = ret.concat(values[i]);
			if (i < values.length - 1)
				ret = ret.concat('&');
		}
		ret = ret.concat("&code=");
		ret = ret.concat(code);
		ret = ret.concat('&redirect_uri=');
		ret = ret.concat(redirect_uri);
		return (ret);
	}

	async function getToken() {
		// const res = await fetch('https://api.intra.42.fr/oauth/token', {
		// 	// mode: 'no-cors',
		// 	method: 'POST',
		// 	headers: new Headers(
		// 		{'Access-Control-Allow-Origin': '*', 'content-type': 'application/x-www-form-urlencoded'},
		// 	),
		// 	body: craftPayload(code)
		// })
		const res = await fetch('http://localhost:3000/auth/access_token', {
			method: 'GET',
		})
		
		console.log('res ' + res);
		const json: Object = await res.json();
		// console.log('json ' + json);
		return (json.toString());
	}

</script>

{#await getToken()}
	<p>Yoopie! I'm searching your beautiful token!</p>
{:then token}
	<GetInfo {token} on:message />
{/await}
