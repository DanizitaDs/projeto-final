
export default async function updateUserWithFile(name, email, password, profileFile){
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  if (password) formData.append("password", password);
  if (profileImage) formData.append("profileImage", profileFile);
    try {
      const res = await fetch(`http://localhost:3000/users`,{
      method:"PUT",
          headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: formData
      });
      if (!res.ok) throw new Error("Erro ao atualizar usuário");

      return await res.json()
    } catch (error) {
      console.error("Erro ao atualizar User:", error);
    }
  }