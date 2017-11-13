# tidal-api
A node.js wrapper for the unofficial Tidal API!

Highly modified version of https://github.com/lucaslg26/TidalAPI, biggest difference is async/await :)

Right now it is not uploaded on NPM, but I will try to fix that soon!

No documentation for now, but the methods should be somewhat clear how they work!

Example:

```javascript
const Tidal = require('./index')
const { log } = console

const authData = {
    username: 'username',
    password: 'password',
    token: 'kgsOOmYk3zShYrNP', // this token is the best one by the way, if you use this, then the audio tracks won't be encrypted. :)
    quality: 'LOSSLESS'
}

const api = new Tidal(authData)

api.login()
    .then(async () => {
        log('Logged in!')

        const res = await api.search('Hello')

        log(res)
    })
    .catch(error => {
        log(error)
    })
```

Feel free to make a issue or contact me if you got any questions.

http://telegram.me/eluvio
