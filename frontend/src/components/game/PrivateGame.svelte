<script lang="ts">
    import { onMount } from "svelte";
    import { socket, userInfo, opponent, pos, webAppIP, mapUrl, racketSize } from "../../data";
    import CombatLogo from "./CombatLogo.svelte";
    import { createEventDispatcher } from "svelte";
    import { retrieveOtherUserInfoByName } from "../chat/interactionUtils.svelte";

    let         point1: number = 0;
    let         point2: number = 0;
    export let  isSpectator: boolean = false;

    const       dispatch = createEventDispatcher();

    if ($mapUrl !== "unset" && $mapUrl !== "default") {
        const   imageName: string = $mapUrl;
        $mapUrl = `url(http://${$webAppIP}:5173/images/maps/` + imageName + ")";
    }
    else
        $mapUrl = "unset";

    $racketSize += '%';

    function    updateBall(info: Object): void {
        const   ball: HTMLElement = document.getElementById('ball');
        if (ball === null)
            return ;
        ball.style.top = info['ballY'] + '%';
        ball.style.left = info['ballX'] + '%';
    }

    function    updateRackets(info: Object): void {
        const   leftRacket: HTMLElement = document.getElementById('left');
        const   rightRacket: HTMLElement = document.getElementById('right');

        if (leftRacket === null || rightRacket === null)
            return ;

        leftRacket.style.top = info['lp'] + '%';
        rightRacket.style.top = info['rp'] + '%';
    }

    function    updatePoints(info: Object): void {
        if (point1 !== info['p1'])
            point1 = info['p1'];
        if (point2 !== info['p2'])
            point2 = info['p2'];
    }

    onMount(() => {
        $socket.on('update', (info: Object) => {
            updateBall(info);
            updateRackets(info);
            updatePoints(info);
        })
        $socket.on('endGame', () => {
            $socket.removeAllListeners('update');
            $socket.emit('status', 'online');
            $opponent = undefined;
            $pos = undefined;
            if (isSpectator)
                dispatch('endgame', null);
            else
                dispatch('message', { path: "/profile" });
        })            
    })

    function    moveRacket(event: KeyboardEvent): void {
        if (event.key === 'ArrowUp') {
            $socket.emit('privateUp');
        }
        else if (event.key === 'ArrowDown') {
            $socket.emit('privateDown');
        }
    }

    $socket.emit('status', 'in game');

    window.addEventListener('keydown', moveRacket)

</script>

{#await retrieveOtherUserInfoByName($opponent, $webAppIP)}
    <p>loading</p>
{:then opponentObj} 
    {#if isSpectator === false}
        <div class="game">
            {#if $pos === 'left'}
                {#key point1}
                    <CombatLogo user={$userInfo} left={true} points={point1} />
                {/key}
                {#key point2}
                    <CombatLogo user={opponentObj} left={false} points={point2} />
                {/key}
            {:else}
                {#key point1}
                    <CombatLogo user={opponentObj} left={true} points={point1} />
                {/key}
                {#key point2}
                    <CombatLogo user={$userInfo} left={false} points={point2} />
                {/key}
            {/if}
            <section id="game" style="--map-url: {$mapUrl}">
                <div class="racket" id="left" style="--racket-size: {$racketSize}"></div>
                <div class="racket" id="right" style="--racket-size: {$racketSize}"></div>
                <div id="ball"></div>
            </section>
        </div>
    {:else}
        <div class="game-spectator">
            <div id="logo-container">
                {#key point1}
                    <CombatLogo user={$userInfo} left={true} points={point1} {isSpectator} />
                {/key}
                <p>VS</p>
                {#key point2}
                    <CombatLogo user={$userInfo} left={false} points={point2} {isSpectator} />
                {/key}
            </div>
            <section id="game-spectator" style="--map-url: {$mapUrl}">
                <div class="racket" id="left" style="--racket-size: {$racketSize}"></div>
                <div class="racket" id="right" style="--racket-size: {$racketSize}"></div>
                <div id="ball"></div>
            </section>
        </div>
    {/if}
{/await}

<style>
    #logo-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-bottom: 20px;
        position: unset;
    }
    #logo-container > p {
        font-family: 'TrashHand';
        color: white;
        font-size: 2em;
    }
    .game {
        overflow: hidden;
        position: absolute;
        height: 98vh;
        width: 74vw;
        top: 0;
        left: 0;
        padding: 0;
        margin: 0;
    }
    .game-spectator {
        height: 60vh;
        width: 100%;
    }
    section#game {
        overflow: hidden;
        position: absolute;
        bottom: 0;
        left: 3%;
        height: 85vh;
        width: 70vw;
        border: 1px solid white;
        background-image: var(--map-url);
        background-size: cover;
    }
    section#game-spectator {
        overflow: hidden;
        height: 75%;
        width: 100%;
        border: 1px solid white;
        position: relative;
        background-image: var(--map-url);
        background-size: cover;
    }
    .racket {
        width: 2%;
        height: var(--racket-size);
        background-color: white;
        position: absolute;
    }
    #left {
        left: 2%;
    }
    #right {
        right: 2%;
    }
    #ball {
        border-radius: 50%;
        background-color: white;
        width: 2%;
        height: 3%;
        position: absolute;
        top: 50%;
        left: 50%;
    }
</style>