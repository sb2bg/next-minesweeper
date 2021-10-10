import React, {useEffect, useState} from "react";
import Image from "next/image";
import styles from "../styles/Minesweeper.module.css";
import {Index2D} from "../types/types";

interface CellProps {
  value: number;
  onLose: () => void;
  updateFlags: (value: boolean) => void;
  uncover: (index: Index2D, value: number) => void;
  show: boolean;
  index: Index2D;
  color: "light" | "dark";
  round: 0 | 1 | 2 | 3 | 4;
}

const Cell: React.FC<CellProps> = ({
  value,
  onLose,
  updateFlags,
  uncover,
  show,
  index,
  color,
  round,
}) => {
  const [hidden, setHidden] = useState(true);
  const [flagged, setFlagged] = useState(false);

  useEffect(() => {
    setHidden(!show);
    setFlagged(false);
  }, [show]);

  const check = () => {
    if (flagged) {
      return;
    }

    if (value === -1) {
      onLose();
    } else {
      uncover(index, value);
    }
  };

  const flag = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!hidden) {
      return;
    }

    setFlagged(!flagged);
    updateFlags(flagged);
  };

  return (
    <span
      onClick={check}
      onContextMenu={(e) => flag(e)}
      className={`${styles.cell} ${
        hidden
          ? color === "light"
            ? styles["covered-light"]
            : styles["covered-dark"]
          : color === "light"
          ? styles["uncovered-light"]
          : styles["uncovered-dark"]
      } ${value > 0 ? styles[`bomb-${value}`] : ""}
      ${
        round === 4
          ? styles.br
          : round === 3
          ? styles.bl
          : round === 2
          ? styles.tr
          : round === 1
          ? styles.tl
          : ""
      }`}
    >
      <Image
        className={`${flagged ? styles.visible : styles.invisible}`}
        alt="Red minesweeper flag"
        src="/flag_icon.png"
        layout="fill"
        objectFit="contain"
      />
      <Image
        className={`${styles.bomb} ${
          !hidden && value === -1 ? styles.visible : styles.invisible
        }`}
        alt="Bomb"
        src="/bomb_icon.png"
        layout="fill"
        objectFit="contain"
      />
      {hidden || (value === -1 ? "" : value > 0 && value)}
    </span>
  );
};

export default Cell;
