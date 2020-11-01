require('dotenv').config();

const app = require('./index');

app.listen(3001, () => {
    console.log('Listening on port 3001');
})