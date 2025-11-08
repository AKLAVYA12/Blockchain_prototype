
window.addEventListener("load", () => {
    const wallet = localStorage.getItem("userWallet");
    if (wallet) {
        document.querySelector("#connect").innerText = `Connected: ${wallet}`;
    } else {
    document.getElementById("connect").addEventListener("click", async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                const address = accounts[0];

                localStorage.setItem("userWallet", address);
                document.getElementById("address").textContent = address;
            } catch (err) {
                console.error(err);
                alert("MetaMask connection failed");
            }
        } else {
            alert("MetaMask not detected. Please install it.");
        }
    });}
});