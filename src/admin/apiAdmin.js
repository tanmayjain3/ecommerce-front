export const createCategory = (userId, token,category)=>{
    return fetch(`http://localhost:8000/api/category/create/${userId}`,{
        method:"POST",
        headers:{
            Accept:"application/json",
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`
        },
        body:JSON.stringify(category)
    })
    .then(response => {return response.json()})
    .catch(err=>{
        console.log(err);
    })
}