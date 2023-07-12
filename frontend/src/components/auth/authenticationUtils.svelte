<script context="module" lang="ts">

	export enum authenticationState {
		initial,
		authorizationCode,
		withCookie,
		error
	}

	export function	addDays(date: Date, days: number): Date {
		date.setDate(date.getDate() + days);
		return date;
	}

	export async function	loginWithPassword(username: string, password: string, ip:string): Promise<Response> {
		const	map: Map<string, string> = new Map([
			['username', username],
			['password', password]
		]);
		const	json: Object = Object.fromEntries(map);
		const	response: Response = await fetch(`http://${ip}:3000/auth/login`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(json)
		});
		return response;
	}

	export async function	receiveBearer(userInfo: Object, ip: string): Promise<boolean> {
		const	username: string = document.getElementById('username').value;
		if (username !== userInfo['username'])
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

		const	res: Response =  await loginWithPassword(username, password, ip);
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
		userInfo['access_token'] = json['access_token'];
		return true;
	}
</script>