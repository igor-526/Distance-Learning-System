async function homeworkAdd(lessonID, formData){
    formData.append("lesson", lessonID)
    const response = await fetch('/api/v1/homeworks/', {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    if (response.status === 500){
        return {status: 500,
            response: {}}
    } else {
        return {status: response.status,
            response: await response.json()}
    }
}

async function homeworkAPIGetLogs(hw){
    const response = await fetch(`/api/v1/homeworks/${hw}/logs`)
    return {status: response.status,
        response: await response.json()}
}

async function homeworkAPISend(hw, fd, st){
    fd.append("status", st)
    const response = await fetch(`/api/v1/homeworks/${hw}/logs/`, {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: fd
    })
    if (response.status === 500){
        return {status: 500}
    } else {
        return {status: response.status,
            response: await response.json()}
    }
}

async function homeworkAPIGet(status){
    const response = await fetch(`/api/v1/homeworks?status=${status}`)
    if (response.status === 200){
        return {status: 200,
            response: await response.json()}
    } else {
        return {status: status}
    }
}