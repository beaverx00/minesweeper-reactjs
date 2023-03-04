import { useState, useEffect } from 'react';
import './App.css';

const CELL_TYPE = {
  EMPTY: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  MINE: 9
};

const GAME_STATUS = {
  READY: 0,
  PLAYING: 1,
  WIN: 2,
  GAMEOVER: 3,
};

Object.freeze(CELL_TYPE);
Object.freeze(GAME_STATUS);

const WIDTH = 30;
const HEIGHT = 16;
const NUM_MINE = 99;

function App() {
  let [cells, setCells] = useState([]);
  let [start, setStart] = useState(false);

  useEffect(() => {
    let c = [];
    for (var i = 0; i < WIDTH * HEIGHT; i++) {
      c.push({
        type: CELL_TYPE.EMPTY,
        opened: false
      });
    }
    setCells(c);
  }, []);

  const findNeighbor = (ind) => {
    let row = Math.floor(ind / WIDTH);
    let col = ind % WIDTH;
    let neighbors = [];
    for (var i = -1; i <= 1; i++) {
      for (var j = -1; j <= 1; j++) {
        if (i != 0 || j != 0) {
          var row_delta = row + i;
          var col_delta = col + j;

          if (row_delta >= 0 && row_delta < HEIGHT && col_delta >= 0 && col_delta < WIDTH) {
            // console.log(row_delta, col_delta);
            neighbors.push((row_delta * WIDTH) + col_delta);
          }
        }
      }
    }
    return neighbors;
  };

  const placeMine = (ind) => {
    let copy = [...cells];

    var i = 0;
    while (i < NUM_MINE) {
      var loc = Math.floor(Math.random() * WIDTH * HEIGHT);
      if (loc != ind) {
        copy[loc].type = CELL_TYPE.MINE;
        i++;
      }
    }
    for (var i = 0; i < copy.length; i++) {
      if (copy[i].type != CELL_TYPE.MINE) {
        let neighbors = findNeighbor(i);
        copy[i].type = neighbors.filter(loc => copy[loc].type == CELL_TYPE.MINE).length;
      }
    }

    setCells(copy);
  };

  const clickCell = (ind) => {
    if (!start) {
      placeMine(ind);
      setStart(true);
    }
    let copy = [...cells];
    copy[ind].opened = true;
    setCells(copy);
    //TODO: click empty cell, spread
  };

  return (
    <div className="App">
      <div className="Board">
        {
          cells.map((cell, ind) => {
            let row = Math.floor(ind / WIDTH);
            let col = ind % WIDTH;
            return (
              <div className={"cell type" + cell.type + " " + (cell.opened ? "opened" : "closed")}
                data-x={row}
                data-y={col}
                onClick={() => { clickCell(ind); }}>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}

export default App;
