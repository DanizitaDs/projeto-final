export default async function getExactReaction(userId, courseId, classesId, reaction) {
    try{
        const res = await fetch(`http://localhost:3000/reactions/exact`,{
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userId, courseId, classesId, reaction })
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