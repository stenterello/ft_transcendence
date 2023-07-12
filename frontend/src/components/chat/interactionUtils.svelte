<script lang="ts" context="module">
    export async function	retrieveOtherUserInfo(ip: string): Promise<Object | null> {
		const	otherUsername: string = window.location.search.substring(6);
		const	response: Response = await fetch(`http://${ip}:3000/users/` + otherUsername + '-token');

		try {
			const	json: Object = await response.json();
			return (json);
		}
		catch {
			return null;
		}
	}

    export async function	retrieveOtherUserInfoByName(username: string, ip: string): Promise<Object | null> {
		const	response: Response = await fetch(`http://${ip}:3000/users/` + username + '-token');

		try {
			const	json: Object = await response.json();
			return (json);
		}
		catch {
			return null;
		}
	}

    export async function	blockUser(userInfo: Object, username: string, ip: string): Promise<void> {
        await fetch(`http://${ip}:3000/users/block/` + username, {
            method: 'POST',
            body: userInfo['username']
        });
    }

    export async function	unblockUser(userInfo: Object, username: string, ip: string): Promise<void> {
        await fetch(`http://${ip}:3000/users/unblock/` + username, {
            method: 'POST',
            body: userInfo['username']
        });
    }

    export async function   searchUser(username: string, ip: string): Promise<Object> | null {
        const   res: Response = await fetch(`http://${ip}:3000/users/` + username + '-token');
        try {
            const   json: Object = await res.json();
            return json;
        }
        catch {
            return null;
        }
    }

    export async function	getStatus(username: string, ip: string): Promise<string> {
		const	response: Response = await fetch(`http://${ip}:3000/users/` + username + '-token');
		const	json: Object = await response.json();
		return (json['status']);
	}

    export async function	getLastMessage(userInfo: Object, username: string, ip: string): Promise<Object> {
		const	res: Response = await fetch(`http://${ip}:3000/chat/` + userInfo['username'] + '/' + username);
		const	json: Object = await res.json();
		return Object.values(json).at(-1);
	}

</script>