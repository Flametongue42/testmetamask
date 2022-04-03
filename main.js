async function connectMetamask(){
console.log("connect Metamask");
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer=provider.getSigner();
return false;
}
