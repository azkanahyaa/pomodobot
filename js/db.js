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

function getProfile(key) {
	return new Promise((resolve, reject) => {
		checkDB('profiles').then(profiles => {
			const profilesMap = new Map(profiles)
			if (profiles.length < 1) {
				reject('anda belum mengatur Goals')
				return
			}

			resolve(profilesMap.get(key))
			
		})
	})
}

function updateProfile(key, data) {
  return new Promise((resolve, reject) => {
		checkDB('profiles').then(profiles => {
			const profilesMap = new Map(profiles)
			console.log(profiles, profilesMap)
			
			if (profiles.length < 1) {
				db.set('profiles', [ [key, data] ])
				resolve('Data berhasil ditambahkan')
				return
			}

			profilesMap.set(key, data)
			db.set('profiles', Array.from(profilesMap))
			resolve('Data berhasl ditambahkan')
		})
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
				resolve('Data berhasil ditambahkan')
				return
			}

			completionsMap.set(key, data)
			db.set('completions', Array.from(completionsMap))
			resolve('Data berhasl ditambahkan')
		})
	})
}

module.exports = { 
	checkDB,
	getProfile,
	updateProfile,
	getRemindDB,
	updateRemindDB,
	getTodoDB,
	updateTodoDB,
	deleteDB,
	getCompletionDB,
	updateCompletionDB
}