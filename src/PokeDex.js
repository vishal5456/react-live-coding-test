import "./App.css";
import { useState, useEffect, useRef } from "react";
import ReactLoading from "react-loading";
import axios from "axios";
import Modal from "react-modal";
import Pagination from '@mui/material/Pagination';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CanvasJSReact from '@canvasjs/react-charts';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DownloadForOfflineRoundedIcon from '@mui/icons-material/DownloadForOfflineRounded';



function PokeDex() {

  const CanvasJSChart = CanvasJSReact.CanvasJSChart;
  const initialChartOptions = {
    title: {
      text: "Pokemon Stats Chart"
    },
    dataPointWidth: 40,
    data: [
      {
        type: "doughnut",
        dataPoints: []
      }
    ]
  }
  const pdfRef = useRef()

  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [downloading, setDownloading] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('')
  const [data, setData] = useState([]);
  const [renderData, setRenderData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [individualPokemonData, setIndividualPokemonData] = useState(null);
  const [stat, setStat] = useState([]);
  const [chartOptions, setChartOptions] = useState(initialChartOptions)
  const countPerPage = 10;

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "black",
      color: "white",
      maxHeight: '500px',
    },
    overlay: { backgroundColor: "grey" },
  };

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    try {
      setIsLoading(true)
      const response = await axios({
        url: `https://pokeapi.co/api/v2/pokemon?limit=100`,
        method: 'get'
      })
      response.data.results.sort((a,b)=>a.name.localeCompare(b.name));
      setData(response.data.results)
      setRenderData(response.data.results.slice(0, countPerPage));
      setTotalCount(response.data.results.length);
      //timeout is there to show loader functionality.. It should be removed for better performance
      setTimeout(()=>{
        setIsLoading(false)
      },[500])
    } catch (error) {
      console.log(error);
      setIsLoading(false)
    }
  }

  const handleClick = async (data) => {
    await getPokemonData(data)
    setPokemonDetail(data);
  }

  const getPokemonData = async (payload) => {
    try {
      const response = await axios({
        url: payload.url,
        method: 'get'
      })
      createStatData(response.data.stats)
      setIndividualPokemonData(response.data)
    } catch (error) {
      console.log(error);
    }
  }

  const updatePage = (event, page) => {
    let cloneData = [...data];
    cloneData.sort()
    const to = countPerPage * page;
    const from = to - countPerPage;
    setRenderData(cloneData?.slice(from, to));
    setTotalCount(cloneData?.length);
  };

  const createStatData = (stats) => {
    let tableDataArray = [];
    let chartDataArray = [];
    stats.forEach((item) => {
      const name = item.stat.name;
      const value = item.base_stat;
      const tableRow = { name, value };
      const chartValue = { label: name, y: value };
      tableDataArray.push(tableRow);
      chartDataArray.push(chartValue)
    });
    const chartOptions = {
      ...initialChartOptions, data: [
        {
          type: "column",
          dataPoints: chartDataArray
        }
      ]
    }
    setChartOptions(chartOptions)
    setStat(tableDataArray);
  }

  const handleSearch = async (e) => {
    const cloneData = [...data];
    const searchLength = e.target.value.length;
    if (searchLength) {
      const filteredData = cloneData.filter((item) => {
        const subStr = item.name.substring(0, searchLength);
        if (e.target.value === subStr) return true
      })
      setRenderData(filteredData.slice(0, countPerPage));
      setTotalCount(filteredData.length);
    } else {
      setRenderData(cloneData.slice(0, countPerPage));
      setTotalCount(cloneData.length);
    }

  }

  const handleDownload = () =>{
    const capture = pdfRef.current;
    setDownloading(true);
    html2canvas(capture,{logging:true, useCORS:true, letterRendering:1}).then((canvas)=>{
      const imgData = canvas.toDataURL('img/png');
      const doc = new jsPDF('p', 'mm', 'a4');
      const componentWidth = doc.internal.pageSize.getWidth();
      const componentHeight = doc.internal.pageSize.getHeight();
      doc.addImage(imgData, 'PNG', 0, 0, componentWidth, componentHeight);
      setDownloading(false);
      doc.save(`${pokemonDetail?.name}_data.pdf`);
    })
  }

  return (
    <div>
      <header className="App-header">
        {isLoading ? (
          <>
            <div className="App">
              <ReactLoading type={'balls'} color={'black'} height={'300px'} width={'300px'}/>
            </div>
          </>
        ) : (
          <>
            <h1>Welcome to pokedex !</h1>
            {
              !pokemonDetail &&
              <div className="search">
                <TextField id="outlined-basic" fullWidth label="Search" variant="outlined" type="text" name="search" value={search} onChange={(e) => setSearch(e.target.value)} onKeyUp={handleSearch} />
              </div>
            }
            <div className="listWrapper">
              {
                renderData && renderData.map((item, index) =>
                  <div key={index} className="listItem" onClick={() => handleClick(item)}>
                    <div className="listName">
                      {item.name}
                    </div>
                  </div>
                )
              }
            </div>
            <Pagination
              className="mPage"
              count={Math.ceil(totalCount / countPerPage)}
              color="primary"
              onChange={updatePage}
            />
          </>
        )}
      </header>
      {pokemonDetail && (
        <Modal
          isOpen={pokemonDetail ? true : false}
          contentLabel={pokemonDetail?.name || ""}
          onRequestClose={() => {
            setPokemonDetail(null);
            setIndividualPokemonData(null)
          }}
          style={customStyles}
          ariaHideApp={false}
        >
          <div className="wrapper" ref={pdfRef}>
            <div className="headWrapper">
              <div className="pokeName">
                {pokemonDetail.name}
              </div>
              <img
                src={individualPokemonData.sprites.front_default}
                alt="pokemon_img"
                className='pokeImage'
              />
            </div>
            <div className="tableWrapper">
              <h3 className="statHead">Stats :</h3>
              <div className="statTableWrapper">
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead sx={{ backgroundColor: "cornflowerblue" }}>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stat.map((row) => (
                        <TableRow
                          key={row.name}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {row.name}
                          </TableCell>
                          <TableCell align="right">{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
            <div className="chartWrapper">
              <h3 className="statHead">Chart :</h3>
              <CanvasJSChart options={chartOptions} />
            </div>
          </div>
          <div className="download-button">
              <LoadingButton
                color="secondary"
                loading={downloading}
                loadingPosition="start"
                startIcon={<DownloadForOfflineRoundedIcon />}
                variant="contained"
                onClick={handleDownload}
            >
              <span>Download</span>
            </LoadingButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PokeDex;
