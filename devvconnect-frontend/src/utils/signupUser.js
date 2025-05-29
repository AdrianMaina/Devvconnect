import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

export async function signupUser({ name, email, password, role }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const backendResponse = await fetch("http://127.0.0.1:8000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });

    if (!backendResponse.ok) {
      throw new Error("Failed to save user to backend.");
    }

    return { user };
  } catch (error) {
    throw error;
  }
}
