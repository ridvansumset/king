const url = window.location.href;

if (url.indexOf('?') > -1) {
  const qpStr = url.substring(url.indexOf('?') + 1, url.length);
  const qps = qpStr.split('&');

  for (let i = 0; i < qps.length; i++) {
    const qp = qps[i].split('=');

    if (qp[0] === 'game_id') {
      console.log(qp[1]);
    }
  }
}

var app = new Vue({
  el: '#app',
  data: {
    players: [],
    games: [],
    gamesObj: {},
    playedGames: [],
    remainingGames: [],
    player0: {id: 0, name:'Oyuncu1', remainingPunishGames: 3, remainingTrumpGames: 2, points: 0},
    player1: {id: 1, name:'Oyuncu2', remainingPunishGames: 3, remainingTrumpGames: 2, points: 0},
    player2: {id: 2, name:'Oyuncu3', remainingPunishGames: 3, remainingTrumpGames: 2, points: 0},
    player3: {id: 3, name:'Oyuncu4', remainingPunishGames: 3, remainingTrumpGames: 2, points: 0},
    elAlmaz: {id: 'elAlmaz', name: 'El Almaz', turnCount: 13, damage: -50, remainingCount: 2},
    kupaAlmaz: {id: 'kupaAlmaz', name: 'Kupa Almaz', turnCount: 13, damage: -30, remainingCount: 2},
    erkekAlmaz: {id: 'erkekAlmaz', name: 'Erkek Almaz', turnCount: 8, damage: -60, remainingCount: 2},
    kizAlmaz: {id: 'kizAlmaz', name: 'Kız Almaz', turnCount: 4, damage: -100, remainingCount: 2},
    rifki: {id: 'rifki', name: 'Rıfkı', turnCount: 1, damage: -320, remainingCount: 2},
    soniki: {id: 'soniki', name: 'Son İki', turnCount: 2, damage: -180, remainingCount: 2},
    koz: {id: 'koz', name: 'Koz', turnCount: 13, damage: 50, remainingCount: 8},
    isOver: false,
    selectedGame: null,
    // onlyWinner: {wins: false, name: ''},
    maxPointsAvailable: 13,
    remainingGameCount: 20,
    newGame: {0: 0, 1: 0, 2: 0, 3: 0},
    editGame: {gameName: '', 0: 0, 1: 0, 2: 0, 3: 0}
  },
  methods: {
    setFromLocalStorage() {
      this.games = [this.elAlmaz, this.kupaAlmaz, this.erkekAlmaz, this.kizAlmaz,
        this.rifki, this.soniki, this.koz]

      // if (localStorage.getItem('onlyWinner')) {
      //   this.onlyWinner = JSON.parse(localStorage.getItem('onlyWinner'))
      // }

      if (localStorage.getItem('isOver')) {
        this.isOver = localStorage.getItem('isOver') === "true"
        if (this.isOver) {
          setTimeout(() => {
            let that = this
            that.showWinnersModal()
          }, 500)
        }
      }

      if (localStorage.getItem('remainingGameCount')) {
        this.remainingGameCount = parseInt(localStorage.getItem('remainingGameCount'), 10)
      }

      if (localStorage.getItem('playedGames')) {
        this.playedGames = JSON.parse(localStorage.getItem('playedGames'))
      }

      for (let i = 0; i < 4; i++) {
        if (localStorage.getItem('player'+i)) {
          this['player'+i] = JSON.parse(localStorage.getItem('player'+i))
        }
      }

      for (let i = 0; i < this.games.length; i++) {
        if (localStorage.getItem(this.games[i].id)) {
          this.games[i].remainingCount = parseInt(localStorage.getItem(this.games[i].id), 10)
        }
      }

      for (let i = 0; i < this.games.length; i++) {
        this.gamesObj[this.games[i].id] = this.games[i]
      }

      for (let i = 0; i < 4; i++) {
        this.players.push(this['player'+i])
      }
    },
    showNewPlayersModal() {
      this.$refs['newPlayers'].show()
    },
    showWinnersModal() {
      this.$refs['winnersModal'].show()
    },
    hideNewPlayersModal() {
      this.$refs['newPlayers'].hide()
    },
    hideNewGameModal() {
      this.$refs['newGame'].hide()
    },
    hideEditGameModal() {
      this.$refs['editGame'].hide()
    },
    handleNewStartWarning() {
      localStorage.clear()
      this.showNewPlayersModal()
    },
    handleNewPlayers(e) {
      e.preventDefault()

      if (!this.$refs.newPlayersForm.checkValidity()) {
        alert('Tüm alanlar zorunludur')
        return
      }

      for (let i = 0; i < this.players.length; i++) {
        let p = {
          id: i,
          name: this['player'+i].name,
          remainingPunishGames: 3,
          remainingTrumpGames: 2,
          points: 0,
          active: i === 0,
        }
        localStorage.setItem('player'+i, JSON.stringify(p))
      }

      this.$nextTick(() => {
        this.hideNewPlayersModal()
        window.location.reload()
      })
    },
    showNewGameModal() {
      this.selectedGame = null
      this.newGame = {0: 0, 1: 0, 2: 0, 3: 0}
      this.remainingGames = []

      let pIndex = this.playedGames.length % 4

      if (this['player'+pIndex].remainingPunishGames > 0) {
        for (let i = 0; i < this.games.length; i++) {
          if (this.games[i].remainingCount > 0 && this.games[i].id !== 'koz') {
            this.remainingGames.push({
              text: this.games[i].name,
              value: this.games[i].id
            })
          }
        }
      }

      if (this['player'+pIndex].remainingTrumpGames > 0) {
        this.remainingGames.push({
          text: 'Koz',
          value: 'koz'
        })
      }

      this.$refs['newGame'].show()
    },
    selectNewGame() {
      this.newGame = {0: 0, 1: 0, 2: 0, 3: 0}
      this.maxPointsAvailable = this[this.selectedGame].turnCount
    },
    handleNewGame(e) {
      e.preventDefault()
      if (!this.selectedGame || this.maxPointsAvailable !== 0) {
        alert('Eksik var!')
        return
      }

      let dmg = this.gamesObj[this.selectedGame].damage
      let pIndex = this.playedGames.length % 4

      this.selectedGame === 'koz'
        ? this['player'+pIndex].remainingTrumpGames -= 1
        : this['player'+pIndex].remainingPunishGames -= 1

      this['player'+pIndex].active = false;
      const nextPlayerIndex = pIndex === 3 ? 0 : pIndex + 1;
      this['player'+nextPlayerIndex].active = true;

      for (let i in this.newGame) {
        this['player'+i].points += this.newGame[i] * dmg

        // if (this.selectedGame === 'koz' && this.newGame[i] > 8) {
        //   this.isOver = true
        //   localStorage.setItem('isOver', 'true')
        //
        //   let ow = {wins: true, name: this['player'+i].name}
        //   this.onlyWinner = ow
        //   localStorage.setItem('onlyWinner', JSON.stringify(ow))
        //
        //   this['player'+i].isWinner = true
        // }
        localStorage.setItem('player'+i, JSON.stringify(this['player'+i]))
      }

      this.remainingGameCount -= 1
      localStorage.setItem('remainingGameCount', this.remainingGameCount)

      this[this.selectedGame].remainingCount -= 1
      localStorage.setItem(this.selectedGame, this[this.selectedGame].remainingCount)

      let o = {
        gameId: this.selectedGame,
        0: this.newGame[0],
        1: this.newGame[1],
        2: this.newGame[2],
        3: this.newGame[3]
      }

      this.playedGames.push(o)
      localStorage.setItem('playedGames', JSON.stringify(this.playedGames))

      if (!this.remainingGameCount && !this.isOver) {
        this.isOver = true
        localStorage.setItem('isOver', 'true')

        for (let i = 0; i < this.players.length; i++) {
          if (this['player'+i].points >= 0) this['player'+i].isWinner = true
          localStorage.setItem('player'+i, JSON.stringify(this['player'+i]))
        }
      }

      this.$nextTick(() => {
        this.hideNewGameModal()
      })
      this.$nextTick(() => {
        if (this.isOver) this.showWinnersModal()
      })
    },
    showEditGameModal(index) {
      let game = this.playedGames[index]

      this.editGameIndex = index
      this.selectedGame = game.gameId
      this.maxPointsAvailable = 0

      this.editGame.gameName = this[game.gameId].name
      for (let i = 0; i < 4; i++) {
        this.editGame[i] = game[i]
      }

      this.$refs['editGame'].show()
    },
    handleEditGame(e) {
      e.preventDefault()
      if (!this.selectedGame || this.maxPointsAvailable !== 0) {
        alert('Eksik var!')
        return
      }

      let game = this.playedGames[this.editGameIndex]
      let dmg = this.gamesObj[game.gameId].damage

      for (let i = 0; i < 4; i++) {
        this['player'+i].points += (game[i]*-1*dmg) + (this.editGame[i]*dmg)

        localStorage.setItem('player'+i, JSON.stringify(this['player'+i]))

        game[i] = this.editGame[i]
      }
      localStorage.setItem('playedGames', JSON.stringify(this.playedGames))

      this.$nextTick(() => {
        this.hideEditGameModal()
      })
    },
    togglePoints(i, m = 1, isEdit = false) {
      let g = isEdit ? 'editGame' : 'newGame'
      let maxTurnCount = -1
      if (this.selectedGame) maxTurnCount = this[this.selectedGame].turnCount

      if (this.maxPointsAvailable - m <= maxTurnCount && this.maxPointsAvailable - m > -1
        && this[g][i] + m < maxTurnCount+1 && this[g][i] + m >= 0) {
        this.maxPointsAvailable -= m
        this[g][i] = this[g][i] + m
      }
    },
    deleteGame() {
      let pIndex = (this.playedGames.length - 1) % 4
      let playedGame = this.playedGames[this.playedGames.length-1]

      this.remainingGameCount += 1
      localStorage.setItem('remainingGameCount', this.remainingGameCount.toString())

      this[playedGame.gameId].remainingCount += 1
      localStorage.setItem(playedGame.gameId, this[playedGame.gameId].remainingCount.toString())

      playedGame.gameId === 'koz' ?
        this['player'+pIndex].remainingTrumpGames += 1 :
        this['player'+pIndex].remainingPunishGames += 1

      this['player'+pIndex].active = true;
      const nextPlayerIndex = pIndex === 3 ? 0 : pIndex + 1;
      this['player'+nextPlayerIndex].active = false;

      for (let i = 0; i < this.players.length; i++) {
        this['player'+i].points += playedGame[i] * this[playedGame.gameId].damage * (-1)
        if (this['player'+i].isWinner) {
          this['player'+i].isWinner = false;
        }
        localStorage.setItem('player'+i, JSON.stringify(this['player'+i]))
      }

      this.playedGames.pop()
      localStorage.setItem('playedGames', JSON.stringify(this.playedGames))

      if (this.isOver) {
        this.isOver = false;
        // this.onlyWinner = {wins: false, name: ''};

        localStorage.removeItem('isOver');
        // localStorage.removeItem('onlyWinner');
      }
    },
    shorten(name, maxLength) {
      return name.length <= maxLength ? name : `${name.substr(0, maxLength - 3)}..`
    },
    isActive(active) {
      return active ?
        '<div style="display: inline-block; width: 11px; height: 11px; border-radius: 10px; background-color: limegreen;"></div>' :
        '<div style="display: inline-block; width: 11px; height: 11px; border-radius: 10px; background-color: white;"></div>';
    },
  },
  beforeMount() {
    this.setFromLocalStorage()
  }
})
