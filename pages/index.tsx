import type {NextPage} from "next";
import Head from "next/head";
import Minesweeper from "../components/Minesweeper";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Minesweeper</title>
        <meta name="description" content="Minesweeper game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h3 className={styles.title}>Minesweeper</h3>
        <Minesweeper height={8} width={10} bombs={10} />
      </main>
    </div>
  );
};

export default Home;
