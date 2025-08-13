import { getExactReaction } from "../getExactReaction.js"

const botaoLike = document.getElementById("btn-like")
botaoLike.addEventListener("click", async (event) => {
    await getExactReaction(1,1,undefined)
})