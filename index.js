const express = require('express')
const data = require('./db')
const port = 3000;
const app = express()
const cors = require('cors')
const mysql = require('mysql')
app.use(cors())
let allGenres = [];

// SQL SETTINGS
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

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)]

const getWord = (genre, type) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM ${type} where genre_id=${genre}`, function (err, result, fields) {
            if (err) throw reject();
            resolve(getRandom(result.map(e => e.word)));
        });
    })
}

const generateText = async (genres) => {
    const w1 = await getWord(getRandom(genres), "adjectives");
    const w2 = await getWord(getRandom(genres), "nouns");
    const w3 = await getWord(getRandom(genres), "actions");
    const w4 = await getWord(getRandom(genres), "adjectives");
    const w5 = await getWord(getRandom(genres), "nouns");
    return `${w1} ${w2} ${w3} ${w4} ${w5}`;
}

// REST API ENDPOINTS
app.get('/api/genres', function (req, res) {
    res.json(allGenres);
})

app.get('/api/generate', async function (req, res) {
    const genres = req.query.genre;
    const text = await generateText(genres)
    res.json(text);
})

console.log(`Started server on port ${port}.`)
app.listen(port)