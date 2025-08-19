export default async function createReaction(name, email, password) {
    try{
        const res = await fetch(`http://localhost:3000/users`,{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name, email, password})
        });

        if(res.ok){
            const data = await res.json();
            return data;
        } else{
            const data = await res.json();
            alert(data.message || "Error in getExactReaction.js")
            return null;
        }
    } catch(error) {
        console.error("Error in getExactReaction.js", error)
        return null;
    }
}