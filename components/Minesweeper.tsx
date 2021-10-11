import React, {useState, useRef, useEffect} from "react";
import styles from "../styles/Minesweeper.module.css";
import Cell from "./Cell";
import {Index2D, MinesweeperCell} from "../types/types";
import _, {update} from "lodash";
import GameMessage from "./GameMessage";
import {useStopwatch} from "react-timer-hook";

interface MinesweeperProps {
  width: number;
  height: number;
  bombs: number;
}

const Minesweeper: React.FC<MinesweeperProps> = ({width, height, bombs}) => {
  const [game, setGame] = useState(generateGame(width, height, bombs));
  const [flags, setFlags] = useState(bombs);
  const [lost, setLost] = useState(false);
  const [won, setWon] = useState(false);
  const {seconds, minutes, hours, days, isRunning, start, pause, reset} =
    useStopwatch({autoStart: false});

  const updateGame = () => {
    setGame(_.cloneDeep(game));
  };

  const createCopy = (): {enact: () => void; copy: MinesweeperCell[][]} => {
    const copied = _.cloneDeep(game);

    return {
      enact: () => {
        setGame(copied);
      },
      copy: copied,
    };
  };

  const endGame = () => {
    setLost(true);
    setVisibility(true);
    pause();
  };

  const setVisibility = (visible: boolean) => {
    const {copy, enact} = createCopy();

    for (let i = 0; i < copy.length; i++) {
      for (let j = 0; j < copy[i].length; j++) {
        copy[i][j] = {value: copy[i][j].value, visible};
      }
    }

    enact();
  };

  const checkWin = () => {
    let allowed = width * height;

    // fixme
    if (flags !== 0) {
      return false;
    }

    for (let i = 0; i < game.length; i++) {
      for (let j = 0; j < game[i].length; j++) {
        if (game[i][j].visible === false) {
          allowed--;
        }
      }
    }

    if (allowed === width * height - bombs) {
      gameWon();
    }
  };

  const gameWon = () => {
    setWon(true);
    setVisibility(true);
    pause();
  };

  const updateFlags = (value: boolean) => {
    console.log(flags);
    setFlags(flags + (value ? 1 : -1));
    console.log(flags);
    checkWin();
    console.log(flags);
  };

  const retry = () => {
    setLost(false);
    setWon(false);
    setVisibility(false);
    setTimeout(() => setGame(generateGame(width, height, bombs)), 10); // timeout (only 10ms) to prevent the answers to the next generated board being able to be seen
    setFlags(bombs);
    reset();
    pause();
  };

  const showNeighbors = (index: Index2D, neighbors: boolean) => {
    game[index.x][index.y] = {
      value: game[index.x][index.y].value,
      visible: true,
    };

    if (neighbors) {
      for (let i of getNeighbors(index)) {
        const value = game[i.x][i.y].value;
        game[i.x][i.y] = {visible: true, value};

        if (value === 0) {
          showNeighbors(i, true);
        }
      }
    }

    updateGame();
  };

  const uncover = (index: Index2D, value: number) => {
    if (!isRunning) {
      start();
    }

    showNeighbors(index, value === 0);
    checkWin();
  };

  const getNeighbors = (index: Index2D): Index2D[] => {
    const neighbors = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) {
          continue;
        }

        if (index.x + i in game && index.y + j in game[index.x + i]) {
          if (!game[index.x + i][index.y + j].visible) {
            neighbors.push({x: index.x + i, y: index.y + j});
          }
        }
      }
    }

    return neighbors;
  };

  return (
    <div>
      <GameMessage show={lost} retryAction={retry}>
        Game Over
      </GameMessage>
      <GameMessage show={won} retryAction={retry}>
        You Won
      </GameMessage>
      <div className={`${styles.board} ${lost || won ? styles.blur : ""}`}>
        {game.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const index = rowIndex * width + columnIndex;

            return (
              <Cell
                round={
                  index === 0
                    ? 1
                    : index === width - 1
                    ? 2
                    : index === width * height - width
                    ? 3
                    : index === width * height - 1
                    ? 4
                    : 0
                }
                color={rowIndex % 2 === columnIndex % 2 ? "light" : "dark"}
                uncover={uncover}
                updateFlags={updateFlags}
                onLose={endGame}
                key={index}
                value={value.value}
                show={value.visible}
                index={{x: rowIndex, y: columnIndex}}
              />
            );
          })
        )}
      </div>
      <div className={styles.elapsed}>
        Time Elapsed: {!!days && days + ":"}
        {!!hours && hours + ":"}
        {!!minutes && minutes + "m"} {seconds}s
      </div>
      <div className={styles.remaining}>🚩{flags}</div>
    </div>
  );
};

const mineLocations = (bombs: number, maxLen: number): number[] => {
  const nums = Array.from(Array(maxLen).keys());
  const bombLocations = [];

  for (let i = 0; i < bombs; i++) {
    const index = Math.floor(Math.random() * nums.length);
    bombLocations.push(nums[index]);
    nums.splice(index, 1);
  }

  return bombLocations;
};

const generateGame = (
  width: number,
  height: number,
  bombs: number
): MinesweeperCell[][] => {
  const mineIndexes = mineLocations(bombs, width * height);
  const result: MinesweeperCell[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill({visible: true, value: 0}));

  for (const element of mineIndexes) {
    const row = Math.floor(element / width);
    const column = element % width;
    result[row][column] = {visible: false, value: -1};
  }

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (result[i][j].value === -1) {
        continue;
      }

      let bombs = 0;

      for (let k = -1; k <= 1; k++) {
        for (let l = -1; l <= 1; l++) {
          if (
            k + i in result &&
            l + j in result[k + i] &&
            result[k + i][l + j].value === -1
          ) {
            bombs++;
          }
        }
      }

      result[i][j] = {visible: false, value: bombs};
    }
  }

  return result;
};

export default Minesweeper;
