import getCourseById from "./course-script/getCourseById.js";
import getProfile from "./user-script/getProfile.js";
import toggleReaction from "./reaction-script/toggleReaction.js"
import getExactReaction from "./reaction-script/getExactReaction.js"

let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
    currentUser = await getProfile();
    if (!currentUser) {
        showAlert("Você precisa estar logado para acessar esta página.", "danger");
        window.location.href = "cadastro_login.html";
        return;
    }
    loadCourseDetails();
});

// const urlParams = new URLSearchParams(window.location.search);
// const courseId = urlParams.get("id");
// const course = await getCourseById(Number(courseId))
// console.log(course) // Funciona

async function loadCourseDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id");

    
    if (!courseId) {
        document.querySelector(".course-info").innerHTML =
            "<p>Curso não encontrado.</p>";
        return;
    }

    try {
        const course = await getCourseById(Number(courseId))


        if(!course){
            throw Error("Course not found in loadCourseDetails")
        }

        // HERO
        const courseHero = document.querySelector(".course-hero");
        courseHero.innerHTML = `
          <img src="${course.imageUrl}" alt="Imagem do Curso" class="img-fluid course-hero-image">
        `;

        // INFO (Título + descrição + reações do curso)
        const courseInfo = document.querySelector(".course-info");
        courseInfo.innerHTML = `
          <h1 class="course-title">${course.title}</h1>
          <p class="course-desc">${course.description}</p>
          <div class="interaction-bar mt-2 d-flex gap-4 flex-wrap">
            <div class="like-counter d-flex align-items-center gap-1">
              <i class="far fa-thumbs-up reaction-icon btn-like" data-course-id="${course.id}" data-classes-id="null"></i>
              <span class="like-count">0</span>
            </div>
            <div class="dislike-counter d-flex align-items-center gap-1">
              <i class="far fa-thumbs-down reaction-icon btn-dislike" data-course-id="${course.id}" data-classes-id="null"></i>
              <span class="dislike-count">0</span>
            </div>
          </div>
        `;

        // LISTA DE AULAS
        const lessonsContainer = document.getElementById("lessons-container");
        lessonsContainer.innerHTML = "";

        for (const classItem of course.classes) {
            const lessonCard = `
            <div class="course-card bg-white p-3 rounded shadow-sm d-flex gap-3">
              <img src="${course.imageUrl}" alt="Imagem do curso" class="rounded" 
                style="width: 100px; height: 100px; object-fit: cover;">
              <div class="flex-grow-1">
                <h5 class="mb-1">${classItem.title}</h5>
                <p class="small text-muted">${classItem.description}</p>
                <a href="${classItem.url}" class="btn btn-outline-primary btn-sm" target="_blank">Ver Aula</a>
                <div class="mt-2 d-flex align-items-center gap-3">
                <div class="like-counter d-flex align-items-center gap-1">
                    <i class="far fa-thumbs-up reaction-icon btn-like" data-classes-id="${classItem.id}" ></i>
                    <span class="like-count">0</span>
                  </div>
                  <div class="dislike-counter d-flex align-items-center gap-1">
                    <i class="far fa-thumbs-down reaction-icon btn-dislike" data-classes-id="${classItem.id}"></i>
                    <span class="dislike-count">0</span>
                  </div>
                </div>
              </div>
            </div>
          `;
            lessonsContainer.innerHTML += lessonCard;
        }

        // Eventos de clique
        setupReactionButtons();
        refreshReactions();
    } catch (error) {
        console.error("Error loading course details:", error);
        document.querySelector(".course-info").innerHTML =
            "<p>Erro ao carregar os detalhes do curso.</p>";
    }
}

function setupReactionButtons() {
    document.querySelectorAll(".btn-like").forEach(icon => {
        icon.addEventListener("click", async () => {
            const courseId = icon.dataset.courseId;
            const classesId = icon.dataset.classesId !== "null" ? icon.dataset.classesId : null;

            if(courseId){
                await toggleReaction(currentUser.id, courseId, undefined, "like");
            }else if(classesId){
                await toggleReaction(currentUser.id, undefined ,classesId, "like");
            } else{
                throw new Error("Erro em setupReactionButtons")
            }

            refreshReactions();
        });
    });

    document.querySelectorAll(".btn-dislike").forEach(icon => {
        icon.addEventListener("click", async () => {
            const courseId = icon.dataset.courseId;
            const classesId = icon.dataset.classesId !== "null" ? icon.dataset.classesId : null;
            
            if(courseId){
                await toggleReaction(currentUser.id, courseId, undefined, "dislike");
            }else{
                await toggleReaction(currentUser.id, undefined ,classesId, "dislike");
            }

            refreshReactions();
        });
    });
}

async function refreshReactions() {
    try {
        const response = await fetch("http://localhost:3000/reactions");
        const reactions = await response.json();

        const icons = document.querySelectorAll(".reaction-icon")
        for(const icon of icons){
            const courseId = icon.dataset.courseId !== "null" ? Number(icon.dataset.courseId) : undefined;
            const classesId = icon.dataset.classesId !== "null" ? Number(icon.dataset.classesId) : undefined;

            // console.log(`courseId:`)
            // console.warn(courseId)

            const likeCountEl = icon.closest(".like-counter")?.querySelector(".like-count");
            const dislikeCountEl = icon.closest(".dislike-counter")?.querySelector(".dislike-count");

            let likes, dislikes;

            if(courseId){
                likes = reactions.filter(r =>
                    (courseId ? r.courseId === courseId : r.courseId == null) &&
                    r.reaction === "like"
                ).length;
    
                dislikes = reactions.filter(r =>
                    (courseId ? r.courseId === courseId : r.courseId == null) &&
                    r.reaction === "dislike"
                ).length;

            } else if(classesId){
                likes = reactions.filter(r =>
                    (classesId ? r.classesId === classesId : r.classesId == null) &&
                    r.reaction === "like"
                ).length;
    
                dislikes = reactions.filter(r =>
                    (classesId ? r.classesId === classesId : r.classesId == null) &&
                    r.reaction === "dislike"
                ).length;
    
                
            } else{
                throw Error("Errro ao carregar likes e dislikes")
            }

            if (likeCountEl) likeCountEl.textContent = likes;
            if (dislikeCountEl) dislikeCountEl.textContent = dislikes;

            let userReaction;

            if (icon.classList.contains("btn-like")) {
                userReaction = await getExactReaction(currentUser.id, courseId, classesId, "like");
                if(userReaction){
                    icon.classList.remove("far"); // oco
                    icon.classList.add("fas");    // cheio
                } else{
                    icon.classList.remove("fas"); // oco
                    icon.classList.add("far");    // cheio
                }
            }

            if (icon.classList.contains("btn-dislike")) {
                userReaction = await getExactReaction(currentUser.id, courseId, classesId, "dislike");
                if(userReaction){
                    icon.classList.remove("far");
                    icon.classList.add("fas");
                }  else{
                    icon.classList.remove("fas"); // oco
                    icon.classList.add("far");    // cheio
                }
            }

        };
    } catch (err) {
        console.error("Erro ao atualizar contadores:", err);
    }
}

//
async function updateReactionIcons(local) {
    const likeBtn = local.querySelector(".btn-like");
    const dislikeBtn = local.querySelector(".btn-dislike");

    

    if (!reaction) {
        likeBtn.classList.add("far");
        likeBtn.classList.remove("fas");
        dislikeBtn.classList.add("far");
        dislikeBtn.classList.remove("fas");
    } else if (reaction.reaction === "like") {
        likeBtn.classList.add("fas");
        likeBtn.classList.remove("far");
        dislikeBtn.classList.add("far");
        dislikeBtn.classList.remove("fas");
    } else if (reaction.reaction === "dislike") {
        likeBtn.classList.add("far");
        likeBtn.classList.remove("fas");
        dislikeBtn.classList.add("fas");
        dislikeBtn.classList.remove("far");
    }
}





// Alerta bootstrap
function showAlert(message, type = "success", timeout = 3000) {
    const alertContainer = document.getElementById("alert-container");
    if (!alertContainer) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
      `;
    const alertElement = wrapper.firstElementChild;
    alertContainer.appendChild(alertElement);
    setTimeout(() => {
        const alertInstance = bootstrap.Alert.getOrCreateInstance(alertElement);
        alertInstance.close();
    }, timeout);
}