import { customAlphabet } from "nanoid"
import { nolookalikesSafe } from "nanoid-dictionary"

const randomUsername = customAlphabet(nolookalikesSafe, 6)

export function generateUsernameFromEmail(email: string): string {
  // Retrive name from email address
  const nameParts = email.replace(/@.+/, "")
  // Replace all special characters like "@ . _ ";
  const name = nameParts.replace(/[^0-9a-zA-Z]/g, "")
  // Create and return unique username
  return name
}
