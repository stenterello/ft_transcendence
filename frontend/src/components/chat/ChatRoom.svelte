<script lang="ts">
    import { statusChange, socket, roomSelected, userInfo, newMessage } from "../../data";
    import OnlineUsers from "./OnlineUsers.svelte";
    import RoomManagementBar from "./RoomManagementBar.svelte";
    import RoomManagement from "./RoomManagement.svelte";
    import Message from "./Message.svelte";

    export let  chat: string | null = null;
    let         roomManagement: boolean = false;
    let         optionChange: boolean = false;
    let         messages: Array<Object> = [];
    let         newMessages: boolean = false;

    async function  getMessages(): Promise<void> {
        const   res: Response = await fetch('http://localhost:3000/chat/' + chat);
        const   json: Array<Object> = await res.json();
        console.log(json);
        for (let i = 0; i < json.length; i++) {
            messages.push(json[i]);
        }
    }

    async function  getRoomObject(): Promise<Object> {
        const   res: Response = await fetch('http://localhost:3000/chat/rooms');
        const   json: Object = await res.json();
        for (let i = 0; i < Object.values(json).length; i++) {
            if (json[i]['name'] === chat)
                return json[i];
        }
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

    $socket.on(chat, (data: Object) => {
        messages.push(data);
        newMessages = (newMessages) ? false : true;
        setTimeout(scrollDown, 50);
    });



</script>

{#await getRoomObject()}
    <p>loading</p>
{:then roomInfo} 
    <section id="chat-space">
        {#if chat !== null}
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
                            <p>still no messages</p>
                        {/if}
                    {:else}
                        {#key optionChange}
                            {#await getRoomObject()}
                                <p>refreshing</p>
                            {:then roomInfo} 
                                <RoomManagement {roomInfo} on:optionChange={() => {optionChange = (optionChange) ? false : true} }/>
                            {/await}
                        {/key}
                    {/if}
                </div>
            {/await}
        {/if}
    </section>
{/await}


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