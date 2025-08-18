export default async function loginUser(email, password){
  try {
    const res = await fetch("http://localhost:3000/usersLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data) {
      return data
    }
  } catch (err) {
    throw new Error(err)
  }
}