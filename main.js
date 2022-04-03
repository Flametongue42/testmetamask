async function checkJPYC(provider){
  //matic JPYC adrress
  const JPYCAddress = 0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c;
  const JPYCAbi = [
  // Some details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",

  // Send some of your tokens to someone else
  "function transfer(address to, uint amount)",

  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)"
];
 
const JPYCContract = new ethers.Contract(JPYCAddress, JPYCAbi, provider);
  
  await JPYCCOntract.name();
  await JPYCCOntract.Symbol();
 // balance = await JPYCCOntract.bakabceOf();
 // ether.utils.formatUnits(balance,18);

const value = await JPYCContract.getValue();
console.log(value);
  
}



async function connectMetamask(){
console.log("connect Metamask");
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer=provider.getSigner();
  checkJPYC(provider);
return false;
  
}
