export default async function toggleReaction(userId, courseId, classeId, reaction) {
    try{
        const res = await fetch(`http://localhost:3000/reactions`,{
            method:"PUT",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userId, courseId, classeId, reaction })
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