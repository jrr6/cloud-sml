import express, { Express } from 'express'
import path from 'path'
import cors from 'cors'

const app: Express = express() // TODO: delete this once we serve the website

app.use(cors())

app.post('/login', (req, res) => {
  res.send({
    token: 'mygreattoken'
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(8081, () => console.log('Server is running on http://localhost:8081/login'))