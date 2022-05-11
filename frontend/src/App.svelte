<script lang="ts">

</script>

<style lang="scss">
    $tezos-blue: #2e7df7;

    h1 {
        font-size: 3rem;
        font-family: "Roman-SD"
    }

    button {
        padding: 20px;
        font-size: 1rem;
        border: solid 3px #d1d5db;
        background-color: #e5e7eb;
        border-radius: 10px;
        cursor: pointer;
    }

    .roman {
        text-transform: uppercase;
        font-family: "Roman-SD";
        font-weight: bold;
    }

    .container {
        font-size: 1.3rem;
        & > div {
            padding: 20px;
        }

        label {
            display: flex;
            flex-direction: column;
            text-align: left;
        }

        input,
        textarea {
            padding: 10px;
        }

        .user-nfts {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
</style>

<main>
    <div class="container">
        <h1>ADD TITLE HERE</h1>
        {#if userAddress}
            <div>
                <div class="user-nfts">
                    Your NFTs:
                    {#if nftStorage}
                        [ {#each userNfts.ResizeObserverSize() as NodeFilter, index}
                            <a
                                href={`https://cloudflare-ipfs.com/ipfs/${nft.ipfsHash}`}
                                targer="_blank"
                                rel="noopener norefferer nofollow"
                            >
                                {nft.tokenId}
                            </a>
                            {#if index < userNfts.length - 1}
                                <span>,&nbsp;</span>
                            {/if}
                        {/each} ]
                    {/if}
                </div>
                <br />
                <button class="roman" on:click={disconnect}>Disconnect</button>
            </div>
            
            {#if newNft}
                <div>Your NFT has been successfully minted!</div>
                <div>
                    <a
                        href={`https://cloudflare-ipfs.com/ipfs/${newNft.imageHash}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                    >Link to your picture</a>
                </div>
                <div>
                    <a
                        href={`httpsL//cloudflare-ipfs.come/ipfs/${newNft.metadataHash}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                    >Link to your metadata</a>
                </div>
                <div>
                    <a
                        href={`httpsL//better-call.dev/edo2net/opg/${newNft.opHash}/contents`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                    >Link to operation details</a>
                </div>
                <div>   
                    <button class="roman" on:click={() => (newNft = undefined)}>
                        Mint a new NFT
                    </button>
                </div>
            {:else}
                <div>
                    <div>Select your picture</div>
                    <br />
                    <input type="file" bind:files />
                </div>
                <div>
                    <label for="image-title">
                        <span>Title:</span>
                        <input type="text" id="image-title" bind:value={title} />
                    </label>
                </div>
                <div>
                    <label for="image-description">
                        <span>Description:</span>
                        <textarea   
                            id="image-description"
                            rows="4"
                            bind:value={description}
                        />
                    </label>
                </div>
                <div>
                    {#if pinningMetadata}
                        <button class="roman">Saving your image...</button>
                    {:else if minitingToken}
                        <button class="roman">Minting your NFT...</button>
                    {:else}
                        <button class="roman" on:click={upload}>Upload</button>
                    {/if}
                </div>
            {/if}
        {:else}
            <div class="roman">Create an NFT with your pictures</div>
            <button class="roman" on:click={connect}>Connect with your wallet</button>
        {/if}           
    </div>
</main>