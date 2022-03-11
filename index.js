// CONST & VARIABLE DECLARATION
const express = require('express')
const port = 3000;
const app = express()
const cors = require('cors')
const mysql = require('mysql')
app.use(cors())
let allGenres = [];

// SQL SETTINGS
// DB CONNECTION
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "coursework"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

// GET ALL GENRES
con.query("SELECT * FROM genre", function (err, result, fields) {
    if (err) throw err;
    allGenres = result;
});

// RANDOM SELECTION
const getRandom = arr => arr[Math.floor(Math.random() * arr.length)]

// RANDOM WORD PICK
const getWord = (genre, type) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM ${type} where genre_id=${genre}`, function (err, result, fields) {
            if (err) throw reject();
            resolve(getRandom(result.map(e => e.preposition ? e : e.word)));
        });
    })
}

// PROMPT TEXT GENERATION
const generateText = async (genres) => {
    const w1 = await getWord(getRandom(genres), "adjectives");
    const w2 = await getWord(getRandom(genres), "nouns");
    const w3 = await getWord(getRandom(genres), "actions");
    const w4 = await getWord(getRandom(genres), "adjectives");
    const w5 = await getWord(getRandom(genres), "nouns");
    const w6 = await getWord(getRandom(genres), "locations");
    const w7 = await getWord(getRandom(genres), "locadjectives");
    return `${w1} ${w2} ${w3} ${w4} ${w5} ${w6.preposition} ${w7} ${w6.word}`;
}

// GENRE STATS UPDATE
const saveStatistics = (genres) => {
    genres = genres.pop ? genres : [genres];
    genres.forEach(genre => {
        con.query(`UPDATE genre SET value=value+1 WHERE id=${genre}`);
    });
}

// ALT GET GENRES
const getGenres = () => {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM genre", function (err, result, fields) {
            if (err) throw reject();
            resolve(result);
        });
    })
}

// REST API ENDPOINTS
app.get('/api/genres', async function (req, res) {

    const genres = await getGenres();
    res.json(genres);
})

app.get('/api/generate', async function (req, res) {

    const genres = req.query.genre;
    const text = await generateText(genres)
    await saveStatistics(genres);
    res.json(text);
})

console.log(`Started server on port ${port}.`)
app.listen(port)