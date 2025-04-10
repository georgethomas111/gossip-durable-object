const express = require('express');

const app = express();

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.get('/nodes', (req, res) => {
  res.send();
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
