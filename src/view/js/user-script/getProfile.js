
export default async function getProfile(){
  try {
    const res = await fetch(`http://localhost:3000/profile`,{
    method:"GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    if (!res.ok) throw new Error("Erro ao buscar usuário");

    const user = await res.json();
    return user
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);
  }
}