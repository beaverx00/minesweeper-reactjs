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

const WIDTH = 11;
const HEIGHT = 18;
const NUM_MINE = 35;

// TODO: Change game status
// Before first click => READY (timer stop)
// After first click => PLAYING (timer start)
// Click mine => GAMEOVER (timer stop)
// Click every cells except mines => WIN (timer stop)

// TODO: Make restart button for going READY status whenever click
// TODO: Add three mode: Beginner, Intermediate, Expert
// TODO: Right click for FLAG
// TODO: Left + Right click for spread
// TODO: keyboard mapping
function App() {
  let [cells, setCells] = useState([]);
  let [status, setStatus] = useState(GAME_STATUS.READY);
  let [timer, setTimer] = useState(0);

  useEffect(() => {
    let cells = [];
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      cells.push({
        type: CELL_TYPE.EMPTY,
        opened: false
      });
    }
    setCells(cells);

  }, []);

  const findNeighbor = (ind) => {
    let row = Math.floor(ind / WIDTH);
    let col = ind % WIDTH;
    let neighbors = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i !== 0 || j !== 0) {
          let row_delta = row + i;
          let col_delta = col + j;

          if (row_delta >= 0 && row_delta < HEIGHT && col_delta >= 0 && col_delta < WIDTH) {
            neighbors.push((row_delta * WIDTH) + col_delta);
          }
        }
      }
    }
    return neighbors;
  };

  const placeMine = (ind) => {
    let copy = [...cells];

    let i = 0;
    while (i < NUM_MINE) {
      let loc = Math.floor(Math.random() * WIDTH * HEIGHT);
      if (loc !== ind) {
        copy[loc].type = CELL_TYPE.MINE;
        i++;
      }
    }
    for (let i = 0; i < copy.length; i++) {
      if (copy[i].type !== CELL_TYPE.MINE) {
        let neighbors = findNeighbor(i);
        copy[i].type = neighbors.filter(loc => copy[loc].type === CELL_TYPE.MINE).length;
      }
    }
    console.log(copy);
    setCells(copy);
  };

  const clickCell = (ind) => {
    if (cells[ind].type == CELL_TYPE.MINE) {
      setStatus(GAME_STATUS.GAMEOVER);
    }
    if (status === GAME_STATUS.READY) {
      placeMine(ind);
      setStatus(GAME_STATUS.PLAYING);
    }
    if ((status === GAME_STATUS.PLAYING) || (status === GAME_STATUS.READY)) {
      let copy = [...cells];

      if (copy[ind].type === CELL_TYPE.EMPTY) {
        let indexes = [ind];

        let i = 0;
        while (i < indexes.length) {
          copy[indexes[i]].opened = true;
          for (const neighbor of findNeighbor(indexes[i])) {
            if (copy[neighbor].type === CELL_TYPE.EMPTY && indexes.find(item => item === neighbor) === undefined)
              indexes.push(neighbor)
          }
          i++;
        }
        console.log(indexes);
        for (const index of indexes) {
          for (const neighbor of findNeighbor(index)) {
            copy[neighbor].opened = true;
          }
        }
      } else {
        copy[ind].opened = true;
      }

      setCells(copy);
    }
  };

  return (
    <div className="App">
      <p>{status}</p>
      <div className="Board">
        {
          cells.map((cell, ind) => {
            let row = Math.floor(ind / WIDTH);
            let col = ind % WIDTH;
            return (
              <div className={"cell " + (cell.opened ? "opened " + "type" + cell.type : "closed")}
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
