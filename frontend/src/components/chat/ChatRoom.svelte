<script lang="ts">
    import { statusChange, socket, roomSelected } from "../../data";
    import OnlineUsers from "./OnlineUsers.svelte";
    import RoomManagementBar from "./RoomManagementBar.svelte";
    import RoomManagement from "./RoomManagement.svelte";
    import Message from "./Message.svelte";
    import { createEventDispatcher } from 'svelte';

    let         roomManagement: boolean = false;
    let         optionChange: boolean = false;
    let         messages: Array<Object> = [];
    let         newMessages: boolean = false;
    const       dispatch = createEventDispatcher();

    async function  getMessages(): Promise<void> {
        const   res: Response = await fetch('http://localhost:3000/chat/' + $roomSelected);
        const   json: Array<Object> = await res.json();
        console.log(json);
        for (let i = 0; i < json.length; i++) {
            messages.push(json[i]);
        }
    }

    async function  getRoomObject(): Promise<Object> {
        await mock();
        const   res: Response = await fetch('http://localhost:3000/chat/rooms');
        const   json: Object = await res.json();
        for (let i = 0; i < Object.values(json).length; i++) {
            if (json[i]['name'] === $roomSelected)
            {
                return json[i];
            }
        }
    }

    function    mock(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    function	scrollDown(): void {
        if (document.getElementById('message-list-active') === null)
            return ;
		const	messages: HTMLCollection = document.getElementById('message-list-active').children;
		const	lastMessage: Element = messages[messages.length - 1];
        if (lastMessage !== undefined && lastMessage.nodeName !== "P")
    		lastMessage.scrollIntoView(false);
		else setTimeout(scrollDown, 200);
	}

    $socket.on($roomSelected, (data: Object) => {
        messages.push(data);
        newMessages = (newMessages) ? false : true;
        setTimeout(scrollDown, 50);
    });

    $socket.on('kicked', (data: Object) => {
        if (data['room'] === $roomSelected) {
            $roomSelected = undefined;
            optionChange = (optionChange) ? false : true;
        }
    })

</script>

{#key optionChange}
    {#await getRoomObject()}
        <p>loading</p>
    {:then roomInfo} 
        <section id="chat-space">
            {#if $roomSelected !== undefined}
                {#key $statusChange}
                    <OnlineUsers users={roomInfo['members']} --height="25%" on:message />
                {/key}
                {#await getMessages()}
                    <p>loading</p>
                {:then}
                    <div id="messages">
                        <RoomManagementBar {roomInfo} on:options={ () => {roomManagement = (roomManagement) ? false : true;} } />
                        {#if roomManagement === false}
                            {#if messages !== undefined && Object.values(messages).length > 0}
                                <ul id="message-list-active" style="overflow: auto">
                                    {#key newMessages}
                                        {#each messages as message}
                                            <Message privateMessage={message} on:message />
                                        {/each}
                                    {/key}
                                </ul>
                            {:else}
                                {#key newMessages}
                                    {#if messages !== undefined && Object.values(messages).length > 0}
                                        <ul id="message-list-active" style="overflow: auto">
                                            {#each messages as message}
                                                <Message privateMessage={message} on:message />
                                            {/each}
                                        </ul>
                                    {:else}
                                        <p>still no messages</p>
                                    {/if}
                                {/key}
                            {/if}
                        {:else}
                            <RoomManagement {roomInfo} on:optionChange={() => {optionChange = (optionChange) ? false : true; dispatch('reloadRooms', null);} }/>
                        {/if}
                    </div>
                {/await}
            {/if}
        </section>
    {/await}
{/key}



<style>
    #chat-space {
		background-color: white;
		position: absolute;
		bottom: 13%;
		height: 43%;
        width: 100%;
        z-index: 1;
	}
    #messages {
        background-color: white;
        border: 1px solid black;
        height: 75%;
    }
    ul {
        margin: 0;
        height: 84%;
        padding: 0;
    }
    
</style>