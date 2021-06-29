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
				resolve([ ])
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

function getCompletionDB(key) {
	return new Promise((resolve, reject) => {
		checkDB('completions').then(users => {
			const completionsMap = new Map(users)
			if (users.length < 1) {
				resolve([ ])
				return
			}

			resolve(completionsMap.get(key))
			
		})
	})
}

function updateCompletionDB(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('completions').then(users => {
			const completionsMap = new Map(users)
			
			if (users.length < 1) {
				db.set('completions', [ [key, data] ])
				resolve('Data berhasil diubah')
				return
			}

			completionsMap.set(key, data)
			db.set('completions', Array.from(completionsMap))
			resolve('Data berhasl diubah')
		})
	})
}

function getTemplateDB(key) {
	return new Promise((resolve, reject) => {
		checkDB('templates').then(servers => {
			const templatesMap = new Map(servers)
			if (servers.length < 1) {
				resolve([ ])
				return
			}

			resolve(templatesMap.get(key))
			
		})
	})
}

function updateTemplateDB(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('templates').then(servers => {
			const templatesMap = new Map(servers)
			
			if (servers.length < 1) {
				db.set('templates', [ [key, data] ])
				resolve('Data berhasil diubah')
				return
			}

			templatesMap.set(key, data)
			db.set('templates', Array.from(templatesMap))
			resolve('Data berhasl diubah')
		})
	})
}

function getUserTemplateDB(key) {
	return new Promise((resolve, reject) => {
		checkDB('userTemp').then(users => {
			const usersMap = new Map(users)
			if (users.length < 1) {
				resolve([ ])
				return
			}

			resolve(usersMap.get(key))
			
		})
	})
}

function updateUserTemplateDB(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('userTemp').then(users => {
			const usersMap = new Map(users)
			
			if (users.length < 1) {
				db.set('userTemp', [ [key, data] ])
				resolve('Data berhasil diubah')
				return
			}

			usersMap.set(key, data)
			db.set('userTemp', Array.from(usersMap))
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

module.exports = { 
	checkDB,
	getRemindDB,
	updateRemindDB,
	getTodoDB,
	updateTodoDB,
	deleteDB,
	removeDBItem,
	getCompletionDB,
	updateCompletionDB,
	getTemplateDB,
	updateTemplateDB,
	getUserTemplateDB,
	updateUserTemplateDB,
	getPomodDB,
	updatePomodDB
}