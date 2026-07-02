import bcrypt from 'bcryptjs'

/**
 * Generates a salt for bcrypt.
 * @param rounds Cost factor (default 10)
 */
export function genSalt(rounds: number): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(rounds, (err, salt) => {
      if (err) {
        reject(err)
      } else if (salt === undefined) {
        reject(new Error('Salt generation returned undefined'))
      } else {
        resolve(salt)
      }
    })
  })
}

/**
 * Hashes a password with bcrypt using a specific cost factor or salt.
 * @param password The password to hash
 * @param roundsOrSalt Cost factor rounds (number) or salt (string)
 */
export function hashPassword(password: string, roundsOrSalt: number | string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, roundsOrSalt, (err, hash) => {
      if (err) {
        reject(err)
      } else if (hash === undefined) {
        reject(new Error('Password hashing returned undefined'))
      } else {
        resolve(hash)
      }
    })
  })
}

/**
 * Compares a password against an existing bcrypt hash.
 * @param password The password to check
 * @param hash The bcrypt hash to compare against
 */
export function comparePassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) {
        reject(err)
      } else if (result === undefined) {
        reject(new Error('Password comparison returned undefined'))
      } else {
        resolve(result)
      }
    })
  })
}
