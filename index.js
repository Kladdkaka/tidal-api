const queryString = require('query-string')
const axios = require('axios')
const uuid = require('uuid')

module.exports = class Tidal {
    constructor(authData) {
        if (typeof authData !== 'object') {
            throw new Error('You must pass auth data into the TidalAPI object correctly')
        } else {
            if (typeof authData.username !== 'string') {
                throw new Error('Username invalid or missing')
            }
            if (typeof authData.password !== 'string') {
                throw new Error('Password invalid or missing')
            }
            if (typeof authData.token !== 'string') {
                throw new Error('Token invalid or missing')
            }
            if (typeof authData.quality !== 'string') {
                throw new Error('Stream quality invalid or missing')
            }
        }

        this.authData = authData

        this.clientUniqueKey = uuid.v4()

        this.loggingIn = false
        this.loggedIn = false

        this._sessionID = null
        this._userID = null

        this._countryCode = null
        this._streamQuality = null

        this.axios = axios.create({
            baseURL: 'https://api.tidalhifi.com/v1'
        })
    }

    async login() {
        const self = this
        const { authData, clientUniqueKey } = this

        this.loggingIn = true

        let res

        try {
            res = await this.axios({
                url: '/login/username',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Tidal-Token': authData.token
                },
                data: queryString.stringify({
                    username: authData.username,
                    password: authData.password,
                    clientUniqueKey: clientUniqueKey
                }),
                responseType: 'json'
            })
        } catch (error) {
            console.error(`[Error] something happened while logging into Tidal. :(`)
            console.error(error)

            throw error
        }

        console.log(`[Success] I was able to log in (I believe so at least) :D`)

        const { data } = res

        console.log(data)

        this._sessionID = data.sessionId
        this._userID = data.userId
        this._countryCode = data.countryCode
        this._streamQuality = authData.quality

        this.loggingIn = false
        this.loggedIn = true

        return
    }

    async _baseRequest(method, params) {
        const self = this

        if (!this.loggedIn) {
            throw new Error("You are not logged in, please use the login() method before using api calls!")
        }

        params.countryCode = params.countryCode || this._countryCode

        let res

        try {
            res = await this.axios({
                url: `${method}?${queryString.stringify(params)}`,
                headers: {
                    'Origin': 'http://listen.tidal.com',
                    'X-Tidal-SessionId': this._sessionID
                },
                responseType: 'json'
            })
        } catch (error) {
            console.error(`[Error] An error happened while calling method "${method} with the params: ${JSON.stringify(params, null, 1)}`)
            throw error
        }

        const { data } = res

        let response

        if (params.types) {
            response = {}

            params.types.split(',').forEach(type => {
                response[type] = data[type]
            })
        } else {
            response = data
        }

        return response
    }

    getMyID() {
        return this._userID
    }

    search(query) {
        return this._baseRequest('/search', {
            query: query.query || query,
            limit: query.limit || 999,
            types: query.types || 'artists,albums,tracks,videos,playlists',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getArtist(query) {
        return this._baseRequest('/artists/' + (query.id || query), {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getTopTracks(query) {
        return this._baseRequest('/artists/' + (query.id || query) + '/toptracks', {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getArtistVideos(query) {
        return this._baseRequest('/artists/' + (query.id || query) + '/videos', {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getArtistBio(query) {
        return this._baseRequest('/artists/' + (query.id || query) + '/bio', {
            countryCode: this._countryCode
        })
    }

    getSimilarArtists(query) {
        return this._baseRequest('/artists/' + (query.id || query) + '/similar', {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getArtistAlbums(query) {
        return this._baseRequest('/artists/' + (query.id || query) + '/albums', {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getAlbum(query) {
        return this._baseRequest('/albums/' + (query.id || query), {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getAlbumTracks(query) {
        return this._baseRequest('/albums/' + (query.id || query) + '/tracks', {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getPlaylist(query) {
        return this._baseRequest('/playlists/' + (query.id || query), {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getPlaylistTracks(query) {
        return this._baseRequest('/playlists/' + (query.id || query) + '/tracks', {
            limit: query.limit || 999,
            filter: query.filter || 'ALL',
            offset: query.offset || 0,
            countryCode: this._countryCode
        })
    }

    getTrackInfo(track) {
        return this._baseRequest('/tracks/' + (track.id || track), {
            countryCode: this._countryCode
        })
    }

    getStreamURL(track) {
        return this._baseRequest('/tracks/' + (track.id || track) + '/streamUrl', {
            soundQuality: track.quality || this._streamQuality,
            countryCode: this._countryCode
        })
    }

    getOfflineURL(track) {
        return this._baseRequest('/tracks/' + (track.id || track) + '/offlineUrl', {
            soundQuality: track.quality || this._streamQuality,
            countryCode: this._countryCode
        })
    }

    getVideoStreamURL(track) {
        return this._baseRequest('/videos/' + (track.id || track) + '/streamUrl', {
            countryCode: this._countryCode
        })
    }

    getUser(user) {
        return this._baseRequest('/users/' + (user.id || user), {
            limit: user.limit || 999,
            offset: user.offset || 0
        })
    }

    getArtURL(id, res = 1280) {
        return 'https://resources.tidal.com/images/' + id.replace(/-/g, '/') + '/' + res + 'x' + res + '.jpg'
    }

}