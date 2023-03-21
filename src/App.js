import GLBViewer from './GltfViewer';

function App() {
  return (
    <div className="App">
      
      <GLBViewer src="/models/nft_3.glb" frontText="Front Text" backText="Back Text" qrCodeValue={3}/>
    </div>
  );
}

export default App;
