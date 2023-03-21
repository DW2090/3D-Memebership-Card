import GLBViewer from './GltfViewer';

const frontTexts = {
  first: "FOUNDING COMPANY MEMBER 1/100",
  second: "PALY IT FORWARD",
  third: "THE KINDNESS NETWORK",
  fourth: "JOINED JENUARY 20th 2023",
  fifth: "MEMBER #01"
}

const backTexts = {
  first: "MAGICAL LOVE LIVING",
  second: "DEEPEEN LOVE, RIPPLE BEAUTY",
  third: "JESSICA MEN",
  fourth: "FOUNDER/LOVE COACH"
}

function App() {
  return (
    <div className="App">

      <GLBViewer src="/models/nft_3.glb" frontTexts={frontTexts} backTexts={backTexts} qrCodeValue={3} />
    </div>
  );
}

export default App;
