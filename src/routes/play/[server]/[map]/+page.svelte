<script>
	import { goto } from "$app/navigation";
	import { accountStore, profileStore } from "$lib/stores";
	import Layout from "$lib/components/layout.svelte";
	import { onMount } from "svelte";

    onMount(() => {
        if(!$accountStore || !$profileStore) {
            goto('/');
        }
    });
</script>

<Layout>
	<p class="text-center">Connecting to server ...</p>
</Layout>
