<script lang="ts">
    import { generalMessages, onlineUsers, statusChange } from "../../data";
    import Message from "./Message.svelte";
    import OnlineUsers from "./OnlineUsers.svelte";
    import { afterUpdate } from "svelte";

    function	scrollDown(): void {
        if (document.getElementById('message-list') === null)
            return ;
		const	messages: HTMLCollection = document.getElementById('message-list').children;
		const	lastMessage: Element = messages[messages.length - 1];
        if (lastMessage !== undefined)
    		lastMessage.scrollIntoView(false);
	}

    afterUpdate(scrollDown);  

</script>

{#key $statusChange}
    <OnlineUsers users={$onlineUsers} --height="18%" on:message />
{/key}
<ul id="message-list">
    {#each $generalMessages as message}
        <Message {message} on:message />
    {/each}
</ul>

<style>
    ul {
        list-style-type: none;
        background-color: white;
        padding: 0;
        margin: 0;
        overflow: auto;
        height: 54%;
        overflow-wrap: anywhere;
        overflow: auto;
    }
</style>