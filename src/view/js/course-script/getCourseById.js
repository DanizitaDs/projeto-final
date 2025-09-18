
export default async function getCourseById(courseId){
    try {
        const response = await fetch(`http://localhost:3000/cursos/${courseId}`);
        const course = await response.json();
        return course
    }catch(error){
        console.error(error)
        return;
    }
}