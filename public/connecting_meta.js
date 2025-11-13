window.addEventListener("load", () => {
    const wallet = localStorage.getItem("userWallet");
    const connect = document.getElementById("connect");
    const recon = document.getElementById("reconnect");

    const setAddress = (address) => {
        const addressElement = document.getElementById("address");
        if (addressElement) addressElement.textContent = address;
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask not detected. Please install it.");
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const address = accounts[0];
            localStorage.setItem("userWallet", address);
            setAddress(address);
        } catch (err) {
            console.error(err);
            alert("MetaMask connection failed");
        }
    };

    if (wallet) {
        connect.innerText = `Connected: ${wallet}`;
        recon.style.display = "inline-block";
        recon.onclick = connectWallet;
    } else {
        connect.addEventListener("click", connectWallet);
    }
});
