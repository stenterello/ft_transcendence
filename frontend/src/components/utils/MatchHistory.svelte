<script lang="ts">
    import UserIcon from "./UserIcon.svelte";
    import { webAppIP } from "../../data";

    export let  userInfo: Object;

    async function  getLastFiveMatches(): Promise<Array<Object>> | null {
        const   response: Response = await fetch(`http://${$webAppIP}:3000/game/official/` + userInfo['username']);
        const   json: Object = await response.json();

        const   ret: Array<Object> = [];
        for (let i = 0; i < 5 && i < Object.keys(json).length; i++) {
            ret.push(json[i]);
        }
        if (ret.length > 0)
            return ret;
        return (null);
    }

    function    firstScore(score: string): boolean {
        let p1: Number = Number(score.split("-")[0]);
        let p2: Number = Number(score.split("-")[1]);

        if (p1 > p2) return true;
        return false;
    }
</script>

{#await getLastFiveMatches()}
    <p>Loading...</p>
{:then matches}
    {#if matches !== null}
        <table>
            <tr>
                <th id="id"></th>
                <th id="opponent">Opponent</th>
                <th id="result">Final result</th>
            </tr>
            {#each matches as match}
                <tr>
                    <td>{matches.indexOf(match) + 1}</td>
                    {#if match['player1'] === userInfo['username']}
                        <td><UserIcon username={match['player2']} on:message /></td>
                    {:else}
                        <td><UserIcon username={match['player1']} on:message /></td>
                    {/if}
                    {#if (match['player1'] === userInfo['username'] && firstScore(match['score'])) ||
                            match['player2'] === userInfo['username'] && firstScore(match['score']) === false}
                        <td><div class="won">{match['score']}</div></td>
                    {:else}
                        <td><div class="lost">{match['score']}</div></td>
                    {/if}
                </tr>
            {/each}
        </table>
    {:else}
        <p>No matches yet</p>
    {/if}
{/await}

<style>
    table {
        min-width: 65%;
        margin: 0 auto;
        border: 1px solid black;
        border-radius: 1vw;
        empty-cells: show;
        overflow: hidden;
        border-spacing: 0;
    }
    tr:first-of-type {
        background-color: black;
        color: #fcd612;
    }
    th {
        font-family: 'TrashHand';
        font-size: 1.7em;
    }
    #id {
        width: 15%;
    }
    #opponent {
        width: 45%
    }
    #result {
        width: 20%;
    }
    td {
        color: black;
    }
    p {
        color: black;
        font-family: 'TrashHand';
        font-size: 2em;
    }
    td > div {
        width: fit-content;
        margin: 0 auto;
        border-radius: 1vw;
        padding: 4px;
    }
    .won {
        background-color: green;
    }
    .lost {
        background-color: red;
    }
</style>