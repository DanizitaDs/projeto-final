export async function getExactReaction(reactionId, courseId, classeId) {
    try{
        const res = await fetch(`http://localhost:3000/reactions/exact}`,{
            method:"GET",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({reactionId, courseId, classeId })
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