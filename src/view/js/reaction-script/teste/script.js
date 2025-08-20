import createReaction from "../createReaction.js"
import getExactReaction from "../getExactReaction.js"
import toggleReaction from "../toggleReaction.js"
import getCourseById from "../../course-script/getCourseById.js"

const botaoGER = document.getElementById("btn-getExactReaction")
botaoGER.addEventListener("click", async (event) => {
    await getExactReaction(1,1,undefined)
})

const botaoC = document.getElementById("btn-createReaction")
botaoC.addEventListener("click", async (event) => {
    await createReaction(2,5,undefined, "like")
})

const botaoUR = document.getElementById("btn-updateReaction")
botaoUR.addEventListener("click", async (event) => {
    await toggleReaction(1,1,undefined, "dislike")
})

const botaoGCBY = document.getElementById("btn-getCourseById")
botaoGCBY.addEventListener("click", async (event) => {
    await getCourseById(1)
})

