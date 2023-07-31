<script lang="ts">

    import { createEventDispatcher } from "svelte";
    import { opponent, socket, userInfo, webAppIP } from "../../data";

    export let  username: string = undefined;
    export let  expandable: boolean = false;
    let         isOpen: boolean = false;

    const   dispatch = createEventDispatcher();

    async function	retrieveOtherUserInfo(username: string): Promise<Object | null> {
		const	response: Response = await fetch(`http://${$webAppIP}:3000/users/` + username + '-token');

		try {
			const	json: Object = await response.json();
			return (json);
		}
		catch {
			return null;
		}
	}

    async function	sendRequest(username: string): Promise<void> {
		$socket.emit('friendRequest', username);
	}

    function    chatFriendRequest(user: Object): void {
        if ($userInfo['friendsReq'].includes(user['username']))
            return ;
        sendRequest(user['username']);
    }

    function    openButtons(user: Object, event): void {
        const   div: HTMLElement = event.target.parentElement;
        const   div2: HTMLElement = document.createElement('div');
        div2.setAttribute('id', 'buttons-container');
        div2.style.display = 'flex';
        div2.style.alignItems = 'center';
        div2.style.justifyContent = 'space-around';
        let     button: Array<HTMLButtonElement> = [];
        let     text: Text | null;

        div.appendChild(div2);
        for (let i = 0; i < 3; i++) {
            switch (+i)
            {
                case 0: {
                    button[i] = document.createElement('button');
                    button[i].style.fontSize = '0.6em';
                    button[i].addEventListener('click', () => dispatch('message', { path: "/profile?user=" + user['username'] }))
                    text = document.createTextNode('Show profile');
                    break ;
                }
                case 1: {
                    button[i] = document.createElement('button');
                    button[i].style.fontSize = '0.6em';
                    if ($userInfo['friends'].includes(user['username']))
                        continue ;
                    else if ($userInfo['friendsReq'].includes(user['username'])) {
                        text = document.createTextNode('Friend request pending');
                    }
                    else {
                        button[i].addEventListener('click', (event) => {
                            chatFriendRequest(user);
                            event.target.innerHTML = 'Friend request pending';
                        })
                        text = document.createTextNode('Add friend');
                    }
                    break ;
                }
                case 2: {
                    if (user['status'] !== 'online' || $userInfo['friends'].includes(user['username']) === false)
                        continue ;
                    button[i] = document.createElement('button');
                    button[i].style.fontSize = '0.6em';
                    text = document.createTextNode('Invite to play');
                    button[i].appendChild(text);
                    button[i].addEventListener('click', () => { $opponent = user['username']; dispatch('message', { path: '/invitationWindow'})});
                }
                default: break ;
            }
            button[i].appendChild(text);
            div2.appendChild(button[i]);
            div.after(div2);
        }
        isOpen = true;
    }

    function    closeButtons(): void {
        document.getElementById('buttons-container').remove();
        isOpen = false;
    }

    function    toggleIcon(user: Object, event): void {
        if (!isOpen)
            openButtons(user, event);
        else
            closeButtons();
    }

</script>

{#await retrieveOtherUserInfo(username)}
    <p>Loading</p>
{:then otherUserInfo}
    <div id="user-container">
        <img loading="lazy" src="{otherUserInfo['pictureLink']}" alt="user pic" />
        {#if expandable === false}
            <button on:click|preventDefault={ () => {
                if ($userInfo['username'] === otherUserInfo['username'])
                    dispatch('message', {path: "/profile"})
                else
                    dispatch('message', {path: "/profile?user=" + username})
            }
        }>{username}</button>
        {:else}
            <button on:click|preventDefault={ (event) => toggleIcon(otherUserInfo, event) }>{username}</button>
        {/if}
        {#if otherUserInfo['status'] === 'online'}
            <p><span class="dot online">·</span> {otherUserInfo['status']}</p>
        {:else if otherUserInfo['status'] === 'in game'}
            <p><span class="dot ingame">·</span> {otherUserInfo['status']}</p>
        {:else}
            <p><span class="dot offline">·</span> {otherUserInfo['status']}</p>
        {/if}
    </div>
{/await}

<style>
    div {
        margin: 4%;
        padding: 2%;
        display: flex;
        justify-content: space-around;
        flex-direction: var(--flex-direction);
        align-items: center;
        background-color: #f8b71d;
        border-radius: 1vw;
    }

    p {
        margin: 0;
        height: 3em;
        position: relative;
        top: -1.6em;
    }

    img {
        max-width: 40%;
        max-height: 50px;
        margin: 10px;
        object-fit: scale-down;
    }

    button {
        cursor: pointer;
        background-color: black;
        color: #fcd612;
        min-width: 40%;
        z-index: 10;
    }

    .dot {
        font-size: 3em;
        position: relative;
        top: 10px;
        margin: 0;
    }

    .online {
        color: green;
    }

    .ingame {
        color: #d61a1f;
    }

    .offline {
        color: black;
    }
</style>