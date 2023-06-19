<script lang="ts">

	import { userInfo, socket } from "../../data";
	import { createEventDispatcher } from "svelte";

	export let	message: string = undefined;
	export let	privateMessage: Object = undefined;
	const		dispatch = createEventDispatcher();

	async function	sendRequest(username: string): Promise<void> {
		$socket.emit('friendRequest', username);
	}

	function  reduceMessage(event): void {
        event.target.classList.remove('open');
        let buttons: Array<HTMLButtonElement> = [...event.target.parentElement.parentElement.children];
        buttons.forEach((elem) => {
            if (elem.className.split(' ').includes('little-button'))
                elem.remove();
            });
    }

    function    expandMessage(event): Promise<void> {
        const   username: string = event.target.innerHTML.split(':')[0];
        let classes: Array<string> = event.target.className.split(' ');
        if (classes.includes('open'))
        {
            reduceMessage(event);
            return ;
        }
        event.target.classList.add('open');
        for (let i = 0; i < 3; i++)
        {
            let button: HTMLButtonElement = document.createElement('button');
            let buttonText: Text;
            switch (+i)
            {
                case 0:
                    {
                        buttonText = document.createTextNode('Show profile');
                        button.addEventListener('click', () => {
                            dispatch('message', { path: "/profile?user=" + username})
                        });
                        break ;
                    }
                case 1:
                    {
                        if ($userInfo['friends'].includes(username))
                            continue ;
                        buttonText = document.createTextNode('Add friend');
                        button.addEventListener('click', () => {
                            if (button.innerHTML === "friend request pending")
                                return ;
                            sendRequest(username);
                            button.innerHTML = "friend request pending";
                        });
                        break ;
                    }
                case 2:
                    {
                        buttonText = document.createTextNode('Challenge');
                        break ;
                    }
                default: break ;
            }
            button.appendChild(buttonText);
            event.target.parentElement.parentElement.appendChild(button);
            button.classList.add('little-button');
            button.style.fontSize = '0.7em';
            button.style.backgroundColor = 'black';
            button.style.color = '#fcd612';
            button.style.margin = '0px 5px 5px';
            button.style.padding = '0.5em 1em';
        }
    }

</script>

<div class="message">
	{#if message !== undefined}
		{#if message.startsWith($userInfo['username'])}
			<li class="user-message">{message}</li>
		{:else}
			<li><button on:click={expandMessage}>{message}</button></li>
		{/if}
	{:else}
		{#if privateMessage['author'] === $userInfo['username']}
			<li class="user-message">{privateMessage['author']}: {privateMessage['message']}</li>
		{:else}
			<li><button on:click={expandMessage}>{privateMessage['author']}: {privateMessage['message']}</button></li>
		{/if}
	{/if}
</div>

<style>
	li {
		position: relative;
		padding: 10px;
        border-top: 1px solid black;
        text-align: left;
        min-height: 25px;
	}

	li > button {
        background-color: unset;
        border-radius: unset;
        padding: unset;
        font-size: unset;
        font-weight: unset;
        font-family: unset;
        min-height: 25px;
        width: 100%;
        text-align: left;
        overflow-wrap: anywhere;
        outline: none;
    }

    .user-message {
        text-align: right;
        background-color: gray;
    }
</style>