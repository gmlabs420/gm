// Import necessary modules and libraries
import { ethers } from 'ethers';
import { getContract, createThirdwebClient, prepareContractCall, sendTransaction, resolveMethod } from "thirdweb";
import { createWallet, injectedProvider } from "thirdweb/wallets";
import { optimismSepolia } from "thirdweb/chains";


// Declare contract variable
let contract;

// Asynchronous function to initialize Thirdweb SDK
async function initializeThirdweb() {
    const client = createThirdwebClient
    const myChain = optimismSepolia;
    const metamask = createWallet("io.metamask");

    // Attempt to connect the wallet
    if (injectedProvider("io.metamask")) {
        await metamask.connect({ client });
    } else {
        await metamask.connect({
            client,
            walletConnect: { showQrModal: true },
        });
    }

    // Get the contract
    contract = getContract({
        client,
        chain: myChain,  // Ensure that myChain is correctly defined
        address: "0x43532a1edB1c303AA37D1cFDA29235e6CB20E30D",
    });
}

// Call initialize function when the document is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await initializeThirdweb();
    setupConnectionButton('connectButton');
    setupConnectionButton('connectButton2');
    setupToggleAndPriceUpdate();
    setupAccordion();
    setupMintButton('mintGmButton', 0);
    setupMintButton('mintGmButton2', 1);
    setupTextButton('generateTextButton', "Good Morning");
    setupTextButton('generateTextButton2', "Good Night");
    setupCopyButtons();
    setupToggles();
});


// Define the function to handle transactions
async function handleTransactions() {
    // Example of a function to handle a transaction. Specify parameters as needed.
    // Example parameters: _receiver, _tokenId, _quantity, _currency, _pricePerToken, _allowlistProof, _data
    let transaction = await prepareContractCall({
        contract,
        method: resolveMethod("claim"),
        params: ["0xReceiverAddress", 1, 10, "ETH", "0.001", [], {}]
    });
    let result = await sendTransaction({
        transaction,
        account: "0xYourAccountAddress" // The user's account address
    });
    console.log(`Transaction Hash: ${result.transactionHash}`);
}

// Setup the connection button
function setupConnectionButton(buttonId) {
    const connectButton = document.getElementById(buttonId);
    if (!connectButton) return;
    let isConnected = false;

    connectButton.addEventListener('click', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                console.log('Connected account:', await signer.getAddress());
                isConnected = true;
            } catch (error) {
                console.error('Error connecting:', error);
                isConnected = false;
            }
            updateButtonState(connectButton, isConnected);
        } else {
            console.log('MetaMask is not installed!');
        }
    });

    ethereum.on('accountsChanged', (accounts) => {
        isConnected = accounts.length > 0;
        updateButtonState(connectButton, isConnected);
    });
}

function updateButtonState(button, isConnected) {
    if (isConnected) {
        button.textContent = 'Connected';
        button.disabled = true;
        button.classList.add('connected');
    } else {
        button.textContent = 'Connect';
        button.disabled = false;
        button.classList.remove('connected');
    }
}

    // Setup listeners for quantity adjustment and price updates
    setupToggleAndPriceUpdate();

    // Setup accordion functionality
    setupAccordion();

    // Setup mint buttons for different token IDs
    setupMintButton('mintGmButton', 0);
    setupMintButton('mintGmButton2', 1);

    // Setup generate text buttons for different prompts
    setupTextButton('generateTextButton', "Good Morning");
    setupTextButton('generateTextButton2', "Good Night");

    // Setup copy buttons for text and images
    setupCopyButtons();

    // Handling page and footer toggles
    setupToggles();


function setupToggleAndPriceUpdate() {
    const apiURL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD';
    const quantityInput = document.getElementById('nftQuantity');
    const totalPriceElementEth = document.getElementById('totalPriceEth');
    const totalPriceElementUsd = document.getElementById('totalPriceUsd');
    const mintPricePerNFT = 0.000420;
    let ethPriceInUSD = 0;

    async function fetchEthPrice() {
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            ethPriceInUSD = data.ethereum.usd;
            updatePrices(parseInt(quantityInput.value, 10));
        } catch (error) {
            console.error('Failed to fetch ETH price:', error);
        }
    }

    function updatePrices(quantity) {
        const totalPriceEth = (quantity * mintPricePerNFT).toFixed(6);
        const totalPriceUsd = (totalPriceEth * ethPriceInUSD).toFixed(2);
        totalPriceElementEth.textContent = `${totalPriceEth} ETH`;
        totalPriceElementUsd.textContent = `$${totalPriceUsd} USD`;
    }

    function adjustQuantity(isIncrease) {
        let currentValue = parseInt(quantityInput.value, 10);
        currentValue = isIncrease ? currentValue + 1 : Math.max(1, currentValue - 1);
        quantityInput.value = currentValue;
        updatePrices(currentValue);
    }

    document.getElementById('increaseQuantity').addEventListener('click', () => adjustQuantity(true));
    document.getElementById('decreaseQuantity').addEventListener('click', () => adjustQuantity(false));

    fetchEthPrice();
}

function setupAccordion() {
    document.querySelectorAll('.accordion, .accordion2, .accordion3, .accordion4').forEach(accordion => {
        accordion.addEventListener('click', function() {
            this.classList.toggle('active');
            const panel = this.nextElementSibling;
            panel.style.maxHeight = this.classList.contains('active') ? `${panel.scrollHeight}px` : null;
        });
    });
}

function setupMintButton(buttonId, tokenId) {
    const mintButton = document.getElementById(buttonId);
    if (!mintButton) return;

    mintButton.addEventListener("click", function() {
        const quantityInput = document.getElementById('nftQuantity');
        const quantity = parseInt(quantityInput.value, 10);
        const receiverAddress = 'user_ethereum_address'; // This should be dynamically determined or input by the user

        fetch('/claim', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                receiver: receiverAddress,
                tokenId: tokenId,
                quantity: quantity,
                currency: 'ETH',
                pricePerToken: '0.000420',
                allowlistProof: [],
                data: {}
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Minting successful:', data);
        })
        .catch(error => {
            console.error('Minting error:', error);
        });
    });
}

function setupTextButton(buttonId, promptText) {
    const textButton = document.getElementById(buttonId);
    if (!textButton) return;

    textButton.addEventListener("click", function() {
        const maxTokens = 50; // Maximum tokens for the generated text

        fetch('/api/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptText, maxTokens: maxTokens })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("aiGeneratedText").innerText = data.choices[0].text;
        })
        .catch(error => console.error('Error:', error));
    });
}

function setupCopyButtons() {
    document.getElementById("copyTextButton").addEventListener("click", function() {
        const textToCopy = document.getElementById("aiGeneratedText").innerText;
        navigator.clipboard.writeText(textToCopy).then(function() {
            console.log('Text successfully copied to clipboard');
        }).catch(function(err) {
            console.error('Could not copy text: ', err);
        });
    });

    document.getElementById("copyImageButton").addEventListener("click", function() {
        const imageElement = document.getElementById("aiGeneratedImage");
        copyImageToClipboard(imageElement);
    });
}

function copyImageToClipboard(imageElement) {
    if (!imageElement) return;
    imageElement.crossOrigin = 'anonymous'; // Necessary for images loaded from external sources
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0);
    canvas.toBlob(function(blob) {
        navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(function() {
            console.log('Image successfully copied to clipboard');
        }).catch(function(err) {
            console.error('Could not copy image to clipboard: ', err);
        });
    }, 'image/png');
}

function setupToggles() {
    const pageToggle1 = document.getElementById('pageToggle');
    const pageToggle2 = document.getElementById('pageToggle2');
    const footerToggle1 = document.getElementById('footerToggle');
    const footerToggle2 = document.getElementById('footerToggle2');

    if (pageToggle1) {
        pageToggle1.addEventListener('change', () => {
            window.location.href = pageToggle1.checked ? 'index.html' : 'index2.html';
        });
    }

    if (pageToggle2) {
        pageToggle2.addEventListener('change', () => {
            window.location.href = pageToggle2.checked ? 'index2.html' : 'index.html';
        });
    }

    if (footerToggle1) {
        footerToggle1.addEventListener('change', () => {
            window.location.href = footerToggle1.checked ? 'index.html' : 'index2.html';
        });
    }

    if (footerToggle2) {
        footerToggle2.addEventListener('change', () => {
            window.location.href = footerToggle2.checked ? 'index2.html' : 'index.html';
        });
    }
}