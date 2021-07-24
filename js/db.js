const Database = require("@replit/database")

const db = new Database()

function checkDB(key) {
	return new Promise((resolve, reject) => {
		db.get(key).then(data => {
			if (data) {
				resolve(data)
			} else {
				resolve([  ])
			}
		})
	})
}

function deleteDB(key) {
	db.delete(key)
}

function removeDBItem(key, dataKey) {
	db.get(key).then(data => {
		const dataMap = new Map(data)

		if (!dataMap.has(dataKey)) return

		dataMap.delete(dataKey)
		db.set(key, Array.from(dataMap))
	})
}

function getRemindDB(key) {
	return new Promise((resolve, reject) => {
		checkDB('reminder').then(servers => {
			const serversMap = new Map(servers)
			if (servers.length < 1 || !serversMap.get(key)) {
				resolve([ ])
				return
			}

			resolve(serversMap.get(key))
		})
	})
}

function updateRemindDB(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('reminder').then(servers => {
			const serversMap = new Map(servers)
			
			if (servers.length < 1 || !serversMap.get(key)) {
				db.set('reminder', [ [key, data] ])
				resolve('Data berhasil ditambahkan')
				return
			}

			serversMap.set(key, data)
			db.set('reminder', Array.from(serversMap))
			resolve('Data berhasl ditambahkan')
		})
	})
}

function getTodoDB(key) {
	return new Promise((resolve, reject) => {
		checkDB('todo').then(users => {
			const todoMap = new Map(users)
			if (users.length < 1) {
				todo = {
					user: key,
					sticker: null,
					template: null,
					reset: false,
					list: []
				}
				resolve(todo)
				return
			}

			resolve(todoMap.get(key))
		})
	})
}

function updateTodoDB(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('todo').then(users => {
			const todoMap = new Map(users)
			
			if (users.length < 1) {
				db.set('todo', [ [key, data] ])
				resolve('Data berhasil ditambahkan')
				return
			}

			todoMap.set(key, data)
			db.set('todo', Array.from(todoMap))
			resolve('Data berhasl ditambahkan')
		})
	})
}

function getStickerDB(key) {
	return new Promise((resolve, reject) => {
		checkDB('sticker').then(servers => {
			const stickersMap = new Map(servers)
			if (servers.length < 1) {
				resolve([ ])
				return
			}

			resolve(stickersMap.get(key))
			
		})
	})
}

function updateStickerDB(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('sticker').then(servers => {
			const stickersMap = new Map(servers)
			
			if (servers.length < 1) {
				db.set('sticker', [ [key, data] ])
				resolve('Data berhasil diubah')
				return
			}

			stickersMap.set(key, data)
			db.set('sticker', Array.from(stickersMap))
			resolve('Data berhasl diubah')
		})
	})
}

function getPomodDB(key) {
	return new Promise((resolve, reject) => {
		checkDB('pomodoro').then(servers => {
			const serversMap = new Map(servers)
			if (servers.length < 1) {
				resolve([ ])
				return
			}

			resolve(serversMap.get(key))
			
		})
	})
}

function updatePomodDB(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('pomodoro').then(servers => {
			const settingsMap = new Map(servers)
			
			if (servers.length < 1) {
				db.set('pomodoro', [ [key, data] ])
				resolve('Data berhasil diubah')
				return
			}

			settingsMap.set(key, data)
			db.set('pomodoro', Array.from(settingsMap))
			resolve('Data berhasl diubah')
		})
	})
}

function getVipDB(key) {
	return new Promise((resolve, reject) => {
		checkDB('vip').then(servers => {
			const serversMap = new Map(servers)
			if (servers.length < 1) {
				resolve([ ])
				return
			}

			resolve(serversMap.get(key))
		})
	})
}

function updateVipDB(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('vip').then(servers => {
			const serversMap = new Map(servers)
			
			if (servers.length < 1) {
				db.set('vip', [ [key, data] ])
				resolve('Data berhasil diubah')
				return
			}

			serversMap.set(key, data)
			db.set('vip', Array.from(serversMap))
			resolve('Data berhasl diubah')
		})
	})
}

module.exports = { 
	checkDB,
	deleteDB,
	removeDBItem,

	getRemindDB,
	updateRemindDB,

	getTodoDB,
	updateTodoDB,

	getStickerDB,
	updateStickerDB,

	getPomodDB,
	updatePomodDB,

	getVipDB,
	updateVipDB,
}