<script lang="ts">

	export let	images: Array<string> | undefined;
	export let	descriptions: Array<string> | undefined;

	export let	image_show: number = 0;
	
	function	moveRight(): void {
		image_show += 1;
		if (image_show > images.length - 1)
			image_show = 0;

		let	image_width: number = document.getElementById(images[image_show]).clientWidth;
		document.getElementById('carousel').scroll(image_width * image_show, 0);
	}

	function	moveLeft(): void {
		image_show -= 1;
		if (image_show === -1)
			image_show = images.length - 1;

		let	image_width: number = document.getElementById(images[image_show]).clientWidth;
		document.getElementById('carousel').scroll(image_width * image_show, 0);
	}

	function	render(): void {
		document.getElementById('container').style.width = document.getElementById(images[0]).clientWidth.toString() + 'px';
	}
	
	export function getIndex() {
		return image_show;
	}

</script>

{#if images !== undefined}
	<div id="container">
		<button id="left" on:click={moveLeft}>&lt;</button>
		<button id="right" on:click={moveRight}>&gt;</button>
		<ul id="carousel">
			{#each images as image}
				<li class="carousel-item">
					<img id="{image}" src="{image}" alt="{image}" on:load={render} >
					<p class="description">{descriptions[image_show]}</p>
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<p class="description">Rise, and let me look at your ridiculous face. Rise. So, my pathetic friend … is there anything that you can do well?</p>
	<input id="upload-image" type="file" accept="image/png,image/jpeg" style="display: block; margin: 40px auto;" required>
{/if}

<style>

	li {
		list-style: none;
		margin: 0;
		padding: 0;
		user-select: none;
	}

	#container {
		position: relative;
		margin: 0 auto;
	}

	#carousel {
		display: flex;
		overflow-x: hidden;
		counter-reset: item;
		scroll-behavior: smooth;
		scroll-snap-type: x mandatory;
		padding: 0;
		width: 100%;
		height: fit-content;
	}

	.carousel-item {
		position: relative;
		width: 100%;
		counter-increment: item;
	}

	*::-webkit-scrollbar {
		width: 0;
	}

	*::-webkit-scrollbar-track {
		background: transparent;
	}

	*::-webkit-scrollbar-thumb {
		background: transparent;
		border: none;
	}

	* {
		-ms-overflow-style: none;
	}

	button {
		position: absolute;
		background-color: darkgray;
		color: black;
		z-index: 1000;
		top: 230px;
	}

	#left {
		left: -25px;
	}

	#right {
		right: -25px;
	}

	.description {
		font-family: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif';
		font-size: 1.3em;
		padding: 5px;
	}

</style>
