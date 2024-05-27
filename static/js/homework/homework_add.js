async function HWAddMain(){
    HWAddButton.addEventListener('click', HWAddReset)
    HWAddListenersSearchField.addEventListener('input', HWAddSearchListeners)
    await HWAddSetTeachersListeners()
    HWAddSaveAndGoButton.addEventListener('click', async function(){
        await HWAddSave(true)
    })
    HWAddSaveButton.addEventListener('click', async function(){
        await HWAddSave(false)
    })
    HWAddOffcanvasMaterialsAddButton.addEventListener("click", function (){
        materialsEmbedSet(HWAddMaterialsSet)
    })
}

async function HWAddSetTeachersListeners(){
    if (isAdminOrMetodist){
        await usersAPIGetTeachers().then(request => {
            HWAddTeacherField.innerHTML = "<option value='none'>Выберите из списка:</option>"
            if (request.status === 200){
                request.response.map(teacher => {
                    HWAddTeacherField.insertAdjacentHTML('beforeend', `
                    <option value="${teacher.id}">${teacher.first_name} ${teacher.last_name}</option>`)
                })
                dselect(HWAddTeacherField)
            }
        })
    }
    else if (isTeacher){
        HWAddTeacherField.innerHTML = `
        <option value="${userObj.id}" selected>${userObj.first_name} ${userObj.last_name}</option>`
    }

    await usersAPIGetListeners().then(request => {
        if (request.status === 200){
            request.response.map(listener => {
                HWAddListenersSelect.insertAdjacentHTML('beforeend', `
                <option value="${listener.id}">${listener.first_name} ${listener.last_name}</option>`)
            })
        }
    })
}

async function HWAddReset(){
    HWAddForm.reset()
    HWAddNameField.classList.remove("is-invalid")
    HWAddDescriptionField.classList.remove("is-invalid")
    HWAddDeadlineField.classList.remove("is-invalid")
    HWAddTeacherField.classList.remove("is-invalid")
    HWAddListenersSelect.classList.remove("is-invalid")
    HWAddNameError.innerHTML = ""
    HWAddDescriptionError.innerHTML = ""
    HWAddDeadlineError.innerHTML = ""
    HWAddTeacherError.innerHTML = ""
    HWAddListenersError.innerHTML = ""
    HWAddMaterialsSet = []
    HWAddMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
    await getAutoFieldHomeworkName(0).then(response => {
        if (response.status === 200){
            HWAddNameField.value = response.response.name
            HWAddDescriptionField.value = response.response.name
            HWAddDeadlineField.value = response.response.deadline
        }
    })

}

function HWAddClientValidation(){
    HWAddNameField.classList.remove("is-invalid")
    HWAddDescriptionField.classList.remove("is-invalid")
    HWAddDeadlineField.classList.remove("is-invalid")
    HWAddTeacherField.classList.remove("is-invalid")
    HWAddListenersSelect.classList.remove("is-invalid")
    HWAddNameError.innerHTML = ""
    HWAddDescriptionError.innerHTML = ""
    HWAddDeadlineError.innerHTML = ""
    HWAddTeacherError.innerHTML = ""
    HWAddListenersError.innerHTML = ""
    let validationStatus = true

    if (HWAddNameField.value === ""){
        HWAddNameField.classList.add("is-invalid")
        HWAddNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (HWAddDescriptionField.value === ""){
        HWAddDescriptionField.classList.add("is-invalid")
        HWAddDescriptionError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (HWAddTeacherField.value === "none"){
        HWAddTeacherField.classList.add("is-invalid")
        HWAddTeacherError.innerHTML = "Необходимо выбрать преподавателя"
        validationStatus = false
    }

    if (HWAddListenersSelect.value === ""){
        HWAddListenersSelect.classList.add("is-invalid")
        HWAddListenersError.innerHTML = "Необходимо выбрать хотя бы 1 ученика"
        validationStatus = false
    }

    if (HWAddDeadlineField.value === ""){
        HWAddDeadlineField.classList.add("is-invalid")
        HWAddDeadlineError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    } else if (new Date() > new Date(HWAddDeadlineField.value)){
        HWAddDeadlineField.classList.add("is-invalid")
        HWAddDeadlineError.innerHTML = "Минимальный срок 1 день"
        validationStatus = false
    }

    return validationStatus
}

function HWAddServerValidation(errors){
    console.log(errors)
}

function HWAddSearchListeners(){
    const query = new RegExp(HWAddListenersSearchField.value.toLowerCase())
    const options = HWAddListenersSelect.querySelectorAll("option")
    options.forEach(function (opt) {
        if(query.test(opt.innerHTML.toLowerCase())){
            opt.classList.remove("d-none")
        } else {
            opt.classList.add("d-none")
        }
    })
}

async function HWAddSave(go=false){
    if (HWAddClientValidation()){
        const fd = new FormData(HWAddForm)
        if (HWAddMaterialsSet.length !== 0){
            HWAddMaterialsSet.forEach(material => {
                fd.append("materials", material)
            })
        }
        await homeworkAPIAdd(fd)
            .then(async request => {
                if (request.status === 201){
                    bsHomeworksAddOffcanvas.hide()
                    await HWAddReset()
                    showToast("ДЗ", "Домашнее задание успешно создано")
                    if (go === true){
                        window.open(`/homeworks/${request.response.id}`)
                    }
                } else if (request.status === 400){
                    HWAddServerValidation(request.response)
                } else {
                    bsHomeworksAddOffcanvas.hide()
                    showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                }
            })
    }
}

let HWAddMaterialsSet = []

//Bootstrap elements
const homeworksAddOffcanvas = document.querySelector("#HomeworksAddOffcanvas")
const bsHomeworksAddOffcanvas = new bootstrap.Offcanvas(homeworksAddOffcanvas)

//Form
const HWAddForm = homeworksAddOffcanvas.querySelector("#HomeworksAddOffcanvasForm")
const HWAddNameField = HWAddForm.querySelector("#HomeworksAddOffcanvasNameField")
const HWAddNameError = HWAddForm.querySelector("#HomeworksAddOffcanvasNameError")
const HWAddDescriptionField = HWAddForm.querySelector("#HomeworksAddOffcanvasDescriptionField")
const HWAddDescriptionError = HWAddForm.querySelector("#HomeworksAddOffcanvasDescriptionError")
const HWAddDeadlineField = HWAddForm.querySelector("#HomeworksAddOffcanvasDeadlineField")
const HWAddDeadlineError = HWAddForm.querySelector("#HomeworksAddOffcanvasDeadlineError")
const HWAddTeacherField = HWAddForm.querySelector("#HomeworksAddOffcanvasTeacherField")
const HWAddTeacherError = HWAddForm.querySelector("#HomeworksAddOffcanvasTeacherError")
const HWAddListenersSearchField = HWAddForm.querySelector("#HomeworksAddOffcanvasListenersSearchField")
const HWAddListenersSelect = HWAddForm.querySelector("#HomeworksAddOffcanvasListenersSelect")
const HWAddListenersError = HWAddForm.querySelector("#HomeworksAddOffcanvasListenersError")
const HWAddMaterialsList = HWAddForm.querySelector("#HomeworksAddOffcanvasMaterialsList")
const HWAddMaterialsAddButton = HWAddForm.querySelector("#HomeworksAddOffcanvasMaterialsAddButton")
const HWAddSaveAndGoButton = HWAddForm.querySelector("#HomeworksAddOffcanvasSaveAndGoButton")
const HWAddSaveButton = HWAddForm.querySelector("#HomeworksAddOffcanvasSaveButton")
const HWAddButton = document.querySelector("#HomeworksAddOffcanvasButton")

//Buttons
const HWAddOffcanvasMaterialsAddButton = document.querySelector("#homeworksAddOffcanvasMaterialsAddButton")

HWAddMain()
