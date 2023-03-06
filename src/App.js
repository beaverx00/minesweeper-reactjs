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
  MINE: '💣',
  CLICKED_MINE: '💥',
};

const GAME_STATUS = {
  READY: "🙂",
  PLAYING: "🧐",
  WIN: "😎",
  GAMEOVER: "😵",
};

Object.freeze(CELL_TYPE);
Object.freeze(GAME_STATUS);

const WIDTH = 11;
const HEIGHT = 18;
const BOARD_SIZE = WIDTH * HEIGHT;
const NUM_MINE = 35;

// TODO: Add three mode: Beginner, Intermediate, Expert
// TODO: Left + Right click for spread
// TODO: keyboard mapping
// FIXME: Gameover when flag is on the safe location
function App() {
  let [cells, setCells] = useState([]);
  let [status, setStatus] = useState(GAME_STATUS.READY);
  let [timer, setTimer] = useState(0);
  let [intervalId, setIntervalId] = useState(undefined);
  let [numFlag, setNumFlag] = useState(0);

  const initializeBoard = () => {
    let cells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      cells.push({
        type: CELL_TYPE.EMPTY,
        opened: false,
        flag: false
      });
    }
    setCells(cells);
  }

  useEffect(() => {
    switch (status) {
      case GAME_STATUS.READY:
        initializeBoard();
        setNumFlag(0);
        clearInterval(intervalId);
        setTimer(0);
        break;

      case GAME_STATUS.PLAYING:
        setIntervalId(setInterval(() => { setTimer(s => s + 1); }, 1000));
        break;
      default:
        clearInterval(intervalId);
        break;
    }


  }, [status]);

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
      let loc = Math.floor(Math.random() * BOARD_SIZE);
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
    setCells(copy);
  };

  const clickCell = (ind) => {
    if ((cells[ind].opened)
      || (cells[ind].flag)
      || (status === GAME_STATUS.GAMEOVER)
      || (status === GAME_STATUS.WIN)) {
      return;
    }
    let copy = [...cells];
    if (copy[ind].type === CELL_TYPE.MINE) {
      copy[ind].type = CELL_TYPE.CLICKED_MINE;
      setStatus(GAME_STATUS.GAMEOVER);
      for (var i = 0; i < BOARD_SIZE; i++) {
        if (copy[i].type === CELL_TYPE.MINE) {
          copy[i].opened = true;
        }
      }
    }
    if (status === GAME_STATUS.READY) {
      placeMine(ind);
      setStatus(GAME_STATUS.PLAYING);
    }
    if ((status === GAME_STATUS.PLAYING) || (status === GAME_STATUS.READY)) {

      if (copy[ind].type === CELL_TYPE.EMPTY) {
        let indexes = [ind];

        var i = 0;
        while (i < indexes.length) {
          copy[indexes[i]].opened = true;
          for (const neighbor of findNeighbor(indexes[i])) {
            if (copy[neighbor].type === CELL_TYPE.EMPTY && indexes.find(item => item === neighbor) === undefined)
              indexes.push(neighbor)
          }
          i++;
        }
        for (const index of indexes) {
          for (const neighbor of findNeighbor(index)) {
            copy[neighbor].opened = true;
            if (copy[neighbor].flag) {
              copy[neighbor].flag = false;
              setNumFlag(s => s - 1);
            }
          }
        }
      } else {
        copy[ind].opened = true;
      }

      let numOpened = copy.filter(cell => cell.type !== CELL_TYPE.MINE && cell.opened === true).length;
      if (numOpened === ((BOARD_SIZE) - NUM_MINE)) {
        for (var i = 0; i < BOARD_SIZE; i++) {
          if (copy[i].type === CELL_TYPE.MINE) {
            copy[i].flag = true;
          } else {
            copy[i].opened = true;
          }
        }
        setNumFlag(NUM_MINE);
        setStatus(GAME_STATUS.WIN);
      }

    }
    setCells(copy);
  };

  const rightClickCell = (e, ind) => {
    e.preventDefault();
    if ((status === GAME_STATUS.PLAYING) && (!cells[ind].opened)) {
      let copy = [...cells];
      if (copy[ind].flag) {
        setNumFlag(s => s - 1);
      } else {
        setNumFlag(s => s + 1);
      }
      copy[ind].flag = !copy[ind].flag;
      setCells(copy);
    }
  }

  return (
    <div className="App">
      <div className="LeftMine">💣{" " + (NUM_MINE - numFlag)}</div>
      <div className="Face" onClick={() => { setStatus(GAME_STATUS.READY); }}>{status}</div>
      <div className="Timer">⏳{" " + timer}</div>
      <div className="Board">
        {
          cells.map((cell, ind) => {
            return (
              <div className={
                "Cell "
                + (cell.opened ? "opened " + "type" + cell.type : "closed")
                + (cell.flag ? " flag" : "")
              }
                onClick={() => { clickCell(ind); }}
                onContextMenu={(e) => { rightClickCell(e, ind); }}>
                {
                  cell.opened
                    ? cell.type
                    : cell.flag
                      ? '🚩'
                      : null
                }
              </div>
            )
          })
        }
      </div>
    </div >
  );
}

export default App;
