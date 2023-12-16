module.exports = class User {
	#id;
	#username;
	#birthday;

	constructor(id, username, birthday) {
		this.#id = id;
		this.#username = username;
		this.#birthday = birthday;
	}

	get id() {
		return this.#id;
	}
	get username() {
		return this.#username;
	}
	get birthday() {
		return this.#birthday;
	}

	set username(username) {
		this.#username = username;
	}
	set birthday(birthday) {
		this.#birthday = birthday;
	}

	toObj() {
		return {
			id: this.#id,
			username: this.#username,
			birthday: this.#birthday,
		}
	}
}