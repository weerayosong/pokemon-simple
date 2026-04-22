import express from 'express';
import 'dotenv/config';

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

// Route 1: Landing page
app.get('/', (req, res) => {
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    res.send(`
        <h1 style="font-family: Arial">Pokemon-Simple-API😈</h1>
        
        <p>Try this >> <a href="${baseUrl}/api/pokemon/pikachu">${baseUrl}/api/pokemon/pikachu</a>👍</p>
    `);
});

// Route 2: Fetch with Name or ID
app.get('/api/pokemon/:nameOrId', (req, res) => {
    const query = req.params.nameOrId.toLowerCase();

    fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Not found Pokemon: ${query}`);
            }
            return response.json();
        })
        .then((pokemonData) => {
            return fetch(pokemonData.species.url)
                .then((res2) => {
                    if (!res2.ok) throw new Error(`Not Found Pokemon Species`);
                    return res2.json();
                })
                .then((speciesData) => {
                    res.json({
                        id: pokemonData.id,
                        name: pokemonData.name,
                        image: pokemonData.sprites.front_default,
                        types: pokemonData.types.map((t) => t.type.name),
                        info: {
                            height: pokemonData.height / 10,
                            weight: pokemonData.weight / 10,
                            habitat: speciesData.habitat
                                ? speciesData.habitat.name
                                : 'Unknown',
                        },
                        base_stats: pokemonData.stats.map((s) => {
                            return { label: s.stat.name, value: s.base_stat };
                        }),
                        is_legendary: speciesData.is_legendary,
                    });
                });
        })
        .catch((error) => {
            res.status(404).json({
                error: `Not Found`,
                details: error.message,
            });
        });
});

app.listen(PORT, () => {
    console.log(
        `test: Server run at ${process.env.BASE_URL || 'http://localhost:' + PORT}`,
    );
});
