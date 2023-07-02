import "./App.css";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import TextField from '@mui/material/TextField';

function Home() {
  const history = useHistory();

  const [text, setText] = useState("");
  const [isReady, setIsReady] = useState(false);

  const handleChange = (e)=>{
      if(e.target.value === 'Ready!'){
        setIsReady(true)
      }else{
        setIsReady(false)
      }
      setText(e.target.value)
  }

  const handleClick = ()=>{
      history.push('/pokedex')
  }

  return (
    <div className="App">
      <header className="App-header">
        <img
          hidden={!isReady}
          src="https://www.freeiconspng.com/uploads/file-pokeball-png-0.png"
          className="App-logo"
          alt="logo"
          style={{ padding: "10px" }}
          onClick={handleClick}
        />
        <p>Are you ready to be a pokemon master?</p>
        <div className="input">
            <TextField id="outlined-basic" label="Get Ready" variant="outlined" type="text" name="name" value={text} onChange={handleChange}/>
        </div>
        {
          !isReady &&
          <span style={{ color: "red" }}>I am not ready yet!</span>
        }
      </header>
    </div>
  );
}

export default Home;
