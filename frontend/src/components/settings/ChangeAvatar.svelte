<script lang="ts">

    import Carousel from "../utils/Carousel.svelte";
	import { createEventDispatcher } from 'svelte';
	import { userInfo, bearer, webAppIP } from "../../data";
    import GetBearer from "./GetBearer.svelte";


	const	dispatch = createEventDispatcher();

	let	killBillImages: Array<string> = [ "the_bride.png", "hattori_hanzo.png", "paimei.png" ];
	let	dvasImages: Array<string> = [ "vernita_green.png", "o-ren.png", "elle_driver.png", "budd.png", "bill.png" ];

	killBillImages.forEach((val, index) => killBillImages[index] = "images/" + val);
	dvasImages.forEach((val, index) => dvasImages[index] = "images/" + val);

	let idx: number = 0;
	let index: number = 0;

	const killBillDescriptions: Array<string> = [
		"Kiddo is a member of the Deadly Viper Assassination Squad, an elite, shadowy group of assassins. She is trained by martial arts master Pai Mei and becomes the right hand of Bill, her boss and lover, provoking the envy of fellow Viper Elle Driver.", "Hattori Hanzō is the finest swordsmith in the world; however, he has not created a new sword in over a quarter-century because he feels guilty for making instruments used to kill humans. In realizing Beatrix Kiddo wants \"Japanese steel\" to dispatch his former student, Bill, who has displeased his former master by his dishonorable actions, Hanzō spends a month crafting what he considers his finest sword. He presents it to her, saying that if even God gets in her way, \"God will be cut.\"",
		"Pai Mei was a legendary master of the Bak Mei and Eagle's Claw styles of kung fu. He was the teacher of Bill, Elle Driver, and Beatrix Kiddo, and was responsible for the removal of Elle's right eye. He taught Beatrix the fatal movement known as the Five Point Palm Exploding Heart Technique and the Three Inch Punch."
	];
	const dvasDescriptions: Array<string> = [
		"Vernita Green was a member of the Deadly Viper Assassination Squad and was involved with the Massacre at Two Pines thus causing herself to be named on the Death List Five by Beatrix Kiddo.",
		"O-Ren Ishii (石井 オーレン) (Ishii O-Ren) was a member of the Deadly Viper Assassination Squad known by her code-name Cottonmouth. She was born on an American military base in Tokyo, Japan. She is a half Chinese-Japanese American who was the daughter of a military man and a housewife. O-Ren eventually became the leader of a crime organization in Tokyo called the Yakuza, where she led the Crazy 88 and Gogo Yubari.",
		"Elle originally worked for Interpol and was sent on an assignment to apprehend Bill. Upon tracking him down, she soon fell in love with him despite his dating Beatrix. He offered her a job as an elite assassin and she accepted, just so she could be around him.",
		"Budd was recognized by Bill as \"the only man [he] ever loved.\" He was the only other male Deadly Viper, and since the assassination squad's disbandment, took to living a rather lonely life in a recreational vehicle, where he steadily became a redneck like alcoholic, making ends meet by working as a bouncer at a strip club. When told by Bill that Beatrix was coming to kill him, Budd philosophically said \"that woman deserves her revenge. And we deserve to die. But then again, so does she. So, I guess we'll see, won't we?\"",
		"Bill was once a student of Pai Mei and of Hattori Hanzō, whom he betrayed. Eventually, he establishes his own assassin-for-hire organization, the Deadly Viper Assassination Squad."
	];

	const options: Array<Array<string>|undefined> = [killBillImages, dvasImages, undefined];
	const descriptions: Array<Array<string>|undefined> = [killBillDescriptions, dvasDescriptions, undefined];

	async function	saveAvatar() {
		switch(+idx) {
			case 0: {
				const body: Object = new Object();
				body['username'] = $userInfo['username'];
				body['pictureLink'] = (`http://${$webAppIP}:3000/uploads/` + killBillImages[index]);
				await fetch(`http://${$webAppIP}:3000/users/update/avatar`, {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify(body)
				});
				break;
			}
			case 1: {
				const body: Object = new Object();
				body['username'] = $userInfo['username'];
				body['pictureLink'] = (`http://${$webAppIP}:3000/uploads/` + dvasImages[index]);
				await fetch(`http://${$webAppIP}:3000/users/update/avatar`, {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify(body)
				});
				break;
			}
			case 2: {
				const	files = document.getElementById('upload-image').files;
				const	formData = new FormData();
				formData.append('image', files[0]);
				const file_path = await fetch(`http://${$webAppIP}:3000/users/upload`, {
					method: 'POST',
					body: formData
				})
				const json = await file_path.json();
				const body: Object = new Object();
				body['username'] = $userInfo['username'];
				body['pictureLink'] = (`http://${$webAppIP}:3000/` + json['result']);		
				await fetch(`http://${$webAppIP}:3000/users/update/avatar`, {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify(body)
				});
			}
			break;
		}
		dispatch('message', { path: "/profile" });
	}

	if ($userInfo === null || $userInfo === null)
		dispatch('message', { path: "/" });

	let	hasBearer: boolean = (($bearer !== "") ? true : false);

	function	changeIndex(): void {
		idx = document.getElementById('select-box').value;
	}

	$: {
		hasBearer = (($bearer !== "") ? true : false);
	}

</script>

{#key hasBearer}
	{#if hasBearer === false && $userInfo['isOAuthLogged'] === false}
		<GetBearer on:bearer={ (event) => hasBearer = event.detail.bearer }/>
	{:else}
		<img id="image-profile" src={$userInfo['pictureLink']} alt="profile" style="margin-top: 20px;"/>
		<hr>
		<div>
			<h1>Change your character</h1>
			<div id="choose-box">
				<div>
					<select id="select-box" on:change={changeIndex}>
						<option value="0">Take vengeance over Bill</option>
						<option value="1">Join the D.V.A.S.</option>
						<option value="2">Follow your own path</option>
					</select>
					<Carousel bind:images={options[idx]} bind:descriptions={descriptions[idx]} bind:image_show={index}/>
					<button on:click|preventDefault={() => saveAvatar()} id="submit-button">select</button>
				</div>
			</div>
		</div>
	{/if}
{/key}
	
<style>

	* {
		font-family: 'TrashHand';
	}

	#choose-box {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: center;
		margin: 10px auto;
		max-width: 70vw;
	}

	#choose-box > div {
		margin: 0 auto;
	}

	#image-profile {
		max-width: 26vw;
	}

	select {
		text-align: center;
		font-size: 2em;
		margin: 20px auto;
		background: darkgray;
		color: black;
		padding: 10px;
		background-color: #d61a1f;
	}

	#submit-button {
		padding: 10px 50px;
		color: black;
		font-size: 3em;
		color: #f9c31a;
		background-color: black;
		margin: 30px auto;
		border: 1px solid black;
	}

	h1 {
		color: black;
	}

</style>
